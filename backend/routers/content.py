"""Content routes for yoga, breathwork, crystals, mantras, mudras, meditations, etc."""
from fastapi import APIRouter, HTTPException
from typing import Optional

from .dependencies import get_db

router = APIRouter(tags=["content"])


# ============ YOGA ROUTES ============

@router.get("/yoga/poses")
async def get_yoga_poses(element: Optional[str] = None, difficulty: Optional[str] = None):
    """Get yoga poses from database, optionally filtered by element or difficulty."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if difficulty:
        query["difficulty"] = {"$regex": f"^{difficulty}$", "$options": "i"}
    
    poses = await db.yoga_poses.find(query, {"_id": 0}).to_list(length=100)
    return poses


@router.get("/yoga/poses/{pose_id}")
async def get_yoga_pose(pose_id: str):
    """Get a specific yoga pose from database."""
    db = get_db()
    pose = await db.yoga_poses.find_one({"id": pose_id}, {"_id": 0})
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")
    return pose


# ============ BREATHWORK ROUTES ============

@router.get("/breathwork/sessions")
async def get_breathwork_sessions(element: Optional[str] = None):
    """Get breathwork sessions from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    sessions = await db.breathwork_sessions.find(query, {"_id": 0}).to_list(length=20)
    return sessions


@router.get("/breathwork/sessions/{session_id}")
async def get_breathwork_session(session_id: str):
    """Get a specific breathwork session from database."""
    db = get_db()
    session = await db.breathwork_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


# ============ CRYSTALS ROUTES ============

@router.get("/crystals")
async def get_crystals(element: Optional[str] = None, chakra: Optional[str] = None):
    """Get crystals from database, optionally filtered by element or chakra."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    if chakra:
        query["chakras"] = {"$regex": chakra, "$options": "i"}
    
    crystals = await db.crystals.find(query, {"_id": 0}).to_list(length=50)
    return crystals


@router.get("/crystals/{crystal_id}")
async def get_crystal(crystal_id: str):
    """Get a specific crystal from database."""
    db = get_db()
    crystal = await db.crystals.find_one({"id": crystal_id}, {"_id": 0})
    if not crystal:
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal


# ============ MANTRAS ROUTES ============

@router.get("/mantras")
async def get_mantras(element: Optional[str] = None):
    """Get mantras from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mantras = await db.mantras.find(query, {"_id": 0}).to_list(length=50)
    return mantras


# ============ MUDRAS ROUTES ============

@router.get("/mudras")
async def get_mudras(element: Optional[str] = None):
    """Get mudras from database, optionally filtered by element."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    mudras = await db.mudras.find(query, {"_id": 0}).to_list(length=50)
    return mudras


# ============ MINDFULNESS PRACTICES ============

@router.get("/mindfulness")
async def get_mindfulness_practices(category: Optional[str] = None, element: Optional[str] = None):
    """Get mindfulness practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.mindfulness_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices


# ============ GUIDED MEDITATIONS ============

@router.get("/meditations")
async def get_meditations(category: Optional[str] = None, element: Optional[str] = None):
    """Get guided meditations from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    meditations = await db.meditations.find(query, {"_id": 0}).to_list(length=50)
    return meditations


@router.get("/meditations/{meditation_id}")
async def get_meditation(meditation_id: str):
    """Get a specific meditation from database."""
    db = get_db()
    meditation = await db.meditations.find_one({"id": meditation_id}, {"_id": 0})
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    return meditation


# ============ SOMATIC PRACTICES ============

@router.get("/somatic")
async def get_somatic_practices(element: Optional[str] = None):
    """Get somatic practices from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.somatic_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices


# ============ GROUNDING EXERCISES ============

@router.get("/grounding")
async def get_grounding_exercises(element: Optional[str] = None):
    """Get grounding exercises from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    exercises = await db.grounding_exercises.find(query, {"_id": 0}).to_list(length=50)
    return exercises


# ============ PRESET RITUALS (Public) ============

@router.get("/preset-rituals")
async def get_preset_rituals(element: Optional[str] = None):
    """Get preset ritual templates."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    rituals = await db.preset_rituals.find(query, {"_id": 0}).to_list(length=50)
    return rituals


@router.get("/preset-rituals/{ritual_id}")
async def get_preset_ritual(ritual_id: str):
    """Get a specific preset ritual."""
    db = get_db()
    ritual = await db.preset_rituals.find_one({"id": ritual_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Preset ritual not found")
    return ritual


# ============ HEART PRACTICES ============

@router.get("/heart-practices")
async def get_heart_practices(category: Optional[str] = None):
    """Get heart practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    practices = await db.heart_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices


@router.get("/heart-practices/{practice_id}")
async def get_heart_practice(practice_id: str):
    """Get a specific heart practice."""
    db = get_db()
    practice = await db.heart_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Heart practice not found")
    return practice


# ============ SHAMANIC PRACTICES ============

@router.get("/shamanic-practices")
async def get_shamanic_practices(category: Optional[str] = None):
    """Get shamanic practices from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    practices = await db.shamanic_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices


@router.get("/shamanic-practices/{practice_id}")
async def get_shamanic_practice(practice_id: str):
    """Get a specific shamanic practice."""
    db = get_db()
    practice = await db.shamanic_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Shamanic practice not found")
    return practice


# ============ ELEMENTAL PRACTICES ============

@router.get("/elemental-practices")
async def get_elemental_practices(element: Optional[str] = None):
    """Get elemental practices from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    practices = await db.elemental_practices.find(query, {"_id": 0}).to_list(length=50)
    return practices


@router.get("/elemental-practices/{practice_id}")
async def get_elemental_practice(practice_id: str):
    """Get a specific elemental practice."""
    db = get_db()
    practice = await db.elemental_practices.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Elemental practice not found")
    return practice


# ============ CREATIVE PROCESSES ============

@router.get("/creative-processes")
async def get_creative_processes(category: Optional[str] = None):
    """Get creative processes from database."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    
    processes = await db.creative_processes.find(query, {"_id": 0}).to_list(length=50)
    return processes


@router.get("/creative-processes/{process_id}")
async def get_creative_process(process_id: str):
    """Get a specific creative process."""
    db = get_db()
    process = await db.creative_processes.find_one({"id": process_id}, {"_id": 0})
    if not process:
        raise HTTPException(status_code=404, detail="Creative process not found")
    return process


# ============ EARTH ALTARS ============

@router.get("/earth-altars")
async def get_earth_altars():
    """Get earth altars from database."""
    db = get_db()
    altars = await db.earth_altars.find({}, {"_id": 0}).to_list(length=50)
    return altars


@router.get("/earth-altars/{altar_id}")
async def get_earth_altar(altar_id: str):
    """Get a specific earth altar."""
    db = get_db()
    altar = await db.earth_altars.find_one({"id": altar_id}, {"_id": 0})
    if not altar:
        raise HTTPException(status_code=404, detail="Earth altar not found")
    return altar



# ============ RUNES ROUTES ============

@router.get("/runes")
async def get_runes():
    """Get all Elder Futhark runes."""
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    return runes


@router.get("/runes/{rune_id}")
async def get_rune(rune_id: str):
    """Get a specific rune."""
    db = get_db()
    rune = await db.runes.find_one({"id": rune_id}, {"_id": 0})
    if not rune:
        raise HTTPException(status_code=404, detail="Rune not found")
    return rune


@router.get("/runes/draw/single")
async def draw_single_rune():
    """Draw a single rune for daily guidance."""
    import random
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes:
        raise HTTPException(status_code=404, detail="No runes found")
    rune = random.choice(runes)
    rune["is_reversed"] = random.random() < 0.3  # 30% chance reversed
    return rune


@router.get("/runes/draw/three")
async def draw_three_runes():
    """Draw three runes for past/present/future spread."""
    import random
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes or len(runes) < 3:
        raise HTTPException(status_code=404, detail="Not enough runes found")
    selected = random.sample(runes, 3)
    positions = ["past", "present", "future"]
    result = []
    for i, rune in enumerate(selected):
        rune["position"] = positions[i]
        rune["is_reversed"] = random.random() < 0.3
        result.append(rune)
    return result


@router.get("/runes/draw/celtic-cross")
async def draw_celtic_cross():
    """Draw 10 runes for a full Celtic Cross spread."""
    import random
    db = get_db()
    runes = await db.runes.find({}, {"_id": 0}).to_list(length=30)
    if not runes or len(runes) < 10:
        raise HTTPException(status_code=404, detail="Not enough runes found")
    selected = random.sample(runes, 10)
    positions = [
        "present", "challenge", "past", "future", 
        "above", "below", "advice", "external",
        "hopes_fears", "outcome"
    ]
    position_meanings = [
        "Your current situation",
        "The challenge or obstacle",
        "The foundation/past influence",
        "The near future",
        "Your conscious goal",
        "Your subconscious influence",
        "Advice from the runes",
        "External influences",
        "Your hopes and fears",
        "The final outcome"
    ]
    result = []
    for i, rune in enumerate(selected):
        rune["position"] = positions[i]
        rune["position_meaning"] = position_meanings[i]
        rune["is_reversed"] = random.random() < 0.3
        result.append(rune)
    return result


# ============ I CHING ROUTES ============

@router.get("/i-ching")
async def get_hexagrams():
    """Get all I Ching hexagrams."""
    db = get_db()
    hexagrams = await db.i_ching.find({}, {"_id": 0}).to_list(length=70)
    return hexagrams


@router.get("/i-ching/{hexagram_number}")
async def get_hexagram(hexagram_number: int):
    """Get a specific hexagram by number."""
    db = get_db()
    hexagram = await db.i_ching.find_one({"number": hexagram_number}, {"_id": 0})
    if not hexagram:
        raise HTTPException(status_code=404, detail="Hexagram not found")
    return hexagram


@router.get("/i-ching/cast/coins")
async def cast_i_ching():
    """Cast I Ching using the three coin method."""
    import random
    db = get_db()
    
    # Simulate 6 coin tosses (3 coins each)
    lines = []
    changing_lines = []
    
    for i in range(6):
        # Each coin: heads=3, tails=2
        toss = sum(random.choice([2, 3]) for _ in range(3))
        # 6 = old yin (changing), 7 = young yang, 8 = young yin, 9 = old yang (changing)
        lines.append(toss)
        if toss == 6 or toss == 9:
            changing_lines.append(i + 1)
    
    # Convert to binary (yang=1, yin=0)
    binary_lines = [1 if l in [7, 9] else 0 for l in lines]
    hexagram_number = int(''.join(str(b) for b in reversed(binary_lines)), 2) + 1
    
    # Cap at 8 for our sample data (in full implementation, all 64 would be available)
    hexagram_number = min(hexagram_number, 8)
    
    hexagram = await db.i_ching.find_one({"number": hexagram_number}, {"_id": 0})
    if not hexagram:
        # Fallback to hexagram 1 if not found
        hexagram = await db.i_ching.find_one({"number": 1}, {"_id": 0})
    
    # Add casting details
    hexagram["lines_cast"] = lines
    hexagram["changing_lines"] = changing_lines
    hexagram["line_meanings"] = []
    
    if hexagram.get("changing_lines_text"):
        for line_num in changing_lines:
            if str(line_num) in hexagram.get("changing_lines", {}):
                hexagram["line_meanings"].append({
                    "line": line_num,
                    "meaning": hexagram["changing_lines"][str(line_num)]
                })
    
    return hexagram


# ============ LIGHT CODES ROUTES ============

@router.get("/light-codes")
async def get_all_light_codes():
    """Get all light codes (sacred geometry, alphabets, light language)."""
    db = get_db()
    light_codes = await db.light_codes.find_one({}, {"_id": 0})
    return light_codes or {}


@router.get("/light-codes/sacred-geometry")
async def get_sacred_geometry():
    """Get sacred geometry symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    return data.get("sacred_geometry", []) if data else []


@router.get("/light-codes/ancient-alphabets")
async def get_ancient_alphabets():
    """Get ancient alphabet symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    return data.get("ancient_alphabets", []) if data else []


@router.get("/light-codes/light-language")
async def get_light_language():
    """Get light language symbols."""
    db = get_db()
    data = await db.light_codes.find_one({}, {"_id": 0})
    return data.get("light_language_symbols", []) if data else []
