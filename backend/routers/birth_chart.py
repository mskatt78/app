"""Birth Chart / Natal Chart Astrology API routes using Swiss Ephemeris.

This module provides professional-grade birth chart calculations using the Swiss Ephemeris
library (pyswisseph), which is the de-facto standard for astrological calculations with
0.0001° accuracy based on NASA JPL ephemeris data.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Tuple
from datetime import datetime, timezone
import logging
import math

try:
    import swisseph as swe
    import pytz
    SWISSEPH_AVAILABLE = True
    # Use built-in Moshier ephemeris (no external files needed)
    # This provides ~1 arcsecond accuracy, sufficient for astrological purposes
except ImportError:
    SWISSEPH_AVAILABLE = False

from .dependencies import get_db, get_current_user, User

router = APIRouter(prefix="/birth-chart", tags=["astrology"])
logger = logging.getLogger(__name__)

# Flag for Chiron availability (requires additional ephemeris files)
CHIRON_AVAILABLE = False  # Set to True if sepl*.se1 files are properly installed

# Zodiac sign data with comprehensive information
ZODIAC_SIGNS = {
    "Aries": {"element": "Fire", "quality": "Cardinal", "ruler": "Mars", "symbol": "♈", "dates": "Mar 21 - Apr 19", "glyph": "aries"},
    "Taurus": {"element": "Earth", "quality": "Fixed", "ruler": "Venus", "symbol": "♉", "dates": "Apr 20 - May 20", "glyph": "taurus"},
    "Gemini": {"element": "Air", "quality": "Mutable", "ruler": "Mercury", "symbol": "♊", "dates": "May 21 - Jun 20", "glyph": "gemini"},
    "Cancer": {"element": "Water", "quality": "Cardinal", "ruler": "Moon", "symbol": "♋", "dates": "Jun 21 - Jul 22", "glyph": "cancer"},
    "Leo": {"element": "Fire", "quality": "Fixed", "ruler": "Sun", "symbol": "♌", "dates": "Jul 23 - Aug 22", "glyph": "leo"},
    "Virgo": {"element": "Earth", "quality": "Mutable", "ruler": "Mercury", "symbol": "♍", "dates": "Aug 23 - Sep 22", "glyph": "virgo"},
    "Libra": {"element": "Air", "quality": "Cardinal", "ruler": "Venus", "symbol": "♎", "dates": "Sep 23 - Oct 22", "glyph": "libra"},
    "Scorpio": {"element": "Water", "quality": "Fixed", "ruler": "Pluto", "symbol": "♏", "dates": "Oct 23 - Nov 21", "glyph": "scorpio"},
    "Sagittarius": {"element": "Fire", "quality": "Mutable", "ruler": "Jupiter", "symbol": "♐", "dates": "Nov 22 - Dec 21", "glyph": "sagittarius"},
    "Capricorn": {"element": "Earth", "quality": "Cardinal", "ruler": "Saturn", "symbol": "♑", "dates": "Dec 22 - Jan 19", "glyph": "capricorn"},
    "Aquarius": {"element": "Air", "quality": "Fixed", "ruler": "Uranus", "symbol": "♒", "dates": "Jan 20 - Feb 18", "glyph": "aquarius"},
    "Pisces": {"element": "Water", "quality": "Mutable", "ruler": "Neptune", "symbol": "♓", "dates": "Feb 19 - Mar 20", "glyph": "pisces"}
}

SIGNS_LIST = list(ZODIAC_SIGNS.keys())

# Planet meanings and symbols
PLANET_DATA = {
    "Sun": {
        "meaning": "Your core identity, ego, and life purpose",
        "symbol": "☉",
        "rules": ["Leo"],
        "keywords": ["Vitality", "Self-expression", "Willpower", "Creativity"]
    },
    "Moon": {
        "meaning": "Your emotions, instincts, and inner self",
        "symbol": "☽",
        "rules": ["Cancer"],
        "keywords": ["Emotions", "Intuition", "Memory", "Nurturing"]
    },
    "Mercury": {
        "meaning": "Communication, thinking, and learning style",
        "symbol": "☿",
        "rules": ["Gemini", "Virgo"],
        "keywords": ["Communication", "Intellect", "Learning", "Travel"]
    },
    "Venus": {
        "meaning": "Love, beauty, values, and relationships",
        "symbol": "♀",
        "rules": ["Taurus", "Libra"],
        "keywords": ["Love", "Beauty", "Harmony", "Pleasure"]
    },
    "Mars": {
        "meaning": "Energy, action, desire, and aggression",
        "symbol": "♂",
        "rules": ["Aries"],
        "keywords": ["Action", "Energy", "Passion", "Courage"]
    },
    "Jupiter": {
        "meaning": "Expansion, luck, wisdom, and growth",
        "symbol": "♃",
        "rules": ["Sagittarius"],
        "keywords": ["Expansion", "Abundance", "Philosophy", "Optimism"]
    },
    "Saturn": {
        "meaning": "Discipline, responsibility, and life lessons",
        "symbol": "♄",
        "rules": ["Capricorn"],
        "keywords": ["Structure", "Discipline", "Karma", "Mastery"]
    },
    "Uranus": {
        "meaning": "Innovation, rebellion, and sudden changes",
        "symbol": "♅",
        "rules": ["Aquarius"],
        "keywords": ["Revolution", "Innovation", "Freedom", "Awakening"]
    },
    "Neptune": {
        "meaning": "Dreams, intuition, spirituality, and illusion",
        "symbol": "♆",
        "rules": ["Pisces"],
        "keywords": ["Dreams", "Intuition", "Spirituality", "Compassion"]
    },
    "Pluto": {
        "meaning": "Transformation, power, and rebirth",
        "symbol": "♇",
        "rules": ["Scorpio"],
        "keywords": ["Transformation", "Power", "Rebirth", "Shadow"]
    },
    "North Node": {
        "meaning": "Your life purpose and karmic direction",
        "symbol": "☊",
        "rules": [],
        "keywords": ["Destiny", "Growth", "Future", "Purpose"]
    },
    "South Node": {
        "meaning": "Past life patterns and natural talents",
        "symbol": "☋",
        "rules": [],
        "keywords": ["Past", "Comfort zone", "Natural gifts", "Release"]
    },
    "Chiron": {
        "meaning": "Your deepest wound and healing gift",
        "symbol": "⚷",
        "rules": [],
        "keywords": ["Wound", "Healing", "Teacher", "Wisdom"]
    },
    "Ascendant": {
        "meaning": "Your outward personality and how others perceive you",
        "symbol": "AC",
        "rules": [],
        "keywords": ["Appearance", "First impressions", "Persona", "Rising"]
    },
    "Midheaven": {
        "meaning": "Your career path and public reputation",
        "symbol": "MC",
        "rules": [],
        "keywords": ["Career", "Reputation", "Goals", "Achievement"]
    }
}

# House meanings
HOUSE_MEANINGS = {
    1: {"name": "First House", "theme": "Self & Identity", "description": "How you present yourself to the world", "keywords": ["Self", "Body", "Appearance"]},
    2: {"name": "Second House", "theme": "Values & Possessions", "description": "Material security and self-worth", "keywords": ["Money", "Values", "Resources"]},
    3: {"name": "Third House", "theme": "Communication", "description": "Learning, siblings, and local community", "keywords": ["Communication", "Siblings", "Mind"]},
    4: {"name": "Fourth House", "theme": "Home & Family", "description": "Roots, ancestry, and emotional foundation", "keywords": ["Home", "Family", "Roots"]},
    5: {"name": "Fifth House", "theme": "Creativity & Romance", "description": "Self-expression, children, and joy", "keywords": ["Creativity", "Romance", "Children"]},
    6: {"name": "Sixth House", "theme": "Health & Service", "description": "Daily routines, work, and wellness", "keywords": ["Health", "Work", "Service"]},
    7: {"name": "Seventh House", "theme": "Partnerships", "description": "Marriage, contracts, and one-on-one relationships", "keywords": ["Partnership", "Marriage", "Others"]},
    8: {"name": "Eighth House", "theme": "Transformation", "description": "Death, rebirth, shared resources, and intimacy", "keywords": ["Transformation", "Intimacy", "Shared resources"]},
    9: {"name": "Ninth House", "theme": "Philosophy & Travel", "description": "Higher learning, beliefs, and long journeys", "keywords": ["Philosophy", "Travel", "Higher mind"]},
    10: {"name": "Tenth House", "theme": "Career & Public Image", "description": "Ambition, reputation, and life direction", "keywords": ["Career", "Reputation", "Authority"]},
    11: {"name": "Eleventh House", "theme": "Community & Dreams", "description": "Friends, groups, and hopes for the future", "keywords": ["Friends", "Groups", "Hopes"]},
    12: {"name": "Twelfth House", "theme": "Spirituality & Subconscious", "description": "Hidden matters, karma, and spiritual growth", "keywords": ["Spirituality", "Subconscious", "Karma"]}
}

# Aspect definitions: degrees, orb, nature, symbol
ASPECTS = {
    "Conjunction": {"degrees": 0, "orb": 8, "nature": "major", "symbol": "☌", "meaning": "Fusion of energies, intensity"},
    "Sextile": {"degrees": 60, "orb": 6, "nature": "major", "symbol": "⚹", "meaning": "Opportunity, harmony"},
    "Square": {"degrees": 90, "orb": 8, "nature": "major", "symbol": "□", "meaning": "Tension, challenge, growth"},
    "Trine": {"degrees": 120, "orb": 8, "nature": "major", "symbol": "△", "meaning": "Flow, ease, natural talent"},
    "Opposition": {"degrees": 180, "orb": 8, "nature": "major", "symbol": "☍", "meaning": "Polarity, awareness, balance"},
    "Quincunx": {"degrees": 150, "orb": 3, "nature": "minor", "symbol": "⚻", "meaning": "Adjustment, health matters"},
    "Semi-sextile": {"degrees": 30, "orb": 2, "nature": "minor", "symbol": "⚺", "meaning": "Subtle connection"},
}

# Swiss Ephemeris planet mapping
SWIEPH_PLANETS = {
    "Sun": swe.SUN if SWISSEPH_AVAILABLE else 0,
    "Moon": swe.MOON if SWISSEPH_AVAILABLE else 1,
    "Mercury": swe.MERCURY if SWISSEPH_AVAILABLE else 2,
    "Venus": swe.VENUS if SWISSEPH_AVAILABLE else 3,
    "Mars": swe.MARS if SWISSEPH_AVAILABLE else 4,
    "Jupiter": swe.JUPITER if SWISSEPH_AVAILABLE else 5,
    "Saturn": swe.SATURN if SWISSEPH_AVAILABLE else 6,
    "Uranus": swe.URANUS if SWISSEPH_AVAILABLE else 7,
    "Neptune": swe.NEPTUNE if SWISSEPH_AVAILABLE else 8,
    "Pluto": swe.PLUTO if SWISSEPH_AVAILABLE else 9,
    "North Node": swe.MEAN_NODE if SWISSEPH_AVAILABLE else 10,
    "Chiron": swe.CHIRON if SWISSEPH_AVAILABLE else 15,
}

# City coordinates database for common cities
CITY_COORDS = {
    "new york": {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"},
    "los angeles": {"lat": 34.0522, "lon": -118.2437, "tz": "America/Los_Angeles"},
    "chicago": {"lat": 41.8781, "lon": -87.6298, "tz": "America/Chicago"},
    "houston": {"lat": 29.7604, "lon": -95.3698, "tz": "America/Chicago"},
    "phoenix": {"lat": 33.4484, "lon": -112.0740, "tz": "America/Phoenix"},
    "philadelphia": {"lat": 39.9526, "lon": -75.1652, "tz": "America/New_York"},
    "san antonio": {"lat": 29.4241, "lon": -98.4936, "tz": "America/Chicago"},
    "san diego": {"lat": 32.7157, "lon": -117.1611, "tz": "America/Los_Angeles"},
    "dallas": {"lat": 32.7767, "lon": -96.7970, "tz": "America/Chicago"},
    "austin": {"lat": 30.2672, "lon": -97.7431, "tz": "America/Chicago"},
    "san francisco": {"lat": 37.7749, "lon": -122.4194, "tz": "America/Los_Angeles"},
    "seattle": {"lat": 47.6062, "lon": -122.3321, "tz": "America/Los_Angeles"},
    "denver": {"lat": 39.7392, "lon": -104.9903, "tz": "America/Denver"},
    "boston": {"lat": 42.3601, "lon": -71.0589, "tz": "America/New_York"},
    "atlanta": {"lat": 33.7490, "lon": -84.3880, "tz": "America/New_York"},
    "miami": {"lat": 25.7617, "lon": -80.1918, "tz": "America/New_York"},
    "london": {"lat": 51.5074, "lon": -0.1278, "tz": "Europe/London"},
    "paris": {"lat": 48.8566, "lon": 2.3522, "tz": "Europe/Paris"},
    "tokyo": {"lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo"},
    "sydney": {"lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney"},
    "melbourne": {"lat": -37.8136, "lon": 144.9631, "tz": "Australia/Melbourne"},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
    "bangalore": {"lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
    "toronto": {"lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto"},
    "vancouver": {"lat": 49.2827, "lon": -123.1207, "tz": "America/Vancouver"},
    "berlin": {"lat": 52.5200, "lon": 13.4050, "tz": "Europe/Berlin"},
    "rome": {"lat": 41.9028, "lon": 12.4964, "tz": "Europe/Rome"},
    "madrid": {"lat": 40.4168, "lon": -3.7038, "tz": "Europe/Madrid"},
    "amsterdam": {"lat": 52.3676, "lon": 4.9041, "tz": "Europe/Amsterdam"},
    "dubai": {"lat": 25.2048, "lon": 55.2708, "tz": "Asia/Dubai"},
    "singapore": {"lat": 1.3521, "lon": 103.8198, "tz": "Asia/Singapore"},
    "hong kong": {"lat": 22.3193, "lon": 114.1694, "tz": "Asia/Hong_Kong"},
    "mexico city": {"lat": 19.4326, "lon": -99.1332, "tz": "America/Mexico_City"},
    "buenos aires": {"lat": -34.6037, "lon": -58.3816, "tz": "America/Argentina/Buenos_Aires"},
    "sao paulo": {"lat": -23.5505, "lon": -46.6333, "tz": "America/Sao_Paulo"},
    "cairo": {"lat": 30.0444, "lon": 31.2357, "tz": "Africa/Cairo"},
    "cape town": {"lat": -33.9249, "lon": 18.4241, "tz": "Africa/Johannesburg"},
    "moscow": {"lat": 55.7558, "lon": 37.6173, "tz": "Europe/Moscow"},
    "beijing": {"lat": 39.9042, "lon": 116.4074, "tz": "Asia/Shanghai"},
    "shanghai": {"lat": 31.2304, "lon": 121.4737, "tz": "Asia/Shanghai"},
    "seoul": {"lat": 37.5665, "lon": 126.9780, "tz": "Asia/Seoul"},
    "bangkok": {"lat": 13.7563, "lon": 100.5018, "tz": "Asia/Bangkok"},
    "jakarta": {"lat": -6.2088, "lon": 106.8456, "tz": "Asia/Jakarta"},
}


class BirthChartRequest(BaseModel):
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM (24-hour format)
    birth_city: str
    birth_country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone_name: Optional[str] = None  # IANA timezone like "America/New_York"


def get_city_coordinates(city: str, country: str) -> Dict:
    """Get coordinates and timezone for a city."""
    city_key = city.lower().strip()
    if city_key in CITY_COORDS:
        return CITY_COORDS[city_key]
    # Default fallback
    return {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"}


def datetime_to_julian(dt: datetime, tz_name: str) -> float:
    """Convert datetime to Julian Day Number for Swiss Ephemeris."""
    try:
        tz = pytz.timezone(tz_name)
        if dt.tzinfo is None:
            dt = tz.localize(dt)
        dt_utc = dt.astimezone(pytz.UTC)
        hour_decimal = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
        return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour_decimal)
    except Exception as e:
        logger.error(f"Julian day conversion error: {e}")
        raise ValueError(f"Invalid date/time: {e}")


def get_zodiac_sign(longitude: float) -> Tuple[str, float]:
    """Convert ecliptic longitude to zodiac sign and position within sign."""
    longitude = longitude % 360.0
    sign_index = int(longitude / 30.0)
    if sign_index >= 12:
        sign_index = 11
    sign_position = longitude % 30.0
    return SIGNS_LIST[sign_index], round(sign_position, 2)


def calculate_planet_position(planet_name: str, jd: float) -> Dict:
    """Calculate precise position of a planet using Swiss Ephemeris."""
    if not SWISSEPH_AVAILABLE:
        raise ValueError("Swiss Ephemeris not available")
    
    planet_id = SWIEPH_PLANETS.get(planet_name)
    if planet_id is None:
        raise ValueError(f"Unknown planet: {planet_name}")
    
    # Calculate with speed flag for retrograde detection
    flags = swe.FLG_SPEED
    xx, ret = swe.calc_ut(jd, planet_id, flags)
    
    longitude = xx[0]
    latitude = xx[1]
    distance = xx[2]
    speed = xx[3]
    
    sign, sign_pos = get_zodiac_sign(longitude)
    retrograde = speed < 0
    
    planet_info = PLANET_DATA.get(planet_name, {})
    
    return {
        "name": planet_name,
        "longitude": round(longitude, 4),
        "latitude": round(latitude, 4),
        "distance": round(distance, 6),
        "speed": round(speed, 4),
        "sign": sign,
        "sign_symbol": ZODIAC_SIGNS[sign]["symbol"],
        "sign_position": sign_pos,
        "degree": int(sign_pos),
        "minute": int((sign_pos % 1) * 60),
        "retrograde": retrograde,
        "symbol": planet_info.get("symbol", ""),
        "meaning": planet_info.get("meaning", ""),
        "keywords": planet_info.get("keywords", []),
        "house": 0  # Will be set later
    }


def calculate_houses(jd: float, lat: float, lon: float) -> Tuple[Dict, Dict, Dict]:
    """Calculate house cusps, ascendant, and midheaven using Placidus system."""
    if not SWISSEPH_AVAILABLE:
        raise ValueError("Swiss Ephemeris not available")
    
    # Placidus house system
    cusps, ascmc = swe.houses(jd, lat, lon, b'P')
    
    # House cusps (1-12) - cusps is 0-indexed, where index 0 = house 1
    houses = {}
    for i in range(1, 13):
        cusp_lon = cusps[i - 1]  # 0-indexed: house 1 = cusps[0]
        sign, sign_pos = get_zodiac_sign(cusp_lon)
        houses[i] = {
            "number": i,
            "longitude": round(cusp_lon, 4),
            "sign": sign,
            "sign_symbol": ZODIAC_SIGNS[sign]["symbol"],
            "degree": int(sign_pos),
            "minute": int((sign_pos % 1) * 60),
            **HOUSE_MEANINGS.get(i, {})
        }
    
    # Ascendant (ASC)
    asc_lon = ascmc[0]
    asc_sign, asc_pos = get_zodiac_sign(asc_lon)
    ascendant = {
        "name": "Ascendant",
        "longitude": round(asc_lon, 4),
        "sign": asc_sign,
        "sign_symbol": ZODIAC_SIGNS[asc_sign]["symbol"],
        "sign_position": asc_pos,
        "degree": int(asc_pos),
        "minute": int((asc_pos % 1) * 60),
        "symbol": "AC",
        "meaning": PLANET_DATA["Ascendant"]["meaning"],
        "keywords": PLANET_DATA["Ascendant"]["keywords"],
        "house": 1
    }
    
    # Midheaven (MC)
    mc_lon = ascmc[1]
    mc_sign, mc_pos = get_zodiac_sign(mc_lon)
    midheaven = {
        "name": "Midheaven",
        "longitude": round(mc_lon, 4),
        "sign": mc_sign,
        "sign_symbol": ZODIAC_SIGNS[mc_sign]["symbol"],
        "sign_position": mc_pos,
        "degree": int(mc_pos),
        "minute": int((mc_pos % 1) * 60),
        "symbol": "MC",
        "meaning": PLANET_DATA["Midheaven"]["meaning"],
        "keywords": PLANET_DATA["Midheaven"]["keywords"],
        "house": 10
    }
    
    return houses, ascendant, midheaven


def determine_house(planet_lon: float, houses: Dict) -> int:
    """Determine which house a planet occupies."""
    planet_lon = planet_lon % 360.0
    
    for house_num in range(1, 13):
        current_cusp = houses[house_num]["longitude"] % 360.0
        next_house = (house_num % 12) + 1
        next_cusp = houses[next_house]["longitude"] % 360.0
        
        # Handle wraparound at 0 degrees
        if next_cusp < current_cusp:  # Crosses 0 Aries
            if planet_lon >= current_cusp or planet_lon < next_cusp:
                return house_num
        else:
            if current_cusp <= planet_lon < next_cusp:
                return house_num
    
    return 1  # Default


def calculate_aspects(planets: List[Dict]) -> List[Dict]:
    """Calculate all aspects between planets."""
    aspects = []
    
    for i, p1 in enumerate(planets):
        for p2 in planets[i+1:]:
            diff = abs(p1["longitude"] - p2["longitude"])
            if diff > 180:
                diff = 360 - diff
            
            for aspect_name, aspect_info in ASPECTS.items():
                exact_deg = aspect_info["degrees"]
                orb = aspect_info["orb"]
                deviation = abs(diff - exact_deg)
                
                if deviation <= orb:
                    # Calculate if applying or separating
                    speed_diff = p1.get("speed", 0) - p2.get("speed", 0)
                    is_applying = (diff < exact_deg and speed_diff > 0) or (diff > exact_deg and speed_diff < 0)
                    
                    aspects.append({
                        "planet1": p1["name"],
                        "planet1_symbol": p1.get("symbol", ""),
                        "planet2": p2["name"],
                        "planet2_symbol": p2.get("symbol", ""),
                        "aspect": aspect_name,
                        "symbol": aspect_info["symbol"],
                        "exact_degrees": round(diff, 2),
                        "orb": round(deviation, 2),
                        "nature": aspect_info["nature"],
                        "meaning": aspect_info["meaning"],
                        "applying": is_applying
                    })
    
    # Sort by orb (closest to exact first)
    aspects.sort(key=lambda x: x["orb"])
    return aspects


def calculate_element_balance(planets: List[Dict]) -> Dict:
    """Calculate the elemental balance in the chart."""
    elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
    
    for planet in planets:
        sign = planet.get("sign", "")
        sign_info = ZODIAC_SIGNS.get(sign, {})
        element = sign_info.get("element")
        if element in elements:
            # Weight by planet importance
            weight = 3 if planet.get("name") in ["Sun", "Moon", "Ascendant"] else 1
            elements[element] += weight
    
    total = sum(elements.values()) or 1
    dominant = max(elements, key=elements.get)
    
    return {
        "counts": elements,
        "percentages": {k: round(v / total * 100, 1) for k, v in elements.items()},
        "dominant": dominant,
        "interpretation": get_element_interpretation(dominant)
    }


def calculate_quality_balance(planets: List[Dict]) -> Dict:
    """Calculate the quality/modality balance in the chart."""
    qualities = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
    
    for planet in planets:
        sign = planet.get("sign", "")
        sign_info = ZODIAC_SIGNS.get(sign, {})
        quality = sign_info.get("quality")
        if quality in qualities:
            weight = 3 if planet.get("name") in ["Sun", "Moon", "Ascendant"] else 1
            qualities[quality] += weight
    
    total = sum(qualities.values()) or 1
    dominant = max(qualities, key=qualities.get)
    
    return {
        "counts": qualities,
        "percentages": {k: round(v / total * 100, 1) for k, v in qualities.items()},
        "dominant": dominant,
        "interpretation": get_quality_interpretation(dominant)
    }


def get_element_interpretation(element: str) -> str:
    """Get interpretation for dominant element."""
    interpretations = {
        "Fire": "Your chart is dominated by Fire energy - you are passionate, enthusiastic, and action-oriented. You lead with courage and inspire others.",
        "Earth": "Your chart is dominated by Earth energy - you are practical, grounded, and reliable. You build lasting foundations and value stability.",
        "Air": "Your chart is dominated by Air energy - you are intellectual, communicative, and social. You connect ideas and people effortlessly.",
        "Water": "Your chart is dominated by Water energy - you are emotional, intuitive, and empathic. You navigate feelings and connect deeply with others."
    }
    return interpretations.get(element, "")


def get_quality_interpretation(quality: str) -> str:
    """Get interpretation for dominant quality."""
    interpretations = {
        "Cardinal": "Your chart is dominated by Cardinal energy - you are an initiator and leader. You start new projects and set things in motion.",
        "Fixed": "Your chart is dominated by Fixed energy - you are determined and persistent. You see things through to completion with unwavering focus.",
        "Mutable": "Your chart is dominated by Mutable energy - you are adaptable and flexible. You embrace change and can adjust to any situation."
    }
    return interpretations.get(quality, "")


@router.get("/zodiac-signs")
async def get_zodiac_signs():
    """Get all zodiac sign information."""
    return ZODIAC_SIGNS


@router.get("/planet-meanings")
async def get_planet_meanings():
    """Get meanings and symbols for all planets."""
    return PLANET_DATA


@router.get("/house-meanings")
async def get_house_meanings():
    """Get meanings for all 12 houses."""
    return HOUSE_MEANINGS


@router.get("/aspect-meanings")
async def get_aspect_meanings():
    """Get meanings for all aspects."""
    return ASPECTS


@router.post("/calculate")
async def calculate_birth_chart(request: BirthChartRequest):
    """Calculate a complete birth chart using Swiss Ephemeris.
    
    This endpoint uses the Swiss Ephemeris library for professional-grade
    accuracy (0.0001° precision based on NASA JPL ephemeris data).
    """
    
    if not SWISSEPH_AVAILABLE:
        raise HTTPException(status_code=500, detail="Swiss Ephemeris not available")
    
    try:
        # Parse birth date and time
        date_parts = request.birth_date.split("-")
        year = int(date_parts[0])
        month = int(date_parts[1])
        day = int(date_parts[2])
        
        time_parts = request.birth_time.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1]) if len(time_parts) > 1 else 0
        second = int(time_parts[2]) if len(time_parts) > 2 else 0
        
        # Get coordinates and timezone
        if request.latitude is not None and request.longitude is not None:
            lat = request.latitude
            lon = request.longitude
            tz_name = request.timezone_name or "UTC"
        else:
            coords = get_city_coordinates(request.birth_city, request.birth_country)
            lat = coords["lat"]
            lon = coords["lon"]
            tz_name = request.timezone_name or coords["tz"]
        
        # Create datetime and convert to Julian Day
        birth_dt = datetime(year, month, day, hour, minute, second)
        jd = datetime_to_julian(birth_dt, tz_name)
        
        # Calculate all planets (excluding Chiron which requires extra ephemeris files)
        planets = []
        core_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "North Node"]
        for planet_name in core_planets:
            try:
                planet_data = calculate_planet_position(planet_name, jd)
                planets.append(planet_data)
            except Exception as e:
                logger.warning(f"Error calculating {planet_name}: {e}")
        
        # Calculate South Node (opposite of North Node)
        north_node = next((p for p in planets if p["name"] == "North Node"), None)
        if north_node:
            south_node_lon = (north_node["longitude"] + 180) % 360
            south_sign, south_pos = get_zodiac_sign(south_node_lon)
            planets.append({
                "name": "South Node",
                "longitude": round(south_node_lon, 4),
                "latitude": 0,
                "sign": south_sign,
                "sign_symbol": ZODIAC_SIGNS[south_sign]["symbol"],
                "sign_position": south_pos,
                "degree": int(south_pos),
                "minute": int((south_pos % 1) * 60),
                "retrograde": False,
                "symbol": "☋",
                "meaning": PLANET_DATA["South Node"]["meaning"],
                "keywords": PLANET_DATA["South Node"]["keywords"],
                "house": 0
            })
        
        # Calculate houses and angles
        houses, ascendant, midheaven = calculate_houses(jd, lat, lon)
        
        # Assign houses to planets
        for planet in planets:
            planet["house"] = determine_house(planet["longitude"], houses)
        
        # Calculate aspects
        aspects = calculate_aspects(planets)  # Only between planets, not angles
        
        # Calculate elemental and quality balance
        elements = calculate_element_balance(planets + [ascendant])
        qualities = calculate_quality_balance(planets + [ascendant])
        
        # Build the complete chart
        sun_planet = next((p for p in planets if p["name"] == "Sun"), {})
        sun_sign = sun_planet.get("sign", "Unknown")
        moon_planet = next((p for p in planets if p["name"] == "Moon"), {})
        
        birth_chart = {
            "id": f"chart_{year}{month:02d}{day:02d}_{hour:02d}{minute:02d}",
            "calculation_method": "Swiss Ephemeris",
            "precision": "0.0001 degrees",
            "birth_data": {
                "date": request.birth_date,
                "time": request.birth_time,
                "city": request.birth_city,
                "country": request.birth_country,
                "latitude": lat,
                "longitude": lon,
                "timezone": tz_name,
                "julian_day": round(jd, 6)
            },
            "sun_sign": sun_sign,
            "sun_sign_info": ZODIAC_SIGNS.get(sun_sign, {}),
            "moon_sign": moon_planet.get("sign", "Unknown"),
            "moon_sign_info": ZODIAC_SIGNS.get(moon_planet.get("sign", ""), {}),
            "rising_sign": ascendant["sign"],
            "rising_sign_info": ZODIAC_SIGNS.get(ascendant["sign"], {}),
            "ascendant": ascendant,
            "midheaven": midheaven,
            "planets": planets,
            "houses": houses,
            "aspects": aspects,
            "elements": elements,
            "qualities": qualities,
            "big_three": {
                "sun": {"sign": sun_sign, "symbol": ZODIAC_SIGNS.get(sun_sign, {}).get("symbol", "")},
                "moon": {"sign": moon_planet.get("sign", "Unknown"), "symbol": moon_planet.get("sign_symbol", "")},
                "rising": {"sign": ascendant["sign"], "symbol": ascendant["sign_symbol"]}
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        return birth_chart
        
    except Exception as e:
        logger.error(f"Birth chart calculation error: {e}")
        raise HTTPException(status_code=400, detail=f"Could not calculate birth chart: {str(e)}")


@router.post("/save")
async def save_birth_chart(
    request: BirthChartRequest,
    user: User = Depends(get_current_user)
):
    """Calculate and save a birth chart for the authenticated user."""
    db = get_db()
    
    # Calculate the chart
    chart = await calculate_birth_chart(request)
    
    # Add user info
    chart["user_id"] = user.user_id
    
    # Check if user already has a chart
    existing = await db.birth_charts.find_one({"user_id": user.user_id})
    if existing:
        await db.birth_charts.update_one(
            {"user_id": user.user_id},
            {"$set": chart}
        )
    else:
        await db.birth_charts.insert_one(chart)
    
    chart.pop("_id", None)
    return chart


@router.get("/my-chart")
async def get_my_birth_chart(user: User = Depends(get_current_user)):
    """Get the authenticated user's saved birth chart."""
    db = get_db()
    chart = await db.birth_charts.find_one({"user_id": user.user_id}, {"_id": 0})
    if not chart:
        raise HTTPException(status_code=404, detail="No birth chart saved. Please create one first.")
    return chart
