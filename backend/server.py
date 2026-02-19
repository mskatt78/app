from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Depends
from fastapi.responses import JSONResponse
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

ROOT_DIR = Path(__file__).parent
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

@api_router.get("/oracle/cards")
async def get_oracle_cards():
    """Get all oracle cards."""
    return ORACLE_CARDS

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

YOGA_POSES = [
    # EARTH ELEMENT POSES - Grounding, Stability, Root Connection
    {"id": "1", "name": "Mountain Pose", "sanskrit_name": "Tadasana", "element": "Earth", "description": "Stand tall like a mountain, rooted and stable. This foundational pose connects you to the earth element and your own inner strength.", "benefits": ["Improves posture", "Strengthens legs", "Grounds energy"], "chakras": ["Root"], "duration_minutes": 3},
    {"id": "2", "name": "Tree Pose", "sanskrit_name": "Vrksasana", "element": "Earth", "description": "Like a sacred tree, roots deep and branches reaching skyward. Balance between earth and sky.", "benefits": ["Improves balance", "Strengthens ankles", "Opens hips"], "chakras": ["Root", "Heart"], "duration_minutes": 3},
    {"id": "3", "name": "Bridge Pose", "sanskrit_name": "Setu Bandhasana", "element": "Earth", "description": "Create a bridge between earth and sky, opening the heart to receive.", "benefits": ["Opens chest", "Strengthens glutes", "Reduces anxiety"], "chakras": ["Heart", "Throat"], "duration_minutes": 5},
    {"id": "4", "name": "Garland Pose", "sanskrit_name": "Malasana", "element": "Earth", "description": "Deep squat connecting to primal earth energy. Opens the hips and grounds the spirit.", "benefits": ["Opens hips", "Strengthens ankles", "Aids digestion"], "chakras": ["Root", "Sacral"], "duration_minutes": 3},
    {"id": "5", "name": "Extended Triangle", "sanskrit_name": "Utthita Trikonasana", "element": "Earth", "description": "Form the sacred triangle, connecting three points of power between earth and cosmos.", "benefits": ["Stretches legs", "Opens chest", "Improves balance"], "chakras": ["Root", "Sacral"], "duration_minutes": 5},
    {"id": "6", "name": "Wide-Legged Forward Fold", "sanskrit_name": "Prasarita Padottanasana", "element": "Earth", "description": "Bow to the earth with legs wide, letting gravity draw you into surrender.", "benefits": ["Stretches hamstrings", "Calms mind", "Strengthens legs"], "chakras": ["Root", "Third Eye"], "duration_minutes": 5},
    {"id": "7", "name": "Chair Pose", "sanskrit_name": "Utkatasana", "element": "Earth", "description": "Sit into an invisible throne, building inner fire while staying rooted.", "benefits": ["Strengthens thighs", "Builds stamina", "Tones core"], "chakras": ["Root", "Solar Plexus"], "duration_minutes": 3},
    {"id": "8", "name": "Standing Forward Fold", "sanskrit_name": "Uttanasana", "element": "Earth", "description": "Fold forward, letting the crown descend toward Mother Earth in humble surrender.", "benefits": ["Calms nervous system", "Stretches spine", "Relieves tension"], "chakras": ["Root", "Crown"], "duration_minutes": 5},
    {"id": "9", "name": "Goddess Pose", "sanskrit_name": "Utkata Konasana", "element": "Earth", "description": "Embody the fierce divine feminine, rooted in power and open in heart.", "benefits": ["Strengthens legs", "Opens hips", "Builds heat"], "chakras": ["Root", "Sacral"], "duration_minutes": 3},
    {"id": "10", "name": "Half Moon Pose", "sanskrit_name": "Ardha Chandrasana", "element": "Earth", "description": "Balance on one leg like the half moon, grounded yet reaching toward the stars.", "benefits": ["Improves balance", "Strengthens core", "Opens hips"], "chakras": ["Root", "Sacral"], "duration_minutes": 3},
    
    # FIRE ELEMENT POSES - Transformation, Power, Energy
    {"id": "11", "name": "Warrior I", "sanskrit_name": "Virabhadrasana I", "element": "Fire", "description": "Embody the warrior spirit with fierce determination and open heart.", "benefits": ["Builds strength", "Opens chest", "Increases stamina"], "chakras": ["Solar Plexus", "Heart"], "duration_minutes": 5},
    {"id": "12", "name": "Warrior II", "sanskrit_name": "Virabhadrasana II", "element": "Fire", "description": "Stand in your power, gaze fixed on your intention, arms extended in all directions.", "benefits": ["Strengthens legs", "Opens hips", "Builds focus"], "chakras": ["Solar Plexus", "Sacral"], "duration_minutes": 5},
    {"id": "13", "name": "Warrior III", "sanskrit_name": "Virabhadrasana III", "element": "Fire", "description": "Fly like an arrow toward your destiny, balanced and powerful.", "benefits": ["Improves balance", "Strengthens core", "Builds focus"], "chakras": ["Solar Plexus"], "duration_minutes": 3},
    {"id": "14", "name": "Cobra Pose", "sanskrit_name": "Bhujangasana", "element": "Fire", "description": "Rise like the sacred serpent, awakening kundalini energy up the spine.", "benefits": ["Opens heart", "Strengthens spine", "Awakens energy"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "15", "name": "Upward Facing Dog", "sanskrit_name": "Urdhva Mukha Svanasana", "element": "Fire", "description": "Lift your heart to the sun, chest proud and spine awakened.", "benefits": ["Opens chest", "Strengthens arms", "Energizes body"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "16", "name": "Boat Pose", "sanskrit_name": "Navasana", "element": "Fire", "description": "Balance on your sit bones like a vessel of light, core engaged and spirit strong.", "benefits": ["Strengthens core", "Improves balance", "Builds determination"], "chakras": ["Solar Plexus"], "duration_minutes": 3},
    {"id": "17", "name": "Plank Pose", "sanskrit_name": "Phalakasana", "element": "Fire", "description": "Hold strong like a sacred plank, building inner fire and resolve.", "benefits": ["Strengthens core", "Tones arms", "Builds endurance"], "chakras": ["Solar Plexus"], "duration_minutes": 3},
    {"id": "18", "name": "Side Plank", "sanskrit_name": "Vasisthasana", "element": "Fire", "description": "Balance on one arm, body aligned like a blade of light.", "benefits": ["Strengthens arms", "Improves balance", "Tones obliques"], "chakras": ["Solar Plexus", "Heart"], "duration_minutes": 3},
    {"id": "19", "name": "Reverse Warrior", "sanskrit_name": "Viparita Virabhadrasana", "element": "Fire", "description": "Arch back in triumphant glory, heart open to the heavens.", "benefits": ["Stretches side body", "Opens chest", "Builds strength"], "chakras": ["Solar Plexus", "Heart"], "duration_minutes": 3},
    {"id": "20", "name": "Crow Pose", "sanskrit_name": "Bakasana", "element": "Fire", "description": "Take flight like the crow messenger, balancing strength and lightness.", "benefits": ["Builds arm strength", "Improves balance", "Builds confidence"], "chakras": ["Solar Plexus", "Root"], "duration_minutes": 3},
    {"id": "21", "name": "Locust Pose", "sanskrit_name": "Salabhasana", "element": "Fire", "description": "Lift like the sacred locust, back strong and heart lifted.", "benefits": ["Strengthens back", "Opens chest", "Improves posture"], "chakras": ["Solar Plexus", "Heart"], "duration_minutes": 3},
    {"id": "22", "name": "Bow Pose", "sanskrit_name": "Dhanurasana", "element": "Fire", "description": "Become the bow of transformation, tension creating potential energy.", "benefits": ["Opens chest", "Strengthens back", "Energizes body"], "chakras": ["Heart", "Solar Plexus"], "duration_minutes": 3},
    
    # WATER ELEMENT POSES - Flow, Surrender, Emotion
    {"id": "23", "name": "Child's Pose", "sanskrit_name": "Balasana", "element": "Water", "description": "Return to the womb of the Earth Mother. Surrender and receive comfort.", "benefits": ["Releases back tension", "Calms nervous system", "Promotes introspection"], "chakras": ["Third Eye"], "duration_minutes": 5},
    {"id": "24", "name": "Seated Forward Fold", "sanskrit_name": "Paschimottanasana", "element": "Water", "description": "Bow forward in surrender, releasing into the flow of letting go.", "benefits": ["Calms mind", "Stretches hamstrings", "Massages organs"], "chakras": ["Sacral", "Solar Plexus"], "duration_minutes": 5},
    {"id": "25", "name": "Pigeon Pose", "sanskrit_name": "Kapotasana", "element": "Water", "description": "Open the hips where emotions are stored, releasing what no longer serves.", "benefits": ["Opens hips", "Releases emotions", "Stretches thighs"], "chakras": ["Sacral", "Root"], "duration_minutes": 5},
    {"id": "26", "name": "Reclined Bound Angle", "sanskrit_name": "Supta Baddha Konasana", "element": "Water", "description": "Lie back and open like a flower, receiving the flow of life.", "benefits": ["Opens hips", "Calms mind", "Releases tension"], "chakras": ["Sacral", "Heart"], "duration_minutes": 5},
    {"id": "27", "name": "Happy Baby Pose", "sanskrit_name": "Ananda Balasana", "element": "Water", "description": "Return to childlike joy, releasing tension and embracing playfulness.", "benefits": ["Releases lower back", "Opens hips", "Calms mind"], "chakras": ["Sacral", "Root"], "duration_minutes": 3},
    {"id": "28", "name": "Supine Twist", "sanskrit_name": "Supta Matsyendrasana", "element": "Water", "description": "Twist and release like water finding its natural course.", "benefits": ["Releases spine", "Aids digestion", "Calms nervous system"], "chakras": ["Sacral", "Solar Plexus"], "duration_minutes": 5},
    {"id": "29", "name": "Legs Up the Wall", "sanskrit_name": "Viparita Karani", "element": "Water", "description": "Reverse the flow, letting blood return to heart and mind clear.", "benefits": ["Reduces anxiety", "Improves circulation", "Calms mind"], "chakras": ["Crown", "Third Eye"], "duration_minutes": 10},
    {"id": "30", "name": "Fish Pose", "sanskrit_name": "Matsyasana", "element": "Water", "description": "Float like a sacred fish, heart open to the cosmic ocean.", "benefits": ["Opens chest", "Stretches throat", "Relieves tension"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "31", "name": "Frog Pose", "sanskrit_name": "Mandukasana", "element": "Water", "description": "Open like the sacred frog, connecting to water medicine and transformation.", "benefits": ["Opens hips", "Stretches groin", "Releases emotions"], "chakras": ["Sacral", "Root"], "duration_minutes": 5},
    {"id": "32", "name": "Cat-Cow Flow", "sanskrit_name": "Marjaryasana-Bitilasana", "element": "Water", "description": "Flow between arching and rounding, spine moving like waves.", "benefits": ["Warms spine", "Releases tension", "Improves flexibility"], "chakras": ["All Spine"], "duration_minutes": 5},
    {"id": "33", "name": "Thread the Needle", "sanskrit_name": "Parsva Balasana", "element": "Water", "description": "Thread through and release the shoulders, letting tension flow away.", "benefits": ["Releases shoulders", "Stretches spine", "Calms mind"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "34", "name": "Sleeping Swan", "sanskrit_name": "Eka Pada Rajakapotasana", "element": "Water", "description": "Surrender forward over the hip, releasing deep emotional holdings.", "benefits": ["Deep hip opener", "Emotional release", "Calms mind"], "chakras": ["Sacral", "Heart"], "duration_minutes": 5},
    
    # AIR ELEMENT POSES - Breath, Lightness, Freedom
    {"id": "35", "name": "Downward Dog", "sanskrit_name": "Adho Mukha Svanasana", "element": "Air", "description": "Create an inverted V, connecting earth and sky. Let gravity release tension.", "benefits": ["Stretches spine", "Calms mind", "Energizes body"], "chakras": ["Third Eye", "Crown"], "duration_minutes": 5},
    {"id": "36", "name": "Eagle Pose", "sanskrit_name": "Garudasana", "element": "Air", "description": "Wrap and squeeze like the sacred eagle, then release and soar.", "benefits": ["Improves focus", "Stretches shoulders", "Strengthens legs"], "chakras": ["Third Eye", "Root"], "duration_minutes": 3},
    {"id": "37", "name": "Extended Side Angle", "sanskrit_name": "Utthita Parsvakonasana", "element": "Air", "description": "Extend from earth to sky, creating one long line of energy.", "benefits": ["Stretches side body", "Strengthens legs", "Opens chest"], "chakras": ["Heart", "Solar Plexus"], "duration_minutes": 5},
    {"id": "38", "name": "Camel Pose", "sanskrit_name": "Ustrasana", "element": "Air", "description": "Arch back into the infinite sky, heart wide open and vulnerable.", "benefits": ["Opens heart", "Stretches front body", "Builds courage"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "39", "name": "Dancer Pose", "sanskrit_name": "Natarajasana", "element": "Air", "description": "Dance like Shiva, balancing destruction and creation in graceful poise.", "benefits": ["Improves balance", "Opens shoulders", "Builds focus"], "chakras": ["Heart", "Crown"], "duration_minutes": 3},
    {"id": "40", "name": "Wheel Pose", "sanskrit_name": "Urdhva Dhanurasana", "element": "Air", "description": "Become the wheel of life, heart lifted toward the heavens.", "benefits": ["Opens entire front body", "Energizes", "Builds strength"], "chakras": ["Heart", "All"], "duration_minutes": 3},
    {"id": "41", "name": "Headstand", "sanskrit_name": "Sirsasana", "element": "Air", "description": "Invert your world, crown connecting to earth while feet reach for sky.", "benefits": ["Improves focus", "Builds core strength", "Calms mind"], "chakras": ["Crown", "Third Eye"], "duration_minutes": 5},
    {"id": "42", "name": "Shoulder Stand", "sanskrit_name": "Sarvangasana", "element": "Air", "description": "The queen of poses, inverting perspective and calming the spirit.", "benefits": ["Calms nervous system", "Improves circulation", "Balances hormones"], "chakras": ["Throat", "Third Eye"], "duration_minutes": 5},
    {"id": "43", "name": "Plow Pose", "sanskrit_name": "Halasana", "element": "Air", "description": "Fold over like a plow preparing sacred earth for new growth.", "benefits": ["Stretches spine", "Calms mind", "Stimulates thyroid"], "chakras": ["Throat", "Third Eye"], "duration_minutes": 3},
    {"id": "44", "name": "Wild Thing", "sanskrit_name": "Camatkarasana", "element": "Air", "description": "Flip open into ecstatic expression, heart spiraling toward the sky.", "benefits": ["Opens chest", "Builds arm strength", "Energizes"], "chakras": ["Heart", "Throat"], "duration_minutes": 3},
    {"id": "45", "name": "Revolved Triangle", "sanskrit_name": "Parivrtta Trikonasana", "element": "Air", "description": "Twist the triangle, wringing out stagnation and inviting fresh energy.", "benefits": ["Detoxifies", "Improves balance", "Stretches spine"], "chakras": ["Solar Plexus", "Heart"], "duration_minutes": 3},
    {"id": "46", "name": "Bird of Paradise", "sanskrit_name": "Svarga Dvijasana", "element": "Air", "description": "Unfold into the exotic bird, expressing your fullest wingspan.", "benefits": ["Opens hips", "Builds balance", "Stretches hamstrings"], "chakras": ["Heart", "Sacral"], "duration_minutes": 3},
    
    # SPIRIT ELEMENT POSES - Meditation, Connection, Transcendence
    {"id": "47", "name": "Corpse Pose", "sanskrit_name": "Savasana", "element": "Spirit", "description": "Complete surrender. Die to the old, be reborn in stillness.", "benefits": ["Deep relaxation", "Integrates practice", "Reduces stress"], "chakras": ["All"], "duration_minutes": 10},
    {"id": "48", "name": "Easy Pose", "sanskrit_name": "Sukhasana", "element": "Spirit", "description": "Sit in sacred simplicity, spine tall and heart open to receive.", "benefits": ["Calms mind", "Opens hips", "Promotes meditation"], "chakras": ["All"], "duration_minutes": 10},
    {"id": "49", "name": "Lotus Pose", "sanskrit_name": "Padmasana", "element": "Spirit", "description": "Bloom like the sacred lotus, rooted in mud yet reaching for light.", "benefits": ["Deep meditation", "Opens hips", "Calms mind"], "chakras": ["Crown", "Root"], "duration_minutes": 10},
    {"id": "50", "name": "Hero Pose", "sanskrit_name": "Virasana", "element": "Spirit", "description": "Sit like the inner hero, grounded in courage and open to truth.", "benefits": ["Stretches thighs", "Improves posture", "Calms mind"], "chakras": ["Root", "Heart"], "duration_minutes": 5},
    {"id": "51", "name": "Staff Pose", "sanskrit_name": "Dandasana", "element": "Spirit", "description": "Sit with spine like a sacred staff, energy flowing freely.", "benefits": ["Improves posture", "Strengthens back", "Grounds energy"], "chakras": ["Root", "Crown"], "duration_minutes": 3},
    {"id": "52", "name": "Fire Log Pose", "sanskrit_name": "Agnistambhasana", "element": "Spirit", "description": "Stack the legs like sacred fire logs, opening deep into the hips.", "benefits": ["Opens hips", "Calms mind", "Releases tension"], "chakras": ["Root", "Sacral"], "duration_minutes": 5},
    {"id": "53", "name": "Seated Meditation", "sanskrit_name": "Dhyana", "element": "Spirit", "description": "Enter the sacred silence, witnessing the infinite within.", "benefits": ["Calms mind", "Reduces stress", "Connects to source"], "chakras": ["All"], "duration_minutes": 15},
    {"id": "54", "name": "Prayer Pose", "sanskrit_name": "Anjali Mudra", "element": "Spirit", "description": "Hands at heart in sacred gesture, honoring the divine in all.", "benefits": ["Centers energy", "Calms mind", "Opens heart"], "chakras": ["Heart"], "duration_minutes": 3},
    {"id": "55", "name": "Standing Split", "sanskrit_name": "Urdhva Prasarita Eka Padasana", "element": "Spirit", "description": "Split between earth and heaven, one leg rooted, one reaching for stars.", "benefits": ["Stretches hamstrings", "Improves balance", "Calms mind"], "chakras": ["Root", "Crown"], "duration_minutes": 3},
    {"id": "56", "name": "Supported Headstand", "sanskrit_name": "Salamba Sirsasana", "element": "Spirit", "description": "The king of poses, crown to earth, seeing the world anew.", "benefits": ["Reverses perspective", "Builds focus", "Calms mind"], "chakras": ["Crown"], "duration_minutes": 5},
    {"id": "57", "name": "Firefly Pose", "sanskrit_name": "Tittibhasana", "element": "Spirit", "description": "Lift and glow like the sacred firefly, light emerging from darkness.", "benefits": ["Builds arm strength", "Opens hips", "Builds confidence"], "chakras": ["Solar Plexus", "Sacral"], "duration_minutes": 3},
    {"id": "58", "name": "Eight Angle Pose", "sanskrit_name": "Astavakrasana", "element": "Spirit", "description": "Twist into eight angles, honoring the sage who transcended limitation.", "benefits": ["Builds arm strength", "Improves balance", "Detoxifies"], "chakras": ["Solar Plexus"], "duration_minutes": 3},
    {"id": "59", "name": "Embryo Pose", "sanskrit_name": "Pindasana", "element": "Spirit", "description": "Curl into the cosmic embryo, returning to the void of creation.", "benefits": ["Deep relaxation", "Calms nervous system", "Promotes introspection"], "chakras": ["Third Eye", "Crown"], "duration_minutes": 5},
    {"id": "60", "name": "Thunderbolt Pose", "sanskrit_name": "Vajrasana", "element": "Spirit", "description": "Sit firm like the thunderbolt, channeling diamond clarity.", "benefits": ["Aids digestion", "Calms mind", "Strengthens legs"], "chakras": ["Root", "Solar Plexus"], "duration_minutes": 5},
]

@api_router.get("/yoga/poses")
async def get_yoga_poses(element: Optional[str] = None):
    """Get yoga poses, optionally filtered by element."""
    poses = YOGA_POSES
    if element:
        poses = [p for p in poses if p["element"].lower() == element.lower()]
    return poses

@api_router.get("/yoga/poses/{pose_id}")
async def get_yoga_pose(pose_id: str):
    """Get a specific yoga pose."""
    pose = next((p for p in YOGA_POSES if p["id"] == pose_id), None)
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    return pose

# ============ BREATHWORK ROUTES ============

BREATHWORK_SESSIONS = [
    {"id": "1", "name": "Earth Grounding Breath", "element": "Earth", "description": "Connect deeply with Mother Earth through slow, rhythmic breathing.", "duration_minutes": 10, "pattern": {"inhale": 4, "hold": 4, "exhale": 6, "hold_empty": 2}, "benefits": ["Grounding", "Reduces anxiety", "Connects to earth energy"]},
    {"id": "2", "name": "Fire Breath (Kapalabhati)", "element": "Fire", "description": "Ignite your inner fire with rapid, powerful exhalations.", "duration_minutes": 5, "pattern": {"inhale": 1, "hold": 0, "exhale": 1, "hold_empty": 0}, "benefits": ["Energizes", "Detoxifies", "Awakens kundalini"]},
    {"id": "3", "name": "Ocean Breath (Ujjayi)", "element": "Water", "description": "Create the sound of ocean waves, flowing with liquid grace.", "duration_minutes": 15, "pattern": {"inhale": 4, "hold": 0, "exhale": 6, "hold_empty": 0}, "benefits": ["Calms mind", "Warms body", "Promotes flow"]},
    {"id": "4", "name": "Wind Clearing Breath", "element": "Air", "description": "Clear stagnant energy with alternate nostril breathing.", "duration_minutes": 10, "pattern": {"inhale": 4, "hold": 4, "exhale": 4, "hold_empty": 0}, "benefits": ["Balances hemispheres", "Clears mind", "Purifies nadis"]},
    {"id": "5", "name": "Spirit Journey Breath", "element": "Spirit", "description": "Deep rhythmic breathing for shamanic journeying and vision.", "duration_minutes": 20, "pattern": {"inhale": 3, "hold": 0, "exhale": 3, "hold_empty": 0}, "benefits": ["Altered states", "Spiritual connection", "Deep release"]},
    {"id": "6", "name": "4-7-8 Relaxation", "element": "Water", "description": "Ancient technique for deep relaxation and sleep preparation.", "duration_minutes": 10, "pattern": {"inhale": 4, "hold": 7, "exhale": 8, "hold_empty": 0}, "benefits": ["Promotes sleep", "Reduces stress", "Calms nervous system"]},
]

@api_router.get("/breathwork/sessions")
async def get_breathwork_sessions(element: Optional[str] = None):
    """Get breathwork sessions, optionally filtered by element."""
    sessions = BREATHWORK_SESSIONS
    if element:
        sessions = [s for s in sessions if s["element"].lower() == element.lower()]
    return sessions

@api_router.get("/breathwork/sessions/{session_id}")
async def get_breathwork_session(session_id: str):
    """Get a specific breathwork session."""
    session = next((s for s in BREATHWORK_SESSIONS if s["id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

# ============ CRYSTALS ROUTES ============

CRYSTALS = [
    {"id": "1", "name": "Clear Quartz", "element": "Spirit", "chakras": ["Crown", "All"], "properties": ["Amplification", "Clarity", "Programming"], "description": "The master healer and energy amplifier. Clear quartz is like a blank canvas that can be programmed with any intention."},
    {"id": "2", "name": "Amethyst", "element": "Air", "chakras": ["Third Eye", "Crown"], "properties": ["Intuition", "Protection", "Spiritual Growth"], "description": "The stone of spiritual wisdom and psychic abilities. Opens the third eye and connects to higher realms."},
    {"id": "3", "name": "Rose Quartz", "element": "Water", "chakras": ["Heart"], "properties": ["Love", "Compassion", "Emotional Healing"], "description": "The stone of unconditional love. Opens the heart chakra to give and receive love."},
    {"id": "4", "name": "Black Tourmaline", "element": "Earth", "chakras": ["Root"], "properties": ["Protection", "Grounding", "EMF Shield"], "description": "The ultimate protection stone. Creates a shield against negative energies and grounds to the earth."},
    {"id": "5", "name": "Citrine", "element": "Fire", "chakras": ["Solar Plexus", "Sacral"], "properties": ["Abundance", "Joy", "Manifestation"], "description": "The merchant's stone of abundance and personal power. Attracts prosperity and success."},
    {"id": "6", "name": "Selenite", "element": "Spirit", "chakras": ["Crown", "Third Eye"], "properties": ["Cleansing", "Connection", "Clarity"], "description": "Named after the moon goddess Selene. Cleanses and charges other crystals."},
    {"id": "7", "name": "Obsidian", "element": "Fire", "chakras": ["Root"], "properties": ["Shadow Work", "Protection", "Truth"], "description": "Volcanic glass for deep shadow work and facing inner truths."},
    {"id": "8", "name": "Turquoise", "element": "Water", "chakras": ["Throat", "Heart"], "properties": ["Communication", "Protection", "Healing"], "description": "Sacred stone of many indigenous traditions. Bridges earth and sky."},
    {"id": "9", "name": "Labradorite", "element": "Air", "chakras": ["Third Eye", "Throat"], "properties": ["Magic", "Protection", "Transformation"], "description": "Stone of magic and transformation with iridescent flash."},
    {"id": "10", "name": "Carnelian", "element": "Fire", "chakras": ["Sacral", "Root"], "properties": ["Creativity", "Courage", "Vitality"], "description": "Ignites creative fire and passion for life."},
    {"id": "11", "name": "Moonstone", "element": "Water", "chakras": ["Crown", "Third Eye", "Sacral"], "properties": ["Intuition", "Cycles", "Divine Feminine"], "description": "Stone of the divine feminine and lunar cycles."},
    {"id": "12", "name": "Smoky Quartz", "element": "Earth", "chakras": ["Root"], "properties": ["Grounding", "Transmutation", "Protection"], "description": "Transmutes negative energy into positive. Deep grounding."},
]

@api_router.get("/crystals")
async def get_crystals(element: Optional[str] = None, chakra: Optional[str] = None):
    """Get crystals, optionally filtered by element or chakra."""
    crystals = CRYSTALS
    if element:
        crystals = [c for c in crystals if c["element"].lower() == element.lower()]
    if chakra:
        crystals = [c for c in crystals if any(chakra.lower() in ch.lower() for ch in c["chakras"])]
    return crystals

@api_router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str):
    """Get a specific crystal."""
    crystal = next((c for c in CRYSTALS if c["id"] == crystal_id), None)
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal

# ============ MANTRAS ROUTES ============

MANTRAS = [
    {"id": "1", "name": "Om", "sanskrit": "ॐ", "translation": "The sound of the universe, the primordial vibration", "element": "Spirit", "chakra": "Crown", "benefits": ["Universal connection", "Calms mind", "Raises vibration"], "audio_url": "https://upload.wikimedia.org/wikipedia/commons/7/77/Om.ogg", "duration_seconds": 10, "repetitions": 108},
    {"id": "2", "name": "Om Mani Padme Hum", "sanskrit": "ॐ मणि पद्मे हूँ", "translation": "The jewel is in the lotus", "element": "Spirit", "chakra": "Heart", "benefits": ["Compassion", "Purification", "Wisdom"], "audio_url": None, "duration_seconds": 15, "repetitions": 108},
    {"id": "3", "name": "Lokah Samastah Sukhino Bhavantu", "sanskrit": "लोकाः समस्ताः सुखिनो भवन्तु", "translation": "May all beings everywhere be happy and free", "element": "Water", "chakra": "Heart", "benefits": ["Universal love", "Peace", "Interconnection"], "audio_url": None, "duration_seconds": 20, "repetitions": 27},
    {"id": "4", "name": "So Hum", "sanskrit": "सो ऽहम्", "translation": "I am that (the universe)", "element": "Air", "chakra": "Third Eye", "benefits": ["Self-realization", "Breath awareness", "Unity"], "audio_url": None, "duration_seconds": 8, "repetitions": 108},
    {"id": "5", "name": "Sat Nam", "sanskrit": "सत् नाम्", "translation": "Truth is my identity", "element": "Spirit", "chakra": "Throat", "benefits": ["Authenticity", "Truth", "Identity"], "audio_url": None, "duration_seconds": 6, "repetitions": 108},
    {"id": "6", "name": "Om Namah Shivaya", "sanskrit": "ॐ नमः शिवाय", "translation": "I bow to Shiva (the transformer)", "element": "Fire", "chakra": "Third Eye", "benefits": ["Transformation", "Inner peace", "Destruction of ego"], "audio_url": None, "duration_seconds": 12, "repetitions": 108},
    {"id": "7", "name": "Gayatri Mantra", "sanskrit": "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं", "translation": "We meditate on the glory of the Creator who illuminates all", "element": "Fire", "chakra": "Solar Plexus", "benefits": ["Illumination", "Wisdom", "Vitality"], "audio_url": None, "duration_seconds": 25, "repetitions": 108},
    {"id": "8", "name": "Ham Sa", "sanskrit": "हंस", "translation": "I am the divine swan", "element": "Air", "chakra": "Throat", "benefits": ["Discrimination", "Purity", "Grace"], "audio_url": None, "duration_seconds": 6, "repetitions": 108},
    {"id": "9", "name": "Om Gam Ganapataye Namaha", "sanskrit": "ॐ गं गणपतये नमः", "translation": "Salutations to Ganesha, remover of obstacles", "element": "Earth", "chakra": "Root", "benefits": ["Removes obstacles", "New beginnings", "Success"], "audio_url": None, "duration_seconds": 15, "repetitions": 108},
    {"id": "10", "name": "Ra Ma Da Sa", "sanskrit": None, "translation": "Sun, Moon, Earth, Infinity - healing mantra", "element": "Water", "chakra": "Heart", "benefits": ["Healing", "Balance", "Connection to elements"], "audio_url": None, "duration_seconds": 20, "repetitions": 11},
    {"id": "11", "name": "Aham Brahmasmi", "sanskrit": "अहं ब्रह्मास्मि", "translation": "I am the universe, I am Brahman", "element": "Spirit", "chakra": "Crown", "benefits": ["Self-realization", "Unity consciousness", "Expansion"], "audio_url": None, "duration_seconds": 10, "repetitions": 21},
    {"id": "12", "name": "Om Shanti Shanti Shanti", "sanskrit": "ॐ शान्तिः शान्तिः शान्तिः", "translation": "Peace in body, mind, and spirit", "element": "Water", "chakra": "All", "benefits": ["Deep peace", "Calms mind", "Harmony"], "audio_url": None, "duration_seconds": 12, "repetitions": 3},
]

@api_router.get("/mantras")
async def get_mantras(element: Optional[str] = None):
    """Get mantras, optionally filtered by element."""
    mantras = MANTRAS
    if element:
        mantras = [m for m in mantras if m["element"].lower() == element.lower()]
    return mantras

# ============ MUDRAS ROUTES ============

MUDRAS = [
    {"id": "1", "name": "Gyan Mudra", "sanskrit_name": "Jnana Mudra", "element": "Air", "description": "Touch thumb to index finger, other fingers extended. The gesture of knowledge and wisdom.", "benefits": ["Mental clarity", "Concentration", "Wisdom"], "image_url": None},
    {"id": "2", "name": "Anjali Mudra", "sanskrit_name": "Namaste", "element": "Spirit", "description": "Palms pressed together at heart. The gesture of greeting and honoring the divine in all.", "benefits": ["Heart opening", "Gratitude", "Connection"], "image_url": None},
    {"id": "3", "name": "Dhyana Mudra", "sanskrit_name": "Meditation Mudra", "element": "Water", "description": "Hands in lap, right over left, thumbs touching. Deep meditation gesture.", "benefits": ["Deep meditation", "Inner peace", "Concentration"], "image_url": None},
    {"id": "4", "name": "Prithvi Mudra", "sanskrit_name": "Earth Mudra", "element": "Earth", "description": "Thumb touches ring finger. Connects to earth element and stability.", "benefits": ["Grounding", "Stability", "Physical strength"], "image_url": None},
    {"id": "5", "name": "Varuna Mudra", "sanskrit_name": "Water Mudra", "element": "Water", "description": "Thumb touches little finger. Balances water element in body.", "benefits": ["Emotional balance", "Hydration", "Flexibility"], "image_url": None},
    {"id": "6", "name": "Agni Mudra", "sanskrit_name": "Fire Mudra", "element": "Fire", "description": "Fold ring finger to palm, thumb pressing on it. Increases internal fire.", "benefits": ["Metabolism", "Digestion", "Transformation"], "image_url": None},
    {"id": "7", "name": "Vayu Mudra", "sanskrit_name": "Air Mudra", "element": "Air", "description": "Fold index finger to palm, thumb pressing on it. Balances air element.", "benefits": ["Calms anxiety", "Reduces gas", "Mental clarity"], "image_url": None},
    {"id": "8", "name": "Shuni Mudra", "sanskrit_name": "Saturn Mudra", "element": "Earth", "description": "Thumb touches middle finger. Patience and discipline.", "benefits": ["Patience", "Discipline", "Responsibility"], "image_url": None},
    {"id": "9", "name": "Surya Mudra", "sanskrit_name": "Sun Mudra", "element": "Fire", "description": "Bend ring finger to touch base of thumb, thumb presses on ring finger.", "benefits": ["Increases fire element", "Weight management", "Warmth"], "image_url": None},
    {"id": "10", "name": "Prana Mudra", "sanskrit_name": "Life Force Mudra", "element": "Spirit", "description": "Touch tips of ring and little finger to thumb tip.", "benefits": ["Increases vitality", "Reduces fatigue", "Awakens dormant energy"], "image_url": None},
    {"id": "11", "name": "Apana Mudra", "sanskrit_name": "Downward Energy Mudra", "element": "Earth", "description": "Touch tips of middle and ring finger to thumb tip.", "benefits": ["Detoxification", "Elimination", "Grounding"], "image_url": None},
    {"id": "12", "name": "Chin Mudra", "sanskrit_name": "Consciousness Mudra", "element": "Air", "description": "Like Gyan mudra but palms face down. Grounds consciousness.", "benefits": ["Grounded awareness", "Meditation", "Mental stability"], "image_url": None},
]

@api_router.get("/mudras")
async def get_mudras(element: Optional[str] = None):
    """Get mudras, optionally filtered by element."""
    mudras = MUDRAS
    if element:
        mudras = [m for m in mudras if m["element"].lower() == element.lower()]
    return mudras

# ============ 13-MONTH ASTROLOGY ROUTES ============

THIRTEEN_MONTH_CALENDAR = [
    {"id": "1", "month_number": 1, "name": "Wolf Moon", "symbol": "Wolf", "element": "Earth", "dates": "Dec 21 - Jan 17", "description": "Time of the wolf pack, community, and inner guidance. The longest nights invite deep introspection.", "themes": ["Community", "Intuition", "Survival", "Inner guidance"], "crystals": ["Black Tourmaline", "Smoky Quartz"], "practices": ["Shadow work", "Pack meditation", "Night journeys"]},
    {"id": "2", "month_number": 2, "name": "Storm Moon", "symbol": "Thunder", "element": "Fire", "dates": "Jan 18 - Feb 14", "description": "Purification through storm energy. Lightning illuminates truth and clears stagnation.", "themes": ["Purification", "Truth", "Awakening", "Release"], "crystals": ["Clear Quartz", "Labradorite"], "practices": ["Thunder meditation", "Energy clearing", "Storm dance"]},
    {"id": "3", "month_number": 3, "name": "Crow Moon", "symbol": "Crow", "element": "Air", "dates": "Feb 15 - Mar 14", "description": "The crow brings messages from the spirit world. Magic stirs as winter breaks.", "themes": ["Magic", "Messages", "Transformation", "Creation"], "crystals": ["Amethyst", "Obsidian"], "practices": ["Divination", "Dream work", "Crow meditation"]},
    {"id": "4", "month_number": 4, "name": "Seed Moon", "symbol": "Seed", "element": "Earth", "dates": "Mar 15 - Apr 11", "description": "Spring equinox energy. Time to plant seeds of intention in fertile ground.", "themes": ["New beginnings", "Planting", "Fertility", "Hope"], "crystals": ["Green Aventurine", "Moss Agate"], "practices": ["Intention setting", "Earth ceremonies", "Seed meditation"]},
    {"id": "5", "month_number": 5, "name": "Hare Moon", "symbol": "Hare", "element": "Water", "dates": "Apr 12 - May 9", "description": "The hare's fertility and playfulness. Joy returns with spring's full bloom.", "themes": ["Fertility", "Joy", "Playfulness", "Abundance"], "crystals": ["Rose Quartz", "Moonstone"], "practices": ["Fertility rituals", "Dance", "Joy ceremonies"]},
    {"id": "6", "month_number": 6, "name": "Dyad Moon", "symbol": "Twins", "element": "Air", "dates": "May 10 - Jun 6", "description": "The sacred twins - light and shadow, masculine and feminine united.", "themes": ["Duality", "Balance", "Partnership", "Integration"], "crystals": ["Citrine", "Tiger's Eye"], "practices": ["Shadow integration", "Partner work", "Balance rituals"]},
    {"id": "7", "month_number": 7, "name": "Mead Moon", "symbol": "Bee", "element": "Fire", "dates": "Jun 7 - Jul 4", "description": "Summer solstice energy. The bee's honey sweetens life's celebrations.", "themes": ["Celebration", "Sweetness", "Community", "Abundance"], "crystals": ["Sunstone", "Carnelian"], "practices": ["Solstice ceremony", "Honey rituals", "Fire celebration"]},
    {"id": "8", "month_number": 8, "name": "Wort Moon", "symbol": "Herb", "element": "Earth", "dates": "Jul 5 - Aug 1", "description": "Peak of plant medicine. Herbs are most potent for healing and magic.", "themes": ["Healing", "Plant medicine", "Green magic", "Harvesting"], "crystals": ["Green Jade", "Peridot"], "practices": ["Herb gathering", "Plant communication", "Green healing"]},
    {"id": "9", "month_number": 9, "name": "Barley Moon", "symbol": "Grain", "element": "Earth", "dates": "Aug 2 - Aug 29", "description": "First harvest. Gratitude for abundance and preparing for darker times.", "themes": ["Harvest", "Gratitude", "Sacrifice", "Abundance"], "crystals": ["Amber", "Citrine"], "practices": ["Harvest ceremony", "Gratitude rituals", "Bread making"]},
    {"id": "10", "month_number": 10, "name": "Wine Moon", "symbol": "Grape", "element": "Water", "dates": "Aug 30 - Sep 26", "description": "The vine's gift of transformation. What was bitter becomes sweet.", "themes": ["Transformation", "Intoxication", "Ecstasy", "Release"], "crystals": ["Amethyst", "Lepidolite"], "practices": ["Ecstatic dance", "Transformation rituals", "Release ceremonies"]},
    {"id": "11", "month_number": 11, "name": "Blood Moon", "symbol": "Stag", "element": "Fire", "dates": "Sep 27 - Oct 24", "description": "The stag's sacrifice. Honoring ancestors and the cycle of life and death.", "themes": ["Ancestors", "Sacrifice", "Death/Rebirth", "Honor"], "crystals": ["Obsidian", "Garnet"], "practices": ["Ancestor work", "Blood mysteries", "Hunt meditation"]},
    {"id": "12", "month_number": 12, "name": "Snow Moon", "symbol": "Bear", "element": "Water", "dates": "Oct 25 - Nov 21", "description": "The bear retreats to dream. Time for introspection and dream journeys.", "themes": ["Dreaming", "Introspection", "Rest", "Inner journey"], "crystals": ["Blue Lace Agate", "Howlite"], "practices": ["Dream incubation", "Bear meditation", "Deep rest"]},
    {"id": "13", "month_number": 13, "name": "Oak Moon", "symbol": "Oak", "element": "Spirit", "dates": "Nov 22 - Dec 20", "description": "The oak stands firm through winter's dark. Wisdom of the ancestors in the world tree.", "themes": ["Wisdom", "Ancestors", "World tree", "Endurance"], "crystals": ["Petrified Wood", "Smoky Quartz"], "practices": ["Tree meditation", "Ancestor ceremonies", "Winter preparation"]},
]

@api_router.get("/astrology/months")
async def get_astrology_months():
    """Get all 13 lunar months."""
    return THIRTEEN_MONTH_CALENDAR

@api_router.get("/astrology/months/{month_id}")
async def get_astrology_month(month_id: str):
    """Get a specific lunar month."""
    month = next((m for m in THIRTEEN_MONTH_CALENDAR if m["id"] == month_id), None)
    if not month:
        raise HTTPException(status_code=404, detail="Month not found")
    return month

@api_router.get("/astrology/current")
async def get_current_month():
    """Get the current lunar month based on today's date."""
    today = datetime.now()
    month_day = today.strftime("%b %d")
    
    # Simple date matching (would be more complex in production)
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
                return next(m for m in THIRTEEN_MONTH_CALENDAR if m["id"] == month_id)
        else:
            if (current_month == start_month and current_day >= start_day) or \
               (current_month == end_month and current_day <= end_day) or \
               current_month > start_month or current_month < end_month:
                return next(m for m in THIRTEEN_MONTH_CALENDAR if m["id"] == month_id)
    
    return THIRTEEN_MONTH_CALENDAR[0]

# ============ SOMATIC & GROUNDING ROUTES ============

SOMATIC_PRACTICES = [
    {"id": "1", "name": "Earth Connection", "element": "Earth", "description": "Stand barefoot on earth. Feel roots growing from your feet deep into the ground. Sense the heartbeat of Mother Earth rising through you.", "duration_minutes": 10, "benefits": ["Grounding", "Stability", "Earth connection"]},
    {"id": "2", "name": "Shake & Release", "element": "Fire", "description": "Like animals shake off stress, let your body tremor and shake freely. Release stuck energy and trauma through movement.", "duration_minutes": 15, "benefits": ["Trauma release", "Energy clearing", "Nervous system reset"]},
    {"id": "3", "name": "Water Flow", "element": "Water", "description": "Move like water - fluid, formless, following gravity. Let your body find its natural rhythm and flow.", "duration_minutes": 20, "benefits": ["Flexibility", "Emotional release", "Fluidity"]},
    {"id": "4", "name": "Wind Dance", "element": "Air", "description": "Dance as if moved by wind. Let breath guide movement. Be light, expansive, free.", "duration_minutes": 15, "benefits": ["Freedom", "Breath expansion", "Lightness"]},
    {"id": "5", "name": "Fire Stomp", "element": "Fire", "description": "Powerful stomping and arm movements. Awaken your inner warrior and burn through blocks.", "duration_minutes": 10, "benefits": ["Power", "Anger release", "Energy activation"]},
    {"id": "6", "name": "Spiral Movement", "element": "Spirit", "description": "Move in spirals - the sacred geometry of life. DNA, galaxies, and shells all spiral.", "duration_minutes": 15, "benefits": ["Integration", "Sacred geometry", "Wholeness"]},
]

GROUNDING_EXERCISES = [
    {"id": "1", "name": "5-4-3-2-1 Senses", "element": "Earth", "description": "Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste. Return fully to the present moment.", "duration_minutes": 5, "benefits": ["Presence", "Anxiety relief", "Body awareness"]},
    {"id": "2", "name": "Root Visualization", "element": "Earth", "description": "Visualize roots growing from your base down into the earth's core. Feel anchored and supported.", "duration_minutes": 10, "benefits": ["Grounding", "Security", "Stability"]},
    {"id": "3", "name": "Stone Holding", "element": "Earth", "description": "Hold a stone in each hand. Feel its weight, temperature, texture. Let earth energy flow through you.", "duration_minutes": 10, "benefits": ["Earth connection", "Calming", "Presence"]},
    {"id": "4", "name": "Barefoot Walking", "element": "Earth", "description": "Walk slowly barefoot on earth, grass, or sand. Feel every sensation. Connect with the living earth.", "duration_minutes": 15, "benefits": ["Earth connection", "Mindfulness", "Energy exchange"]},
    {"id": "5", "name": "Tree Embrace", "element": "Earth", "description": "Stand with back against a tree. Feel its strength and age. Breathe with its rhythm.", "duration_minutes": 15, "benefits": ["Tree connection", "Support", "Ancient wisdom"]},
]

@api_router.get("/somatic/practices")
async def get_somatic_practices(element: Optional[str] = None):
    """Get somatic movement practices."""
    practices = SOMATIC_PRACTICES
    if element:
        practices = [p for p in practices if p["element"].lower() == element.lower()]
    return practices

@api_router.get("/grounding/exercises")
async def get_grounding_exercises():
    """Get grounding exercises."""
    return GROUNDING_EXERCISES

# ============ DASHBOARD / USER DATA ============

@api_router.get("/dashboard/daily")
async def get_daily_guidance(user: User = Depends(get_current_user)):
    """Get personalized daily guidance."""
    import random
    
    current_month = await get_current_month()
    daily_pose = random.choice(YOGA_POSES)
    daily_crystal = random.choice(CRYSTALS)
    daily_mantra = random.choice(MANTRAS)
    daily_breathwork = random.choice(BREATHWORK_SESSIONS)
    
    return {
        "greeting": f"Blessed day, {user.name.split()[0]}",
        "current_moon": current_month,
        "daily_pose": daily_pose,
        "daily_crystal": daily_crystal,
        "daily_mantra": daily_mantra,
        "daily_breathwork": daily_breathwork,
        "element_focus": current_month["element"]
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
    
    # Enrich with actual item data
    enriched = []
    for fav in favorites:
        item_data = None
        if fav["item_type"] == "pose":
            item_data = next((p for p in YOGA_POSES if p["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "crystal":
            item_data = next((c for c in CRYSTALS if c["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "mantra":
            item_data = next((m for m in MANTRAS if m["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "mudra":
            item_data = next((m for m in MUDRAS if m["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "breathwork":
            item_data = next((b for b in BREATHWORK_SESSIONS if b["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "somatic":
            item_data = next((s for s in SOMATIC_PRACTICES if s["id"] == fav["item_id"]), None)
        elif fav["item_type"] == "grounding":
            item_data = next((g for g in GROUNDING_EXERCISES if g["id"] == fav["item_id"]), None)
        
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
    practice_type: str  # "yoga", "breathwork", "meditation", "oracle"
    practice_id: Optional[str] = None
    duration_minutes: int
    notes: Optional[str] = None

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

# ============ ROOT & HEALTH ============

@api_router.get("/")
async def root():
    return {"message": "Shamanic Elemental Yoga API", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

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
