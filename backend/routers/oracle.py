"""Oracle routes for readings and cards."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import random
import logging
import os
import copy

from .dependencies import get_db, get_current_user, User
from data.all_content import ORACLE_CARDS

router = APIRouter(prefix="/oracle", tags=["oracle"])
logger = logging.getLogger(__name__)


class OracleReadingRequest(BaseModel):
    question: Optional[str] = None
    spread_type: str = "single"  # single, three_card, celtic_cross


@router.post("/reading")
async def create_oracle_reading(
    data: OracleReadingRequest,
    user: User = Depends(get_current_user)
):
    """Create a new oracle reading with AI interpretation (authenticated - saves to history)."""
    db = get_db()
    
    num_cards = {"single": 1, "three_card": 3, "celtic_cross": 10}.get(data.spread_type, 1)
    selected_cards = [copy.deepcopy(c) for c in random.sample(ORACLE_CARDS, min(num_cards, len(ORACLE_CARDS)))]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = random.choice([True, False])
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
async def create_guest_oracle_reading(data: OracleReadingRequest):
    """Create an oracle reading without authentication (doesn't save to history)."""
    num_cards = {"single": 1, "three_card": 3, "celtic_cross": 10}.get(data.spread_type, 1)
    selected_cards = [copy.deepcopy(c) for c in random.sample(ORACLE_CARDS, min(num_cards, len(ORACLE_CARDS)))]
    
    for i, card in enumerate(selected_cards):
        card["is_reversed"] = random.choice([True, False])
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
async def get_oracle_readings(user: User = Depends(get_current_user)):
    """Get user's oracle reading history."""
    db = get_db()
    readings = await db.oracle_readings.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return readings


@router.get("/cards")
async def get_oracle_cards(element: Optional[str] = None):
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
