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
}

COLLECTION_META = [
    {"id": "oracle_cards", "name": "Oracle Cards", "icon": "🔮"},
    {"id": "tarot_cards", "name": "Tarot Cards", "icon": "🃏"},
    {"id": "ancient_wisdom", "name": "Ancient Wisdom", "icon": "📿"},
    {"id": "somatic_practices", "name": "Somatic Practices", "icon": "🧘"},
    {"id": "sound_frequencies", "name": "Sound Frequencies", "icon": "🎵"},
    {"id": "crystals", "name": "Crystals", "icon": "💎"},
    {"id": "mantras", "name": "Mantras", "icon": "🕉️"},
    {"id": "meditations", "name": "Meditations", "icon": "🌙"},
    {"id": "mudras", "name": "Mudras", "icon": "🤲"},
    {"id": "runes", "name": "Runes", "icon": "ᚱ"},
    {"id": "sacred_guardians", "name": "Sacred Guardians", "icon": "🦁"},
    {"id": "retreats", "name": "Retreats", "icon": "🏔️"},
    {"id": "videos", "name": "Practice Videos", "icon": "🎬"},
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
