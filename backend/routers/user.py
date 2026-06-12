"""User routes for dashboard, favorites, practice history, rituals, journal, achievements."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import secrets
import logging

from .dependencies import get_db, get_current_user, User

router = APIRouter(tags=["user"])
logger = logging.getLogger(__name__)


# ============ MODELS ============

class FavoriteCreate(BaseModel):
    item_type: str  # "pose", "crystal", "mantra", "mudra", "breathwork", "somatic", "grounding"
    item_id: str


class PracticeLogCreate(BaseModel):
    practice_type: str  # "yoga", "breathwork", "meditation", "oracle", "elemental", etc.
    practice_id: Optional[str] = None
    duration_minutes: int
    notes: Optional[str] = None
    element: Optional[str] = None


class RitualCreate(BaseModel):
    name: str
    description: Optional[str] = None
    practices: List[dict]  # [{"type": "yoga", "id": "1", "duration": 5}, ...]
    total_duration: int


class RitualUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    practices: Optional[List[dict]] = None
    total_duration: Optional[int] = None


class ReminderSettings(BaseModel):
    enabled: bool = True
    time: str = "08:00"  # HH:MM format
    days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ritual_id: Optional[str] = None
    message: Optional[str] = None


class AccountDeletionRequest(BaseModel):
    reason: Optional[str] = None
    feedback: Optional[str] = None


class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None  # "peaceful", "energized", "grateful", "reflective", "challenged"
    practices_completed: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    journal_type: Optional[str] = "personal"  # "moon", "dream", "personal"
    moon_phase: Optional[str] = None  # For moon journal
    moon_intention: Optional[str] = None  # For moon journal
    dream_symbols: Optional[str] = None  # For dream journal


class UserMantraCreate(BaseModel):
    text: str
    category: Optional[str] = "personal"  # "healing", "abundance", "protection", "love", "personal"
    element: Optional[str] = None  # "earth", "water", "fire", "air", "spirit"
    notes: Optional[str] = None


class UserMantraUpdate(BaseModel):
    text: Optional[str] = None
    category: Optional[str] = None
    element: Optional[str] = None
    notes: Optional[str] = None


# ============ DASHBOARD ============

@router.get("/dashboard/daily")
async def get_daily_guidance(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get personalized daily guidance."""
    db = get_db()

    def secure_choice(items: list[Any]) -> Any:
        if not items:
            return None
        return items[secrets.randbelow(len(items))]
    
    try:
        context = await _fetch_daily_guidance_context(db, secure_choice)
        return _format_daily_guidance_response(user, context)
    except Exception as exc:
        return _handle_daily_guidance_error(user, exc)


async def _pick_daily_crystal(db: Any, secure_choice: Any) -> Optional[dict[str, Any]]:
    from .content import _resolve_crystal_image

    deep_crystals = await db.crystals_deep.find({}, {"_id": 0}).to_list(length=80)
    if deep_crystals:
        selected_crystal = secure_choice(deep_crystals)
        if not selected_crystal:
            return None
        return await _resolve_crystal_image(selected_crystal, db)

    fallback_crystals = await db.crystals.find({}, {"_id": 0}).to_list(length=50)
    return secure_choice(fallback_crystals)


def _default_yoga_sequence_of_day() -> dict[str, Any]:
    return {
        "id": "daily-yoga-sequence",
        "name": "Daily Nervous System Alignment Flow",
        "duration_minutes": 16,
        "poses": ["Mountain", "Cat-Cow", "Low Lunge", "Seated Twist", "Legs-Up-The-Wall"],
    }


def _default_sunrise_sunset_guidance() -> dict[str, list[str]]:
    return {
        "sunrise": [
            "Face first light for 3 deep breaths and set one embodied intention.",
            "Hydrate before caffeine and journal one body sensation.",
            "Move through a 5-minute spinal wake-up sequence.",
        ],
        "sunset": [
            "Dim bright light 45 minutes before sleep prep.",
            "Complete one gratitude + release journal line.",
            "Use a 4-6 breath cycle for parasympathetic downshift.",
        ],
    }


async def _fetch_daily_guidance_context(db: Any, secure_choice: Any) -> dict[str, Any]:
    from .numerology import get_current_month

    current_month = await get_current_month()
    yoga_poses = await db.yoga_poses.find({}, {"_id": 0}).to_list(length=100)
    mantras = await db.mantras.find({}, {"_id": 0}).to_list(length=50)
    breathwork_sessions = await db.breathwork_sessions.find({}, {"_id": 0}).to_list(length=20)

    return {
        "current_moon": current_month,
        "daily_pose": secure_choice(yoga_poses),
        "daily_crystal": await _pick_daily_crystal(db, secure_choice),
        "daily_mantra": secure_choice(mantras),
        "daily_breathwork": secure_choice(breathwork_sessions),
        "yoga_sequence_of_day": _default_yoga_sequence_of_day(),
        "sunrise_sunset_guidance": _default_sunrise_sunset_guidance(),
    }


def _format_daily_guidance_response(user: User, context: dict[str, Any]) -> dict[str, Any]:
    current_moon = context.get("current_moon")
    first_name = user.name.split()[0] if user.name else "Beloved"
    return {
        "greeting": f"Blessed day, {first_name}",
        "current_moon": current_moon,
        "daily_pose": context.get("daily_pose"),
        "daily_crystal": context.get("daily_crystal"),
        "daily_mantra": context.get("daily_mantra"),
        "daily_breathwork": context.get("daily_breathwork"),
        "yoga_sequence_of_day": context.get("yoga_sequence_of_day"),
        "sunrise_sunset_guidance": context.get("sunrise_sunset_guidance"),
        "element_focus": current_moon["element"] if current_moon else "Spirit",
    }


def _handle_daily_guidance_error(user: User, exc: Exception) -> dict[str, Any]:
    logger.exception("Failed to build daily guidance for user %s", user.user_id)
    fallback_name = user.name.split()[0] if user.name else "Beloved"
    return {
        "greeting": f"Blessed day, {fallback_name}",
        "current_moon": None,
        "daily_pose": None,
        "daily_crystal": None,
        "daily_mantra": None,
        "daily_breathwork": None,
        "yoga_sequence_of_day": _default_yoga_sequence_of_day(),
        "sunrise_sunset_guidance": _default_sunrise_sunset_guidance(),
        "element_focus": "Spirit",
    }


# ============ FAVORITES ============

@router.post("/favorites")
async def add_favorite(data: FavoriteCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Add an item to user's favorites."""
    db = get_db()
    existing = await db.favorites.find_one({
        "user_id": user.user_id,
        "item_type": data.item_type,
        "item_id": data.item_id
    })
    
    if existing:
        return {"message": "Already in favorites", "favorite_id": existing.get("favorite_id")}
    
    favorite = {
        "favorite_id": f"fav_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "item_type": data.item_type,
        "item_id": data.item_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.favorites.insert_one(favorite)
    favorite.pop("_id", None)
    return favorite


@router.delete("/favorites/{item_type}/{item_id}")
async def remove_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Remove an item from user's favorites."""
    db = get_db()
    result = await db.favorites.delete_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}


@router.get("/favorites")
async def get_favorites(user: User = Depends(get_current_user), item_type: Optional[str] = None) -> list[dict[str, Any]]:
    """Get user's favorites, optionally filtered by type."""
    db = get_db()
    query = {"user_id": user.user_id}
    if item_type:
        query["item_type"] = item_type

    favorites = await db.favorites.find(query, {"_id": 0}).to_list(500)

    ids_by_type: dict[str, list[str]] = {}
    for favorite in favorites:
        ids_by_type.setdefault(favorite["item_type"], []).append(favorite["item_id"])

    collection_map = {
        "pose": "yoga_poses",
        "crystal": "crystals",
        "mantra": "mantras",
        "mudra": "mudras",
        "breathwork": "breathwork_sessions",
        "somatic": "somatic_practices",
        "grounding": "grounding_exercises",
    }

    items_cache: dict[str, dict[str, Any]] = {}
    for favorite_type, ids in ids_by_type.items():
        collection_name = collection_map.get(favorite_type)
        if not collection_name:
            continue

        records = await db[collection_name].find({"id": {"$in": ids}}, {"_id": 0}).to_list(None)
        items_cache[favorite_type] = {record["id"]: record for record in records if record.get("id")}

    enriched = []
    for favorite in favorites:
        item_data = items_cache.get(favorite["item_type"], {}).get(favorite["item_id"])
        if item_data:
            enriched.append({**favorite, "item": item_data})

    return enriched


@router.get("/favorites/check/{item_type}/{item_id}")
async def check_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)) -> dict[str, bool]:
    """Check if an item is in user's favorites."""
    db = get_db()
    existing = await db.favorites.find_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    }, {"_id": 0})
    
    return {"is_favorite": existing is not None}


# ============ PRACTICE HISTORY ============

@router.post("/practice-history")
async def log_practice(data: PracticeLogCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Log a completed practice."""
    db = get_db()
    log_entry = {
        "log_id": f"log_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "practice_type": data.practice_type,
        "practice_id": data.practice_id,
        "duration_minutes": data.duration_minutes,
        "notes": data.notes,
        "element": data.element,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.practice_history.insert_one(log_entry)
    log_entry.pop("_id", None)
    return log_entry


@router.get("/practice-history")
async def get_practice_history(
    user: User = Depends(get_current_user),
    practice_type: Optional[str] = None,
    limit: int = 50
) -> list[dict[str, Any]]:
    """Get user's practice history."""
    db = get_db()
    query = {"user_id": user.user_id}
    if practice_type:
        query["practice_type"] = practice_type
    
    history = await db.practice_history.find(query, {"_id": 0}).sort("completed_at", -1).to_list(limit)
    return history


@router.get("/practice-history/stats")
async def get_practice_stats(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get user's practice statistics."""
    db = get_db()
    # Get all practice history for this user
    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    total_sessions = len(history)
    total_minutes = sum(h.get("duration_minutes", 0) for h in history)
    
    # Count by type
    by_type: dict[str, dict[str, int]] = {}
    for h in history:
        ptype = h.get("practice_type", "unknown")
        if ptype not in by_type:
            by_type[ptype] = {"count": 0, "minutes": 0}
        by_type[ptype]["count"] += 1
        by_type[ptype]["minutes"] += h.get("duration_minutes", 0)
    
    # Get streak (consecutive days)
    if history:
        dates = sorted(set(h.get("completed_at", "")[:10] for h in history if h.get("completed_at")), reverse=True)
        streak = 0
        for i, date in enumerate(dates):
            expected = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
            if date == expected or (i == 0 and date == (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")):
                streak += 1
            else:
                break
    else:
        streak = 0
    
    return {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "by_type": by_type,
        "current_streak": streak
    }


# ============ RITUALS ============

@router.post("/rituals")
async def create_ritual(data: RitualCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a custom daily ritual."""
    db = get_db()
    ritual = {
        "ritual_id": f"ritual_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": data.name,
        "description": data.description,
        "practices": data.practices,
        "total_duration": data.total_duration,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.rituals.insert_one(ritual)
    ritual.pop("_id", None)
    return ritual


@router.get("/rituals")
async def get_rituals(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's custom rituals."""
    db = get_db()
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return rituals


@router.get("/rituals/{ritual_id}")
async def get_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get a specific ritual."""
    db = get_db()
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return ritual


@router.put("/rituals/{ritual_id}")
async def update_ritual(ritual_id: str, data: RitualUpdate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Update a ritual."""
    db = get_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.rituals.update_one(
        {"ritual_id": ritual_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    return await get_ritual(ritual_id, user)


@router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a ritual."""
    db = get_db()
    result = await db.rituals.delete_one({"ritual_id": ritual_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return {"message": "Ritual deleted"}


# ============ RITUAL SHARING ============

@router.post("/rituals/{ritual_id}/share")
async def share_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Generate a shareable link for a ritual."""
    db = get_db()
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    share_code = f"share_{uuid.uuid4().hex[:8]}"
    
    shared = {
        "share_code": share_code,
        "ritual_id": ritual_id,
        "original_user_id": user.user_id,
        "ritual_data": {
            "name": ritual["name"],
            "description": ritual.get("description"),
            "practices": ritual["practices"],
            "total_duration": ritual["total_duration"],
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "copy_count": 0
    }
    
    await db.shared_rituals.insert_one(shared)
    shared.pop("_id", None)
    
    return {"share_code": share_code, "share_url": f"/rituals/shared/{share_code}"}


@router.get("/rituals/shared/{share_code}")
async def get_shared_ritual(share_code: str) -> dict[str, Any]:
    """Get a shared ritual by share code (no auth required)."""
    db = get_db()
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    return shared


@router.post("/rituals/shared/{share_code}/copy")
async def copy_shared_ritual(share_code: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Copy a shared ritual to user's own rituals."""
    db = get_db()
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    
    ritual_data = shared["ritual_data"]
    new_ritual = {
        "ritual_id": f"ritual_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": f"{ritual_data['name']} (copied)",
        "description": ritual_data.get("description"),
        "practices": ritual_data["practices"],
        "total_duration": ritual_data["total_duration"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "copied_from": share_code
    }
    
    await db.rituals.insert_one(new_ritual)
    await db.shared_rituals.update_one(
        {"share_code": share_code},
        {"$inc": {"copy_count": 1}}
    )
    
    new_ritual.pop("_id", None)
    return new_ritual


# ============ REMINDERS ============

@router.get("/settings/reminders")
async def get_reminder_settings(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get user's reminder settings."""
    db = get_db()
    settings = await db.reminder_settings.find_one({"user_id": user.user_id}, {"_id": 0})
    if not settings:
        return {
            "user_id": user.user_id,
            "enabled": False,
            "time": "08:00",
            "days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            "ritual_id": None,
            "message": "Time for your sacred practice"
        }
    return settings


# ============ ACCOUNT MANAGEMENT ============

@router.get("/account/export")
async def export_account_data(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Export a user's core account data for privacy/compliance needs."""
    db = get_db()

    reminders = await db.reminder_settings.find_one({"user_id": user.user_id}, {"_id": 0})
    favorites = await db.favorites.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    practice_history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).sort("completed_at", -1).to_list(1000)
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    journal_entries = await db.journal.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    custom_mantras = await db.user_mantras.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    purchases = await db.user_purchases.find({"user_id": user.user_id}, {"_id": 0}).sort("purchased_at", -1).to_list(200)
    deletion_status = await db.account_deletion_requests.find_one({"user_id": user.user_id}, {"_id": 0}, sort=[("requested_at", -1)])

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "profile": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
            "provider": getattr(user, "provider", "email"),
            "created_at": user.created_at,
        },
        "reminder_settings": reminders,
        "favorites": favorites,
        "practice_history": practice_history,
        "rituals": rituals,
        "journal_entries": journal_entries,
        "custom_mantras": custom_mantras,
        "purchases": purchases,
        "latest_account_deletion_request": deletion_status,
    }


@router.get("/account/deletion-status")
async def get_account_deletion_status(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get the latest account deletion request status for the signed-in user."""
    db = get_db()
    latest = await db.account_deletion_requests.find_one({"user_id": user.user_id}, {"_id": 0}, sort=[("requested_at", -1)])
    return latest or {
        "status": "none",
        "message": "No account deletion request has been submitted.",
    }


@router.post("/account/delete-request")
async def request_account_deletion(data: AccountDeletionRequest, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create or refresh an account deletion request for compliance flows."""
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    request_record = {
        "request_id": f"delete_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "reason": data.reason,
        "feedback": data.feedback,
        "status": "requested",
        "requested_at": now,
        "updated_at": now,
    }
    await db.account_deletion_requests.insert_one(request_record.copy())
    return {
        "success": True,
        "status": "requested",
        "requested_at": now,
        "message": "Your deletion request has been received. We will review and process it from the admin dashboard.",
    }


@router.put("/settings/reminders")
async def update_reminder_settings(data: ReminderSettings, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Update user's reminder settings."""
    db = get_db()
    settings = {
        "user_id": user.user_id,
        "enabled": data.enabled,
        "time": data.time,
        "days": data.days,
        "ritual_id": data.ritual_id,
        "message": data.message or "Time for your sacred practice",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reminder_settings.update_one(
        {"user_id": user.user_id},
        {"$set": settings},
        upsert=True
    )
    
    return settings


# ============ JOURNAL ============

@router.post("/journal")
async def create_journal_entry(data: JournalEntryCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a new journal entry."""
    db = get_db()
    entry = {
        "entry_id": f"journal_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "title": data.title,
        "content": data.content,
        "mood": data.mood,
        "practices_completed": data.practices_completed or [],
        "tags": data.tags or [],
        "journal_type": data.journal_type or "personal",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Add type-specific fields
    if data.journal_type == "moon":
        entry["moon_phase"] = data.moon_phase
        entry["moon_intention"] = data.moon_intention
    elif data.journal_type == "dream":
        entry["dream_symbols"] = data.dream_symbols
    
    await db.journal.insert_one(entry)
    entry.pop("_id", None)
    return entry


@router.get("/journal")
async def get_journal_entries(
    user: User = Depends(get_current_user),
    limit: int = 50,
    mood: Optional[str] = None,
    journal_type: Optional[str] = None
) -> list[dict[str, Any]]:
    """Get user's journal entries."""
    db = get_db()
    query = {"user_id": user.user_id}
    if mood:
        query["mood"] = mood
    if journal_type:
        query["journal_type"] = journal_type
    
    entries = await db.journal.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return entries


@router.get("/journal/{entry_id}")
async def get_journal_entry(entry_id: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get a specific journal entry."""
    db = get_db()
    entry = await db.journal.find_one({"entry_id": entry_id, "user_id": user.user_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a journal entry."""
    db = get_db()
    result = await db.journal.delete_one({"entry_id": entry_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Entry deleted"}


# ============ ACHIEVEMENTS ============

ACHIEVEMENT_DEFINITIONS: list[dict[str, Any]] = [
    {"id": "first_practice", "name": "First Steps", "description": "Complete your first practice", "icon": "footprints", "requirement": {"type": "sessions", "count": 1}},
    {"id": "week_warrior", "name": "Week Warrior", "description": "Maintain a 7-day practice streak", "icon": "flame", "requirement": {"type": "streak", "count": 7}},
    {"id": "moon_cycle", "name": "Moon Cycle", "description": "Practice for 28 consecutive days", "icon": "moon", "requirement": {"type": "streak", "count": 28}},
    {"id": "centurion", "name": "Centurion", "description": "Complete 100 practice sessions", "icon": "trophy", "requirement": {"type": "sessions", "count": 100}},
    {"id": "time_keeper", "name": "Time Keeper", "description": "Accumulate 100 minutes of practice", "icon": "clock", "requirement": {"type": "minutes", "count": 100}},
    {"id": "hour_master", "name": "Hour Master", "description": "Accumulate 10 hours (600 min) of practice", "icon": "hourglass", "requirement": {"type": "minutes", "count": 600}},
    {"id": "oracle_seeker", "name": "Oracle Seeker", "description": "Receive 10 oracle readings", "icon": "eye", "requirement": {"type": "oracle_readings", "count": 10}},
    {"id": "breath_master", "name": "Breath Master", "description": "Complete 20 breathwork sessions", "icon": "wind", "requirement": {"type": "breathwork", "count": 20}},
    {"id": "yogi", "name": "Yogi", "description": "Complete 50 yoga sessions", "icon": "leaf", "requirement": {"type": "yoga", "count": 50}},
    {"id": "five_elements", "name": "Five Elements", "description": "Practice with all five elements", "icon": "sparkles", "requirement": {"type": "elements", "count": 5}},
]


def _calculate_practice_streak(history: list[dict[str, Any]], reference: datetime | None = None) -> int:
    if not history:
        return 0

    now = reference or datetime.now(timezone.utc)
    dates = sorted(
        set(
            str(entry.get("completed_at", ""))[:10]
            for entry in history
            if entry.get("completed_at")
        ),
        reverse=True,
    )
    if not dates:
        return 0

    streak = 0
    for offset, date_str in enumerate(dates):
        expected_today = (now - timedelta(days=offset)).strftime("%Y-%m-%d")
        expected_yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        if date_str == expected_today or (offset == 0 and date_str == expected_yesterday):
            streak += 1
            continue
        break
    return streak


def _build_achievement_stats(
    history: list[dict[str, Any]],
    oracle_readings_count: int,
) -> dict[str, Any]:
    by_type: dict[str, int] = {}
    elements_practiced: set[str] = set()

    for entry in history:
        practice_type = str(entry.get("practice_type") or "unknown")
        by_type[practice_type] = by_type.get(practice_type, 0) + 1
        element = entry.get("element")
        if isinstance(element, str) and element:
            elements_practiced.add(element)

    return {
        "total_sessions": len(history),
        "total_minutes": sum(int(entry.get("duration_minutes") or 0) for entry in history),
        "streak": _calculate_practice_streak(history),
        "oracle_readings": oracle_readings_count,
        "by_type": by_type,
        "elements_count": len(elements_practiced),
    }


def _resolve_achievement_progress(requirement: dict[str, Any], stats: dict[str, Any]) -> tuple[int, bool]:
    requirement_type = requirement.get("type")
    target = int(requirement.get("count") or 0)

    progress_map: dict[str, int] = {
        "sessions": int(stats.get("total_sessions") or 0),
        "streak": int(stats.get("streak") or 0),
        "minutes": int(stats.get("total_minutes") or 0),
        "oracle_readings": int(stats.get("oracle_readings") or 0),
        "breathwork": int((stats.get("by_type") or {}).get("breathwork") or 0),
        "yoga": int((stats.get("by_type") or {}).get("yoga") or 0),
        "elements": int(stats.get("elements_count") or 0),
    }

    progress = progress_map.get(str(requirement_type), 0)
    return progress, progress >= target


def _compose_achievements_payload(stats: dict[str, Any]) -> list[dict[str, Any]]:
    achievements: list[dict[str, Any]] = []
    for achievement_definition in ACHIEVEMENT_DEFINITIONS:
        requirement = achievement_definition.get("requirement") or {}
        progress, unlocked = _resolve_achievement_progress(requirement, stats)
        achievements.append(
            {
                **achievement_definition,
                "unlocked": unlocked,
                "progress": progress,
                "target": int(requirement.get("count") or 0),
            }
        )
    return achievements


@router.get("/achievements")
async def get_achievements(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's achievements with unlock status."""
    db = get_db()

    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    oracle_readings = await db.oracle_readings.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)

    stats = _build_achievement_stats(history, len(oracle_readings))
    return _compose_achievements_payload(stats)



# ============ USER MANTRAS ============

@router.post("/mantras/custom")
async def create_user_mantra(data: UserMantraCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a custom mantra."""
    db = get_db()
    mantra = {
        "mantra_id": f"mantra_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "text": data.text,
        "category": data.category or "personal",
        "element": data.element,
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_mantras.insert_one(mantra)
    mantra.pop("_id", None)
    return mantra


@router.get("/mantras/custom")
async def get_user_mantras(
    user: User = Depends(get_current_user),
    category: Optional[str] = None
) -> list[dict[str, Any]]:
    """Get user's custom mantras."""
    db = get_db()
    query = {"user_id": user.user_id}
    if category:
        query["category"] = category
    
    mantras = await db.user_mantras.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return mantras


@router.put("/mantras/custom/{mantra_id}")
async def update_user_mantra(
    mantra_id: str, 
    data: UserMantraUpdate, 
    user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Update a custom mantra."""
    db = get_db()
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.user_mantras.update_one(
        {"mantra_id": mantra_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    
    mantra = await db.user_mantras.find_one(
        {"mantra_id": mantra_id, "user_id": user.user_id}, 
        {"_id": 0}
    )
    return mantra


@router.delete("/mantras/custom/{mantra_id}")
async def delete_user_mantra(mantra_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a custom mantra."""
    db = get_db()
    result = await db.user_mantras.delete_one({"mantra_id": mantra_id, "user_id": user.user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    
    return {"message": "Mantra deleted successfully"}
