"""Shared dependencies for all routers."""
from fastapi import Request, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime, timezone
import logging

# Configure logging
logger = logging.getLogger(__name__)

# MongoDB connection (initialized in main server.py)
db: Any = None

def set_db(database: Any) -> None:
    """Set the database instance from server.py"""
    global db
    db = database

def get_db() -> Any:
    """Get database instance"""
    global db
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return db

# ============ MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)."""
    database = get_db()
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Look up session
    session = await database.sessions.find_one({"session_token": session_token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Get user
    user_data = await database.users.find_one({"user_id": session["user_id"]})
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(
        user_id=user_data["user_id"],
        email=user_data["email"],
        name=user_data["name"],
        picture=user_data.get("picture"),
        created_at=user_data.get("created_at", datetime.now(timezone.utc))
    )
