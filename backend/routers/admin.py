"""Admin routes for content management."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import shutil
from pathlib import Path

from .dependencies import get_db, get_current_user, User

router = APIRouter(prefix="/admin", tags=["admin"])

# Upload directory
UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


# ============ MODELS ============

class PresetRitualCreate(BaseModel):
    name: str
    description: str
    element: str = "Spirit"
    image_url: Optional[str] = None
    segments: List[dict] = []


class RetreatCreate(BaseModel):
    name: str
    description: str
    location: str
    start_date: str
    end_date: str
    price: float
    currency: str = "USD"
    capacity: int = 20
    image_url: Optional[str] = None
    features: List[str] = []
    includes: List[str] = []
    element: str = "Spirit"


class BookCreate(BaseModel):
    title: str
    author: str
    description: str
    price: float
    currency: str = "USD"
    image_url: Optional[str] = None
    purchase_url: Optional[str] = None
    chapters: List[dict] = []
    testimonials: List[dict] = []


class CustomOracleCardCreate(BaseModel):
    name: str
    element: str
    meaning: str
    reversed_meaning: str
    image_url: Optional[str] = None
    keywords: List[str] = []


class LiveSessionCreate(BaseModel):
    title: str
    description: str
    scheduled_at: str
    duration_minutes: int = 60
    platform: str = "zoom"  # zoom, youtube, etc.
    join_url: Optional[str] = None
    price: float = 0
    currency: str = "USD"
    max_participants: Optional[int] = None
    element: str = "Spirit"


class YogaPoseCreate(BaseModel):
    name: str
    sanskrit_name: Optional[str] = None
    element: str
    description: str
    benefits: List[str] = []
    chakras: List[str] = []
    image_url: Optional[str] = None
    difficulty: str = "beginner"
    duration_minutes: int = 3
    instructions: List[str] = []


class CrystalCreate(BaseModel):
    name: str
    element: str
    chakras: List[str] = []
    properties: List[str] = []
    description: str
    image_url: Optional[str] = None
    pronunciation: Optional[str] = None
    frequency: Optional[int] = None
    note: Optional[str] = None
    music_recommendation: Optional[str] = None
    affirmation: Optional[str] = None


# ============ PRESET RITUALS ============

@router.post("/preset-rituals")
async def create_preset_ritual(ritual: PresetRitualCreate, current_user: User = Depends(get_current_user)):
    """Create a new preset ritual."""
    db = get_db()
    ritual_dict = ritual.model_dump()
    ritual_dict["id"] = str(uuid.uuid4())[:8]
    ritual_dict["created_by"] = current_user.user_id
    ritual_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.preset_rituals.insert_one(ritual_dict)
    ritual_dict.pop("_id", None)
    return {"message": "Preset ritual created successfully", "id": ritual_dict["id"], "data": ritual_dict}


@router.put("/preset-rituals/{ritual_id}")
async def update_preset_ritual(ritual_id: str, ritual: PresetRitualCreate, current_user: User = Depends(get_current_user)):
    """Update a preset ritual."""
    db = get_db()
    ritual_dict = ritual.model_dump()
    ritual_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.preset_rituals.update_one({"id": ritual_id}, {"$set": ritual_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Preset ritual not found")
    return {"message": "Preset ritual updated successfully"}


@router.delete("/preset-rituals/{ritual_id}")
async def delete_preset_ritual(ritual_id: str, current_user: User = Depends(get_current_user)):
    """Delete a preset ritual."""
    db = get_db()
    result = await db.preset_rituals.delete_one({"id": ritual_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preset ritual not found")
    return {"message": "Preset ritual deleted successfully"}


# ============ RETREATS ============

@router.post("/retreats")
async def create_retreat(retreat: RetreatCreate, current_user: User = Depends(get_current_user)):
    """Create a new retreat."""
    db = get_db()
    retreat_dict = retreat.model_dump()
    retreat_dict["id"] = str(uuid.uuid4())[:8]
    retreat_dict["created_by"] = current_user.user_id
    retreat_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    retreat_dict["registrations"] = []
    await db.retreats.insert_one(retreat_dict)
    retreat_dict.pop("_id", None)
    return {"message": "Retreat created successfully", "id": retreat_dict["id"], "data": retreat_dict}


@router.put("/retreats/{retreat_id}")
async def update_retreat(retreat_id: str, retreat: RetreatCreate, current_user: User = Depends(get_current_user)):
    """Update a retreat."""
    db = get_db()
    retreat_dict = retreat.model_dump()
    retreat_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.retreats.update_one({"id": retreat_id}, {"$set": retreat_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return {"message": "Retreat updated successfully"}


@router.delete("/retreats/{retreat_id}")
async def delete_retreat(retreat_id: str, current_user: User = Depends(get_current_user)):
    """Delete a retreat."""
    db = get_db()
    result = await db.retreats.delete_one({"id": retreat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return {"message": "Retreat deleted successfully"}


# ============ BOOKS ============

@router.post("/books")
async def create_book(book: BookCreate, current_user: User = Depends(get_current_user)):
    """Create a new book."""
    db = get_db()
    book_dict = book.model_dump()
    book_dict["id"] = str(uuid.uuid4())[:8]
    book_dict["created_by"] = current_user.user_id
    book_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.books.insert_one(book_dict)
    book_dict.pop("_id", None)
    return {"message": "Book created successfully", "id": book_dict["id"], "data": book_dict}


@router.put("/books/{book_id}")
async def update_book(book_id: str, book: BookCreate, current_user: User = Depends(get_current_user)):
    """Update a book."""
    db = get_db()
    book_dict = book.model_dump()
    book_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.books.update_one({"id": book_id}, {"$set": book_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book updated successfully"}


@router.delete("/books/{book_id}")
async def delete_book(book_id: str, current_user: User = Depends(get_current_user)):
    """Delete a book."""
    db = get_db()
    result = await db.books.delete_one({"id": book_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return {"message": "Book deleted successfully"}


# ============ CUSTOM ORACLE CARDS ============

@router.post("/custom-oracle-cards")
async def create_custom_oracle_card(card: CustomOracleCardCreate, current_user: User = Depends(get_current_user)):
    """Create a custom oracle card."""
    db = get_db()
    card_dict = card.model_dump()
    card_dict["id"] = str(uuid.uuid4())[:8]
    card_dict["created_by"] = current_user.user_id
    card_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.custom_oracle_cards.insert_one(card_dict)
    card_dict.pop("_id", None)
    return {"message": "Oracle card created successfully", "id": card_dict["id"], "data": card_dict}


@router.put("/custom-oracle-cards/{card_id}")
async def update_custom_oracle_card(card_id: str, card: CustomOracleCardCreate, current_user: User = Depends(get_current_user)):
    """Update a custom oracle card."""
    db = get_db()
    card_dict = card.model_dump()
    card_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.custom_oracle_cards.update_one({"id": card_id}, {"$set": card_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Oracle card not found")
    return {"message": "Oracle card updated successfully"}


@router.delete("/custom-oracle-cards/{card_id}")
async def delete_custom_oracle_card(card_id: str, current_user: User = Depends(get_current_user)):
    """Delete a custom oracle card."""
    db = get_db()
    result = await db.custom_oracle_cards.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Oracle card not found")
    return {"message": "Oracle card deleted successfully"}


# ============ LIVE SESSIONS ============

@router.post("/live-sessions")
async def create_live_session(session: LiveSessionCreate, current_user: User = Depends(get_current_user)):
    """Create a live session."""
    db = get_db()
    session_dict = session.model_dump()
    session_dict["id"] = str(uuid.uuid4())[:8]
    session_dict["created_by"] = current_user.user_id
    session_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    session_dict["participants"] = []
    await db.live_sessions.insert_one(session_dict)
    session_dict.pop("_id", None)
    return {"message": "Live session created successfully", "id": session_dict["id"], "data": session_dict}


@router.put("/live-sessions/{session_id}")
async def update_live_session(session_id: str, session: LiveSessionCreate, current_user: User = Depends(get_current_user)):
    """Update a live session."""
    db = get_db()
    session_dict = session.model_dump()
    session_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.live_sessions.update_one({"id": session_id}, {"$set": session_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Live session not found")
    return {"message": "Live session updated successfully"}


@router.delete("/live-sessions/{session_id}")
async def delete_live_session(session_id: str, current_user: User = Depends(get_current_user)):
    """Delete a live session."""
    db = get_db()
    result = await db.live_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Live session not found")
    return {"message": "Live session deleted successfully"}


# ============ YOGA POSES ============

@router.post("/yoga-poses")
async def create_yoga_pose(pose: YogaPoseCreate, current_user: User = Depends(get_current_user)):
    """Create a yoga pose."""
    db = get_db()
    pose_dict = pose.model_dump()
    pose_dict["id"] = str(uuid.uuid4())[:8]
    pose_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.yoga_poses.insert_one(pose_dict)
    pose_dict.pop("_id", None)
    return {"message": "Yoga pose created successfully", "id": pose_dict["id"], "data": pose_dict}


@router.put("/yoga-poses/{pose_id}")
async def update_yoga_pose(pose_id: str, pose: YogaPoseCreate, current_user: User = Depends(get_current_user)):
    """Update a yoga pose."""
    db = get_db()
    pose_dict = pose.model_dump()
    pose_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.yoga_poses.update_one({"id": pose_id}, {"$set": pose_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Yoga pose not found")
    return {"message": "Yoga pose updated successfully"}


@router.delete("/yoga-poses/{pose_id}")
async def delete_yoga_pose(pose_id: str, current_user: User = Depends(get_current_user)):
    """Delete a yoga pose."""
    db = get_db()
    result = await db.yoga_poses.delete_one({"id": pose_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Yoga pose not found")
    return {"message": "Yoga pose deleted successfully"}


# ============ CRYSTALS ============

@router.post("/crystals")
async def create_crystal(crystal: CrystalCreate, current_user: User = Depends(get_current_user)):
    """Create a crystal."""
    db = get_db()
    crystal_dict = crystal.model_dump()
    crystal_dict["id"] = str(uuid.uuid4())[:8]
    crystal_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.crystals.insert_one(crystal_dict)
    crystal_dict.pop("_id", None)
    return {"message": "Crystal created successfully", "id": crystal_dict["id"], "data": crystal_dict}


@router.put("/crystals/{crystal_id}")
async def update_crystal(crystal_id: str, crystal: CrystalCreate, current_user: User = Depends(get_current_user)):
    """Update a crystal."""
    db = get_db()
    crystal_dict = crystal.model_dump()
    crystal_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.crystals.update_one({"id": crystal_id}, {"$set": crystal_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return {"message": "Crystal updated successfully"}


@router.delete("/crystals/{crystal_id}")
async def delete_crystal(crystal_id: str, current_user: User = Depends(get_current_user)):
    """Delete a crystal."""
    db = get_db()
    result = await db.crystals.delete_one({"id": crystal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return {"message": "Crystal deleted successfully"}


# ============ FILE UPLOAD ============

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload a file (image, audio, etc.)."""
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    # Save file
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "message": "File uploaded successfully",
        "filename": filename,
        "url": f"/api/uploads/{filename}"
    }


# ============ PUBLIC CONTENT ENDPOINTS ============

@router.get("/retreats", tags=["public"])
async def get_retreats():
    """Get all retreats (public)."""
    db = get_db()
    retreats = await db.retreats.find({}, {"_id": 0}).sort("start_date", 1).to_list(50)
    return retreats


@router.get("/books", tags=["public"])
async def get_books():
    """Get all books (public)."""
    db = get_db()
    books = await db.books.find({}, {"_id": 0}).to_list(50)
    return books


@router.get("/custom-oracle-cards", tags=["public"])
async def get_custom_oracle_cards():
    """Get all custom oracle cards (public)."""
    db = get_db()
    cards = await db.custom_oracle_cards.find({}, {"_id": 0}).to_list(100)
    return cards


@router.get("/live-sessions", tags=["public"])
async def get_live_sessions(upcoming_only: bool = True):
    """Get live sessions (public)."""
    db = get_db()
    query = {}
    if upcoming_only:
        query["scheduled_at"] = {"$gte": datetime.now(timezone.utc).isoformat()}
    sessions = await db.live_sessions.find(query, {"_id": 0}).sort("scheduled_at", 1).to_list(50)
    return sessions
