import os
import uuid
import requests
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
JWT_SECRET = os.environ.get("EMERGENT_LLM_KEY", "admin-fallback-secret")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "shamanic-soul-temple"

_storage_key = None


def _init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def _get_object(path: str):
    key = _init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def _create_admin_token():
    secret = os.environ.get("EMERGENT_LLM_KEY", "admin-fallback-secret")
    payload = {
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def _verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    secret = os.environ.get("EMERGENT_LLM_KEY", "admin-fallback-secret")
    try:
        payload = jwt.decode(credentials.credentials, secret, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_db():
    from server import db
    return db


ALLOWED_COLLECTIONS = {
    "oracle_cards", "tarot_cards", "ancient_wisdom", "somatic_practices",
    "sound_frequencies", "crystals", "mantras", "meditations",
    "mudras", "runes", "sacred_guardians", "retreats", "videos",
    "courses", "breathwork_sessions", "shamanic_practices",
    "mindfulness_practices", "grounding_exercises", "heart_practices",
    "creative_processes", "elemental_practices", "yoga_poses",
    "community_posts", "sacred_geometry", "energy_healing",
    "free_form_movement", "chakra_cleansing",
}

COLLECTION_META = [
    {"id": "courses", "name": "Courses", "icon": "🎓"},
    {"id": "retreats", "name": "Retreats", "icon": "🏔️"},
    {"id": "videos", "name": "Practice Videos", "icon": "🎬"},
    {"id": "community_posts", "name": "Community Posts", "icon": "💬"},
    {"id": "meditations", "name": "Meditations", "icon": "🌙"},
    {"id": "breathwork_sessions", "name": "Breathwork Sessions", "icon": "🌬️"},
    {"id": "shamanic_practices", "name": "Shamanic Practices", "icon": "🥁"},
    {"id": "sound_frequencies", "name": "Sound Frequencies", "icon": "🎵"},
    {"id": "mindfulness_practices", "name": "Mindfulness Practices", "icon": "🧘"},
    {"id": "grounding_exercises", "name": "Grounding Exercises", "icon": "🌿"},
    {"id": "heart_practices", "name": "Heart Practices", "icon": "💚"},
    {"id": "somatic_practices", "name": "Somatic Practices", "icon": "🤸"},
    {"id": "elemental_practices", "name": "Elemental Practices", "icon": "🔥"},
    {"id": "creative_processes", "name": "Creative Processes", "icon": "🎨"},
    {"id": "yoga_poses", "name": "Yoga Poses", "icon": "🧘‍♀️"},
    {"id": "sacred_geometry", "name": "Sacred Geometry", "icon": "🔺"},
    {"id": "energy_healing", "name": "Energy Healing", "icon": "✨"},
    {"id": "free_form_movement", "name": "Free Form Movement", "icon": "💃"},
    {"id": "chakra_cleansing", "name": "Chakra Cleansing", "icon": "🌈"},
    {"id": "oracle_cards", "name": "Oracle Cards", "icon": "🔮"},
    {"id": "tarot_cards", "name": "Tarot Cards", "icon": "🃏"},
    {"id": "ancient_wisdom", "name": "Ancient Wisdom", "icon": "📿"},
    {"id": "crystals", "name": "Crystals", "icon": "💎"},
    {"id": "mantras", "name": "Mantras", "icon": "🕉️"},
    {"id": "mudras", "name": "Mudras", "icon": "🤲"},
    {"id": "runes", "name": "Runes", "icon": "ᚱ"},
    {"id": "sacred_guardians", "name": "Sacred Guardians", "icon": "🦁"},
    {"id": "audio_files", "name": "Audio Uploads", "icon": "🎧"},
]


class LoginRequest(BaseModel):
    password: str


@router.post("/login")
async def admin_login(data: LoginRequest):
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        raise HTTPException(status_code=500, detail="Admin password not configured")
    if data.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return {"token": _create_admin_token(), "role": "admin"}


@router.get("/collections")
async def get_collections(_: dict = Depends(_verify_admin)):
    db = get_db()
    result = []
    for meta in COLLECTION_META:
        if meta["id"] == "audio_files":
            count = await db.admin_audio.count_documents({"is_deleted": False})
        else:
            count = await db[meta["id"]].count_documents({})
        result.append({**meta, "count": count})
    return result


@router.get("/{collection}/items")
async def list_items(
    collection: str,
    page: int = 1,
    limit: int = 30,
    search: Optional[str] = None,
    _: dict = Depends(_verify_admin),
):
    db = get_db()
    if collection == "audio_files":
        query = {"is_deleted": False}
        if search:
            query["original_filename"] = {"$regex": search, "$options": "i"}
        items = await db.admin_audio.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).to_list(limit)
        total = await db.admin_audio.count_documents(query)
        return {"items": items, "total": total, "page": page, "limit": limit}

    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")

    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    items = await db[collection].find(query, {"_id": 0}).skip((page - 1) * limit).to_list(limit)
    total = await db[collection].count_documents(query)
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("/{collection}/items")
async def create_item(collection: str, data: dict, _: dict = Depends(_verify_admin)):
    db = get_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    if "id" not in data or not data["id"]:
        data["id"] = str(uuid.uuid4())[:8]
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    clean = {k: v for k, v in data.items() if k != "_id"}
    await db[collection].insert_one(clean.copy())
    return clean


@router.put("/{collection}/items/{item_id}")
async def update_item(collection: str, item_id: str, data: dict, _: dict = Depends(_verify_admin)):
    db = get_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    data.pop("_id", None)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db[collection].update_one({"id": item_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db[collection].find_one({"id": item_id}, {"_id": 0})
    return updated


@router.delete("/{collection}/items/{item_id}")
async def delete_item(collection: str, item_id: str, _: dict = Depends(_verify_admin)):
    db = get_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    result = await db[collection].delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    _: dict = Depends(_verify_admin),
):
    db = get_db()
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{file_id}.{ext}"

    data = await file.read()
    content_type = file.content_type or "application/octet-stream"

    result = _put_object(path, data, content_type)

    backend_url = os.environ.get("REACT_APP_BACKEND_URL", "")
    public_url = f"{backend_url}/api/admin/files/{path}"

    doc = {
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "public_url": public_url,
        "file_type": "audio" if content_type.startswith("audio") else "image",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    clean = {k: v for k, v in doc.items() if k != "_id"}
    await db.admin_audio.insert_one(clean.copy())
    return clean


@router.get("/files/{path:path}")
async def serve_file(path: str):
    """Public endpoint — serves uploaded files without auth for display."""
    try:
        data, content_type = _get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/audio_files/items/{file_id}")
async def delete_audio_file(file_id: str, _: dict = Depends(_verify_admin)):
    db = get_db()
    result = await db.admin_audio.update_one(
        {"id": file_id},
        {"$set": {"is_deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"deleted": True}


# ============ ADMIN DATABASE SEEDING ============

class SeedRequest(BaseModel):
    collections: list[str] = []  # Empty = seed all, or specific collection names
    force: bool = False  # If True, clear and reseed even if data exists


@router.post("/seed-database")
async def seed_database(request: SeedRequest, _: dict = Depends(_verify_admin)):
    """
    Admin endpoint to trigger database seeding.
    Can seed all collections or specific ones.
    Safe for production - runs in background with progress tracking.
    """
    import asyncio
    import logging
    
    logger = logging.getLogger(__name__)
    db = get_db()
    
    results = {"status": "started", "collections": {}, "errors": []}
    
    try:
        # Import all data modules
        from data.video_content import VIDEO_TUTORIALS
        from data.all_content import (
            CRYSTALS, MANTRAS, MUDRAS, BREATHWORK_SESSIONS,
            THIRTEEN_MONTH_CALENDAR, ORACLE_CARDS,
            GROUNDING_EXERCISES, MINDFULNESS_PRACTICES, MEDITATIONS
        )
        from data.somatic_practices import SOMATIC_PRACTICES
        from data.shamanic_content import (
            EARTH_ALTARS, HEART_PRACTICES,
            SHAMANIC_PRACTICES, ENHANCED_ACHIEVEMENTS, ELEMENTAL_PRACTICES
        )
        from data.divination_content import (
            ELDER_FUTHARK_RUNES, I_CHING_HEXAGRAMS, LIGHT_CODES
        )
        from data.creative_processes_deep import CREATIVE_PROCESSES_DEEP
        from data.yoga_poses import YOGA_POSES
        from data.tarot_cards import TAROT_MAJOR_ARCANA
        from data.sound_frequencies import SOUND_FREQUENCIES
        from data.guardians_content import SACRED_GUARDIANS
        from data.ancient_wisdom_content import ANCIENT_WISDOM
        from data.ancient_wisdom_extended import ANCIENT_WISDOM_EXTENDED
        from data.ancient_wisdom_final import ANCIENT_WISDOM_FINAL
        from data.ancient_wisdom_avalon import ANCIENT_WISDOM_AVALON
        from data.community_posts import COMMUNITY_POSTS
        from data.sacred_rites_deep import SACRED_RITES_DEEP
        from data.seed_healing_modalities import (
            ENERGY_HEALING_DATA, FREE_FORM_MOVEMENT_DATA, CHAKRA_CLEANSING_DATA
        )
        from data.seed_extended_modalities import EXTENDED_CHAKRAS, SOMATIC_YOGA_DATA
        from data.complete_embodiment_data import COMPLETE_FEMININE_EMBODIMENT, COMPLETE_MASCULINE_EMBODIMENT
        from data.elemental_temples_data import ELEMENTAL_TEMPLES
        from data.water_practices_data import WATER_PRACTICES
        
        # Define all seedable collections
        all_collections = {
            "videos": VIDEO_TUTORIALS,
            "crystals": CRYSTALS,
            "mantras": MANTRAS,
            "mudras": MUDRAS,
            "breathwork_sessions": BREATHWORK_SESSIONS,
            "astrology_months": THIRTEEN_MONTH_CALENDAR,
            "oracle_cards": ORACLE_CARDS,
            "grounding_exercises": GROUNDING_EXERCISES,
            "mindfulness_practices": MINDFULNESS_PRACTICES,
            "meditations": MEDITATIONS,
            "somatic_practices": SOMATIC_PRACTICES,
            "earth_altars": EARTH_ALTARS,
            "heart_practices": HEART_PRACTICES,
            "shamanic_practices": SHAMANIC_PRACTICES,
            "achievements": ENHANCED_ACHIEVEMENTS,
            "elemental_practices": ELEMENTAL_PRACTICES,
            "runes": ELDER_FUTHARK_RUNES,
            "i_ching": I_CHING_HEXAGRAMS,
            "creative_processes": CREATIVE_PROCESSES_DEEP,
            "yoga_poses": YOGA_POSES,
            "tarot_cards": TAROT_MAJOR_ARCANA,
            "sound_frequencies": SOUND_FREQUENCIES,
            "sacred_guardians": SACRED_GUARDIANS,
            "community_posts": COMMUNITY_POSTS,
            "energy_healing": ENERGY_HEALING_DATA,
            "free_form_movement": FREE_FORM_MOVEMENT_DATA,
            "somatic_yoga": SOMATIC_YOGA_DATA,
            "feminine_embodiment": COMPLETE_FEMININE_EMBODIMENT,
            "masculine_embodiment": COMPLETE_MASCULINE_EMBODIMENT,
            "elemental_temples": ELEMENTAL_TEMPLES,
            "water_practices": WATER_PRACTICES,
        }
        
        # Determine which collections to seed
        collections_to_seed = request.collections if request.collections else list(all_collections.keys())
        
        for collection_name in collections_to_seed:
            try:
                if collection_name not in all_collections:
                    results["errors"].append(f"Unknown collection: {collection_name}")
                    continue
                
                data = all_collections[collection_name]
                if not data:
                    results["collections"][collection_name] = {"status": "skipped", "reason": "no data"}
                    continue
                
                # Check if collection has data
                existing_count = await db[collection_name].count_documents({})
                
                if existing_count > 0 and not request.force:
                    results["collections"][collection_name] = {
                        "status": "skipped",
                        "reason": f"already has {existing_count} items (use force=true to overwrite)"
                    }
                    continue
                
                # Clear and seed
                await db[collection_name].delete_many({})
                await db[collection_name].insert_many(data)
                
                results["collections"][collection_name] = {
                    "status": "seeded",
                    "count": len(data)
                }
                logger.info(f"Admin seeded {collection_name}: {len(data)} items")
                
            except Exception as e:
                results["errors"].append(f"{collection_name}: {str(e)}")
                logger.error(f"Error seeding {collection_name}: {e}")
        
        # Handle special cases
        if "ancient_wisdom" in collections_to_seed or not request.collections:
            try:
                all_ancient_wisdom = ANCIENT_WISDOM + ANCIENT_WISDOM_EXTENDED + ANCIENT_WISDOM_FINAL + ANCIENT_WISDOM_AVALON
                existing = await db.ancient_wisdom.count_documents({})
                if existing == 0 or request.force:
                    await db.ancient_wisdom.delete_many({})
                    await db.ancient_wisdom.insert_many(all_ancient_wisdom)
                    results["collections"]["ancient_wisdom"] = {"status": "seeded", "count": len(all_ancient_wisdom)}
            except Exception as e:
                results["errors"].append(f"ancient_wisdom: {str(e)}")
        
        if "chakra_cleansing" in collections_to_seed or not request.collections:
            try:
                all_chakras = CHAKRA_CLEANSING_DATA + EXTENDED_CHAKRAS
                existing = await db.chakra_cleansing.count_documents({})
                if existing == 0 or request.force:
                    await db.chakra_cleansing.delete_many({})
                    await db.chakra_cleansing.insert_many(all_chakras)
                    results["collections"]["chakra_cleansing"] = {"status": "seeded", "count": len(all_chakras)}
            except Exception as e:
                results["errors"].append(f"chakra_cleansing: {str(e)}")
        
        if "light_codes" in collections_to_seed or not request.collections:
            try:
                existing = await db.light_codes.count_documents({})
                if existing == 0 or request.force:
                    await db.light_codes.delete_many({})
                    await db.light_codes.insert_one(LIGHT_CODES)
                    results["collections"]["light_codes"] = {"status": "seeded", "count": 1}
            except Exception as e:
                results["errors"].append(f"light_codes: {str(e)}")
        
        if "courses" in collections_to_seed or not request.collections:
            try:
                for rite_id, deep_data in SACRED_RITES_DEEP.items():
                    await db.courses.update_one({"id": rite_id}, {"$set": deep_data}, upsert=True)
                results["collections"]["courses"] = {"status": "seeded", "count": len(SACRED_RITES_DEEP)}
            except Exception as e:
                results["errors"].append(f"courses: {str(e)}")
        
        results["status"] = "completed"
        return results
        
    except Exception as e:
        logger.error(f"Admin seeding error: {e}")
        results["status"] = "error"
        results["errors"].append(str(e))
        return results


@router.get("/seed-status")
async def get_seed_status(_: dict = Depends(_verify_admin)):
    """Get current database seeding status - shows count of items in each collection."""
    db = get_db()
    
    collections_to_check = [
        "videos", "crystals", "mantras", "mudras", "breathwork_sessions",
        "oracle_cards", "grounding_exercises", "mindfulness_practices", "meditations",
        "somatic_practices", "shamanic_practices", "yoga_poses", "tarot_cards",
        "sound_frequencies", "sacred_guardians", "ancient_wisdom", "community_posts",
        "energy_healing", "chakra_cleansing", "feminine_embodiment", "masculine_embodiment",
        "courses", "elemental_temples", "water_practices", "runes", "i_ching"
    ]
    
    status = {}
    for collection in collections_to_check:
        try:
            count = await db[collection].count_documents({})
            status[collection] = count
        except Exception:
            status[collection] = 0
    
    return {"collections": status, "total_collections": len(status)}
