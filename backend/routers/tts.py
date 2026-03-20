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
    
    duration = meditation.get('duration_minutes', 10)
    name = meditation.get('name', 'this meditation')
    description = meditation.get('description', '')
    visualization = meditation.get('visualization', '')
    element = meditation.get('element', 'Spirit')
    
    # Build a longer, more immersive meditation script based on duration
    # Each section adds breathing pauses and guidance
    
    script_parts = [
        # Opening (30 seconds)
        f"Welcome to {name}.",
        f"{description}",
        "",
        "Find a comfortable position, either sitting or lying down.",
        "Allow your body to settle into this space.",
        "Close your eyes gently.",
        "",
        
        # Initial grounding (1 minute)
        "Take a moment to arrive fully in this present moment.",
        "Notice the weight of your body.",
        "Feel the surface supporting you.",
        "You are safe. You are held.",
        "",
        "Let's begin with three deep breaths together.",
        "Breathe in deeply through your nose...",
        "And slowly exhale through your mouth, releasing any tension.",
        "",
        "Breathe in again, filling your lungs completely...",
        "And exhale, letting go of any thoughts from your day.",
        "",
        "One more deep breath in...",
        "And exhale completely, arriving fully in this moment.",
        "",
        
        # Body relaxation (2 minutes)
        "Now, let your breath return to its natural rhythm.",
        "Begin to scan your body from the top of your head.",
        "Notice your forehead... let it soften.",
        "Your eyes... relaxed and heavy.",
        "Your jaw... unclenching, releasing.",
        "",
        "Feel your shoulders drop away from your ears.",
        "Your arms growing heavy and warm.",
        "Your hands soft and open.",
        "",
        "Notice your chest rising and falling with each breath.",
        "Your belly soft and relaxed.",
        "Your hips releasing into the surface beneath you.",
        "",
        "Your legs growing heavy.",
        "Your feet relaxed.",
        "Your whole body now at ease.",
        "",
        
        # Main visualization (3-5 minutes based on content)
        "Now, we begin our journey.",
        "",
        visualization,
        "",
        
        # Extended meditation space (2 minutes)
        "Stay here in this peaceful space.",
        "Allow yourself to simply be.",
        "There is nothing you need to do.",
        "Nothing you need to fix or change.",
        "Just breathe and be present.",
        "",
        "With each breath, you go deeper into relaxation.",
        "With each exhale, you release anything that no longer serves you.",
        "",
        "Feel the peace that exists within you.",
        "This peace is always available to you.",
        "You can return to this feeling anytime you choose.",
        "",
        
        # Affirmations based on element
        f"As you rest in this {element.lower()} energy...",
        "Know that you are exactly where you need to be.",
        "You are worthy of peace.",
        "You are worthy of love.",
        "You are worthy of joy.",
        "",
        
        # Gentle return (1 minute)
        "Now, it's time to slowly begin your return.",
        "There's no rush. Take your time.",
        "",
        "Begin to deepen your breath.",
        "Feel the air filling your lungs once more.",
        "",
        "Gently wiggle your fingers and toes.",
        "Feel the life force returning to your body.",
        "",
        "Roll your wrists and ankles in small circles.",
        "Stretch in any way that feels good.",
        "",
        "When you're ready, slowly open your eyes.",
        "Take a moment before moving.",
        "",
        
        # Closing (30 seconds)
        "Carry this peace with you into your day.",
        "Remember, you can return to this calm center anytime.",
        "",
        "Thank you for practicing with me today.",
        "Namaste.",
        "The light in me honors the light in you."
    ]
    
    script = " ".join(script_parts)
    
    # Use the base64 endpoint logic with slower speed for meditation
    request = TTSRequest(text=script, voice=voice, speed=0.75)
    return await generate_speech_base64(request)
