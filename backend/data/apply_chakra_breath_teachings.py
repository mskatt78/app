"""
Apply chakra and breathwork deep teachings to the database.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from deep_teachings_chakras_breath import CHAKRA_DEEP_TEACHINGS, BREATHWORK_DEEP_TEACHINGS

async def apply_chakra_breath_teachings():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    
    print("=== Applying Deep Teachings to Chakras ===")
    for chakra_id, teachings in CHAKRA_DEEP_TEACHINGS.items():
        result = await db.chakra_cleansing.update_one(
            {"id": chakra_id},
            {"$set": {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "deeper_teachings": teachings.get("deeper_teachings", ""),
                "healing_practices": teachings.get("healing_practices", []),
                "affirmations": teachings.get("affirmations", [])
            }}
        )
        if result.modified_count > 0:
            print(f"  ✓ Updated: {chakra_id}")
        else:
            print(f"  - Not found: {chakra_id}")
    
    print("\n=== Applying Deep Teachings to Breathwork ===")
    for session_id, teachings in BREATHWORK_DEEP_TEACHINGS.items():
        result = await db.breathwork_sessions.update_one(
            {"id": session_id},
            {"$set": {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "full_instructions": teachings.get("full_instructions", ""),
                "benefits": teachings.get("benefits", []),
                "best_time": teachings.get("best_time", "")
            }}
        )
        if result.modified_count > 0:
            print(f"  ✓ Updated: {session_id}")
        else:
            print(f"  - Not found: {session_id}")
    
    print("\n=== Chakra & Breathwork Teachings Applied! ===")
    client.close()

if __name__ == "__main__":
    asyncio.run(apply_chakra_breath_teachings())
