"""Google Play Billing verification for the Android TWA (Digital Goods API flow).

The web client obtains a purchaseToken via PaymentRequest inside the TWA and posts it
here. This router verifies the token with the Google Play Developer API using a
service account, grants the matching entitlement, and acknowledges the purchase.
"""
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Literal, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleAuthRequest

from .dependencies import User, get_current_user, get_db

router = APIRouter(prefix="/playbilling", tags=["playbilling"])
logger = logging.getLogger(__name__)

ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher"
API_BASE = "https://androidpublisher.googleapis.com/androidpublisher/v3"

SUBSCRIPTION_BASE_PLANS = {"monthly", "yearly"}
ENTITLED_SUBSCRIPTION_STATES = {
    "SUBSCRIPTION_STATE_ACTIVE",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
    "SUBSCRIPTION_STATE_CANCELED",
}


def _package_name() -> str:
    return os.environ.get("PLAY_PACKAGE_NAME", "host.emergent.embodiment_journey.twa")


def _subscription_product_id() -> str:
    return os.environ.get("PLAY_SUBSCRIPTION_PRODUCT_ID", "soul_temple_membership")


def _lifetime_product_id() -> str:
    return (os.environ.get("PLAY_LIFETIME_PRODUCT_ID") or "").strip()


def _load_credentials() -> Optional[service_account.Credentials]:
    raw = (os.environ.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON") or "").strip()
    if not raw:
        return None
    try:
        if raw.startswith("{"):
            info = json.loads(raw)
        else:
            with open(raw) as fh:
                info = json.load(fh)
        return service_account.Credentials.from_service_account_info(info, scopes=[ANDROID_PUBLISHER_SCOPE])
    except Exception as exc:
        logger.error(f"Failed to load Play service account credentials: {exc}")
        return None


def is_play_verification_configured() -> bool:
    return _load_credentials() is not None


def _access_token() -> str:
    creds = _load_credentials()
    if creds is None:
        raise HTTPException(
            status_code=503,
            detail="Google Play verification is not configured yet. Add GOOGLE_PLAY_SERVICE_ACCOUNT_JSON to the backend environment.",
        )
    creds.refresh(GoogleAuthRequest())
    return creds.token


async def _play_get(path: str) -> dict[str, Any]:
    token = _access_token()
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(f"{API_BASE}{path}", headers={"Authorization": f"Bearer {token}"})
    if response.status_code == 404 or response.status_code == 400:
        raise HTTPException(status_code=400, detail="Purchase not found — the purchase token is invalid")
    if response.status_code != 200:
        logger.error(f"Play API GET {path} failed: {response.status_code} {response.text[:300]}")
        raise HTTPException(status_code=502, detail=f"Google verification failed ({response.status_code})")
    return response.json()


async def _play_acknowledge(path: str) -> None:
    token = _access_token()
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{API_BASE}{path}",
            json={"developerPayload": "soul-temple-server-verified"},
            headers={"Authorization": f"Bearer {token}"},
        )
    if response.status_code not in (200, 204):
        logger.error(f"Play acknowledge {path} failed: {response.status_code} {response.text[:300]}")


def _parse_google_time(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


class VerifyRequest(BaseModel):
    product_id: str
    purchase_token: str
    kind: Literal["subscription", "onetime"]


@router.get("/config")
async def get_play_billing_config() -> dict[str, Any]:
    lifetime_id = _lifetime_product_id()
    return {
        "package_name": _package_name(),
        "subscription_product_id": _subscription_product_id(),
        "base_plans": sorted(SUBSCRIPTION_BASE_PLANS),
        "lifetime_product_id": lifetime_id,
        "lifetime_available": bool(lifetime_id),
        "verification_configured": is_play_verification_configured(),
    }


async def _verify_and_grant_subscription(db: Any, user_id: str, purchase_token: str) -> dict[str, Any]:
    package = _package_name()
    product_id = _subscription_product_id()
    purchase = await _play_get(f"/applications/{package}/purchases/subscriptionsv2/tokens/{purchase_token}")

    state = purchase.get("subscriptionState", "")
    line_items = purchase.get("lineItems") or [{}]
    line = line_items[0]
    expiry_raw = line.get("expiryTime")
    expiry = _parse_google_time(expiry_raw)
    base_plan = (line.get("offerDetails") or {}).get("basePlanId") or line.get("productId") or "monthly"
    if base_plan not in SUBSCRIPTION_BASE_PLANS:
        base_plan = "monthly"

    now = datetime.now(timezone.utc)
    entitled = state in ENTITLED_SUBSCRIPTION_STATES and expiry is not None and expiry > now
    if not entitled:
        raise HTTPException(status_code=402, detail=f"Subscription is not active (state: {state or 'unknown'})")

    if purchase.get("acknowledgementState") != "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED":
        await _play_acknowledge(
            f"/applications/{package}/purchases/subscriptions/{product_id}/tokens/{purchase_token}:acknowledge"
        )

    status = "cancelled" if state == "SUBSCRIPTION_STATE_CANCELED" else "active"
    await db.user_subscriptions.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "plan_id": base_plan,
                "status": status,
                "expires_at": expiry.isoformat(),
                "provider": "google_play",
                "play_purchase_token": purchase_token,
                "updated_at": now.isoformat(),
            }
        },
        upsert=True,
    )
    return {"type": "subscription", "plan": base_plan, "status": status, "expires_at": expiry.isoformat()}


async def _verify_and_grant_lifetime(db: Any, user_id: str, product_id: str, purchase_token: str) -> dict[str, Any]:
    package = _package_name()
    purchase = await _play_get(f"/applications/{package}/purchases/products/{product_id}/tokens/{purchase_token}")

    if purchase.get("purchaseState") not in (0, "0", "PURCHASED"):
        raise HTTPException(status_code=402, detail="Purchase is not completed")

    if purchase.get("acknowledgementState", 0) not in (1, "1"):
        await _play_acknowledge(
            f"/applications/{package}/purchases/products/{product_id}/tokens/{purchase_token}:acknowledge"
        )

    now = datetime.now(timezone.utc).isoformat()
    await db.user_purchases.update_one(
        {"user_id": user_id, "product_type": "premium_unlock", "product_id": "full_app_unlock"},
        {
            "$setOnInsert": {
                "user_id": user_id,
                "product_type": "premium_unlock",
                "product_id": "full_app_unlock",
                "created_at": now,
            },
            "$set": {
                "provider": "google_play",
                "play_product_id": product_id,
                "play_purchase_token": purchase_token,
                "updated_at": now,
            },
        },
        upsert=True,
    )
    return {"type": "lifetime", "status": "active"}


@router.post("/verify")
async def verify_play_purchase(body: VerifyRequest, current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    db = get_db()
    lifetime_id = _lifetime_product_id()
    subscription_id = _subscription_product_id()
    top_level_product = body.product_id.split(":", 1)[0].strip()

    allowed = {subscription_id} | ({lifetime_id} if lifetime_id else set())
    if top_level_product not in allowed:
        raise HTTPException(status_code=400, detail="Unknown product")

    existing = await db.google_play_purchases.find_one({"purchase_token": body.purchase_token}, {"_id": 0})
    if existing and existing.get("user_id") != current_user.user_id:
        raise HTTPException(status_code=409, detail="This purchase is already linked to another account")

    if body.kind == "subscription":
        if top_level_product != subscription_id:
            raise HTTPException(status_code=400, detail="Invalid subscription product")
        entitlement = await _verify_and_grant_subscription(db, current_user.user_id, body.purchase_token)
    else:
        if not lifetime_id or top_level_product != lifetime_id:
            raise HTTPException(status_code=400, detail="Lifetime product is not configured")
        entitlement = await _verify_and_grant_lifetime(db, current_user.user_id, top_level_product, body.purchase_token)

    await db.google_play_purchases.update_one(
        {"purchase_token": body.purchase_token},
        {
            "$set": {
                "purchase_token": body.purchase_token,
                "user_id": current_user.user_id,
                "product_id": top_level_product,
                "kind": body.kind,
                "entitlement": entitlement,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )
    return {"verified": True, **entitlement}


async def refresh_google_play_subscription(db: Any, subscription: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Re-check an expired Google Play subscription to pick up renewals. Returns the updated record or None."""
    purchase_token = subscription.get("play_purchase_token")
    if not purchase_token or not is_play_verification_configured():
        return None
    try:
        await _verify_and_grant_subscription(db, subscription["user_id"], purchase_token)
        return await db.user_subscriptions.find_one({"user_id": subscription["user_id"]}, {"_id": 0})
    except HTTPException:
        return None
    except Exception as exc:
        logger.warning(f"Play subscription refresh failed: {exc}")
        return None
