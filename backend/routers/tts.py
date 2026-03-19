"""Text-to-Speech routes for generating meditation audio."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from emergentintegrations.llm.openai import OpenAITextToSpeech
import os
import hashlib
import logging

router = APIRouter(prefix="/tts", tags=["tts"])
logger = logging.getLogger(__name__)

# Cache for generated audio to save API calls
audio_cache = {}

class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"  # Default to nova for calm, meditation voice
    speed: float = 0.85  # Slightly slower for meditation

@router.post("/generate")
async def generate_speech(request: TTSRequest):
    """Generate TTS audio from text."""
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS not configured")
    
    # Check text length (4096 char limit)
    if len(request.text) > 4096:
        # Truncate for now
        text = request.text[:4000] + "..."
    else:
        text = request.text
    
    # Create cache key
    cache_key = hashlib.md5(f"{text}:{request.voice}:{request.speed}".encode()).hexdigest()
    
    # Check cache
    if cache_key in audio_cache:
        logger.info(f"Returning cached audio for key: {cache_key[:8]}")
        return Response(
            content=audio_cache[cache_key],
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=meditation.mp3"}
        )
    
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        
        audio_bytes = await tts.generate_speech(
            text=text,
            model="tts-1",  # Standard model is fine for meditation
            voice=request.voice,
            speed=request.speed,
            response_format="mp3"
        )
        
        # Cache the result
        audio_cache[cache_key] = audio_bytes
        
        logger.info(f"Generated TTS audio: {len(audio_bytes)} bytes")
        
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=meditation.mp3"}
        )
        
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")

@router.post("/generate-base64")
async def generate_speech_base64(request: TTSRequest):
    """Generate TTS audio and return as base64 for embedding."""
    import base64
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS not configured")
    
    # Check text length (4096 char limit)
    if len(request.text) > 4096:
        text = request.text[:4000] + "..."
    else:
        text = request.text
    
    # Create cache key
    cache_key = hashlib.md5(f"{text}:{request.voice}:{request.speed}:base64".encode()).hexdigest()
    
    # Check cache
    if cache_key in audio_cache:
        return {"audio_base64": audio_cache[cache_key], "format": "mp3"}
    
    try:
        tts = OpenAITextToSpeech(api_key=api_key)
        
        audio_bytes = await tts.generate_speech(
            text=text,
            model="tts-1",
            voice=request.voice,
            speed=request.speed,
            response_format="mp3"
        )
        
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Cache the result
        audio_cache[cache_key] = audio_b64
        
        return {"audio_base64": audio_b64, "format": "mp3"}
        
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")

# Meditation-specific endpoint with prepared guidance
@router.post("/meditation/{meditation_id}")
async def generate_meditation_audio(meditation_id: str, voice: str = "nova"):
    """Generate guided meditation audio for a specific meditation."""
    from .dependencies import get_db
    
    db = get_db()
    meditation = await db.meditations.find_one({"id": meditation_id}, {"_id": 0})
    
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    
    # Build meditation script
    script_parts = [
        f"Welcome to {meditation['name']}.",
        "",
        f"{meditation.get('description', '')}",
        "",
        "Find a comfortable position and close your eyes.",
        "Take a deep breath in... and slowly release.",
        "",
        meditation.get('visualization', ''),
        "",
        "When you're ready, slowly begin to return.",
        "Wiggle your fingers and toes.",
        "Take a final deep breath.",
        "Open your eyes when you're ready.",
        "",
        "Namaste."
    ]
    
    script = " ".join(script_parts)
    
    # Use the base64 endpoint logic
    request = TTSRequest(text=script, voice=voice, speed=0.8)
    return await generate_speech_base64(request)
