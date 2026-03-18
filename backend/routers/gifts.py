"""Gift and notification routes."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from .dependencies import get_db

router = APIRouter(tags=["gifts"])


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
    """Create a gift for someone."""
    db = get_db()
    
    gift_code = f"GIFT-{uuid.uuid4().hex[:8].upper()}"
    
    gift_data = {
        "gift_code": gift_code,
        "recipient_email": gift.recipient_email,
        "recipient_name": gift.recipient_name,
        "sender_name": gift.sender_name,
        "gift_type": gift.gift_type,
        "item_id": gift.item_id,
        "plan_id": gift.plan_id,
        "message": gift.message,
        "status": "pending",  # pending, paid, redeemed, expired
        "created_at": datetime.now(timezone.utc).isoformat(),
        "redeemed_at": None,
        "redeemed_by": None
    }
    
    await db.gifts.insert_one(gift_data)
    gift_data.pop("_id", None)
    
    return {
        "message": "Gift created successfully",
        "gift_code": gift_code,
        "gift": gift_data
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
async def redeem_gift(data: GiftRedeem):
    """Redeem a gift code."""
    db = get_db()
    
    gift = await db.gifts.find_one({"gift_code": data.gift_code})
    if not gift:
        raise HTTPException(status_code=404, detail="Gift code not found")
    
    if gift["status"] == "redeemed":
        raise HTTPException(status_code=400, detail="Gift has already been redeemed")
    
    if gift["status"] != "paid":
        raise HTTPException(status_code=400, detail="Gift has not been paid for yet")
    
    await db.gifts.update_one(
        {"gift_code": data.gift_code},
        {
            "$set": {
                "status": "redeemed",
                "redeemed_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {
        "message": "Gift redeemed successfully",
        "gift_type": gift["gift_type"],
        "item_id": gift.get("item_id"),
        "plan_id": gift.get("plan_id")
    }


@router.get("/gifts/by-email/sent")
async def get_sent_gifts(email: str):
    """Get gifts sent by a user email."""
    db = get_db()
    # In a real app, you'd want to protect this with auth
    gifts = await db.gifts.find(
        {"sender_email": email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return gifts


@router.get("/gifts/by-email/received")
async def get_received_gifts(email: str):
    """Get gifts received by a user email."""
    db = get_db()
    gifts = await db.gifts.find(
        {"recipient_email": email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return gifts
