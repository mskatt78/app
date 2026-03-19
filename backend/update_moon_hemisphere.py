"""Update moon calendar data with hemisphere-aware descriptions."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Hemisphere-aware descriptions for each moon
HEMISPHERE_DESCRIPTIONS = {
    "1": {
        "north": "The primal spark ignites. New beginnings emerge from winter's dark womb.",
        "south": "The primal spark ignites. New beginnings emerge from summer's vibrant peak."
    },
    "2": {
        "north": "Deep stillness of winter. Rest and reflection before spring's stirring.",
        "south": "Deep stillness of summer. Rest and reflection in nature's abundance."
    },
    "3": {
        "north": "The crow brings messages from the spirit world. Magic stirs as winter breaks.",
        "south": "The crow brings messages from the spirit world. Magic stirs as autumn deepens."
    },
    "4": {
        "north": "Spring equinox energy. Time to plant seeds of intention in fertile ground.",
        "south": "Autumn equinox energy. Time to harvest and release what no longer serves."
    },
    "5": {
        "north": "The hare's fertility and playfulness. Joy returns with spring's full bloom.",
        "south": "The hare's playfulness in autumn's bounty. Joy in the harvest season."
    },
    "6": {
        "north": "The goddess of love awakens passion. Romance and beauty flourish in late spring.",
        "south": "The goddess of love awakens passion. Romance and beauty flourish in late autumn."
    },
    "7": {
        "north": "Summer solstice energy. The bee's honey sweetens life's celebrations.",
        "south": "Winter solstice energy. The bee's stored honey sustains through the dark."
    },
    "8": {
        "north": "The rose in full summer bloom. Love, sensuality, and full expression.",
        "south": "The rose rests in winter's embrace. Inner love and quiet reflection."
    },
    "9": {
        "north": "Late summer abundance. Time to enjoy the fruits of earlier labors.",
        "south": "Late winter introspection. Time to nurture seeds of future growth."
    },
    "10": {
        "north": "The raven's wisdom in early autumn. Preparation for coming transformation.",
        "south": "The raven's wisdom in early spring. Preparation for new beginnings."
    },
    "11": {
        "north": "The serpent sheds its skin. Autumn transformation and letting go.",
        "south": "The serpent awakens. Spring transformation and new growth."
    },
    "12": {
        "north": "The veil thins between worlds. Honor ancestors as autumn deepens.",
        "south": "The veil thins between worlds. Honor ancestors as spring energizes."
    },
    "13": {
        "north": "The oak stands firm through winter's dark. Wisdom of the ancestors in the world between years.",
        "south": "The oak provides summer shade. Wisdom of the ancestors in the world between years."
    }
}

async def update_moon_data():
    """Update all moons with hemisphere-aware descriptions."""
    print("Updating moon data with hemisphere support...")
    
    for moon_id, descriptions in HEMISPHERE_DESCRIPTIONS.items():
        result = await db.astrology_months.update_one(
            {"id": moon_id},
            {"$set": {
                "description_north": descriptions["north"],
                "description_south": descriptions["south"]
            }}
        )
        if result.modified_count > 0:
            print(f"  Updated moon {moon_id}")
        else:
            print(f"  Moon {moon_id} not found or already updated")
    
    print("\nDone! Moons now have hemisphere-aware descriptions.")
    print("Frontend will need to detect user's hemisphere and display accordingly.")

if __name__ == "__main__":
    asyncio.run(update_moon_data())
