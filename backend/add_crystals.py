"""Add more crystals to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADDITIONAL_CRYSTALS = [
    {
        "id": "selenite",
        "name": "Selenite",
        "element": "Spirit",
        "chakra": "Crown",
        "properties": ["Cleansing", "Clarity", "Angelic connection", "Peace"],
        "description": "A powerful cleansing crystal that clears negative energy and connects you to higher realms. Named after the moon goddess Selene.",
        "uses": ["Space clearing", "Meditation", "Chakra cleansing", "Angelic communication"],
        "zodiac": ["Cancer", "Taurus"],
        "care": "Do not cleanse with water. Use moonlight or smudging.",
        "image_url": "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800"
    },
    {
        "id": "labradorite",
        "name": "Labradorite",
        "element": "Spirit",
        "chakra": "Third Eye",
        "properties": ["Magic", "Protection", "Intuition", "Transformation"],
        "description": "The stone of magic and transformation. Its iridescent flash reveals hidden realms and awakens mystical abilities.",
        "uses": ["Psychic development", "Protection during spiritual work", "Past life recall", "Shamanic journeying"],
        "zodiac": ["Leo", "Scorpio", "Sagittarius"],
        "care": "Cleanse with moonlight or smudging.",
        "image_url": "https://images.unsplash.com/photo-1551122102-c2789e4e3b6c?w=800"
    },
    {
        "id": "malachite",
        "name": "Malachite",
        "element": "Earth",
        "chakra": "Heart",
        "properties": ["Transformation", "Protection", "Heart healing", "Abundance"],
        "description": "A powerful stone of transformation that absorbs negative energies and pollutants. Its swirling green patterns reflect constant change.",
        "uses": ["Emotional healing", "Protection from negativity", "Business success", "Inner transformation"],
        "zodiac": ["Scorpio", "Capricorn"],
        "care": "Do not cleanse with water or salt. Use smudging or moonlight.",
        "image_url": "https://images.unsplash.com/photo-1598963068090-7e82920dbb2d?w=800"
    },
    {
        "id": "carnelian",
        "name": "Carnelian",
        "element": "Fire",
        "chakra": "Sacral",
        "properties": ["Courage", "Creativity", "Vitality", "Motivation"],
        "description": "A stone of courage, vitality, and creative fire. It ignites passion and helps overcome fear.",
        "uses": ["Creative projects", "Public speaking", "Building confidence", "Fertility support"],
        "zodiac": ["Aries", "Leo", "Virgo"],
        "care": "Cleanse with running water or sunlight.",
        "image_url": "https://images.unsplash.com/photo-1615486364256-c7e5b2e4cb44?w=800"
    },
    {
        "id": "obsidian",
        "name": "Black Obsidian",
        "element": "Fire",
        "chakra": "Root",
        "properties": ["Protection", "Grounding", "Truth", "Shadow work"],
        "description": "Volcanic glass that cuts through illusion and reveals truth. A powerful shield against negativity and psychic attack.",
        "uses": ["Protection", "Shadow work", "Cord cutting", "Grounding"],
        "zodiac": ["Scorpio", "Sagittarius"],
        "care": "Cleanse with running water or moonlight.",
        "image_url": "https://images.unsplash.com/photo-1612392062126-da0d5d5e6ab6?w=800"
    },
    {
        "id": "turquoise",
        "name": "Turquoise",
        "element": "Water",
        "chakra": "Throat",
        "properties": ["Protection", "Wisdom", "Communication", "Wholeness"],
        "description": "Sacred stone of many indigenous cultures. Brings protection, wisdom, and enhances honest communication.",
        "uses": ["Speaking truth", "Travel protection", "Shamanic work", "Healing ceremonies"],
        "zodiac": ["Sagittarius", "Scorpio", "Pisces"],
        "care": "Avoid sunlight and chemicals. Cleanse with smudging.",
        "image_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800"
    },
    {
        "id": "smoky-quartz",
        "name": "Smoky Quartz",
        "element": "Earth",
        "chakra": "Root",
        "properties": ["Grounding", "Protection", "Stress relief", "Transmutation"],
        "description": "A powerful grounding stone that transforms negative energy into positive. Excellent for stress and anxiety relief.",
        "uses": ["Grounding", "EMF protection", "Stress relief", "Negative energy transmutation"],
        "zodiac": ["Scorpio", "Sagittarius", "Capricorn"],
        "care": "Cleanse with running water, moonlight, or earth burial.",
        "image_url": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800"
    },
    {
        "id": "fluorite",
        "name": "Fluorite",
        "element": "Air",
        "chakra": "Third Eye",
        "properties": ["Focus", "Clarity", "Organization", "Mental enhancement"],
        "description": "The 'Genius Stone' that enhances mental abilities, focus, and decision-making. Comes in beautiful rainbow colors.",
        "uses": ["Study aid", "Decision making", "Meditation focus", "Aura cleansing"],
        "zodiac": ["Pisces", "Capricorn"],
        "care": "Cleanse with moonlight. Avoid sunlight which can fade colors.",
        "image_url": "https://images.unsplash.com/photo-1599398054066-846f28917f38?w=800"
    },
    {
        "id": "moonstone-rainbow",
        "name": "Rainbow Moonstone",
        "element": "Water",
        "chakra": "Crown",
        "properties": ["Intuition", "Divine feminine", "New beginnings", "Emotional balance"],
        "description": "Stone of the goddess and divine feminine. Enhances intuition, emotional balance, and connection to lunar cycles.",
        "uses": ["Moon rituals", "Fertility support", "Emotional healing", "Enhancing intuition"],
        "zodiac": ["Cancer", "Libra", "Scorpio"],
        "care": "Cleanse with moonlight, especially during full moon.",
        "image_url": "https://images.unsplash.com/photo-1551122102-c2789e4e3b6c?w=800"
    },
    {
        "id": "pyrite",
        "name": "Pyrite",
        "element": "Fire",
        "chakra": "Solar Plexus",
        "properties": ["Abundance", "Willpower", "Protection", "Confidence"],
        "description": "Known as 'Fool's Gold', pyrite attracts abundance and strengthens willpower. A powerful shield against negativity.",
        "uses": ["Manifestation", "Wealth attraction", "Building confidence", "Protection"],
        "zodiac": ["Leo", "Aries"],
        "care": "Do not cleanse with water. Use sunlight or smudging.",
        "image_url": "https://images.unsplash.com/photo-1610039764483-b2a97e4f8f0e?w=800"
    },
    {
        "id": "sodalite",
        "name": "Sodalite",
        "element": "Water",
        "chakra": "Throat",
        "properties": ["Truth", "Logic", "Intuition", "Communication"],
        "description": "Stone of truth and logic that bridges the mind and heart. Enhances honest communication and self-expression.",
        "uses": ["Public speaking", "Logical thinking", "Throat chakra work", "Group communication"],
        "zodiac": ["Sagittarius", "Virgo"],
        "care": "Cleanse with running water or moonlight.",
        "image_url": "https://images.unsplash.com/photo-1598963068090-7e82920dbb2d?w=800"
    },
    {
        "id": "howlite",
        "name": "Howlite",
        "element": "Air",
        "chakra": "Crown",
        "properties": ["Calm", "Patience", "Sleep aid", "Awareness"],
        "description": "A calming stone that reduces stress, anxiety, and overactive mind. Excellent for sleep and meditation.",
        "uses": ["Insomnia relief", "Calming anxiety", "Meditation", "Patience building"],
        "zodiac": ["Gemini", "Virgo"],
        "care": "Cleanse with moonlight or smudging. Avoid prolonged water exposure.",
        "image_url": "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800"
    },
    {
        "id": "bloodstone",
        "name": "Bloodstone",
        "element": "Earth",
        "chakra": "Root",
        "properties": ["Courage", "Vitality", "Purification", "Grounding"],
        "description": "Ancient stone of courage and healing. Purifies blood and body while strengthening root chakra.",
        "uses": ["Physical healing", "Courage building", "Detoxification", "Ancestral healing"],
        "zodiac": ["Aries", "Libra", "Pisces"],
        "care": "Cleanse with running water or earth burial.",
        "image_url": "https://images.unsplash.com/photo-1612392062126-da0d5d5e6ab6?w=800"
    },
    {
        "id": "amazonite",
        "name": "Amazonite",
        "element": "Water",
        "chakra": "Heart",
        "properties": ["Harmony", "Truth", "Hope", "Communication"],
        "description": "Stone of harmony and hope. Soothes emotional trauma and helps speak truth from the heart.",
        "uses": ["Emotional healing", "Heart-throat connection", "Setting boundaries", "EMF protection"],
        "zodiac": ["Virgo", "Aquarius"],
        "care": "Cleanse with moonlight or smudging. Avoid prolonged sunlight.",
        "image_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800"
    },
    {
        "id": "kyanite",
        "name": "Blue Kyanite",
        "element": "Air",
        "chakra": "Throat",
        "properties": ["Alignment", "Communication", "Psychic ability", "Tranquility"],
        "description": "A high-vibration stone that aligns all chakras instantly. Never needs cleansing and enhances psychic abilities.",
        "uses": ["Chakra alignment", "Meditation", "Dream recall", "Communication"],
        "zodiac": ["Aries", "Taurus", "Libra"],
        "care": "Does not require cleansing. Handle gently as it's fragile.",
        "image_url": "https://images.unsplash.com/photo-1551122102-c2789e4e3b6c?w=800"
    },
    {
        "id": "rhodonite",
        "name": "Rhodonite",
        "element": "Earth",
        "chakra": "Heart",
        "properties": ["Emotional healing", "Self-love", "Forgiveness", "Compassion"],
        "description": "Stone of emotional healing that helps heal emotional wounds and promotes self-love and forgiveness.",
        "uses": ["Heart healing", "Relationship repair", "Self-worth building", "Emotional balance"],
        "zodiac": ["Taurus", "Scorpio"],
        "care": "Cleanse with running water or rose petals.",
        "image_url": "https://images.unsplash.com/photo-1598963068090-7e82920dbb2d?w=800"
    },
    {
        "id": "apache-tears",
        "name": "Apache Tears",
        "element": "Fire",
        "chakra": "Root",
        "properties": ["Grief healing", "Protection", "Grounding", "Emotional release"],
        "description": "A form of obsidian named for the tears of Apache women. Powerful for healing grief and releasing emotional pain.",
        "uses": ["Grief processing", "Emotional release", "Protection", "Ancestor work"],
        "zodiac": ["Scorpio", "Sagittarius"],
        "care": "Cleanse with running water or moonlight.",
        "image_url": "https://images.unsplash.com/photo-1612392062126-da0d5d5e6ab6?w=800"
    },
    {
        "id": "prehnite",
        "name": "Prehnite",
        "element": "Earth",
        "chakra": "Heart",
        "properties": ["Unconditional love", "Healing", "Prophecy", "Peace"],
        "description": "Stone of unconditional love and prophecy. Connects heart to will and enhances precognition.",
        "uses": ["Meditation", "Dream work", "Healing gardens", "Prophecy development"],
        "zodiac": ["Libra", "Virgo"],
        "care": "Cleanse with moonlight or earth.",
        "image_url": "https://images.unsplash.com/photo-1599398054066-846f28917f38?w=800"
    }
]

async def add_crystals() -> None:
    """Add additional crystals to database."""
    print("Adding more crystals...")
    
    for crystal in ADDITIONAL_CRYSTALS:
        existing = await db.crystals.find_one({"id": crystal["id"]})
        if not existing:
            await db.crystals.insert_one(crystal)
            print(f"  Added: {crystal['name']}")
        else:
            print(f"  Already exists: {crystal['name']}")
    
    count = await db.crystals.count_documents({})
    print(f"\nTotal crystals now: {count}")

if __name__ == "__main__":
    asyncio.run(add_crystals())
