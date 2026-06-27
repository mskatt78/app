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
PRODUCT_TYPES = ["retreat", "course", "live_session", "book", "bundle", "premium_unlock"]

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

PREMIUM_UNLOCK_PRODUCTS: dict[str, dict[str, Any]] = {
    "shamanic_practices": {
        "name": "Shamanic Practices Unlock",
        "description": "Unlock advanced shamanic journeys and ceremonial protocols",
        "price": 69.00,
        "unlock_scope": "section",
    },
    "heart_practices": {
        "name": "Heart Practices Unlock",
        "description": "Unlock deep relational and heart coherence practices",
        "price": 59.00,
        "unlock_scope": "section",
    },
    "elemental_practices": {
        "name": "Elemental Practices Unlock",
        "description": "Unlock advanced earth, water, fire, air, and spirit practices",
        "price": 59.00,
        "unlock_scope": "section",
    },
    "mindfulness_practices": {
        "name": "Mindfulness Practices Unlock",
        "description": "Unlock full mindfulness library and advanced regulation drills",
        "price": 49.00,
        "unlock_scope": "section",
    },
    "meditations": {
        "name": "Meditations Unlock",
        "description": "Unlock complete guided meditations and immersive journeys",
        "price": 49.00,
        "unlock_scope": "section",
    },
    "water_practices": {
        "name": "Water Practices Unlock",
        "description": "Unlock advanced water rituals, ceremonies, and energetic protocols",
        "price": 59.00,
        "unlock_scope": "section",
    },
    "chakra_cleansing": {
        "name": "Chakra Cleansing Unlock",
        "description": "Unlock full chakra cleansing protocols and guided activation practices",
        "price": 59.00,
        "unlock_scope": "section",
    },
    "somatic_practices": {
        "name": "Somatic Practices Unlock",
        "description": "Unlock advanced somatic integration and nervous-system regulation practices",
        "price": 49.00,
        "unlock_scope": "section",
    },
    "grounding_practices": {
        "name": "Grounding Practices Unlock",
        "description": "Unlock advanced grounding and stability practices",
        "price": 39.00,
        "unlock_scope": "section",
    },
    "elemental_temples": {
        "name": "Elemental Temples Unlock",
        "description": "Unlock the full Elemental Temples immersion across all five elements",
        "price": 79.00,
        "unlock_scope": "section",
    },
    "premium_mantras": {
        "name": "Premium Mantras Unlock",
        "description": "Unlock all premium mantra libraries and advanced ritual protocols",
        "price": 49.00,
        "unlock_scope": "section",
    },
    "premium_breathwork": {
        "name": "Premium Breathlove Unlock",
        "description": "Unlock all premium Breathlove sessions in Breathwork",
        "price": 44.00,
        "unlock_scope": "section",
    },
    "rose_temple": {
        "name": "Rose Temple Unlock",
        "description": "Unlock Rose Temple teachings and practices",
        "price": 59.00,
        "unlock_scope": "section",
    },
    "healing_portals": {
        "name": "Healing Portals Unlock",
        "description": "Unlock all premium Healing Portals",
        "price": 69.00,
        "unlock_scope": "section",
    },
    "full_app_unlock": {
        "name": "Full App Unlock",
        "description": "Unlock all premium sections across the app",
        "price": 369.00,
        "unlock_scope": "full_app",
    },
}

PREMIUM_SECTION_IDS = [
    "shamanic_practices",
    "heart_practices",
    "elemental_practices",
    "mindfulness_practices",
    "meditations",
    "water_practices",
    "chakra_cleansing",
    "somatic_practices",
    "grounding_practices",
    "elemental_temples",
    "premium_mantras",
    "premium_breathwork",
    "rose_temple",
    "healing_portals",
]

# ============ MODELS ============

class PaymentRequest(BaseModel):
    product_type: str  # "subscription", "retreat", "course", "live_session", "book"
    product_id: Optional[str] = None  # ID of retreat/course/etc
    plan_id: Optional[str] = None  # For subscriptions: "monthly" or "yearly"
    origin_url: str  # Frontend origin for success/cancel URLs
    return_path: Optional[str] = None  # Frontend route path for same-page unlock flow
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


def _resolve_paypal_config() -> tuple[str, str, str, str]:
    paypal_client_id = os.environ.get("PAYPAL_CLIENT_ID")
    paypal_secret = os.environ.get("PAYPAL_SECRET")
    paypal_mode = os.environ.get("PAYPAL_MODE")
    if not paypal_client_id or not paypal_secret or not paypal_mode:
        raise HTTPException(status_code=500, detail="PayPal not configured")
    paypal_api = _get_paypal_api_base(paypal_mode)
    return paypal_client_id, paypal_secret, paypal_mode, paypal_api


def _build_paypal_order_payload(product_name: str, amount: float, origin_url: str) -> dict[str, Any]:
    return {
        "intent": "CAPTURE",
        "purchase_units": [{
            "reference_id": str(uuid.uuid4())[:8],
            "description": product_name,
            "amount": {
                "currency_code": "USD",
                "value": f"{amount:.2f}",
            },
        }],
        "application_context": {
            "return_url": f"{origin_url}/payment/success?paypal=true",
            "cancel_url": f"{origin_url}/payment/cancel?paypal=true",
            "brand_name": "Shamanic Elements",
            "user_action": "PAY_NOW",
        },
    }


def _extract_paypal_approval_url(order: dict[str, Any]) -> str:
    for link in order.get("links", []):
        if link.get("rel") == "approve":
            href = link.get("href")
            if href:
                return str(href)
    raise HTTPException(status_code=500, detail="PayPal approval URL not found")


def _build_payment_transaction(
    session_id: str,
    current_user: User,
    payment_request: PaymentRequest,
    amount: float,
    product_name: str,
    payment_method: str,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": str(uuid.uuid4())[:8],
        "session_id": session_id,
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "amount": amount,
        "currency": "usd",
        "product_type": payment_request.product_type,
        "product_id": payment_request.product_id,
        "plan_id": payment_request.plan_id,
        "product_name": product_name,
        "payment_method": payment_method,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata,
    }


def _get_paypal_api_base(paypal_mode: str) -> str:
    return "https://api-m.paypal.com" if paypal_mode == "live" else "https://api-m.sandbox.paypal.com"


def _subscription_expiry_from_interval(interval: str) -> datetime:
    days = 365 if interval == "year" else 30
    return datetime.now(timezone.utc) + timedelta(days=days)


def _is_subscription_active_record(subscription: Optional[dict[str, Any]]) -> bool:
    if not subscription:
        return False
    expires_at = subscription.get("expires_at")
    if not expires_at:
        return False
    expiry = datetime.fromisoformat(str(expires_at).replace("Z", "+00:00"))
    return expiry > datetime.now(timezone.utc)


async def _has_active_subscription(db: Any, user_id: str) -> bool:
    subscription = await db.user_subscriptions.find_one({"user_id": user_id, "status": "active"}, {"_id": 0})
    return _is_subscription_active_record(subscription)


async def _activate_subscription(db: Any, user_id: str, plan_id: Optional[str], interval: str) -> None:
    expires_at = _subscription_expiry_from_interval(interval)
    await db.user_subscriptions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "plan_id": plan_id,
                "status": "active",
                "expires_at": expires_at.isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )


async def _grant_purchase_access(db: Any, user_id: str, transaction: dict[str, Any]) -> None:
    if transaction.get("product_type") == "premium_unlock":
        unlock_id = str(transaction.get("product_id") or "").strip()
        if not unlock_id:
            return
        await db.user_purchases.update_one(
            {
                "user_id": user_id,
                "product_type": "premium_unlock",
                "product_id": unlock_id,
            },
            {
                "$setOnInsert": {
                    "user_id": user_id,
                    "product_type": "premium_unlock",
                    "product_id": unlock_id,
                    "purchased_at": datetime.now(timezone.utc).isoformat(),
                }
            },
            upsert=True,
        )
        return

    if transaction.get("product_type") == "bundle":
        bundle_courses = str(transaction.get("metadata", {}).get("bundle_courses", ""))
        if not bundle_courses:
            return
        for course_id in [c.strip() for c in bundle_courses.split(",") if c.strip()]:
            await db.user_purchases.insert_one(
                {
                    "user_id": user_id,
                    "product_type": "course",
                    "product_id": course_id,
                    "bundle_id": transaction.get("product_id"),
                    "purchased_at": datetime.now(timezone.utc).isoformat(),
                }
            )
        return

    await db.user_purchases.insert_one(
        {
            "user_id": user_id,
            "product_type": transaction.get("product_type"),
            "product_id": transaction.get("product_id"),
            "purchased_at": datetime.now(timezone.utc).isoformat(),
        }
    )


async def _grant_transaction_entitlements(db: Any, user_id: str, transaction: dict[str, Any]) -> None:
    if transaction.get("product_type") == "subscription":
        interval = str(transaction.get("metadata", {}).get("interval", "month"))
        await _activate_subscription(db, user_id, transaction.get("plan_id"), interval)
        return

    if transaction.get("product_type") in PRODUCT_TYPES:
        await _grant_purchase_access(db, user_id, transaction)


async def _resolve_payment_context(
    db: Any,
    payment_request: PaymentRequest,
    current_user: User,
) -> tuple[float, str, dict[str, Any]]:
    metadata: dict[str, Any] = {
        "user_id": current_user.user_id,
        "user_email": current_user.email,
        "product_type": payment_request.product_type,
    }

    if payment_request.product_type == "subscription":
        return _resolve_subscription_payment_context(payment_request, metadata)

    if payment_request.product_type == "bundle":
        return _resolve_bundle_payment_context(payment_request, metadata)

    if payment_request.product_type == "premium_unlock":
        return _resolve_premium_unlock_payment_context(payment_request, metadata)

    return await _resolve_catalog_payment_context(db, payment_request, metadata)


def _resolve_subscription_payment_context(
    payment_request: PaymentRequest,
    metadata: dict[str, Any],
) -> tuple[float, str, dict[str, Any]]:
    if payment_request.plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Invalid subscription plan")

    plan = SUBSCRIPTION_PLANS[payment_request.plan_id]
    amount = float(str(plan["price"]))
    product_name = str(plan["name"])
    metadata["plan_id"] = payment_request.plan_id
    metadata["interval"] = plan["interval"]
    return amount, product_name, metadata


def _resolve_bundle_payment_context(
    payment_request: PaymentRequest,
    metadata: dict[str, Any],
) -> tuple[float, str, dict[str, Any]]:
    if not payment_request.product_id or payment_request.product_id not in COURSE_BUNDLES:
        raise HTTPException(status_code=400, detail="Invalid bundle ID")

    bundle = COURSE_BUNDLES[payment_request.product_id]
    amount = float(str(bundle["price"]))
    product_name = str(bundle["name"])
    metadata["product_id"] = payment_request.product_id
    raw_courses = bundle.get("courses")
    course_ids = raw_courses if isinstance(raw_courses, list) else []
    metadata["bundle_courses"] = ",".join(str(course_id) for course_id in course_ids)
    return amount, product_name, metadata


def _resolve_premium_unlock_payment_context(
    payment_request: PaymentRequest,
    metadata: dict[str, Any],
) -> tuple[float, str, dict[str, Any]]:
    if not payment_request.product_id:
        raise HTTPException(status_code=400, detail="Premium unlock id required")

    premium_product = PREMIUM_UNLOCK_PRODUCTS.get(payment_request.product_id)
    if not premium_product:
        raise HTTPException(status_code=400, detail="Invalid premium unlock id")

    amount = float(str(premium_product["price"]))
    product_name = str(premium_product["name"])
    metadata["product_id"] = payment_request.product_id
    metadata["unlock_scope"] = str(premium_product.get("unlock_scope") or "section")
    return amount, product_name, metadata


async def _resolve_catalog_payment_context(
    db: Any,
    payment_request: PaymentRequest,
    metadata: dict[str, Any],
) -> tuple[float, str, dict[str, Any]]:
    if not payment_request.product_id:
        raise HTTPException(status_code=400, detail="Product ID required")

    collection = _resolve_product_collection(payment_request.product_type)
    product = await db[collection].find_one({"id": payment_request.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    amount = float(product.get("price", 0))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Product has no price set")

    product_name = product.get("title") or product.get("name", "Product")
    metadata["product_id"] = payment_request.product_id
    return amount, str(product_name), metadata


def _normalize_return_path(return_path: Optional[str]) -> Optional[str]:
    path = str(return_path or "").strip()
    if not path:
        return None
    if not path.startswith("/"):
        return None
    if path.startswith("//"):
        return None
    return path


async def _has_full_app_unlock(db: Any, user_id: str) -> bool:
    purchase = await db.user_purchases.find_one(
        {
            "user_id": user_id,
            "product_type": "premium_unlock",
            "product_id": "full_app_unlock",
        },
        {"_id": 0, "product_id": 1},
    )
    return bool(purchase)


async def _resolve_section_entitlements(
    db: Any,
    user_id: str,
    has_subscription: bool,
    has_full_app_unlock: bool,
) -> dict[str, bool]:
    if has_subscription or has_full_app_unlock:
        return {section_id: True for section_id in PREMIUM_SECTION_IDS}

    purchases = await db.user_purchases.find(
        {
            "user_id": user_id,
            "product_type": "premium_unlock",
            "product_id": {"$in": PREMIUM_SECTION_IDS},
        },
        {"_id": 0, "product_id": 1},
    ).to_list(length=200)
    unlocked_ids = {str(item.get("product_id") or "").strip() for item in purchases}
    return {section_id: section_id in unlocked_ids for section_id in PREMIUM_SECTION_IDS}


def _resolve_product_collection(product_type: str) -> str:
    collection_map = {
        "retreat": "retreats",
        "course": "courses",
        "live_session": "live_sessions",
        "book": "books",
    }
    collection = collection_map.get(product_type)
    if not collection:
        raise HTTPException(status_code=400, detail="Invalid product type")
    return collection


async def _create_paypal_access_token(paypal_api: str, client_id: str, secret: str) -> str:
    async with httpx.AsyncClient() as client:
        auth_response = await client.post(
            f"{paypal_api}/v1/oauth2/token",
            auth=(client_id, secret),
            data={"grant_type": "client_credentials"},
        )
    if auth_response.status_code != 200:
        logger.error("PayPal auth error: %s", auth_response.text)
        raise HTTPException(status_code=500, detail="PayPal authentication failed")
    return str(auth_response.json()["access_token"])

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

    stripe_checkout = _create_stripe_checkout_client(request)
    amount, product_name, metadata = await _resolve_payment_context(db, payment_request, current_user)
    checkout_request = _build_checkout_request(
        payment_request.origin_url,
        amount,
        metadata,
        payment_request.return_path,
    )

    try:
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        transaction = _build_payment_transaction(
            session_id=session.session_id,
            current_user=current_user,
            payment_request=payment_request,
            amount=amount,
            product_name=product_name,
            payment_method="stripe",
            metadata=metadata,
        )
        await db.payment_transactions.insert_one(transaction)
        return _build_checkout_response(session)
    except Exception as e:
        _raise_checkout_session_error(e)


def _create_stripe_checkout_client(request: Request) -> StripeCheckout:
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Payment system not configured")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)


def _build_checkout_request(
    origin_url: str,
    amount: float,
    metadata: dict[str, Any],
    return_path: Optional[str],
) -> CheckoutSessionRequest:
    normalized_return_path = _normalize_return_path(return_path)
    if normalized_return_path:
        separator = "&" if "?" in normalized_return_path else "?"
        success_url = f"{origin_url}{normalized_return_path}{separator}session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}{normalized_return_path}"
    else:
        success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{origin_url}/payment/cancel"
    return CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )


def _build_checkout_response(session: CheckoutSessionResponse) -> dict[str, Any]:
    return {
        "checkout_url": session.url,
        "session_id": session.session_id,
        "payment_method": "stripe",
    }


def _raise_checkout_session_error(error: Exception) -> None:
    logger.error(f"Stripe checkout error: {error}")
    raise HTTPException(status_code=500, detail=f"Payment error: {str(error)}")

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
                await _grant_transaction_entitlements(db, current_user.user_id, transaction)
        
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

    paypal_client_id, paypal_secret, _, paypal_api = _resolve_paypal_config()
    amount, product_name, metadata = await _resolve_payment_context(db, payment_request, current_user)
    access_token = await _create_paypal_access_token(paypal_api, paypal_client_id, paypal_secret)
    order_data = _build_paypal_order_payload(product_name, amount, payment_request.origin_url)

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
    approval_url = _extract_paypal_approval_url(order)

    transaction = _build_payment_transaction(
        session_id=order["id"],
        current_user=current_user,
        payment_request=payment_request,
        amount=amount,
        product_name=product_name,
        payment_method="paypal",
        metadata=metadata,
    )
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

    paypal_client_id, paypal_secret, _, paypal_api = _resolve_paypal_config()
    access_token = await _create_paypal_access_token(paypal_api, paypal_client_id, paypal_secret)
    
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
            
            await _grant_transaction_entitlements(db, current_user.user_id, transaction)
    
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
    if not _is_subscription_active_record(subscription):
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


@router.get("/entitlements")
async def get_entitlements(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get premium unlock state for section gating and full-app unlock."""
    if not current_user or not str(current_user.user_id or "").strip():
        raise HTTPException(status_code=401, detail="Not authenticated")

    db = get_db()
    has_subscription = await _has_active_subscription(db, current_user.user_id)
    has_full_unlock = await _has_full_app_unlock(db, current_user.user_id)
    sections = await _resolve_section_entitlements(
        db,
        current_user.user_id,
        has_subscription=has_subscription,
        has_full_app_unlock=has_full_unlock,
    )

    purchases = await db.user_purchases.find(
        {
            "user_id": current_user.user_id,
            "product_type": "premium_unlock",
            "product_id": {"$in": [*PREMIUM_SECTION_IDS, "full_app_unlock"]},
        },
        {"_id": 0, "product_id": 1},
    ).to_list(length=100)
    purchased_unlocks = [
        str(item.get("product_id") or "").strip()
        for item in purchases
        if str(item.get("product_id") or "").strip()
    ]

    return {
        "has_subscription": has_subscription,
        "has_full_app_unlock": has_full_unlock,
        "sections": sections,
        "purchased_unlocks": purchased_unlocks,
    }

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

    if product_type == "premium_unlock":
        has_subscription = await _has_active_subscription(db, current_user.user_id)
        has_full_unlock = await _has_full_app_unlock(db, current_user.user_id)
        if has_subscription or has_full_unlock:
            access_type = "subscription" if has_subscription else "full_app_unlock"
            return {"has_access": True, "access_type": access_type}

        purchase = await db.user_purchases.find_one(
            {
                "user_id": current_user.user_id,
                "product_type": "premium_unlock",
                "product_id": product_id,
            },
            {"_id": 0},
        )
        return {"has_access": bool(purchase), "access_type": "purchased" if purchase else None}

    if await _has_full_app_unlock(db, current_user.user_id):
        return {"has_access": True, "access_type": "full_app_unlock"}
    
    # Check for direct purchase
    purchase = await db.user_purchases.find_one({
        "user_id": current_user.user_id,
        "product_type": product_type,
        "product_id": product_id
    })
    
    if purchase:
        return {"has_access": True, "access_type": "purchased"}
    
    if await _has_active_subscription(db, current_user.user_id):
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
    
    has_subscription = await _has_active_subscription(db, current_user.user_id)
    has_full_app_unlock = await _has_full_app_unlock(db, current_user.user_id)
    
    return {
        "purchased_courses": purchased_courses,
        "has_subscription": has_subscription or has_full_app_unlock,
        "has_full_app_unlock": has_full_app_unlock,
    }


@router.get("/premium-products")
async def get_premium_products() -> dict[str, Any]:
    """Get fixed premium unlock products for section and full-app purchases."""
    products = []
    for product_id, product_data in PREMIUM_UNLOCK_PRODUCTS.items():
        products.append(
            {
                "id": product_id,
                "name": product_data["name"],
                "description": product_data["description"],
                "price": float(str(product_data["price"])),
                "currency": "usd",
                "unlock_scope": product_data.get("unlock_scope", "section"),
            }
        )
    return {"products": products}

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
