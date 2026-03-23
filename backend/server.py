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


# ============ DATABASE SEEDING ============

@app.on_event("startup")
async def startup_seed_database():
    """Seed database with content if collections are empty. Always refreshes light_codes."""
    try:
        from data.divination_content import LIGHT_CODES
        from data.all_content import MEDITATIONS

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

        # Only seed everything else if yoga_poses is empty
        yoga_count = await db.yoga_poses.count_documents({})
        if yoga_count == 0:
            logger.info("Database empty - seeding content...")
            await seed_all_content()
            logger.info("Database seeding complete!")
        else:
            logger.info(f"Database already has {yoga_count} yoga poses - skipping full seed")
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}")


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
        EARTH_ALTARS, CREATIVE_PROCESSES, HEART_PRACTICES,
        SHAMANIC_PRACTICES, ENHANCED_ACHIEVEMENTS, ELEMENTAL_PRACTICES
    )
    from data.divination_content import (
        ELDER_FUTHARK_RUNES, I_CHING_HEXAGRAMS, LIGHT_CODES
    )

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
        ("creative_processes", CREATIVE_PROCESSES),
        ("heart_practices", HEART_PRACTICES),
        ("shamanic_practices", SHAMANIC_PRACTICES),
        ("achievements", ENHANCED_ACHIEVEMENTS),
        ("elemental_practices", ELEMENTAL_PRACTICES),
        ("runes", ELDER_FUTHARK_RUNES),
        ("i_ching", I_CHING_HEXAGRAMS),
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
