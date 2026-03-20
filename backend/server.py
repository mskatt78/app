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
    """Seed database with content if collections are empty."""
    try:
        # Check if yoga_poses collection is empty
        yoga_count = await db.yoga_poses.count_documents({})
        if yoga_count == 0:
            logger.info("Database empty - seeding content...")
            await seed_all_content()
            logger.info("Database seeding complete!")
        else:
            logger.info(f"Database already has {yoga_count} yoga poses - skipping seed")
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
    ]

    for name, data in collections:
        if data:
            await db[name].delete_many({})  # Clear existing
            await db[name].insert_many(data)
            logger.info(f"  Seeded {name}: {len(data)} items")
