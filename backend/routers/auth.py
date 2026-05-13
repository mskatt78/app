"""Authentication routes for Google OAuth and Email/Password."""
from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import uuid
import logging
from typing import Optional

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

# ============ HELPERS ============

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
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


def _build_session(user_id: str, days: int, session_token: Optional[str] = None) -> dict:
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


async def _fetch_emergent_session_user(session_id: str) -> dict:
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
async def create_session(data: SessionCreate, response: Response):
    """Create or update user session from Emergent Google OAuth."""
    db = get_db()
    google_user = await _fetch_emergent_session_user(data.session_id)
    
    # Extract user data from Emergent response
    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0] if email else "User")
    picture = google_user.get("picture")
    emergent_session_token = google_user.get("session_token")
    
    if not email:
        raise HTTPException(status_code=400, detail="Invalid user data from Google")
    
    user_id = await _upsert_google_user(db, email, name, picture)
    
    # Create session in our database
    session = _build_session(user_id, days=7, session_token=emergent_session_token)
    
    # Remove old sessions for this user and insert new one
    await db.sessions.delete_many({"user_id": user_id})
    await db.sessions.insert_one(session)
    _set_session_cookie(response, session["session_token"], days=7)
    
    # Get user data to return
    user_data = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {
        "user": {
            "user_id": user_data["user_id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture")
        }
    }

@router.post("/google")
async def google_auth(request: Request, response: Response):
    """Handle Google OAuth callback - create/update user and session."""
    db = get_db()
    
    data = await request.json()
    google_user = data.get("user", {})
    
    if not google_user.get("email"):
        raise HTTPException(status_code=400, detail="Invalid Google user data")
    
    user_id = google_user.get("id") or google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name", email.split("@")[0])
    picture = google_user.get("picture")
    
    user_id = await _upsert_google_user(db, email, name, picture, fallback_user_id=user_id)
    session = _build_session(user_id, days=30)
    await db.sessions.insert_one(session)
    _set_session_cookie(response, session["session_token"], days=30)
    
    return {
        "user": {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture
        },
        "session_token": session["session_token"]
    }

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user info."""
    return user

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user and clear session."""
    db = get_db()
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token")
    return {"message": "Logged out successfully"}

# ============ EMAIL/PASSWORD AUTH ============

@router.post("/register")
async def register_user(data: UserRegister, response: Response):
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
async def login_user(data: UserLogin, response: Response):
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
