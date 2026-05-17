"""Audio narration routes for generating guided meditation audio."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
import os
import hashlib
import logging
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/audio", tags=["audio"])
logger = logging.getLogger(__name__)

# In-memory cache for audio (in production, use Redis or file storage)
audio_cache: dict[str, str] = {}


class NarrationRequest(BaseModel):
    text: str
    voice: str = "nova"  # Default to calm, soothing voice
    speed: float = 0.85  # Slightly slower for meditation
    practice_id: Optional[str] = None


class NarrationResponse(BaseModel):
    audio_base64: str
    format: str = "mp3"
    voice: str
    cached: bool = False


def _resolve_audio_api_key() -> str:
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Audio narration service not configured")
    return api_key


def _validate_narration_length(text: str) -> None:
    if len(text) > 4096:
        raise HTTPException(status_code=400, detail="Text too long. Maximum 4096 characters.")


def _build_narration_cache_key(request: NarrationRequest) -> str:
    return hashlib.sha256(f"{request.text}{request.voice}{request.speed}".encode()).hexdigest()


async def _generate_narration_audio(api_key: str, request: NarrationRequest) -> str:
    from emergentintegrations.llm.openai import OpenAITextToSpeech

    tts = OpenAITextToSpeech(api_key=api_key)
    return await tts.generate_speech_base64(
        text=request.text,
        model="tts-1-hd",
        voice=request.voice,
        speed=request.speed,
        response_format="mp3",
    )


@router.post("/generate-narration")
async def generate_narration(request: NarrationRequest) -> NarrationResponse:
    """
    Generate audio narration for guided meditations using OpenAI TTS.
    Returns base64 encoded audio for direct playback in browser.
    """
    try:
        api_key = _resolve_audio_api_key()
        _validate_narration_length(request.text)
        cache_key = _build_narration_cache_key(request)
        
        # Check cache first
        if cache_key in audio_cache:
            logger.info(f"Audio cache hit for key {cache_key[:8]}...")
            return NarrationResponse(
                audio_base64=audio_cache[cache_key],
                voice=request.voice,
                cached=True
            )
        
        audio_base64 = await _generate_narration_audio(api_key, request)
        
        # Cache the result
        audio_cache[cache_key] = audio_base64
        logger.info(f"Generated and cached narration ({len(request.text)} chars, voice={request.voice})")
        
        return NarrationResponse(
            audio_base64=audio_base64,
            voice=request.voice,
            cached=False
        )
        
    except ImportError:
        logger.error("emergentintegrations not installed")
        raise HTTPException(status_code=500, detail="Audio service unavailable")
    except Exception as e:
        logger.error(f"Audio generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")


@router.get("/voices")
async def get_available_voices() -> dict[str, Any]:
    """Get list of available voices for narration."""
    return {
        "voices": [
            {"id": "nova", "name": "Nova", "description": "Calm, soothing - ideal for meditation", "recommended": True},
            {"id": "shimmer", "name": "Shimmer", "description": "Bright, gentle - good for affirmations"},
            {"id": "echo", "name": "Echo", "description": "Smooth, tranquil - great for sleep meditations"},
            {"id": "fable", "name": "Fable", "description": "Warm, storytelling - perfect for guided journeys"},
            {"id": "onyx", "name": "Onyx", "description": "Deep, grounding - ideal for masculine energy work"},
            {"id": "alloy", "name": "Alloy", "description": "Neutral, balanced - versatile for any practice"},
        ],
        "default": "nova"
    }


@router.post("/generate-step-narration")
async def generate_step_narration(practice_type: str, step_number: int, step_text: str, voice: str = "nova") -> dict[str, Any]:
    """
    Generate narration for a single practice step.
    Adds gentle pauses and meditation-appropriate pacing.
    """
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Audio narration service not configured")
        
        # Add meditation-appropriate formatting
        formatted_text = f"Step {step_number}. {step_text}"
        
        cache_key = hashlib.sha256(f"step_{practice_type}_{step_number}_{step_text}_{voice}".encode()).hexdigest()
        
        if cache_key in audio_cache:
            return {"audio_base64": audio_cache[cache_key], "cached": True}
        
        tts = OpenAITextToSpeech(api_key=api_key)
        audio_base64 = await tts.generate_speech_base64(
            text=formatted_text,
            model="tts-1-hd",
            voice=voice,
            speed=0.85,  # Slower for meditation
            response_format="mp3"
        )
        
        audio_cache[cache_key] = audio_base64
        
        return {"audio_base64": audio_base64, "cached": False, "step": step_number}
        
    except Exception as e:
        logger.error(f"Step narration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Pre-defined meditation scripts for common practices
MEDITATION_SCRIPTS = {
    "grounding": """
        Begin by finding a comfortable seated position. 
        Allow your eyes to gently close.
        Take a slow, deep breath in through your nose.
        And release it slowly through your mouth.
        Feel the weight of your body supported by the earth beneath you.
        With each breath, feel yourself becoming more grounded, more present.
        Imagine roots growing from the base of your spine, reaching deep into the earth.
        These roots anchor you to the stable, nurturing energy of Mother Earth.
        You are safe. You are supported. You are grounded.
    """,
    "heart_opening": """
        Bring your awareness to the center of your chest.
        This is your heart space, the seat of love and compassion.
        As you breathe in, imagine warm, rose-pink light filling your heart.
        As you breathe out, let this light expand outward.
        With each breath, your heart opens a little more.
        Feel the walls around your heart softening, dissolving.
        You are safe to love. You are safe to be loved.
        Your heart is infinite in its capacity for compassion.
    """,
    "third_eye_activation": """
        Bring your attention to the space between your eyebrows.
        This is your third eye, the seat of intuition and inner vision.
        Visualize a deep indigo light at this point.
        With each breath, this light grows brighter, more vibrant.
        Feel your inner vision awakening.
        Trust the images, feelings, and knowing that arise.
        You have access to wisdom beyond the physical senses.
        Your intuition is a gift. Trust it completely.
    """
}


@router.get("/meditation-scripts")
async def get_meditation_scripts() -> dict[str, Any]:
    """Get pre-defined meditation scripts."""
    return {
        "scripts": [
            {"id": "grounding", "name": "Grounding Meditation", "duration_estimate": "2-3 minutes"},
            {"id": "heart_opening", "name": "Heart Opening Meditation", "duration_estimate": "2-3 minutes"},
            {"id": "third_eye_activation", "name": "Third Eye Activation", "duration_estimate": "2-3 minutes"},
        ]
    }


@router.post("/generate-meditation/{script_id}")
async def generate_meditation_audio(script_id: str, voice: str = "nova") -> NarrationResponse:
    """Generate audio for a pre-defined meditation script."""
    if script_id not in MEDITATION_SCRIPTS:
        raise HTTPException(status_code=404, detail="Script not found")
    
    script_text = MEDITATION_SCRIPTS[script_id].strip()
    
    request = NarrationRequest(
        text=script_text,
        voice=voice,
        speed=0.8,  # Extra slow for meditation
        practice_id=script_id
    )
    
    return await generate_narration(request)
