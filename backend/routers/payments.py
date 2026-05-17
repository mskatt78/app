"""Payment routes for Stripe and PayPal integration."""
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, timezone, timedelta
import os
import uuid
import logging
import httpx

# Import Stripe integration
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)

from .dependencies import get_db, get_current_user, User

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Define subscription plans and products
SUBSCRIPTION_PLANS = {
    "monthly": {"name": "Monthly Membership", "price": 19.99, "interval": "month"},
    "yearly": {"name": "Yearly Membership", "price": 149.99, "interval": "year"}
}

# Products for one-time purchase
PRODUCT_TYPES = ["retreat", "course", "live_session", "book", "bundle"]

# Course bundle pricing
COURSE_BUNDLES = {
    "sacred-rites-bundle": {
        "name": "All Sacred Rites Bundle",
        "description": "Get all 3 Sacred Rites courses: Munay Ki, Nusta Karpay, and 13th Rite of the Womb",
        "price": 397.00,
        "courses": ["munay-ki", "nusta-karpay", "13th-rite-womb"],
        "savings": 124.00
    }
}

# ============ MODELS ============

class PaymentRequest(BaseModel):
    product_type: str  # "subscription", "retreat", "course", "live_session", "book"
    product_id: Optional[str] = None  # ID of retreat/course/etc
    plan_id: Optional[str] = None  # For subscriptions: "monthly" or "yearly"
    origin_url: str  # Frontend origin for success/cancel URLs
    payment_method: str = "stripe"  # "stripe" or "paypal"

class SubscriptionStatusResponse(BaseModel):
    is_subscribed: bool
    plan: Optional[str] = None
    expires_at: Optional[str] = None
    status: str

class PayPalOrderRequest(BaseModel):
    product_type: str
    product_id: Optional[str] = None
    plan_id: Optional[str] = None
    origin_url: str

# ============ STRIPE ROUTES ============

@router.post("/create-checkout")
async def create_checkout_session(
    request: Request,
    payment_request: PaymentRequest,
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Create a Stripe checkout session for subscription or one-time payment."""
    db = get_db()
    
    if payment_request.payment_method == "paypal":
        return await create_paypal_order(request, payment_request, current_user)
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    origin_url = payment_request.origin_url
    success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/payment/cancel"
    
    # Determine amount and metadata based on product type
    amount = 0.0
    product_name = ""
    metadata = {
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "product_type": payment_request.product_type
    }
    
    if payment_request.product_type == "subscription":
        if payment_request.plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid subscription plan")
        plan = SUBSCRIPTION_PLANS[payment_request.plan_id]
        amount = plan["price"]
        product_name = plan["name"]
        metadata["plan_id"] = payment_request.plan_id
        metadata["interval"] = plan["interval"]
    elif payment_request.product_type == "bundle":
        # Handle course bundles
        if not payment_request.product_id or payment_request.product_id not in COURSE_BUNDLES:
            raise HTTPException(status_code=400, detail="Invalid bundle ID")
        bundle = COURSE_BUNDLES[payment_request.product_id]
        amount = bundle["price"]
        product_name = bundle["name"]
        metadata["product_id"] = payment_request.product_id
        metadata["bundle_courses"] = ",".join(bundle["courses"])
    else:
        if not payment_request.product_id:
            raise HTTPException(status_code=400, detail="Product ID required")
        
        collection_map = {
            "retreat": "retreats",
            "course": "courses",
            "live_session": "live_sessions",
            "book": "books"
        }
        collection = collection_map.get(payment_request.product_type)
        if not collection:
            raise HTTPException(status_code=400, detail="Invalid product type")
        
        product = await db[collection].find_one({"id": payment_request.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        amount = float(product.get("price", 0))
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Product has no price set")
        
        product_name = product.get("title") or product.get("name", "Product")
        metadata["product_id"] = payment_request.product_id
    
    # Initialize Stripe
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
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        transaction = {
            "id": str(uuid.uuid4())[:8],
            "session_id": session.session_id,
            "user_id": current_user.user_id,
            "user_email": current_user.email,
            "amount": amount,
            "currency": "usd",
            "product_type": payment_request.product_type,
            "product_id": payment_request.product_id,
            "plan_id": payment_request.plan_id,
            "product_name": product_name,
            "payment_method": "stripe",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "checkout_url": session.url,
            "session_id": session.session_id,
            "payment_method": "stripe"
        }
    except Exception as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.get("/status/{session_id}")
async def get_payment_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Get the status of a payment session."""
    db = get_db()
    
    # Check if it's a PayPal order
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and transaction.get("payment_method") == "paypal":
        return await get_paypal_order_status(session_id, current_user)
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        if status.payment_status == "paid":
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {
                        "payment_status": "paid",
                        "paid_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                
                if transaction.get("product_type") == "subscription":
                    plan_id = transaction.get("plan_id")
                    interval = transaction.get("metadata", {}).get("interval", "month")
                    
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
                            "expires_at": expires_at.isoformat(),
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }},
                        upsert=True
                    )
                
                elif transaction.get("product_type") in PRODUCT_TYPES:
                    # Check if it's a bundle purchase
                    if transaction.get("product_type") == "bundle":
                        bundle_courses = transaction.get("metadata", {}).get("bundle_courses", "")
                        if bundle_courses:
                            course_ids = bundle_courses.split(",")
                            # Grant access to each course in the bundle
                            for course_id in course_ids:
                                await db.user_purchases.insert_one({
                                    "user_id": current_user.user_id,
                                    "product_type": "course",
                                    "product_id": course_id.strip(),
                                    "bundle_id": transaction.get("product_id"),
                                    "purchased_at": datetime.now(timezone.utc).isoformat()
                                })
                    else:
                        await db.user_purchases.insert_one({
                            "user_id": current_user.user_id,
                            "product_type": transaction.get("product_type"),
                            "product_id": transaction.get("product_id"),
                            "purchased_at": datetime.now(timezone.utc).isoformat()
                        })
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount": status.amount_total / 100,
            "currency": status.currency,
            "payment_method": "stripe"
        }
    except Exception as e:
        logger.error(f"Payment status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ PAYPAL ROUTES ============

async def create_paypal_order(
    request: Request,
    payment_request: PaymentRequest,
    current_user: User
) -> dict[str, Any]:
    """Create a PayPal order for payment."""
    db = get_db()
    
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE")
    
    if not paypal_client_id or not paypal_secret or not paypal_mode:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    
    # Determine PayPal API URL
    if paypal_mode == "live":
        paypal_api = "https://api-m.paypal.com"
    else:
        paypal_api = "https://api-m.sandbox.paypal.com"
    
    # Get access token
    async with httpx.AsyncClient() as client:
        auth_response = await client.post(
            f"{paypal_api}/v1/oauth2/token",
            auth=(paypal_client_id, paypal_secret),
            data={"grant_type": "client_credentials"}
        )
        if auth_response.status_code != 200:
            logger.error(f"PayPal auth error: {auth_response.text}")
            raise HTTPException(status_code=500, detail="PayPal authentication failed")
        
        access_token = auth_response.json()["access_token"]
    
    # Determine amount
    amount = 0.0
    product_name = ""
    metadata = {
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "product_type": payment_request.product_type
    }
    
    if payment_request.product_type == "subscription":
        if payment_request.plan_id not in SUBSCRIPTION_PLANS:
            raise HTTPException(status_code=400, detail="Invalid subscription plan")
        plan = SUBSCRIPTION_PLANS[payment_request.plan_id]
        amount = plan["price"]
        product_name = plan["name"]
        metadata["plan_id"] = payment_request.plan_id
        metadata["interval"] = plan["interval"]
    else:
        if not payment_request.product_id:
            raise HTTPException(status_code=400, detail="Product ID required")
        
        collection_map = {
            "retreat": "retreats",
            "course": "courses", 
            "live_session": "live_sessions",
            "book": "books"
        }
        collection = collection_map.get(payment_request.product_type)
        if not collection:
            raise HTTPException(status_code=400, detail="Invalid product type")
        
        product = await db[collection].find_one({"id": payment_request.product_id}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        amount = float(product.get("price", 0))
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Product has no price set")
        
        product_name = product.get("title") or product.get("name", "Product")
        metadata["product_id"] = payment_request.product_id
    
    origin_url = payment_request.origin_url
    
    # Create PayPal order
    order_data = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": str(uuid.uuid4())[:8],
            "description": product_name,
            "amount": {
                "currency_code": "USD",
                "value": f"{amount:.2f}"
            }
        }],
        "application_context": {
            "return_url": f"{origin_url}/payment/success?paypal=true",
            "cancel_url": f"{origin_url}/payment/cancel?paypal=true",
            "brand_name": "Shamanic Elements",
            "user_action": "PAY_NOW"
        }
    }
    
    async with httpx.AsyncClient() as client:
        order_response = await client.post(
            f"{paypal_api}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=order_data
        )
        
        if order_response.status_code not in [200, 201]:
            logger.error(f"PayPal order error: {order_response.text}")
            raise HTTPException(status_code=500, detail="Failed to create PayPal order")
        
        order = order_response.json()
    
    # Find approval URL
    approval_url = None
    for link in order.get("links", []):
        if link.get("rel") == "approve":
            approval_url = link.get("href")
            break
    
    if not approval_url:
        raise HTTPException(status_code=500, detail="PayPal approval URL not found")
    
    # Store transaction
    transaction = {
        "id": str(uuid.uuid4())[:8],
        "session_id": order["id"],  # PayPal order ID
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "amount": amount,
        "currency": "usd",
        "product_type": payment_request.product_type,
        "product_id": payment_request.product_id,
        "plan_id": payment_request.plan_id,
        "product_name": product_name,
        "payment_method": "paypal",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {
        "checkout_url": approval_url,
        "session_id": order["id"],
        "payment_method": "paypal"
    }

@router.post("/paypal/capture/{order_id}")
async def capture_paypal_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Capture a PayPal order after user approval."""
    db = get_db()
    
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE")
    
    if not paypal_client_id or not paypal_secret or not paypal_mode:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    
    if paypal_mode == "live":
        paypal_api = "https://api-m.paypal.com"
    else:
        paypal_api = "https://api-m.sandbox.paypal.com"
    
    # Get access token
    async with httpx.AsyncClient() as client:
        auth_response = await client.post(
            f"{paypal_api}/v1/oauth2/token",
            auth=(paypal_client_id, paypal_secret),
            data={"grant_type": "client_credentials"}
        )
        if auth_response.status_code != 200:
            raise HTTPException(status_code=500, detail="PayPal authentication failed")
        
        access_token = auth_response.json()["access_token"]
    
    # Capture the order
    async with httpx.AsyncClient() as client:
        capture_response = await client.post(
            f"{paypal_api}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if capture_response.status_code not in [200, 201]:
            logger.error(f"PayPal capture error: {capture_response.text}")
            raise HTTPException(status_code=500, detail="Failed to capture PayPal payment")
        
        capture = capture_response.json()
    
    # Check if payment was completed
    if capture.get("status") == "COMPLETED":
        transaction = await db.payment_transactions.find_one({"session_id": order_id})
        
        if transaction:
            await db.payment_transactions.update_one(
                {"session_id": order_id},
                {"$set": {
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "paypal_capture_id": capture.get("id")
                }}
            )
            
            # Handle subscription or purchase
            if transaction.get("product_type") == "subscription":
                plan_id = transaction.get("plan_id")
                interval = transaction.get("metadata", {}).get("interval", "month")
                
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
                        "expires_at": expires_at.isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }},
                    upsert=True
                )
            
            elif transaction.get("product_type") in PRODUCT_TYPES:
                await db.user_purchases.insert_one({
                    "user_id": current_user.user_id,
                    "product_type": transaction.get("product_type"),
                    "product_id": transaction.get("product_id"),
                    "purchased_at": datetime.now(timezone.utc).isoformat()
                })
    
    return {
        "status": capture.get("status"),
        "payment_status": "paid" if capture.get("status") == "COMPLETED" else "pending",
        "order_id": order_id,
        "payment_method": "paypal"
    }

async def get_paypal_order_status(order_id: str, current_user: User) -> dict[str, Any]:
    """Get PayPal order status."""
    db = get_db()
    
    transaction = await db.payment_transactions.find_one({"session_id": order_id}, {"_id": 0})
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "status": "completed" if transaction.get("payment_status") == "paid" else "pending",
        "payment_status": transaction.get("payment_status"),
        "amount": transaction.get("amount"),
        "currency": transaction.get("currency"),
        "payment_method": "paypal"
    }

# ============ SUBSCRIPTION & PURCHASE ROUTES ============

@router.get("/subscription-status")
async def get_subscription_status(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Check user's subscription status."""
    db = get_db()
    subscription = await db.user_subscriptions.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    
    if not subscription:
        return SubscriptionStatusResponse(
            is_subscribed=False,
            status="none"
        )
    
    expires_at = subscription.get("expires_at")
    if expires_at:
        expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if expiry < datetime.now(timezone.utc):
            return SubscriptionStatusResponse(
                is_subscribed=False,
                plan=subscription.get("plan_id"),
                expires_at=expires_at,
                status="expired"
            )
    
    return SubscriptionStatusResponse(
        is_subscribed=True,
        plan=subscription.get("plan_id"),
        expires_at=expires_at,
        status=subscription.get("status", "active")
    )

@router.get("/my-purchases")
async def get_my_purchases(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get user's purchase history."""
    db = get_db()
    purchases = await db.user_purchases.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(length=100)
    
    transactions = await db.payment_transactions.find(
        {"user_id": current_user.user_id, "payment_status": "paid"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)
    
    return {
        "purchases": purchases,
        "transactions": transactions
    }

@router.get("/check-access/{product_type}/{product_id}")
async def check_product_access(
    product_type: str,
    product_id: str,
    current_user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Check if user has access to a specific product (course, retreat, etc.)."""
    db = get_db()
    
    # Check for direct purchase
    purchase = await db.user_purchases.find_one({
        "user_id": current_user.user_id,
        "product_type": product_type,
        "product_id": product_id
    })
    
    if purchase:
        return {"has_access": True, "access_type": "purchased"}
    
    # Check for active subscription (subscriptions grant access to all courses)
    subscription = await db.user_subscriptions.find_one({
        "user_id": current_user.user_id,
        "status": "active"
    })
    
    if subscription:
        expires_at = subscription.get("expires_at")
        if expires_at:
            expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expiry > datetime.now(timezone.utc):
                return {"has_access": True, "access_type": "subscription"}
    
    return {"has_access": False, "access_type": None}

@router.get("/course-access")
async def get_all_course_access(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get access status for all premium courses."""
    db = get_db()
    
    # Get user's course purchases
    purchases = await db.user_purchases.find({
        "user_id": current_user.user_id,
        "product_type": "course"
    }, {"_id": 0, "product_id": 1}).to_list(length=100)
    
    purchased_courses = [p["product_id"] for p in purchases]
    
    # Check subscription status
    has_subscription = False
    subscription = await db.user_subscriptions.find_one({
        "user_id": current_user.user_id,
        "status": "active"
    })
    
    if subscription:
        expires_at = subscription.get("expires_at")
        if expires_at:
            expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expiry > datetime.now(timezone.utc):
                has_subscription = True
    
    return {
        "purchased_courses": purchased_courses,
        "has_subscription": has_subscription
    }

@router.get("/plans")
async def get_subscription_plans() -> dict[str, Any]:
    """Get available subscription plans."""
    return {
        "plans": [
            {
                "id": "monthly",
                "name": "Monthly Membership",
                "price": 19.99,
                "interval": "month",
                "features": [
                    "Access to all yoga poses & sequences",
                    "Full crystal guide with frequencies",
                    "All mantras with pronunciation",
                    "Guided meditations",
                    "Shamanic practices library",
                    "Practice tracking & achievements"
                ]
            },
            {
                "id": "yearly",
                "name": "Yearly Membership",
                "price": 149.99,
                "interval": "year",
                "savings": "Save $90/year",
                "features": [
                    "Everything in Monthly",
                    "Priority access to live sessions",
                    "Exclusive retreat discounts",
                    "Personal oracle readings",
                    "Early access to new content"
                ]
            }
        ],
        "payment_methods": ["stripe", "paypal"]
    }

@router.get("/bundles")
async def get_bundles() -> list[dict[str, Any]]:
    """Get available course bundles."""
    bundles = []
    for bundle_id, bundle_data in COURSE_BUNDLES.items():
        bundles.append({
            "id": bundle_id,
            "name": bundle_data["name"],
            "description": bundle_data["description"],
            "price": bundle_data["price"],
            "courses": bundle_data["courses"],
            "savings": bundle_data["savings"]
        })
    return bundles

# ============ WEBHOOK ROUTES ============

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request) -> dict[str, Any]:
    """Handle Stripe webhooks."""
    db = get_db()
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        return {"status": "not configured"}
    
    try:
        body = await request.body()
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, request.headers.get("Stripe-Signature"))
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": "paid",
                    "paid_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"status": "processed", "event_type": webhook_response.event_type}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/webhook/paypal")
async def paypal_webhook(request: Request) -> dict[str, Any]:
    """Handle PayPal webhooks."""
    db = get_db()
    try:
        data = await request.json()
        event_type = data.get("event_type", "")
        
        if event_type == "PAYMENT.CAPTURE.COMPLETED":
            resource = data.get("resource", {})
            # Extract order ID from supplementary data or links
            order_id = None
            for link in resource.get("links", []):
                if "orders" in link.get("href", ""):
                    # Extract order ID from URL
                    order_id = link.get("href").split("/")[-1]
                    break
            
            if order_id:
                await db.payment_transactions.update_one(
                    {"session_id": order_id},
                    {"$set": {
                        "payment_status": "paid",
                        "paid_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
        
        return {"status": "processed", "event_type": event_type}
    except Exception as e:
        logger.error(f"PayPal webhook error: {e}")
        return {"status": "error", "message": str(e)}
