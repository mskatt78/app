"""Numerology and 13-month astrology routes."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging

from .dependencies import get_db, get_current_user, User

router = APIRouter(tags=["astrology"])
logger = logging.getLogger(__name__)

# Life Path meanings and interpretations
LIFE_PATHS = {
    1: {
        "number": 1,
        "name": "The Leader",
        "keywords": ["Independence", "Pioneering", "Ambition", "Innovation"],
        "description": "You are a natural-born leader with a strong drive for independence and achievement. Your path is about learning to stand on your own and trust your unique vision.",
        "strengths": ["Leadership", "Creativity", "Determination", "Self-reliance"],
        "challenges": ["Stubbornness", "Impatience", "Ego", "Isolation"],
        "element": "Fire",
        "career_paths": ["Entrepreneur", "Executive", "Inventor", "Pioneer"],
        "spiritual_lesson": "Learning to lead with heart while maintaining independence"
    },
    2: {
        "number": 2,
        "name": "The Peacemaker",
        "keywords": ["Cooperation", "Diplomacy", "Sensitivity", "Partnership"],
        "description": "You are a natural mediator and peacemaker with deep intuition and sensitivity. Your path involves learning to balance your needs with others.",
        "strengths": ["Diplomacy", "Intuition", "Patience", "Cooperation"],
        "challenges": ["Over-sensitivity", "Indecision", "Dependency", "Passivity"],
        "element": "Water",
        "career_paths": ["Counselor", "Mediator", "Healer", "Artist"],
        "spiritual_lesson": "Finding strength in gentleness and partnership"
    },
    3: {
        "number": 3,
        "name": "The Communicator",
        "keywords": ["Expression", "Creativity", "Joy", "Communication"],
        "description": "You are gifted with creative expression and the ability to inspire others through words, art, or performance. Your path is about authentic self-expression.",
        "strengths": ["Communication", "Optimism", "Artistic talent", "Social skills"],
        "challenges": ["Scattered energy", "Superficiality", "Moodiness", "Self-doubt"],
        "element": "Air",
        "career_paths": ["Writer", "Artist", "Speaker", "Entertainer"],
        "spiritual_lesson": "Using your voice to uplift and inspire"
    },
    4: {
        "number": 4,
        "name": "The Builder",
        "keywords": ["Stability", "Hard work", "Order", "Foundation"],
        "description": "You are practical and grounded, with the ability to build lasting structures in life. Your path involves creating security and solid foundations.",
        "strengths": ["Reliability", "Organization", "Dedication", "Practicality"],
        "challenges": ["Rigidity", "Stubbornness", "Limitations", "Workaholism"],
        "element": "Earth",
        "career_paths": ["Engineer", "Architect", "Manager", "Organizer"],
        "spiritual_lesson": "Building spiritual foundations through disciplined practice"
    },
    5: {
        "number": 5,
        "name": "The Freedom Seeker",
        "keywords": ["Change", "Adventure", "Freedom", "Versatility"],
        "description": "You are dynamic and adventurous, craving variety and new experiences. Your path involves learning to embrace change while finding inner stability.",
        "strengths": ["Adaptability", "Curiosity", "Resourcefulness", "Charisma"],
        "challenges": ["Restlessness", "Impulsiveness", "Irresponsibility", "Overindulgence"],
        "element": "Air",
        "career_paths": ["Travel", "Sales", "Media", "Adventure guide"],
        "spiritual_lesson": "Finding freedom within rather than without"
    },
    6: {
        "number": 6,
        "name": "The Nurturer",
        "keywords": ["Responsibility", "Love", "Family", "Healing"],
        "description": "You are a natural caretaker with a deep sense of responsibility for others. Your path involves learning to balance giving with receiving.",
        "strengths": ["Compassion", "Reliability", "Nurturing", "Harmony"],
        "challenges": ["Self-sacrifice", "Perfectionism", "Worry", "Controlling"],
        "element": "Water",
        "career_paths": ["Healthcare", "Teaching", "Counseling", "Homemaking"],
        "spiritual_lesson": "Learning that true love includes self-love"
    },
    7: {
        "number": 7,
        "name": "The Seeker",
        "keywords": ["Wisdom", "Spirituality", "Analysis", "Introspection"],
        "description": "You are a deep thinker and spiritual seeker, drawn to understanding life's mysteries. Your path involves developing inner wisdom.",
        "strengths": ["Intuition", "Analysis", "Wisdom", "Spirituality"],
        "challenges": ["Isolation", "Over-thinking", "Skepticism", "Secretiveness"],
        "element": "Spirit",
        "career_paths": ["Researcher", "Spiritual teacher", "Analyst", "Philosopher"],
        "spiritual_lesson": "Balancing the mind with the heart and spirit"
    },
    8: {
        "number": 8,
        "name": "The Achiever",
        "keywords": ["Power", "Abundance", "Authority", "Success"],
        "description": "You are naturally drawn to success and abundance, with strong business sense. Your path involves learning to use power responsibly.",
        "strengths": ["Leadership", "Business sense", "Ambition", "Efficiency"],
        "challenges": ["Materialism", "Workaholism", "Control issues", "Ruthlessness"],
        "element": "Earth",
        "career_paths": ["Business leader", "Finance", "Politics", "Real estate"],
        "spiritual_lesson": "Using abundance for the greater good"
    },
    9: {
        "number": 9,
        "name": "The Humanitarian",
        "keywords": ["Compassion", "Wisdom", "Service", "Completion"],
        "description": "You are an old soul with deep compassion for humanity. Your path involves selfless service and completing karmic cycles.",
        "strengths": ["Compassion", "Wisdom", "Creativity", "Generosity"],
        "challenges": ["Aloofness", "Martyrdom", "Scattered focus", "Emotional distance"],
        "element": "Spirit",
        "career_paths": ["Humanitarian", "Artist", "Healer", "Philanthropist"],
        "spiritual_lesson": "Embracing endings as beginnings"
    },
    11: {
        "number": 11,
        "name": "The Illuminator",
        "keywords": ["Intuition", "Inspiration", "Spiritual insight", "Visionary"],
        "description": "You are a master number carrying heightened spiritual awareness. Your path involves inspiring and illuminating others.",
        "strengths": ["Intuition", "Inspiration", "Charisma", "Visionary thinking"],
        "challenges": ["Nervous tension", "Impracticality", "Self-doubt", "Overwhelm"],
        "element": "Spirit",
        "career_paths": ["Spiritual leader", "Counselor", "Artist", "Inventor"],
        "spiritual_lesson": "Channeling divine inspiration into earthly action",
        "is_master": True
    },
    22: {
        "number": 22,
        "name": "The Master Builder",
        "keywords": ["Master manifestation", "Large-scale vision", "Practical idealism"],
        "description": "You carry the most powerful master number, capable of turning dreams into reality on a grand scale.",
        "strengths": ["Vision", "Leadership", "Discipline", "Practical idealism"],
        "challenges": ["Pressure", "High expectations", "Overwhelm", "Workaholic tendencies"],
        "element": "Earth",
        "career_paths": ["Visionary leader", "Architect", "Global organizer", "Philanthropist"],
        "spiritual_lesson": "Building structures that serve humanity",
        "is_master": True
    },
    33: {
        "number": 33,
        "name": "The Master Teacher",
        "keywords": ["Spiritual teaching", "Healing", "Selfless service", "Divine love"],
        "description": "The rarest master number, you are here to teach spiritual truths through your life example.",
        "strengths": ["Healing", "Teaching", "Compassion", "Selfless love"],
        "challenges": ["Self-sacrifice", "Burden of responsibility", "Perfectionism"],
        "element": "Spirit",
        "career_paths": ["Spiritual teacher", "Healer", "Humanitarian leader"],
        "spiritual_lesson": "Embodying divine love in human form",
        "is_master": True
    }
}


def reduce_to_single_digit(num: int, keep_master: bool = True) -> int:
    """Reduce a number to a single digit, optionally preserving master numbers."""
    while num > 9:
        if keep_master and num in [11, 22, 33]:
            return num
        num = sum(int(d) for d in str(num))
    return num


def calculate_life_path(birth_date: str) -> int:
    """Calculate life path number from birth date (YYYY-MM-DD format)."""
    try:
        parts = birth_date.split("-")
        if len(parts) == 3:
            year, month, day = parts
        else:
            # Try other formats
            if "/" in birth_date:
                parts = birth_date.split("/")
                if len(parts[2]) == 4:  # MM/DD/YYYY
                    month, day, year = parts
                else:  # DD/MM/YY or similar
                    day, month, year = parts
            else:
                raise ValueError("Invalid date format")
        
        # Calculate each component
        year_sum = reduce_to_single_digit(sum(int(d) for d in year), False)
        month_sum = reduce_to_single_digit(int(month), False)
        day_sum = reduce_to_single_digit(int(day), False)
        
        # Sum and reduce
        total = year_sum + month_sum + day_sum
        return reduce_to_single_digit(total, True)
    except Exception as e:
        logger.error(f"Life path calculation error: {e}")
        raise ValueError(f"Invalid date format: {birth_date}")


def calculate_expression_number(name: str) -> int:
    """Calculate expression/destiny number from full name."""
    letter_values = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    }
    total = sum(letter_values.get(c.lower(), 0) for c in name if c.isalpha())
    return reduce_to_single_digit(total, True)


def calculate_soul_urge(name: str) -> int:
    """Calculate soul urge/heart's desire number from vowels in name."""
    vowels = 'aeiou'
    letter_values = {
        'a': 1, 'e': 5, 'i': 9, 'o': 6, 'u': 3
    }
    total = sum(letter_values.get(c.lower(), 0) for c in name if c.lower() in vowels)
    return reduce_to_single_digit(total, True)


class NumerologyRequest(BaseModel):
    birth_date: str
    full_name: Optional[str] = None


@router.get("/numerology/life-paths")
async def get_life_paths():
    """Get all life path meanings."""
    return LIFE_PATHS


@router.post("/numerology/reading")
async def create_numerology_reading(
    request: NumerologyRequest,
    user: User = Depends(get_current_user)
):
    """Calculate and save a numerology reading."""
    db = get_db()
    try:
        life_path = calculate_life_path(request.birth_date)
        life_path_info = LIFE_PATHS.get(life_path, LIFE_PATHS.get(reduce_to_single_digit(life_path, False), {}))
        
        reading = {
            "id": str(__import__('uuid').uuid4())[:8],
            "user_id": user.user_id,
            "birth_date": request.birth_date,
            "full_name": request.full_name,
            "life_path_number": life_path,
            "life_path_info": life_path_info,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Add name-based numbers if name provided
        if request.full_name:
            reading["expression_number"] = calculate_expression_number(request.full_name)
            reading["soul_urge_number"] = calculate_soul_urge(request.full_name)
            reading["expression_info"] = LIFE_PATHS.get(reading["expression_number"], {})
            reading["soul_urge_info"] = LIFE_PATHS.get(reading["soul_urge_number"], {})
        
        # Save to database
        await db.numerology_readings.insert_one(reading)
        reading.pop("_id", None)
        
        return reading
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Numerology reading error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate reading")


@router.get("/numerology/readings")
async def get_numerology_readings(user: User = Depends(get_current_user)):
    """Get user's numerology reading history."""
    db = get_db()
    readings = await db.numerology_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings


# ============ 13-MONTH ASTROLOGY ROUTES ============

@router.get("/astrology/months")
async def get_astrology_months():
    """Get all 13 lunar months from database."""
    db = get_db()
    months = await db.astrology_months.find({}, {"_id": 0}).sort("month_number", 1).to_list(length=20)
    return months


@router.get("/astrology/months/{month_id}")
async def get_astrology_month(month_id: str):
    """Get a specific lunar month from database."""
    db = get_db()
    month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
    if not month:
        raise HTTPException(status_code=404, detail="Month not found")
    return month


@router.get("/astrology/current")
async def get_current_month():
    """Get the current lunar month based on today's date."""
    db = get_db()
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
