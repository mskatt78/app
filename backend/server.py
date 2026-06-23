"""Shamanic Elements Temple Of The Soul - Main FastAPI Application.

This is the main entry point for the application. It sets up the FastAPI app,
configures CORS, connects to MongoDB, and includes all modular routers.
"""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dataclasses import dataclass
import logging
from pathlib import Path
from datetime import datetime, timezone

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
from routers.audio import router as audio_router
from routers.reviews import router as reviews_router
from services.object_storage import ensure_storage_initialized

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
api_router.include_router(audio_router)
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

# GZip compression for all responses >= 500 bytes
app.add_middleware(GZipMiddleware, minimum_size=500)

# Include the API router
app.include_router(api_router)

# Serve uploaded files
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "Shamanic Elements Temple Of The Soul",
        "version": "2.0.0"
    }


@app.get("/health")
async def root_health_check() -> dict[str, str]:
    """Root health check endpoint for deployment verification."""
    return {"status": "healthy"}


# ============ DATABASE SEEDING ============

def _is_production_seed_mode() -> bool:
    backend_url = os.environ.get("REACT_APP_BACKEND_URL", "")
    mongo_url = os.environ.get("MONGO_URL", "")
    return "emergent.host" in backend_url or "atlas" in mongo_url.lower()


async def _seed_database_core_flow():
    """Database seeding core flow with full error handling."""
    if _is_production_seed_mode():
        await _run_production_seed_sanity_check()
        return

    await _seed_database_preview_flow()


async def _run_production_seed_sanity_check():
    logger.info("Production environment detected - using lightweight seeding")
    try:
        crystals_count = await db.crystals.count_documents({})
        yoga_count = await db.yoga_poses.count_documents({})
        logger.info(f"Database status: {crystals_count} crystals, {yoga_count} yoga poses")

        if crystals_count == 0 or yoga_count == 0:
            logger.info("Database empty - running minimal seed...")
            await seed_all_content()
    except Exception as e:
        logger.error(f"Error checking database: {e}")


async def _refresh_collection(name: str, items: list[dict], message: str) -> None:
    logger.info(f"Refreshing {name} collection...")
    await getattr(db, name).delete_many({})
    if items:
        await getattr(db, name).insert_many(items)
    logger.info(message)


async def _refresh_collection_single_doc(name: str, document: dict, message: str) -> None:
    logger.info(f"Refreshing {name} collection...")
    await getattr(db, name).delete_many({})
    if document:
        await getattr(db, name).insert_one(document)
    logger.info(message)


async def _apply_deep_teachings(collection_name: str, teachings_map: dict[str, dict], match_field: str = "id") -> int:
    updates = 0
    for item_id, payload in teachings_map.items():
        result = await getattr(db, collection_name).update_one({match_field: item_id}, {"$set": payload})
        if result.modified_count:
            updates += 1
    return updates


async def _seed_archangel_crystals_and_light_codes() -> None:
    from data.divination_content import LIGHT_CODES
    from data.crystals_deep import CRYSTALS_DEEP
    from data.archangel_oracle import ARCHANGEL_ORACLE
    from data.crystals_deep_teachings import CRYSTAL_DEEP_TEACHINGS

    await _refresh_collection("archangel_oracle", ARCHANGEL_ORACLE, f"archangel_oracle refreshed — {len(ARCHANGEL_ORACLE)} archangels.")
    await _refresh_collection("crystals_deep", CRYSTALS_DEEP, f"crystals_deep refreshed — {len(CRYSTALS_DEEP)} deep crystals.")
    updated_crystals = await _apply_deep_teachings("crystals_deep", CRYSTAL_DEEP_TEACHINGS)
    logger.info(f"Deep teachings applied to {updated_crystals} crystals.")
    await _refresh_collection_single_doc("light_codes", LIGHT_CODES, "light_codes refreshed.")


async def _seed_core_spiritual_content() -> None:
    from data.all_content import MEDITATIONS, BREATHWORK_SESSIONS, GROUNDING_EXERCISES, MINDFULNESS_PRACTICES, MUDRAS
    from data.guardians_content import SACRED_GUARDIANS
    from data.ancient_wisdom_content import ANCIENT_WISDOM
    from data.ancient_wisdom_extended import ANCIENT_WISDOM_EXTENDED
    from data.ancient_wisdom_final import ANCIENT_WISDOM_FINAL
    from data.ancient_wisdom_avalon import ANCIENT_WISDOM_AVALON
    from data.sound_frequencies import SOUND_FREQUENCIES
    from data.tarot_cards import TAROT_MAJOR_ARCANA
    from data.divination_content import ELDER_FUTHARK_RUNES, LIGHT_CODES
    from data.somatic_practices import SOMATIC_PRACTICES
    from data.yoga_poses import YOGA_POSES
    from data.sacred_ally_alchemy_content import SACRED_ALLY_ALCHEMY, ANGELIC_ALCHEMY
    from data.sacred_ally_alchemy_expansion import EXPANDED_SACRED_ALLY_ALCHEMY, EXPANDED_ANGELIC_ALCHEMY
    from data.sacred_ally_audio_journeys import SACRED_ALLY_AUDIO_JOURNEYS, SACRED_ALLY_PATHWAYS

    all_ancient_wisdom = ANCIENT_WISDOM + ANCIENT_WISDOM_EXTENDED + ANCIENT_WISDOM_FINAL + ANCIENT_WISDOM_AVALON

    await _refresh_collection("meditations", MEDITATIONS, "meditations refreshed.")
    await _refresh_collection("sacred_guardians", SACRED_GUARDIANS, "sacred_guardians refreshed.")
    await _refresh_collection("ancient_wisdom", all_ancient_wisdom, f"ancient_wisdom refreshed — {len(all_ancient_wisdom)} entries.")
    await _refresh_collection("sound_frequencies", SOUND_FREQUENCIES, f"sound_frequencies refreshed — {len(SOUND_FREQUENCIES)} entries.")
    await _refresh_collection("tarot_cards", TAROT_MAJOR_ARCANA, f"tarot_cards refreshed — {len(TAROT_MAJOR_ARCANA)} entries.")
    await _refresh_collection("breathwork_sessions", BREATHWORK_SESSIONS, f"breathwork_sessions refreshed — {len(BREATHWORK_SESSIONS)} entries.")
    await _refresh_collection("runes", ELDER_FUTHARK_RUNES, f"runes refreshed — {len(ELDER_FUTHARK_RUNES)} entries.")
    await _refresh_collection_single_doc("light_codes", LIGHT_CODES, "light_codes refreshed.")
    await _refresh_collection("somatic_practices", SOMATIC_PRACTICES, f"somatic_practices refreshed — {len(SOMATIC_PRACTICES)} entries.")
    await _refresh_collection("grounding_exercises", GROUNDING_EXERCISES, f"grounding_exercises refreshed — {len(GROUNDING_EXERCISES)} entries.")
    await _refresh_collection("mindfulness_practices", MINDFULNESS_PRACTICES, f"mindfulness_practices refreshed — {len(MINDFULNESS_PRACTICES)} entries.")
    await _refresh_collection("yoga_poses", YOGA_POSES, f"yoga_poses refreshed — {len(YOGA_POSES)} entries.")
    await _refresh_collection("mudras", MUDRAS, f"mudras refreshed — {len(MUDRAS)} entries.")
    ally_combined = SACRED_ALLY_ALCHEMY + EXPANDED_SACRED_ALLY_ALCHEMY
    angelic_combined = ANGELIC_ALCHEMY + EXPANDED_ANGELIC_ALCHEMY
    await _refresh_collection("sacred_ally_alchemy", ally_combined, f"sacred_ally_alchemy refreshed — {len(ally_combined)} entries.")
    await _refresh_collection("angelic_alchemy", angelic_combined, f"angelic_alchemy refreshed — {len(angelic_combined)} entries.")
    await _refresh_collection("sacred_ally_audio_journeys", SACRED_ALLY_AUDIO_JOURNEYS, f"sacred_ally_audio_journeys refreshed — {len(SACRED_ALLY_AUDIO_JOURNEYS)} entries.")
    await _refresh_collection("sacred_ally_pathways", SACRED_ALLY_PATHWAYS, f"sacred_ally_pathways refreshed — {len(SACRED_ALLY_PATHWAYS)} entries.")


async def _seed_healing_modalities_and_embodiment() -> None:
    from data.seed_healing_modalities import ENERGY_HEALING_DATA, FREE_FORM_MOVEMENT_DATA, CHAKRA_CLEANSING_DATA
    from data.seed_extended_modalities import EXTENDED_CHAKRAS, SOMATIC_YOGA_DATA
    from data.complete_embodiment_data import COMPLETE_FEMININE_EMBODIMENT, COMPLETE_MASCULINE_EMBODIMENT

    all_chakras = CHAKRA_CLEANSING_DATA + EXTENDED_CHAKRAS
    await _refresh_collection("energy_healing", ENERGY_HEALING_DATA, f"energy_healing refreshed — {len(ENERGY_HEALING_DATA)} entries.")
    await _refresh_collection("free_form_movement", FREE_FORM_MOVEMENT_DATA, f"free_form_movement refreshed — {len(FREE_FORM_MOVEMENT_DATA)} entries.")
    await _refresh_collection("chakra_cleansing", all_chakras, f"chakra_cleansing refreshed — {len(all_chakras)} entries (7 base + 6 extended).")
    await _refresh_collection("somatic_yoga", SOMATIC_YOGA_DATA, f"somatic_yoga refreshed — {len(SOMATIC_YOGA_DATA)} entries.")
    await _refresh_collection("feminine_embodiment", COMPLETE_FEMININE_EMBODIMENT, f"feminine_embodiment refreshed — {len(COMPLETE_FEMININE_EMBODIMENT)} entries.")
    await _refresh_collection("masculine_embodiment", COMPLETE_MASCULINE_EMBODIMENT, f"masculine_embodiment refreshed — {len(COMPLETE_MASCULINE_EMBODIMENT)} entries.")


async def _apply_first_layer_deep_teachings() -> None:
    logger.info("Applying deeper teachings to content...")
    try:
        from data.deepen_chakras import CHAKRA_DEEPER_TEACHINGS
        from data.deepen_feminine import FEMININE_DEEPER_TEACHINGS
        from data.deepen_masculine import MASCULINE_DEEPER_TEACHINGS

        updated_chakras = await _apply_deep_teachings("chakra_cleansing", CHAKRA_DEEPER_TEACHINGS)
        updated_feminine = await _apply_deep_teachings("feminine_embodiment", FEMININE_DEEPER_TEACHINGS)
        updated_masculine = await _apply_deep_teachings("masculine_embodiment", MASCULINE_DEEPER_TEACHINGS)
        logger.info(f"Applied deep teachings to {updated_chakras} chakras")
        logger.info(f"Applied deep teachings to {updated_feminine} feminine practices")
        logger.info(f"Applied deep teachings to {updated_masculine} masculine practices")
    except Exception as e:
        logger.warning(f"Could not apply deeper teachings: {e}")


def _extract_comprehensive_teaching_payload(teachings: dict, include_duration: bool = False) -> dict:
    payload = {
        "why_this_heals": teachings.get("why_this_heals", ""),
        "practice_guide": teachings.get("practice_guide", ""),
        "extended_teachings": teachings.get("extended_teachings", ""),
        "benefits": teachings.get("benefits", []),
    }
    if include_duration:
        payload["duration_minutes"] = teachings.get("duration_minutes", 20)
    return payload


async def _apply_comprehensive_deep_teachings() -> None:
    logger.info("Applying comprehensive deep teachings...")
    try:
        from data.deep_teachings_complete import FEMININE_DEEP_TEACHINGS, MASCULINE_DEEP_TEACHINGS
        from data.deep_teachings_chakras_breath import CHAKRA_DEEP_TEACHINGS, BREATHWORK_DEEP_TEACHINGS

        feminine_updates = {
            practice_id: _extract_comprehensive_teaching_payload(teachings, include_duration=True)
            for practice_id, teachings in FEMININE_DEEP_TEACHINGS.items()
        }
        masculine_updates = {
            practice_id: _extract_comprehensive_teaching_payload(teachings, include_duration=True)
            for practice_id, teachings in MASCULINE_DEEP_TEACHINGS.items()
        }
        chakra_updates = {
            chakra_id: {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "deeper_teachings": teachings.get("deeper_teachings", ""),
                "healing_practices": teachings.get("healing_practices", []),
                "affirmations": teachings.get("affirmations", []),
            }
            for chakra_id, teachings in CHAKRA_DEEP_TEACHINGS.items()
        }
        breath_updates = {
            session_id: {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "full_instructions": teachings.get("full_instructions", ""),
                "benefits": teachings.get("benefits", []),
                "best_time": teachings.get("best_time", ""),
            }
            for session_id, teachings in BREATHWORK_DEEP_TEACHINGS.items()
        }

        updated_feminine = await _apply_deep_teachings("feminine_embodiment", feminine_updates)
        updated_masculine = await _apply_deep_teachings("masculine_embodiment", masculine_updates)
        updated_chakras = await _apply_deep_teachings("chakra_cleansing", chakra_updates)
        updated_breathwork = await _apply_deep_teachings("breathwork_sessions", breath_updates)
        logger.info(f"Applied comprehensive teachings to {updated_feminine} feminine practices")
        logger.info(f"Applied comprehensive teachings to {updated_masculine} masculine practices")
        logger.info(f"Applied comprehensive teachings to {updated_chakras} chakras")
        logger.info(f"Applied comprehensive teachings to {updated_breathwork} breathwork sessions")
    except Exception as e:
        logger.warning(f"Could not apply comprehensive deep teachings: {e}")


async def _seed_community_creative_video_content() -> None:
    from data.community_posts import COMMUNITY_POSTS
    from data.creative_processes_deep import CREATIVE_PROCESSES_DEEP
    from data.video_content import VIDEO_TUTORIALS

    await _refresh_collection("community_posts", COMMUNITY_POSTS, f"community_posts refreshed — {len(COMMUNITY_POSTS)} entries.")
    await _refresh_collection("creative_processes", CREATIVE_PROCESSES_DEEP, f"creative_processes refreshed — {len(CREATIVE_PROCESSES_DEEP)} entries.")
    await _refresh_collection("videos", VIDEO_TUTORIALS, f"videos refreshed — {len(VIDEO_TUTORIALS)} entries.")


async def _apply_chakra_and_temple_safety() -> None:
    from data.chakra_safety_deep import CHAKRA_SAFETY_EMBODIMENT

    logger.info("Applying chakra safety & embodiment ceremonies...")
    await _apply_deep_teachings("chakra_cleansing", CHAKRA_SAFETY_EMBODIMENT)
    logger.info(f"Chakra safety applied to {len(CHAKRA_SAFETY_EMBODIMENT)} chakras.")

    temple_safety = {
        "earth": "Earth practices connect us with ancestral memory, grief stored in the body, and deep feminine wisdom. Work gently if you carry unresolved trauma around belonging, displacement, or loss of home. Allow yourself to receive support — do not only be the one who holds others. Grounding ceremonies are not appropriate if you are extremely dissociated from your body; in this case, seek somatic support first. Garden ceremonies: wash your hands before touching eyes, and be mindful of plants that may be toxic if ingested.",
        "water": "Water ceremonies work deeply with the emotional body and can surface stored grief, fear, and long-suppressed feelings. Do not work in natural bodies of water (rivers, oceans) alone, at night, or when emotionally overwhelmed. For bathing rituals: test water temperature carefully — very hot baths are contraindicated in pregnancy and for those with cardiovascular conditions. If you are in acute grief, work with a practitioner alongside water ceremonies rather than alone. Avoid extended water fasting without medical supervision.",
        "fire": "Fire is the most powerful and potentially dangerous of the elements to work with ceremonially. FIRE SAFETY: Always have water and a fire extinguisher nearby. Never leave a fire unattended. Keep flames away from flammable materials. Keep children and pets away from ceremonial fires. Extinguish completely before sleeping or leaving. For candle fire ceremonies: use fireproof holders, keep away from drafts and curtains. Emotionally: fire ceremony can bring up intense anger, passion, and grief. These are the fire element's medicine — honour them without acting impulsively on what they reveal.",
        "air": "Air practices (breathwork, movement, sound) are generally gentle and accessible. However: intense breathing practices (kapalabhati, holotropic breath) are contraindicated for those with high blood pressure, heart conditions, epilepsy, seizure history, or during pregnancy. Hyperventilation can cause light-headedness, tingling, or temporary tetany (muscle cramping) — these pass when breathing normalises. Always practice intense breathwork lying down. Do not drive or operate machinery for 30 minutes after breathwork. Air ceremonies outdoors: be aware of wind conditions, sun exposure, and temperature changes.",
        "spirit": "Spirit practices work with the transpersonal — dimensions of consciousness beyond the ordinary. Approach with respect and preparation. These practices are not appropriate during acute mental health crises, psychotic episodes, or severe dissociation. Spirit element work can dissolve the sense of personal boundaries — always re-establish grounding afterward (earth food, physical contact, walking barefoot). If you are newly beginning your spiritual path, build a foundation in the lower elements (earth, water, fire, air) before working primarily with spirit. Have spiritual community or guidance for support through major spirit-element openings.",
    }
    for temple_id, safety in temple_safety.items():
        await db.elemental_temples.update_one({"id": temple_id}, {"$set": {"safety_precautions": safety}})
    logger.info(f"Elemental temple safety precautions applied to {len(temple_safety)} temples.")


async def _apply_yoga_spiritual_depth() -> None:
    from data.yoga_spiritual_data import YOGA_SPIRITUAL_DATA

    logger.info("Applying yoga spiritual depth data...")
    updated = 0
    async for pose in db.yoga_poses.find({}, {"_id": 0, "id": 1, "name": 1}):
        key = pose.get("name", "").lower().strip()
        if key in YOGA_SPIRITUAL_DATA:
            await db.yoga_poses.update_one({"id": pose["id"]}, {"$set": YOGA_SPIRITUAL_DATA[key]})
            updated += 1
    logger.info(f"Yoga spiritual depth applied to {updated} poses.")


async def _refresh_sacred_rites_courses() -> None:
    from data.sacred_rites_deep import SACRED_RITES_DEEP

    logger.info("Refreshing sacred_rites courses...")
    for rite_id, deep_data in SACRED_RITES_DEEP.items():
        await db.courses.update_one({"id": rite_id}, {"$set": deep_data}, upsert=True)
    logger.info(f"sacred_rites refreshed — {len(SACRED_RITES_DEEP)} courses.")


async def _ensure_temples_and_water_seeded() -> None:
    temples_count = await db.elemental_temples.count_documents({})
    if temples_count == 0:
        from data.elemental_temples_data import ELEMENTAL_TEMPLES
        await db.elemental_temples.insert_many(ELEMENTAL_TEMPLES)
        logger.info(f"  Seeded elemental_temples: {len(ELEMENTAL_TEMPLES)} elements")
    else:
        logger.info(f"  elemental_temples: {temples_count} entries (skipped)")

    wp_count = await db.water_practices.count_documents({})
    if wp_count == 0:
        from data.water_practices_data import WATER_PRACTICES
        await db.water_practices.insert_many(WATER_PRACTICES)
        logger.info(f"  Seeded water_practices: {len(WATER_PRACTICES)} practices")
    else:
        logger.info(f"  water_practices: {wp_count} entries (skipped)")


async def _seed_remaining_content_if_empty() -> None:
    crystals_count = await db.crystals.count_documents({})
    if crystals_count == 0:
        logger.info("Database empty - seeding remaining content...")
        await seed_all_content()
        logger.info("Database seeding complete!")
    else:
        logger.info(f"Database already has {crystals_count} crystals - skipping full seed")


async def _seed_database_preview_flow():
    try:
        await _seed_archangel_crystals_and_light_codes()
        await _seed_core_spiritual_content()
        await _seed_healing_modalities_and_embodiment()
        await _apply_first_layer_deep_teachings()
        await _apply_comprehensive_deep_teachings()
        await _seed_community_creative_video_content()
        await _apply_chakra_and_temple_safety()
        await _apply_yoga_spiritual_depth()
        await _refresh_sacred_rites_courses()
        await _ensure_temples_and_water_seeded()
        await _seed_remaining_content_if_empty()
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}")
        import traceback
        logger.error(traceback.format_exc())


async def do_database_seeding() -> None:
    """Coordinator for domain-level seeding tasks."""
    await seed_users()
    await seed_content()
    await seed_config()


async def seed_users() -> None:
    """Seed or validate user-domain data."""
    try:
        users_count = await db.users.count_documents({})
        logger.info(f"users domain seeding check complete — {users_count} users present.")
    except Exception as e:
        logger.warning(f"users domain seeding warning (non-fatal): {e}")


async def seed_content() -> None:
    """Seed content-domain collections and deep teachings."""
    await _seed_database_core_flow()


async def seed_config() -> None:
    """Seed/validate config-domain metadata."""
    try:
        await db.app_meta.update_one(
            {"id": "seed_config_last_run"},
            {
                "$set": {
                    "id": "seed_config_last_run",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "status": "ok",
                }
            },
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"config domain seeding warning (non-fatal): {e}")


async def ensure_indexes() -> None:
    """Create MongoDB indexes for performance-critical queries."""
    try:
        # Users — fast auth lookups
        await db.users.create_index("email", unique=True, background=True)
        # Practice history — per-user queries sorted by date
        await db.practice_history.create_index([("user_id", 1), ("created_at", -1)], background=True)
        # Community posts — sorted by creation date
        await db.community_posts.create_index([("created_at", -1)], background=True)
        # Content collections — id lookups
        for col in ["meditations", "crystals_deep", "chakra_cleansing", "breathwork_sessions",
                    "yoga_poses", "elemental_temples", "archangel_oracle"]:
            await db[col].create_index("id", unique=True, background=True)
        logger.info("MongoDB indexes ensured.")
    except Exception as e:
        logger.warning(f"Index creation warning (non-fatal): {e}")


async def cleanup_legacy_retreats_once() -> None:
    """Remove legacy placeholder retreats a single time without affecting future user-created entries."""
    marker_id = "retreats_cleanup_2026_03"

    try:
        marker = await db.app_meta.find_one({"id": marker_id}, {"_id": 0})
        if marker:
            return

        retreats = await db.retreats.find({}, {"_id": 0, "title": 1}).to_list(length=50)
        titles = _extract_retreat_titles(retreats)
        placeholder_flags = [_is_placeholder_retreat_title(title) for title in titles]
        should_clear = _should_clear_legacy_retreats(retreats, placeholder_flags)

        deleted_count = 0
        if should_clear:
            result = await db.retreats.delete_many({})
            deleted_count = result.deleted_count
            logger.info(f"Legacy retreats cleanup executed — removed {deleted_count} placeholder retreats.")
        else:
            logger.info("Legacy retreats cleanup skipped — existing retreats appear user-authored.")

        await db.app_meta.update_one(
            {"id": marker_id},
            {
                "$set": {
                    "id": marker_id,
                    "executed_at": datetime.now(timezone.utc).isoformat(),
                    "retreat_count_seen": len(retreats),
                    "deleted_count": deleted_count,
                    "placeholder_flags": placeholder_flags,
                }
            },
            upsert=True,
        )
    except Exception as e:
        logger.warning(f"Legacy retreats cleanup warning (non-fatal): {e}")


def _extract_retreat_titles(retreats: list[dict]) -> list[str]:
    return [str(item.get("title", "")).strip().lower() for item in retreats]


def _is_placeholder_retreat_title(title: str) -> bool:
    return (
        title.startswith("test")
        or title.startswith("test_")
        or title.startswith("test-")
        or title.startswith("pytest")
        or title == "sacred journey retreat"
    )


def _should_clear_legacy_retreats(retreats: list[dict], placeholder_flags: list[bool]) -> bool:
    if not retreats:
        return False
    if all(placeholder_flags):
        return True
    return len(retreats) <= 5 and sum(placeholder_flags) >= max(1, len(retreats) - 1)


@app.on_event("startup")
async def startup_seed_database() -> None:
    """Seed database with content on startup."""
    import asyncio
    try:
        ensure_storage_initialized()
        logger.info("Object storage initialized.")
    except Exception as e:
        logger.warning(f"Object storage init warning (non-fatal): {e}")
    asyncio.create_task(ensure_indexes())
    asyncio.create_task(cleanup_legacy_retreats_once())
    asyncio.create_task(do_database_seeding())
    logger.info("Database seeding and indexing started in background...")


async def seed_all_content() -> None:
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
    from data.sacred_ally_alchemy_content import SACRED_ALLY_ALCHEMY, ANGELIC_ALCHEMY
    from data.sacred_ally_alchemy_expansion import EXPANDED_SACRED_ALLY_ALCHEMY, EXPANDED_ANGELIC_ALCHEMY
    from data.sacred_ally_audio_journeys import SACRED_ALLY_AUDIO_JOURNEYS, SACRED_ALLY_PATHWAYS

    seed_config = SeedContentConfig(
        yoga_poses=YOGA_POSES,
        crystals=CRYSTALS,
        mantras=MANTRAS,
        mudras=MUDRAS,
        breathwork_sessions=BREATHWORK_SESSIONS,
        thirteen_month_calendar=THIRTEEN_MONTH_CALENDAR,
        oracle_cards=ORACLE_CARDS,
        somatic_practices=SOMATIC_PRACTICES,
        grounding_exercises=GROUNDING_EXERCISES,
        mindfulness_practices=MINDFULNESS_PRACTICES,
        meditations=MEDITATIONS,
        earth_altars=EARTH_ALTARS,
        creative_processes=CREATIVE_PROCESSES_DEEP,
        heart_practices=HEART_PRACTICES,
        shamanic_practices=SHAMANIC_PRACTICES,
        achievements=ENHANCED_ACHIEVEMENTS,
        elemental_practices=ELEMENTAL_PRACTICES,
        runes=ELDER_FUTHARK_RUNES,
        i_ching=I_CHING_HEXAGRAMS,
        videos=VIDEO_TUTORIALS,
    )
    collections = _build_seed_content_collections(seed_config)

    await _seed_content_collections(collections)
    ally_combined = SACRED_ALLY_ALCHEMY + EXPANDED_SACRED_ALLY_ALCHEMY
    angelic_combined = ANGELIC_ALCHEMY + EXPANDED_ANGELIC_ALCHEMY
    await _refresh_collection("sacred_ally_alchemy", ally_combined, f"sacred_ally_alchemy refreshed — {len(ally_combined)} entries.")
    await _refresh_collection("angelic_alchemy", angelic_combined, f"angelic_alchemy refreshed — {len(angelic_combined)} entries.")
    await _refresh_collection("sacred_ally_audio_journeys", SACRED_ALLY_AUDIO_JOURNEYS, f"sacred_ally_audio_journeys refreshed — {len(SACRED_ALLY_AUDIO_JOURNEYS)} entries.")
    await _refresh_collection("sacred_ally_pathways", SACRED_ALLY_PATHWAYS, f"sacred_ally_pathways refreshed — {len(SACRED_ALLY_PATHWAYS)} entries.")
    await _seed_light_codes_document(LIGHT_CODES)

    # Seed courses (sacred rites) — always refresh so content deepening takes effect
    await _seed_sacred_rites_courses()


@dataclass(frozen=True)
class SeedContentConfig:
    yoga_poses: list[dict]
    crystals: list[dict]
    mantras: list[dict]
    mudras: list[dict]
    breathwork_sessions: list[dict]
    thirteen_month_calendar: list[dict]
    oracle_cards: list[dict]
    somatic_practices: list[dict]
    grounding_exercises: list[dict]
    mindfulness_practices: list[dict]
    meditations: list[dict]
    earth_altars: list[dict]
    creative_processes: list[dict]
    heart_practices: list[dict]
    shamanic_practices: list[dict]
    achievements: list[dict]
    elemental_practices: list[dict]
    runes: list[dict]
    i_ching: list[dict]
    videos: list[dict]


def _build_seed_content_collections(config: SeedContentConfig) -> list[tuple[str, list[dict]]]:
    return [
        ("yoga_poses", config.yoga_poses),
        ("crystals", config.crystals),
        ("mantras", config.mantras),
        ("mudras", config.mudras),
        ("breathwork_sessions", config.breathwork_sessions),
        ("astrology_months", config.thirteen_month_calendar),
        ("oracle_cards", config.oracle_cards),
        ("somatic_practices", config.somatic_practices),
        ("grounding_exercises", config.grounding_exercises),
        ("mindfulness_practices", config.mindfulness_practices),
        ("meditations", config.meditations),
        ("earth_altars", config.earth_altars),
        ("creative_processes", config.creative_processes),
        ("heart_practices", config.heart_practices),
        ("shamanic_practices", config.shamanic_practices),
        ("achievements", config.achievements),
        ("elemental_practices", config.elemental_practices),
        ("runes", config.runes),
        ("i_ching", config.i_ching),
        ("videos", config.videos),
    ]


async def _seed_content_collections(collections: list[tuple[str, list[dict]]]) -> None:
    for name, data in collections:
        if data:
            await db[name].delete_many({})  # Clear existing
            await db[name].insert_many(data)
            logger.info(f"  Seeded {name}: {len(data)} items")


async def _seed_light_codes_document(light_codes: dict) -> None:
    if not light_codes:
        return

    await db.light_codes.delete_many({})
    await db.light_codes.insert_one(light_codes)
    logger.info("  Seeded light_codes: 1 document")


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

