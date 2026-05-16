"""Add more Tai Chi and Qigong practices to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

MORE_TAI_CHI = [
    {
        "id": "tai-chi-grasp-sparrow",
        "name": "Grasp the Sparrow's Tail",
        "category": "Tai Chi",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "The most fundamental Tai Chi sequence containing the four primary energies: Ward Off, Roll Back, Press, and Push. The essence of Tai Chi in one movement.",
        "benefits": ["Develops all four energies", "Improves coordination", "Builds internal strength", "Foundation for all forms"],
        "instructions": [
            "Begin in bow stance",
            "Ward Off (Peng): Arm rises like holding a ball",
            "Roll Back (Lu): Turn waist, redirect energy",
            "Press (Ji): Both hands press forward together",
            "Push (An): Palms push forward, weight shifts",
            "Repeat on both sides",
            "Connect movements like pearls on a string"
        ],
        "tips": "This sequence contains the DNA of Tai Chi. Master this, master Tai Chi."
    },
    {
        "id": "tai-chi-repulse-monkey",
        "name": "Repulse the Monkey",
        "category": "Tai Chi",
        "element": "Water",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "A beautiful backward-stepping movement that develops the ability to retreat while maintaining power. Teaches yielding without collapsing.",
        "benefits": ["Backward mobility", "Balance development", "Arm coordination", "Teaches yielding"],
        "instructions": [
            "Stand in front stance",
            "One hand extends forward, palm out",
            "Other hand draws back to hip",
            "Step backward with front foot",
            "Hands exchange positions",
            "Continue stepping back alternating sides",
            "Move like you're gently pushing someone away"
        ],
        "tips": "Step back as if testing the ground behind you. Never lose your root."
    },
    {
        "id": "tai-chi-white-crane",
        "name": "White Crane Spreads Wings",
        "category": "Tai Chi",
        "element": "Air",
        "duration_minutes": 8,
        "difficulty": "Beginner",
        "description": "An elegant posture mimicking a crane spreading its wings. Develops balance, opens the chest, and cultivates lightness.",
        "benefits": ["Opens chest", "Improves balance", "Develops grace", "Lifts spirit"],
        "instructions": [
            "Shift weight to one leg",
            "Other foot rests on toe beside ankle",
            "One arm rises above head, palm out",
            "Other arm presses down beside hip",
            "Body forms a vertical line",
            "Hold with relaxed strength",
            "Feel like a crane about to take flight"
        ],
        "tips": "The crane is patient, balanced, and ready. Embody these qualities."
    },
    {
        "id": "tai-chi-parting-horses-mane",
        "name": "Parting the Wild Horse's Mane",
        "category": "Tai Chi",
        "element": "Fire",
        "duration_minutes": 12,
        "difficulty": "Beginner",
        "description": "A flowing forward-stepping movement with arms separating like parting a horse's mane. Builds coordination and forward momentum.",
        "benefits": ["Forward stepping practice", "Arm-leg coordination", "Opens chest", "Builds momentum"],
        "instructions": [
            "Begin holding an imaginary ball",
            "Step forward into bow stance",
            "Front arm rises to shoulder height",
            "Back arm presses down beside hip",
            "Shift weight, prepare opposite ball",
            "Step forward, repeat other side",
            "Flow continuously forward"
        ],
        "tips": "Imagine gently parting a horse's mane with care and presence."
    },
    {
        "id": "tai-chi-golden-rooster",
        "name": "Golden Rooster Stands on One Leg",
        "category": "Tai Chi",
        "element": "Fire",
        "duration_minutes": 8,
        "difficulty": "Intermediate",
        "description": "A powerful balance posture that builds leg strength, mental focus, and the ability to stand firm under pressure.",
        "benefits": ["Balance mastery", "Leg strength", "Mental focus", "Confidence"],
        "instructions": [
            "Stand on one leg firmly rooted",
            "Raise opposite knee to hip height",
            "Same-side hand rises, palm up under knee",
            "Other hand presses down beside hip",
            "Crown of head lifts toward sky",
            "Hold with steady breath",
            "Switch sides"
        ],
        "tips": "Root down through standing leg to rise up. Balance is active, not static."
    },
    {
        "id": "tai-chi-snake-creeps",
        "name": "Snake Creeps Down",
        "category": "Tai Chi",
        "element": "Water",
        "duration_minutes": 10,
        "difficulty": "Advanced",
        "description": "A low, sinking movement that develops leg strength, flexibility, and the ability to drop your center. Very challenging but rewarding.",
        "benefits": ["Leg strength", "Hip flexibility", "Low center development", "Humility"],
        "instructions": [
            "From bow stance, shift weight back",
            "Sink down on back leg",
            "Front leg extends, heel on ground",
            "Body lowers as low as comfortable",
            "One hand sweeps low along extended leg",
            "Rise up into next movement",
            "Build depth gradually over time"
        ],
        "tips": "Only go as low as you can with good alignment. Depth comes with practice."
    },
    {
        "id": "tai-chi-fair-lady",
        "name": "Fair Lady Works the Shuttle",
        "category": "Tai Chi",
        "element": "Air",
        "duration_minutes": 12,
        "difficulty": "Intermediate",
        "description": "A diagonal stepping pattern with protective arm movements. Named after a woman working a weaving shuttle, it develops agility and spatial awareness.",
        "benefits": ["Diagonal movement", "Upper body protection", "Agility", "Spatial awareness"],
        "instructions": [
            "Step diagonally forward",
            "One arm rises to protect head",
            "Other arm pushes forward at chest height",
            "Turn and step to opposite diagonal",
            "Arms switch positions",
            "Practice all four corners",
            "Move like weaving on a loom"
        ],
        "tips": "The arms create a protective frame while moving through space."
    },
    {
        "id": "tai-chi-closing",
        "name": "Tai Chi Closing Form",
        "category": "Tai Chi",
        "element": "Earth",
        "duration_minutes": 5,
        "difficulty": "Beginner",
        "description": "The proper way to complete any Tai Chi practice. Gathers the energy cultivated during practice and stores it in the lower dantian.",
        "benefits": ["Energy gathering", "Grounding", "Completion", "Integration"],
        "instructions": [
            "Return to standing, feet shoulder-width",
            "Hands rise slowly to chest height",
            "Palms turn down, hands lower to belly",
            "Imagine gathering energy into lower dantian",
            "Hands rest on lower belly briefly",
            "Release hands to sides",
            "Stand quietly for a moment"
        ],
        "tips": "Never skip the closing. It seals in the benefits of your practice."
    }
]

MORE_QIGONG = [
    {
        "id": "qigong-deer-exercise",
        "name": "Deer Exercise",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "One of the Five Animal Frolics. The deer cultivates grace, flexibility, and kidney/reproductive energy through gentle stretching movements.",
        "benefits": ["Kidney energy", "Flexibility", "Grace", "Longevity"],
        "instructions": [
            "Stand with soft knees",
            "Hands form 'antlers' above head",
            "Stretch and twist gently like a deer",
            "Turn head to look behind",
            "Extend through the spine",
            "Move with lightness and alertness",
            "Practice both sides equally"
        ],
        "tips": "The deer is gentle but alert. Cultivate both qualities."
    },
    {
        "id": "qigong-crane-exercise",
        "name": "Crane Exercise",
        "category": "Qigong",
        "element": "Air",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "One of the Five Animal Frolics. The crane develops balance, lightness, and lung energy through standing and stretching movements.",
        "benefits": ["Lung energy", "Balance", "Lightness", "Elegance"],
        "instructions": [
            "Stand on one leg when comfortable",
            "Arms spread wide like wings",
            "Move with slow, graceful extension",
            "Breathe deeply into lungs",
            "Lift and lower like a crane in flight",
            "Feel lightness in the body",
            "Alternate standing legs"
        ],
        "tips": "The crane embodies patience and elegance. Never rush."
    },
    {
        "id": "qigong-bear-exercise",
        "name": "Bear Exercise",
        "category": "Qigong",
        "element": "Earth",
        "duration_minutes": 12,
        "difficulty": "Beginner",
        "description": "One of the Five Animal Frolics. The bear develops rootedness, spleen energy, and digestive health through heavy, grounded movements.",
        "benefits": ["Spleen/digestive health", "Grounding", "Strength", "Stability"],
        "instructions": [
            "Stand with feet wide, knees bent",
            "Shift weight heavily side to side",
            "Arms hang and swing naturally",
            "Move with slow, heavy intention",
            "Feel rooted and powerful",
            "Rock and sway like a bear walking",
            "Connect to earth energy"
        ],
        "tips": "The bear is heavy but not tense. Find power in relaxation."
    },
    {
        "id": "qigong-tiger-exercise",
        "name": "Tiger Exercise",
        "category": "Qigong",
        "element": "Fire",
        "duration_minutes": 12,
        "difficulty": "Intermediate",
        "description": "One of the Five Animal Frolics. The tiger builds tendon strength, liver energy, and fierce focus through powerful stretching movements.",
        "benefits": ["Liver energy", "Tendon strength", "Power", "Focus"],
        "instructions": [
            "Stand in a wide stance",
            "Hands form tiger claws",
            "Stretch forward with fierce intention",
            "Eyes glare with focus",
            "Alternate reaching and pulling back",
            "Engage tendons, not just muscles",
            "Growl internally to release liver energy"
        ],
        "tips": "The tiger is powerful but controlled. Channel strength without aggression."
    },
    {
        "id": "qigong-monkey-exercise",
        "name": "Monkey Exercise",
        "category": "Qigong",
        "element": "Fire",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "One of the Five Animal Frolics. The monkey cultivates agility, heart energy, and playfulness through quick, light movements.",
        "benefits": ["Heart energy", "Agility", "Playfulness", "Quick reflexes"],
        "instructions": [
            "Stand lightly on feet",
            "Move with quick, playful energy",
            "Scratch, reach, and look around",
            "Shift weight rapidly but controlled",
            "Let eyes move with curiosity",
            "Be mischievous and light",
            "Don't take yourself too seriously"
        ],
        "tips": "The monkey reminds us to play. Joy is medicine for the heart."
    },
    {
        "id": "qigong-dragon-spirals",
        "name": "Dragon Spiraling",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "Spiraling movements that cultivate the mythical dragon energy - the ability to move between heaven and earth with fluid power.",
        "benefits": ["Spinal flexibility", "Energy circulation", "Fluid power", "Spiritual connection"],
        "instructions": [
            "Stand with feet shoulder-width",
            "Begin spiraling movement from feet",
            "Let spiral travel up through body",
            "Arms follow the spiral naturally",
            "Move like a dragon swimming through clouds",
            "Spiral in both directions",
            "Feel energy moving through the spine"
        ],
        "tips": "The dragon moves without obstruction. Find the path of least resistance."
    },
    {
        "id": "qigong-bone-marrow-washing",
        "name": "Bone Marrow Washing",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 20,
        "difficulty": "Advanced",
        "description": "A deep cleansing practice that visualizes washing the bone marrow with healing light. Traditionally used for longevity and immune health.",
        "benefits": ["Immune system", "Deep cleansing", "Longevity", "Bone health"],
        "instructions": [
            "Stand or sit comfortably",
            "Visualize golden light above head",
            "Draw light down through crown",
            "See it penetrating into bones",
            "Wash through bone marrow",
            "Release gray/dark energy through feet",
            "Continue for 15-20 minutes"
        ],
        "tips": "This is subtle practice. Trust the visualization even if you don't feel it."
    },
    {
        "id": "qigong-inner-smile",
        "name": "Inner Smile Meditation",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 15,
        "difficulty": "Beginner",
        "description": "A Taoist meditation that directs loving, smiling energy to each organ. Transforms negative emotions stored in organs into positive virtues.",
        "benefits": ["Emotional healing", "Organ health", "Self-love", "Stress relief"],
        "instructions": [
            "Sit comfortably, close eyes",
            "Smile gently with your face",
            "Direct that smiling energy to your eyes",
            "Smile to your heart (joy)",
            "Smile to your liver (kindness)",
            "Smile to your lungs (courage)",
            "Smile to your kidneys (gentleness)",
            "Smile to your spleen (fairness)"
        ],
        "tips": "Your organs respond to your attention. Love them and they heal."
    },
    {
        "id": "qigong-swimming-dragon",
        "name": "Swimming Dragon",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "A flowing full-body movement that mimics a dragon swimming through water. Excellent for spinal health and energy flow.",
        "benefits": ["Spinal flexibility", "Full body flow", "Energy circulation", "Coordination"],
        "instructions": [
            "Stand with feet together",
            "Raise arms overhead, palms together",
            "Begin swaying like seaweed",
            "Let movement travel down spine",
            "Hips sway, knees bend and straighten",
            "Feel like swimming through water",
            "Continue for 10-15 minutes"
        ],
        "tips": "Start small and let the movement grow. The spine is a dragon."
    },
    {
        "id": "qigong-gathering-heaven-earth",
        "name": "Gathering Heaven and Earth",
        "category": "Qigong",
        "element": "Spirit",
        "duration_minutes": 10,
        "difficulty": "Beginner",
        "description": "A simple but powerful practice that draws energy from above and below, mixing them in the body's center.",
        "benefits": ["Energy cultivation", "Balance heaven/earth", "Centering", "Grounding while expanding"],
        "instructions": [
            "Stand with feet shoulder-width",
            "Inhale: Arms rise, gathering sky energy",
            "Bring hands to crown, draw energy down",
            "Exhale: Arms lower, gathering earth energy",
            "Bring hands up from ground",
            "Mix energies at lower dantian",
            "Repeat 9 times"
        ],
        "tips": "You are the meeting point of heaven and earth. Embody both."
    },
    {
        "id": "qigong-kidney-breathing",
        "name": "Kidney Breathing",
        "category": "Qigong",
        "element": "Water",
        "duration_minutes": 15,
        "difficulty": "Intermediate",
        "description": "A practice that directs breath and awareness to the kidneys to strengthen vital essence (jing) and reduce fear.",
        "benefits": ["Kidney strength", "Reduces fear", "Builds vitality", "Lower back health"],
        "instructions": [
            "Stand or sit with hands on lower back",
            "Hands rest over kidney area",
            "Inhale: Imagine breathing into kidneys",
            "Feel kidneys expand with breath",
            "Exhale: Kidneys release and soften",
            "Continue with focused attention",
            "Practice 10-15 minutes"
        ],
        "tips": "The kidneys store your vital essence. Breathe life into them daily."
    },
    {
        "id": "qigong-cloud-hands",
        "name": "Qigong Cloud Hands",
        "category": "Qigong",
        "element": "Air",
        "duration_minutes": 15,
        "difficulty": "Beginner",
        "description": "Similar to Tai Chi cloud hands but with emphasis on energy cultivation. The hands trace circles while gathering and circulating qi.",
        "benefits": ["Energy circulation", "Arm relaxation", "Meditation in motion", "Coordination"],
        "instructions": [
            "Stand in horse stance",
            "One hand rises as other sinks",
            "Hands trace vertical circles",
            "Palms face the body throughout",
            "Feel energy between palms and body",
            "Move slowly with breath",
            "Continue for 10-15 minutes"
        ],
        "tips": "The slower you move, the more energy you feel. Patience reveals qi."
    }
]

async def add_more_practices() -> None:
    """Add more Tai Chi and Qigong practices."""
    print("Adding more Tai Chi and Qigong practices...")
    
    for practice in MORE_TAI_CHI + MORE_QIGONG:
        existing = await db.somatic_practices.find_one({"id": practice["id"]})
        if not existing:
            await db.somatic_practices.insert_one(practice)
            print(f"  Added: {practice['name']} ({practice['category']})")
        else:
            print(f"  Already exists: {practice['name']}")
    
    # Get counts by category
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    counts = await db.somatic_practices.aggregate(pipeline).to_list(100)
    
    print("\n=== Somatic/Movement Practice Counts ===")
    total = 0
    for item in counts:
        cat = item['_id'] or 'Other'
        count = item['count']
        total += count
        print(f"  {cat}: {count}")
    print(f"  TOTAL: {total}")

if __name__ == "__main__":
    asyncio.run(add_more_practices())
