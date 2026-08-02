"""Authentication routes for Google OAuth and Email/Password."""
from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import uuid
import logging
from typing import Any, Optional

from .dependencies import get_db, get_current_user, User

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# ============ MODELS ============

class SessionCreate(BaseModel):
    session_id: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str


class GoogleUserPayload(BaseModel):
    id: Optional[str] = None
    sub: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None


class GoogleAuthPayload(BaseModel):
    user: GoogleUserPayload = Field(default_factory=GoogleUserPayload)

# ============ HELPERS ============

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hash password with salt."""
    if not salt:
        salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return password_hash, salt

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """Verify password against hash."""
    computed_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return computed_hash == password_hash


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _resolve_display_name(email: str, name: Optional[str]) -> str:
    return name or email.split("@")[0]


def _build_session(user_id: str, days: int, session_token: Optional[str] = None) -> dict[str, str]:
    token = session_token or secrets.token_urlsafe(32)
    return {
        "session_token": token,
        "user_id": user_id,
        "created_at": _now_iso(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=days)).isoformat(),
    }


def _set_session_cookie(response: Response, session_token: str, days: int) -> None:
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=days * 24 * 60 * 60,
    )


async def _upsert_google_user(db, email: str, name: str, picture: Optional[str], fallback_user_id: Optional[str] = None) -> str:
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    if existing_user:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture, "last_login": _now_iso()}},
        )
        return existing_user["user_id"]

    user_id = fallback_user_id or f"user_{uuid.uuid4().hex[:12]}"
    await db.users.insert_one(
        {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "auth_type": "google",
            "created_at": _now_iso(),
            "last_login": _now_iso(),
        }
    )
    return user_id


def _extract_emergent_profile(google_user: dict[str, Any]) -> tuple[str, str, Optional[str], Optional[str]]:
    email = google_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid user data from Google")

    name = _resolve_display_name(email, google_user.get("name"))
    picture = google_user.get("picture")
    emergent_session_token = google_user.get("session_token")
    return email, name, picture, emergent_session_token


def _extract_google_payload(payload: GoogleAuthPayload) -> tuple[Optional[str], str, str, Optional[str]]:
    email = payload.user.email
    if not email:
        raise HTTPException(status_code=400, detail="Invalid Google user data")

    source_user_id = payload.user.id or payload.user.sub
    name = _resolve_display_name(email, payload.user.name)
    picture = payload.user.picture
    return source_user_id, email, name, picture


async def _store_session(db, user_id: str, session: dict[str, str], replace_existing: bool = False) -> None:
    if replace_existing:
        await db.sessions.delete_many({"user_id": user_id})
    await db.sessions.insert_one(session)


def _public_user_payload(user_data: dict[str, Any]) -> dict[str, Optional[str]]:
    return {
        "user_id": user_data.get("user_id"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
    }


async def _fetch_public_user_by_id(db, user_id: str) -> dict[str, Optional[str]]:
    user_data = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return _public_user_payload(user_data)


async def _fetch_emergent_session_user(session_id: str) -> dict[str, Any]:
    import httpx

    try:
        async with httpx.AsyncClient() as client:
            emergent_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0,
            )
            if emergent_response.status_code != 200:
                logger.error(f"Emergent auth failed: {emergent_response.text}")
                raise HTTPException(status_code=400, detail="Invalid session. Please sign in with Google.")
            return emergent_response.json()
    except httpx.RequestError as error:
        logger.error(f"Emergent auth request failed: {error}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")

# ============ GOOGLE OAUTH ROUTES ============

@router.post("/session")
async def create_session(data: SessionCreate, response: Response) -> dict[str, dict[str, Optional[str]]]:
    """Create or update user session from Emergent Google OAuth."""
    db = get_db()
    google_user = await _fetch_emergent_session_user(data.session_id)
    email, name, picture, emergent_session_token = _extract_emergent_profile(google_user)

    user_id = await _upsert_google_user(db, email, name, picture)

    session = _build_session(user_id, days=7, session_token=emergent_session_token)
    await _store_session(db, user_id, session, replace_existing=True)
    _set_session_cookie(response, session["session_token"], days=7)

    return {"user": await _fetch_public_user_by_id(db, user_id)}

@router.post("/google")
async def google_auth(payload: GoogleAuthPayload, response: Response) -> dict[str, Any]:
    """Handle Google OAuth callback - create/update user and session."""
    db = get_db()

    source_user_id, email, name, picture = _extract_google_payload(payload)
    user_id = await _upsert_google_user(db, email, name, picture, fallback_user_id=source_user_id)
    session = _build_session(user_id, days=30)
    await _store_session(db, user_id, session)
    _set_session_cookie(response, session["session_token"], days=30)

    return {
        "user": _public_user_payload(
            {"user_id": user_id, "email": email, "name": name, "picture": picture}
        ),
        "session_token": session["session_token"]
    }

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)) -> User:
    """Get current user info."""
    return user


@router.get("/status")
async def get_auth_status(request: Request) -> dict[str, Any]:
    """Return session status without raising 401 for public-route checks."""
    db = get_db()
    session_token = request.cookies.get("session_token")
    if not session_token:
        return {"authenticated": False, "user": None}

    session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return {"authenticated": False, "user": None}

    expires_at = str(session.get("expires_at") or "").strip()
    if expires_at:
        try:
            expiry_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
            if expiry_dt <= datetime.now(timezone.utc):
                await db.sessions.delete_one({"session_token": session_token})
                return {"authenticated": False, "user": None}
        except ValueError:
            logger.warning("Invalid session expiry format encountered for auth status check")

    user_data = await db.users.find_one({"user_id": session.get("user_id")}, {"_id": 0})
    if not user_data:
        return {"authenticated": False, "user": None}

    return {"authenticated": True, "user": _public_user_payload(user_data)}

@router.post("/logout")
async def logout(request: Request, response: Response) -> dict[str, str]:
    """Logout user and clear session."""
    db = get_db()
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}

# ============ EMAIL/PASSWORD AUTH ============

@router.post("/register")
async def register_user(data: UserRegister, response: Response) -> dict[str, Any]:
    """Register a new user with email/password."""
    db = get_db()
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Hash password
    password_hash, salt = hash_password(data.password)
    
    # Create user
    user_id = str(uuid.uuid4())
    new_user = {
        "user_id": user_id,
        "email": data.email.lower(),
        "name": data.name,
        "password_hash": password_hash,
        "password_salt": salt,
        "auth_type": "email",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(new_user)
    
    # Create session
    session = _build_session(user_id, days=30)
    await db.sessions.insert_one(session)
    _set_session_cookie(response, session["session_token"], days=30)
    
    return {
        "user": {
            "user_id": user_id,
            "email": data.email.lower(),
            "name": data.name,
            "picture": None
        },
        "session_token": session["session_token"]
    }

@router.post("/login")
async def login_user(data: UserLogin, response: Response) -> dict[str, Any]:
    """Login user with email/password."""
    db = get_db()
    
    # Find user
    user = await db.users.find_one({"email": data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user has password (might be Google-only user)
    if not user.get("password_hash") or not user.get("password_salt"):
        raise HTTPException(status_code=401, detail="Please sign in with Google")
    
    # Verify password
    if not verify_password(data.password, user["password_hash"], user["password_salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create session
    session = _build_session(user["user_id"], days=30)
    await db.sessions.insert_one(session)
    _set_session_cookie(response, session["session_token"], days=30)
    
    return {
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture")
        },
        "session_token": session["session_token"]
    }
