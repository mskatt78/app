from typing import Any, Optional

# 40-Day Sacred Journey Structure for Courses
# Each course has 40 days of structured practices

MUNAY_KI_40_DAY_JOURNEY = [
    # WEEK 1: Foundation & Preparation
    {
        "day": 1,
        "theme": "Opening Sacred Space",
        "rite": None,
        "morning_practice": {
            "name": "Sacred Space Creation",
            "duration_minutes": 20,
            "description": "Create your mesa (altar) with items from nature. Call in the four directions.",
            "steps": [
                "Find 4 items from nature representing Earth, Water, Fire, Air",
                "Place them on a cloth in the four directions",
                "Light a candle at center",
                "Call in each direction: 'I call upon the spirits of the East/South/West/North'",
                "State intention: 'I open to receive the Munay Ki rites'"
            ]
        },
        "evening_reflection": "Journal: What am I releasing to make space for these transmissions?",
        "affirmation": "I prepare my energy field to receive sacred light."
    },
    {
        "day": 2,
        "theme": "Connecting to Pachamama",
        "rite": None,
        "morning_practice": {
            "name": "Earth Connection Meditation",
            "duration_minutes": 30,
            "description": "Sit or lie on the earth. Feel Pachamama supporting you.",
            "steps": [
                "Find a quiet spot in nature or sit with a plant",
                "Remove your shoes and feel the earth",
                "Breathe deeply, visualizing roots growing from your body into the earth",
                "Send gratitude down through your roots",
                "Receive Earth's love rising up through you"
            ]
        },
        "evening_reflection": "Journal: What is my relationship with Mother Earth? Where have I been disconnected?",
        "affirmation": "I am held by Pachamama. I belong to the Earth."
    },
    {
        "day": 3,
        "theme": "Cleansing the Energy Field",
        "rite": None,
        "morning_practice": {
            "name": "Smoke Purification Ceremony",
            "duration_minutes": 25,
            "description": "Use sage, palo santo, or cedar to cleanse your energy field.",
            "steps": [
                "Light your sacred smoke",
                "Starting at feet, waft smoke up front of body",
                "Continue over head and down back",
                "Smudge hands, saying 'May my hands do sacred work'",
                "Smudge eyes, ears, mouth, heart",
                "Give thanks to the plant spirit"
            ]
        },
        "evening_reflection": "Journal: What energies have I been carrying that are not mine?",
        "affirmation": "I release all that is not mine. I am cleansed and clear."
    },
    {
        "day": 4,
        "theme": "Setting Sacred Intention",
        "rite": None,
        "morning_practice": {
            "name": "Intention Ceremony",
            "duration_minutes": 20,
            "description": "Write and speak your intention for the 40-day journey.",
            "steps": [
                "Sit at your mesa in quiet reflection",
                "Write: 'My intention for receiving the Munay Ki rites is...'",
                "Speak your intention aloud three times",
                "Blow your intention into a stone or crystal",
                "Place this stone at the center of your mesa"
            ]
        },
        "evening_reflection": "Journal: What transformation am I truly ready for?",
        "affirmation": "My intention is held by Spirit. I am ready."
    },
    # DAYS 5-7: Receiving First Rite
    {
        "day": 5,
        "theme": "Bands of Power - Receiving",
        "rite": "bands_of_power",
        "rite_number": 1,
        "is_rite_day": True,
        "morning_practice": {
            "name": "Rite 1: Bands of Power Transmission",
            "duration_minutes": 45,
            "description": "Receive the five bands of protection: Earth, Water, Fire, Air, Pure Light.",
            "steps": [
                "Create sacred space at your mesa",
                "Read the Bands of Power teaching fully",
                "Lie down and call in the lineage holders",
                "Visualize each band weaving around you",
                "Earth band at hips, Water at navel, Fire at solar plexus",
                "Air at chest, Pure Light at crown streaming down",
                "Feel the bands activate and begin to spin",
                "Rest in gratitude for 10 minutes"
            ]
        },
        "evening_reflection": "Journal: What did I feel during the transmission? Any visions or sensations?",
        "affirmation": "The Bands of Power protect me. I transform density into light."
    },
    {
        "day": 6,
        "theme": "Bands of Power - Integration Day 1",
        "rite": "bands_of_power",
        "morning_practice": {
            "name": "Activating the Bands",
            "duration_minutes": 20,
            "description": "Practice feeling and strengthening each band.",
            "steps": [
                "Stand grounded, eyes closed",
                "Breathe into each band starting with Earth",
                "Feel each band spinning and glowing",
                "Test: imagine dense energy approaching",
                "Watch it transform to light as it touches your bands",
                "Thank your bands for their protection"
            ]
        },
        "evening_reflection": "Journal: How did I feel protected today? Any encounters with dense energy?",
        "affirmation": "My bands are alive and protecting me always."
    },
    {
        "day": 7,
        "theme": "Bands of Power - Integration Day 2",
        "rite": "bands_of_power",
        "morning_practice": {
            "name": "Walking with the Bands",
            "duration_minutes": 30,
            "description": "Take a mindful walk, feeling your bands active.",
            "steps": [
                "Go for a walk in nature or your neighborhood",
                "As you walk, feel each band spinning",
                "Notice how you feel around different people/places",
                "Practice sending love through your bands to the world",
                "Return home and journal your experience"
            ]
        },
        "evening_reflection": "Journal: Did I notice feeling less affected by heavy energies?",
        "affirmation": "I walk through the world protected and transforming."
    },
    # DAYS 8-11: Healer's Rite
    {
        "day": 8,
        "theme": "Preparing for Healer's Rite",
        "rite": None,
        "morning_practice": {
            "name": "Healing Lineage Meditation",
            "duration_minutes": 25,
            "description": "Connect to the lineage of healers who have come before.",
            "steps": [
                "Sit at your mesa",
                "Imagine a long line of healers behind you",
                "Grandmothers, grandfathers, shamans, curanderas",
                "Feel their hands on your shoulders",
                "Say: 'I honor the healing lineage'",
                "Ask: 'How may I serve the healing of All?'"
            ]
        },
        "evening_reflection": "Journal: Who are the healers in my ancestry? What healing gifts run in my lineage?",
        "affirmation": "I am part of a great lineage of healers."
    },
    {
        "day": 9,
        "theme": "Healer's Rite - Receiving",
        "rite": "healers_rite",
        "rite_number": 2,
        "is_rite_day": True,
        "morning_practice": {
            "name": "Rite 2: Healer's Rite Transmission",
            "duration_minutes": 45,
            "description": "Receive connection to the lineage of Earthkeepers who have come before.",
            "steps": [
                "Create sacred space",
                "Light candles for the ancestors",
                "Read the Healer's Rite teaching",
                "Lie down and place hands on heart",
                "Call: 'Great healing lineage, I open to receive you'",
                "Feel the light codes entering your hands, your heart",
                "See luminous beings surrounding you",
                "Receive their blessings for 15 minutes",
                "Thank the lineage"
            ]
        },
        "evening_reflection": "Journal: What did I receive? Any messages from the ancestors?",
        "affirmation": "I am connected to the great healing lineage of light."
    },
    {
        "day": 10,
        "theme": "Healer's Rite - Integration Day 1",
        "rite": "healers_rite",
        "morning_practice": {
            "name": "Healing Hands Activation",
            "duration_minutes": 20,
            "description": "Activate the healing energy in your hands.",
            "steps": [
                "Rub palms together until warm",
                "Hold hands 6 inches apart, feel energy between them",
                "Pull hands apart slowly, feel the energy stretch",
                "Place hands on your own body where healing is needed",
                "Send love and light through your hands",
                "Thank your healing hands"
            ]
        },
        "evening_reflection": "Journal: Where did I feel called to offer healing today?",
        "affirmation": "Healing light flows through my hands."
    },
    # Continue pattern for remaining days...
    {
        "day": 11,
        "theme": "Healer's Rite - Integration Day 2",
        "rite": "healers_rite",
        "morning_practice": {
            "name": "Offering Healing to Nature",
            "duration_minutes": 30,
            "description": "Practice sending healing to a plant, tree, or body of water.",
            "steps": [
                "Find a plant or tree",
                "Sit with it and sense its energy",
                "Place hands near it (not touching)",
                "Send healing light through your hands",
                "Feel the exchange of energy",
                "Thank the plant for receiving"
            ]
        },
        "evening_reflection": "Journal: What did I learn about the flow of healing energy?",
        "affirmation": "I am a channel for healing light."
    },
    # Day 12-40: Continue pattern with remaining rites
    # Harmony Rite (Days 12-15)
    # Seer's Rite (Days 16-19)  
    # Daykeeper's Rite (Days 20-23)
    # Wisdomkeeper's Rite (Days 24-27)
    # Earthkeeper's Rite (Days 28-31)
    # Starkeeper's Rite (Days 32-35)
    # Creator Rite (Days 36-39)
    # Day 40: Completion Ceremony
    {
        "day": 40,
        "theme": "Completion & New Beginning",
        "rite": None,
        "is_completion_day": True,
        "morning_practice": {
            "name": "40-Day Completion Ceremony",
            "duration_minutes": 60,
            "description": "Honor your journey and step into your new luminous identity.",
            "steps": [
                "Create elaborate sacred space with flowers and offerings",
                "Light 9 candles, one for each rite received",
                "Sit in meditation and call in all the archetypes",
                "Feel all 9 rites alive and integrated in your being",
                "Make an offering of gratitude (despacho ceremony)",
                "State: 'I have walked the path of the Munay Ki. I am transformed.'",
                "Make a commitment for how you will share these gifts",
                "Close sacred space with gratitude"
            ]
        },
        "evening_reflection": "Journal: Who am I now? How has this journey changed me?",
        "affirmation": "I am a fully initiated Earthkeeper. I walk in beauty."
    }
]

# Add to courses
def get_journey_day(course_id: str, day: int) -> Optional[dict[str, Any]]:
    """Get a specific day from a course journey."""
    if course_id == "munay-ki":
        for journey_day in MUNAY_KI_40_DAY_JOURNEY:
            if journey_day["day"] == day:
                return journey_day
    return None

def get_course_journey(course_id: str) -> list[dict[str, Any]]:
    """Get the full 40-day journey for a course."""
    if course_id == "munay-ki":
        return MUNAY_KI_40_DAY_JOURNEY
    return []
