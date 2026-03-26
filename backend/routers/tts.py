"""Text-to-Speech routes for generating meditation audio."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from emergentintegrations.llm.openai import OpenAITextToSpeech
import os
import hashlib
import logging
import base64
import io

router = APIRouter(prefix="/tts", tags=["tts"])
logger = logging.getLogger(__name__)

# Cache for generated audio to save API calls
audio_cache = {}

class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"  # Default to nova for calm, meditation voice
    speed: float = 0.85  # Slightly slower for meditation


async def generate_audio_chunk(text: str, voice: str, speed: float, api_key: str) -> bytes:
    """Generate a single chunk of TTS audio."""
    tts = OpenAITextToSpeech(api_key=api_key)
    return await tts.generate_speech(
        text=text,
        model="tts-1",
        voice=voice,
        speed=speed,
        response_format="mp3"
    )


async def generate_long_audio(text: str, voice: str, speed: float, api_key: str) -> bytes:
    """Generate audio for text longer than 4096 chars by chunking."""
    # If text is short enough, generate directly
    if len(text) <= 3800:
        return await generate_audio_chunk(text, voice, speed, api_key)
    
    # Split text into chunks at sentence boundaries
    chunks = []
    current_chunk = ""
    sentences = text.replace(". ", ".|").replace("? ", "?|").replace("! ", "!|").split("|")
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < 3800:
            current_chunk += sentence + " "
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    logger.info(f"Generating {len(chunks)} audio chunks for {len(text)} char script")
    
    # Generate audio for each chunk
    audio_parts = []
    for i, chunk in enumerate(chunks):
        logger.info(f"Generating chunk {i+1}/{len(chunks)} ({len(chunk)} chars)")
        audio = await generate_audio_chunk(chunk, voice, speed, api_key)
        audio_parts.append(audio)
    
    # Concatenate MP3 files (MP3s can be simply concatenated)
    combined = b''.join(audio_parts)
    return combined

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
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS not configured")
    
    # Create cache key from full text
    cache_key = hashlib.md5(f"{request.text}:{request.voice}:{request.speed}:base64".encode()).hexdigest()
    
    # Check cache
    if cache_key in audio_cache:
        return {"audio_base64": audio_cache[cache_key], "format": "mp3"}
    
    try:
        # Use long audio generator for any length text
        audio_bytes = await generate_long_audio(
            request.text, 
            request.voice, 
            request.speed, 
            api_key
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
    
    name = meditation.get('name', 'this meditation')
    description = meditation.get('description', '')
    visualization = meditation.get('visualization', '')
    element = meditation.get('element', 'Spirit')
    
    # Build a concise guided script (under 3800 chars for single TTS call = fast response)
    vis_text = visualization[:400] if visualization else ""
    
    script = f"""Welcome to {name}. {description}

Find a comfortable position and gently close your eyes. Allow your body to settle completely.

Take a deep breath in through your nose... hold gently... and exhale slowly through your mouth. 

Again. Breathe in deeply, filling your belly... hold... and release, letting go of any tension.

One more time. A deep, nourishing breath in... hold... and let it all go. Feel your body sink deeper into relaxation.

Let your breath return to its natural rhythm. There is nothing to control. Just easy, natural breathing.

Now bring your attention to the top of your head. Feel any tightness and let it dissolve. Move down through your face, jaw, neck, shoulders... releasing tension with each breath.

Feel warmth flowing down through your arms, your hands. Your chest softens. Your belly relaxes. Your hips, your legs, all the way down to your feet. Your whole body is at peace.

{vis_text}

Allow the {element.lower()} energy to support you as you rest in this space. There is nothing to do, nowhere to be. Simply breathe and be present.

The ambient sounds will continue to hold this space for you. When you are ready to return, take three deep breaths and gently open your eyes. Namaste.""".strip()
    
    # Trim to single chunk limit for fast response
    if len(script) > 3800:
        script = script[:3800]
    
    request = TTSRequest(text=script, voice=voice, speed=0.8)
    return await generate_speech_base64(request)


# Somatic Movement-specific endpoint with guided instructions
@router.post("/somatic/{practice_id}")
async def generate_somatic_audio(practice_id: str, voice: str = "nova"):
    """Generate guided audio for a specific somatic practice."""
    from .dependencies import get_db
    
    db = get_db()
    practice = await db.somatic_practices.find_one({"id": practice_id}, {"_id": 0})
    
    if not practice:
        raise HTTPException(status_code=404, detail="Somatic practice not found")
    
    duration = practice.get('duration_minutes', 10)
    name = practice.get('name', 'this practice')
    description = practice.get('description', '')
    element = practice.get('element', 'Earth')
    instructions = practice.get('instructions', [])
    benefits = practice.get('benefits', [])
    category = practice.get('category', 'Movement')
    
    # Build comprehensive guided somatic practice script
    instructions_text = " ".join([f"Step {i+1}: {inst}" for i, inst in enumerate(instructions)])
    benefits_text = ", ".join(benefits) if benefits else "releasing tension and finding inner peace"
    
    script_parts = [
        # ===== OPENING =====
        f"Welcome to {name}.",
        "",
        f"{description}",
        "",
        f"This practice takes approximately {duration} minutes.",
        f"The benefits include {benefits_text}.",
        "",
        "Find a comfortable space where you can move freely.",
        "Take a moment to arrive fully in your body.",
        "",
        
        # ===== BREATH PREPARATION =====
        "Let's begin by connecting with your breath.",
        "Take a deep breath in through your nose...",
        "And exhale slowly through your mouth...",
        "",
        "Again. Breathe in, filling your belly...",
        "And release, letting go of any tension...",
        "",
        "One more time. A deep, grounding breath...",
        "And let it all flow out...",
        "",
        
        # ===== BODY SCAN =====
        "Before we move, let's check in with your body.",
        "Notice where you feel any tension or holding.",
        "Simply observe without judgment.",
        "Your body has wisdom. Trust it.",
        "",
        
        # ===== INSTRUCTIONS =====
        "Now, let's begin the movement practice.",
        "",
        instructions_text,
        "",
        
        # ===== ENCOURAGEMENT =====
        "Remember, there is no perfect way to do this.",
        "Your body knows what it needs.",
        "Follow your own rhythm.",
        "Trust the wisdom within you.",
        "",
        f"Feel the {element.lower()} energy supporting your practice.",
        "Let it guide your movements.",
        "",
        
        # ===== CLOSING =====
        "As you continue, notice any shifts in your body.",
        "Any release. Any opening. Any new sensations.",
        "",
        "When you feel complete, slowly bring your movements to stillness.",
        "Take three deep breaths.",
        "",
        "Breathe in... and out...",
        "Breathe in... and out...",
        "Breathe in... and out...",
        "",
        "Place a hand on your heart.",
        "Thank your body for this practice.",
        "",
        f"You have completed {name}.",
        "May you carry this sense of embodiment throughout your day.",
        "",
        "Namaste."
    ]
    
    script = " ".join(script_parts)
    
    # Use moderate speed for movement guidance (0.85 = slightly slower)
    request = TTSRequest(text=script, voice=voice, speed=0.85)
    return await generate_speech_base64(request)
