from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import shutil

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    session_id: str

class OracleReadingRequest(BaseModel):
    question: Optional[str] = None
    spread_type: str = "single"  # single, three_card, celtic_cross

class OracleReading(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    question: Optional[str] = None
    spread_type: str
    cards: List[dict]
    interpretation: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class YogaPose(BaseModel):
    id: str
    name: str
    sanskrit_name: str
    element: str
    description: str
    benefits: List[str]
    chakras: List[str]
    image_url: Optional[str] = None
    duration_minutes: int = 3

class BreathworkSession(BaseModel):
    id: str
    name: str
    element: str
    description: str
    duration_minutes: int
    pattern: dict  # {"inhale": 4, "hold": 4, "exhale": 4, "hold_empty": 0}
    benefits: List[str]

class Crystal(BaseModel):
    id: str
    name: str
    element: str
    chakras: List[str]
    properties: List[str]
    description: str
    image_url: Optional[str] = None

class Mantra(BaseModel):
    id: str
    name: str
    sanskrit: Optional[str] = None
    translation: str
    element: str
    chakra: Optional[str] = None
    benefits: List[str]
    audio_url: Optional[str] = None

class Mudra(BaseModel):
    id: str
    name: str
    sanskrit_name: Optional[str] = None
    element: str
    description: str
    benefits: List[str]
    image_url: Optional[str] = None

class AstrologyMonth(BaseModel):
    id: str
    month_number: int
    name: str
    symbol: str
    element: str
    dates: str
    description: str
    themes: List[str]
    crystals: List[str]
    practices: List[str]

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)."""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ============ AUTH ROUTES ============

@api_router.post("/auth/session")
async def create_session(data: SessionCreate, response: Response):
    """Exchange session_id from Emergent Auth for a session token."""
    try:
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": data.session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session ID")
            
            auth_data = auth_response.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"email": auth_data["email"]},
                {"$set": {
                    "name": auth_data["name"],
                    "picture": auth_data.get("picture"),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            await db.users.insert_one({
                "user_id": user_id,
                "email": auth_data["email"],
                "name": auth_data["name"],
                "picture": auth_data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        session_token = auth_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        return user_doc
        
    except httpx.RequestError as e:
        logger.error(f"Auth request failed: {e}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable")

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session."""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ============ ORACLE ROUTES ============

ORACLE_CARDS = [
    {"id": "1", "name": "The Medicine Wheel", "element": "Spirit", "meaning": "Cycles, wholeness, sacred directions", "reversed_meaning": "Disconnection from nature's rhythms"},
    {"id": "2", "name": "The Drum", "element": "Earth", "meaning": "Heartbeat of Mother Earth, grounding", "reversed_meaning": "Loss of rhythm in life"},
    {"id": "3", "name": "Eagle Spirit", "element": "Air", "meaning": "Vision, freedom, divine perspective", "reversed_meaning": "Lack of clarity or direction"},
    {"id": "4", "name": "Bear Medicine", "element": "Earth", "meaning": "Introspection, healing, strength", "reversed_meaning": "Avoidance of necessary rest"},
    {"id": "5", "name": "Wolf Pack", "element": "Water", "meaning": "Community, loyalty, intuition", "reversed_meaning": "Isolation, trust issues"},
    {"id": "6", "name": "Serpent Wisdom", "element": "Fire", "meaning": "Transformation, kundalini, rebirth", "reversed_meaning": "Resistance to change"},
    {"id": "7", "name": "Owl Vision", "element": "Air", "meaning": "Truth, shadow work, night magic", "reversed_meaning": "Deception or self-delusion"},
    {"id": "8", "name": "Deer Spirit", "element": "Earth", "meaning": "Gentleness, grace, heart opening", "reversed_meaning": "Being too passive"},
    {"id": "9", "name": "Raven Messenger", "element": "Spirit", "meaning": "Magic, creation, transformation", "reversed_meaning": "Misuse of gifts"},
    {"id": "10", "name": "Butterfly Emergence", "element": "Air", "meaning": "Metamorphosis, joy, lightness", "reversed_meaning": "Stuck in cocoon phase"},
    {"id": "11", "name": "Thunder Being", "element": "Fire", "meaning": "Power, purification, awakening", "reversed_meaning": "Destructive anger"},
    {"id": "12", "name": "Moon Mother", "element": "Water", "meaning": "Intuition, cycles, feminine energy", "reversed_meaning": "Ignoring intuition"},
    {"id": "13", "name": "Sun Father", "element": "Fire", "meaning": "Vitality, clarity, masculine energy", "reversed_meaning": "Burnout, ego inflation"},
    {"id": "14", "name": "Turtle Island", "element": "Earth", "meaning": "Patience, grounding, Mother Earth", "reversed_meaning": "Moving too fast"},
    {"id": "15", "name": "Hummingbird Joy", "element": "Air", "meaning": "Presence, sweetness, adaptability", "reversed_meaning": "Scattered energy"},
    {"id": "16", "name": "Coyote Trickster", "element": "Fire", "meaning": "Humor, lessons, sacred foolishness", "reversed_meaning": "Taking life too seriously"},
    {"id": "17", "name": "Whale Dreamer", "element": "Water", "meaning": "Deep wisdom, ancient memories", "reversed_meaning": "Lost in the depths"},
    {"id": "18", "name": "Spider Weaver", "element": "Spirit", "meaning": "Creativity, fate, web of life", "reversed_meaning": "Feeling trapped"},
    {"id": "19", "name": "Jaguar Power", "element": "Earth", "meaning": "Courage, shadow integration, power", "reversed_meaning": "Fear of own power"},
    {"id": "20", "name": "Dragonfly Dreams", "element": "Water", "meaning": "Illusion, change, emotional depth", "reversed_meaning": "Surface living"},
    {"id": "21", "name": "Phoenix Rising", "element": "Fire", "meaning": "Rebirth, renewal, immortality", "reversed_meaning": "Clinging to the old"},
    {"id": "22", "name": "Star Nations", "element": "Spirit", "meaning": "Cosmic connection, star ancestors", "reversed_meaning": "Feeling ungrounded"},
]

@api_router.post("/oracle/reading")
async def create_oracle_reading(
    data: OracleReadingRequest,
    user: User = Depends(get_current_user)
):
    """Create a new oracle reading with AI interpretation."""
    import random
    
    num_cards = {"single": 1, "three_card": 3, "celtic_cross": 10}.get(data.spread_type, 1)
    selected_cards = random.sample(ORACLE_CARDS, min(num_cards, len(ORACLE_CARDS)))
    
    for card in selected_cards:
        card["is_reversed"] = random.choice([True, False])
        card["position"] = selected_cards.index(card) + 1
    
    # Generate AI interpretation using Claude
    interpretation = await generate_oracle_interpretation(selected_cards, data.question, data.spread_type)
    
    reading = {
        "id": str(uuid.uuid4()),
        "user_id": user.user_id,
        "question": data.question,
        "spread_type": data.spread_type,
        "cards": selected_cards,
        "interpretation": interpretation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.oracle_readings.insert_one(reading)
    reading.pop("_id", None)
    return reading

@api_router.get("/oracle/readings")
async def get_oracle_readings(user: User = Depends(get_current_user)):
    """Get user's oracle reading history."""
    readings = await db.oracle_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings

async def generate_oracle_interpretation(cards: List[dict], question: Optional[str], spread_type: str) -> str:
    """Generate AI interpretation using Claude."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return generate_fallback_interpretation(cards, question)
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"oracle_{uuid.uuid4().hex[:8]}",
            system_message="""You are a wise shamanic oracle reader with deep knowledge of indigenous wisdom traditions, 
            animal medicine, and elemental energies. Provide insightful, compassionate, and spiritually meaningful 
            interpretations. Speak with the voice of ancient wisdom while being relevant to modern seekers. 
            Keep interpretations between 150-300 words. Include practical guidance."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        cards_info = "\n".join([
            f"Card {i+1}: {c['name']} ({c['element']}) - {'Reversed' if c.get('is_reversed') else 'Upright'}"
            for i, c in enumerate(cards)
        ])
        
        prompt = f"""Please provide a shamanic oracle reading interpretation.

Spread Type: {spread_type}
{"Question: " + question if question else "General guidance reading"}

Cards drawn:
{cards_info}

Card meanings for reference:
{chr(10).join([f"- {c['name']}: {c['reversed_meaning'] if c.get('is_reversed') else c['meaning']}" for c in cards])}

Provide a meaningful interpretation weaving together the cards' messages, incorporating shamanic wisdom, 
elemental energies, and practical spiritual guidance for the seeker."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
        
    except Exception as e:
        logger.error(f"AI interpretation failed: {e}")
        return generate_fallback_interpretation(cards, question)

def generate_fallback_interpretation(cards: List[dict], question: Optional[str]) -> str:
    """Generate a basic interpretation without AI."""
    elements = [c["element"] for c in cards]
    dominant_element = max(set(elements), key=elements.count)
    
    intro = f"The spirits have spoken through these sacred cards. "
    if question:
        intro += f"Regarding your question about {question[:50]}... "
    
    card_readings = []
    for card in cards:
        meaning = card["reversed_meaning"] if card.get("is_reversed") else card["meaning"]
        position = "reversed" if card.get("is_reversed") else "upright"
        card_readings.append(f"{card['name']} appears {position}, bringing the medicine of {meaning.lower()}.")
    
    element_message = {
        "Earth": "Ground yourself in the wisdom of Mother Earth. Patience and stability are your allies.",
        "Water": "Flow with your emotions and trust your intuition. The waters of wisdom run deep.",
        "Fire": "Embrace transformation and let your inner fire illuminate your path.",
        "Air": "Seek clarity through breath and contemplation. New perspectives await.",
        "Spirit": "Connect with the great mystery. Your ancestors walk beside you."
    }
    
    return f"{intro}\n\n{' '.join(card_readings)}\n\n{element_message.get(dominant_element, '')}"

# ============ YOGA ROUTES ============

# Yoga poses are now stored in MongoDB
@api_router.get("/yoga/poses")
async def get_yoga_poses(element: Optional[str] = None, difficulty: Optional[str] = None):
    """Get yoga poses from database, optionally filtered by element or difficulty."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if difficulty:
        query["difficulty"] = {"$regex": f"^{difficulty}$", "$options": "i"}
    
    poses = await db.yoga_poses.find(query, {"_id": 0}).to_list(length=100)
    return poses

@api_router.get("/yoga/poses/{pose_id}")
async def get_yoga_pose(pose_id: str):
    """Get a specific yoga pose from database."""
    pose = await db.yoga_poses.find_one({"id": pose_id}, {"_id": 0})
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    return pose

# ============ BREATHWORK ROUTES ============

@api_router.get("/breathwork/sessions")
async def get_breathwork_sessions(element: Optional[str] = None):
    """Get breathwork sessions from database, optionally filtered by element."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    sessions = await db.breathwork_sessions.find(query, {"_id": 0}).to_list(length=20)
    return sessions

@api_router.get("/breathwork/sessions/{session_id}")
async def get_breathwork_session(session_id: str):
    """Get a specific breathwork session from database."""
    session = await db.breathwork_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# ============ CRYSTALS ROUTES ============

@api_router.get("/crystals")
async def get_crystals(element: Optional[str] = None, chakra: Optional[str] = None):
    """Get crystals from database, optionally filtered by element or chakra."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if chakra:
        query["chakras"] = {"$regex": chakra, "$options": "i"}
    
    crystals = await db.crystals.find(query, {"_id": 0}).to_list(length=50)
    return crystals

@api_router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str):
    """Get a specific crystal from database."""
    crystal = await db.crystals.find_one({"id": crystal_id}, {"_id": 0})
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal

# ============ MANTRAS ROUTES ============

@api_router.get("/mantras")
async def get_mantras(element: Optional[str] = None):
    """Get mantras from database, optionally filtered by element."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mantras = await db.mantras.find(query, {"_id": 0}).to_list(length=50)
    return mantras

# ============ MUDRAS ROUTES ============

@api_router.get("/mudras")
async def get_mudras(element: Optional[str] = None):
    """Get mudras from database, optionally filtered by element."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mudras = await db.mudras.find(query, {"_id": 0}).to_list(length=50)
    return mudras

# ============ 13-MONTH ASTROLOGY ROUTES ============

@api_router.get("/astrology/months")
async def get_astrology_months():
    """Get all 13 lunar months from database."""
    months = await db.astrology_months.find({}, {"_id": 0}).sort("month_number", 1).to_list(length=20)
    return months

@api_router.get("/astrology/months/{month_id}")
async def get_astrology_month(month_id: str):
    """Get a specific lunar month from database."""
    month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
    if not month:
        raise HTTPException(status_code=404, detail="Month not found")
    return month

@api_router.get("/astrology/current")
async def get_current_month():
    """Get the current lunar month based on today's date."""
    today = datetime.now()
    
    month_ranges = [
        (12, 21, 1, 17, "1"),
        (1, 18, 2, 14, "2"),
        (2, 15, 3, 14, "3"),
        (3, 15, 4, 11, "4"),
        (4, 12, 5, 9, "5"),
        (5, 10, 6, 6, "6"),
        (6, 7, 7, 4, "7"),
        (7, 5, 8, 1, "8"),
        (8, 2, 8, 29, "9"),
        (8, 30, 9, 26, "10"),
        (9, 27, 10, 24, "11"),
        (10, 25, 11, 21, "12"),
        (11, 22, 12, 20, "13"),
    ]
    
    current_month = today.month
    current_day = today.day
    
    for start_month, start_day, end_month, end_day, month_id in month_ranges:
        if start_month <= end_month:
            if (current_month == start_month and current_day >= start_day) or \
               (current_month == end_month and current_day <= end_day) or \
               (start_month < current_month < end_month):
                month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
                return month
        else:
            if (current_month == start_month and current_day >= start_day) or \
               (current_month == end_month and current_day <= end_day) or \
               current_month > start_month or current_month < end_month:
                month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
                return month
    
    first_month = await db.astrology_months.find_one({"id": "1"}, {"_id": 0})
    return first_month

# ============ MINDFULNESS PRACTICES ============

@api_router.get("/mindfulness")
async def get_mindfulness_practices(category: Optional[str] = None, element: Optional[str] = None):
    """Get mindfulness practices from database."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.mindfulness_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices

# ============ GUIDED MEDITATIONS ============

@api_router.get("/meditations")
async def get_meditations(category: Optional[str] = None, element: Optional[str] = None):
    """Get guided meditations from database."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    meditations = await db.meditations.find(query, {"_id": 0}).to_list(length=50)
    return meditations

@api_router.get("/meditations/{meditation_id}")
async def get_meditation(meditation_id: str):
    """Get a specific meditation from database."""
    meditation = await db.meditations.find_one({"id": meditation_id}, {"_id": 0})
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    return meditation

# ============ SOMATIC PRACTICES ============

@api_router.get("/somatic")
async def get_somatic_practices(element: Optional[str] = None):
    """Get somatic practices from database."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices

# ============ GROUNDING EXERCISES ============

@api_router.get("/grounding")
async def get_grounding_exercises(element: Optional[str] = None):
    """Get grounding exercises from database."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    exercises = await db.grounding_exercises.find(query, {"_id": 0}).to_list(length=50)
    return exercises

# ============ ORACLE CARDS ============

@api_router.get("/oracle/cards")
async def get_oracle_cards(element: Optional[str] = None):
    """Get oracle cards from database."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    cards = await db.oracle_cards.find(query, {"_id": 0}).to_list(length=50)
    return cards


# ============ DASHBOARD / USER DATA ============

@api_router.get("/dashboard/daily")
async def get_daily_guidance(user: User = Depends(get_current_user)):
    """Get personalized daily guidance."""
    import random
    
    current_month = await get_current_month()
    
    # Fetch data from MongoDB
    yoga_poses = await db.yoga_poses.find({}, {"_id": 0}).to_list(length=100)
    crystals = await db.crystals.find({}, {"_id": 0}).to_list(length=50)
    mantras = await db.mantras.find({}, {"_id": 0}).to_list(length=50)
    breathwork_sessions = await db.breathwork_sessions.find({}, {"_id": 0}).to_list(length=20)
    
    daily_pose = random.choice(yoga_poses) if yoga_poses else None
    daily_crystal = random.choice(crystals) if crystals else None
    daily_mantra = random.choice(mantras) if mantras else None
    daily_breathwork = random.choice(breathwork_sessions) if breathwork_sessions else None
    
    return {
        "greeting": f"Blessed day, {user.name.split()[0]}",
        "current_moon": current_month,
        "daily_pose": daily_pose,
        "daily_crystal": daily_crystal,
        "daily_mantra": daily_mantra,
        "daily_breathwork": daily_breathwork,
        "element_focus": current_month["element"] if current_month else "Spirit"
    }

# ============ FAVORITES / BOOKMARKS ============

class FavoriteCreate(BaseModel):
    item_type: str  # "pose", "crystal", "mantra", "mudra", "breathwork", "somatic", "grounding"
    item_id: str

@api_router.post("/favorites")
async def add_favorite(data: FavoriteCreate, user: User = Depends(get_current_user)):
    """Add an item to user's favorites."""
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

@api_router.delete("/favorites/{item_type}/{item_id}")
async def remove_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)):
    """Remove an item from user's favorites."""
    result = await db.favorites.delete_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}

@api_router.get("/favorites")
async def get_favorites(user: User = Depends(get_current_user), item_type: Optional[str] = None):
    """Get user's favorites, optionally filtered by type."""
    query = {"user_id": user.user_id}
    if item_type:
        query["item_type"] = item_type
    
    favorites = await db.favorites.find(query, {"_id": 0}).to_list(500)
    
    # Group favorite IDs by type for batch queries (avoid N+1 problem)
    ids_by_type = {}
    for fav in favorites:
        ids_by_type.setdefault(fav["item_type"], []).append(fav["item_id"])
    
    # Fetch all items by type in bulk using $in operator
    items_cache = {}
    
    if "pose" in ids_by_type:
        poses = await db.yoga_poses.find({"id": {"$in": ids_by_type["pose"]}}, {"_id": 0}).to_list(None)
        items_cache["pose"] = {p["id"]: p for p in poses}
    
    if "crystal" in ids_by_type:
        crystals = await db.crystals.find({"id": {"$in": ids_by_type["crystal"]}}, {"_id": 0}).to_list(None)
        items_cache["crystal"] = {c["id"]: c for c in crystals}
    
    if "mantra" in ids_by_type:
        mantras = await db.mantras.find({"id": {"$in": ids_by_type["mantra"]}}, {"_id": 0}).to_list(None)
        items_cache["mantra"] = {m["id"]: m for m in mantras}
    
    if "mudra" in ids_by_type:
        mudras = await db.mudras.find({"id": {"$in": ids_by_type["mudra"]}}, {"_id": 0}).to_list(None)
        items_cache["mudra"] = {m["id"]: m for m in mudras}
    
    if "breathwork" in ids_by_type:
        sessions = await db.breathwork_sessions.find({"id": {"$in": ids_by_type["breathwork"]}}, {"_id": 0}).to_list(None)
        items_cache["breathwork"] = {s["id"]: s for s in sessions}
    
    if "somatic" in ids_by_type:
        practices = await db.somatic_practices.find({"id": {"$in": ids_by_type["somatic"]}}, {"_id": 0}).to_list(None)
        items_cache["somatic"] = {p["id"]: p for p in practices}
    
    if "grounding" in ids_by_type:
        exercises = await db.grounding_exercises.find({"id": {"$in": ids_by_type["grounding"]}}, {"_id": 0}).to_list(None)
        items_cache["grounding"] = {e["id"]: e for e in exercises}
    
    # Build enriched list using cache
    enriched = []
    for fav in favorites:
        item_data = items_cache.get(fav["item_type"], {}).get(fav["item_id"])
        if item_data:
            enriched.append({**fav, "item": item_data})
    
    return enriched

@api_router.get("/favorites/check/{item_type}/{item_id}")
async def check_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)):
    """Check if an item is in user's favorites."""
    existing = await db.favorites.find_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    }, {"_id": 0})
    
    return {"is_favorite": existing is not None}

# ============ PRACTICE HISTORY ============

class PracticeLogCreate(BaseModel):
    practice_type: str  # "yoga", "breathwork", "meditation", "oracle", "elemental", etc.
    practice_id: Optional[str] = None
    duration_minutes: int
    notes: Optional[str] = None
    element: Optional[str] = None  # Element associated with the practice (Earth, Water, Fire, Air, Spirit)

@api_router.post("/practice-history")
async def log_practice(data: PracticeLogCreate, user: User = Depends(get_current_user)):
    """Log a completed practice."""
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

@api_router.get("/practice-history")
async def get_practice_history(
    user: User = Depends(get_current_user),
    practice_type: Optional[str] = None,
    limit: int = 50
):
    """Get user's practice history."""
    query = {"user_id": user.user_id}
    if practice_type:
        query["practice_type"] = practice_type
    
    history = await db.practice_history.find(query, {"_id": 0}).sort("completed_at", -1).to_list(limit)
    return history

@api_router.get("/practice-history/stats")
async def get_practice_stats(user: User = Depends(get_current_user)):
    """Get user's practice statistics."""
    # Get all practice history for this user
    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    total_sessions = len(history)
    total_minutes = sum(h.get("duration_minutes", 0) for h in history)
    
    # Count by type
    by_type = {}
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
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
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

# ============ DAILY RITUALS ============

ACHIEVEMENT_DEFINITIONS = [
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

@api_router.post("/rituals")
async def create_ritual(data: RitualCreate, user: User = Depends(get_current_user)):
    """Create a custom daily ritual."""
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

@api_router.get("/rituals")
async def get_rituals(user: User = Depends(get_current_user)):
    """Get user's custom rituals."""
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return rituals

@api_router.get("/rituals/{ritual_id}")
async def get_ritual(ritual_id: str, user: User = Depends(get_current_user)):
    """Get a specific ritual."""
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return ritual

@api_router.put("/rituals/{ritual_id}")
async def update_ritual(ritual_id: str, data: RitualUpdate, user: User = Depends(get_current_user)):
    """Update a ritual."""
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.rituals.update_one(
        {"ritual_id": ritual_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    return await get_ritual(ritual_id, user)

@api_router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, user: User = Depends(get_current_user)):
    """Delete a ritual."""
    result = await db.rituals.delete_one({"ritual_id": ritual_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return {"message": "Ritual deleted"}

# ============ RITUAL SHARING ============

@api_router.post("/rituals/{ritual_id}/share")
async def share_ritual(ritual_id: str, user: User = Depends(get_current_user)):
    """Generate a shareable link for a ritual."""
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    # Create or get existing share code
    share_code = f"share_{uuid.uuid4().hex[:8]}"
    
    # Store shared ritual
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

@api_router.get("/rituals/shared/{share_code}")
async def get_shared_ritual(share_code: str):
    """Get a shared ritual by share code (no auth required)."""
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    return shared

@api_router.post("/rituals/shared/{share_code}/copy")
async def copy_shared_ritual(share_code: str, user: User = Depends(get_current_user)):
    """Copy a shared ritual to user's own rituals."""
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    
    # Create new ritual for the user
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
    
    # Increment copy count
    await db.shared_rituals.update_one(
        {"share_code": share_code},
        {"$inc": {"copy_count": 1}}
    )
    
    new_ritual.pop("_id", None)
    return new_ritual

# ============ DAILY REMINDERS ============

class ReminderSettings(BaseModel):
    enabled: bool = True
    time: str = "08:00"  # HH:MM format
    days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ritual_id: Optional[str] = None
    message: Optional[str] = None

@api_router.get("/settings/reminders")
async def get_reminder_settings(user: User = Depends(get_current_user)):
    """Get user's reminder settings."""
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

@api_router.put("/settings/reminders")
async def update_reminder_settings(data: ReminderSettings, user: User = Depends(get_current_user)):
    """Update user's reminder settings."""
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

# ============ JOURNAL / REFLECTIONS ============

class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None  # "peaceful", "energized", "grateful", "reflective", "challenged"
    practices_completed: Optional[List[str]] = None
    tags: Optional[List[str]] = None

@api_router.post("/journal")
async def create_journal_entry(data: JournalEntryCreate, user: User = Depends(get_current_user)):
    """Create a new journal entry."""
    entry = {
        "entry_id": f"journal_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "title": data.title,
        "content": data.content,
        "mood": data.mood,
        "practices_completed": data.practices_completed or [],
        "tags": data.tags or [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.journal.insert_one(entry)
    entry.pop("_id", None)
    return entry

@api_router.get("/journal")
async def get_journal_entries(
    user: User = Depends(get_current_user),
    limit: int = 50,
    mood: Optional[str] = None
):
    """Get user's journal entries."""
    query = {"user_id": user.user_id}
    if mood:
        query["mood"] = mood
    
    entries = await db.journal.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return entries

@api_router.get("/journal/{entry_id}")
async def get_journal_entry(entry_id: str, user: User = Depends(get_current_user)):
    """Get a specific journal entry."""
    entry = await db.journal.find_one({"entry_id": entry_id, "user_id": user.user_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry

@api_router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str, user: User = Depends(get_current_user)):
    """Delete a journal entry."""
    result = await db.journal.delete_one({"entry_id": entry_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Entry deleted"}

# ============ ACHIEVEMENTS ============

@api_router.get("/achievements")
async def get_achievements(user: User = Depends(get_current_user)):
    """Get user's achievements with unlock status and unlockable content."""
    # Get achievement definitions from database
    achievement_defs = await db.achievement_definitions.find({}, {"_id": 0}).to_list(100)
    
    # Get user stats
    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    oracle_readings = await db.oracle_readings.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    total_sessions = len(history)
    total_minutes = sum(h.get("duration_minutes", 0) for h in history)
    
    # Count by type and element
    by_type = {}
    by_element = {"Earth": 0, "Water": 0, "Fire": 0, "Air": 0, "Spirit": 0}
    heart_practices = 0
    shadow_work = 0
    journeys = 0
    ancestral = 0
    creative = 0
    
    for h in history:
        ptype = h.get("practice_type", "unknown")
        element = h.get("element", "Spirit")
        
        by_type[ptype] = by_type.get(ptype, 0) + 1
        if element in by_element:
            by_element[element] += 1
        
        # Track specific practice categories
        if ptype == "heart_practice":
            heart_practices += 1
        elif ptype == "shadow_work":
            shadow_work += 1
        elif ptype in ["power_animal_journey", "upper_world_journey", "shamanic_journey"]:
            journeys += 1
        elif ptype == "ancestral_healing":
            ancestral += 1
        elif ptype in ["creative_process", "vision_journaling", "shamanic_art"]:
            creative += 1
    
    # Calculate streak
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
    
    # Check each achievement
    achievements = []
    unlocked_content = []
    
    for ach in achievement_defs:
        req = ach.get("requirement", {})
        unlocked = False
        progress = 0
        target = req.get("count", 1)
        
        req_type = req.get("type", "")
        
        if req_type == "sessions":
            progress = total_sessions
            unlocked = total_sessions >= target
        elif req_type == "streak":
            progress = streak
            unlocked = streak >= target
        elif req_type == "minutes":
            progress = total_minutes
            unlocked = total_minutes >= target
        elif req_type == "oracle_readings":
            progress = len(oracle_readings)
            unlocked = len(oracle_readings) >= target
        elif req_type == "breathwork":
            progress = by_type.get("breathwork", 0)
            unlocked = by_type.get("breathwork", 0) >= target
        elif req_type == "yoga":
            progress = by_type.get("yoga", 0)
            unlocked = by_type.get("yoga", 0) >= target
        elif req_type == "element":
            element = req.get("element", "Spirit")
            progress = by_element.get(element, 0)
            unlocked = progress >= target
        elif req_type == "all_elements":
            min_element = min(by_element.values())
            progress = min_element
            unlocked = min_element >= target
        elif req_type == "heart_practices":
            progress = heart_practices
            unlocked = heart_practices >= target
        elif req_type == "shadow_work":
            progress = shadow_work
            unlocked = shadow_work >= target
        elif req_type == "journeys":
            progress = journeys
            unlocked = journeys >= target
        elif req_type == "ancestral":
            progress = ancestral
            unlocked = ancestral >= target
        elif req_type == "creative":
            progress = creative
            unlocked = creative >= target
        elif req_type == "rituals_created":
            progress = len(rituals)
            unlocked = len(rituals) >= target
        
        achievement_data = {
            "id": ach.get("id"),
            "name": ach.get("name"),
            "description": ach.get("description"),
            "category": ach.get("category"),
            "badge_color": ach.get("badge_color", "#8b5cf6"),
            "unlocked": unlocked,
            "progress": progress,
            "target": target,
            "unlocks": ach.get("unlocks")
        }
        achievements.append(achievement_data)
        
        # Track what content has been unlocked
        if unlocked and ach.get("unlocks"):
            unlocked_content.append(ach.get("unlocks"))
    
    return {
        "achievements": achievements,
        "unlocked_content": unlocked_content,
        "stats": {
            "total_unlocked": sum(1 for a in achievements if a["unlocked"]),
            "total_achievements": len(achievements),
            "current_streak": streak,
            "total_minutes": total_minutes
        }
    }

# ============ EARTH ALTARS ============

@api_router.get("/earth-altars")
async def get_earth_altars(element: Optional[str] = None):
    """Get earth altar guides."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    altars = await db.earth_altars.find(query, {"_id": 0}).to_list(length=20)
    return altars

@api_router.get("/earth-altars/{altar_id}")
async def get_earth_altar(altar_id: str):
    """Get specific earth altar guide."""
    altar = await db.earth_altars.find_one({"id": altar_id}, {"_id": 0})
    if not altar:
        raise HTTPException(status_code=404, detail="Altar not found")
    return altar

# ============ CREATIVE PROCESSES ============

@api_router.get("/creative-processes")
async def get_creative_processes(category: Optional[str] = None):
    """Get creative process guides."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    processes = await db.creative_processes.find(query, {"_id": 0}).to_list(length=20)
    return processes

@api_router.get("/creative-processes/{process_id}")
async def get_creative_process(process_id: str):
    """Get specific creative process guide."""
    process = await db.creative_processes.find_one({"id": process_id}, {"_id": 0})
    if not process:
        raise HTTPException(status_code=404, detail="Creative process not found")
    return process

# ============ HEART PRACTICES ============

@api_router.get("/heart-practices")
async def get_heart_practices(category: Optional[str] = None):
    """Get heart-centered practices."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.heart_practices.find(query, {"_id": 0}).to_list(length=20)
    return practices

@api_router.get("/heart-practices/{practice_id}")
async def get_heart_practice(practice_id: str):
    """Get specific heart practice."""
    practice = await db.heart_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    return practice

# ============ SHAMANIC PRACTICES ============

@api_router.get("/shamanic-practices")
async def get_shamanic_practices(category: Optional[str] = None):
    """Get deep shamanic practices."""
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.shamanic_practices.find(query, {"_id": 0}).to_list(length=20)
    return practices

@api_router.get("/shamanic-practices/{practice_id}")
async def get_shamanic_practice(practice_id: str):
    """Get specific shamanic practice."""
    practice = await db.shamanic_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Shamanic practice not found")
    return practice


# ============ ELEMENTAL PRACTICES ============

@api_router.get("/elemental-practices")
async def get_elemental_practices(element: Optional[str] = None, category: Optional[str] = None):
    """Get elemental practices."""
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.elemental_practices.find(query, {"_id": 0}).to_list(length=20)
    return practices

@api_router.get("/elemental-practices/{practice_id}")
async def get_elemental_practice(practice_id: str):
    """Get specific elemental practice."""
    practice = await db.elemental_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Elemental practice not found")
    return practice


# ============ ENHANCED PRACTICE STATS ============

@api_router.get("/practice-history/detailed-stats")
async def get_detailed_practice_stats(user: User = Depends(get_current_user)):
    """Get detailed practice statistics including element breakdown, weekly data, and more."""
    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    oracle_readings = await db.oracle_readings.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    total_sessions = len(history)
    total_minutes = sum(h.get("duration_minutes", 0) for h in history)
    
    # Count by practice type
    by_type = {}
    by_element = {"Earth": 0, "Water": 0, "Fire": 0, "Air": 0, "Spirit": 0}
    by_day = {}
    
    for h in history:
        ptype = h.get("practice_type", "unknown")
        element = h.get("element", "Spirit")
        date = h.get("completed_at", "")[:10]
        
        if ptype not in by_type:
            by_type[ptype] = {"count": 0, "minutes": 0}
        by_type[ptype]["count"] += 1
        by_type[ptype]["minutes"] += h.get("duration_minutes", 0)
        
        if element in by_element:
            by_element[element] += 1
        
        if date not in by_day:
            by_day[date] = {"count": 0, "minutes": 0}
        by_day[date]["count"] += 1
        by_day[date]["minutes"] += h.get("duration_minutes", 0)
    
    # Calculate streak
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
    
    # Weekly breakdown (last 7 days)
    weekly_data = []
    for i in range(7):
        date = (datetime.now(timezone.utc) - timedelta(days=6-i)).strftime("%Y-%m-%d")
        day_name = (datetime.now(timezone.utc) - timedelta(days=6-i)).strftime("%a")
        day_data = by_day.get(date, {"count": 0, "minutes": 0})
        weekly_data.append({
            "date": date,
            "day": day_name,
            "sessions": day_data["count"],
            "minutes": day_data["minutes"]
        })
    
    return {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 1),
        "oracle_readings_count": len(oracle_readings),
        "current_streak": streak,
        "by_type": by_type,
        "by_element": by_element,
        "weekly_data": weekly_data,
        "practice_days": len(by_day),
        "avg_session_length": round(total_minutes / total_sessions, 1) if total_sessions > 0 else 0
    }

# ============ ADMIN CMS ROUTES ============
# These routes allow authorized users to manage content

# Models for creating/updating content
class YogaPoseCreate(BaseModel):
    name: str
    sanskrit_name: str
    element: str
    description: str
    image_url: Optional[str] = None
    instructions: List[str] = []
    benefits: List[str] = []
    chakras: List[str] = []
    duration_minutes: int = 3
    difficulty: str = "Beginner"
    contraindications: List[str] = []

class MudraCreate(BaseModel):
    name: str
    sanskrit_name: Optional[str] = None
    element: str
    description: str
    instructions: Optional[str] = None
    benefits: List[str] = []
    image_url: Optional[str] = None

class BreathworkCreate(BaseModel):
    name: str
    element: str
    description: str
    duration_minutes: int
    pattern: dict  # {"inhale": 4, "hold": 4, "exhale": 4, "hold_empty": 0}
    benefits: List[str] = []
    frequency: Optional[str] = None
    best_time: Optional[str] = None
    instructions: Optional[str] = None

class CrystalCreate(BaseModel):
    name: str
    element: str
    chakras: List[str] = []
    properties: List[str] = []
    description: str
    image_url: Optional[str] = None

class MantraCreate(BaseModel):
    name: str
    sanskrit: Optional[str] = None
    translation: str
    element: str
    chakra: Optional[str] = None
    benefits: List[str] = []
    audio_url: Optional[str] = None
    duration_seconds: int = 10
    repetitions: int = 108

class WorkshopCreate(BaseModel):
    title: str
    description: str
    instructor: str
    date: str
    duration_minutes: int
    location: str
    max_participants: int = 20
    price: float = 0
    image_url: Optional[str] = None
    topics: List[str] = []
    requirements: List[str] = []

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    event_type: str  # workshop, retreat, ceremony, gathering
    price: float = 0
    image_url: Optional[str] = None
    capacity: int = 50

class CourseCreate(BaseModel):
    title: str
    description: str
    instructor: str
    duration_weeks: int
    modules: List[dict] = []
    price: float = 0
    image_url: Optional[str] = None
    level: str = "Beginner"

# ---- YOGA POSES CRUD ----
@api_router.post("/admin/yoga/poses")
async def create_yoga_pose(pose: YogaPoseCreate, current_user: User = Depends(get_current_user)):
    """Create a new yoga pose."""
    pose_dict = pose.model_dump()
    pose_dict["id"] = str(uuid.uuid4())[:8]
    pose_dict["created_by"] = current_user.user_id
    pose_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.yoga_poses.insert_one(pose_dict)
    pose_dict.pop("_id", None)
    return pose_dict

@api_router.put("/admin/yoga/poses/{pose_id}")
async def update_yoga_pose(pose_id: str, pose: YogaPoseCreate, current_user: User = Depends(get_current_user)):
    """Update an existing yoga pose."""
    existing = await db.yoga_poses.find_one({"id": pose_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Pose not found")
    
    pose_dict = pose.model_dump()
    pose_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    pose_dict["updated_by"] = current_user.user_id
    
    await db.yoga_poses.update_one({"id": pose_id}, {"$set": pose_dict})
    return {"message": "Pose updated successfully", "id": pose_id}

@api_router.delete("/admin/yoga/poses/{pose_id}")
async def delete_yoga_pose(pose_id: str, current_user: User = Depends(get_current_user)):
    """Delete a yoga pose."""
    result = await db.yoga_poses.delete_one({"id": pose_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pose not found")
    return {"message": "Pose deleted successfully"}

# ---- MUDRAS CRUD ----
@api_router.post("/admin/mudras")
async def create_mudra(mudra: MudraCreate, current_user: User = Depends(get_current_user)):
    """Create a new mudra."""
    mudra_dict = mudra.model_dump()
    mudra_dict["id"] = str(uuid.uuid4())[:8]
    mudra_dict["created_by"] = current_user.user_id
    
    await db.mudras.insert_one(mudra_dict)
    return {"message": "Mudra created successfully", "id": mudra_dict["id"]}

@api_router.put("/admin/mudras/{mudra_id}")
async def update_mudra(mudra_id: str, mudra: MudraCreate, current_user: User = Depends(get_current_user)):
    """Update an existing mudra."""
    result = await db.mudras.update_one({"id": mudra_id}, {"$set": mudra.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mudra not found")
    return {"message": "Mudra updated successfully"}

@api_router.delete("/admin/mudras/{mudra_id}")
async def delete_mudra(mudra_id: str, current_user: User = Depends(get_current_user)):
    """Delete a mudra."""
    result = await db.mudras.delete_one({"id": mudra_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mudra not found")
    return {"message": "Mudra deleted successfully"}

# ---- BREATHWORK CRUD ----
@api_router.post("/admin/breathwork")
async def create_breathwork(session: BreathworkCreate, current_user: User = Depends(get_current_user)):
    """Create a new breathwork session."""
    session_dict = session.model_dump()
    session_dict["id"] = str(uuid.uuid4())[:8]
    session_dict["created_by"] = current_user.user_id
    
    await db.breathwork_sessions.insert_one(session_dict)
    return {"message": "Breathwork session created successfully", "id": session_dict["id"]}

@api_router.put("/admin/breathwork/{session_id}")
async def update_breathwork(session_id: str, session: BreathworkCreate, current_user: User = Depends(get_current_user)):
    """Update an existing breathwork session."""
    result = await db.breathwork_sessions.update_one({"id": session_id}, {"$set": session.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Breathwork session not found")
    return {"message": "Breathwork session updated successfully"}

@api_router.delete("/admin/breathwork/{session_id}")
async def delete_breathwork(session_id: str, current_user: User = Depends(get_current_user)):
    """Delete a breathwork session."""
    result = await db.breathwork_sessions.delete_one({"id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Breathwork session not found")
    return {"message": "Breathwork session deleted successfully"}

# ---- CRYSTALS CRUD ----
@api_router.post("/admin/crystals")
async def create_crystal(crystal: CrystalCreate, current_user: User = Depends(get_current_user)):
    """Create a new crystal."""
    crystal_dict = crystal.model_dump()
    crystal_dict["id"] = str(uuid.uuid4())[:8]
    crystal_dict["created_by"] = current_user.user_id
    
    await db.crystals.insert_one(crystal_dict)
    return {"message": "Crystal created successfully", "id": crystal_dict["id"]}

@api_router.put("/admin/crystals/{crystal_id}")
async def update_crystal(crystal_id: str, crystal: CrystalCreate, current_user: User = Depends(get_current_user)):
    """Update an existing crystal."""
    result = await db.crystals.update_one({"id": crystal_id}, {"$set": crystal.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return {"message": "Crystal updated successfully"}

@api_router.delete("/admin/crystals/{crystal_id}")
async def delete_crystal(crystal_id: str, current_user: User = Depends(get_current_user)):
    """Delete a crystal."""
    result = await db.crystals.delete_one({"id": crystal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return {"message": "Crystal deleted successfully"}

# ---- MANTRAS CRUD ----
@api_router.post("/admin/mantras")
async def create_mantra(mantra: MantraCreate, current_user: User = Depends(get_current_user)):
    """Create a new mantra."""
    mantra_dict = mantra.model_dump()
    mantra_dict["id"] = str(uuid.uuid4())[:8]
    mantra_dict["created_by"] = current_user.user_id
    
    await db.mantras.insert_one(mantra_dict)
    return {"message": "Mantra created successfully", "id": mantra_dict["id"]}

@api_router.put("/admin/mantras/{mantra_id}")
async def update_mantra(mantra_id: str, mantra: MantraCreate, current_user: User = Depends(get_current_user)):
    """Update an existing mantra."""
    result = await db.mantras.update_one({"id": mantra_id}, {"$set": mantra.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    return {"message": "Mantra updated successfully"}

@api_router.delete("/admin/mantras/{mantra_id}")
async def delete_mantra(mantra_id: str, current_user: User = Depends(get_current_user)):
    """Delete a mantra."""
    result = await db.mantras.delete_one({"id": mantra_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    return {"message": "Mantra deleted successfully"}

# ---- WORKSHOPS CRUD ----
@api_router.get("/workshops")
async def get_workshops():
    """Get all workshops."""
    workshops = await db.workshops.find({}, {"_id": 0}).to_list(length=50)
    return workshops

@api_router.post("/admin/workshops")
async def create_workshop(workshop: WorkshopCreate, current_user: User = Depends(get_current_user)):
    """Create a new workshop."""
    workshop_dict = workshop.model_dump()
    workshop_dict["id"] = str(uuid.uuid4())[:8]
    workshop_dict["created_by"] = current_user.user_id
    workshop_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.workshops.insert_one(workshop_dict)
    return {"message": "Workshop created successfully", "id": workshop_dict["id"]}

@api_router.put("/admin/workshops/{workshop_id}")
async def update_workshop(workshop_id: str, workshop: WorkshopCreate, current_user: User = Depends(get_current_user)):
    """Update an existing workshop."""
    result = await db.workshops.update_one({"id": workshop_id}, {"$set": workshop.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {"message": "Workshop updated successfully"}

@api_router.delete("/admin/workshops/{workshop_id}")
async def delete_workshop(workshop_id: str, current_user: User = Depends(get_current_user)):
    """Delete a workshop."""
    result = await db.workshops.delete_one({"id": workshop_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return {"message": "Workshop deleted successfully"}

# ---- EVENTS CRUD ----
@api_router.get("/events")
async def get_events():
    """Get all events."""
    events = await db.events.find({}, {"_id": 0}).to_list(length=50)
    return events

@api_router.post("/admin/events")
async def create_event(event: EventCreate, current_user: User = Depends(get_current_user)):
    """Create a new event."""
    event_dict = event.model_dump()
    event_dict["id"] = str(uuid.uuid4())[:8]
    event_dict["created_by"] = current_user.user_id
    event_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.events.insert_one(event_dict)
    return {"message": "Event created successfully", "id": event_dict["id"]}

@api_router.put("/admin/events/{event_id}")
async def update_event(event_id: str, event: EventCreate, current_user: User = Depends(get_current_user)):
    """Update an existing event."""
    result = await db.events.update_one({"id": event_id}, {"$set": event.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated successfully"}

@api_router.delete("/admin/events/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_current_user)):
    """Delete an event."""
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# ---- COURSES CRUD ----
@api_router.get("/courses")
async def get_courses():
    """Get all courses."""
    courses = await db.courses.find({}, {"_id": 0}).to_list(length=50)
    return courses

@api_router.post("/admin/courses")
async def create_course(course: CourseCreate, current_user: User = Depends(get_current_user)):
    """Create a new course."""
    course_dict = course.model_dump()
    course_dict["id"] = str(uuid.uuid4())[:8]
    course_dict["created_by"] = current_user.user_id
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.courses.insert_one(course_dict)
    return {"message": "Course created successfully", "id": course_dict["id"]}

@api_router.put("/admin/courses/{course_id}")
async def update_course(course_id: str, course: CourseCreate, current_user: User = Depends(get_current_user)):
    """Update an existing course."""
    result = await db.courses.update_one({"id": course_id}, {"$set": course.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course updated successfully"}

@api_router.delete("/admin/courses/{course_id}")
async def delete_course(course_id: str, current_user: User = Depends(get_current_user)):
    """Delete a course."""
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# ============ ADMIN SHAMANIC CONTENT ============

# ---- EARTH ALTARS CRUD ----
class EarthAltarCreate(BaseModel):
    name: str
    element: str
    description: str
    purpose: Optional[str] = None
    items: Optional[List[dict]] = []
    setup_ritual: Optional[List[str]] = []
    activation_prayer: Optional[str] = None
    best_time: Optional[str] = None
    image_url: Optional[str] = None

@api_router.post("/admin/earth-altars")
async def create_earth_altar(altar: EarthAltarCreate, current_user: User = Depends(get_current_user)):
    altar_dict = altar.model_dump()
    altar_dict["id"] = str(uuid.uuid4())[:8]
    await db.earth_altars.insert_one(altar_dict)
    return {"message": "Earth altar created", "id": altar_dict["id"]}

@api_router.put("/admin/earth-altars/{altar_id}")
async def update_earth_altar(altar_id: str, altar: EarthAltarCreate, current_user: User = Depends(get_current_user)):
    result = await db.earth_altars.update_one({"id": altar_id}, {"$set": altar.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Earth altar not found")
    return {"message": "Earth altar updated"}

@api_router.delete("/admin/earth-altars/{altar_id}")
async def delete_earth_altar(altar_id: str, current_user: User = Depends(get_current_user)):
    result = await db.earth_altars.delete_one({"id": altar_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Earth altar not found")
    return {"message": "Earth altar deleted"}

# ---- CREATIVE PROCESSES CRUD ----
class CreativeProcessCreate(BaseModel):
    name: str
    category: str
    description: str
    tradition: Optional[str] = None
    materials: Optional[List[str]] = []
    process_steps: Optional[List[str]] = []
    spiritual_purpose: Optional[str] = None
    duration_minutes: Optional[int] = 30
    image_url: Optional[str] = None

@api_router.post("/admin/creative-processes")
async def create_creative_process(process: CreativeProcessCreate, current_user: User = Depends(get_current_user)):
    process_dict = process.model_dump()
    process_dict["id"] = str(uuid.uuid4())[:8]
    await db.creative_processes.insert_one(process_dict)
    return {"message": "Creative process created", "id": process_dict["id"]}

@api_router.put("/admin/creative-processes/{process_id}")
async def update_creative_process(process_id: str, process: CreativeProcessCreate, current_user: User = Depends(get_current_user)):
    result = await db.creative_processes.update_one({"id": process_id}, {"$set": process.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Creative process not found")
    return {"message": "Creative process updated"}

@api_router.delete("/admin/creative-processes/{process_id}")
async def delete_creative_process(process_id: str, current_user: User = Depends(get_current_user)):
    result = await db.creative_processes.delete_one({"id": process_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Creative process not found")
    return {"message": "Creative process deleted"}

# ---- HEART PRACTICES CRUD ----
class HeartPracticeCreate(BaseModel):
    name: str
    category: str
    description: str
    tradition: Optional[str] = None
    benefits: Optional[List[str]] = []
    steps: Optional[List[str]] = []
    affirmation: Optional[str] = None
    duration_minutes: Optional[int] = 20
    image_url: Optional[str] = None

@api_router.post("/admin/heart-practices")
async def create_heart_practice(practice: HeartPracticeCreate, current_user: User = Depends(get_current_user)):
    practice_dict = practice.model_dump()
    practice_dict["id"] = str(uuid.uuid4())[:8]
    await db.heart_practices.insert_one(practice_dict)
    return {"message": "Heart practice created", "id": practice_dict["id"]}

@api_router.put("/admin/heart-practices/{practice_id}")
async def update_heart_practice(practice_id: str, practice: HeartPracticeCreate, current_user: User = Depends(get_current_user)):
    result = await db.heart_practices.update_one({"id": practice_id}, {"$set": practice.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    return {"message": "Heart practice updated"}

@api_router.delete("/admin/heart-practices/{practice_id}")
async def delete_heart_practice(practice_id: str, current_user: User = Depends(get_current_user)):
    result = await db.heart_practices.delete_one({"id": practice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    return {"message": "Heart practice deleted"}

# ---- SHAMANIC PRACTICES CRUD ----
class ShamanicPracticeCreate(BaseModel):
    name: str
    category: str
    description: str
    tradition: Optional[str] = None
    preparation: Optional[str] = None
    journey_steps: Optional[List[str]] = []
    safety_notes: Optional[str] = None
    closing_prayer: Optional[str] = None
    duration_minutes: Optional[int] = 30
    requires_unlock: Optional[bool] = False
    image_url: Optional[str] = None

@api_router.post("/admin/shamanic-practices")
async def create_shamanic_practice(practice: ShamanicPracticeCreate, current_user: User = Depends(get_current_user)):
    practice_dict = practice.model_dump()
    practice_dict["id"] = str(uuid.uuid4())[:8]
    await db.shamanic_practices.insert_one(practice_dict)
    return {"message": "Shamanic practice created", "id": practice_dict["id"]}

@api_router.put("/admin/shamanic-practices/{practice_id}")
async def update_shamanic_practice(practice_id: str, practice: ShamanicPracticeCreate, current_user: User = Depends(get_current_user)):
    result = await db.shamanic_practices.update_one({"id": practice_id}, {"$set": practice.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shamanic practice not found")
    return {"message": "Shamanic practice updated"}

@api_router.delete("/admin/shamanic-practices/{practice_id}")
async def delete_shamanic_practice(practice_id: str, current_user: User = Depends(get_current_user)):
    result = await db.shamanic_practices.delete_one({"id": practice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shamanic practice not found")
    return {"message": "Shamanic practice deleted"}

# ---- ELEMENTAL PRACTICES CRUD ----
class ElementalPracticeCreate(BaseModel):
    name: str
    element: str
    category: str
    description: str
    duration_minutes: Optional[int] = 20
    difficulty: Optional[str] = "Beginner"
    benefits: Optional[List[str]] = []
    instructions: Optional[List[str]] = []
    best_time: Optional[str] = None
    moon_phase: Optional[str] = None
    caution: Optional[str] = None
    image_url: Optional[str] = None

@api_router.post("/admin/elemental-practices")
async def create_elemental_practice(practice: ElementalPracticeCreate, current_user: User = Depends(get_current_user)):
    practice_dict = practice.model_dump()
    practice_dict["id"] = str(uuid.uuid4())[:8]
    await db.elemental_practices.insert_one(practice_dict)
    return {"message": "Elemental practice created", "id": practice_dict["id"]}

@api_router.put("/admin/elemental-practices/{practice_id}")
async def update_elemental_practice(practice_id: str, practice: ElementalPracticeCreate, current_user: User = Depends(get_current_user)):
    result = await db.elemental_practices.update_one({"id": practice_id}, {"$set": practice.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Elemental practice not found")
    return {"message": "Elemental practice updated"}

@api_router.delete("/admin/elemental-practices/{practice_id}")
async def delete_elemental_practice(practice_id: str, current_user: User = Depends(get_current_user)):
    result = await db.elemental_practices.delete_one({"id": practice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Elemental practice not found")
    return {"message": "Elemental practice deleted"}

# ============ ROOT & HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "Shamanic Elemental Yoga API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# ============ IMAGE UPLOAD ============

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    """Upload an image and return its URL."""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
    
    # Generate unique filename
    unique_id = str(uuid.uuid4())[:8]
    new_filename = f"{unique_id}{file_ext}"
    file_path = UPLOADS_DIR / new_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Return the URL path
    image_url = f"/api/uploads/{new_filename}"
    return {"url": image_url, "filename": new_filename}

@api_router.get("/uploads/{filename}")
async def get_uploaded_image(filename: str):
    """Serve uploaded images."""
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Determine content type
    ext = Path(filename).suffix.lower()
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp"
    }
    content_type = content_types.get(ext, "application/octet-stream")
    
    return FileResponse(file_path, media_type=content_type)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
