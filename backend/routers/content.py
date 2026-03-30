"""Content routes for yoga, breathwork, crystals, mantras, mudras, meditations, etc."""
from datetime import datetime, timezone
import asyncio
import logging
import os
import re
from typing import Literal, Optional
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator

from .dependencies import get_db

router = APIRouter(tags=["content"])
logger = logging.getLogger(__name__)

MIN_NARRATION_MINUTES = 7
TARGET_WORDS_PER_MINUTE = 120
SEGMENT_TARGET_WORDS = 220


class LiveSessionRsvpRequest(BaseModel):
    display_name: str
    email: EmailStr


class LiveSessionMessageRequest(BaseModel):
    display_name: str
    email: Optional[EmailStr] = None
    message: str
    kind: Literal["chat", "question"] = "chat"

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, value):
        if value in ("", None):
            return None
        return value


class ExpandScriptRequest(BaseModel):
    practice_id: Optional[str] = None
    practice_name: str
    element: Optional[str] = None
    duration_minutes: Optional[float] = None
    steps: list[str] = Field(default_factory=list)
    source_texts: list[str] = Field(default_factory=list)
    use_ai: bool = False


class ExpandScriptResponse(BaseModel):
    practice_name: str
    target_minutes: int
    target_word_count: int
    word_count: int
    used_ai: bool
    paragraphs: list[str]
    segments: list[str]


def _count_words(text: str) -> int:
    return len(re.findall(r"\S+", str(text or "").strip()))


def _flatten_text(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        trimmed = value.strip()
        return [trimmed] if trimmed else []
    if isinstance(value, list):
        result: list[str] = []
        for item in value:
            result.extend(_flatten_text(item))
        return result
    if isinstance(value, dict):
        result: list[str] = []
        for item in value.values():
            result.extend(_flatten_text(item))
        return result
    converted = str(value).strip()
    return [converted] if converted else []


def _split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", str(text or "")).strip()
    if not normalized:
        return []
    chunks = re.split(r"(?<=[.!?])\s+", normalized)
    return [chunk.strip() for chunk in chunks if len(chunk.strip()) > 20]


def _sanitize_llm_text(raw_text: str) -> str:
    text = str(raw_text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z0-9_-]*\n?", "", text)
        text = re.sub(r"```$", "", text).strip()
    return text


def _segment_paragraphs(paragraphs: list[str]) -> list[str]:
    segments: list[str] = []
    current: list[str] = []
    running_words = 0

    for paragraph in paragraphs:
        paragraph_text = paragraph.strip()
        if not paragraph_text:
            continue
        paragraph_words = _count_words(paragraph_text)
        if running_words >= SEGMENT_TARGET_WORDS and current:
            segments.append("\n\n".join(current))
            current = []
            running_words = 0
        current.append(paragraph_text)
        running_words += paragraph_words

    if current:
        segments.append("\n\n".join(current))

    if not segments:
        segments = ["Take a slow breath in. Take a longer breath out. You are safe here."]

    return segments


def _build_fallback_paragraphs(request: ExpandScriptRequest, target_words: int) -> list[str]:
    practice_name = request.practice_name.strip() or "This practice"
    element = (request.element or "spirit").lower().strip() or "spirit"

    sentence_pool = list(
        {
            sentence.strip()
            for sentence in (
                part
                for text in (request.source_texts + request.steps)
                for part in _split_sentences(text)
            )
            if sentence.strip()
        }
    )

    if not sentence_pool:
        sentence_pool = [
            f"{practice_name} is a sacred return to your breath, body, and inner wisdom.",
            "Move slowly and gently, giving your nervous system enough space to soften and trust.",
        ]

    reflection_prompts = [
        "Breathe slowly here and let this moment stretch without rushing to the next part.",
        "If your mind wanders, guide your awareness back with kindness and no self-judgment.",
        "Notice sensation, emotion, and breath with curiosity, as if each one is a living teacher.",
        "Stay with this phase long enough for your body to understand that it is safe to soften.",
        "Allow each exhale to release unnecessary effort while your spine remains steady and relaxed.",
        "Receive what is unfolding instead of forcing it; this is where deeper healing starts.",
    ]

    paragraphs = [
        f"Welcome to {practice_name}. Settle into a comfortable position and take three slow breaths. Let your shoulders soften, your jaw unclench, and your attention arrive fully in the present moment.",
        f"This is a {element} practice. Let this quality guide your pace: steady, receptive, and spacious. There is nothing to prove. You are here to listen, feel, and gently deepen.",
    ]

    if request.steps:
        first_steps = [step for step in request.steps if step.strip()][:4]
        if first_steps:
            step_intro = " ".join(
                [f"Step {idx + 1}: {step.strip()}" for idx, step in enumerate(first_steps)]
            )
            paragraphs.append(
                f"We will move through this sequence with presence and care. {step_intro}. Let each phase unfold in rhythm with your breath."
            )

    running_words = _count_words(" ".join(paragraphs))
    index = 0

    while running_words < max(target_words - 160, 0):
        primary = sentence_pool[index % len(sentence_pool)]
        secondary = sentence_pool[(index + 2) % len(sentence_pool)]
        reflection = reflection_prompts[index % len(reflection_prompts)]

        paragraph = (
            f"Stay with {practice_name} now and allow this phase to deepen. "
            f"{primary} "
            f"Return to this emphasis: {secondary} "
            f"{reflection}"
        )
        paragraphs.append(paragraph)
        running_words += _count_words(paragraph)
        index += 1

    paragraphs.extend(
        [
            "As this practice begins to close, do not leave abruptly. Keep breathing slowly and notice what has shifted in your body, your emotions, and your inner landscape.",
            "When you are ready, take three grounding breaths, gently open your eyes, and carry this medicine into the rest of your day. Well done.",
        ]
    )

    return [paragraph.strip() for paragraph in paragraphs if paragraph.strip()]


async def _expand_with_llm(request: ExpandScriptRequest, target_words: int) -> Optional[list[str]]:
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return None

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as exc:
        logger.warning("Could not import LLM chat for script expansion: %s", exc)
        return None

    context_lines = [line for line in _flatten_text(request.source_texts + request.steps) if line]
    trimmed_context = "\n".join(context_lines[:60])

    prompt = f"""
Create a deeply detailed guided meditation narration script.

Practice name: {request.practice_name}
Element: {request.element or 'spirit'}
Duration target (minutes): {max(MIN_NARRATION_MINUTES, int(round(request.duration_minutes or MIN_NARRATION_MINUTES)))}
Minimum target words: {target_words}

Source context:
{trimmed_context if trimmed_context else 'No extra context provided.'}

Requirements:
1) Write long-form spoken guidance that feels warm, immersive, and therapeutic.
2) Include breath pacing, body awareness, somatic language, and gentle integration prompts.
3) Keep the flow continuous with no headings, no bullets, no markdown, and no labels.
4) Return only plain narration text.
5) Ensure the output is at least {target_words} words.
""".strip()

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"guided_script_{uuid.uuid4().hex[:12]}",
            system_message=(
                "You are an expert meditation guide writing high-quality long-form voice scripts. "
                "Your output must be emotionally grounded, practical, and deeply calming."
            ),
        ).with_model("openai", "gpt-5.2")

        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=prompt)),
            timeout=12,
        )
        text = _sanitize_llm_text(response)
        if _count_words(text) < int(target_words * 0.55):
            return None

        paragraphs = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
        if not paragraphs:
            paragraphs = [
                paragraph.strip()
                for paragraph in re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
                if paragraph.strip()
            ]
        return paragraphs or None
    except Exception as exc:
        logger.warning("AI script expansion failed: %s", exc)
        return None


@router.post("/content/expand-script", response_model=ExpandScriptResponse)
async def expand_guided_script(request: ExpandScriptRequest):
    """Expand guided practice text into long-form narration suitable for 7+ minute audio."""
    practice_name = request.practice_name.strip() if request.practice_name else "Guided Practice"
    target_minutes = max(MIN_NARRATION_MINUTES, int(round(request.duration_minutes or MIN_NARRATION_MINUTES)))
    target_words = max(MIN_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE, target_minutes * TARGET_WORDS_PER_MINUTE)

    fallback_paragraphs = _build_fallback_paragraphs(request, target_words)
    selected_paragraphs = fallback_paragraphs.copy()
    used_ai = False

    if request.use_ai:
        ai_paragraphs = await _expand_with_llm(request, target_words)
        if ai_paragraphs:
            selected_paragraphs = ai_paragraphs
            used_ai = True

    current_word_count = _count_words(" ".join(selected_paragraphs))
    if current_word_count < target_words:
        for paragraph in fallback_paragraphs:
            if current_word_count >= target_words:
                break
            selected_paragraphs.append(paragraph)
            current_word_count = _count_words(" ".join(selected_paragraphs))

    segments = _segment_paragraphs(selected_paragraphs)

    return ExpandScriptResponse(
        practice_name=practice_name,
        target_minutes=target_minutes,
        target_word_count=target_words,
        word_count=_count_words(" ".join(selected_paragraphs)),
        used_ai=used_ai,
        paragraphs=selected_paragraphs,
        segments=segments,
    )


async def _build_live_session(session: dict, db) -> dict:
    if not session:
        return session

    session_id = session["id"]
    attendee_count = await db.live_session_rsvps.count_documents({"session_id": session_id})
    message_count = await db.live_session_messages.count_documents({"session_id": session_id, "kind": "chat"})
    question_count = await db.live_session_messages.count_documents({"session_id": session_id, "kind": "question"})

    scheduled_date = ""
    scheduled_time = ""
    scheduled_at = session.get("scheduled_at")
    if scheduled_at:
        try:
            dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))
            scheduled_date = dt.date().isoformat()
            scheduled_time = dt.strftime("%H:%M")
        except ValueError:
            scheduled_date = scheduled_at[:10]

    return {
        **session,
        "scheduled_date": scheduled_date,
        "scheduled_time": scheduled_time,
        "attendee_count": attendee_count,
        "message_count": message_count,
        "question_count": question_count,
    }


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


@router.get("/crystals/deep")
async def get_deep_crystals():
    """Get deep crystal healing data with rituals, meditations, and comprehensive guidance."""
    db = get_db()
    crystals = await db.crystals_deep.find({}, {"_id": 0}).to_list(length=50)
    if not crystals:
        from data.crystals_deep import CRYSTALS_DEEP
        return CRYSTALS_DEEP
    return crystals


@router.get("/crystals/deep/{crystal_id}")
async def get_deep_crystal(crystal_id: str):
    """Get a specific deep crystal by ID."""
    db = get_db()
    crystal = await db.crystals_deep.find_one({"id": crystal_id}, {"_id": 0})
    if not crystal:
        from data.crystals_deep import CRYSTALS_DEEP
        for c in CRYSTALS_DEEP:
            if c["id"] == crystal_id:
                return c
        raise HTTPException(status_code=404, detail="Crystal not found")
    return crystal


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
    binary_lines = [1 if line in [7, 9] else 0 for line in lines]
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


# ============ LIVE SESSIONS ROUTES ============

@router.get("/live-sessions")
async def get_live_sessions(status: Optional[str] = None, session_type: Optional[str] = None):
    db = get_db()
    query = {}
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}
    if session_type:
        query["session_type"] = {"$regex": f"^{session_type}$", "$options": "i"}

    sessions = await db.live_sessions.find(query, {"_id": 0}).sort("scheduled_at", 1).to_list(length=100)
    return [await _build_live_session(session, db) for session in sessions]


@router.get("/live-sessions/{session_id}")
async def get_live_session(session_id: str):
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")
    return await _build_live_session(session, db)


@router.post("/live-sessions/{session_id}/rsvp")
async def rsvp_live_session(session_id: str, payload: LiveSessionRsvpRequest):
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    now = datetime.now(timezone.utc).isoformat()
    email = payload.email.lower()
    record = {
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "email": email,
        "updated_at": now,
    }

    existing = await db.live_session_rsvps.find_one({"session_id": session_id, "email": email}, {"_id": 0})
    if existing:
        await db.live_session_rsvps.update_one({"session_id": session_id, "email": email}, {"$set": record})
    else:
        await db.live_session_rsvps.insert_one({**record, "created_at": now})

    attendee_count = await db.live_session_rsvps.count_documents({"session_id": session_id})
    return {
        "success": True,
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "attendee_count": attendee_count,
    }


@router.get("/live-sessions/{session_id}/messages")
async def get_live_session_messages(session_id: str, kind: Optional[str] = None):
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    query = {"session_id": session_id}
    if kind:
        query["kind"] = kind

    return await db.live_session_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(length=500)


@router.post("/live-sessions/{session_id}/messages")
async def post_live_session_message(session_id: str, payload: LiveSessionMessageRequest):
    db = get_db()
    session = await db.live_sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Live session not found")

    message = payload.message.strip()
    if len(message) < 2:
        raise HTTPException(status_code=400, detail="Message is too short")

    record = {
        "id": f"msg_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "session_id": session_id,
        "display_name": payload.display_name.strip(),
        "email": payload.email.lower() if payload.email else None,
        "message": message,
        "kind": payload.kind,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.live_session_messages.insert_one(record.copy())
    return record


# ============ SACRED GUARDIANS & ALLIES ============

@router.get("/sacred-guardians")
async def get_sacred_guardians(category: Optional[str] = None):
    """Get sacred guardians and allies, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    guardians = await db.sacred_guardians.find(query, {"_id": 0}).to_list(length=100)
    return guardians


@router.get("/sacred-guardians/{guardian_id}")
async def get_sacred_guardian(guardian_id: str):
    """Get a specific sacred guardian."""
    db = get_db()
    guardian = await db.sacred_guardians.find_one({"id": guardian_id}, {"_id": 0})
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    return guardian


# ============ ANCIENT WISDOM TRADITIONS ============

@router.get("/ancient-wisdom")
async def get_ancient_wisdom(tradition: Optional[str] = None):
    """Get ancient wisdom entries, optionally filtered by tradition."""
    db = get_db()
    query = {}
    if tradition:
        query["tradition"] = {"$regex": f"^{tradition}$", "$options": "i"}
    entries = await db.ancient_wisdom.find(query, {"_id": 0}).to_list(length=200)
    return entries


@router.get("/ancient-wisdom/{entry_id}")
async def get_ancient_wisdom_entry(entry_id: str):
    """Get a specific ancient wisdom entry."""
    db = get_db()
    entry = await db.ancient_wisdom.find_one({"id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry



# ============ SOUND FREQUENCIES ROUTES ============

@router.get("/sound-frequencies")
async def get_sound_frequencies(category: Optional[str] = None):
    """Get sound frequency healing content, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    entries = await db.sound_frequencies.find(query, {"_id": 0}).to_list(length=50)
    return entries


@router.get("/sound-frequencies/{freq_id}")
async def get_sound_frequency(freq_id: str):
    """Get a specific sound frequency entry."""
    db = get_db()
    entry = await db.sound_frequencies.find_one({"id": freq_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Sound frequency not found")
    return entry



# ============ TAROT ROUTES ============

@router.get("/tarot/cards")
async def get_tarot_cards(arcana: Optional[str] = None):
    """Get tarot cards, optionally filtered by arcana type."""
    db = get_db()
    query = {}
    if arcana:
        query["arcana"] = {"$regex": f"^{arcana}$", "$options": "i"}
    cards = await db.tarot_cards.find(query, {"_id": 0}).to_list(length=100)
    return cards


@router.get("/tarot/cards/{card_id}")
async def get_tarot_card(card_id: str):
    """Get a specific tarot card."""
    db = get_db()
    card = await db.tarot_cards.find_one({"id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Tarot card not found")
    return card


@router.get("/tarot/reading")
async def get_tarot_reading(spread: str = "single"):
    """Get a random tarot reading. Spreads: single, three, celtic_cross"""
    import random
    db = get_db()
    cards = await db.tarot_cards.find({}, {"_id": 0}).to_list(length=100)
    
    if not cards:
        raise HTTPException(status_code=404, detail="No tarot cards found")
    
    if spread == "single":
        selected = random.sample(cards, 1)
        positions = ["Present Situation"]
    elif spread == "three":
        selected = random.sample(cards, 3)
        positions = ["Past", "Present", "Future"]
    elif spread == "celtic_cross":
        selected = random.sample(cards, min(10, len(cards)))
        positions = ["Present", "Challenge", "Past", "Future", "Above", "Below", 
                    "Advice", "External Influences", "Hopes/Fears", "Outcome"]
    else:
        selected = random.sample(cards, 1)
        positions = ["Message"]
    
    # Add reversed status randomly
    reading = []
    for i, card in enumerate(selected):
        is_reversed = random.choice([True, False])
        reading.append({
            "position": positions[i] if i < len(positions) else f"Card {i+1}",
            "card": card,
            "reversed": is_reversed,
            "meaning": card["reversed_meaning"] if is_reversed else card["upright_meaning"]
        })
    
    return {"spread": spread, "cards": reading}



# ============ RETREATS ROUTES ============

@router.get("/retreats")
async def get_retreats(status: Optional[str] = None):
    """Get retreats, optionally filtered by status."""
    db = get_db()
    query = {}
    if status:
        query["status"] = {"$regex": f"^{status}$", "$options": "i"}
    retreats = await db.retreats.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=50)
    return retreats


@router.get("/retreats/{retreat_id}")
async def get_retreat(retreat_id: str):
    """Get a specific retreat."""
    db = get_db()
    retreat = await db.retreats.find_one({"id": retreat_id}, {"_id": 0})
    if not retreat:
        raise HTTPException(status_code=404, detail="Retreat not found")
    return retreat


# ============ VIDEOS ROUTES ============

@router.get("/videos")
async def get_videos(category: Optional[str] = None):
    """Get practice videos, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    videos = await db.videos.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return videos


@router.get("/videos/{video_id}")
async def get_video(video_id: str):
    """Get a specific video."""
    db = get_db()
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


# ============ COURSES ROUTES ============

@router.get("/courses")
async def get_courses(category: Optional[str] = None, level: Optional[str] = None):
    """Get courses, optionally filtered by category or level."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if level:
        query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    courses = await db.courses.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return courses


@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    """Get a specific course."""
    db = get_db()
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ============ SACRED RITES ROUTES ============

@router.get("/sacred-rites")
async def get_sacred_rites():
    """Get sacred rites (Munay Ki, Nusta Karpay, 13th Womb Rite) from courses collection."""
    db = get_db()
    rites = await db.courses.find(
        {"category": "Shamanic Initiation"},
        {"_id": 0}
    ).to_list(length=20)
    return rites


@router.get("/sacred-rites/{rite_id}")
async def get_sacred_rite(rite_id: str):
    """Get a specific sacred rite."""
    db = get_db()
    rite = await db.courses.find_one(
        {"id": rite_id, "category": "Shamanic Initiation"},
        {"_id": 0}
    )
    if not rite:
        raise HTTPException(status_code=404, detail="Sacred rite not found")
    return rite


# ============ COMMUNITY ROUTES ============

@router.get("/community/posts")
async def get_community_posts(type: Optional[str] = None):
    """Get community posts, optionally filtered by type."""
    db = get_db()
    query = {"status": {"$ne": "hidden"}}
    if type:
        query["type"] = {"$regex": f"^{type}$", "$options": "i"}
    posts = await db.community_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=100)
    return posts


@router.post("/community/posts")
async def create_community_post(post_data: dict):
    """Create a new community post (shared from journal or directly)."""
    from datetime import datetime, timezone
    db = get_db()
    post = {
        "id": f"post_{int(datetime.now(timezone.utc).timestamp() * 1000)}",
        "title": post_data.get("title", "Reflection"),
        "content": post_data.get("content", ""),
        "author": post_data.get("author", "Anonymous"),
        "author_name": post_data.get("author_name", post_data.get("author", "Sacred Seeker")),
        "type": post_data.get("type", "reflection"),
        "element": post_data.get("element", ""),
        "practice_type": post_data.get("practice_type", ""),
        "moon_phase": post_data.get("moon_phase", ""),
        "mood": post_data.get("mood", ""),
        "tags": post_data.get("tags", []),
        "likes": 0,
        "comments": [],
        "status": "published",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.community_posts.insert_one(post)
    post.pop("_id", None)
    return post


@router.post("/community/posts/{post_id}/like")
async def like_community_post(post_id: str):
    """Like a community post."""
    db = get_db()
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$inc": {"likes": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"success": True}


@router.post("/community/posts/{post_id}/replies")
async def add_community_reply(post_id: str, reply_data: dict):
    """Add a reply/comment to a community post."""
    from datetime import datetime, timezone
    import uuid
    db = get_db()
    reply = {
        "id": str(uuid.uuid4())[:8],
        "author_name": reply_data.get("author_name", "Sacred Seeker"),
        "content": reply_data.get("content", "").strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if not reply["content"]:
        raise HTTPException(status_code=400, detail="Reply content cannot be empty")
    result = await db.community_posts.update_one(
        {"id": post_id},
        {"$push": {"comments": reply}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return reply


# ============ SACRED GEOMETRY ROUTES ============

@router.get("/sacred-geometry")
async def get_sacred_geometry_collection():
    """Get sacred geometry guides from dedicated collection."""
    db = get_db()
    guides = await db.sacred_geometry.find({}, {"_id": 0}).to_list(length=100)
    return guides


# ============ ENERGY HEALING ROUTES ============

@router.get("/energy-healing")
async def get_energy_healing(modality: Optional[str] = None):
    """Get energy healing modalities with self-healing guides."""
    db = get_db()
    query = {}
    if modality:
        query["modality"] = {"$regex": f"^{modality}$", "$options": "i"}
    practices = await db.energy_healing.find(query, {"_id": 0}).to_list(length=100)
    return practices


@router.get("/energy-healing/{practice_id}")
async def get_energy_healing_practice(practice_id: str):
    db = get_db()
    practice = await db.energy_healing.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")
    return practice


# ============ FREE FORM MOVEMENT ROUTES ============

@router.get("/free-form-movement")
async def get_free_form_movement(category: Optional[str] = None):
    """Get free form movement and somatic yoga practices."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.free_form_movement.find(query, {"_id": 0}).to_list(length=100)
    return practices


# ============ CHAKRA CLEANSING ROUTES ============

@router.get("/chakra-cleansing")
async def get_chakra_cleansing(chakra: Optional[str] = None):
    """Get chakra cleansing practices for all 13 chakras."""
    db = get_db()
    query = {}
    if chakra:
        query["chakra"] = {"$regex": f"^{chakra}$", "$options": "i"}
    practices = await db.chakra_cleansing.find(query, {"_id": 0}).to_list(length=100)
    return practices


@router.get("/chakra-cleansing/{chakra_id}")
async def get_chakra_cleansing_practice(chakra_id: str):
    """Get a specific chakra cleansing practice."""
    db = get_db()
    practice = await db.chakra_cleansing.find_one({"id": chakra_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Chakra practice not found")
    return practice


# ============ SOMATIC YOGA ROUTES ============

@router.get("/somatic-yoga")
async def get_somatic_yoga(style: Optional[str] = None):
    """Get somatic yoga practices."""
    db = get_db()
    query = {}
    if style:
        query["style"] = {"$regex": f"^{style}$", "$options": "i"}
    practices = await db.somatic_yoga.find(query, {"_id": 0}).to_list(length=100)
    return practices


@router.get("/somatic-yoga/{practice_id}")
async def get_somatic_yoga_practice(practice_id: str):
    """Get a specific somatic yoga practice."""
    db = get_db()
    practice = await db.somatic_yoga.find_one({"id": practice_id}, {"_id": 0})
    if not practice:
        raise HTTPException(status_code=404, detail="Somatic yoga practice not found")
    return practice


# ============ FEMININE EMBODIMENT (ROSE TEMPLE) ============

@router.get("/feminine-embodiment")
async def get_feminine_embodiment(category: Optional[str] = None):
    """Get feminine embodiment practices for Rose Temple."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.feminine_embodiment.find(query, {"_id": 0}).to_list(length=100)
    return practices


# ============ DAILY SACRED PRACTICE ============

@router.get("/daily-practice")
async def get_daily_practice(focus: Optional[str] = None):
    """
    Get a daily sacred practice based on moon phase, day of week, and optional focus area.
    Returns morning and evening practice pair.
    """
    import random
    from datetime import datetime
    import math
    
    db = get_db()
    
    # Calculate moon phase (0-29.5 days cycle)
    def get_moon_phase():
        known_new_moon = datetime(2024, 1, 11)  # Known new moon date
        days_since = (datetime.now() - known_new_moon).days
        moon_age = days_since % 29.5
        
        if moon_age < 1.85:
            return "new_moon"
        if moon_age < 7.38:
            return "waxing_crescent"
        if moon_age < 9.23:
            return "first_quarter"
        if moon_age < 14.77:
            return "waxing_gibbous"
        if moon_age < 16.61:
            return "full_moon"
        if moon_age < 22.15:
            return "waning_gibbous"
        if moon_age < 23.99:
            return "last_quarter"
        return "waning_crescent"
    
    moon_phase = get_moon_phase()
    day_of_week = datetime.now().strftime("%A").lower()
    
    # Moon phase practice recommendations
    moon_guidance = {
        "new_moon": {"theme": "New Beginnings & Intention Setting", "energy": "introspective", "focus": ["womb", "shadow", "rest"]},
        "waxing_crescent": {"theme": "Taking First Steps", "energy": "building", "focus": ["warrior", "solar", "action"]},
        "first_quarter": {"theme": "Overcoming Challenges", "energy": "active", "focus": ["warrior", "boundaries", "strength"]},
        "waxing_gibbous": {"theme": "Refinement & Adjustment", "energy": "refining", "focus": ["heart", "relationship", "healing"]},
        "full_moon": {"theme": "Illumination & Release", "energy": "peak", "focus": ["crown", "release", "celebration"]},
        "waning_gibbous": {"theme": "Gratitude & Sharing", "energy": "distributing", "focus": ["heart", "service", "teaching"]},
        "last_quarter": {"theme": "Letting Go", "energy": "releasing", "focus": ["grief", "shadow", "forgiveness"]},
        "waning_crescent": {"theme": "Rest & Surrender", "energy": "surrendering", "focus": ["rest", "womb", "intuition"]}
    }
    
    # Day of week themes
    day_themes = {
        "monday": {"ruler": "Moon", "theme": "Intuition & Emotions", "practices": ["lunar", "womb", "water"]},
        "tuesday": {"ruler": "Mars", "theme": "Courage & Action", "practices": ["warrior", "fire", "strength"]},
        "wednesday": {"ruler": "Mercury", "theme": "Communication & Learning", "practices": ["throat", "sage", "voice"]},
        "thursday": {"ruler": "Jupiter", "theme": "Expansion & Abundance", "practices": ["crown", "spiritual", "gratitude"]},
        "friday": {"ruler": "Venus", "theme": "Love & Beauty", "practices": ["heart", "sensuality", "self-love"]},
        "saturday": {"ruler": "Saturn", "theme": "Structure & Discipline", "practices": ["root", "grounding", "boundaries"]},
        "sunday": {"ruler": "Sun", "theme": "Vitality & Self-Expression", "practices": ["solar", "king", "radiance"]}
    }
    
    current_moon = moon_guidance.get(moon_phase, moon_guidance["new_moon"])
    current_day = day_themes.get(day_of_week, day_themes["monday"])
    
    # Fetch practices from all collections
    all_practices = []
    
    # Chakra practices
    chakras = await db.chakra_cleansing.find({}, {"_id": 0}).to_list(100)
    for c in chakras:
        c["source"] = "chakra"
        c["practice_type"] = "chakra_cleansing"
    all_practices.extend(chakras)
    
    # Feminine embodiment
    feminine = await db.feminine_embodiment.find({}, {"_id": 0}).to_list(100)
    for f in feminine:
        f["source"] = "feminine"
        f["practice_type"] = "embodiment"
    all_practices.extend(feminine)
    
    # Masculine embodiment
    masculine = await db.masculine_embodiment.find({}, {"_id": 0}).to_list(100)
    for m in masculine:
        m["source"] = "masculine"
        m["practice_type"] = "embodiment"
    all_practices.extend(masculine)
    
    # Energy healing
    energy = await db.energy_healing.find({}, {"_id": 0}).to_list(100)
    for e in energy:
        e["source"] = "energy"
        e["practice_type"] = "energy_healing"
    all_practices.extend(energy)
    
    # Somatic yoga
    somatic = await db.somatic_yoga.find({}, {"_id": 0}).to_list(100)
    for s in somatic:
        s["source"] = "somatic"
        s["practice_type"] = "somatic_yoga"
    all_practices.extend(somatic)
    
    # Free form movement
    movement = await db.free_form_movement.find({}, {"_id": 0}).to_list(100)
    for m in movement:
        m["source"] = "movement"
        m["practice_type"] = "free_form_movement"
    all_practices.extend(movement)
    
    # Filter by focus if provided
    if focus:
        focus_lower = focus.lower()
        filtered = [p for p in all_practices if 
                    focus_lower in str(p.get("name", "")).lower() or
                    focus_lower in str(p.get("description", "")).lower() or
                    focus_lower in str(p.get("category", "")).lower() or
                    focus_lower in str(p.get("chakra", "")).lower()]
        if filtered:
            all_practices = filtered
    
    # Select morning practice (more active/awakening)
    morning_keywords = ["awakening", "warrior", "solar", "activation", "grounding", "breath", "movement"]
    morning_candidates = [p for p in all_practices if any(kw in str(p).lower() for kw in morning_keywords)]
    if not morning_candidates:
        morning_candidates = all_practices
    morning_practice = random.choice(morning_candidates) if morning_candidates else None
    
    # Select evening practice (more restful/reflective)
    evening_keywords = ["rest", "release", "healing", "moon", "womb", "heart", "grief", "restorative"]
    evening_candidates = [p for p in all_practices if any(kw in str(p).lower() for kw in evening_keywords)]
    if not evening_candidates:
        evening_candidates = all_practices
    # Avoid same practice as morning
    if morning_practice:
        evening_candidates = [p for p in evening_candidates if p.get("id") != morning_practice.get("id")]
    evening_practice = random.choice(evening_candidates) if evening_candidates else None
    
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "day_of_week": day_of_week.capitalize(),
        "day_ruler": current_day["ruler"],
        "day_theme": current_day["theme"],
        "moon_phase": moon_phase.replace("_", " ").title(),
        "moon_theme": current_moon["theme"],
        "moon_energy": current_moon["energy"],
        "guidance": f"Today is {day_of_week.capitalize()}, ruled by {current_day['ruler']}, during the {moon_phase.replace('_', ' ')}. This is a powerful time for {current_moon['theme'].lower()}. Honor the {current_moon['energy']} energy by moving gently with the cosmic rhythm.",
        "morning_practice": morning_practice,
        "evening_practice": evening_practice,
        "reflection_prompts": [
            f"What wants to be {current_moon['energy'].replace('ing', 'ed') if current_moon['energy'].endswith('ing') else current_moon['energy']} in my life right now?",
            f"How can I honor the energy of {current_day['ruler']} today?",
            "What is my body asking for in this moment?"
        ]
    }


# ============ MASCULINE EMBODIMENT ============

@router.get("/masculine-embodiment")
async def get_masculine_embodiment(category: Optional[str] = None):
    """Get masculine embodiment practices for Masculine Temple."""
    db = get_db()
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    practices = await db.masculine_embodiment.find(query, {"_id": 0}).to_list(length=100)
    return practices


# ============ ELEMENTAL TEMPLES ROUTES ============

@router.get("/elemental-temples")
async def get_elemental_temples():
    """Get all 5 elemental temples with full content."""
    db = get_db()
    temples = await db.elemental_temples.find({}, {"_id": 0}).to_list(length=10)
    return temples


@router.get("/elemental-temples/{element_id}")
async def get_elemental_temple(element_id: str):
    """Get a specific elemental temple by id (earth, water, fire, air, spirit)."""
    db = get_db()
    temple = await db.elemental_temples.find_one({"id": element_id}, {"_id": 0})
    if not temple:
        raise HTTPException(status_code=404, detail="Temple not found")
    return temple


# ============ WATER PRACTICES ROUTES ============

@router.get("/water-practices")
async def get_water_practices(category: Optional[str] = None):
    """Get water practices, optionally filtered by category."""
    db = get_db()
    query = {}
    if category:
        query["category"] = category
    practices = await db.water_practices.find(query, {"_id": 0}).to_list(length=100)
    return practices

