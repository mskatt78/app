"""Add Chair Yoga practices to the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

CHAIR_YOGA_PRACTICES = [
    {
        "id": "chair-cat-cow",
        "name": "Seated Cat-Cow",
        "sanskrit_name": "Seated Marjaryasana-Bitilasana",
        "category": "Chair Yoga",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "A gentle spinal wave performed while seated. Alternately arch and round the spine to release tension and improve flexibility.",
        "benefits": ["Spinal flexibility", "Relieves back tension", "Improves posture", "Calms nervous system"],
        "contraindications": ["Severe spinal injury"],
        "instructions": [
            "Sit toward front of chair, feet flat on floor",
            "Hands rest on knees or thighs",
            "Inhale: Arch spine, lift chest, look slightly up (Cow)",
            "Exhale: Round spine, tuck chin, draw belly in (Cat)",
            "Flow smoothly between positions",
            "Move with your breath for 8-10 rounds"
        ],
        "tips": "Keep movements slow and controlled. Feel each vertebra moving."
    },
    {
        "id": "chair-twist",
        "name": "Seated Spinal Twist",
        "sanskrit_name": "Seated Ardha Matsyendrasana",
        "category": "Chair Yoga",
        "element": "Fire",
        "difficulty": "Beginner",
        "duration_seconds": 90,
        "description": "A gentle twist that wrings out tension from the spine, massages internal organs, and improves digestion.",
        "benefits": ["Spinal mobility", "Aids digestion", "Releases tension", "Energizes"],
        "contraindications": ["Spinal disc issues", "Pregnancy"],
        "instructions": [
            "Sit sideways on chair or facing forward",
            "Feet flat, sitting tall",
            "Inhale: Lengthen spine upward",
            "Exhale: Twist toward the back of chair",
            "Place hands on chair back for support",
            "Hold for 5 breaths, then switch sides",
            "Keep both hips grounded"
        ],
        "tips": "Twist from the belly, not just the shoulders. Lead with the heart."
    },
    {
        "id": "chair-forward-fold",
        "name": "Seated Forward Fold",
        "sanskrit_name": "Seated Uttanasana",
        "category": "Chair Yoga",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "A calming forward fold that stretches the back body and encourages introspection and relaxation.",
        "benefits": ["Stretches back and hamstrings", "Calms mind", "Relieves stress", "Improves circulation to head"],
        "contraindications": ["High blood pressure", "Glaucoma", "Recent abdominal surgery"],
        "instructions": [
            "Sit with feet wider than hips",
            "Inhale: Sit tall, lengthen spine",
            "Exhale: Hinge forward from hips",
            "Let arms hang or rest on floor",
            "Relax head and neck completely",
            "Hold for 5-10 breaths",
            "Rise slowly on an inhale"
        ],
        "tips": "Bend knees if needed. Let gravity do the work."
    },
    {
        "id": "chair-eagle-arms",
        "name": "Seated Eagle Arms",
        "sanskrit_name": "Seated Garudasana Arms",
        "category": "Chair Yoga",
        "element": "Air",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "A shoulder and upper back stretch that releases tension from desk work and opens the space between shoulder blades.",
        "benefits": ["Releases shoulder tension", "Stretches upper back", "Improves focus", "Opens chest"],
        "contraindications": ["Shoulder injury"],
        "instructions": [
            "Sit tall with feet flat",
            "Extend arms forward at shoulder height",
            "Cross right arm under left at elbows",
            "Bend elbows, bring palms toward each other",
            "Lift elbows slightly while dropping shoulders",
            "Hold for 5 breaths",
            "Release and switch arm positions"
        ],
        "tips": "If palms don't touch, hold opposite shoulders instead."
    },
    {
        "id": "chair-pigeon",
        "name": "Seated Pigeon Pose",
        "sanskrit_name": "Seated Eka Pada Rajakapotasana",
        "category": "Chair Yoga",
        "element": "Earth",
        "difficulty": "Beginner",
        "duration_seconds": 90,
        "description": "A hip opener that releases tension in the outer hips and glutes - perfect for those who sit for long periods.",
        "benefits": ["Opens hips", "Relieves sciatic tension", "Stretches glutes", "Reduces lower back pain"],
        "contraindications": ["Knee injury", "Hip replacement"],
        "instructions": [
            "Sit tall, feet flat on floor",
            "Place right ankle on left knee (figure 4)",
            "Flex right foot to protect knee",
            "Sit tall or hinge forward slightly for deeper stretch",
            "Hold for 5-10 breaths",
            "Switch sides",
            "Keep breathing into the hip"
        ],
        "tips": "Press the raised knee gently away from you to deepen the stretch."
    },
    {
        "id": "chair-warrior",
        "name": "Seated Warrior",
        "sanskrit_name": "Seated Virabhadrasana",
        "category": "Chair Yoga",
        "element": "Fire",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "An empowering pose that builds strength and confidence while opening the hips and chest.",
        "benefits": ["Builds strength", "Opens hips", "Boosts confidence", "Energizes"],
        "contraindications": ["Hip injury"],
        "instructions": [
            "Sit sideways on chair, right hip toward back",
            "Right leg bent, foot flat on floor",
            "Extend left leg behind, toes on floor",
            "Inhale: Raise arms overhead",
            "Open chest, gaze forward or up",
            "Hold for 5 breaths",
            "Switch sides"
        ],
        "tips": "Engage your core for stability. Feel powerful and grounded."
    },
    {
        "id": "chair-side-stretch",
        "name": "Seated Side Stretch",
        "sanskrit_name": "Seated Parsva Sukhasana",
        "category": "Chair Yoga",
        "element": "Air",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "A refreshing lateral stretch that opens the side body, intercostal muscles, and improves breathing capacity.",
        "benefits": ["Opens side body", "Improves breathing", "Stretches intercostals", "Releases tension"],
        "contraindications": ["Rib injury"],
        "instructions": [
            "Sit tall, feet flat on floor",
            "Ground left hand on seat or arm rest",
            "Inhale: Raise right arm overhead",
            "Exhale: Lean to the left",
            "Keep both hips grounded",
            "Hold for 5 breaths",
            "Inhale back to center, switch sides"
        ],
        "tips": "Reach up and over, not just sideways. Create space between ribs."
    },
    {
        "id": "chair-neck-rolls",
        "name": "Seated Neck Rolls",
        "sanskrit_name": "Greeva Sanchalana",
        "category": "Chair Yoga",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "Gentle neck movements that release tension from computer work and restore mobility to the cervical spine.",
        "benefits": ["Releases neck tension", "Improves mobility", "Relieves headaches", "Reduces stiffness"],
        "contraindications": ["Cervical spine injury", "Vertigo"],
        "instructions": [
            "Sit tall, shoulders relaxed",
            "Drop chin toward chest",
            "Slowly roll ear toward right shoulder",
            "Continue rolling head back (gently)",
            "Roll ear toward left shoulder",
            "Complete the circle back to center",
            "Repeat 3 times each direction"
        ],
        "tips": "Move slowly and never force. Skip the back portion if it causes discomfort."
    },
    {
        "id": "chair-chest-opener",
        "name": "Seated Chest Opener",
        "sanskrit_name": "Seated Anahatasana",
        "category": "Chair Yoga",
        "element": "Air",
        "difficulty": "Beginner",
        "duration_seconds": 45,
        "description": "A heart-opening stretch that counteracts rounded shoulders and forward head posture from desk work.",
        "benefits": ["Opens chest", "Improves posture", "Counteracts slouching", "Lifts mood"],
        "contraindications": ["Shoulder injury"],
        "instructions": [
            "Sit toward front of chair",
            "Interlace hands behind your back",
            "Straighten arms and draw hands down",
            "Squeeze shoulder blades together",
            "Lift chest toward ceiling",
            "Hold for 5-8 breaths",
            "Release and roll shoulders"
        ],
        "tips": "Keep the back of your neck long. Don't jut the chin forward."
    },
    {
        "id": "chair-ankle-circles",
        "name": "Seated Ankle Circles",
        "category": "Chair Yoga",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "Simple ankle rotations that improve circulation, reduce swelling, and maintain joint mobility.",
        "benefits": ["Improves circulation", "Reduces ankle stiffness", "Prevents swelling", "Good for travel"],
        "contraindications": [],
        "instructions": [
            "Sit tall, lift right foot off floor",
            "Rotate ankle clockwise 10 times",
            "Rotate ankle counter-clockwise 10 times",
            "Point and flex foot 10 times",
            "Switch to left ankle",
            "Repeat the sequence"
        ],
        "tips": "Great for long flights, car rides, or desk work. Do hourly!"
    },
    {
        "id": "chair-tree-pose",
        "name": "Seated Tree Pose",
        "sanskrit_name": "Seated Vrksasana",
        "category": "Chair Yoga",
        "element": "Earth",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "description": "A seated balance pose that improves focus, stability, and connection while being accessible to all levels.",
        "benefits": ["Improves balance", "Builds focus", "Strengthens core", "Grounding"],
        "contraindications": [],
        "instructions": [
            "Sit tall, feet flat on floor",
            "Shift weight to left foot",
            "Place right foot on left ankle or calf",
            "Bring hands to heart center",
            "Find a focal point (drishti)",
            "Hold for 5-10 breaths",
            "Switch sides"
        ],
        "tips": "Use the chair for support if needed. Focus on the feeling of being rooted."
    },
    {
        "id": "chair-relaxation",
        "name": "Seated Relaxation",
        "sanskrit_name": "Seated Savasana",
        "category": "Chair Yoga",
        "element": "Spirit",
        "difficulty": "Beginner",
        "duration_seconds": 180,
        "description": "A closing relaxation practice that allows the body to integrate the benefits of the practice and deeply rest.",
        "benefits": ["Deep relaxation", "Stress relief", "Integration", "Mental clarity"],
        "contraindications": [],
        "instructions": [
            "Sit back in chair, fully supported",
            "Rest hands on thighs, palms up or down",
            "Close eyes or soften gaze",
            "Release all muscular effort",
            "Breathe naturally",
            "Scan body for any remaining tension",
            "Rest for 3-5 minutes",
            "Slowly return awareness to the room"
        ],
        "tips": "This is not sleep - maintain gentle awareness while deeply relaxing."
    }
]

async def add_chair_yoga():
    """Add Chair Yoga to yoga poses collection."""
    print("Adding Chair Yoga practices...")
    
    for practice in CHAIR_YOGA_PRACTICES:
        existing = await db.yoga_poses.find_one({"id": practice["id"]})
        if not existing:
            await db.yoga_poses.insert_one(practice)
            print(f"  Added: {practice['name']}")
        else:
            print(f"  Already exists: {practice['name']}")
    
    count = await db.yoga_poses.count_documents({})
    chair_count = await db.yoga_poses.count_documents({"category": "Chair Yoga"})
    print(f"\nTotal yoga poses now: {count}")
    print(f"Chair Yoga poses: {chair_count}")

if __name__ == "__main__":
    asyncio.run(add_chair_yoga())
