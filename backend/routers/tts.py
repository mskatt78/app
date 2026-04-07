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
    cache_key = hashlib.sha256(f"{text}:{request.voice}:{request.speed}".encode()).hexdigest()
    
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
    cache_key = hashlib.sha256(f"{request.text}:{request.voice}:{request.speed}:base64".encode()).hexdigest()
    
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

@router.get("/meditation/{meditation_id}/parts")
async def get_meditation_parts_info(meditation_id: str):
    """Return the number of audio parts available for a meditation."""
    return {"meditation_id": meditation_id, "total_parts": 4}


# Meditation-specific endpoint with prepared guidance
@router.post("/meditation/{meditation_id}")
async def generate_meditation_audio(meditation_id: str, voice: str = "nova", part: int = 1):
    """Generate guided meditation audio in 4 parts to stay within proxy timeout.
    Part 1: Welcome + Breathing (~2-3 min)
    Part 2: Body Scan (~2-3 min)
    Part 3: Visualization + Deepening (~3 min)
    Part 4: Affirmations + Return + Closing (~2-3 min)
    """
    from .dependencies import get_db
    
    db = get_db()
    meditation = await db.meditations.find_one({"id": meditation_id}, {"_id": 0})
    
    if not meditation:
        raise HTTPException(status_code=404, detail="Meditation not found")
    
    name = meditation.get('name', 'this meditation')
    description = meditation.get('description', '')
    visualization = meditation.get('visualization', '')
    element = meditation.get('element', 'Spirit')
    
    vis_text = visualization[:400] if visualization else f"Imagine yourself surrounded by a gentle {element.lower()} energy. This energy is warm, ancient, and deeply healing. It wraps around you like a cocoon of light."
    
    scripts = {
        1: f"""Welcome to {name}. {description}.

Find a comfortable position. You may sit with your spine tall, or lie down on your back. Allow your body to settle completely. There is nowhere else you need to be.

Gently close your eyes. Acknowledge yourself for choosing this time for inner peace.

Begin by noticing your breath. Don't change it. Just observe. The cool air entering your nostrils. The warm air leaving.

Now, three deep cleansing breaths together.

Breathe in slowly... two... three... four... Hold gently... two... three... Exhale slowly... two... three... four... five... six...

Again. Breathe in deeply... filling your belly... your ribs... your chest... Hold... And release... letting go of tension... worry... stress...

One more time. A deep nourishing breath in... Hold... And let it all go... sinking deeper into relaxation...

Let your breath return to its natural rhythm. Nothing to control. Nothing to force. Easy, natural breathing.

Allow yourself to deepen into this space.""".strip(),

        2: """We now move through your body, releasing any remaining tension.

Bring attention to the top of your head. Feel any tightness... and let it dissolve. Your scalp softening... relaxing...

Move down to your forehead. Let the tiny muscles smooth out. Your forehead is calm... peaceful... relaxed.

Your eyes. Even behind closed lids, they may be working. Let them rest. Still and soft.

Your jaw. Where so many hold tension. Let it drop slightly. Unclench your teeth. Feel the relief.

Your neck and throat. Imagine warmth flowing through, loosening every muscle.

Your shoulders. Let them drop away from your ears. The weight of the world sliding off. They are free now.

Relaxation flows down your arms... through elbows... wrists... into hands and fingers. Heavy, warm, completely relaxed.

Your chest and heart space. Each breath, your chest rises and falls easily. Allow your heart to soften and open.

Your belly is soft. Let it rise and fall naturally.

Lower back releasing tension. Hips, pelvis, settling and softening.

Down your legs. Thighs grow heavy. Knees. Calves. Ankles. Feet. Each toe relaxing completely.

Your entire body is in deep relaxation. Heavy. Warm. Peaceful. Still.

Rest here. Feel the peace in your body. Allow yourself to deepen into this stillness.""".strip(),

        3: f"""Now, we journey deeper inward.

{vis_text}

Stay with this experience. Be fully present in this sacred space. Notice any colors that appear. Any sensations. Any emotions. Everything is welcome here. No right or wrong. Simply be with what is.

Breathe into this experience. Each inhale, draw in peace and healing. Each exhale, release what no longer serves you.

Allow yourself to go deeper.

Rest in the stillness. The space between thoughts. The silence beneath all sound. The peace always within you.

You don't need to do anything. Don't need to be anyone. Just rest in pure being.

Feel the {element.lower()} energy surrounding you. Supporting you. Healing you. This peace is your true nature. It never leaves you. Return to it anytime, by closing your eyes and breathing.

Allow yourself to deepen even further into this experience.""".strip(),

        4: f"""Take a moment to feel gratitude. Gratitude for this body that carries you through life. For this breath that sustains you. For this moment of peace.

Let these words sink into your being.

I am at peace. I am whole. I am exactly where I need to be.

I release all worry about the past. I release all anxiety about the future. I am fully present in this moment.

I am worthy of love. I am worthy of joy. I am worthy of all the blessings life has to offer.

Rest here with these truths.

Now, slowly begin your return. There is no rush. Take all the time you need.

Deepen your breath once more. Breathing in fresh energy and vitality. Breathing out, knowing you can return to this peace anytime.

Bring gentle movement back. Wiggle your fingers and toes. Small movements reconnecting you with your physical form.

Roll your wrists gently. Your ankles. Stretch your arms overhead if that feels good.

Take a deep breath. Feel energy returning to your body. You are refreshed. Renewed. At peace.

When ready, slowly open your eyes. Keep your gaze soft. Honor the journey you've taken.

Thank you for practicing {name} today. May the peace stay with you throughout your day.

Namaste. The light in me honors the light in you.""".strip(),
    }
    
    if part not in scripts:
        raise HTTPException(status_code=400, detail="Invalid part number. Use 1-4.")
    
    script = scripts[part]
    logger.info(f"Generating meditation {meditation_id} part {part}: {len(script)} chars")
    
    request = TTSRequest(text=script, voice=voice, speed=0.7)
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
