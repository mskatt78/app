"""Numerology and 13-month astrology routes."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, timezone
import logging
import uuid

from .dependencies import get_db, get_current_user, User

router = APIRouter(tags=["astrology"])
logger = logging.getLogger(__name__)

ASTROLOGY_MONTH_RANGES = [
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

PERSONAL_YEAR_THEMES: dict[int, dict[str, Any]] = {
    1: {"number": 1, "theme": "New Beginnings", "description": "A year of fresh starts, independence, and planting seeds for the future."},
    2: {"number": 2, "theme": "Partnerships", "description": "A year of cooperation, patience, and nurturing relationships."},
    3: {"number": 3, "theme": "Creativity", "description": "A year of self-expression, joy, and creative expansion."},
    4: {"number": 4, "theme": "Foundation", "description": "A year of hard work, building stability, and laying groundwork."},
    5: {"number": 5, "theme": "Change", "description": "A year of transformation, freedom, and new experiences."},
    6: {"number": 6, "theme": "Responsibility", "description": "A year of home, family, love, and nurturing others."},
    7: {"number": 7, "theme": "Introspection", "description": "A year of spiritual growth, rest, and inner reflection."},
    8: {"number": 8, "theme": "Abundance", "description": "A year of achievement, recognition, and material success."},
    9: {"number": 9, "theme": "Completion", "description": "A year of endings, release, and preparing for new cycles."},
}

# Life Path meanings and interpretations
LIFE_PATHS = {
    1: {
        "number": 1,
        "name": "The Leader",
        "keywords": ["Independence", "Pioneering", "Ambition", "Innovation"],
        "description": "You are a natural-born leader with a strong drive for independence and achievement. Your path is about learning to stand on your own and trust your unique vision.",
        "traits": ["Independent", "Ambitious", "Innovative", "Courageous", "Determined"],
        "strengths": ["Leadership", "Creativity", "Determination", "Self-reliance"],
        "challenges": ["Stubbornness", "Impatience", "Ego", "Isolation"],
        "element": "Fire",
        "crystal": "Ruby",
        "mantra": "I am a powerful creator of my own destiny",
        "career_paths": ["Entrepreneur", "Executive", "Inventor", "Pioneer"],
        "spiritual_lesson": "Learning to lead with heart while maintaining independence"
    },
    2: {
        "number": 2,
        "name": "The Peacemaker",
        "keywords": ["Cooperation", "Diplomacy", "Sensitivity", "Partnership"],
        "description": "You are a natural mediator and peacemaker with deep intuition and sensitivity. Your path involves learning to balance your needs with others.",
        "traits": ["Diplomatic", "Intuitive", "Patient", "Empathic", "Harmonious"],
        "strengths": ["Diplomacy", "Intuition", "Patience", "Cooperation"],
        "challenges": ["Over-sensitivity", "Indecision", "Dependency", "Passivity"],
        "element": "Water",
        "crystal": "Moonstone",
        "mantra": "I create harmony in all my relationships",
        "career_paths": ["Counselor", "Mediator", "Healer", "Artist"],
        "spiritual_lesson": "Finding strength in gentleness and partnership"
    },
    3: {
        "number": 3,
        "name": "The Communicator",
        "keywords": ["Expression", "Creativity", "Joy", "Communication"],
        "description": "You are gifted with creative expression and the ability to inspire others through words, art, or performance. Your path is about authentic self-expression.",
        "traits": ["Creative", "Expressive", "Joyful", "Optimistic", "Artistic"],
        "strengths": ["Communication", "Optimism", "Artistic talent", "Social skills"],
        "challenges": ["Scattered energy", "Superficiality", "Moodiness", "Self-doubt"],
        "element": "Air",
        "crystal": "Citrine",
        "mantra": "My voice and creativity inspire the world",
        "career_paths": ["Writer", "Artist", "Speaker", "Entertainer"],
        "spiritual_lesson": "Using your voice to uplift and inspire"
    },
    4: {
        "number": 4,
        "name": "The Builder",
        "keywords": ["Stability", "Hard work", "Order", "Foundation"],
        "description": "You are practical and grounded, with the ability to build lasting structures in life. Your path involves creating security and solid foundations.",
        "traits": ["Reliable", "Organized", "Practical", "Hardworking", "Loyal"],
        "strengths": ["Reliability", "Organization", "Dedication", "Practicality"],
        "challenges": ["Rigidity", "Stubbornness", "Limitations", "Workaholism"],
        "element": "Earth",
        "crystal": "Green Jade",
        "mantra": "I build lasting foundations for my dreams",
        "career_paths": ["Engineer", "Architect", "Manager", "Organizer"],
        "spiritual_lesson": "Building spiritual foundations through disciplined practice"
    },
    5: {
        "number": 5,
        "name": "The Freedom Seeker",
        "keywords": ["Change", "Adventure", "Freedom", "Versatility"],
        "description": "You are dynamic and adventurous, craving variety and new experiences. Your path involves learning to embrace change while finding inner stability.",
        "traits": ["Adventurous", "Versatile", "Curious", "Dynamic", "Free-spirited"],
        "strengths": ["Adaptability", "Curiosity", "Resourcefulness", "Charisma"],
        "challenges": ["Restlessness", "Impulsiveness", "Irresponsibility", "Overindulgence"],
        "element": "Air",
        "crystal": "Turquoise",
        "mantra": "I embrace change as the path to freedom",
        "career_paths": ["Travel", "Sales", "Media", "Adventure guide"],
        "spiritual_lesson": "Finding freedom within rather than without"
    },
    6: {
        "number": 6,
        "name": "The Nurturer",
        "keywords": ["Responsibility", "Love", "Family", "Healing"],
        "description": "You are a natural caretaker with a deep sense of responsibility for others. Your path involves learning to balance giving with receiving.",
        "traits": ["Nurturing", "Responsible", "Loving", "Compassionate", "Protective"],
        "strengths": ["Compassion", "Reliability", "Nurturing", "Harmony"],
        "challenges": ["Self-sacrifice", "Perfectionism", "Worry", "Controlling"],
        "element": "Water",
        "crystal": "Rose Quartz",
        "mantra": "I give and receive love in perfect balance",
        "career_paths": ["Healthcare", "Teaching", "Counseling", "Homemaking"],
        "spiritual_lesson": "Learning that true love includes self-love"
    },
    7: {
        "number": 7,
        "name": "The Seeker",
        "keywords": ["Wisdom", "Spirituality", "Analysis", "Introspection"],
        "description": "You are a deep thinker and spiritual seeker, drawn to understanding life's mysteries. Your path involves developing inner wisdom.",
        "traits": ["Wise", "Spiritual", "Analytical", "Intuitive", "Contemplative"],
        "strengths": ["Intuition", "Analysis", "Wisdom", "Spirituality"],
        "challenges": ["Isolation", "Over-thinking", "Skepticism", "Secretiveness"],
        "element": "Spirit",
        "crystal": "Amethyst",
        "mantra": "I trust my inner wisdom to guide my path",
        "career_paths": ["Researcher", "Spiritual teacher", "Analyst", "Philosopher"],
        "spiritual_lesson": "Balancing the mind with the heart and spirit"
    },
    8: {
        "number": 8,
        "name": "The Achiever",
        "keywords": ["Power", "Abundance", "Authority", "Success"],
        "description": "You are naturally drawn to success and abundance, with strong business sense. Your path involves learning to use power responsibly.",
        "traits": ["Powerful", "Ambitious", "Successful", "Authoritative", "Resourceful"],
        "strengths": ["Leadership", "Business sense", "Ambition", "Efficiency"],
        "challenges": ["Materialism", "Workaholism", "Control issues", "Ruthlessness"],
        "element": "Earth",
        "crystal": "Tiger's Eye",
        "mantra": "I use my power and abundance to serve the greater good",
        "career_paths": ["Business leader", "Finance", "Politics", "Real estate"],
        "spiritual_lesson": "Using abundance for the greater good"
    },
    9: {
        "number": 9,
        "name": "The Humanitarian",
        "keywords": ["Compassion", "Wisdom", "Service", "Completion"],
        "description": "You are an old soul with deep compassion for humanity. Your path involves selfless service and completing karmic cycles.",
        "traits": ["Compassionate", "Generous", "Wise", "Idealistic", "Humanitarian"],
        "strengths": ["Compassion", "Wisdom", "Creativity", "Generosity"],
        "challenges": ["Aloofness", "Martyrdom", "Scattered focus", "Emotional distance"],
        "element": "Spirit",
        "crystal": "Lapis Lazuli",
        "mantra": "I serve humanity with love and compassion",
        "career_paths": ["Humanitarian", "Artist", "Healer", "Philanthropist"],
        "spiritual_lesson": "Embracing endings as beginnings"
    },
    11: {
        "number": 11,
        "name": "The Illuminator",
        "keywords": ["Intuition", "Inspiration", "Spiritual insight", "Visionary"],
        "description": "You are a master number carrying heightened spiritual awareness. Your path involves inspiring and illuminating others.",
        "traits": ["Visionary", "Intuitive", "Inspirational", "Charismatic", "Enlightened"],
        "strengths": ["Intuition", "Inspiration", "Charisma", "Visionary thinking"],
        "challenges": ["Nervous tension", "Impracticality", "Self-doubt", "Overwhelm"],
        "element": "Spirit",
        "crystal": "Clear Quartz",
        "mantra": "I channel divine light to illuminate the world",
        "career_paths": ["Spiritual leader", "Counselor", "Artist", "Inventor"],
        "spiritual_lesson": "Channeling divine inspiration into earthly action",
        "is_master": True
    },
    22: {
        "number": 22,
        "name": "The Master Builder",
        "keywords": ["Master manifestation", "Large-scale vision", "Practical idealism"],
        "description": "You carry the most powerful master number, capable of turning dreams into reality on a grand scale.",
        "traits": ["Visionary", "Practical", "Disciplined", "Masterful", "Transformative"],
        "strengths": ["Vision", "Leadership", "Discipline", "Practical idealism"],
        "challenges": ["Pressure", "High expectations", "Overwhelm", "Workaholic tendencies"],
        "element": "Earth",
        "crystal": "Moldavite",
        "mantra": "I manifest my greatest visions into reality",
        "career_paths": ["Visionary leader", "Architect", "Global organizer", "Philanthropist"],
        "spiritual_lesson": "Building structures that serve humanity",
        "is_master": True
    },
    33: {
        "number": 33,
        "name": "The Master Teacher",
        "keywords": ["Spiritual teaching", "Healing", "Selfless service", "Divine love"],
        "description": "The rarest master number, you are here to teach spiritual truths through your life example.",
        "traits": ["Loving", "Healing", "Teaching", "Selfless", "Divinely guided"],
        "strengths": ["Healing", "Teaching", "Compassion", "Selfless love"],
        "challenges": ["Self-sacrifice", "Burden of responsibility", "Perfectionism"],
        "element": "Spirit",
        "crystal": "Sugilite",
        "mantra": "I embody divine love and teach through my being",
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
        parsed_date = _parse_birth_date(birth_date)
        year = str(parsed_date.year)
        month = parsed_date.month
        day = parsed_date.day

        # Calculate each component
        year_sum = reduce_to_single_digit(sum(int(d) for d in year), False)
        month_sum = reduce_to_single_digit(month, False)
        day_sum = reduce_to_single_digit(day, False)
        
        # Sum and reduce
        total = year_sum + month_sum + day_sum
        return reduce_to_single_digit(total, True)
    except Exception as e:
        logger.error(f"Life path calculation error: {e}")
        raise ValueError(f"Invalid date format: {birth_date}")


def _parse_birth_date(birth_date: str) -> datetime:
    normalized_birth_date = birth_date.strip()
    if "-" in normalized_birth_date:
        return datetime.strptime(normalized_birth_date, "%Y-%m-%d")
    if "/" in normalized_birth_date:
        return _parse_slash_birth_date(normalized_birth_date)
    raise ValueError("Invalid date format")


def _parse_slash_birth_date(normalized_birth_date: str) -> datetime:
    slash_formats = ["%m/%d/%Y", "%d/%m/%Y", "%m/%d/%y", "%d/%m/%y"]
    for date_format in slash_formats:
        try:
            return datetime.strptime(normalized_birth_date, date_format)
        except ValueError:
            continue
    raise ValueError("Invalid date format")


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


def _is_date_in_month_window(
    current_month: int,
    current_day: int,
    start_month: int,
    start_day: int,
    end_month: int,
    end_day: int,
) -> bool:
    date_tuple = (current_month, current_day)
    start_tuple = (start_month, start_day)
    end_tuple = (end_month, end_day)

    if start_tuple <= end_tuple:
        return start_tuple <= date_tuple <= end_tuple

    return date_tuple >= start_tuple or date_tuple <= end_tuple


def _resolve_current_lunar_month_id(now: datetime) -> str:
    current_month = now.month
    current_day = now.day

    for start_month, start_day, end_month, end_day, month_id in ASTROLOGY_MONTH_RANGES:
        if _is_date_in_month_window(current_month, current_day, start_month, start_day, end_month, end_day):
            return month_id
    return "1"


def _resolve_life_path_info(life_path_number: int) -> dict[str, Any]:
    reduced = reduce_to_single_digit(life_path_number, False)
    return LIFE_PATHS.get(life_path_number, LIFE_PATHS.get(reduced, {}))


class NumerologyRequest(BaseModel):
    birth_date: str
    full_name: Optional[str] = None


@router.get("/numerology/life-paths")
async def get_life_paths() -> dict[int, dict[str, Any]]:
    """Get all life path meanings."""
    return LIFE_PATHS


@router.post("/numerology/calculate")
async def calculate_numerology_public(request: NumerologyRequest) -> dict[str, Any]:
    """Calculate numerology reading without saving (public endpoint)."""
    try:
        life_path_number, reading_data = _build_reading_payload(request)

        result = {
            "birth_date": request.birth_date,
            "full_name": request.full_name,
            "life_path_number": life_path_number,
            **reading_data,
        }

        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Numerology calculation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate reading")


@router.post("/numerology/reading")
async def create_numerology_reading(
    request: NumerologyRequest,
    user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Calculate and save a numerology reading."""
    db = get_db()
    try:
        life_path_number, reading_data = _build_reading_payload(request)
        
        # Full record to save
        record = {
            "reading_id": str(uuid.uuid4())[:8],
            "user_id": user.user_id,
            "birth_date": request.birth_date,
            "full_name": request.full_name,
            "life_path_number": life_path_number,
            "reading": reading_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save to database
        await db.numerology_readings.insert_one(record)
        record.pop("_id", None)
        
        # Return the reading in the expected format
        return reading_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Numerology reading error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate reading")


def _build_reading_payload(request: NumerologyRequest) -> tuple[int, dict[str, Any]]:
    life_path_number = calculate_life_path(request.birth_date)
    life_path_info = _resolve_life_path_info(life_path_number)
    personal_year_theme = _build_personal_year_theme(request.birth_date)

    reading_data: dict[str, Any] = {
        "life_path": life_path_info,
        "personal_year": personal_year_theme,
    }

    if request.full_name:
        _append_name_based_numbers(reading_data, request.full_name)

    return life_path_number, reading_data


def _build_personal_year_theme(birth_date: str) -> dict[str, Any]:
    current_year = datetime.now().year
    birth_parts = birth_date.split("-")
    month = int(birth_parts[1])
    day = int(birth_parts[2])
    personal_year_sum = reduce_to_single_digit(month + day + sum(int(digit) for digit in str(current_year)), False)

    return PERSONAL_YEAR_THEMES.get(personal_year_sum, PERSONAL_YEAR_THEMES[9])


def _append_name_based_numbers(reading_data: dict[str, Any], full_name: str) -> None:
    expression_num = calculate_expression_number(full_name)
    soul_urge_num = calculate_soul_urge(full_name)
    reading_data["expression"] = {
        "number": expression_num,
        "description": LIFE_PATHS.get(expression_num, {}).get("description", "Your talents and abilities manifest through this number."),
    }
    reading_data["soul_urge"] = {
        "number": soul_urge_num,
        "description": LIFE_PATHS.get(soul_urge_num, {}).get("description", "Your heart's deepest desires resonate with this number."),
    }


@router.get("/numerology/readings")
async def get_numerology_readings(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's numerology reading history."""
    db = get_db()
    readings = await db.numerology_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings


# ============ 13-MONTH ASTROLOGY ROUTES ============

@router.get("/astrology/months")
async def get_astrology_months() -> list[dict[str, Any]]:
    """Get all 13 lunar months from database."""
    db = get_db()
    months = await db.astrology_months.find({}, {"_id": 0}).sort("month_number", 1).to_list(length=20)
    return months


@router.get("/astrology/months/{month_id}")
async def get_astrology_month(month_id: str) -> dict[str, Any]:
    """Get a specific lunar month from database."""
    db = get_db()
    month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
    if not month:
        raise HTTPException(status_code=404, detail="Month not found")
    return month


@router.get("/astrology/current")
async def get_current_month() -> dict[str, Any]:
    """Get the current lunar month based on today's date."""
    db = get_db()
    month_id = _resolve_current_lunar_month_id(datetime.now())
    month = await db.astrology_months.find_one({"id": month_id}, {"_id": 0})
    if month:
        return month
    fallback_month = await db.astrology_months.find_one({"id": "1"}, {"_id": 0})
    return fallback_month
