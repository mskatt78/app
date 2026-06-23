import os
import uuid
import requests
import re
from datetime import datetime, timezone, timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt

from .dependencies import User, get_current_user, get_db as get_router_db
from .content import YOGA_VERIFIED_IMAGE_OVERRIDES

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer(auto_error=False)

ADMIN_SESSION_COOKIE = "admin_session"
ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "shamanic-soul-temple"

_storage_key = None

SOURCE_AWARE_COLLECTIONS = {
    "courses",
    "meditations",
    "breathwork_sessions",
    "yoga_poses",
    "mantras",
    "mudras",
    "sacred_guardians",
    "ancient_wisdom",
    "shamanic_practices",
    "elemental_practices",
    "heart_practices",
    "sacred_ally_alchemy",
    "angelic_alchemy",
    "healing_portals",
}


def _normalize_yoga_pose_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).strip()


def _find_yoga_override(normalized_name: str) -> Optional[dict[str, Any]]:
    override = YOGA_VERIFIED_IMAGE_OVERRIDES.get(normalized_name)
    if override:
        return override
    for raw_key, raw_override in YOGA_VERIFIED_IMAGE_OVERRIDES.items():
        if _normalize_yoga_pose_key(raw_key) == normalized_name:
            return raw_override
    return None


def _merge_yoga_source_references(item_refs: Any, override_refs: Any) -> list[str]:
    merged_refs = _normalize_source_references(item_refs)
    for ref in _normalize_source_references(override_refs):
        if ref not in merged_refs:
            merged_refs.append(ref)
    return merged_refs


def _build_verified_yoga_admin_item(item: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    return {
        **item,
        "image_url": override.get("image_url") or item.get("image_url"),
        "source_references": _merge_yoga_source_references(item.get("source_references"), override.get("source_references")),
        "image_source": "wikimedia_commons_verified",
        "image_validation": {
            "status": "verified",
            "source_type": "wikimedia_commons",
            "score": 0.94,
            "verified_at": datetime.now(timezone.utc).isoformat(),
        },
    }


def _build_pending_yoga_admin_item(item: dict[str, Any], normalized_name: str) -> dict[str, Any]:
    difficulty = str(item.get("difficulty") or "").lower().strip()
    priority = "high" if difficulty in {"advanced", "intermediate"} else ("medium" if normalized_name.startswith("seated ") else "low")
    return {
        **item,
        "image_source": "pending_verification",
        "image_validation": {
            "status": "pending_review",
            "source_type": "awaiting_wikimedia_match",
            "priority": priority,
            "score": 0.0,
        },
    }


def _resolve_admin_yoga_verification(item: dict[str, Any]) -> dict[str, Any]:
    normalized_name = _normalize_yoga_pose_key(item.get("name", ""))
    override = _find_yoga_override(normalized_name)
    if override:
        return _build_verified_yoga_admin_item(item, override)
    return _build_pending_yoga_admin_item(item, normalized_name)


def _normalize_source_references(value: Any) -> list[str]:
    if isinstance(value, str):
        chunks = re.split(r"[\n,]", value)
    elif isinstance(value, list):
        chunks = value
    else:
        return []

    refs: list[str] = []
    seen: set[str] = set()
    for item in chunks:
        ref = str(item or "").strip()
        if not ref:
            continue
        if not (ref.startswith("http://") or ref.startswith("https://")):
            continue
        if ref in seen:
            continue
        seen.add(ref)
        refs.append(ref)
    return refs


def _normalize_admin_item_payload(collection: str, data: dict[str, Any]) -> dict[str, Any]:
    normalized = {k: v for k, v in data.items() if k != "_id"}

    if collection not in SOURCE_AWARE_COLLECTIONS:
        return normalized

    normalized["source_references"] = _normalize_source_references(normalized.get("source_references"))
    normalized["source_type"] = str(normalized.get("source_type") or "hybrid-curated")

    review_status = str(normalized.get("review_status") or "draft").strip().lower()
    normalized["review_status"] = review_status

    if review_status in {"reviewed", "verified", "approved"} and not normalized.get("last_reviewed_at"):
        normalized["last_reviewed_at"] = datetime.now(timezone.utc).isoformat()

    return normalized


def _init_storage() -> str:
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


def _get_object(path: str) -> tuple[bytes, str]:
    key = _init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def _create_admin_token() -> str:
    secret = os.environ["JWT_SECRET"]
    payload = {
        "role": "admin",
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def _set_admin_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ADMIN_SESSION_MAX_AGE_SECONDS,
        path="/",
    )


def _clear_admin_cookie(response: Response) -> None:
    response.delete_cookie(key=ADMIN_SESSION_COOKIE, path="/")


def _get_admin_emails() -> set[str]:
    raw = os.environ["ADMIN_EMAILS"]
    return {email.strip().lower() for email in raw.split(",") if email.strip()}


def _is_admin_email(email: str) -> bool:
    return email.strip().lower() in _get_admin_emails()


def _create_session_admin_token(user: User) -> str:
    secret = os.environ["JWT_SECRET"]
    payload = {
        "role": "admin",
        "email": user.email,
        "user_id": user.user_id,
        "name": user.name,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def _verify_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict[str, Any]:
    secret = os.environ["JWT_SECRET"]
    token = request.cookies.get(ADMIN_SESSION_COOKIE)
    if not token and credentials:
        token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Admin session required")

    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


ALLOWED_COLLECTIONS = {
    "oracle_cards", "tarot_cards", "ancient_wisdom", "somatic_practices",
    "sound_frequencies", "crystals", "mantras", "meditations",
    "mudras", "runes", "sacred_guardians", "retreats", "videos",
    "courses", "breathwork_sessions", "shamanic_practices",
    "mindfulness_practices", "grounding_exercises", "heart_practices",
    "creative_processes", "elemental_practices", "yoga_poses",
    "community_posts", "sacred_geometry", "energy_healing",
    "free_form_movement", "chakra_cleansing", "live_sessions",
    "astrology_months", "account_deletion_requests",
    "sacred_ally_alchemy", "angelic_alchemy", "healing_portals",
}

COLLECTION_META = [
    {"id": "courses", "name": "Courses", "icon": "🎓"},
    {"id": "astrology_months", "name": "13 Moon Paths", "icon": "🌕"},
    {"id": "retreats", "name": "Retreats", "icon": "🏔️"},
    {"id": "videos", "name": "Practice Videos", "icon": "🎬"},
    {"id": "live_sessions", "name": "Live Client Spaces", "icon": "📡"},
    {"id": "account_deletion_requests", "name": "Account Deletion Requests", "icon": "🗑️"},
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
    {"id": "sacred_ally_alchemy", "name": "Sacred Ally Alchemy", "icon": "🐉"},
    {"id": "angelic_alchemy", "name": "Angelic Alchemy", "icon": "🧿"},
    {"id": "healing_portals", "name": "Healing Portals", "icon": "🜂"},
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


@router.post("/session-login")
async def admin_session_login(response: Response, user: User = Depends(get_current_user)) -> dict[str, str]:
    if not _is_admin_email(user.email):
        raise HTTPException(status_code=403, detail="Admin access required")
    token = _create_session_admin_token(user)
    _set_admin_cookie(response, token)
    return {
        "session": "active",
        "role": "admin",
        "email": user.email,
        "name": user.name,
    }


@router.post("/login")
async def admin_login(data: LoginRequest, response: Response) -> dict[str, str]:
    admin_password = os.environ.get("ADMIN_PASSWORD")
    if not admin_password:
        raise HTTPException(status_code=500, detail="Admin password not configured")
    if data.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = _create_admin_token()
    _set_admin_cookie(response, token)
    return {"session": "active", "role": "admin"}


@router.post("/logout")
async def admin_logout(response: Response) -> dict[str, bool]:
    _clear_admin_cookie(response)
    return {"logged_out": True}


@router.get("/collections")
async def get_collections(_: dict[str, Any] = Depends(_verify_admin)) -> list[dict[str, Any]]:
    db = get_router_db()
    result = []
    for meta in COLLECTION_META:
        if meta["id"] == "audio_files":
            count = await db.admin_audio.count_documents({"is_deleted": False})
            result.append({**meta, "count": count})
            continue

        if meta["id"] == "yoga_poses":
            yoga_items = await db.yoga_poses.find({}, {"_id": 0, "name": 1, "difficulty": 1}).to_list(length=500)
            annotated = [_resolve_admin_yoga_verification(item) for item in yoga_items]
            verified_count = len([item for item in annotated if item.get("image_source") == "wikimedia_commons_verified"])
            pending_count = len([item for item in annotated if item.get("image_source") == "pending_verification"])
            result.append({
                **meta,
                "count": len(annotated),
                "verified_count": verified_count,
                "pending_count": pending_count,
            })
            continue

        count = await db[meta["id"]].count_documents({})
        result.append({**meta, "count": count})
    return result


@router.get("/{collection}/items")
async def list_items(
    collection: str,
    page: int = 1,
    limit: int = 30,
    search: Optional[str] = None,
    verification_status: Optional[str] = None,
    verification_priority: Optional[str] = None,
    _: dict[str, Any] = Depends(_verify_admin),
) -> dict[str, Any]:
    db = get_router_db()
    if collection == "audio_files":
        return await _list_audio_items(db, page=page, limit=limit, search=search)

    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")

    collection_query = _build_admin_collection_query(search)

    if collection == "yoga_poses":
        return await _list_yoga_items(
            db,
            collection_query=collection_query,
            page=page,
            limit=limit,
            verification_status=verification_status,
            verification_priority=verification_priority,
        )

    items = await db[collection].find(collection_query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).to_list(limit)
    total = await db[collection].count_documents(collection_query)
    return {"items": items, "total": total, "page": page, "limit": limit}


def _build_admin_collection_query(search: Optional[str]) -> dict[str, Any]:
    if not search:
        return {}
    return {
        "$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    }


async def _list_audio_items(db: Any, page: int, limit: int, search: Optional[str]) -> dict[str, Any]:
    query: dict[str, Any] = {"is_deleted": False}
    if search:
        query["original_filename"] = {"$regex": search, "$options": "i"}
    items = await db.admin_audio.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).to_list(limit)
    total = await db.admin_audio.count_documents(query)
    return {"items": items, "total": total, "page": page, "limit": limit}


def _filter_yoga_by_verification_status(items: list[dict[str, Any]], verification_status: Optional[str]) -> list[dict[str, Any]]:
    if not verification_status:
        return items
    normalized_status = verification_status.strip().lower()
    if normalized_status == "pending":
        return [item for item in items if item.get("image_source") == "pending_verification"]
    if normalized_status == "verified":
        return [item for item in items if item.get("image_source") == "wikimedia_commons_verified"]
    return items


def _filter_yoga_by_priority(items: list[dict[str, Any]], verification_priority: Optional[str]) -> list[dict[str, Any]]:
    if not verification_priority:
        return items
    normalized_priority = verification_priority.strip().lower()
    if normalized_priority not in {"high", "medium", "low"}:
        return items
    return [
        item
        for item in items
        if str(item.get("image_validation", {}).get("priority", "")).lower() == normalized_priority
    ]


def _paginate_items(items: list[dict[str, Any]], page: int, limit: int) -> list[dict[str, Any]]:
    start = (page - 1) * limit
    end = start + limit
    return items[start:end]


def _build_yoga_verification_summary(items: list[dict[str, Any]]) -> dict[str, int]:
    return {
        "verified": len([item for item in items if item.get("image_source") == "wikimedia_commons_verified"]),
        "pending": len([item for item in items if item.get("image_source") == "pending_verification"]),
    }


async def _list_yoga_items(
    db: Any,
    collection_query: dict[str, Any],
    page: int,
    limit: int,
    verification_status: Optional[str],
    verification_priority: Optional[str],
) -> dict[str, Any]:
    all_items = await db.yoga_poses.find(collection_query, {"_id": 0}).to_list(length=500)
    annotated_items = [_resolve_admin_yoga_verification(item) for item in all_items]
    annotated_items = _filter_yoga_by_verification_status(annotated_items, verification_status)
    annotated_items = _filter_yoga_by_priority(annotated_items, verification_priority)
    annotated_items.sort(key=lambda item: str(item.get("created_at") or ""), reverse=True)
    return {
        "items": _paginate_items(annotated_items, page=page, limit=limit),
        "total": len(annotated_items),
        "page": page,
        "limit": limit,
        "verification_summary": _build_yoga_verification_summary(annotated_items),
    }


@router.post("/{collection}/items")
async def create_item(collection: str, data: dict[str, Any], _: dict[str, Any] = Depends(_verify_admin)) -> dict[str, Any]:
    db = get_router_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    normalized = _normalize_admin_item_payload(collection, data)
    if "id" not in normalized or not normalized["id"]:
        normalized["id"] = str(uuid.uuid4())[:8]
    normalized["created_at"] = datetime.now(timezone.utc).isoformat()
    clean = normalized
    await db[collection].insert_one(clean.copy())
    return clean


@router.put("/{collection}/items/{item_id}")
async def update_item(collection: str, item_id: str, data: dict[str, Any], _: dict[str, Any] = Depends(_verify_admin)) -> dict[str, Any]:
    db = get_router_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    normalized = _normalize_admin_item_payload(collection, data)
    normalized["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db[collection].update_one({"id": item_id}, {"$set": normalized})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db[collection].find_one({"id": item_id}, {"_id": 0})
    return updated


@router.delete("/{collection}/items/{item_id}")
async def delete_item(collection: str, item_id: str, _: dict[str, Any] = Depends(_verify_admin)) -> dict[str, bool]:
    db = get_router_db()
    if collection not in ALLOWED_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Collection not allowed")
    result = await db[collection].delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": True}


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    _: dict[str, Any] = Depends(_verify_admin),
) -> dict[str, Any]:
    db = get_router_db()
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{file_id}.{ext}"

    data = await file.read()
    content_type = file.content_type or "application/octet-stream"

    result = _put_object(path, data, content_type)

    backend_url = os.environ.get("REACT_APP_BACKEND_URL")
    if not backend_url:
        raise RuntimeError("REACT_APP_BACKEND_URL is not configured")
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
async def serve_file(path: str) -> Response:
    """Public endpoint — serves uploaded files without auth for display."""
    try:
        data, content_type = _get_object(path)
        return Response(content=data, media_type=content_type)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/audio_files/managed/{file_id}")
async def delete_audio_file(file_id: str, _: dict[str, Any] = Depends(_verify_admin)) -> dict[str, bool]:
    db = get_router_db()
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


def _load_standard_seed_foundational_collections() -> dict[str, list[dict[str, Any]]]:
    from data.video_content import VIDEO_TUTORIALS
    from data.all_content import (
        CRYSTALS, MANTRAS, MUDRAS, BREATHWORK_SESSIONS,
        THIRTEEN_MONTH_CALENDAR, ORACLE_CARDS,
        GROUNDING_EXERCISES, MINDFULNESS_PRACTICES, MEDITATIONS,
    )
    from data.divination_content import ELDER_FUTHARK_RUNES, I_CHING_HEXAGRAMS
    from data.yoga_poses import YOGA_POSES
    from data.tarot_cards import TAROT_MAJOR_ARCANA

    return {
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
        "runes": ELDER_FUTHARK_RUNES,
        "i_ching": I_CHING_HEXAGRAMS,
        "yoga_poses": YOGA_POSES,
        "tarot_cards": TAROT_MAJOR_ARCANA,
    }


def _load_standard_seed_advanced_collections() -> dict[str, list[dict[str, Any]]]:
    from data.somatic_practices import SOMATIC_PRACTICES
    from data.shamanic_content import (
        EARTH_ALTARS, HEART_PRACTICES,
        SHAMANIC_PRACTICES, ENHANCED_ACHIEVEMENTS, ELEMENTAL_PRACTICES,
    )
    from data.creative_processes_deep import CREATIVE_PROCESSES_DEEP
    from data.sound_frequencies import SOUND_FREQUENCIES
    from data.guardians_content import SACRED_GUARDIANS
    from data.community_posts import COMMUNITY_POSTS
    from data.seed_healing_modalities import ENERGY_HEALING_DATA, FREE_FORM_MOVEMENT_DATA
    from data.seed_extended_modalities import SOMATIC_YOGA_DATA
    from data.complete_embodiment_data import COMPLETE_FEMININE_EMBODIMENT, COMPLETE_MASCULINE_EMBODIMENT
    from data.elemental_temples_data import ELEMENTAL_TEMPLES
    from data.water_practices_data import WATER_PRACTICES
    from data.sacred_ally_alchemy_content import SACRED_ALLY_ALCHEMY, ANGELIC_ALCHEMY
    from data.sacred_ally_alchemy_expansion import EXPANDED_SACRED_ALLY_ALCHEMY, EXPANDED_ANGELIC_ALCHEMY
    from data.healing_portals_content import HEALING_PORTALS

    return {
        "somatic_practices": SOMATIC_PRACTICES,
        "earth_altars": EARTH_ALTARS,
        "heart_practices": HEART_PRACTICES,
        "shamanic_practices": SHAMANIC_PRACTICES,
        "achievements": ENHANCED_ACHIEVEMENTS,
        "elemental_practices": ELEMENTAL_PRACTICES,
        "creative_processes": CREATIVE_PROCESSES_DEEP,
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
        "sacred_ally_alchemy": SACRED_ALLY_ALCHEMY + EXPANDED_SACRED_ALLY_ALCHEMY,
        "angelic_alchemy": ANGELIC_ALCHEMY + EXPANDED_ANGELIC_ALCHEMY,
        "healing_portals": HEALING_PORTALS,
    }


def _load_standard_seed_collections() -> dict[str, list[dict[str, Any]]]:
    return {
        **_load_standard_seed_foundational_collections(),
        **_load_standard_seed_advanced_collections(),
    }


def _load_special_seed_collections() -> tuple[dict[str, list[dict[str, Any]]], dict[str, dict[str, Any]]]:
    from data.ancient_wisdom_content import ANCIENT_WISDOM
    from data.ancient_wisdom_extended import ANCIENT_WISDOM_EXTENDED
    from data.ancient_wisdom_final import ANCIENT_WISDOM_FINAL
    from data.ancient_wisdom_avalon import ANCIENT_WISDOM_AVALON
    from data.divination_content import LIGHT_CODES
    from data.sacred_rites_deep import SACRED_RITES_DEEP
    from data.seed_healing_modalities import CHAKRA_CLEANSING_DATA
    from data.seed_extended_modalities import EXTENDED_CHAKRAS

    special_collections = {
        "ancient_wisdom": ANCIENT_WISDOM + ANCIENT_WISDOM_EXTENDED + ANCIENT_WISDOM_FINAL + ANCIENT_WISDOM_AVALON,
        "chakra_cleansing": CHAKRA_CLEANSING_DATA + EXTENDED_CHAKRAS,
        "light_codes": [LIGHT_CODES],
    }
    return special_collections, SACRED_RITES_DEEP


def _load_seed_payloads() -> tuple[dict[str, list[dict[str, Any]]], dict[str, list[dict[str, Any]]], dict[str, dict[str, Any]]]:
    standard_collections = _load_standard_seed_collections()
    special_collections, sacred_rites_payload = _load_special_seed_collections()

    return standard_collections, special_collections, sacred_rites_payload


async def _seed_single_collection(
    db,
    collection_name: str,
    payload: list[dict[str, Any]],
    force: bool,
    results: dict[str, Any],
    logger,
) -> None:
    if not payload:
        results["collections"][collection_name] = {"status": "skipped", "reason": "no data"}
        return

    existing_count = await db[collection_name].count_documents({})
    if existing_count > 0 and not force:
        results["collections"][collection_name] = {
            "status": "skipped",
            "reason": f"already has {existing_count} items (use force=true to overwrite)",
        }
        return

    await db[collection_name].delete_many({})
    await db[collection_name].insert_many(payload)
    results["collections"][collection_name] = {"status": "seeded", "count": len(payload)}
    logger.info(f"Admin seeded {collection_name}: {len(payload)} items")


async def _seed_standard_collections(
    db,
    collections_to_seed: list[str],
    standard_collections: dict[str, list[dict[str, Any]]],
    force: bool,
    results: dict[str, Any],
    logger,
) -> None:
    for collection_name in collections_to_seed:
        if collection_name not in standard_collections:
            results["errors"].append(f"Unknown collection: {collection_name}")
            continue

        try:
            await _seed_single_collection(
                db,
                collection_name,
                standard_collections[collection_name],
                force,
                results,
                logger,
            )
        except Exception as error:
            results["errors"].append(f"{collection_name}: {str(error)}")
            logger.error(f"Error seeding {collection_name}: {error}")


async def _seed_special_collections(
    db,
    collections_to_seed: list[str],
    special_collections: dict[str, list[dict[str, Any]]],
    force: bool,
    results: dict[str, Any],
    logger,
) -> None:
    for name, payload in special_collections.items():
        if name not in collections_to_seed:
            continue
        try:
            await _seed_single_collection(db, name, payload, force, results, logger)
        except Exception as error:
            results["errors"].append(f"{name}: {str(error)}")
            logger.error(f"Error seeding {name}: {error}")


async def _seed_courses_collection(
    db,
    collections_to_seed: list[str],
    courses_payload: dict[str, dict[str, Any]],
    results: dict[str, Any],
    logger,
) -> None:
    if "courses" not in collections_to_seed:
        return

    try:
        for rite_id, deep_data in courses_payload.items():
            await db.courses.update_one({"id": rite_id}, {"$set": deep_data}, upsert=True)
        results["collections"]["courses"] = {"status": "seeded", "count": len(courses_payload)}
        logger.info(f"Admin seeded courses: {len(courses_payload)} entries")
    except Exception as error:
        results["errors"].append(f"courses: {str(error)}")
        logger.error(f"Error seeding courses: {error}")


def _resolve_collections_to_seed(
    request: SeedRequest,
    standard_collections: dict[str, list[dict[str, Any]]],
    special_collections: dict[str, list[dict[str, Any]]],
) -> list[str]:
    if request.collections:
        return request.collections
    return [
        *list(standard_collections.keys()),
        *list(special_collections.keys()),
        "courses",
    ]


@router.post("/seed-database")
async def seed_database(request: SeedRequest, _: dict[str, Any] = Depends(_verify_admin)) -> dict[str, Any]:
    """
    Admin endpoint to trigger database seeding.
    Can seed all collections or specific ones.
    Safe for production - runs in background with progress tracking.
    """
    import logging

    logger = logging.getLogger(__name__)
    db = get_router_db()

    results: dict[str, Any] = {"status": "started", "collections": {}, "errors": []}

    try:
        standard_collections, special_collections, courses_payload = _load_seed_payloads()
        collections_to_seed = _resolve_collections_to_seed(request, standard_collections, special_collections)

        await _seed_standard_collections(
            db,
            collections_to_seed,
            standard_collections,
            request.force,
            results,
            logger,
        )
        await _seed_special_collections(
            db,
            collections_to_seed,
            special_collections,
            request.force,
            results,
            logger,
        )
        await _seed_courses_collection(db, collections_to_seed, courses_payload, results, logger)
        
        results["status"] = "completed"
        return results
        
    except Exception as e:
        logger.error(f"Admin seeding error: {e}")
        results["status"] = "error"
        results["errors"].append(str(e))
        return results


@router.get("/seed-status")
async def get_seed_status(_: dict[str, Any] = Depends(_verify_admin)) -> dict[str, Any]:
    """Get current database seeding status - shows count of items in each collection."""
    db = get_router_db()
    
    collections_to_check = [
        "videos", "crystals", "mantras", "mudras", "breathwork_sessions",
        "oracle_cards", "grounding_exercises", "mindfulness_practices", "meditations",
        "somatic_practices", "shamanic_practices", "yoga_poses", "tarot_cards",
        "sound_frequencies", "sacred_guardians", "ancient_wisdom", "community_posts",
        "energy_healing", "chakra_cleansing", "feminine_embodiment", "masculine_embodiment",
        "courses", "elemental_temples", "water_practices", "runes", "i_ching", "sacred_ally_alchemy", "angelic_alchemy", "healing_portals"
    ]
    
    status = {}
    for collection in collections_to_check:
        try:
            count = await db[collection].count_documents({})
            status[collection] = count
        except Exception:
            status[collection] = 0
    
    return {"collections": status, "total_collections": len(status)}
