"""Birth Chart / Natal Chart Astrology API routes."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone
import httpx
import logging

from .dependencies import get_db, get_current_user, User

router = APIRouter(prefix="/birth-chart", tags=["astrology"])
logger = logging.getLogger(__name__)

# Free Astrology API base URL
ASTRO_API_BASE = "https://json.freeastrologyapi.com"

# Zodiac sign data
ZODIAC_SIGNS = {
    "Aries": {"element": "Fire", "quality": "Cardinal", "ruler": "Mars", "symbol": "♈", "dates": "Mar 21 - Apr 19"},
    "Taurus": {"element": "Earth", "quality": "Fixed", "ruler": "Venus", "symbol": "♉", "dates": "Apr 20 - May 20"},
    "Gemini": {"element": "Air", "quality": "Mutable", "ruler": "Mercury", "symbol": "♊", "dates": "May 21 - Jun 20"},
    "Cancer": {"element": "Water", "quality": "Cardinal", "ruler": "Moon", "symbol": "♋", "dates": "Jun 21 - Jul 22"},
    "Leo": {"element": "Fire", "quality": "Fixed", "ruler": "Sun", "symbol": "♌", "dates": "Jul 23 - Aug 22"},
    "Virgo": {"element": "Earth", "quality": "Mutable", "ruler": "Mercury", "symbol": "♍", "dates": "Aug 23 - Sep 22"},
    "Libra": {"element": "Air", "quality": "Cardinal", "ruler": "Venus", "symbol": "♎", "dates": "Sep 23 - Oct 22"},
    "Scorpio": {"element": "Water", "quality": "Fixed", "ruler": "Pluto", "symbol": "♏", "dates": "Oct 23 - Nov 21"},
    "Sagittarius": {"element": "Fire", "quality": "Mutable", "ruler": "Jupiter", "symbol": "♐", "dates": "Nov 22 - Dec 21"},
    "Capricorn": {"element": "Earth", "quality": "Cardinal", "ruler": "Saturn", "symbol": "♑", "dates": "Dec 22 - Jan 19"},
    "Aquarius": {"element": "Air", "quality": "Fixed", "ruler": "Uranus", "symbol": "♒", "dates": "Jan 20 - Feb 18"},
    "Pisces": {"element": "Water", "quality": "Mutable", "ruler": "Neptune", "symbol": "♓", "dates": "Feb 19 - Mar 20"}
}

# Planet meanings
PLANET_MEANINGS = {
    "Sun": "Your core identity, ego, and life purpose",
    "Moon": "Your emotions, instincts, and inner self",
    "Mercury": "Communication, thinking, and learning style",
    "Venus": "Love, beauty, values, and relationships",
    "Mars": "Energy, action, desire, and aggression",
    "Jupiter": "Expansion, luck, wisdom, and growth",
    "Saturn": "Discipline, responsibility, and life lessons",
    "Uranus": "Innovation, rebellion, and sudden changes",
    "Neptune": "Dreams, intuition, spirituality, and illusion",
    "Pluto": "Transformation, power, and rebirth",
    "North Node": "Your life purpose and karmic direction",
    "South Node": "Past life patterns and natural talents",
    "Chiron": "Your deepest wound and healing gift"
}

# House meanings
HOUSE_MEANINGS = {
    1: {"name": "First House", "theme": "Self & Identity", "description": "How you present yourself to the world"},
    2: {"name": "Second House", "theme": "Values & Possessions", "description": "Material security and self-worth"},
    3: {"name": "Third House", "theme": "Communication", "description": "Learning, siblings, and local community"},
    4: {"name": "Fourth House", "theme": "Home & Family", "description": "Roots, ancestry, and emotional foundation"},
    5: {"name": "Fifth House", "theme": "Creativity & Romance", "description": "Self-expression, children, and joy"},
    6: {"name": "Sixth House", "theme": "Health & Service", "description": "Daily routines, work, and wellness"},
    7: {"name": "Seventh House", "theme": "Partnerships", "description": "Marriage, contracts, and one-on-one relationships"},
    8: {"name": "Eighth House", "theme": "Transformation", "description": "Death, rebirth, shared resources, and intimacy"},
    9: {"name": "Ninth House", "theme": "Philosophy & Travel", "description": "Higher learning, beliefs, and long journeys"},
    10: {"name": "Tenth House", "theme": "Career & Public Image", "description": "Ambition, reputation, and life direction"},
    11: {"name": "Eleventh House", "theme": "Community & Dreams", "description": "Friends, groups, and hopes for the future"},
    12: {"name": "Twelfth House", "theme": "Spirituality & Subconscious", "description": "Hidden matters, karma, and spiritual growth"}
}

class BirthChartRequest(BaseModel):
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM (24-hour format)
    birth_city: str
    birth_country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone_offset: Optional[float] = None  # e.g., -5 for EST, 5.5 for IST

class GeoLocation(BaseModel):
    city: str
    country: str

# Calculate sun sign from date (fallback if API fails)
def get_sun_sign(month: int, day: int) -> str:
    """Calculate sun sign from birth month and day."""
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius"
    else:
        return "Pisces"

# Approximate moon sign calculation (simplified - for when API unavailable)
def approximate_moon_sign(year: int, month: int, day: int) -> str:
    """Approximate moon sign - moon changes sign every ~2.5 days."""
    # This is a simplified approximation
    signs = list(ZODIAC_SIGNS.keys())
    # Moon cycle is ~29.5 days, so position shifts
    days_since_epoch = (year - 2000) * 365 + month * 30 + day
    moon_position = (days_since_epoch * 13.2) % 360  # Moon moves ~13 degrees/day
    sign_index = int(moon_position / 30) % 12
    return signs[sign_index]

@router.get("/zodiac-signs")
async def get_zodiac_signs():
    """Get all zodiac sign information."""
    return ZODIAC_SIGNS

@router.get("/planet-meanings")
async def get_planet_meanings():
    """Get meanings for all planets."""
    return PLANET_MEANINGS

@router.get("/house-meanings")
async def get_house_meanings():
    """Get meanings for all 12 houses."""
    return HOUSE_MEANINGS

@router.post("/calculate")
async def calculate_birth_chart(request: BirthChartRequest):
    """Calculate a complete birth chart."""
    db = get_db()
    
    try:
        # Parse birth date and time
        date_parts = request.birth_date.split("-")
        year = int(date_parts[0])
        month = int(date_parts[1])
        day = int(date_parts[2])
        
        time_parts = request.birth_time.split(":")
        hour = int(time_parts[0])
        minute = int(time_parts[1]) if len(time_parts) > 1 else 0
        
        # Get coordinates if not provided
        lat = request.latitude
        lon = request.longitude
        tz = request.timezone_offset
        
        if lat is None or lon is None:
            # Try to geocode the city
            # Using a simple lookup for common cities or estimate
            city_coords = await get_city_coordinates(request.birth_city, request.birth_country)
            lat = city_coords.get("lat", 40.7128)  # Default NYC
            lon = city_coords.get("lon", -74.0060)
            tz = city_coords.get("tz", -5)
        
        if tz is None:
            tz = -5  # Default EST
        
        # Calculate sun sign (always works)
        sun_sign = get_sun_sign(month, day)
        
        # Try to get full chart from Free Astrology API
        chart_data = None
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Try the planets endpoint
                response = await client.post(
                    f"{ASTRO_API_BASE}/western/planets",
                    json={
                        "year": year,
                        "month": month,
                        "date": day,
                        "hours": hour,
                        "minutes": minute,
                        "seconds": 0,
                        "latitude": lat,
                        "longitude": lon,
                        "timezone": tz,
                        "settings": {
                            "observation_point": "geocentric",
                            "ayanamsha": "tropical"
                        }
                    }
                )
                if response.status_code == 200:
                    chart_data = response.json()
        except Exception as e:
            logger.warning(f"Astrology API error: {e}")
        
        # Build response with available data
        planets = []
        houses = []
        
        if chart_data and isinstance(chart_data, list):
            # Process API response
            for planet_data in chart_data:
                planet_name = planet_data.get("name", "Unknown")
                sign = planet_data.get("sign", sun_sign if planet_name == "Sun" else "Unknown")
                degree = planet_data.get("full_degree", 0)
                house = planet_data.get("house", 1)
                retrograde = planet_data.get("is_retrograde", False)
                
                planets.append({
                    "name": planet_name,
                    "sign": sign,
                    "sign_symbol": ZODIAC_SIGNS.get(sign, {}).get("symbol", ""),
                    "degree": round(degree % 30, 2),
                    "full_degree": round(degree, 2),
                    "house": house,
                    "retrograde": retrograde,
                    "meaning": PLANET_MEANINGS.get(planet_name, "")
                })
        else:
            # Fallback: Create basic chart with sun sign
            moon_sign = approximate_moon_sign(year, month, day)
            
            planets = [
                {
                    "name": "Sun",
                    "sign": sun_sign,
                    "sign_symbol": ZODIAC_SIGNS.get(sun_sign, {}).get("symbol", ""),
                    "degree": day,
                    "house": 1,
                    "retrograde": False,
                    "meaning": PLANET_MEANINGS.get("Sun", "")
                },
                {
                    "name": "Moon",
                    "sign": moon_sign,
                    "sign_symbol": ZODIAC_SIGNS.get(moon_sign, {}).get("symbol", ""),
                    "degree": 15,
                    "house": 4,
                    "retrograde": False,
                    "meaning": PLANET_MEANINGS.get("Moon", ""),
                    "note": "Approximate - provide birth time for accuracy"
                }
            ]
        
        # Generate houses (simplified if no API data)
        ascendant_sign = sun_sign  # Simplified - would need exact time for real ascendant
        signs = list(ZODIAC_SIGNS.keys())
        start_index = signs.index(ascendant_sign) if ascendant_sign in signs else 0
        
        for i in range(1, 13):
            sign_index = (start_index + i - 1) % 12
            house_sign = signs[sign_index]
            houses.append({
                "number": i,
                "sign": house_sign,
                "sign_symbol": ZODIAC_SIGNS.get(house_sign, {}).get("symbol", ""),
                **HOUSE_MEANINGS.get(i, {})
            })
        
        # Build complete chart
        birth_chart = {
            "id": f"chart_{year}{month}{day}_{hour}{minute}",
            "birth_data": {
                "date": request.birth_date,
                "time": request.birth_time,
                "city": request.birth_city,
                "country": request.birth_country,
                "latitude": lat,
                "longitude": lon,
                "timezone": tz
            },
            "sun_sign": sun_sign,
            "sun_sign_info": ZODIAC_SIGNS.get(sun_sign, {}),
            "planets": planets,
            "houses": houses,
            "elements": calculate_element_balance(planets),
            "qualities": calculate_quality_balance(planets),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        return birth_chart
        
    except Exception as e:
        logger.error(f"Birth chart calculation error: {e}")
        raise HTTPException(status_code=400, detail=f"Could not calculate birth chart: {str(e)}")

async def get_city_coordinates(city: str, country: str) -> dict:
    """Get coordinates for a city using a geocoding service."""
    # Common cities lookup (fallback)
    common_cities = {
        "new york": {"lat": 40.7128, "lon": -74.0060, "tz": -5},
        "los angeles": {"lat": 34.0522, "lon": -118.2437, "tz": -8},
        "london": {"lat": 51.5074, "lon": -0.1278, "tz": 0},
        "paris": {"lat": 48.8566, "lon": 2.3522, "tz": 1},
        "tokyo": {"lat": 35.6762, "lon": 139.6503, "tz": 9},
        "sydney": {"lat": -33.8688, "lon": 151.2093, "tz": 10},
        "mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": 5.5},
        "delhi": {"lat": 28.6139, "lon": 77.2090, "tz": 5.5},
        "chicago": {"lat": 41.8781, "lon": -87.6298, "tz": -6},
        "houston": {"lat": 29.7604, "lon": -95.3698, "tz": -6},
        "phoenix": {"lat": 33.4484, "lon": -112.0740, "tz": -7},
        "philadelphia": {"lat": 39.9526, "lon": -75.1652, "tz": -5},
        "san antonio": {"lat": 29.4241, "lon": -98.4936, "tz": -6},
        "san diego": {"lat": 32.7157, "lon": -117.1611, "tz": -8},
        "dallas": {"lat": 32.7767, "lon": -96.7970, "tz": -6},
        "austin": {"lat": 30.2672, "lon": -97.7431, "tz": -6},
        "san francisco": {"lat": 37.7749, "lon": -122.4194, "tz": -8},
        "seattle": {"lat": 47.6062, "lon": -122.3321, "tz": -8},
        "denver": {"lat": 39.7392, "lon": -104.9903, "tz": -7},
        "boston": {"lat": 42.3601, "lon": -71.0589, "tz": -5},
        "atlanta": {"lat": 33.7490, "lon": -84.3880, "tz": -5},
        "miami": {"lat": 25.7617, "lon": -80.1918, "tz": -5},
        "toronto": {"lat": 43.6532, "lon": -79.3832, "tz": -5},
        "vancouver": {"lat": 49.2827, "lon": -123.1207, "tz": -8},
        "melbourne": {"lat": -37.8136, "lon": 144.9631, "tz": 10},
        "berlin": {"lat": 52.5200, "lon": 13.4050, "tz": 1},
        "rome": {"lat": 41.9028, "lon": 12.4964, "tz": 1},
        "madrid": {"lat": 40.4168, "lon": -3.7038, "tz": 1},
        "amsterdam": {"lat": 52.3676, "lon": 4.9041, "tz": 1},
    }
    
    city_key = city.lower().strip()
    if city_key in common_cities:
        return common_cities[city_key]
    
    # Try geocoding API
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"https://nominatim.openstreetmap.org/search",
                params={
                    "q": f"{city}, {country}",
                    "format": "json",
                    "limit": 1
                },
                headers={"User-Agent": "ShamanicYogaApp/1.0"}
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return {
                        "lat": float(data[0]["lat"]),
                        "lon": float(data[0]["lon"]),
                        "tz": -5  # Would need timezone API for accuracy
                    }
    except Exception as e:
        logger.warning(f"Geocoding error: {e}")
    
    # Default to New York
    return {"lat": 40.7128, "lon": -74.0060, "tz": -5}

def calculate_element_balance(planets: list) -> dict:
    """Calculate the balance of elements in the chart."""
    elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
    
    for planet in planets:
        sign = planet.get("sign", "")
        sign_info = ZODIAC_SIGNS.get(sign, {})
        element = sign_info.get("element")
        if element in elements:
            # Weight by planet importance
            weight = 2 if planet.get("name") in ["Sun", "Moon", "Ascendant"] else 1
            elements[element] += weight
    
    total = sum(elements.values()) or 1
    return {
        "counts": elements,
        "percentages": {k: round(v / total * 100, 1) for k, v in elements.items()},
        "dominant": max(elements, key=elements.get) if elements else "Unknown"
    }

def calculate_quality_balance(planets: list) -> dict:
    """Calculate the balance of qualities (modalities) in the chart."""
    qualities = {"Cardinal": 0, "Fixed": 0, "Mutable": 0}
    
    for planet in planets:
        sign = planet.get("sign", "")
        sign_info = ZODIAC_SIGNS.get(sign, {})
        quality = sign_info.get("quality")
        if quality in qualities:
            weight = 2 if planet.get("name") in ["Sun", "Moon", "Ascendant"] else 1
            qualities[quality] += weight
    
    total = sum(qualities.values()) or 1
    return {
        "counts": qualities,
        "percentages": {k: round(v / total * 100, 1) for k, v in qualities.items()},
        "dominant": max(qualities, key=qualities.get) if qualities else "Unknown"
    }

@router.post("/save")
async def save_birth_chart(
    request: BirthChartRequest,
    user: User = Depends(get_current_user)
):
    """Calculate and save a birth chart for the user."""
    db = get_db()
    
    # Calculate the chart
    chart = await calculate_birth_chart(request)
    
    # Add user info and save
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
    """Get the user's saved birth chart."""
    db = get_db()
    chart = await db.birth_charts.find_one({"user_id": user.user_id}, {"_id": 0})
    if not chart:
        raise HTTPException(status_code=404, detail="No birth chart saved. Please create one first.")
    return chart
