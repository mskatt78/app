"""Gift and notification routes with Stripe/PayPal payment integration."""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import logging
import httpx

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionRequest
)

from .dependencies import get_db, get_current_user, User
from services.email_service import send_gift_notification_email, send_gift_redeemed_notification

router = APIRouter(tags=["gifts"])
logger = logging.getLogger(__name__)

# Subscription plans (same as payments router)
SUBSCRIPTION_PLANS = {
    "monthly": {"name": "Monthly Membership Gift", "price": 19.99, "interval": "month"},
    "yearly": {"name": "Yearly Membership Gift", "price": 149.99, "interval": "year"}
}


# ============ MODELS ============

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


class GiftCreate(BaseModel):
    recipient_email: str
    recipient_name: str
    gift_type: str  # "subscription", "retreat", "book", "session"
    item_id: Optional[str] = None
    plan_id: Optional[str] = None
    message: Optional[str] = None
    sender_name: str


class GiftPaymentRequest(BaseModel):
    gift_code: str
    origin_url: str
    payment_method: str = "stripe"  # "stripe" or "paypal"


class GiftRedeem(BaseModel):
    gift_code: str


# ============ PUSH NOTIFICATIONS ============

@router.post("/notifications/subscribe")
async def subscribe_to_notifications(subscription: PushSubscription):
    """Subscribe to push notifications."""
    db = get_db()
    await db.push_subscriptions.update_one(
        {"endpoint": subscription.endpoint},
        {"$set": subscription.model_dump()},
        upsert=True
    )
    return {"message": "Subscribed to notifications"}


@router.post("/notifications/unsubscribe")
async def unsubscribe_from_notifications(subscription: PushSubscription):
    """Unsubscribe from push notifications."""
    db = get_db()
    await db.push_subscriptions.delete_one({"endpoint": subscription.endpoint})
    return {"message": "Unsubscribed from notifications"}


# ============ GIFTING FEATURE ============

@router.post("/gifts/create")
async def create_gift(gift: GiftCreate):
    """Create a gift for someone (pending payment)."""
    db = get_db()
    
    gift_code = f"GIFT-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate price based on gift type
    price = 0.0
    product_name = ""
    
    if gift.gift_type == "subscription":
        if gift.plan_id and gift.plan_id in SUBSCRIPTION_PLANS:
            plan = SUBSCRIPTION_PLANS[gift.plan_id]
            price = plan["price"]
            product_name = plan["name"]
        else:
            raise HTTPException(status_code=400, detail="Invalid subscription plan for gift")
    else:
        # Look up product price
        collection_map = {
            "retreat": "retreats",
            "book": "books",
            "session": "live_sessions"
        }
        collection = collection_map.get(gift.gift_type)
        if collection and gift.item_id:
            product = await db[collection].find_one({"id": gift.item_id}, {"_id": 0})
            if product:
                price = float(product.get("price", 0))
                product_name = product.get("title") or product.get("name", "Gift")
    
    gift_data = {
        "gift_code": gift_code,
        "recipient_email": gift.recipient_email,
        "recipient_name": gift.recipient_name,
        "sender_name": gift.sender_name,
        "gift_type": gift.gift_type,
        "item_id": gift.item_id,
        "plan_id": gift.plan_id,
        "message": gift.message,
        "price": price,
        "product_name": product_name,
        "status": "pending",  # pending -> paid -> redeemed
        "created_at": datetime.now(timezone.utc).isoformat(),
        "paid_at": None,
        "redeemed_at": None,
        "redeemed_by": None,
        "payment_session_id": None
    }
    
    await db.gifts.insert_one(gift_data)
    gift_data.pop("_id", None)
    
    return {
        "message": "Gift created successfully",
        "gift_code": gift_code,
        "gift": gift_data
    }


@router.post("/gifts/pay")
async def pay_for_gift(
    request: Request,
    payment: GiftPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a payment session for a gift (Stripe or PayPal)."""
    db = get_db()
    
    # Get the gift
    gift = await db.gifts.find_one({"gift_code": payment.gift_code})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    if gift["status"] != "pending":
        raise HTTPException(status_code=400, detail="Gift has already been paid for")
    
    amount = float(gift.get("price", 0))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Gift has no price set")
    
    product_name = gift.get("product_name", "Gift")
    origin_url = payment.origin_url
    
    if payment.payment_method == "paypal":
        return await _create_paypal_gift_order(gift, amount, product_name, origin_url, current_user)
    else:
        return await _create_stripe_gift_checkout(request, gift, amount, product_name, origin_url, current_user)


async def _create_stripe_gift_checkout(request, gift, amount, product_name, origin_url, current_user):
    """Create Stripe checkout for gift."""
    db = get_db()
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    success_url = f"{origin_url}/gift/success?gift_code={gift['gift_code']}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/gift/cancel?gift_code={gift['gift_code']}"
    
    metadata = {
        "gift_code": gift["gift_code"],
        "recipient_email": gift["recipient_email"],
        "recipient_name": gift["recipient_name"],
        "sender_name": gift["sender_name"],
        "gift_type": gift["gift_type"],
        "user_id": current_user.user_id,
        "is_gift": "true"
    }
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    try:
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Update gift with session ID
        await db.gifts.update_one(
            {"gift_code": gift["gift_code"]},
            {"$set": {"payment_session_id": session.session_id, "payment_method": "stripe"}}
        )
        
        # Record transaction
        transaction = {
            "id": str(uuid.uuid4())[:8],
            "session_id": session.session_id,
            "user_id": current_user.user_id,
            "user_email": current_user.email,
            "amount": amount,
            "currency": "usd",
            "product_type": "gift",
            "gift_code": gift["gift_code"],
            "product_name": f"Gift: {product_name}",
            "payment_method": "stripe",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "checkout_url": session.url,
            "session_id": session.session_id,
            "payment_method": "stripe",
            "gift_code": gift["gift_code"]
        }
    except Exception as e:
        logger.error(f"Stripe gift checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")


async def _create_paypal_gift_order(gift, amount, product_name, origin_url, current_user):
    """Create PayPal order for gift."""
    db = get_db()
    
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE", "sandbox")
    
    if not paypal_client_id or not paypal_secret:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    
    base_url = "https://api-m.paypal.com" if paypal_mode == "live" else "https://api-m.sandbox.paypal.com"
    
    # Get access token
    async with httpx.AsyncClient() as client:
        auth_response = await client.post(
            f"{base_url}/v1/oauth2/token",
            auth=(paypal_client_id, paypal_secret),
            data={"grant_type": "client_credentials"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=500, detail="PayPal authentication failed")
        
        access_token = auth_response.json()["access_token"]
        
        # Create order
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": gift["gift_code"],
                "description": f"Gift: {product_name} for {gift['recipient_name']}",
                "amount": {
                    "currency_code": "USD",
                    "value": f"{amount:.2f}"
                },
                "custom_id": gift["gift_code"]
            }],
            "application_context": {
                "return_url": f"{origin_url}/gift/success?gift_code={gift['gift_code']}",
                "cancel_url": f"{origin_url}/gift/cancel?gift_code={gift['gift_code']}",
                "brand_name": "Shamanic Elements",
                "user_action": "PAY_NOW"
            }
        }
        
        order_response = await client.post(
            f"{base_url}/v2/checkout/orders",
            json=order_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if order_response.status_code not in [200, 201]:
            logger.error(f"PayPal order error: {order_response.text}")
            raise HTTPException(status_code=500, detail="Failed to create PayPal order")
        
        order = order_response.json()
        order_id = order["id"]
        
        # Find approval URL
        approval_url = None
        for link in order.get("links", []):
            if link.get("rel") == "approve":
                approval_url = link.get("href")
                break
        
        if not approval_url:
            raise HTTPException(status_code=500, detail="PayPal approval URL not found")
        
        # Update gift with order ID
        await db.gifts.update_one(
            {"gift_code": gift["gift_code"]},
            {"$set": {"payment_session_id": order_id, "payment_method": "paypal"}}
        )
        
        # Record transaction
        transaction = {
            "id": str(uuid.uuid4())[:8],
            "session_id": order_id,
            "user_id": current_user.user_id,
            "user_email": current_user.email,
            "amount": amount,
            "currency": "usd",
            "product_type": "gift",
            "gift_code": gift["gift_code"],
            "product_name": f"Gift: {product_name}",
            "payment_method": "paypal",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "checkout_url": approval_url,
            "order_id": order_id,
            "payment_method": "paypal",
            "gift_code": gift["gift_code"]
        }


@router.post("/gifts/confirm-payment")
async def confirm_gift_payment(gift_code: str, session_id: Optional[str] = None):
    """Confirm gift payment after successful checkout (called from frontend)."""
    db = get_db()
    
    gift = await db.gifts.find_one({"gift_code": gift_code})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    if gift["status"] == "paid":
        return {"message": "Gift already paid", "gift_code": gift_code, "status": "paid"}
    
    payment_method = gift.get("payment_method", "stripe")
    stored_session_id = gift.get("payment_session_id")
    
    if payment_method == "paypal":
        # Capture PayPal order
        return await _capture_paypal_gift_order(gift, stored_session_id)
    else:
        # Verify Stripe payment
        return await _verify_stripe_gift_payment(gift, stored_session_id or session_id)


async def _verify_stripe_gift_payment(gift, session_id):
    """Verify Stripe payment and update gift status."""
    db = get_db()
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key or not session_id:
        raise HTTPException(status_code=400, detail="Cannot verify payment")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        if status.payment_status == "paid":
            await db.gifts.update_one(
                {"gift_code": gift["gift_code"]},
                {"$set": {
                    "status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Send email notification to recipient
            try:
                base_url = os.environ.get("FRONTEND_URL", "https://breathwork-oracle.preview.emergentagent.com")
                await send_gift_notification_email(
                    recipient_email=gift["recipient_email"],
                    recipient_name=gift["recipient_name"],
                    sender_name=gift["sender_name"],
                    gift_type=gift["gift_type"],
                    gift_code=gift["gift_code"],
                    message=gift.get("message"),
                    base_url=base_url
                )
                logger.info(f"Gift notification email sent for {gift['gift_code']}")
            except Exception as e:
                logger.error(f"Failed to send gift notification email: {e}")
            
            return {
                "message": "Gift payment confirmed",
                "gift_code": gift["gift_code"],
                "status": "paid",
                "recipient_email": gift["recipient_email"],
                "email_sent": True
            }
        else:
            return {
                "message": "Payment not yet completed",
                "gift_code": gift["gift_code"],
                "status": gift["status"]
            }
    except Exception as e:
        logger.error(f"Stripe verification error: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")


async def _capture_paypal_gift_order(gift, order_id):
    """Capture PayPal order and update gift status."""
    db = get_db()
    
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE", "sandbox")
    
    if not paypal_client_id or not paypal_secret or not order_id:
        raise HTTPException(status_code=400, detail="Cannot capture payment")
    
    base_url = "https://api-m.paypal.com" if paypal_mode == "live" else "https://api-m.sandbox.paypal.com"
    
    async with httpx.AsyncClient() as client:
        # Get access token
        auth_response = await client.post(
            f"{base_url}/v1/oauth2/token",
            auth=(paypal_client_id, paypal_secret),
            data={"grant_type": "client_credentials"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=500, detail="PayPal authentication failed")
        
        access_token = auth_response.json()["access_token"]
        
        # Capture order
        capture_response = await client.post(
            f"{base_url}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if capture_response.status_code in [200, 201]:
            capture_data = capture_response.json()
            
            if capture_data.get("status") == "COMPLETED":
                await db.gifts.update_one(
                    {"gift_code": gift["gift_code"]},
                    {"$set": {
                        "status": "paid",
                        "paid_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                await db.payment_transactions.update_one(
                    {"session_id": order_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                # Send email notification to recipient
                try:
                    frontend_url = os.environ.get("FRONTEND_URL", "https://breathwork-oracle.preview.emergentagent.com")
                    await send_gift_notification_email(
                        recipient_email=gift["recipient_email"],
                        recipient_name=gift["recipient_name"],
                        sender_name=gift["sender_name"],
                        gift_type=gift["gift_type"],
                        gift_code=gift["gift_code"],
                        message=gift.get("message"),
                        base_url=frontend_url
                    )
                    logger.info(f"Gift notification email sent for {gift['gift_code']}")
                except Exception as e:
                    logger.error(f"Failed to send gift notification email: {e}")
                
                return {
                    "message": "Gift payment confirmed",
                    "gift_code": gift["gift_code"],
                    "status": "paid",
                    "recipient_email": gift["recipient_email"],
                    "email_sent": True
                }
        
        return {
            "message": "Payment capture pending",
            "gift_code": gift["gift_code"],
            "status": gift["status"]
        }


@router.get("/gifts/{gift_code}")
async def get_gift(gift_code: str):
    """Get gift details by code."""
    db = get_db()
    gift = await db.gifts.find_one({"gift_code": gift_code}, {"_id": 0})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    return gift


@router.post("/gifts/redeem")
async def redeem_gift(data: GiftRedeem, current_user: User = Depends(get_current_user)):
    """Redeem a gift code (requires authentication)."""
    db = get_db()
    
    gift = await db.gifts.find_one({"gift_code": data.gift_code})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift code not found")
    
    if gift["status"] == "redeemed":
        raise HTTPException(status_code=400, detail="Gift has already been redeemed")
    
    if gift["status"] != "paid":
        raise HTTPException(status_code=400, detail="Gift has not been paid for yet")
    
    # Update gift as redeemed
    await db.gifts.update_one(
        {"gift_code": data.gift_code},
        {
            "$set": {
                "status": "redeemed",
                "redeemed_at": datetime.now(timezone.utc).isoformat(),
                "redeemed_by": current_user.user_id
            }
        }
    )
    
    # Grant the gift to user
    if gift["gift_type"] == "subscription":
        plan_id = gift.get("plan_id", "monthly")
        interval = SUBSCRIPTION_PLANS.get(plan_id, {}).get("interval", "month")
        
        if interval == "year":
            expires_at = datetime.now(timezone.utc) + timedelta(days=365)
        else:
            expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        
        await db.user_subscriptions.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                "user_id": current_user.user_id,
                "plan_id": plan_id,
                "status": "active",
                "source": "gift",
                "gift_code": data.gift_code,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": expires_at.isoformat()
            }},
            upsert=True
        )
    else:
        # Grant one-time product access
        await db.user_purchases.insert_one({
            "user_id": current_user.user_id,
            "product_type": gift["gift_type"],
            "product_id": gift.get("item_id"),
            "source": "gift",
            "gift_code": data.gift_code,
            "purchased_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Send notification to sender that gift was redeemed
    try:
        # Get sender's email from transaction
        transaction = await db.payment_transactions.find_one({"gift_code": data.gift_code})
        if transaction and transaction.get("user_email"):
            await send_gift_redeemed_notification(
                sender_email=transaction["user_email"],
                sender_name=gift["sender_name"],
                recipient_name=gift["recipient_name"],
                gift_type=gift["gift_type"]
            )
            logger.info(f"Gift redemption notification sent for {data.gift_code}")
    except Exception as e:
        logger.error(f"Failed to send redemption notification: {e}")
    
    return {
        "message": "Gift redeemed successfully!",
        "gift_type": gift["gift_type"],
        "item_id": gift.get("item_id"),
        "plan_id": gift.get("plan_id")
    }


@router.get("/gifts/my/sent")
async def get_my_sent_gifts(current_user: User = Depends(get_current_user)):
    """Get gifts sent by the current user."""
    db = get_db()
    
    # Find transactions where user paid for gifts
    transactions = await db.payment_transactions.find(
        {"user_id": current_user.user_id, "product_type": "gift"},
        {"_id": 0}
    ).to_list(50)
    
    gift_codes = [t.get("gift_code") for t in transactions if t.get("gift_code")]
    
    gifts = await db.gifts.find(
        {"gift_code": {"$in": gift_codes}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return gifts


@router.get("/gifts/my/received")
async def get_my_received_gifts(current_user: User = Depends(get_current_user)):
    """Get gifts received by the current user's email."""
    db = get_db()
    gifts = await db.gifts.find(
        {"recipient_email": current_user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return gifts
