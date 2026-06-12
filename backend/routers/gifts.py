"""Gift and notification routes with Stripe/PayPal payment integration."""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Any, Optional
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


def _resolve_paypal_base_url(paypal_mode: str) -> str:
    return "https://api-m.paypal.com" if paypal_mode == "live" else "https://api-m.sandbox.paypal.com"


async def _fetch_paypal_access_token(
    client: httpx.AsyncClient,
    base_url: str,
    paypal_client_id: str,
    paypal_secret: str,
) -> str:
    auth_response = await client.post(
        f"{base_url}/v1/oauth2/token",
        auth=(paypal_client_id, paypal_secret),
        data={"grant_type": "client_credentials"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if auth_response.status_code != 200:
        raise HTTPException(status_code=500, detail="PayPal authentication failed")
    payload = auth_response.json()
    return str(payload["access_token"])


async def _mark_gift_paid(db: Any, gift_code: str, session_id: str) -> None:
    paid_at = datetime.now(timezone.utc).isoformat()
    await db.gifts.update_one(
        {"gift_code": gift_code},
        {"$set": {"status": "paid", "paid_at": paid_at}},
    )
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": "paid", "paid_at": paid_at}},
    )


async def _send_paid_gift_notification(gift: dict[str, Any]) -> bool:
    base_url = os.environ.get("FRONTEND_URL")
    if not base_url:
        raise RuntimeError("FRONTEND_URL is not configured")

    await send_gift_notification_email(
        recipient_email=gift["recipient_email"],
        recipient_name=gift["recipient_name"],
        sender_name=gift["sender_name"],
        gift_type=gift["gift_type"],
        gift_code=gift["gift_code"],
        message=gift.get("message"),
        base_url=base_url,
    )
    return True


async def _resolve_gift_pricing_context(db: Any, gift: GiftCreate) -> tuple[float, str]:
    if gift.gift_type == "subscription":
        if not gift.plan_id or gift.plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid subscription plan for gift")
        plan = SUBSCRIPTION_PLANS[gift.plan_id]
        return float(str(plan["price"])), str(plan["name"])

    collection_map = {
        "retreat": "retreats",
        "book": "books",
        "session": "live_sessions",
    }
    collection = collection_map.get(gift.gift_type)
    if not collection or not gift.item_id:
        return 0.0, ""

    product = await db[collection].find_one({"id": gift.item_id}, {"_id": 0})
    if not product:
        return 0.0, ""

    price = float(product.get("price", 0))
    name = product.get("title") or product.get("name", "Gift")
    return price, str(name)


def _build_gift_record(gift: GiftCreate, gift_code: str, price: float, product_name: str) -> dict[str, Any]:
    return {
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
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "paid_at": None,
        "redeemed_at": None,
        "redeemed_by": None,
        "payment_session_id": None,
    }


def _build_gift_payment_metadata(gift: dict[str, Any], current_user: User) -> dict[str, str]:
    return {
        "gift_code": gift["gift_code"],
        "recipient_email": gift["recipient_email"],
        "recipient_name": gift["recipient_name"],
        "sender_name": gift["sender_name"],
        "gift_type": gift["gift_type"],
        "user_id": current_user.user_id,
        "is_gift": "true",
    }


def _build_gift_transaction(
    session_id: str,
    amount: float,
    payment_method: str,
    product_name: str,
    gift_code: str,
    current_user: User,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    transaction: dict[str, Any] = {
        "id": str(uuid.uuid4())[:8],
        "session_id": session_id,
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "amount": amount,
        "currency": "usd",
        "product_type": "gift",
        "gift_code": gift_code,
        "product_name": f"Gift: {product_name}",
        "payment_method": payment_method,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if metadata:
        transaction["metadata"] = metadata
    return transaction


def _build_paypal_gift_order_payload(gift: dict[str, Any], amount: float, product_name: str, origin_url: str) -> dict[str, Any]:
    gift_code = gift["gift_code"]
    return {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": gift_code,
            "description": f"Gift: {product_name} for {gift['recipient_name']}",
            "amount": {
                "currency_code": "USD",
                "value": f"{amount:.2f}"
            },
            "custom_id": gift_code,
        }],
        "application_context": {
            "return_url": f"{origin_url}/gift/success?gift_code={gift_code}",
            "cancel_url": f"{origin_url}/gift/cancel?gift_code={gift_code}",
            "brand_name": "Shamanic Elements",
            "user_action": "PAY_NOW",
        },
    }


def _extract_paypal_approval_url(order: dict[str, Any]) -> str | None:
    for link in order.get("links", []):
        if isinstance(link, dict) and link.get("rel") == "approve":
            return link.get("href")
    return None


async def _mark_gift_redeemed(db: Any, gift_code: str, user_id: str) -> None:
    await db.gifts.update_one(
        {"gift_code": gift_code},
        {
            "$set": {
                "status": "redeemed",
                "redeemed_at": datetime.now(timezone.utc).isoformat(),
                "redeemed_by": user_id,
            }
        },
    )


async def _grant_redeemed_gift_access(db: Any, gift: dict[str, Any], gift_code: str, user_id: str) -> None:
    if gift["gift_type"] == "subscription":
        plan_id = gift.get("plan_id", "monthly")
        interval = SUBSCRIPTION_PLANS.get(plan_id, {}).get("interval", "month")
        expiry_days = 365 if interval == "year" else 30
        expires_at = datetime.now(timezone.utc) + timedelta(days=expiry_days)

        await db.user_subscriptions.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "plan_id": plan_id,
                "status": "active",
                "source": "gift",
                "gift_code": gift_code,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": expires_at.isoformat(),
            }},
            upsert=True,
        )
        return

    await db.user_purchases.insert_one({
        "user_id": user_id,
        "product_type": gift["gift_type"],
        "product_id": gift.get("item_id"),
        "source": "gift",
        "gift_code": gift_code,
        "purchased_at": datetime.now(timezone.utc).isoformat(),
    })


async def _notify_sender_of_redemption(db: Any, gift_code: str, gift: dict[str, Any]) -> None:
    try:
        transaction = await db.payment_transactions.find_one({"gift_code": gift_code})
        sender_email = transaction.get("user_email") if transaction else None
        if not sender_email:
            return

        await send_gift_redeemed_notification(
            sender_email=sender_email,
            sender_name=gift["sender_name"],
            recipient_name=gift["recipient_name"],
            gift_type=gift["gift_type"],
        )
        logger.info("Gift redemption notification sent for %s", gift_code)
    except Exception as exc:
        logger.error("Failed to send redemption notification: %s", exc)


# ============ PUSH NOTIFICATIONS ============

@router.post("/notifications/subscribe")
async def subscribe_to_notifications(subscription: PushSubscription) -> dict[str, str]:
    """Subscribe to push notifications."""
    db = get_db()
    await db.push_subscriptions.update_one(
        {"endpoint": subscription.endpoint},
        {"$set": subscription.model_dump()},
        upsert=True
    )
    return {"message": "Subscribed to notifications"}


@router.post("/notifications/unsubscribe")
async def unsubscribe_from_notifications(subscription: PushSubscription) -> dict[str, str]:
    """Unsubscribe from push notifications."""
    db = get_db()
    await db.push_subscriptions.delete_one({"endpoint": subscription.endpoint})
    return {"message": "Unsubscribed from notifications"}


# ============ GIFTING FEATURE ============

@router.post("/gifts/create")
async def create_gift(gift: GiftCreate) -> dict[str, Any]:
    """Create a gift for someone (pending payment)."""
    db = get_db()

    gift_code = f"GIFT-{uuid.uuid4().hex[:8].upper()}"

    price, product_name = await _resolve_gift_pricing_context(db, gift)
    gift_data = _build_gift_record(gift, gift_code, price, product_name)

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
) -> dict[str, Any]:
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


async def _create_stripe_gift_checkout(
    request: Request,
    gift: dict[str, Any],
    amount: float,
    product_name: str,
    origin_url: str,
    current_user: User,
) -> dict[str, Any]:
    """Create Stripe checkout for gift."""
    db = get_db()
    stripe_api_key = _require_stripe_key()
    success_url, cancel_url = _build_stripe_gift_urls(origin_url, gift["gift_code"])
    metadata = _build_gift_payment_metadata(gift, current_user)
    stripe_checkout = _create_gift_stripe_client(request, stripe_api_key)
    checkout_request = _build_gift_checkout_request(amount, success_url, cancel_url, metadata)
    
    try:
        session = await stripe_checkout.create_checkout_session(checkout_request)

        await _attach_gift_payment_reference(db, gift["gift_code"], session.session_id, "stripe")

        transaction = _build_gift_transaction(
            session.session_id,
            amount,
            "stripe",
            product_name,
            gift["gift_code"],
            current_user,
            metadata,
        )
        await _persist_gift_payment_transaction(db, transaction)
        return _build_stripe_gift_checkout_response(session.url, session.session_id, gift["gift_code"])
    except Exception as e:
        _raise_stripe_gift_checkout_error(e)


def _build_stripe_gift_urls(origin_url: str, gift_code: str) -> tuple[str, str]:
    success_url = f"{origin_url}/gift/success?gift_code={gift_code}&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/gift/cancel?gift_code={gift_code}"
    return success_url, cancel_url


def _create_gift_stripe_client(request: Request, stripe_api_key: str) -> StripeCheckout:
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)


def _build_gift_checkout_request(
    amount: float,
    success_url: str,
    cancel_url: str,
    metadata: dict[str, Any],
) -> CheckoutSessionRequest:
    return CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )


def _build_stripe_gift_checkout_response(checkout_url: str, session_id: str, gift_code: str) -> dict[str, Any]:
    return {
        "checkout_url": checkout_url,
        "session_id": session_id,
        "payment_method": "stripe",
        "gift_code": gift_code,
    }


def _raise_stripe_gift_checkout_error(error: Exception) -> None:
    logger.error(f"Stripe gift checkout error: {error}")
    raise HTTPException(status_code=500, detail=f"Payment error: {str(error)}")


async def _create_paypal_gift_order(
    gift: dict[str, Any],
    amount: float,
    product_name: str,
    origin_url: str,
    current_user: User,
) -> dict[str, Any]:
    """Create PayPal order for gift."""
    db = get_db()

    paypal_client_id, paypal_secret, paypal_mode = _require_paypal_keys()
    base_url = _resolve_paypal_base_url(paypal_mode)

    order = await _request_paypal_gift_order(
        base_url=base_url,
        paypal_client_id=paypal_client_id,
        paypal_secret=paypal_secret,
        gift=gift,
        amount=amount,
        product_name=product_name,
        origin_url=origin_url,
    )
    order_id = order["id"]
    approval_url = _extract_paypal_approval_url(order)

    if not approval_url:
        raise HTTPException(status_code=500, detail="PayPal approval URL not found")

    await _attach_gift_payment_reference(db, gift["gift_code"], order_id, "paypal")
    transaction = _build_gift_transaction(
        order_id,
        amount,
        "paypal",
        product_name,
        gift["gift_code"],
        current_user,
    )
    await _persist_gift_payment_transaction(db, transaction)
    return _build_paypal_gift_response(gift_code=gift["gift_code"], order_id=order_id, approval_url=approval_url)


async def _request_paypal_gift_order(
    base_url: str,
    paypal_client_id: str,
    paypal_secret: str,
    gift: dict[str, Any],
    amount: float,
    product_name: str,
    origin_url: str,
) -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        access_token = await _fetch_paypal_access_token(client, base_url, paypal_client_id, paypal_secret)
        order_data = _build_paypal_gift_order_payload(gift, amount, product_name, origin_url)
        order_response = await client.post(
            f"{base_url}/v2/checkout/orders",
            json=order_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )
    if order_response.status_code not in [200, 201]:
        logger.error(f"PayPal order error: {order_response.text}")
        raise HTTPException(status_code=500, detail="Failed to create PayPal order")
    return order_response.json()


def _build_paypal_gift_response(gift_code: str, order_id: str, approval_url: str) -> dict[str, Any]:
    return {
        "checkout_url": approval_url,
        "order_id": order_id,
        "payment_method": "paypal",
        "gift_code": gift_code,
    }


def _require_stripe_key() -> str:
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    return stripe_api_key


def _require_paypal_keys() -> tuple[str, str, str]:
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE")
    if not paypal_client_id or not paypal_secret or not paypal_mode:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    return paypal_client_id, paypal_secret, paypal_mode


async def _attach_gift_payment_reference(
    db: Any,
    gift_code: str,
    payment_reference: str,
    payment_method: str,
) -> None:
    await db.gifts.update_one(
        {"gift_code": gift_code},
        {"$set": {"payment_session_id": payment_reference, "payment_method": payment_method}},
    )


async def _persist_gift_payment_transaction(db: Any, transaction: dict[str, Any]) -> None:
    await db.payment_transactions.insert_one(transaction)


@router.post("/gifts/confirm-payment")
async def confirm_gift_payment(gift_code: str, session_id: Optional[str] = None) -> dict[str, Any]:
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


async def _verify_stripe_gift_payment(gift: dict[str, Any], session_id: Optional[str]) -> dict[str, Any]:
    """Verify Stripe payment and update gift status."""
    db = get_db()
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key or not session_id:
        raise HTTPException(status_code=400, detail="Cannot verify payment")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status = await stripe_checkout.get_checkout_status(session_id)
        
        if status.payment_status == "paid":
            await _mark_gift_paid(db, gift["gift_code"], session_id)
            
            # Send email notification to recipient
            try:
                await _send_paid_gift_notification(gift)
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


async def _capture_paypal_gift_order(gift: dict[str, Any], order_id: Optional[str]) -> dict[str, Any]:
    """Capture PayPal order and update gift status."""
    db = get_db()
    
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE")
    
    if not paypal_client_id or not paypal_secret or not paypal_mode or not order_id:
        raise HTTPException(status_code=400, detail="Cannot capture payment")
    
    base_url = _resolve_paypal_base_url(paypal_mode)
    
    async with httpx.AsyncClient() as client:
        access_token = await _fetch_paypal_access_token(client, base_url, paypal_client_id, paypal_secret)
        
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
                await _mark_gift_paid(db, gift["gift_code"], order_id)
                
                # Send email notification to recipient
                try:
                    await _send_paid_gift_notification(gift)
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
async def get_gift(gift_code: str) -> dict[str, Any]:
    """Get gift details by code."""
    db = get_db()
    gift = await db.gifts.find_one({"gift_code": gift_code}, {"_id": 0})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    return gift


@router.post("/gifts/redeem")
async def redeem_gift(data: GiftRedeem, current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Redeem a gift code (requires authentication)."""
    db = get_db()
    
    gift = await db.gifts.find_one({"gift_code": data.gift_code})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift code not found")
    
    if gift["status"] == "redeemed":
        raise HTTPException(status_code=400, detail="Gift has already been redeemed")
    
    if gift["status"] != "paid":
        raise HTTPException(status_code=400, detail="Gift has not been paid for yet")
    
    await _mark_gift_redeemed(db, data.gift_code, current_user.user_id)
    await _grant_redeemed_gift_access(db, gift, data.gift_code, current_user.user_id)
    await _notify_sender_of_redemption(db, data.gift_code, gift)
    
    return {
        "message": "Gift redeemed successfully!",
        "gift_type": gift["gift_type"],
        "item_id": gift.get("item_id"),
        "plan_id": gift.get("plan_id")
    }


@router.get("/gifts/my/sent")
async def get_my_sent_gifts(current_user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
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
async def get_my_received_gifts(current_user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get gifts received by the current user's email."""
    db = get_db()
    gifts = await db.gifts.find(
        {"recipient_email": current_user.email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return gifts
