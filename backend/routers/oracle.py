"""Oracle routes for readings and cards."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Any, Optional, List
from datetime import datetime, timezone
import uuid
import secrets
import logging
import os
import copy

from .dependencies import get_db, get_current_user, User
from data.all_content import ORACLE_CARDS
from data.archangel_oracle import ARCHANGEL_ORACLE

router = APIRouter(prefix="/oracle", tags=["oracle"])
logger = logging.getLogger(__name__)


def _secure_choice(items: list[Any]) -> Any | None:
    if not items:
        return None
    return items[secrets.randbelow(len(items))]


def _secure_sample(items: list[Any], count: int) -> list[Any]:
    pool = list(items)
    result = []
    for _ in range(min(count, len(pool))):
        idx = secrets.randbelow(len(pool))
        result.append(pool.pop(idx))
    return result


def _secure_bool(probability: float = 0.5) -> bool:
    threshold = max(0, min(10000, int(probability * 10000)))
    return secrets.randbelow(10000) < threshold


class OracleReadingRequest(BaseModel):
    question: Optional[str] = None
    spread_type: str = "single"  # single, three_card, celtic_cross


@router.post("/reading")
async def create_oracle_reading(
    data: OracleReadingRequest,
    user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Create a new oracle reading with AI interpretation (authenticated - saves to history)."""
    db = get_db()
    
    num_cards = {"single": 1, "three_card": 3, "celtic_cross": 10}.get(data.spread_type, 1)
    selected_cards = [copy.deepcopy(c) for c in _secure_sample(ORACLE_CARDS, num_cards)]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = _secure_bool(0.5)
        card["position"] = i + 1
    
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


@router.post("/reading/guest")
async def create_guest_oracle_reading(data: OracleReadingRequest) -> dict[str, Any]:
    """Create an oracle reading without authentication (doesn't save to history)."""
    num_cards = {"single": 1, "three_card": 3, "celtic_cross": 10}.get(data.spread_type, 1)
    selected_cards = [copy.deepcopy(c) for c in _secure_sample(ORACLE_CARDS, num_cards)]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = _secure_bool(0.5)
        card["position"] = i + 1
    
    # Generate AI interpretation using Claude
    interpretation = await generate_oracle_interpretation(selected_cards, data.question, data.spread_type)
    
    reading = {
        "id": str(uuid.uuid4()),
        "question": data.question,
        "spread_type": data.spread_type,
        "cards": selected_cards,
        "interpretation": interpretation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return reading


@router.get("/readings")
async def get_oracle_readings(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's oracle reading history."""
    db = get_db()
    readings = await db.oracle_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings


@router.get("/cards")
async def get_oracle_cards(element: Optional[str] = None) -> list[dict[str, Any]]:
    """Get oracle cards from database."""
    db = get_db()
    query = {}
    if element:
        query["element"] = {"$regex": f"^{element}$", "$options": "i"}
    
    cards = await db.oracle_cards.find(query, {"_id": 0}).to_list(length=50)
    # Fall back to static cards if database is empty
    if not cards:
        if element:
            return [c for c in ORACLE_CARDS if c["element"].lower() == element.lower()]
        return ORACLE_CARDS
    return cards


async def generate_oracle_interpretation(cards: List[dict[str, Any]], question: Optional[str], spread_type: str) -> str:
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


def generate_fallback_interpretation(cards: List[dict[str, Any]], question: Optional[str]) -> str:
    """Generate a basic interpretation without AI."""
    elements = [c["element"] for c in cards]
    dominant_element = max(set(elements), key=elements.count)
    
    intro = "The spirits have spoken through these sacred cards. "
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


# ============ ARCHANGEL ORACLE ENDPOINTS ============

class ArchangelReadingRequest(BaseModel):
    question: Optional[str] = None
    spread_type: str = "single"  # single, three_card


@router.get("/archangels")
async def get_archangel_cards() -> list[dict[str, Any]]:
    """Get all archangel oracle cards."""
    db = get_db()
    # Try database first
    cards = await db.archangel_oracle.find({}, {"_id": 0}).to_list(length=50)
    if not cards:
        return ARCHANGEL_ORACLE
    return cards


@router.get("/archangels/{archangel_id}")
async def get_archangel_by_id(archangel_id: str) -> dict[str, Any]:
    """Get a specific archangel by ID."""
    db = get_db()
    card = await db.archangel_oracle.find_one({"id": archangel_id}, {"_id": 0})
    if not card:
        # Fall back to static data
        for archangel in ARCHANGEL_ORACLE:
            if archangel["id"] == archangel_id:
                return archangel
        raise HTTPException(status_code=404, detail="Archangel not found")
    return card


@router.post("/archangels/reading/guest")
async def create_guest_archangel_reading(data: ArchangelReadingRequest) -> dict[str, Any]:
    """Create an archangel oracle reading without authentication."""
    num_cards = {"single": 1, "three_card": 3}.get(data.spread_type, 1)
    
    # Use static data to avoid ObjectId issues
    selected_cards = [copy.deepcopy(c) for c in _secure_sample(ARCHANGEL_ORACLE, num_cards)]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = _secure_bool(0.5)
        card["position"] = i + 1
        # Remove any potential MongoDB fields
        card.pop("_id", None)
    
    # Generate AI interpretation
    interpretation = await generate_archangel_interpretation(selected_cards, data.question, data.spread_type)
    
    reading = {
        "id": str(uuid.uuid4()),
        "question": data.question,
        "spread_type": data.spread_type,
        "cards": selected_cards,
        "interpretation": interpretation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    return reading


@router.post("/archangels/reading")
async def create_archangel_reading(
    data: ArchangelReadingRequest,
    user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Create an archangel oracle reading (authenticated - saves to history)."""
    db = get_db()
    
    num_cards = {"single": 1, "three_card": 3}.get(data.spread_type, 1)
    
    # Use static data to avoid ObjectId issues
    selected_cards = [copy.deepcopy(c) for c in _secure_sample(ARCHANGEL_ORACLE, num_cards)]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = _secure_bool(0.5)
        card["position"] = i + 1
        # Remove any potential MongoDB fields
        card.pop("_id", None)
    
    # Generate AI interpretation
    interpretation = await generate_archangel_interpretation(selected_cards, data.question, data.spread_type)
    
    reading = {
        "id": str(uuid.uuid4()),
        "user_id": user.user_id,
        "question": data.question,
        "spread_type": data.spread_type,
        "cards": selected_cards,
        "interpretation": interpretation,
        "reading_type": "archangel",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.archangel_readings.insert_one(reading)
    reading.pop("_id", None)
    return reading


@router.get("/archangels/readings/history")
async def get_archangel_readings(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's archangel reading history."""
    db = get_db()
    readings = await db.archangel_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings


async def generate_archangel_interpretation(cards: List[dict[str, Any]], question: Optional[str], spread_type: str) -> str:
    """Generate AI interpretation for archangel oracle reading."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return generate_archangel_fallback(cards, question)
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"archangel_{uuid.uuid4().hex[:8]}",
            system_message="""You are a loving angelic oracle reader who channels messages from the Archangels. 
            Your readings are filled with divine love, compassion, and gentle guidance. You speak with the 
            voice of heavenly wisdom while being practical and encouraging. Keep interpretations between 
            200-350 words. Include specific guidance on how to work with the archangel(s) who appeared."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        cards_info = "\n".join([
            f"Position {i+1}: {c['name']} - {c['title']} {'(Reversed/Shadow)' if c.get('is_reversed') else '(Upright)'}"
            for i, c in enumerate(cards)
        ])
        
        prompt = f"""Please provide a loving archangel oracle reading interpretation.

Spread Type: {spread_type}
{"Question: " + question if question else "General divine guidance reading"}

Archangels who appeared:
{cards_info}

Archangel information for reference:
{chr(10).join([f"- {c['name']}: Domain: {c['domain'][:200]}... Message: {c['message'][:200]}..." for c in cards])}

{'For reversed cards, incorporate the shadow meaning: ' + chr(10).join([f"- {c['name']} shadow: {c['reversed_meaning']}" for c in cards if c.get('is_reversed')]) if any(c.get('is_reversed') for c in cards) else ''}

Provide a loving, encouraging interpretation that:
1. Weaves together the archangels' messages for the seeker
2. Gives practical guidance on invoking and working with these archangels
3. Includes any crystals, colors, or practices that would help
4. Ends with an uplifting affirmation or blessing"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        return response
        
    except Exception as e:
        logger.error(f"AI archangel interpretation failed: {e}")
        return generate_archangel_fallback(cards, question)


def generate_archangel_fallback(cards: List[dict[str, Any]], question: Optional[str]) -> str:
    """Generate a basic archangel interpretation without AI."""
    intro = "The Archangels have come forward with loving guidance for you.\n\n"
    if question:
        intro += f"Regarding your question about {question[:80]}...\n\n"
    
    card_readings = []
    for card in cards:
        if card.get("is_reversed"):
            reading = f"**{card['name']}** appears in shadow, gently reminding you: {card['reversed_meaning']}"
        else:
            reading = f"**{card['name']}** ({card['title']}) comes forward with this message: \"{card['message'][:300]}...\""
        card_readings.append(reading)
    
    guidance = "\n\n".join(card_readings)
    
    # Add practical guidance
    crystals = ", ".join([c["crystal"] for c in cards])
    colors = ", ".join([c["color"] for c in cards])
    
    practical = f"\n\n**To work with {'these Archangels' if len(cards) > 1 else 'this Archangel'}:**\n"
    practical += f"• Crystals: {crystals}\n"
    practical += f"• Colors to wear or visualize: {colors}\n"
    practical += f"• Affirmation: \"{cards[0]['affirmation']}\""
    
    return intro + guidance + practical
