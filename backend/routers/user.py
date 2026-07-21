"""User routes for dashboard, favorites, practice history, rituals, journal, achievements."""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Any, Optional, List
from datetime import datetime, timezone, timedelta
import base64
from collections import Counter
import uuid
import logging
import os
import re

from .dependencies import get_db, get_current_user, User
from services.object_storage import put_object, get_object, build_storage_path

router = APIRouter(tags=["user"])
logger = logging.getLogger(__name__)


def _resolve_mobile_origin(request: Request) -> str:
    origin = request.headers.get("origin") or request.headers.get("referer") or ""
    if not origin:
        return ""
    parts = str(origin).split("/")
    if "//" not in origin or len(parts) < 3:
        return ""
    return f"{parts[0]}//{parts[2]}"


def _android_api_contract_payload(request: Request) -> dict[str, Any]:
    return {
        "mobile_platform": "android",
        "api_version": "v1",
        "base_path": "/api",
        "auth": {
            "cookie_session": True,
            "bearer_fallback": True,
            "required_headers": ["Content-Type", "Authorization (optional)"],
        },
        "required_public_endpoints": [
            "/api/health",
            "/api/auth/me",
            "/api/meditations",
            "/api/mindfulness",
            "/api/heart-practices",
            "/api/healing-portals",
            "/api/energy-healing",
            "/api/mantras",
            "/api/tts/generate-base64",
            "/api/content/expand-script",
            "/api/user/account/export",
            "/api/user/account/delete-request",
            "/api/user/account/deletion-status",
        ],
        "privacy_and_account_deletion": {
            "export_endpoint": "/api/user/account/export",
            "deletion_request_endpoint": "/api/user/account/delete-request",
            "deletion_status_endpoint": "/api/user/account/deletion-status",
        },
        "cors_origin_received": _resolve_mobile_origin(request),
    }


@router.get("/mobile/android-api-config")
async def get_android_api_config(request: Request) -> dict[str, Any]:
    """Android API integration contract for Play Store review and mobile clients."""
    return _android_api_contract_payload(request)


@router.get("/android-api-config")
async def get_android_api_config_short(request: Request) -> dict[str, Any]:
    """Backward-compatible Android API contract endpoint under /api/user/android-api-config."""
    return _android_api_contract_payload(request)


@router.get("/user/mobile/android-api-config")
async def get_android_api_config_prefixed(request: Request) -> dict[str, Any]:
    """Compatibility alias for clients expecting /api/user/mobile/android-api-config."""
    return _android_api_contract_payload(request)


@router.get("/user/android-api-config")
async def get_android_api_config_prefixed_short(request: Request) -> dict[str, Any]:
    """Compatibility alias for clients expecting /api/user/android-api-config."""
    return _android_api_contract_payload(request)


# ============ MODELS ============

class FavoriteCreate(BaseModel):
    item_type: str  # "pose", "crystal", "mantra", "mudra", "breathwork", "somatic", "grounding"
    item_id: str


class PracticeLogCreate(BaseModel):
    practice_type: str  # "yoga", "breathwork", "meditation", "oracle", "elemental", etc.
    practice_id: Optional[str] = None
    duration_minutes: int
    notes: Optional[str] = None
    element: Optional[str] = None


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


class ReminderSettings(BaseModel):
    enabled: bool = True
    time: str = "08:00"  # HH:MM format
    days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ritual_id: Optional[str] = None
    message: Optional[str] = None


class AccountDeletionRequest(BaseModel):
    reason: Optional[str] = None
    feedback: Optional[str] = None


class JournalEntryCreate(BaseModel):
    title: Optional[str] = None
    content: str
    mood: Optional[str] = None  # "peaceful", "energized", "grateful", "reflective", "challenged"
    practices_completed: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    journal_type: Optional[str] = "personal"  # "moon", "dream", "personal"
    moon_phase: Optional[str] = None  # For moon journal
    moon_intention: Optional[str] = None  # For moon journal
    dream_symbols: Optional[str] = None  # For dream journal


class PracticeJournalEntryCreate(BaseModel):
    entry_id: Optional[str] = None
    practice_name: str
    practice_type: str
    mood_before: int
    mood_after: int
    duration_minutes: int
    body_sensations: Optional[str] = None
    spiritual_downloads: Optional[str] = None
    intentions: Optional[str] = None
    key_insights: Optional[str] = None
    reflection: Optional[str] = None
    moon_phase: Optional[str] = None
    moon_emoji: Optional[str] = None
    voice_note_file_id: Optional[str] = None


class PracticeJournalEntryUpdate(PracticeJournalEntryCreate):
    pass


WEEKDAY_SEQUENCE = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

WEEKLY_REFLECTION_STOP_WORDS = {
    "about", "after", "again", "along", "also", "always", "around", "because", "being", "between",
    "could", "during", "every", "first", "focus", "from", "have", "into", "journey", "light", "maybe",
    "mind", "more", "much", "need", "notes", "over", "practice", "really", "still", "that", "their",
    "there", "these", "this", "through", "today", "toward", "very", "what", "when", "where", "which",
    "with", "within", "would", "your", "feel", "felt", "body", "heart", "sacred", "energy", "healing",
}


class VoiceProfileCreate(BaseModel):
    name: str
    sample_file_id: str
    description: Optional[str] = None


class UserMantraCreate(BaseModel):
    text: str
    category: Optional[str] = "personal"  # "healing", "abundance", "protection", "love", "personal"
    element: Optional[str] = None  # "earth", "water", "fire", "air", "spirit"
    notes: Optional[str] = None


class UserMantraUpdate(BaseModel):
    text: Optional[str] = None
    category: Optional[str] = None
    element: Optional[str] = None
    notes: Optional[str] = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_audio_extension(filename: str, content_type: str) -> str:
    lowered_name = (filename or "").lower()
    if lowered_name.endswith(".webm"):
        return "webm"
    if lowered_name.endswith(".mp3"):
        return "mp3"
    if lowered_name.endswith(".ogg"):
        return "ogg"
    if lowered_name.endswith(".wav"):
        return "wav"
    if lowered_name.endswith(".m4a") or lowered_name.endswith(".mp4"):
        return "m4a"

    content_type_map = {
        "audio/webm": "webm",
        "audio/webm;codecs=opus": "webm",
        "audio/ogg": "ogg",
        "audio/ogg;codecs=opus": "ogg",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/wav": "wav",
        "audio/x-wav": "wav",
        "audio/mp4": "m4a",
        "audio/x-m4a": "m4a",
    }
    return content_type_map.get((content_type or "").lower(), "webm")


def _validate_audio_upload(content_type: str, file_size_bytes: int) -> None:
    allowed_types = {
        "audio/webm",
        "audio/webm;codecs=opus",
        "audio/ogg",
        "audio/ogg;codecs=opus",
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/x-m4a",
    }
    normalized_type = (content_type or "").lower()
    if normalized_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported audio format")

    max_bytes = int(os.environ["VOICE_NOTE_MAX_UPLOAD_BYTES"])
    if file_size_bytes > max_bytes:
        raise HTTPException(status_code=400, detail="Audio file exceeds size limit")


def _safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value)
    except Exception:
        return fallback


def _safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return fallback


def _parse_iso_datetime(value: Any) -> datetime | None:
    raw = str(value or "").strip()
    if not raw:
        return None
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _tokenize_weekly_reflection_text(*texts: str) -> list[str]:
    combined = " ".join(str(text or "") for text in texts)
    tokens = re.findall(r"[a-zA-Z']+", combined.lower())
    return [
        token for token in tokens
        if len(token) >= 4 and token not in WEEKLY_REFLECTION_STOP_WORDS
    ]


def _build_weekly_plan_focus(top_type: str, key_themes: list[str]) -> list[dict[str, str]]:
    normalized_type = (top_type or "practice").strip().lower()
    primary_theme = (key_themes[0] if key_themes else "integration").replace("_", " ")
    secondary_theme = (key_themes[1] if len(key_themes) > 1 else "nervous-system regulation").replace("_", " ")

    daily_focuses = [
        f"Regulate through {normalized_type} rhythm",
        f"Deepen {primary_theme}",
        "Anchor embodied boundaries",
        f"Refine {secondary_theme}",
        "Nourish recovery and hydration",
        "Expand devotional joy",
        "Integrate insights into aligned action",
    ]
    daily_practices = [
        f"12-minute {normalized_type} reset with long exhale pacing.",
        "Journal one body sensation and one emotional shift before and after practice.",
        "Close one open loop with compassionate honesty and clear boundary language.",
        "Return to one recurring insight and apply it in a concrete real-life moment.",
        "Gentle movement + breath with low stimulation and deep replenishment.",
        "Celebrate one visible change in presence, mood, or relational quality.",
        "Weekly review + choose one non-negotiable ritual anchor for next week.",
    ]
    daily_prompts = [
        "Where did my breath become medicine today?",
        f"How did {primary_theme} change my nervous system state?",
        "What boundary honored both tenderness and truth?",
        f"What did {secondary_theme} teach me about sustainable growth?",
        "What did rest reveal that effort could not?",
        "What am I now ready to receive with less resistance?",
        "Which one ritual keeps this alchemy embodied next week?",
    ]

    plan: list[dict[str, str]] = []
    for index, weekday in enumerate(WEEKDAY_SEQUENCE):
        plan.append(
            {
                "day": weekday,
                "focus": daily_focuses[index],
                "practice": daily_practices[index],
                "journal_prompt": daily_prompts[index],
            }
        )
    return plan


def _build_weekly_reflection_payload(entries: list[dict[str, Any]], days: int = 7) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    if not entries:
        return {
            "period_start": (now - timedelta(days=max(1, days - 1))).date().isoformat(),
            "period_end": now.date().isoformat(),
            "days_considered": days,
            "entries_analyzed": 0,
            "total_minutes": 0,
            "average_mood_shift": 0.0,
            "top_practice_types": [],
            "key_themes": ["consistency", "grounding", "integration"],
            "energetic_summary": "No entries yet this week. Begin with one short daily check-in and observe your mood shift before and after practice.",
            "alchemy_focus": "Consistency over intensity",
            "integration_vow": "I commit to one daily ritual pulse, even if brief, and track its real effect on body and mood.",
            "weekly_alchemy_plan": _build_weekly_plan_focus("practice", ["consistency", "grounding"]),
        }

    parsed_dates = [_parse_iso_datetime(entry.get("created_at")) for entry in entries]
    valid_dates = [item for item in parsed_dates if item is not None]
    start_date = min(valid_dates).date().isoformat() if valid_dates else (now - timedelta(days=max(1, days - 1))).date().isoformat()
    end_date = max(valid_dates).date().isoformat() if valid_dates else now.date().isoformat()

    total_minutes = sum(max(0, _safe_int(entry.get("duration_minutes"), 0)) for entry in entries)
    mood_shifts = [
        _safe_float(entry.get("mood_after"), 0) - _safe_float(entry.get("mood_before"), 0)
        for entry in entries
    ]
    average_mood_shift = round((sum(mood_shifts) / len(mood_shifts)) if mood_shifts else 0.0, 2)

    practice_counter = Counter(
        str(entry.get("practice_type") or "other").strip().lower()
        for entry in entries
        if str(entry.get("practice_type") or "").strip()
    )
    top_practice_types = [
        {"type": practice_type, "count": count}
        for practice_type, count in practice_counter.most_common(3)
    ]

    token_counter: Counter[str] = Counter()
    for entry in entries:
        token_counter.update(
            _tokenize_weekly_reflection_text(
                entry.get("reflection") or "",
                entry.get("key_insights") or "",
                entry.get("spiritual_downloads") or "",
                entry.get("intentions") or "",
                entry.get("body_sensations") or "",
            )
        )
    key_themes = [token.replace("_", " ") for token, _ in token_counter.most_common(5)] or ["integration", "regulation", "clarity"]

    dominant_type = (top_practice_types[0]["type"] if top_practice_types else "practice").replace("_", " ")
    top_theme = key_themes[0]
    energetic_summary = (
        f"This week you logged {len(entries)} entries and {total_minutes} practice minutes. "
        f"Your strongest current is {dominant_type}, with an average mood shift of {average_mood_shift:+.2f}. "
        f"Recurring theme: {top_theme}."
    )

    integration_vow = (
        f"I honor this week\'s alchemy by practicing {dominant_type} with steady pacing, integrating {top_theme}, "
        "and completing one grounded action each day."
    )

    return {
        "period_start": start_date,
        "period_end": end_date,
        "days_considered": days,
        "entries_analyzed": len(entries),
        "total_minutes": total_minutes,
        "average_mood_shift": average_mood_shift,
        "top_practice_types": top_practice_types,
        "key_themes": key_themes,
        "energetic_summary": energetic_summary,
        "alchemy_focus": f"Stabilize {top_theme} through {dominant_type}",
        "integration_vow": integration_vow,
        "weekly_alchemy_plan": _build_weekly_plan_focus(dominant_type, key_themes),
    }


def _normalize_practice_journal_entry(document: dict[str, Any], file_map: dict[str, dict[str, Any]]) -> dict[str, Any]:
    file_id = document.get("voice_note_file_id")
    file_record = file_map.get(str(file_id)) if file_id else None

    result = {
        "id": document.get("entry_id"),
        "entry_id": document.get("entry_id"),
        "practice_name": document.get("practice_name"),
        "practice_type": document.get("practice_type"),
        "mood_before": _safe_int(document.get("mood_before"), 3),
        "mood_after": _safe_int(document.get("mood_after"), 4),
        "duration_minutes": _safe_int(document.get("duration_minutes"), 0),
        "body_sensations": document.get("body_sensations") or "",
        "spiritual_downloads": document.get("spiritual_downloads") or "",
        "intentions": document.get("intentions") or "",
        "key_insights": document.get("key_insights") or "",
        "reflection": document.get("reflection") or "",
        "moon_phase": document.get("moon_phase") or "",
        "moon_emoji": document.get("moon_emoji") or "",
        "created_at": document.get("created_at"),
        "updated_at": document.get("updated_at"),
        "voice_note_file_id": file_id,
        "voice_note_duration_seconds": _safe_int((file_record or {}).get("duration_seconds"), 0),
        "voice_note_mime_type": (file_record or {}).get("content_type") or "",
        "voice_note_url": f"/api/voice-files/{file_id}/download" if file_record else "",
        "voice_note_data_url": "",
    }
    return result


async def _build_voice_file_map_for_entries(db: Any, user_id: str, entries: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    file_ids = [str(item.get("voice_note_file_id")) for item in entries if item.get("voice_note_file_id")]
    if not file_ids:
        return {}

    records = await db.user_voice_files.find(
        {
            "file_id": {"$in": file_ids},
            "user_id": user_id,
            "is_deleted": False,
        },
        {"_id": 0},
    ).to_list(length=500)
    return {str(record.get("file_id")): record for record in records if record.get("file_id")}


async def _soft_delete_voice_file(db: Any, user_id: str, file_id: str) -> None:
    await db.user_voice_files.update_one(
        {
            "file_id": file_id,
            "user_id": user_id,
            "is_deleted": False,
        },
        {
            "$set": {
                "is_deleted": True,
                "updated_at": _now_iso(),
            }
        },
    )


# ============ DASHBOARD ============

@router.get("/dashboard/daily")
async def get_daily_guidance(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get personalized daily guidance."""
    db = get_db()

    try:
        context = await _fetch_daily_guidance_context(db, user.user_id)
        return _format_daily_guidance_response(user, context)
    except Exception as exc:
        return _handle_daily_guidance_error(user, exc)


def _today_key() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _sorted_daily_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: str(item.get("id") or item.get("name") or item.get("title") or ""),
    )


def _daily_seed_index(user_id: str, date_key: str, salt: str, length: int) -> int:
    if length <= 0:
        return 0
    seed_value = uuid.uuid5(uuid.NAMESPACE_DNS, f"{user_id}|{date_key}|{salt}").int
    return seed_value % length


def _pick_daily_item(
    items: list[dict[str, Any]],
    user_id: str,
    date_key: str,
    salt: str,
) -> Optional[dict[str, Any]]:
    if not items:
        return None
    ordered = _sorted_daily_items(items)
    return ordered[_daily_seed_index(user_id, date_key, salt, len(ordered))]


def _first_list_item(value: Any, fallback: str = "") -> str:
    if isinstance(value, list):
        for item in value:
            text = str(item or "").strip()
            if text:
                return text
    text = str(value or "").strip()
    return text or fallback


def _build_daily_journal_prompts(
    current_moon: Optional[dict[str, Any]],
    daily_ally: Optional[dict[str, Any]],
    daily_angel: Optional[dict[str, Any]],
    dragon_reflection: Optional[dict[str, Any]],
) -> list[str]:
    prompts: list[str] = []

    moon_name = str((current_moon or {}).get("name") or "this moon phase").strip()
    moon_element = str((current_moon or {}).get("element") or "Spirit").strip()
    prompts.append(f"How can I embody {moon_name} through my {moon_element.lower()} element today?")

    for source in (daily_ally, daily_angel):
        if not source:
            continue
        ally_name = str(source.get("name") or "this ally").strip()
        journal_prompt = _first_list_item(source.get("journal_prompts"))
        if journal_prompt:
            prompts.append(f"{ally_name}: {journal_prompt}")

    dragon_prompt = str((dragon_reflection or {}).get("integration_prompt") or "").strip()
    if dragon_prompt:
        prompts.append(dragon_prompt)

    prompts.append("What sacred action will I complete before nightfall to honor today's guidance?")

    deduped: list[str] = []
    seen: set[str] = set()
    for prompt in prompts:
        normalized = prompt.lower().strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(prompt)

    return deduped[:6]


def _build_dragon_astrology_reflection(
    current_moon: Optional[dict[str, Any]],
    latest_dragon_chart: Optional[dict[str, Any]],
) -> dict[str, Any]:
    moon_name = str((current_moon or {}).get("name") or "Current Moon").strip()

    if latest_dragon_chart:
        dragon_axis = latest_dragon_chart.get("dragon_head_tail_chart") or {}
        dragon_head = dragon_axis.get("dragon_head") or {}
        dragon_tail = dragon_axis.get("dragon_tail") or {}
        chinese_profile = latest_dragon_chart.get("chinese_dragon_chart") or {}
        zodiac_animal = str(chinese_profile.get("zodiac_animal") or "Dragon").strip()

        head_sign = str(dragon_head.get("sign") or "your North Node sign").strip()
        tail_sign = str(dragon_tail.get("sign") or "your South Node sign").strip()
        return {
            "title": "Dragon Axis Integration",
            "summary": f"{moon_name} amplifies your karmic movement from {tail_sign} toward {head_sign}.",
            "zodiac_focus": f"Chinese Zodiac resonance: {zodiac_animal}",
            "integration_prompt": f"What one action today aligns your life from {tail_sign} patterns into {head_sign} embodiment?",
            "is_personalized": True,
        }

    moon_description = str((current_moon or {}).get("description") or "Move slowly and listen deeply.").strip()
    return {
        "title": "Collective Dragon Reflection",
        "summary": f"{moon_name} invites sovereignty through embodied truth and clear intention.",
        "zodiac_focus": moon_description,
        "integration_prompt": "Where can you choose destiny over habit in one practical step today?",
        "is_personalized": False,
    }


def _build_unified_daily_flow(context: dict[str, Any]) -> dict[str, Any]:
    daily_pose = context.get("daily_pose") or {}
    daily_breathwork = context.get("daily_breathwork") or {}
    daily_mantra = context.get("daily_mantra") or {}
    daily_ally = context.get("daily_ally") or {}
    daily_angel = context.get("daily_angel") or {}
    dragon_reflection = context.get("dragon_astrology_reflection") or {}

    ally_name = str(daily_ally.get("name") or "Sacred Ally").strip()
    angel_name = str(daily_angel.get("name") or "Angelic Guide").strip()
    mantra_name = str(daily_mantra.get("name") or "Heart Mantra").strip()
    pose_name = str(daily_pose.get("name") or "Grounding Pose").strip()
    breath_name = str(daily_breathwork.get("name") or "Coherent Breath").strip()

    ally_ritual = _first_list_item(daily_ally.get("rituals"), "Offer one intentional breath with gratitude.")
    angel_ritual = _first_list_item(daily_angel.get("practical_rituals"), "Visualize your field held in clear protective light.")

    journal_prompts = context.get("daily_journal_prompts") or []
    closing_prompt = str(journal_prompts[0]) if journal_prompts else "What sacred action am I choosing now?"

    return {
        "title": "Ceremonial Daily Flow",
        "opening_invocation": "I enter this day with reverence, embodiment, and devotion to truth.",
        "practical_focus": [
            "Complete one physical grounding action in the first hour of your day.",
            "Choose one clear boundary conversation and speak it gently but directly.",
            "Close the day with a 5-minute written integration before sleep.",
        ],
        "spiritual_focus": [
            "Consecrate your day with breath and mantra before opening external inputs.",
            "Treat each transition as ceremony: pause, breathe, choose alignment.",
            "Offer one gratitude prayer to your ally/angel axis before dusk.",
        ],
        "ceremony_steps": [
            {
                "step_id": "attune",
                "title": "Attune to the field",
                "instruction": f"Speak or chant {mantra_name} slowly for 3 rounds and soften the jaw, heart, and belly.",
                "duration_minutes": 4,
                "anchor_name": mantra_name,
                "anchor_route": "/mantras",
            },
            {
                "step_id": "embody",
                "title": "Embody through movement",
                "instruction": f"Practice {pose_name} with slow transitions and a listening body for structural coherence.",
                "duration_minutes": int(daily_pose.get("duration_minutes") or 8),
                "anchor_name": pose_name,
                "anchor_route": "/yoga",
            },
            {
                "step_id": "regulate",
                "title": "Regulate your nervous system",
                "instruction": f"Complete {breath_name} while extending each exhale and releasing pressure from the chest.",
                "duration_minutes": int(daily_breathwork.get("duration_minutes") or 7),
                "anchor_name": breath_name,
                "anchor_route": "/breathwork",
            },
            {
                "step_id": "ally",
                "title": "Sacred ally transmission",
                "instruction": f"Receive guidance from {ally_name}: {ally_ritual}",
                "duration_minutes": 6,
                "anchor_name": ally_name,
                "anchor_route": "/sacred-ally-alchemy",
            },
            {
                "step_id": "angelic",
                "title": "Angelic coherence seal",
                "instruction": f"Seal your practice with {angel_name}: {angel_ritual}",
                "duration_minutes": 5,
                "anchor_name": angel_name,
                "anchor_route": "/angelic-alchemy",
            },
        ],
        "dragon_integration": str(dragon_reflection.get("summary") or "Align your actions with your highest destiny.").strip(),
        "closing_benediction": "Carry this ceremonial state into every conversation, task, and boundary today.",
        "journal_prompt": closing_prompt,
    }


async def _pick_daily_crystal(db: Any, user_id: str, date_key: str) -> Optional[dict[str, Any]]:
    from .content import _resolve_crystal_image

    deep_crystals = await db.crystals_deep.find({}, {"_id": 0}).to_list(length=80)
    if deep_crystals:
        selected_crystal = _pick_daily_item(deep_crystals, user_id, date_key, "daily-crystal-deep")
        if not selected_crystal:
            return None
        return await _resolve_crystal_image(selected_crystal, db)

    fallback_crystals = await db.crystals.find({}, {"_id": 0}).to_list(length=50)
    return _pick_daily_item(fallback_crystals, user_id, date_key, "daily-crystal-fallback")


async def _fetch_latest_dragon_chart(db: Any, user_id: str) -> Optional[dict[str, Any]]:
    return await db.dragon_charts.find_one(
        {
            "user_id": user_id,
            "is_deleted": {"$ne": True},
        },
        {"_id": 0},
        sort=[("saved_at", -1)],
    )


def _default_yoga_sequence_of_day() -> dict[str, Any]:
    return {
        "id": "daily-yoga-sequence",
        "name": "Daily Nervous System Alignment Flow",
        "duration_minutes": 16,
        "poses": ["Mountain", "Cat-Cow", "Low Lunge", "Seated Twist", "Legs-Up-The-Wall"],
    }


def _default_sunrise_sunset_guidance() -> dict[str, list[str]]:
    return {
        "sunrise": [
            "Face first light for 3 deep breaths and set one embodied intention.",
            "Hydrate before caffeine and journal one body sensation.",
            "Move through a 5-minute spinal wake-up sequence.",
        ],
        "sunset": [
            "Dim bright light 45 minutes before sleep prep.",
            "Complete one gratitude + release journal line.",
            "Use a 4-6 breath cycle for parasympathetic downshift.",
        ],
    }


async def _fetch_daily_guidance_context(db: Any, user_id: str) -> dict[str, Any]:
    from .numerology import get_current_month

    date_key = _today_key()
    current_month = await get_current_month()

    yoga_poses = await db.yoga_poses.find({}, {"_id": 0}).to_list(length=100)
    mantras = await db.mantras.find({}, {"_id": 0}).to_list(length=50)
    breathwork_sessions = await db.breathwork_sessions.find({}, {"_id": 0}).to_list(length=20)
    ally_entries = await db.sacred_ally_alchemy.find({}, {"_id": 0}).to_list(length=200)
    angel_entries = await db.angelic_alchemy.find({}, {"_id": 0}).to_list(length=120)

    daily_pose = _pick_daily_item(yoga_poses, user_id, date_key, "daily-pose")
    daily_mantra = _pick_daily_item(mantras, user_id, date_key, "daily-mantra")
    daily_breathwork = _pick_daily_item(breathwork_sessions, user_id, date_key, "daily-breathwork")
    daily_ally = _pick_daily_item(ally_entries, user_id, date_key, "daily-ally")
    daily_angel = _pick_daily_item(angel_entries, user_id, date_key, "daily-angel")
    latest_dragon_chart = await _fetch_latest_dragon_chart(db, user_id)
    dragon_reflection = _build_dragon_astrology_reflection(current_month, latest_dragon_chart)

    daily_journal_prompts = _build_daily_journal_prompts(
        current_moon=current_month,
        daily_ally=daily_ally,
        daily_angel=daily_angel,
        dragon_reflection=dragon_reflection,
    )

    ceremonial_affirmation = (
        _first_list_item((daily_ally or {}).get("affirmations"))
        or _first_list_item((daily_angel or {}).get("affirmations"))
        or "I walk this day as ceremony, compassion, and coherent power."
    )

    context = {
        "current_moon": current_month,
        "daily_pose": daily_pose,
        "daily_crystal": await _pick_daily_crystal(db, user_id, date_key),
        "daily_mantra": daily_mantra,
        "daily_breathwork": daily_breathwork,
        "daily_ally": daily_ally,
        "daily_angel": daily_angel,
        "dragon_astrology_reflection": dragon_reflection,
        "daily_journal_prompts": daily_journal_prompts,
        "ceremonial_affirmation": ceremonial_affirmation,
        "yoga_sequence_of_day": _default_yoga_sequence_of_day(),
        "sunrise_sunset_guidance": _default_sunrise_sunset_guidance(),
    }
    context["unified_daily_flow"] = _build_unified_daily_flow(context)

    return context


def _format_daily_guidance_response(user: User, context: dict[str, Any]) -> dict[str, Any]:
    current_moon = context.get("current_moon")
    first_name = user.name.split()[0] if user.name else "Beloved"
    return {
        "greeting": f"Blessed day, {first_name}",
        "current_moon": current_moon,
        "daily_pose": context.get("daily_pose"),
        "daily_crystal": context.get("daily_crystal"),
        "daily_mantra": context.get("daily_mantra"),
        "daily_breathwork": context.get("daily_breathwork"),
        "daily_ally": context.get("daily_ally"),
        "daily_angel": context.get("daily_angel"),
        "dragon_astrology_reflection": context.get("dragon_astrology_reflection"),
        "daily_journal_prompts": context.get("daily_journal_prompts") or [],
        "ceremonial_affirmation": context.get("ceremonial_affirmation"),
        "unified_daily_flow": context.get("unified_daily_flow"),
        "yoga_sequence_of_day": context.get("yoga_sequence_of_day"),
        "sunrise_sunset_guidance": context.get("sunrise_sunset_guidance"),
        "element_focus": current_moon["element"] if current_moon else "Spirit",
        "guidance_tweak": {
            "practical": [
                "Take one embodied action within the next 60 minutes.",
                "Protect one non-negotiable pocket of sacred time today.",
                "End day with three written reflections: body, heart, purpose.",
            ],
            "spiritual": [
                "Speak your chosen mantra as a doorway into aligned action.",
                "Remember: devotion is measured through consistency, not intensity.",
                "Ask: 'How can I embody sacred love in one concrete choice today?'",
            ],
        },
    }


def _handle_daily_guidance_error(user: User, exc: Exception) -> dict[str, Any]:
    logger.exception("Failed to build daily guidance for user %s", user.user_id)
    fallback_name = user.name.split()[0] if user.name else "Beloved"
    fallback_dragon_reflection = {
        "title": "Collective Dragon Reflection",
        "summary": "Choose one brave aligned action and let it become your ceremony.",
        "zodiac_focus": "Return to breath, body, and truthful action.",
        "integration_prompt": "What single action today proves your devotion to your path?",
        "is_personalized": False,
    }
    fallback_prompts = [
        "What is one sacred action I will complete today?",
        "Where can I choose coherence over urgency?",
        "What did my body teach me today?",
    ]
    return {
        "greeting": f"Blessed day, {fallback_name}",
        "current_moon": None,
        "daily_pose": None,
        "daily_crystal": None,
        "daily_mantra": None,
        "daily_breathwork": None,
        "daily_ally": None,
        "daily_angel": None,
        "dragon_astrology_reflection": fallback_dragon_reflection,
        "daily_journal_prompts": fallback_prompts,
        "ceremonial_affirmation": "I walk this day as ceremony and truth.",
        "unified_daily_flow": {
            "title": "Ceremonial Daily Flow",
            "opening_invocation": "I arrive with reverence and intention.",
            "ceremony_steps": [
                {
                    "step_id": "arrive",
                    "title": "Arrive",
                    "instruction": "Take seven deep breaths and soften your shoulders.",
                    "duration_minutes": 3,
                    "anchor_name": "Breath Arrival",
                    "anchor_route": "/breathwork",
                },
                {
                    "step_id": "move",
                    "title": "Move",
                    "instruction": "Practice one grounding movement sequence with full attention.",
                    "duration_minutes": 8,
                    "anchor_name": "Grounding Sequence",
                    "anchor_route": "/yoga",
                },
                {
                    "step_id": "integrate",
                    "title": "Integrate",
                    "instruction": "Journal one truth and one aligned action for today.",
                    "duration_minutes": 5,
                    "anchor_name": "Journal Integration",
                    "anchor_route": "/journal",
                },
            ],
            "dragon_integration": fallback_dragon_reflection["summary"],
            "closing_benediction": "Carry this coherence into your next conversation.",
            "journal_prompt": fallback_prompts[0],
        },
        "yoga_sequence_of_day": _default_yoga_sequence_of_day(),
        "sunrise_sunset_guidance": _default_sunrise_sunset_guidance(),
        "element_focus": "Spirit",
        "guidance_tweak": {
            "practical": [
                "Complete one meaningful action before checking out of your day.",
                "Hydrate, breathe, and reset your body every transition point.",
            ],
            "spiritual": [
                "Return to your heart center before every key decision.",
                "Offer one small act of devotion with sincerity over performance.",
            ],
        },
    }


# ============ FAVORITES ============

@router.post("/favorites")
async def add_favorite(data: FavoriteCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Add an item to user's favorites."""
    db = get_db()
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


@router.delete("/favorites/{item_type}/{item_id}")
async def remove_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Remove an item from user's favorites."""
    db = get_db()
    result = await db.favorites.delete_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    return {"message": "Removed from favorites"}


@router.get("/favorites")
async def get_favorites(user: User = Depends(get_current_user), item_type: Optional[str] = None) -> list[dict[str, Any]]:
    """Get user's favorites, optionally filtered by type."""
    db = get_db()
    query = {"user_id": user.user_id}
    if item_type:
        query["item_type"] = item_type

    favorites = await db.favorites.find(query, {"_id": 0}).to_list(500)

    ids_by_type: dict[str, list[str]] = {}
    for favorite in favorites:
        ids_by_type.setdefault(favorite["item_type"], []).append(favorite["item_id"])

    collection_map = {
        "pose": "yoga_poses",
        "crystal": "crystals",
        "mantra": "mantras",
        "mudra": "mudras",
        "breathwork": "breathwork_sessions",
        "somatic": "somatic_practices",
        "grounding": "grounding_exercises",
    }

    items_cache: dict[str, dict[str, Any]] = {}
    for favorite_type, ids in ids_by_type.items():
        collection_name = collection_map.get(favorite_type)
        if not collection_name:
            continue

        records = await db[collection_name].find({"id": {"$in": ids}}, {"_id": 0}).to_list(None)
        items_cache[favorite_type] = {record["id"]: record for record in records if record.get("id")}

    enriched = []
    for favorite in favorites:
        item_data = items_cache.get(favorite["item_type"], {}).get(favorite["item_id"])
        if item_data:
            enriched.append({**favorite, "item": item_data})

    return enriched


@router.get("/favorites/check/{item_type}/{item_id}")
async def check_favorite(item_type: str, item_id: str, user: User = Depends(get_current_user)) -> dict[str, bool]:
    """Check if an item is in user's favorites."""
    db = get_db()
    existing = await db.favorites.find_one({
        "user_id": user.user_id,
        "item_type": item_type,
        "item_id": item_id
    }, {"_id": 0})
    
    return {"is_favorite": existing is not None}


# ============ PRACTICE HISTORY ============

@router.post("/practice-history")
async def log_practice(data: PracticeLogCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Log a completed practice."""
    db = get_db()
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


@router.get("/practice-history")
async def get_practice_history(
    user: User = Depends(get_current_user),
    practice_type: Optional[str] = None,
    limit: int = 50
) -> list[dict[str, Any]]:
    """Get user's practice history."""
    db = get_db()
    query = {"user_id": user.user_id}
    if practice_type:
        query["practice_type"] = practice_type
    
    history = await db.practice_history.find(query, {"_id": 0}).sort("completed_at", -1).to_list(limit)
    return history


@router.get("/practice-history/stats")
async def get_practice_stats(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get user's practice statistics."""
    db = get_db()
    # Get all practice history for this user
    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    
    total_sessions = len(history)
    total_minutes = sum(h.get("duration_minutes", 0) for h in history)
    
    # Count by type
    by_type: dict[str, dict[str, int]] = {}
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


# ============ RITUALS ============

@router.post("/rituals")
async def create_ritual(data: RitualCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a custom daily ritual."""
    db = get_db()
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


@router.get("/rituals")
async def get_rituals(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's custom rituals."""
    db = get_db()
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return rituals


@router.get("/rituals/{ritual_id}")
async def get_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get a specific ritual."""
    db = get_db()
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return ritual


@router.put("/rituals/{ritual_id}")
async def update_ritual(ritual_id: str, data: RitualUpdate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Update a ritual."""
    db = get_db()
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.rituals.update_one(
        {"ritual_id": ritual_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    return await get_ritual(ritual_id, user)


@router.delete("/rituals/{ritual_id}")
async def delete_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a ritual."""
    db = get_db()
    result = await db.rituals.delete_one({"ritual_id": ritual_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ritual not found")
    return {"message": "Ritual deleted"}


# ============ RITUAL SHARING ============

@router.post("/rituals/{ritual_id}/share")
async def share_ritual(ritual_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Generate a shareable link for a ritual."""
    db = get_db()
    ritual = await db.rituals.find_one({"ritual_id": ritual_id, "user_id": user.user_id}, {"_id": 0})
    if not ritual:
        raise HTTPException(status_code=404, detail="Ritual not found")
    
    share_code = f"share_{uuid.uuid4().hex[:8]}"
    
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


@router.get("/rituals/shared/{share_code}")
async def get_shared_ritual(share_code: str) -> dict[str, Any]:
    """Get a shared ritual by share code (no auth required)."""
    db = get_db()
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    return shared


@router.post("/rituals/shared/{share_code}/copy")
async def copy_shared_ritual(share_code: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Copy a shared ritual to user's own rituals."""
    db = get_db()
    shared = await db.shared_rituals.find_one({"share_code": share_code}, {"_id": 0})
    if not shared:
        raise HTTPException(status_code=404, detail="Shared ritual not found")
    
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
    await db.shared_rituals.update_one(
        {"share_code": share_code},
        {"$inc": {"copy_count": 1}}
    )
    
    new_ritual.pop("_id", None)
    return new_ritual


# ============ REMINDERS ============

@router.get("/settings/reminders")
async def get_reminder_settings(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get user's reminder settings."""
    db = get_db()
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


# ============ ACCOUNT MANAGEMENT ============

@router.get("/account/export")
async def export_account_data(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Export a user's core account data for privacy/compliance needs."""
    db = get_db()

    reminders = await db.reminder_settings.find_one({"user_id": user.user_id}, {"_id": 0})
    favorites = await db.favorites.find({"user_id": user.user_id}, {"_id": 0}).to_list(500)
    practice_history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).sort("completed_at", -1).to_list(1000)
    rituals = await db.rituals.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    journal_entries = await db.journal.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    custom_mantras = await db.user_mantras.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(200)
    purchases = await db.user_purchases.find({"user_id": user.user_id}, {"_id": 0}).sort("purchased_at", -1).to_list(200)
    deletion_status = await db.account_deletion_requests.find_one({"user_id": user.user_id}, {"_id": 0}, sort=[("requested_at", -1)])

    return {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "profile": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
            "provider": getattr(user, "provider", "email"),
            "created_at": user.created_at,
        },
        "reminder_settings": reminders,
        "favorites": favorites,
        "practice_history": practice_history,
        "rituals": rituals,
        "journal_entries": journal_entries,
        "custom_mantras": custom_mantras,
        "purchases": purchases,
        "latest_account_deletion_request": deletion_status,
    }


@router.get("/account/deletion-status")
async def get_account_deletion_status(user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get the latest account deletion request status for the signed-in user."""
    db = get_db()
    latest = await db.account_deletion_requests.find_one({"user_id": user.user_id}, {"_id": 0}, sort=[("requested_at", -1)])
    return latest or {
        "status": "none",
        "message": "No account deletion request has been submitted.",
    }


@router.post("/account/delete-request")
async def request_account_deletion(data: AccountDeletionRequest, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create or refresh an account deletion request for compliance flows."""
    db = get_db()
    now = datetime.now(timezone.utc).isoformat()
    request_record = {
        "request_id": f"delete_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "reason": data.reason,
        "feedback": data.feedback,
        "status": "requested",
        "requested_at": now,
        "updated_at": now,
    }
    await db.account_deletion_requests.insert_one(request_record.copy())
    return {
        "success": True,
        "status": "requested",
        "requested_at": now,
        "message": "Your deletion request has been received. We will review and process it from the admin dashboard.",
    }


@router.put("/settings/reminders")
async def update_reminder_settings(data: ReminderSettings, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Update user's reminder settings."""
    db = get_db()
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


# ============ JOURNAL ============

@router.post("/journal")
async def create_journal_entry(data: JournalEntryCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a new journal entry."""
    db = get_db()
    entry = {
        "entry_id": f"journal_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "title": data.title,
        "content": data.content,
        "mood": data.mood,
        "practices_completed": data.practices_completed or [],
        "tags": data.tags or [],
        "journal_type": data.journal_type or "personal",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Add type-specific fields
    if data.journal_type == "moon":
        entry["moon_phase"] = data.moon_phase
        entry["moon_intention"] = data.moon_intention
    elif data.journal_type == "dream":
        entry["dream_symbols"] = data.dream_symbols
    
    await db.journal.insert_one(entry)
    entry.pop("_id", None)
    return entry


@router.post("/voice-files")
async def upload_voice_file(
    file: UploadFile = File(...),
    duration_seconds: int = Form(0),
    category: str = Form("journal_voice_note"),
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Upload a user voice file to object storage and persist metadata."""
    db = get_db()
    content = await file.read()
    content_type = (file.content_type or "").lower()
    _validate_audio_upload(content_type, len(content))

    extension = _safe_audio_extension(file.filename or "voice-note", content_type)
    storage_path = build_storage_path(user.user_id, category, extension)

    try:
        result = put_object(storage_path, content, content_type)
    except Exception as exc:
        logger.exception("Voice file upload failed for user %s", user.user_id)
        raise HTTPException(status_code=500, detail="Voice upload failed") from exc

    file_id = f"voice_{uuid.uuid4().hex[:12]}"
    record = {
        "file_id": file_id,
        "user_id": user.user_id,
        "category": category,
        "storage_path": result.get("path") or storage_path,
        "original_filename": file.filename or f"voice-note.{extension}",
        "content_type": content_type,
        "size": _safe_int(result.get("size"), len(content)),
        "duration_seconds": max(0, _safe_int(duration_seconds, 0)),
        "is_deleted": False,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.user_voice_files.insert_one(record.copy())

    return {
        "file_id": file_id,
        "content_type": record["content_type"],
        "duration_seconds": record["duration_seconds"],
        "size": record["size"],
        "download_url": f"/api/voice-files/{file_id}/download",
    }


@router.get("/voice-files/{file_id}/download")
async def download_voice_file(file_id: str, user: User = Depends(get_current_user)) -> Response:
    """Stream voice file from object storage for the authenticated owner."""
    db = get_db()
    record = await db.user_voice_files.find_one(
        {
            "file_id": file_id,
            "user_id": user.user_id,
            "is_deleted": False,
        },
        {"_id": 0},
    )
    if not record:
        raise HTTPException(status_code=404, detail="Voice file not found")

    try:
        file_bytes, fallback_content_type = get_object(str(record.get("storage_path") or ""))
    except Exception as exc:
        logger.exception("Voice file download failed for user %s file %s", user.user_id, file_id)
        raise HTTPException(status_code=404, detail="Voice file unavailable") from exc

    return Response(content=file_bytes, media_type=record.get("content_type") or fallback_content_type)


@router.delete("/voice-files/{file_id}")
async def delete_voice_file(file_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Soft-delete voice file metadata record."""
    db = get_db()
    record = await db.user_voice_files.find_one(
        {
            "file_id": file_id,
            "user_id": user.user_id,
            "is_deleted": False,
        },
        {"_id": 0, "file_id": 1},
    )
    if not record:
        raise HTTPException(status_code=404, detail="Voice file not found")

    await _soft_delete_voice_file(db, user.user_id, file_id)
    return {"message": "Voice file removed"}


@router.post("/practice-journal")
async def create_practice_journal_entry(data: PracticeJournalEntryCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a cross-device practice journal entry stored in MongoDB."""
    db = get_db()

    if not data.practice_name.strip():
        raise HTTPException(status_code=400, detail="Practice name is required")

    voice_note_file_id = data.voice_note_file_id or None
    if voice_note_file_id:
        voice_record = await db.user_voice_files.find_one(
            {
                "file_id": voice_note_file_id,
                "user_id": user.user_id,
                "is_deleted": False,
            },
            {"_id": 0, "file_id": 1},
        )
        if not voice_record:
            raise HTTPException(status_code=400, detail="Invalid voice note reference")

    entry_id = data.entry_id or f"journal_{uuid.uuid4().hex[:12]}"
    now_iso = _now_iso()
    document = {
        "entry_id": entry_id,
        "user_id": user.user_id,
        "practice_name": data.practice_name.strip(),
        "practice_type": data.practice_type,
        "mood_before": data.mood_before,
        "mood_after": data.mood_after,
        "duration_minutes": data.duration_minutes,
        "body_sensations": data.body_sensations or "",
        "spiritual_downloads": data.spiritual_downloads or "",
        "intentions": data.intentions or "",
        "key_insights": data.key_insights or "",
        "reflection": data.reflection or "",
        "moon_phase": data.moon_phase or "",
        "moon_emoji": data.moon_emoji or "",
        "voice_note_file_id": voice_note_file_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.practice_journal_entries.insert_one(document.copy())

    file_map = await _build_voice_file_map_for_entries(db, user.user_id, [document])
    return _normalize_practice_journal_entry(document, file_map)


@router.get("/practice-journal")
async def list_practice_journal_entries(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get authenticated user's practice journal entries."""
    db = get_db()
    entries = await db.practice_journal_entries.find(
        {
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
        },
        {"_id": 0},
    ).sort("created_at", -1).to_list(length=1000)

    file_map = await _build_voice_file_map_for_entries(db, user.user_id, entries)
    return [_normalize_practice_journal_entry(entry, file_map) for entry in entries]


@router.get("/practice-journal/weekly-reflection")
async def get_practice_journal_weekly_reflection(
    days: int = 7,
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Generate weekly reflection and alchemy plan from practice journal entries."""
    db = get_db()
    normalized_days = max(3, min(_safe_int(days, 7), 14))
    cutoff_iso = (datetime.now(timezone.utc) - timedelta(days=normalized_days)).isoformat()

    entries = await db.practice_journal_entries.find(
        {
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
            "created_at": {"$gte": cutoff_iso},
        },
        {
            "_id": 0,
            "entry_id": 1,
            "practice_type": 1,
            "duration_minutes": 1,
            "mood_before": 1,
            "mood_after": 1,
            "body_sensations": 1,
            "spiritual_downloads": 1,
            "intentions": 1,
            "key_insights": 1,
            "reflection": 1,
            "created_at": 1,
        },
    ).sort("created_at", -1).to_list(length=600)

    payload = _build_weekly_reflection_payload(entries, normalized_days)
    payload["source"] = "mongo"
    payload["generated_at"] = _now_iso()
    return payload


@router.put("/practice-journal/{entry_id}")
async def update_practice_journal_entry(
    entry_id: str,
    data: PracticeJournalEntryUpdate,
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update an existing practice journal entry."""
    db = get_db()
    existing = await db.practice_journal_entries.find_one(
        {
            "entry_id": entry_id,
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
        },
        {"_id": 0},
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Practice journal entry not found")

    next_voice_file_id = data.voice_note_file_id or None
    if next_voice_file_id:
        voice_record = await db.user_voice_files.find_one(
            {
                "file_id": next_voice_file_id,
                "user_id": user.user_id,
                "is_deleted": False,
            },
            {"_id": 0, "file_id": 1},
        )
        if not voice_record:
            raise HTTPException(status_code=400, detail="Invalid voice note reference")

    previous_voice_file_id = existing.get("voice_note_file_id")
    update_doc = {
        "practice_name": data.practice_name.strip(),
        "practice_type": data.practice_type,
        "mood_before": data.mood_before,
        "mood_after": data.mood_after,
        "duration_minutes": data.duration_minutes,
        "body_sensations": data.body_sensations or "",
        "spiritual_downloads": data.spiritual_downloads or "",
        "intentions": data.intentions or "",
        "key_insights": data.key_insights or "",
        "reflection": data.reflection or "",
        "moon_phase": data.moon_phase or "",
        "moon_emoji": data.moon_emoji or "",
        "voice_note_file_id": next_voice_file_id,
        "updated_at": _now_iso(),
    }

    await db.practice_journal_entries.update_one(
        {"entry_id": entry_id, "user_id": user.user_id},
        {"$set": update_doc},
    )

    if previous_voice_file_id and previous_voice_file_id != next_voice_file_id:
        await _soft_delete_voice_file(db, user.user_id, previous_voice_file_id)

    merged = {**existing, **update_doc}
    file_map = await _build_voice_file_map_for_entries(db, user.user_id, [merged])
    return _normalize_practice_journal_entry(merged, file_map)


@router.delete("/practice-journal/{entry_id}")
async def delete_practice_journal_entry(entry_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Soft-delete a practice journal entry and linked voice note metadata."""
    db = get_db()
    existing = await db.practice_journal_entries.find_one(
        {
            "entry_id": entry_id,
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
        },
        {"_id": 0, "voice_note_file_id": 1},
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Practice journal entry not found")

    await db.practice_journal_entries.update_one(
        {"entry_id": entry_id, "user_id": user.user_id},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": _now_iso(),
            }
        },
    )

    if existing.get("voice_note_file_id"):
        await _soft_delete_voice_file(db, user.user_id, str(existing.get("voice_note_file_id")))

    return {"message": "Practice journal entry deleted"}


@router.post("/voice-files/from-data-url")
async def upload_voice_file_from_data_url(
    payload: dict[str, Any],
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Compatibility endpoint: accepts data URL and stores as object for migration flows."""
    data_url = str(payload.get("data_url") or "")
    duration_seconds = _safe_int(payload.get("duration_seconds"), 0)
    category = str(payload.get("category") or "journal_voice_note")

    if not data_url.startswith("data:") or ";base64," not in data_url:
        raise HTTPException(status_code=400, detail="Invalid voice note payload")

    header, encoded = data_url.split(",", 1)
    mime_type = header.split(";")[0].replace("data:", "")
    try:
        file_bytes = base64.b64decode(encoded)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 audio payload") from exc

    _validate_audio_upload(mime_type, len(file_bytes))
    extension = _safe_audio_extension("voice-note", mime_type)
    storage_path = build_storage_path(user.user_id, category, extension)
    try:
        result = put_object(storage_path, file_bytes, mime_type)
    except Exception as exc:
        logger.exception("Voice data-url upload failed for user %s", user.user_id)
        raise HTTPException(status_code=500, detail="Voice upload failed") from exc

    db = get_db()
    file_id = f"voice_{uuid.uuid4().hex[:12]}"
    record = {
        "file_id": file_id,
        "user_id": user.user_id,
        "category": category,
        "storage_path": result.get("path") or storage_path,
        "original_filename": f"voice-note.{extension}",
        "content_type": mime_type,
        "size": _safe_int(result.get("size"), len(file_bytes)),
        "duration_seconds": max(0, duration_seconds),
        "is_deleted": False,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.user_voice_files.insert_one(record.copy())

    return {
        "file_id": file_id,
        "content_type": record["content_type"],
        "duration_seconds": record["duration_seconds"],
        "size": record["size"],
        "download_url": f"/api/voice-files/{file_id}/download",
    }


@router.post("/voice-profiles")
async def create_voice_profile(
    data: VoiceProfileCreate,
    user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create optional custom voice profile metadata from uploaded sample."""
    db = get_db()
    sample = await db.user_voice_files.find_one(
        {
            "file_id": data.sample_file_id,
            "user_id": user.user_id,
            "is_deleted": False,
        },
        {"_id": 0},
    )
    if not sample:
        raise HTTPException(status_code=400, detail="Voice sample file not found")

    profile = {
        "profile_id": f"voice_profile_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": data.name.strip() or "My Voice",
        "description": data.description or "",
        "sample_file_id": data.sample_file_id,
        "status": "sample_uploaded",
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    await db.user_voice_profiles.insert_one(profile.copy())
    return profile


@router.get("/voice-profiles")
async def list_voice_profiles(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """List optional user custom voice profile metadata."""
    db = get_db()
    profiles = await db.user_voice_profiles.find(
        {
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
        },
        {"_id": 0},
    ).sort("created_at", -1).to_list(length=200)
    return profiles


@router.delete("/voice-profiles/{profile_id}")
async def delete_voice_profile(profile_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Soft-delete custom voice profile metadata."""
    db = get_db()
    result = await db.user_voice_profiles.update_one(
        {
            "profile_id": profile_id,
            "user_id": user.user_id,
            "is_deleted": {"$ne": True},
        },
        {
            "$set": {
                "is_deleted": True,
                "updated_at": _now_iso(),
            }
        },
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Voice profile not found")
    return {"message": "Voice profile deleted"}


@router.get("/journal")
async def get_journal_entries(
    user: User = Depends(get_current_user),
    limit: int = 50,
    mood: Optional[str] = None,
    journal_type: Optional[str] = None
) -> list[dict[str, Any]]:
    """Get user's journal entries."""
    db = get_db()
    query = {"user_id": user.user_id}
    if mood:
        query["mood"] = mood
    if journal_type:
        query["journal_type"] = journal_type
    
    entries = await db.journal.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return entries


@router.get("/journal/{entry_id}")
async def get_journal_entry(entry_id: str, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Get a specific journal entry."""
    db = get_db()
    entry = await db.journal.find_one({"entry_id": entry_id, "user_id": user.user_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry


@router.delete("/journal/{entry_id}")
async def delete_journal_entry(entry_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a journal entry."""
    db = get_db()
    result = await db.journal.delete_one({"entry_id": entry_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Entry deleted"}


# ============ ACHIEVEMENTS ============

ACHIEVEMENT_DEFINITIONS: list[dict[str, Any]] = [
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


def _calculate_practice_streak(history: list[dict[str, Any]], reference: datetime | None = None) -> int:
    if not history:
        return 0

    now = reference or datetime.now(timezone.utc)
    dates = sorted(
        set(
            str(entry.get("completed_at", ""))[:10]
            for entry in history
            if entry.get("completed_at")
        ),
        reverse=True,
    )
    if not dates:
        return 0

    streak = 0
    for offset, date_str in enumerate(dates):
        expected_today = (now - timedelta(days=offset)).strftime("%Y-%m-%d")
        expected_yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        if date_str == expected_today or (offset == 0 and date_str == expected_yesterday):
            streak += 1
            continue
        break
    return streak


def _build_achievement_stats(
    history: list[dict[str, Any]],
    oracle_readings_count: int,
) -> dict[str, Any]:
    by_type: dict[str, int] = {}
    elements_practiced: set[str] = set()

    for entry in history:
        practice_type = str(entry.get("practice_type") or "unknown")
        by_type[practice_type] = by_type.get(practice_type, 0) + 1
        element = entry.get("element")
        if isinstance(element, str) and element:
            elements_practiced.add(element)

    return {
        "total_sessions": len(history),
        "total_minutes": sum(int(entry.get("duration_minutes") or 0) for entry in history),
        "streak": _calculate_practice_streak(history),
        "oracle_readings": oracle_readings_count,
        "by_type": by_type,
        "elements_count": len(elements_practiced),
    }


def _resolve_achievement_progress(requirement: dict[str, Any], stats: dict[str, Any]) -> tuple[int, bool]:
    requirement_type = requirement.get("type")
    target = int(requirement.get("count") or 0)

    progress_map = _build_achievement_progress_map(stats)

    progress = progress_map.get(str(requirement_type), 0)
    return progress, progress >= target


def _build_achievement_progress_map(stats: dict[str, Any]) -> dict[str, int]:
    by_type = stats.get("by_type") or {}
    return {
        "sessions": int(stats.get("total_sessions") or 0),
        "streak": int(stats.get("streak") or 0),
        "minutes": int(stats.get("total_minutes") or 0),
        "oracle_readings": int(stats.get("oracle_readings") or 0),
        "breathwork": int(by_type.get("breathwork") or 0),
        "yoga": int(by_type.get("yoga") or 0),
        "elements": int(stats.get("elements_count") or 0),
    }


def _compose_achievements_payload(stats: dict[str, Any]) -> list[dict[str, Any]]:
    achievements: list[dict[str, Any]] = []
    for achievement_definition in ACHIEVEMENT_DEFINITIONS:
        requirement = achievement_definition.get("requirement") or {}
        progress, unlocked = _resolve_achievement_progress(requirement, stats)
        achievements.append(
            {
                **achievement_definition,
                "unlocked": unlocked,
                "progress": progress,
                "target": int(requirement.get("count") or 0),
            }
        )
    return achievements


@router.get("/achievements")
async def get_achievements(user: User = Depends(get_current_user)) -> list[dict[str, Any]]:
    """Get user's achievements with unlock status."""
    db = get_db()

    history = await db.practice_history.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)
    oracle_readings = await db.oracle_readings.find({"user_id": user.user_id}, {"_id": 0}).to_list(1000)

    stats = _build_achievement_stats(history, len(oracle_readings))
    return _compose_achievements_payload(stats)



# ============ USER MANTRAS ============

@router.post("/mantras/custom")
async def create_user_mantra(data: UserMantraCreate, user: User = Depends(get_current_user)) -> dict[str, Any]:
    """Create a custom mantra."""
    db = get_db()
    mantra = {
        "mantra_id": f"mantra_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "text": data.text,
        "category": data.category or "personal",
        "element": data.element,
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_mantras.insert_one(mantra)
    mantra.pop("_id", None)
    return mantra


@router.get("/mantras/custom")
async def get_user_mantras(
    user: User = Depends(get_current_user),
    category: Optional[str] = None
) -> list[dict[str, Any]]:
    """Get user's custom mantras."""
    db = get_db()
    query = {"user_id": user.user_id}
    if category:
        query["category"] = category
    
    mantras = await db.user_mantras.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return mantras


@router.put("/mantras/custom/{mantra_id}")
async def update_user_mantra(
    mantra_id: str, 
    data: UserMantraUpdate, 
    user: User = Depends(get_current_user)
) -> dict[str, Any]:
    """Update a custom mantra."""
    db = get_db()
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.user_mantras.update_one(
        {"mantra_id": mantra_id, "user_id": user.user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    
    mantra = await db.user_mantras.find_one(
        {"mantra_id": mantra_id, "user_id": user.user_id}, 
        {"_id": 0}
    )
    return mantra


@router.delete("/mantras/custom/{mantra_id}")
async def delete_user_mantra(mantra_id: str, user: User = Depends(get_current_user)) -> dict[str, str]:
    """Delete a custom mantra."""
    db = get_db()
    result = await db.user_mantras.delete_one({"mantra_id": mantra_id, "user_id": user.user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mantra not found")
    
    return {"message": "Mantra deleted successfully"}
