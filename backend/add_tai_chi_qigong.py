"""Add Tai Chi and Qigong practices to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

TAI_CHI_PRACTICES = [
    {
        "id": "tai-chi-opening",
        "name": "Tai Chi Opening Form",
        "category": "Tai Chi",
        "element": "Water",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "The foundational opening movement of Tai Chi. Learn to sink your weight, soften your joints, and connect with earth energy while raising and lowering your arms with the breath.",
        "benefits": ["Grounds energy", "Calms the mind", "Improves balance", "Opens joints"],
        "instructions": [
            "Stand with feet shoulder-width apart",
            "Soften knees slightly, tailbone tucked",
            "Arms hang naturally at sides",
            "Inhale: slowly raise arms to shoulder height",
            "Exhale: sink weight, lower arms with soft elbows",
            "Move as if through warm honey",
            "Repeat 9 times with full presence"
        ],
        "tips": "Imagine your arms floating on water. Less effort, more flow."
    },
    {
        "id": "tai-chi-cloud-hands",
        "name": "Cloud Hands",
        "category": "Tai Chi",
        "element": "Air",
        "duration_minutes": 15,
        "difficulty": "Beginner",
        "description": "A beautiful flowing movement where hands trace circular patterns like clouds drifting across the sky. Develops coordination, balance, and moving meditation.",
        "benefits": ["Improves coordination", "Balances left and right brain", "Calms anxiety", "Strengthens legs"],
        "instructions": [
            "Stand in horse stance, weight centered",
            "Right hand rises as left hand sinks",
            "Shift weight to right as right hand floats across",
            "Left hand rises as right hand sinks",
            "Shift weight to left as left hand floats across",
            "Arms move like clouds, weight shifts like waves",
            "Continue for 5-10 minutes"
        ],
        "tips": "The hands never stop moving. Find the continuous flow."
    },
    {
        "id": "tai-chi-brush-knee",
        "name": "Brush Knee Push",
        "category": "Tai Chi",
        "element": "Earth",
        "duration_minutes": 12,
        "difficulty": "Intermediate",
        "description": "A classic Tai Chi movement that develops rooting, ward-off energy, and the ability to redirect force. The essence of yielding and returning.",
        "benefits": ["Develops rooting", "Strengthens legs", "Improves posture", "Builds internal power"],
        "instructions": [
            "Begin in bow stance, weight on back leg",
            "One hand by ear, other hand by hip",
            "Shift weight forward while pushing with rear hand",
            "Front hand brushes down past knee",
            "Step through to repeat on other side",
            "Coordinate breath with movement",
            "Practice both sides equally"
        ],
        "tips": "Power comes from the ground through the legs, not the arms."
    },
    {
        "id": "tai-chi-wave-hands",
        "name": "Wave Hands Like Clouds",
        "category": "Tai Chi",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Beginner",
        "description": "Continuous side-stepping movement with flowing arm circles. Creates a meditative rhythm that clears the mind and balances energy.",
        "benefits": ["Moving meditation", "Hip flexibility", "Mental clarity", "Energy circulation"],
        "instructions": [
            "Stand with feet together",
            "Step to the side with one foot",
            "Arms trace vertical circles in front of body",
            "One hand rises as other descends",
            "Shift weight and step together",
            "Continue stepping and circling",
            "Move like gentle waves on shore"
        ],
        "tips": "Let the waist lead the arms. The arms follow, never lead."
    },
    {
        "id": "tai-chi-single-whip",
        "name": "Single Whip",
        "category": "Tai Chi",
        "element": "Fire",
        "duration_minutes": 10,
        "difficulty": "Intermediate",
        "description": "One of the most recognizable Tai Chi postures. Develops extension, structure, and the ability to express energy in multiple directions.",
        "benefits": ["Opens chest and shoulders", "Develops structure", "Improves focus", "Builds stamina"],
        "instructions": [
            "From Cloud Hands, form beak hand (fingers together)",
            "Extend beak hand to one side",
            "Turn waist, step into bow stance",
            "Open palm extends to opposite side",
            "Arms form a line through the body",
            "Hold with relaxed strength",
            "Breathe into the posture"
        ],
        "tips": "The beak hand is like holding a small bird - firm but gentle."
    }
]

QIGONG_PRACTICES = [
    {
        "id": "qigong-standing",
        "name": "Zhan Zhuang (Standing Meditation)",
        "category": "Qigong",
        "element": "Earth",
        "duration_minutes": 20,
        "difficulty": "Beginner",
        "description": "The foundation of all internal arts. Simply stand and hold a posture while cultivating internal energy. Profoundly simple yet deeply transformative.",
        "benefits": ["Builds internal energy", "Develops root", "Calms mind", "Heals body"],
        "instructions": [
            "Stand with feet shoulder-width apart",
            "Knees slightly bent, not past toes",
            "Tailbone tucked, spine straight",
            "Arms rounded as if hugging a large tree",
            "Shoulders relaxed, elbows sinking",
            "Breathe naturally into the belly",
            "Simply stand and observe for 5-20 minutes"
        ],
        "tips": "Start with 5 minutes and gradually increase. The practice deepens with time."
    },
    {
        "id": "qigong-eight-brocades",
        "name": "Eight Pieces of Brocade (Ba Duan Jin)",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 25,
        "difficulty": "Beginner",
        "description": "One of the most popular Qigong sets, dating back 800+ years. Eight exercises that stretch the meridians, massage organs, and circulate qi throughout the body.",
        "benefits": ["Full body energizing", "Organ health", "Flexibility", "Stress relief"],
        "instructions": [
            "1. Two Hands Hold Up Sky - stretch upward",
            "2. Draw the Bow - side stretch with arm pull",
            "3. Separate Heaven and Earth - alternating arm press",
            "4. Wise Owl Gazes Backward - neck turns",
            "5. Sway Head, Wag Tail - hip circles",
            "6. Two Hands Hold Feet - forward fold",
            "7. Clench Fists, Glare - power punch",
            "8. Bouncing on Toes - heel drops"
        ],
        "tips": "Each movement repeated 8 times. Move slowly with breath awareness."
    },
    {
        "id": "qigong-5-elements",
        "name": "Five Element Qigong",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 30,
        "difficulty": "Intermediate",
        "description": "A practice that balances the five elements within the body - Wood, Fire, Earth, Metal, and Water - corresponding to organs and emotions.",
        "benefits": ["Emotional balance", "Organ health", "Seasonal attunement", "Energy harmony"],
        "instructions": [
            "Wood: Side stretches for liver/gallbladder",
            "Fire: Heart-opening arm movements",
            "Earth: Centered, grounding movements",
            "Metal: Lung-expanding arm sweeps",
            "Water: Flowing kidney/lower back movements",
            "Practice all five or focus on one element",
            "Match to season or personal needs"
        ],
        "tips": "Spring=Wood, Summer=Fire, Late Summer=Earth, Autumn=Metal, Winter=Water"
    },
    {
        "id": "qigong-microcosmic-orbit",
        "name": "Microcosmic Orbit Meditation",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 20,
        "difficulty": "Advanced",
        "description": "A foundational Taoist meditation that circulates energy through the two main channels - up the spine (Du Mai) and down the front (Ren Mai).",
        "benefits": ["Energy cultivation", "Spiritual development", "Healing", "Longevity"],
        "instructions": [
            "Sit comfortably, spine straight",
            "Breathe into lower dantian (below navel)",
            "Guide awareness down to perineum",
            "Breathe up the spine to crown",
            "Exhale down the front to navel",
            "Continue circulating with breath",
            "Practice 15-30 minutes"
        ],
        "tips": "Use mind intent, not force. Energy follows attention naturally."
    },
    {
        "id": "qigong-shaking",
        "name": "Shaking Qigong",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "Simple yet powerful practice of shaking the whole body to release tension, clear stagnant energy, and activate the lymphatic system.",
        "benefits": ["Releases tension", "Clears stuck energy", "Lymphatic drainage", "Trauma release"],
        "instructions": [
            "Stand with feet shoulder-width apart",
            "Soften knees and begin gentle bouncing",
            "Let the shaking spread through whole body",
            "Arms hang loose, jaw relaxed",
            "Allow sounds to release if they come",
            "Shake vigorously for 5-10 minutes",
            "Stop and stand still, feeling the energy"
        ],
        "tips": "Animals shake after stress to reset their nervous system. So can you."
    },
    {
        "id": "qigong-turtle-breathing",
        "name": "Turtle Breathing",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Beginner",
        "description": "Based on the Taoist observation that slow-breathing creatures live longest. Deep, slow abdominal breathing that calms the nervous system.",
        "benefits": ["Longevity practice", "Deep relaxation", "Stress reduction", "Blood pressure"],
        "instructions": [
            "Sit or lie comfortably",
            "Place hands on lower belly",
            "Inhale slowly, expanding belly (4-6 counts)",
            "Pause briefly at the top",
            "Exhale slowly, belly softens (6-8 counts)",
            "Pause briefly at the bottom",
            "Gradually lengthen the breath over time"
        ],
        "tips": "The turtle breathes only 4 times per minute and lives over 100 years."
    },
    {
        "id": "qigong-lifting-sky",
        "name": "Lifting the Sky",
        "category": "Qigong",
        "element": "Air",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "One of the simplest yet most effective Qigong exercises. Opens the chest, stretches the spine, and generates a powerful flow of qi.",
        "benefits": ["Energy boost", "Spinal health", "Opens chest", "Uplifts mood"],
        "instructions": [
            "Stand with feet together",
            "Interlace fingers in front of body",
            "Turn palms down, then up toward sky",
            "Push palms upward while looking up",
            "Stretch fully, breathing in",
            "Release arms down the sides, breathing out",
            "Repeat 10-20 times"
        ],
        "tips": "Imagine pushing the sky higher with each repetition."
    },
    {
        "id": "qigong-six-healing-sounds",
        "name": "Six Healing Sounds",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 20,
        "difficulty": "Beginner",
        "description": "Ancient Taoist practice using specific sounds to release heat and toxins from the organs. Each sound corresponds to an organ and emotion.",
        "benefits": ["Organ detox", "Emotional release", "Cooling excess heat", "Energy balance"],
        "instructions": [
            "Liver: 'SHHHHH' - releases anger",
            "Heart: 'HAWWWW' - releases anxiety",
            "Spleen: 'WHOOO' - releases worry",
            "Lungs: 'SSSSS' - releases grief",
            "Kidneys: 'CHEWWW' - releases fear",
            "Triple Warmer: 'HEEEEE' - balances all",
            "Repeat each sound 3-6 times"
        ],
        "tips": "Make the sounds on the exhale, sub-vocally (more breath than voice)."
    }
]

async def add_gentle_movements() -> None:
    """Add Tai Chi and Qigong to somatic practices."""
    print("Adding Tai Chi and Qigong practices...")
    
    # Add to somatic_practices collection
    for practice in TAI_CHI_PRACTICES + QIGONG_PRACTICES:
        existing = await db.somatic_practices.find_one({"id": practice["id"]})
        if not existing:
            await db.somatic_practices.insert_one(practice)
            print(f"  Added: {practice['name']} ({practice['category']})")
        else:
            print(f"  Already exists: {practice['name']}")
    
    count = await db.somatic_practices.count_documents({})
    print(f"\nTotal somatic/movement practices now: {count}")

if __name__ == "__main__":
    asyncio.run(add_gentle_movements())
