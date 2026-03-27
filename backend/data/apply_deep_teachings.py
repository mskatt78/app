"""
Script to apply deep teachings to all practices in the database.
Run this to update feminine embodiment, masculine embodiment, chakras, and breathwork.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from deep_teachings_complete import FEMININE_DEEP_TEACHINGS, MASCULINE_DEEP_TEACHINGS

async def apply_deep_teachings():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['test_database']
    
    print("=== Applying Deep Teachings to Feminine Embodiment ===")
    for practice_id, teachings in FEMININE_DEEP_TEACHINGS.items():
        result = await db.feminine_embodiment.update_one(
            {"id": practice_id},
            {"$set": {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "practice_guide": teachings.get("practice_guide", ""),
                "extended_teachings": teachings.get("extended_teachings", ""),
                "benefits": teachings.get("benefits", []),
                "duration_minutes": teachings.get("duration_minutes", 20)
            }}
        )
        if result.modified_count > 0:
            print(f"  ✓ Updated: {practice_id}")
        else:
            print(f"  - Not found: {practice_id}")
    
    print("\n=== Applying Deep Teachings to Masculine Embodiment ===")
    for practice_id, teachings in MASCULINE_DEEP_TEACHINGS.items():
        result = await db.masculine_embodiment.update_one(
            {"id": practice_id},
            {"$set": {
                "why_this_heals": teachings.get("why_this_heals", ""),
                "practice_guide": teachings.get("practice_guide", ""),
                "extended_teachings": teachings.get("extended_teachings", ""),
                "benefits": teachings.get("benefits", []),
                "duration_minutes": teachings.get("duration_minutes", 20)
            }}
        )
        if result.modified_count > 0:
            print(f"  ✓ Updated: {practice_id}")
        else:
            print(f"  - Not found: {practice_id}")
    
    print("\n=== Deep Teachings Applied! ===")
    client.close()

if __name__ == "__main__":
    asyncio.run(apply_deep_teachings())
