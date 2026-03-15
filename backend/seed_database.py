"""
Database seeding script - Migrates all hardcoded content to MongoDB collections
Run with: python seed_database.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import data
from data.yoga_poses import YOGA_POSES
from data.all_content import (
    CRYSTALS, MANTRAS, MUDRAS, BREATHWORK_SESSIONS,
    THIRTEEN_MONTH_CALENDAR, ORACLE_CARDS, SOMATIC_PRACTICES,
    GROUNDING_EXERCISES, MINDFULNESS_PRACTICES, MEDITATIONS
)

async def seed_database():
    """Seed MongoDB with all content data."""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 50)
    print("Starting database seeding...")
    print("=" * 50)
    
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
    ]
    
    for collection_name, data in collections:
        print(f"\n📿 Seeding {collection_name}...")
        await db[collection_name].delete_many({})
        if data:
            await db[collection_name].insert_many(data)
            print(f"   ✓ Inserted {len(data)} items")
        else:
            print(f"   ⚠ No data to insert")
    
    # Create indexes
    print("\n🔍 Creating indexes...")
    await db.yoga_poses.create_index("element")
    await db.yoga_poses.create_index("difficulty")
    await db.crystals.create_index("element")
    await db.mantras.create_index("element")
    await db.mudras.create_index("element")
    await db.breathwork_sessions.create_index("element")
    await db.oracle_cards.create_index("element")
    print("   ✓ Indexes created")
    
    print("\n" + "=" * 50)
    print("✅ Database seeding complete!")
    print("=" * 50)
    
    # Summary
    print("\n📊 Summary:")
    for collection_name, data in collections:
        count = await db[collection_name].count_documents({})
        print(f"   {collection_name}: {count} documents")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
