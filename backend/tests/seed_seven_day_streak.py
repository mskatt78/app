"""One-off seed script: inserts 7 consecutive daily practice_history entries for the QA user, then queries stats to confirm current_streak=7."""
import os
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://breathwork-sanctuary.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
QA_EMAIL = "demoqa_740fefc1@example.com"
QA_PASSWORD = "DemoPass123!"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


async def main():
    # Login to get user_id
    r = requests.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=30)
    r.raise_for_status()
    user = r.json()["user"]
    user_id = user["user_id"]
    print(f"QA user_id: {user_id}")

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    now = datetime.now(timezone.utc)
    # Remove any existing seeded streak entries with practice_id prefix TEST_STREAK_
    await db.practice_history.delete_many({"user_id": user_id, "practice_id": {"$regex": "^TEST_STREAK_"}})

    # Insert 7 days ending today
    docs = []
    for i in range(7):
        day = now - timedelta(days=i)
        completed_at = day.replace(hour=12, minute=0, second=0, microsecond=0).isoformat()
        docs.append({
            "log_id": f"log_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "practice_type": "meditation",
            "practice_id": f"TEST_STREAK_day{i}",
            "duration_minutes": 5,
            "notes": f"Seeded streak day {i}",
            "element": None,
            "completed_at": completed_at,
        })
    await db.practice_history.insert_many(docs)
    print(f"Inserted {len(docs)} seeded entries")

    # Now hit stats via API (with session)
    s = requests.Session()
    s.post(f"{API}/auth/login", json={"email": QA_EMAIL, "password": QA_PASSWORD}, timeout=30)
    stats = s.get(f"{API}/practice-history/stats", timeout=15).json()
    print(f"Stats: total_sessions={stats['total_sessions']} current_streak={stats['current_streak']}")
    assert stats["current_streak"] >= 7, f"Expected streak>=7 got {stats['current_streak']}"
    print("PASS: streak >= 7")

if __name__ == "__main__":
    asyncio.run(main())
