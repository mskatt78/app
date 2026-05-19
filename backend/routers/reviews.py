"""Community Reviews router — users can submit star ratings and written reviews."""
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from typing import Any, Optional, List
from datetime import datetime, timezone
import logging

from routers.dependencies import get_db, get_current_user, User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reviews", tags=["reviews"])


# ── Models ──────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    text: str = Field(..., min_length=10, max_length=1000)
    practice_area: Optional[str] = None  # e.g. "Yoga", "Meditation", "Oracle"


class ReviewOut(BaseModel):
    review_id: str
    user_name: str
    initials: str
    rating: int
    text: str
    practice_area: Optional[str]
    created_at: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_initials(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return name[:2].upper() if name else "??"


def _doc_to_out(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "review_id": doc["review_id"],
        "user_name": doc["user_name"],
        "initials": doc["initials"],
        "rating": doc["rating"],
        "text": doc["text"],
        "practice_area": doc.get("practice_area"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc["created_at"], datetime) else doc["created_at"],
    }


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("", response_model=List[ReviewOut])
async def get_reviews(db: Any = Depends(get_db)) -> list[dict[str, Any]]:
    """Return all approved reviews, newest first."""
    cursor = db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).limit(100)
    docs = await cursor.to_list(length=100)
    return [_doc_to_out(d) for d in docs]


@router.get("/stats")
async def get_review_stats(db: Any = Depends(get_db)) -> dict[str, Any]:
    """Return average rating, total count, and breakdown by star."""
    cursor = db.reviews.find({"approved": True}, {"_id": 0, "rating": 1})
    docs = await cursor.to_list(length=1000)
    if not docs:
        return {"average": 0, "total": 0, "breakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}}
    
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total = len(docs)
    total_stars = 0
    for d in docs:
        r = d["rating"]
        breakdown[r] = breakdown.get(r, 0) + 1
        total_stars += r
    
    return {
        "average": round(total_stars / total, 1),
        "total": total,
        "breakdown": breakdown,
    }


@router.post("", response_model=ReviewOut)
async def create_review(
    body: ReviewCreate,
    request: Request,
    db: Any = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Submit a review. One review per user (updates if already submitted)."""
    import uuid

    existing = await db.reviews.find_one({"user_id": current_user.user_id})
    if existing:
        # Update existing review
        await db.reviews.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                "rating": body.rating,
                "text": body.text,
                "practice_area": body.practice_area,
                "updated_at": datetime.now(timezone.utc),
            }}
        )
        updated = await db.reviews.find_one({"user_id": current_user.user_id}, {"_id": 0})
        return _doc_to_out(updated)

    review_id = str(uuid.uuid4())
    doc = {
        "review_id": review_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "initials": _make_initials(current_user.name),
        "rating": body.rating,
        "text": body.text,
        "practice_area": body.practice_area,
        "approved": True,
        "created_at": datetime.now(timezone.utc),
    }
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    return _doc_to_out(doc)


@router.get("/my-review", response_model=Optional[ReviewOut])
async def get_my_review(
    request: Request,
    db: Any = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Optional[dict[str, Any]]:
    """Get the current user's review if it exists."""
    doc = await db.reviews.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not doc:
        return None
    return _doc_to_out(doc)
