"""Add even more crystals to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

MORE_CRYSTALS = [
    {
        "id": "black-tourmaline",
        "name": "Black Tourmaline",
        "element": "Earth",
        "chakra": "Root",
        "properties": ["Protection", "Grounding", "Purification", "Security"],
        "description": "The ultimate protection stone. Creates a powerful shield against negative energies, electromagnetic radiation, and psychic attack.",
        "uses": ["EMF protection", "Grounding", "Home protection", "Energy clearing"],
        "zodiac": ["Capricorn", "Libra"],
        "care": "Cleanse with running water, moonlight, or earth burial."
    },
    {
        "id": "angelite",
        "name": "Angelite",
        "element": "Air",
        "chakra": "Throat",
        "properties": ["Angelic connection", "Peace", "Communication", "Compassion"],
        "description": "A gentle stone of awareness that connects you with the angelic realm. Promotes peace and tranquility.",
        "uses": ["Angel communication", "Peaceful sleep", "Astral travel", "Telepathy"],
        "zodiac": ["Aquarius"],
        "care": "Do NOT cleanse with water - it will dissolve. Use smudging or moonlight."
    },
    {
        "id": "chrysocolla",
        "name": "Chrysocolla",
        "element": "Water",
        "chakra": "Heart",
        "properties": ["Communication", "Goddess energy", "Empowerment", "Teaching"],
        "description": "The stone of wise women and communication. Empowers feminine energy and teaches through gentle wisdom.",
        "uses": ["Public speaking", "Teaching", "Women's circles", "Emotional healing"],
        "zodiac": ["Taurus", "Gemini", "Virgo"],
        "care": "Cleanse with moonlight or smudging. Avoid water."
    },
    {
        "id": "lepidolite",
        "name": "Lepidolite",
        "element": "Water",
        "chakra": "Third Eye",
        "properties": ["Calm", "Transition", "Balance", "Awareness"],
        "description": "The stone of transition. Contains natural lithium, making it excellent for anxiety, depression, and emotional balance.",
        "uses": ["Anxiety relief", "Sleep aid", "Life transitions", "Emotional balance"],
        "zodiac": ["Libra", "Pisces"],
        "care": "Cleanse with moonlight or sound. Avoid water."
    },
    {
        "id": "moldavite",
        "name": "Moldavite",
        "element": "Spirit",
        "chakra": "Heart",
        "properties": ["Transformation", "Rapid change", "Cosmic connection", "Evolution"],
        "description": "A powerful tektite formed from a meteorite impact. Accelerates spiritual evolution and brings rapid transformation.",
        "uses": ["Spiritual awakening", "Past life work", "Star seed connection", "Rapid manifestation"],
        "zodiac": ["All signs"],
        "care": "Cleanse with moonlight. Handle with care - very powerful energy."
    },
    {
        "id": "unakite",
        "name": "Unakite",
        "element": "Earth",
        "chakra": "Heart",
        "properties": ["Balance", "Patience", "Vision", "Grounding"],
        "description": "A stone of vision and balance that helps release emotional blockages and promotes patience in healing.",
        "uses": ["Emotional healing", "Pregnancy support", "Past life work", "Patience"],
        "zodiac": ["Scorpio", "Virgo"],
        "care": "Cleanse with running water or moonlight."
    },
    {
        "id": "sunstone",
        "name": "Sunstone",
        "element": "Fire",
        "chakra": "Sacral",
        "properties": ["Joy", "Leadership", "Vitality", "Independence"],
        "description": "A stone of joy and leadership that brings light into dark times. Encourages independence and original thought.",
        "uses": ["Depression relief", "Leadership development", "Confidence building", "Seasonal depression"],
        "zodiac": ["Leo", "Libra"],
        "care": "Cleanse with sunlight or running water."
    },
    {
        "id": "kunzite",
        "name": "Kunzite",
        "element": "Water",
        "chakra": "Heart",
        "properties": ["Divine love", "Emotional healing", "Peace", "Self-love"],
        "description": "A high-vibration stone of divine love that opens the heart to receiving unconditional love.",
        "uses": ["Heart healing", "Self-love", "Relationship healing", "Stress relief"],
        "zodiac": ["Taurus", "Leo", "Scorpio"],
        "care": "Avoid sunlight which can fade color. Cleanse with moonlight."
    },
    {
        "id": "iolite",
        "name": "Iolite",
        "element": "Air",
        "chakra": "Third Eye",
        "properties": ["Vision", "Intuition", "Direction", "Self-discovery"],
        "description": "The Viking's compass stone. Helps you navigate through life's journey with inner vision and clear direction.",
        "uses": ["Meditation", "Journeying", "Finding direction", "Inner vision"],
        "zodiac": ["Taurus", "Libra", "Sagittarius"],
        "care": "Cleanse with moonlight or smudging."
    },
    {
        "id": "peridot",
        "name": "Peridot",
        "element": "Earth",
        "chakra": "Heart",
        "properties": ["Abundance", "Prosperity", "Growth", "Renewal"],
        "description": "The stone of the sun that attracts abundance and prosperity. Helps release old patterns and embrace renewal.",
        "uses": ["Abundance work", "Heart opening", "Jealousy release", "New beginnings"],
        "zodiac": ["Leo", "Virgo", "Scorpio", "Sagittarius"],
        "care": "Cleanse with running water or moonlight."
    },
    {
        "id": "aquamarine",
        "name": "Aquamarine",
        "element": "Water",
        "chakra": "Throat",
        "properties": ["Courage", "Communication", "Calm", "Clarity"],
        "description": "The stone of the sea that brings courage and clear communication. Calms fears and promotes peaceful self-expression.",
        "uses": ["Public speaking", "Travel protection", "Calm emotions", "Throat chakra work"],
        "zodiac": ["Pisces", "Aries", "Gemini"],
        "care": "Cleanse with sea salt water or moonlight."
    },
    {
        "id": "garnet",
        "name": "Garnet",
        "element": "Fire",
        "chakra": "Root",
        "properties": ["Passion", "Energy", "Regeneration", "Commitment"],
        "description": "A stone of passion and commitment that energizes and regenerates. Balances and purifies energy.",
        "uses": ["Relationship commitment", "Energy boost", "Manifestation", "Grounding"],
        "zodiac": ["Aries", "Leo", "Virgo", "Capricorn", "Aquarius"],
        "care": "Cleanse with running water or moonlight."
    }
]

async def add_more_crystals() -> None:
    """Add more crystals to database."""
    print("Adding more crystals...")
    
    for crystal in MORE_CRYSTALS:
        existing = await db.crystals.find_one({"id": crystal["id"]})
        if not existing:
            await db.crystals.insert_one(crystal)
            print(f"  Added: {crystal['name']}")
        else:
            print(f"  Already exists: {crystal['name']}")
    
    count = await db.crystals.count_documents({})
    print(f"\nTotal crystals now: {count}")

if __name__ == "__main__":
    asyncio.run(add_more_crystals())
