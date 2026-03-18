"""Seed additional content into the database."""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Additional Yoga Poses
YOGA_POSES = [
    {
        "id": "warrior-1",
        "name": "Warrior I",
        "sanskrit_name": "Virabhadrasana I",
        "description": "A powerful standing pose that builds strength, focus, and stability. The raised arms reach toward the sky while the legs ground firmly into the earth.",
        "element": "Fire",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "benefits": ["Strengthens legs and core", "Opens hips and chest", "Builds focus and determination", "Improves balance"],
        "contraindications": ["High blood pressure", "Heart problems", "Shoulder injuries"],
        "chakras": ["Solar Plexus", "Root"],
        "instructions": ["Stand with feet hip-width apart", "Step one foot back 3-4 feet", "Turn back foot 45 degrees", "Bend front knee over ankle", "Raise arms overhead, palms facing", "Gaze upward or forward"],
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
    },
    {
        "id": "warrior-2",
        "name": "Warrior II",
        "sanskrit_name": "Virabhadrasana II",
        "description": "A strong, grounding pose that opens the hips and strengthens the legs while building stamina and concentration.",
        "element": "Fire",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "benefits": ["Strengthens legs, ankles, and feet", "Opens hips and groin", "Improves stamina", "Therapeutic for flat feet"],
        "contraindications": ["Diarrhea", "High blood pressure", "Neck problems"],
        "chakras": ["Sacral", "Solar Plexus"],
        "instructions": ["Stand with feet wide apart", "Turn right foot out 90 degrees", "Turn left foot in slightly", "Extend arms parallel to floor", "Bend right knee over ankle", "Gaze over right fingertips"],
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
    {
        "id": "tree-pose",
        "name": "Tree Pose",
        "sanskrit_name": "Vrksasana",
        "description": "A balancing pose that cultivates steadiness, poise, and calm. Like a tree, you root down to rise up.",
        "element": "Earth",
        "difficulty": "Beginner",
        "duration_seconds": 45,
        "benefits": ["Improves balance and stability", "Strengthens legs and core", "Opens hips", "Calms the mind"],
        "contraindications": ["Headache", "Insomnia", "Low blood pressure"],
        "chakras": ["Root", "Crown"],
        "instructions": ["Stand on one leg", "Place other foot on inner thigh or calf", "Never on the knee", "Bring hands to heart or raise overhead", "Find a focal point", "Breathe steadily"],
        "image_url": "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800"
    },
    {
        "id": "downward-dog",
        "name": "Downward-Facing Dog",
        "sanskrit_name": "Adho Mukha Svanasana",
        "description": "A foundational pose that stretches and strengthens the entire body. It calms the brain and helps relieve stress.",
        "element": "Air",
        "difficulty": "Beginner",
        "duration_seconds": 60,
        "benefits": ["Stretches hamstrings and calves", "Strengthens arms and legs", "Energizes the body", "Calms the nervous system"],
        "contraindications": ["Carpal tunnel syndrome", "Late-term pregnancy", "High blood pressure"],
        "chakras": ["Third Eye", "Heart"],
        "instructions": ["Start on hands and knees", "Lift hips up and back", "Straighten arms and legs", "Press heels toward floor", "Relax head and neck", "Spread fingers wide"],
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
    },
    {
        "id": "childs-pose",
        "name": "Child's Pose",
        "sanskrit_name": "Balasana",
        "description": "A gentle resting pose that promotes relaxation and introspection. It gently stretches the hips, thighs, and ankles.",
        "element": "Water",
        "difficulty": "Beginner",
        "duration_seconds": 120,
        "benefits": ["Gently stretches hips and thighs", "Calms the brain", "Relieves stress and fatigue", "Rests the body"],
        "contraindications": ["Knee injury", "Pregnancy", "Diarrhea"],
        "chakras": ["Third Eye", "Root"],
        "instructions": ["Kneel on the floor", "Bring big toes together", "Sit back on heels", "Fold forward over thighs", "Extend arms forward or alongside body", "Rest forehead on mat"],
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
    {
        "id": "cobra-pose",
        "name": "Cobra Pose",
        "sanskrit_name": "Bhujangasana",
        "description": "A gentle backbend that opens the heart and strengthens the spine. It awakens kundalini energy at the base of the spine.",
        "element": "Fire",
        "difficulty": "Beginner",
        "duration_seconds": 30,
        "benefits": ["Strengthens spine", "Opens chest and heart", "Stretches abdomen", "Awakens kundalini"],
        "contraindications": ["Back injury", "Carpal tunnel syndrome", "Pregnancy"],
        "chakras": ["Heart", "Solar Plexus"],
        "instructions": ["Lie face down", "Place hands under shoulders", "Press into hands, lift chest", "Keep elbows close to body", "Draw shoulders back", "Gaze slightly upward"],
        "image_url": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800"
    }
]

# Additional Breathwork Sessions
BREATHWORK_SESSIONS = [
    {
        "id": "ocean-breath",
        "name": "Ocean Breath",
        "sanskrit_name": "Ujjayi Pranayama",
        "description": "A soothing breath technique that sounds like ocean waves, calming the mind and warming the body.",
        "element": "Water",
        "duration_minutes": 10,
        "benefits": ["Calms the nervous system", "Improves focus", "Generates internal heat", "Soothes anxiety"],
        "contraindications": ["Low blood pressure"],
        "instructions": ["Sit comfortably", "Inhale through the nose", "Slightly constrict the back of throat", "Exhale slowly with ocean sound", "Continue for 5-10 minutes"],
        "pattern": {"inhale": 4, "hold": 0, "exhale": 6, "hold_out": 0}
    },
    {
        "id": "alternate-nostril",
        "name": "Alternate Nostril Breathing",
        "sanskrit_name": "Nadi Shodhana",
        "description": "A balancing breath that harmonizes the left and right hemispheres of the brain and balances masculine and feminine energies.",
        "element": "Air",
        "duration_minutes": 15,
        "benefits": ["Balances nervous system", "Clears energy channels", "Reduces stress", "Improves concentration"],
        "contraindications": ["Cold or nasal congestion"],
        "instructions": ["Sit comfortably", "Use right hand in Vishnu mudra", "Close right nostril, inhale left", "Close both, hold briefly", "Close left, exhale right", "Inhale right, exhale left", "This is one round"],
        "pattern": {"inhale": 4, "hold": 4, "exhale": 4, "hold_out": 0}
    },
    {
        "id": "breath-of-fire",
        "name": "Breath of Fire",
        "sanskrit_name": "Kapalabhati",
        "description": "An energizing breath that purifies the body and awakens dormant energy. Builds heat and mental clarity.",
        "element": "Fire",
        "duration_minutes": 5,
        "benefits": ["Energizes the body", "Clears the mind", "Strengthens core", "Detoxifies"],
        "contraindications": ["Pregnancy", "High blood pressure", "Heart disease", "Epilepsy"],
        "instructions": ["Sit tall with spine straight", "Take a deep breath in", "Exhale sharply through nose", "Let inhale happen naturally", "Pump the belly with each exhale", "Start slow, build speed"],
        "pattern": {"inhale": 1, "hold": 0, "exhale": 1, "hold_out": 0}
    },
    {
        "id": "box-breathing",
        "name": "Box Breathing",
        "sanskrit_name": "Sama Vritti",
        "description": "A powerful technique used by Navy SEALs for stress relief and mental clarity. Equal parts create stability.",
        "element": "Earth",
        "duration_minutes": 10,
        "benefits": ["Reduces stress", "Improves focus", "Regulates nervous system", "Enhances sleep"],
        "contraindications": [],
        "instructions": ["Sit comfortably", "Inhale for 4 counts", "Hold for 4 counts", "Exhale for 4 counts", "Hold empty for 4 counts", "Repeat 4-8 cycles"],
        "pattern": {"inhale": 4, "hold": 4, "exhale": 4, "hold_out": 4}
    },
    {
        "id": "lions-breath",
        "name": "Lion's Breath",
        "sanskrit_name": "Simhasana",
        "description": "A powerful release breath that clears tension from the face, throat, and chest. Releases pent-up emotions.",
        "element": "Fire",
        "duration_minutes": 5,
        "benefits": ["Relieves tension", "Opens throat chakra", "Releases emotions", "Energizes"],
        "contraindications": ["Recent facial surgery"],
        "instructions": ["Kneel or sit comfortably", "Inhale deeply through nose", "Open mouth wide, stick out tongue", "Exhale with 'ha' sound", "Roll eyes upward", "Repeat 3-5 times"],
        "pattern": {"inhale": 3, "hold": 0, "exhale": 5, "hold_out": 0}
    }
]

# Additional Shamanic Ceremonies
SHAMANIC_CEREMONIES = [
    {
        "id": "power-animal-journey",
        "name": "Power Animal Journey",
        "description": "A guided shamanic journey to meet and connect with your power animal - a spiritual ally that offers protection, guidance, and wisdom.",
        "element": "Spirit",
        "duration_minutes": 30,
        "category": "Journey Work",
        "benefits": ["Connect with spiritual guidance", "Discover hidden strengths", "Receive intuitive messages", "Build relationship with spirit ally"],
        "preparation": ["Create sacred space", "Set clear intention", "Have journal ready", "Ensure you won't be disturbed"],
        "steps": ["Lie down comfortably", "Close eyes and relax", "Visualize entering the earth", "Follow a tunnel or path downward", "Enter the lower world", "Call for your power animal", "Observe which animal appears", "Spend time with your animal", "Ask for a message or gift", "Thank your animal", "Return the way you came"],
        "integration": "Journal your experience. Notice synchronicities with this animal in daily life.",
        "image_url": "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800"
    },
    {
        "id": "soul-retrieval",
        "name": "Soul Retrieval",
        "description": "A powerful healing ceremony to recover soul fragments lost through trauma, shock, or difficult life experiences.",
        "element": "Spirit",
        "duration_minutes": 45,
        "category": "Healing",
        "benefits": ["Reclaim lost vitality", "Heal past trauma", "Restore wholeness", "Increase personal power"],
        "preparation": ["Deep preparation needed", "Work with experienced practitioner recommended", "Create very safe space", "Have support person present"],
        "steps": ["Enter deep trance state", "Journey to find lost soul parts", "Identify when/where soul loss occurred", "Retrieve the soul fragment", "Blow soul piece back into body", "Welcome the part home", "Rest and integrate"],
        "integration": "Take several days to rest. Be gentle with yourself. Journal insights.",
        "image_url": "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800"
    },
    {
        "id": "fire-ceremony",
        "name": "Fire Ceremony",
        "description": "A transformative ceremony using the sacred element of fire to release what no longer serves and call in new intentions.",
        "element": "Fire",
        "duration_minutes": 60,
        "category": "Transformation",
        "benefits": ["Release old patterns", "Transform stuck energy", "Set powerful intentions", "Connect with fire element"],
        "preparation": ["Gather wood and kindling", "Create firepit or use candle", "Write what you're releasing on paper", "Write intentions on separate paper"],
        "steps": ["Light the fire with reverence", "Call in the directions and spirits", "Feed the fire with gratitude", "Burn your release papers", "Witness the transformation", "Burn intention papers", "Sit in meditation with flames", "Thank the fire", "Let it burn down naturally"],
        "integration": "Watch for signs and synchronicities. Stay hydrated. Rest well.",
        "image_url": "https://images.unsplash.com/photo-1475738972911-5b44ce984c42?w=800"
    },
    {
        "id": "ancestor-healing",
        "name": "Ancestral Healing",
        "description": "Connect with your lineage to heal generational patterns and receive ancestral wisdom and blessings.",
        "element": "Earth",
        "duration_minutes": 40,
        "category": "Healing",
        "benefits": ["Heal family patterns", "Connect with ancestral wisdom", "Clear inherited trauma", "Receive blessings"],
        "preparation": ["Create ancestor altar if possible", "Gather photos or items from ancestors", "Offerings: water, food, flowers", "Know some family history"],
        "steps": ["Create sacred space", "Light candle for ancestors", "Invite loving ancestors forward", "Ask for healing of family patterns", "Listen for messages", "Offer gratitude and gifts", "Ask for their blessing", "Close the ceremony"],
        "integration": "Continue feeding ancestors regularly. Notice family pattern shifts.",
        "image_url": "https://images.unsplash.com/photo-1508193638397-1c4234db14d9?w=800"
    },
    {
        "id": "drum-journey",
        "name": "Drum Journey",
        "description": "Use the rhythmic beat of the drum to enter altered states of consciousness and journey between worlds.",
        "element": "Spirit",
        "duration_minutes": 25,
        "category": "Journey Work",
        "benefits": ["Enter trance states", "Journey to other realms", "Receive guidance", "Connect with helping spirits"],
        "preparation": ["Have drum or drumming recording", "Set clear intention", "Create sacred space", "Lie down comfortably"],
        "steps": ["State your intention aloud", "Begin drumming (4-7 beats/second)", "Let the rhythm carry you", "Notice what arises", "Follow the journey", "When drumming changes, return", "Ground yourself", "Journal experience"],
        "integration": "Draw or write your journey. Act on any guidance received.",
        "image_url": "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?w=800"
    }
]

# Additional Elemental Practices
ELEMENTAL_PRACTICES = [
    {
        "id": "earth-grounding",
        "name": "Earth Connection",
        "description": "A powerful practice to ground your energy and connect with the stabilizing force of Mother Earth.",
        "element": "Earth",
        "duration_minutes": 15,
        "category": "Grounding",
        "benefits": ["Ground scattered energy", "Increase stability", "Connect with earth element", "Reduce anxiety"],
        "instructions": ["Stand or sit on bare earth", "Close your eyes", "Feel your connection to the ground", "Visualize roots growing from your feet", "Send roots deep into earth", "Draw up earth energy", "Feel stable and supported"],
        "affirmation": "I am grounded, stable, and supported by the Earth.",
        "image_url": "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800"
    },
    {
        "id": "water-flow",
        "name": "Water Flow Meditation",
        "description": "Connect with the element of water to enhance emotional fluidity, intuition, and the ability to go with the flow.",
        "element": "Water",
        "duration_minutes": 20,
        "category": "Emotional Healing",
        "benefits": ["Enhance emotional flow", "Increase intuition", "Release stuck emotions", "Improve adaptability"],
        "instructions": ["Sit near water if possible", "Close your eyes", "Imagine water flowing through you", "Let it wash away stagnation", "Feel emotions flowing freely", "Become like water - adaptable", "Rest in this fluid state"],
        "affirmation": "I flow with life like water, adapting to all circumstances with grace.",
        "image_url": "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800"
    },
    {
        "id": "fire-activation",
        "name": "Fire Activation",
        "description": "Awaken your inner fire for transformation, passion, and the courage to take action on your dreams.",
        "element": "Fire",
        "duration_minutes": 15,
        "category": "Empowerment",
        "benefits": ["Increase energy and vitality", "Build courage", "Transform obstacles", "Ignite passion"],
        "instructions": ["Stand in a power pose", "Take deep energizing breaths", "Visualize a flame in your solar plexus", "Feel it growing brighter", "Let it burn away fear and doubt", "Feel your personal power rising", "Commit to taking action"],
        "affirmation": "My inner fire burns bright, giving me courage and power to transform my life.",
        "image_url": "https://images.unsplash.com/photo-1475738972911-5b44ce984c42?w=800"
    },
    {
        "id": "air-clearing",
        "name": "Air Clearing Ceremony",
        "description": "Use the element of air to clear mental fog, gain clarity, and invite fresh perspectives and new ideas.",
        "element": "Air",
        "duration_minutes": 15,
        "category": "Mental Clarity",
        "benefits": ["Clear mental fog", "Gain new perspectives", "Enhance communication", "Invite inspiration"],
        "instructions": ["Go outside or open windows", "Face the wind if possible", "Take deep cleansing breaths", "Imagine wind clearing your mind", "Release stale thoughts", "Invite fresh ideas and clarity", "Feel mentally refreshed"],
        "affirmation": "My mind is clear and open to new ideas and inspiration.",
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    },
    {
        "id": "spirit-connection",
        "name": "Spirit Connection",
        "description": "Connect with the element of Spirit - the unifying force that connects all elements and all beings.",
        "element": "Spirit",
        "duration_minutes": 25,
        "category": "Spiritual Connection",
        "benefits": ["Connect with higher self", "Experience unity", "Access spiritual guidance", "Transcend limitations"],
        "instructions": ["Find a quiet sacred space", "Light a candle", "Center yourself", "Call in all four elements", "Feel them balancing within you", "Rise above to pure spirit", "Experience connection to all", "Rest in this expanded state", "Return with gratitude"],
        "affirmation": "I am one with Spirit, connected to all that is.",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    }
]

# Additional Creative Processes
CREATIVE_PROCESSES = [
    {
        "id": "intuitive-painting",
        "name": "Intuitive Painting",
        "description": "A sacred creative practice of painting from the soul, allowing colors and forms to emerge without judgment or planning.",
        "element": "Spirit",
        "duration_minutes": 45,
        "category": "Visual Arts",
        "benefits": ["Access intuition", "Express unconscious feelings", "Release perfectionism", "Experience flow state"],
        "materials": ["Paper or canvas", "Paints (any kind)", "Brushes", "Water cup"],
        "instructions": ["Set up your space", "Take three deep breaths", "Choose a color that calls to you", "Begin making marks without thinking", "Let your hand move freely", "Add colors as guided", "Don't judge or plan", "Stop when it feels complete"],
        "spiritual_purpose": "Painting becomes prayer, a direct communication with the divine creative force.",
        "image_url": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800"
    },
    {
        "id": "sacred-writing",
        "name": "Sacred Writing",
        "description": "A channeled writing practice that allows wisdom from your higher self or spirit guides to flow onto the page.",
        "element": "Air",
        "duration_minutes": 30,
        "category": "Writing",
        "benefits": ["Receive guidance", "Access inner wisdom", "Clear mental blocks", "Document spiritual insights"],
        "materials": ["Journal or paper", "Pen", "Quiet space"],
        "instructions": ["Create sacred space", "Set an intention or question", "Close eyes and breathe deeply", "Open to receiving", "Begin writing without thinking", "Let words flow freely", "Don't edit or judge", "Review afterward for messages"],
        "spiritual_purpose": "Writing becomes a channel for divine communication and self-discovery.",
        "image_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800"
    },
    {
        "id": "movement-prayer",
        "name": "Movement Prayer",
        "description": "Free-form sacred movement that allows the body to become a prayer, expressing what words cannot.",
        "element": "Fire",
        "duration_minutes": 20,
        "category": "Movement",
        "benefits": ["Release stuck energy", "Embody prayer", "Express emotions", "Connect body and spirit"],
        "materials": ["Open space", "Optional: music"],
        "instructions": ["Stand in a clear space", "Set an intention", "Begin with breath", "Let your body move as it wants", "No choreography, just feeling", "Let movement be your prayer", "Express gratitude, sorrow, joy", "End in stillness"],
        "spiritual_purpose": "The body becomes a vessel for spirit, dancing the prayer that cannot be spoken.",
        "image_url": "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800"
    },
    {
        "id": "nature-mandala",
        "name": "Nature Mandala",
        "description": "Create sacred circular art using natural materials found outdoors, connecting with earth's beauty and impermanence.",
        "element": "Earth",
        "duration_minutes": 40,
        "category": "Earth Art",
        "benefits": ["Connect with nature", "Practice presence", "Experience impermanence", "Create beauty"],
        "materials": ["Natural items: stones, leaves, flowers, sticks", "Outdoor space"],
        "instructions": ["Find a peaceful outdoor spot", "Gather natural materials mindfully", "Begin at the center", "Work outward in circles", "Place items with intention", "Let it be imperfect", "Photograph if desired", "Leave it as an offering"],
        "spiritual_purpose": "Creating beauty as an offering to the earth, practicing non-attachment to outcomes.",
        "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
    },
    {
        "id": "sound-healing-voice",
        "name": "Voice as Medicine",
        "description": "Use your own voice as a healing instrument through toning, chanting, and free vocal expression.",
        "element": "Water",
        "duration_minutes": 25,
        "category": "Sound Healing",
        "benefits": ["Release throat chakra blocks", "Self-healing through sound", "Express authentic voice", "Shift energy"],
        "materials": ["Private space where you can be loud"],
        "instructions": ["Sit or stand comfortably", "Take deep breaths", "Begin with humming", "Let sounds emerge naturally", "Tone vowel sounds: Ah, Oh, Oo", "Let your voice go where it wants", "Make sounds of release", "End with gentle humming"],
        "spiritual_purpose": "Your voice is your unique gift. Using it freely heals and expresses your soul.",
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800"
    }
]


async def seed_content():
    """Seed all additional content into the database."""
    print("Starting content seeding...")
    
    # Seed Yoga Poses
    for pose in YOGA_POSES:
        existing = await db.yoga_poses.find_one({"id": pose["id"]})
        if not existing:
            await db.yoga_poses.insert_one(pose)
            print(f"  Added yoga pose: {pose['name']}")
        else:
            print(f"  Yoga pose already exists: {pose['name']}")
    
    # Seed Breathwork Sessions
    for session in BREATHWORK_SESSIONS:
        existing = await db.breathwork_sessions.find_one({"id": session["id"]})
        if not existing:
            await db.breathwork_sessions.insert_one(session)
            print(f"  Added breathwork: {session['name']}")
        else:
            print(f"  Breathwork already exists: {session['name']}")
    
    # Seed Shamanic Ceremonies
    for ceremony in SHAMANIC_CEREMONIES:
        existing = await db.shamanic_practices.find_one({"id": ceremony["id"]})
        if not existing:
            await db.shamanic_practices.insert_one(ceremony)
            print(f"  Added shamanic ceremony: {ceremony['name']}")
        else:
            print(f"  Shamanic ceremony already exists: {ceremony['name']}")
    
    # Seed Elemental Practices
    for practice in ELEMENTAL_PRACTICES:
        existing = await db.elemental_practices.find_one({"id": practice["id"]})
        if not existing:
            await db.elemental_practices.insert_one(practice)
            print(f"  Added elemental practice: {practice['name']}")
        else:
            print(f"  Elemental practice already exists: {practice['name']}")
    
    # Seed Creative Processes
    for process in CREATIVE_PROCESSES:
        existing = await db.creative_processes.find_one({"id": process["id"]})
        if not existing:
            await db.creative_processes.insert_one(process)
            print(f"  Added creative process: {process['name']}")
        else:
            print(f"  Creative process already exists: {process['name']}")
    
    print("\nContent seeding complete!")
    
    # Print counts
    yoga_count = await db.yoga_poses.count_documents({})
    breathwork_count = await db.breathwork_sessions.count_documents({})
    shamanic_count = await db.shamanic_practices.count_documents({})
    elemental_count = await db.elemental_practices.count_documents({})
    creative_count = await db.creative_processes.count_documents({})
    
    print(f"\nFinal counts:")
    print(f"  Yoga poses: {yoga_count}")
    print(f"  Breathwork sessions: {breathwork_count}")
    print(f"  Shamanic ceremonies: {shamanic_count}")
    print(f"  Elemental practices: {elemental_count}")
    print(f"  Creative processes: {creative_count}")


if __name__ == "__main__":
    asyncio.run(seed_content())
