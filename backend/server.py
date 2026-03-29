"""Shamanic Elements Temple Of The Soul - Main FastAPI Application.

This is the main entry point for the application. It sets up the FastAPI app,
configures CORS, connects to MongoDB, and includes all modular routers.
"""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import router dependencies module
from routers import dependencies as router_deps

# Import all routers
from routers.auth import router as auth_router
from routers.payments import router as payments_router
from routers.birth_chart import router as birth_chart_router
from routers.content import router as content_router
from routers.oracle import router as oracle_router
from routers.numerology import router as numerology_router
from routers.user import router as user_router
from routers.admin import router as admin_router
from routers.gifts import router as gifts_router
from routers.tts import router as tts_router
from routers.reviews import router as reviews_router

ROOT_DIR = Path(__file__).parent
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for routers
router_deps.set_db(db)

# Create the main app
app = FastAPI(
    title="Shamanic Elements Temple Of The Soul",
    description="A comprehensive shamanic wellness application with yoga, breathwork, crystals, oracle readings, and more.",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Include all modular routers
api_router.include_router(auth_router)
api_router.include_router(payments_router)
api_router.include_router(birth_chart_router)
api_router.include_router(content_router)
api_router.include_router(oracle_router)
api_router.include_router(numerology_router)
api_router.include_router(user_router)
api_router.include_router(admin_router)
api_router.include_router(gifts_router)
api_router.include_router(tts_router)
api_router.include_router(reviews_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API router
app.include_router(api_router)

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "Shamanic Elements Temple Of The Soul",
        "version": "2.0.0"
    }


@app.get("/health")
async def root_health_check():
    """Root health check endpoint for deployment verification."""
    return {"status": "healthy"}


# ============ DATABASE SEEDING ============

async def do_database_seeding():
    """Actual database seeding logic - runs in background with full error handling."""
    import os
    
    # Skip heavy seeding in production to prevent startup crashes
    # Data should already be in the database from previous deployments
    is_production = "emergent.host" in os.environ.get("REACT_APP_BACKEND_URL", "") or \
                    "atlas" in os.environ.get("MONGO_URL", "").lower()
    
    if is_production:
        logger.info("Production environment detected - using lightweight seeding")
        try:
            # Just check if database has content, don't do heavy seeding
            crystals_count = await db.crystals.count_documents({})
            yoga_count = await db.yoga_poses.count_documents({})
            logger.info(f"Database status: {crystals_count} crystals, {yoga_count} yoga poses")
            
            if crystals_count == 0 or yoga_count == 0:
                logger.info("Database empty - running minimal seed...")
                await seed_all_content()
        except Exception as e:
            logger.error(f"Error checking database: {e}")
        return
    
    # Full seeding for preview/development
    try:
        from data.divination_content import LIGHT_CODES
        from data.all_content import MEDITATIONS
        from data.archangel_oracle import ARCHANGEL_ORACLE
        from data.crystals_deep import CRYSTALS_DEEP

        # Always reseed archangel_oracle so new angels are applied
        logger.info("Refreshing archangel_oracle collection...")
        await db.archangel_oracle.delete_many({})
        await db.archangel_oracle.insert_many(ARCHANGEL_ORACLE)
        logger.info(f"archangel_oracle refreshed — {len(ARCHANGEL_ORACLE)} archangels.")

        # Always reseed crystals_deep so content updates are applied
        logger.info("Refreshing crystals_deep collection...")
        await db.crystals_deep.delete_many({})
        await db.crystals_deep.insert_many(CRYSTALS_DEEP)
        logger.info(f"crystals_deep refreshed — {len(CRYSTALS_DEEP)} deep crystals.")

        # Always reseed light_codes so content updates in divination_content.py are applied
        logger.info("Refreshing light_codes collection with latest data...")
        await db.light_codes.delete_many({})
        await db.light_codes.insert_one(LIGHT_CODES)
        logger.info("light_codes refreshed.")

        # Always reseed meditations so image_url updates are applied
        logger.info("Refreshing meditations collection...")
        await db.meditations.delete_many({})
        await db.meditations.insert_many(MEDITATIONS)
        logger.info("meditations refreshed.")

        # Always reseed sacred_guardians so new content is always applied
        from data.guardians_content import SACRED_GUARDIANS
        logger.info("Refreshing sacred_guardians collection...")
        await db.sacred_guardians.delete_many({})
        await db.sacred_guardians.insert_many(SACRED_GUARDIANS)
        logger.info("sacred_guardians refreshed.")

        # Always reseed ancient_wisdom (combine all four files)
        from data.ancient_wisdom_content import ANCIENT_WISDOM
        from data.ancient_wisdom_extended import ANCIENT_WISDOM_EXTENDED
        from data.ancient_wisdom_final import ANCIENT_WISDOM_FINAL
        from data.ancient_wisdom_avalon import ANCIENT_WISDOM_AVALON
        all_ancient_wisdom = ANCIENT_WISDOM + ANCIENT_WISDOM_EXTENDED + ANCIENT_WISDOM_FINAL + ANCIENT_WISDOM_AVALON
        logger.info("Refreshing ancient_wisdom collection...")
        await db.ancient_wisdom.delete_many({})
        await db.ancient_wisdom.insert_many(all_ancient_wisdom)
        logger.info(f"ancient_wisdom refreshed — {len(all_ancient_wisdom)} entries.")

        # Always reseed sound_frequencies
        from data.sound_frequencies import SOUND_FREQUENCIES
        logger.info("Refreshing sound_frequencies collection...")
        await db.sound_frequencies.delete_many({})
        await db.sound_frequencies.insert_many(SOUND_FREQUENCIES)
        logger.info(f"sound_frequencies refreshed — {len(SOUND_FREQUENCIES)} entries.")

        # Always reseed tarot_cards
        from data.tarot_cards import TAROT_MAJOR_ARCANA
        logger.info("Refreshing tarot_cards collection...")
        await db.tarot_cards.delete_many({})
        await db.tarot_cards.insert_many(TAROT_MAJOR_ARCANA)
        logger.info(f"tarot_cards refreshed — {len(TAROT_MAJOR_ARCANA)} entries.")

        # Always reseed breathwork_sessions (to get updated images)
        from data.all_content import BREATHWORK_SESSIONS
        logger.info("Refreshing breathwork_sessions collection...")
        await db.breathwork_sessions.delete_many({})
        await db.breathwork_sessions.insert_many(BREATHWORK_SESSIONS)
        logger.info(f"breathwork_sessions refreshed — {len(BREATHWORK_SESSIONS)} entries.")

        # Always reseed runes (to get updated AI images)
        from data.divination_content import ELDER_FUTHARK_RUNES, LIGHT_CODES
        logger.info("Refreshing runes and light_codes collections...")
        await db.runes.delete_many({})
        await db.runes.insert_many(ELDER_FUTHARK_RUNES)
        logger.info(f"runes refreshed — {len(ELDER_FUTHARK_RUNES)} entries.")
        
        await db.light_codes.delete_many({})
        await db.light_codes.insert_one(LIGHT_CODES)
        logger.info("light_codes refreshed.")

        # Always reseed somatic_practices (to get updated images)
        from data.somatic_practices import SOMATIC_PRACTICES
        logger.info("Refreshing somatic_practices collection...")
        await db.somatic_practices.delete_many({})
        await db.somatic_practices.insert_many(SOMATIC_PRACTICES)
        logger.info(f"somatic_practices refreshed — {len(SOMATIC_PRACTICES)} entries.")

        # Always reseed grounding and mindfulness (images added)
        from data.all_content import GROUNDING_EXERCISES, MINDFULNESS_PRACTICES
        logger.info("Refreshing grounding_exercises collection...")
        await db.grounding_exercises.delete_many({})
        await db.grounding_exercises.insert_many(GROUNDING_EXERCISES)
        logger.info(f"grounding_exercises refreshed — {len(GROUNDING_EXERCISES)} entries.")
        logger.info("Refreshing mindfulness_practices collection...")
        await db.mindfulness_practices.delete_many({})
        await db.mindfulness_practices.insert_many(MINDFULNESS_PRACTICES)
        logger.info(f"mindfulness_practices refreshed — {len(MINDFULNESS_PRACTICES)} entries.")

        # Always reseed yoga_poses and mudras (critical content)
        from data.yoga_poses import YOGA_POSES
        from data.all_content import MUDRAS
        logger.info("Refreshing yoga_poses collection...")
        await db.yoga_poses.delete_many({})
        await db.yoga_poses.insert_many(YOGA_POSES)
        logger.info(f"yoga_poses refreshed — {len(YOGA_POSES)} entries.")
        
        logger.info("Refreshing mudras collection...")
        await db.mudras.delete_many({})
        await db.mudras.insert_many(MUDRAS)
        logger.info(f"mudras refreshed — {len(MUDRAS)} entries.")

        # Always reseed healing modalities (energy healing, chakras, movement, embodiment)
        from data.seed_healing_modalities import (
            ENERGY_HEALING_DATA, FREE_FORM_MOVEMENT_DATA, CHAKRA_CLEANSING_DATA
        )
        from data.seed_extended_modalities import EXTENDED_CHAKRAS, SOMATIC_YOGA_DATA
        from data.complete_embodiment_data import COMPLETE_FEMININE_EMBODIMENT, COMPLETE_MASCULINE_EMBODIMENT
        
        logger.info("Refreshing energy_healing collection...")
        await db.energy_healing.delete_many({})
        await db.energy_healing.insert_many(ENERGY_HEALING_DATA)
        logger.info(f"energy_healing refreshed — {len(ENERGY_HEALING_DATA)} entries.")
        
        logger.info("Refreshing free_form_movement collection...")
        await db.free_form_movement.delete_many({})
        await db.free_form_movement.insert_many(FREE_FORM_MOVEMENT_DATA)
        logger.info(f"free_form_movement refreshed — {len(FREE_FORM_MOVEMENT_DATA)} entries.")
        
        # Combine base 7 chakras + 6 extended chakras = 13 total
        logger.info("Refreshing chakra_cleansing collection (13 chakras)...")
        await db.chakra_cleansing.delete_many({})
        all_chakras = CHAKRA_CLEANSING_DATA + EXTENDED_CHAKRAS
        await db.chakra_cleansing.insert_many(all_chakras)
        logger.info(f"chakra_cleansing refreshed — {len(all_chakras)} entries (7 base + 6 extended).")
        
        logger.info("Refreshing somatic_yoga collection...")
        await db.somatic_yoga.delete_many({})
        await db.somatic_yoga.insert_many(SOMATIC_YOGA_DATA)
        logger.info(f"somatic_yoga refreshed — {len(SOMATIC_YOGA_DATA)} entries.")
        
        logger.info("Refreshing feminine_embodiment collection (13 practices)...")
        await db.feminine_embodiment.delete_many({})
        await db.feminine_embodiment.insert_many(COMPLETE_FEMININE_EMBODIMENT)
        logger.info(f"feminine_embodiment refreshed — {len(COMPLETE_FEMININE_EMBODIMENT)} entries.")
        
        logger.info("Refreshing masculine_embodiment collection (13 practices)...")
        await db.masculine_embodiment.delete_many({})
        await db.masculine_embodiment.insert_many(COMPLETE_MASCULINE_EMBODIMENT)
        logger.info(f"masculine_embodiment refreshed — {len(COMPLETE_MASCULINE_EMBODIMENT)} entries.")
        
        # Apply deeper teachings to chakras and embodiment practices
        logger.info("Applying deeper teachings to content...")
        try:
            from data.deepen_chakras import CHAKRA_DEEPER_TEACHINGS
            from data.deepen_feminine import FEMININE_DEEPER_TEACHINGS
            from data.deepen_masculine import MASCULINE_DEEPER_TEACHINGS
            
            for chakra_id, teachings in CHAKRA_DEEPER_TEACHINGS.items():
                await db.chakra_cleansing.update_one({"id": chakra_id}, {"$set": teachings})
            logger.info(f"Applied deep teachings to {len(CHAKRA_DEEPER_TEACHINGS)} chakras")
            
            for practice_id, teachings in FEMININE_DEEPER_TEACHINGS.items():
                await db.feminine_embodiment.update_one({"id": practice_id}, {"$set": teachings})
            logger.info(f"Applied deep teachings to {len(FEMININE_DEEPER_TEACHINGS)} feminine practices")
            
            for practice_id, teachings in MASCULINE_DEEPER_TEACHINGS.items():
                await db.masculine_embodiment.update_one({"id": practice_id}, {"$set": teachings})
            logger.info(f"Applied deep teachings to {len(MASCULINE_DEEPER_TEACHINGS)} masculine practices")
        except Exception as e:
            logger.warning(f"Could not apply deeper teachings: {e}")
        
        # Apply comprehensive deep teachings (why this heals, practice guides, extended teachings)
        logger.info("Applying comprehensive deep teachings...")
        try:
            from data.deep_teachings_complete import FEMININE_DEEP_TEACHINGS, MASCULINE_DEEP_TEACHINGS
            from data.deep_teachings_chakras_breath import CHAKRA_DEEP_TEACHINGS, BREATHWORK_DEEP_TEACHINGS
            
            for practice_id, teachings in FEMININE_DEEP_TEACHINGS.items():
                await db.feminine_embodiment.update_one({"id": practice_id}, {"$set": {
                    "why_this_heals": teachings.get("why_this_heals", ""),
                    "practice_guide": teachings.get("practice_guide", ""),
                    "extended_teachings": teachings.get("extended_teachings", ""),
                    "benefits": teachings.get("benefits", []),
                    "duration_minutes": teachings.get("duration_minutes", 20)
                }})
            logger.info(f"Applied comprehensive teachings to {len(FEMININE_DEEP_TEACHINGS)} feminine practices")
            
            for practice_id, teachings in MASCULINE_DEEP_TEACHINGS.items():
                await db.masculine_embodiment.update_one({"id": practice_id}, {"$set": {
                    "why_this_heals": teachings.get("why_this_heals", ""),
                    "practice_guide": teachings.get("practice_guide", ""),
                    "extended_teachings": teachings.get("extended_teachings", ""),
                    "benefits": teachings.get("benefits", []),
                    "duration_minutes": teachings.get("duration_minutes", 20)
                }})
            logger.info(f"Applied comprehensive teachings to {len(MASCULINE_DEEP_TEACHINGS)} masculine practices")
            
            for chakra_id, teachings in CHAKRA_DEEP_TEACHINGS.items():
                await db.chakra_cleansing.update_one({"id": chakra_id}, {"$set": {
                    "why_this_heals": teachings.get("why_this_heals", ""),
                    "deeper_teachings": teachings.get("deeper_teachings", ""),
                    "healing_practices": teachings.get("healing_practices", []),
                    "affirmations": teachings.get("affirmations", [])
                }})
            logger.info(f"Applied comprehensive teachings to {len(CHAKRA_DEEP_TEACHINGS)} chakras")
            
            for session_id, teachings in BREATHWORK_DEEP_TEACHINGS.items():
                await db.breathwork_sessions.update_one({"id": session_id}, {"$set": {
                    "why_this_heals": teachings.get("why_this_heals", ""),
                    "full_instructions": teachings.get("full_instructions", ""),
                    "benefits": teachings.get("benefits", []),
                    "best_time": teachings.get("best_time", "")
                }})
            logger.info(f"Applied comprehensive teachings to {len(BREATHWORK_DEEP_TEACHINGS)} breathwork sessions")
        except Exception as e:
            logger.warning(f"Could not apply comprehensive deep teachings: {e}")

        # Always reseed community posts so Sacred Circle content stays fresh
        from data.community_posts import COMMUNITY_POSTS
        logger.info("Refreshing community_posts collection...")
        await db.community_posts.delete_many({})
        await db.community_posts.insert_many(COMMUNITY_POSTS)
        logger.info(f"community_posts refreshed — {len(COMMUNITY_POSTS)} entries.")

        # Always reseed creative processes with deep content
        from data.creative_processes_deep import CREATIVE_PROCESSES_DEEP
        logger.info("Refreshing creative_processes collection with deep content...")
        await db.creative_processes.delete_many({})
        await db.creative_processes.insert_many(CREATIVE_PROCESSES_DEEP)
        logger.info(f"creative_processes refreshed — {len(CREATIVE_PROCESSES_DEEP)} entries.")

        # Always reseed video tutorials
        from data.video_content import VIDEO_TUTORIALS
        logger.info("Refreshing videos collection...")
        await db.videos.delete_many({})
        await db.videos.insert_many(VIDEO_TUTORIALS)
        logger.info(f"videos refreshed — {len(VIDEO_TUTORIALS)} entries.")

        # Apply chakra safety + daily embodiment to all 13 chakras
        from data.chakra_safety_deep import CHAKRA_SAFETY_EMBODIMENT
        logger.info("Applying chakra safety & embodiment ceremonies...")
        for chakra_id, safety_data in CHAKRA_SAFETY_EMBODIMENT.items():
            await db.chakra_cleansing.update_one(
                {"id": chakra_id},
                {"$set": safety_data}
            )
        logger.info(f"Chakra safety applied to {len(CHAKRA_SAFETY_EMBODIMENT)} chakras.")

        # Apply yoga spiritual purpose + energetic effects
        from data.yoga_spiritual_data import YOGA_SPIRITUAL_DATA
        logger.info("Applying yoga spiritual depth data...")
        updated = 0
        async for pose in db.yoga_poses.find({}, {"_id": 0, "id": 1, "name": 1}):
            key = pose.get("name", "").lower().strip()
            if key in YOGA_SPIRITUAL_DATA:
                await db.yoga_poses.update_one(
                    {"id": pose["id"]},
                    {"$set": YOGA_SPIRITUAL_DATA[key]}
                )
                updated += 1
        logger.info(f"Yoga spiritual depth applied to {updated} poses.")

        # Apply elemental temple safety precautions
        TEMPLE_SAFETY = {
            "earth": "Earth practices connect us with ancestral memory, grief stored in the body, and deep feminine wisdom. Work gently if you carry unresolved trauma around belonging, displacement, or loss of home. Allow yourself to receive support — do not only be the one who holds others. Grounding ceremonies are not appropriate if you are extremely dissociated from your body; in this case, seek somatic support first. Garden ceremonies: wash your hands before touching eyes, and be mindful of plants that may be toxic if ingested.",
            "water": "Water ceremonies work deeply with the emotional body and can surface stored grief, fear, and long-suppressed feelings. Do not work in natural bodies of water (rivers, oceans) alone, at night, or when emotionally overwhelmed. For bathing rituals: test water temperature carefully — very hot baths are contraindicated in pregnancy and for those with cardiovascular conditions. If you are in acute grief, work with a practitioner alongside water ceremonies rather than alone. Avoid extended water fasting without medical supervision.",
            "fire": "Fire is the most powerful and potentially dangerous of the elements to work with ceremonially. FIRE SAFETY: Always have water and a fire extinguisher nearby. Never leave a fire unattended. Keep flames away from flammable materials. Keep children and pets away from ceremonial fires. Extinguish completely before sleeping or leaving. For candle fire ceremonies: use fireproof holders, keep away from drafts and curtains. Emotionally: fire ceremony can bring up intense anger, passion, and grief. These are the fire element's medicine — honour them without acting impulsively on what they reveal.",
            "air": "Air practices (breathwork, movement, sound) are generally gentle and accessible. However: intense breathing practices (kapalabhati, holotropic breath) are contraindicated for those with high blood pressure, heart conditions, epilepsy, seizure history, or during pregnancy. Hyperventilation can cause light-headedness, tingling, or temporary tetany (muscle cramping) — these pass when breathing normalises. Always practice intense breathwork lying down. Do not drive or operate machinery for 30 minutes after breathwork. Air ceremonies outdoors: be aware of wind conditions, sun exposure, and temperature changes.",
            "spirit": "Spirit practices work with the transpersonal — dimensions of consciousness beyond the ordinary. Approach with respect and preparation. These practices are not appropriate during acute mental health crises, psychotic episodes, or severe dissociation. Spirit element work can dissolve the sense of personal boundaries — always re-establish grounding afterward (earth food, physical contact, walking barefoot). If you are newly beginning your spiritual path, build a foundation in the lower elements (earth, water, fire, air) before working primarily with spirit. Have spiritual community or guidance for support through major spirit-element openings."
        }
        for temple_id, safety in TEMPLE_SAFETY.items():
            await db.elemental_temples.update_one(
                {"id": temple_id},
                {"$set": {"safety_precautions": safety}}
            )
        logger.info(f"Elemental temple safety precautions applied to {len(TEMPLE_SAFETY)} temples.")

        # Always refresh sacred rites (courses) so content deepening takes effect
        from data.sacred_rites_deep import SACRED_RITES_DEEP
        logger.info("Refreshing sacred_rites courses...")
        for rite_id, deep_data in SACRED_RITES_DEEP.items():
            await db.courses.update_one({"id": rite_id}, {"$set": deep_data}, upsert=True)
        logger.info(f"sacred_rites refreshed — {len(SACRED_RITES_DEEP)} courses.")

        # Seed elemental temples if empty
        temples_count = await db.elemental_temples.count_documents({})
        if temples_count == 0:
            from data.elemental_temples_data import ELEMENTAL_TEMPLES
            await db.elemental_temples.insert_many(ELEMENTAL_TEMPLES)
            logger.info(f"  Seeded elemental_temples: {len(ELEMENTAL_TEMPLES)} elements")
        else:
            logger.info(f"  elemental_temples: {temples_count} entries (skipped)")

        # Seed water practices if empty
        wp_count = await db.water_practices.count_documents({})
        if wp_count == 0:
            from data.water_practices_data import WATER_PRACTICES
            await db.water_practices.insert_many(WATER_PRACTICES)
            logger.info(f"  Seeded water_practices: {len(WATER_PRACTICES)} practices")
        else:
            logger.info(f"  water_practices: {wp_count} entries (skipped)")

        # Only seed everything else if crystals is empty (to avoid duplicate seeding)
        crystals_count = await db.crystals.count_documents({})
        if crystals_count == 0:
            logger.info("Database empty - seeding remaining content...")
            await seed_all_content()
            logger.info("Database seeding complete!")
        else:
            logger.info(f"Database already has {crystals_count} crystals - skipping full seed")
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}")
        import traceback
        logger.error(traceback.format_exc())


@app.on_event("startup")
async def startup_seed_database():
    """Seed database with content on startup."""
    import asyncio
    # Run seeding in background to not block startup
    asyncio.create_task(do_database_seeding())
    logger.info("Database seeding started in background...")


async def seed_all_content():
    """Seed all content collections."""
    from data.yoga_poses import YOGA_POSES
    from data.all_content import (
        CRYSTALS, MANTRAS, MUDRAS, BREATHWORK_SESSIONS,
        THIRTEEN_MONTH_CALENDAR, ORACLE_CARDS,
        GROUNDING_EXERCISES, MINDFULNESS_PRACTICES, MEDITATIONS
    )
    from data.somatic_practices import SOMATIC_PRACTICES
    from data.shamanic_content import (
        EARTH_ALTARS, HEART_PRACTICES,
        SHAMANIC_PRACTICES, ENHANCED_ACHIEVEMENTS, ELEMENTAL_PRACTICES
    )
    from data.divination_content import (
        ELDER_FUTHARK_RUNES, I_CHING_HEXAGRAMS, LIGHT_CODES
    )
    from data.creative_processes_deep import CREATIVE_PROCESSES_DEEP
    from data.video_content import VIDEO_TUTORIALS

    collections = [
        ("yoga_poses", YOGA_POSES),
        ("crystals", CRYSTALS),
        ("mantras", MANTRAS),
        ("mudras", MUDRAS),
        ("breathwork_sessions", BREATHWORK_SESSIONS),
        ("astrology_months", THIRTEEN_MONTH_CALENDAR),
        ("oracle_cards", ORACLE_CARDS),
        ("somatic_practices", SOMATIC_PRACTICES),
        ("grounding_exercises", GROUNDING_EXERCISES),
        ("mindfulness_practices", MINDFULNESS_PRACTICES),
        ("meditations", MEDITATIONS),
        ("earth_altars", EARTH_ALTARS),
        ("creative_processes", CREATIVE_PROCESSES_DEEP),
        ("heart_practices", HEART_PRACTICES),
        ("shamanic_practices", SHAMANIC_PRACTICES),
        ("achievements", ENHANCED_ACHIEVEMENTS),
        ("elemental_practices", ELEMENTAL_PRACTICES),
        ("runes", ELDER_FUTHARK_RUNES),
        ("i_ching", I_CHING_HEXAGRAMS),
        ("videos", VIDEO_TUTORIALS),
    ]

    for name, data in collections:
        if data:
            await db[name].delete_many({})  # Clear existing
            await db[name].insert_many(data)
            logger.info(f"  Seeded {name}: {len(data)} items")
    
    # Seed light codes as a single document
    if LIGHT_CODES:
        await db.light_codes.delete_many({})
        await db.light_codes.insert_one(LIGHT_CODES)
        logger.info("  Seeded light_codes: 1 document")

    # Seed courses (sacred rites) — always refresh so content deepening takes effect
    await _seed_sacred_rites_courses()


async def _seed_sacred_rites_courses():
    """Seed or refresh the sacred rites in the courses collection."""
    from data.sacred_rites_deep import SACRED_RITES_DEEP

    # Upsert each sacred rite with deep content
    for rite_id, deep_data in SACRED_RITES_DEEP.items():
        await db.courses.update_one(
            {"id": rite_id},
            {"$set": deep_data},
            upsert=True
        )
    logger.info(f"  Refreshed sacred rites: {len(SACRED_RITES_DEEP)} courses")

