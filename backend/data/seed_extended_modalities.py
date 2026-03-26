"""
Extended seed data for 13-chakra system, Somatic Yoga, Feminine & Masculine Embodiment.
Run with: python -c "import asyncio; from data.seed_extended_modalities import seed_all; asyncio.run(seed_all())"
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Image URLs - existing and new
IMAGES = {
    # Chakra images we have
    "chakra_root": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/4f789faa21b0358abf4005f7e2e896ba04f2363b361027de76adaa38d0517871.png",
    "chakra_sacral": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/0bddcef7f53f8fb7cd1e021991ea81b8b777170abbf0841bf1dd9f5118b1035c.png",
    "chakra_solar": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/b1d6a77f129e8b2a5d8d663ee0088b0bf0896ca366f4e477ba3d32ae38e961ab.png",
    "chakra_heart": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/2fb48658f784573b3260e3fff7138b26f6245a9867b447b6002f5a1ae300cec2.png",
    "chakra_throat": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/f75c5a5bf1f4e85f0d123691ee2af9b9fe161c76674f5dba18358efa5a9fc129.png",
    "chakra_third_eye": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/f23340cca996c7aa660755019810098457b047a7d0d1097be248df25d29684a4.png",
    "chakra_all": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/ace2a076d232e17f83130e3de840a429f08cdd696d0e20580af31a64676b9129.png",
    # Somatic/Movement
    "somatic_yoga": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/332ca1a29950e4cecb210a3dc9444579511b230da8420cde70731198f4729a3d.png",
    "freeform_dance": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/bfa160f5c1406c20b01733894e46ad000bdda5bc9011a4095489ab158ff91537.png",
    "quantum_healing": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/8ed3c5244187116ac15623170bf5cfb0722e815611a2036476849a7f081021f9.png",
}

# Extended 13 Chakra System - Adding 6 new chakras to existing 7
EXTENDED_CHAKRAS = [
    {
        "id": "earth-star-chakra-cleanse",
        "name": "Earth Star Chakra Cleansing",
        "chakra": "Earth Star",
        "sanskrit_name": "Vasundhara",
        "description": "Ground into the crystalline core of Mother Earth by activating the Earth Star chakra 12 inches below your feet—your anchor to Gaia consciousness, ancestral lineage, and planetary healing.",
        "image_url": IMAGES["chakra_root"],  # Will update with unique image
        "duration_minutes": 20,
        "color": "Magenta/Brown",
        "element": "Earth Core",
        "location": "12 inches below feet",
        "order": 0,
        "cleansing_guide": """1. Stand barefoot on the earth if possible. Otherwise, visualize roots from your feet.

2. Breathe Down: With each exhale, send your breath down through your feet, 12 inches into the earth.

3. Earth Star Activation: Visualize a spinning disc of deep magenta and brown light below your feet. See it connecting to the crystalline grid of the planet.

4. Ancestral Connection: Call upon your ancestors and the spirits of the land. Feel their support rising up through your Earth Star.

5. Gaia Breath: Inhale the healing energy of Mother Earth up through your Earth Star, through your feet, filling your entire body.

6. Grounding Cord: Visualize a cord of light extending from your Earth Star down to the molten core of the planet.

7. Affirmation (repeat 7 times): "I am deeply rooted in Earth. I am supported by my ancestors. I belong to this planet."

8. Planetary Healing: Send love and gratitude down through your Earth Star to Gaia. You are part of her healing.

9. Seal: Feel the stable, grounding energy of your activated Earth Star anchoring you to the planet.""",
        "signs_of_imbalance": "Feeling ungrounded, disconnected from nature, no sense of belonging, ancestral trauma, environmental anxiety, difficulty manifesting in physical reality.",
        "affirmations": "I am deeply rooted in Mother Earth.\nMy ancestors support and guide me.\nI belong to this planet.\nI am safe in my physical body.\nI am connected to Gaia consciousness.",
        "crystals": "Black Tourmaline, Smoky Quartz, Hematite, Black Obsidian, Red Jasper, Shungite",
        "benefits": ["Deep grounding", "Ancestral healing", "Planetary connection", "Physical manifestation", "Environmental harmony"]
    },
    {
        "id": "higher-heart-chakra-cleanse",
        "name": "Higher Heart Chakra Cleansing",
        "chakra": "Higher Heart",
        "sanskrit_name": "Thymus/Ananda Kanda",
        "description": "Activate the seat of the soul and unconditional love between the heart and throat—the Higher Heart chakra connects you to divine love, soul purpose, and the ability to love without conditions.",
        "image_url": IMAGES["chakra_heart"],  # Teal variant
        "duration_minutes": 18,
        "color": "Turquoise/Aqua/Pink",
        "element": "Higher Air/Ether",
        "location": "Between heart and throat (thymus)",
        "order": 5,
        "cleansing_guide": """1. Place your hand on your upper chest, between heart and throat. This is your thymus gland area.

2. Tap Gently: Tap this area gently 20 times while breathing deeply. This physically activates the thymus and Higher Heart.

3. Turquoise-Pink Light: Visualize a beautiful swirl of turquoise and soft pink light at this point. This is the color of unconditional love.

4. Soul Connection: This chakra holds your soul's blueprint. Ask to remember your soul purpose and highest path.

5. Forgiveness Expansion: Extend the heart's forgiveness work to a soul level. Forgive across all lifetimes.

6. Affirmation (repeat 7 times): "I am unconditional love. I remember my soul purpose. I love without attachment."

7. Sound: Tone "AH-YAM" (bridge between heart YAM and throat HAM). Feel the vibration in your upper chest.

8. Divine Love Channel: Visualize this chakra as a gateway through which divine love flows into your heart and out to the world.

9. Seal: See a spinning turquoise-pink lotus at your Higher Heart, radiating soul-level love.""",
        "signs_of_imbalance": "Conditional love, soul disconnection, inability to forgive deeply, feeling purposeless, blocked intuitive heart, fear of expressing love.",
        "affirmations": "I am unconditional love.\nMy soul purpose is clear.\nI love without attachment or conditions.\nDivine love flows through me.\nI forgive completely across all time.",
        "crystals": "Aquamarine, Turquoise, Pink Tourmaline, Amazonite, Chrysocolla, Larimar",
        "benefits": ["Unconditional love", "Soul purpose clarity", "Deep forgiveness", "Divine connection", "Compassionate communication"]
    },
    {
        "id": "causal-chakra-cleanse",
        "name": "Causal Chakra Cleansing",
        "chakra": "Causal",
        "sanskrit_name": "Causal/Moon Center",
        "description": "Awaken the divine feminine energy center at the back of your head—the Causal chakra connects you to lunar wisdom, past life memories, and the akashic records of your soul's journey.",
        "image_url": IMAGES["chakra_all"],  # Will update
        "duration_minutes": 20,
        "color": "Soft Pink/White/Silver",
        "element": "Divine Feminine/Moon",
        "location": "Back of head, base of skull",
        "order": 9,
        "cleansing_guide": """1. Sit comfortably. Gently place your hand on the back of your head where skull meets neck (the "moon center").

2. Lunar Breathing: Breathe silver-white light in through your crown, letting it pool at the Causal chakra.

3. Past Life Portal: This chakra holds access to past life memories. Ask to receive only what serves your highest good.

4. Divine Feminine Activation: Whether you're male or female, this chakra balances your inner feminine—receptivity, intuition, nurturing.

5. Akashic Access: Visualize a doorway at the back of your head. Behind it are the records of your soul. You may receive flashes of insight.

6. Moon Connection: Feel the energy of the moon (regardless of phase) connecting to your Causal chakra. You are attuned to lunar cycles.

7. Affirmation (repeat 7 times): "I embrace my divine feminine. I access the wisdom of my soul's journey. I am guided by lunar light."

8. Release: Let go of any past life karma or feminine wounds that are ready to clear. See them dissolving in silver light.

9. Seal: Visualize a soft pink and silver lotus spinning gently at the back of your head.""",
        "signs_of_imbalance": "Disconnection from intuition, fear of the feminine, past life trauma bleeding through, difficulty receiving, lunar cycle disruption, blocked memories.",
        "affirmations": "I honor my divine feminine nature.\nI access the wisdom of all my lifetimes.\nI am receptive to guidance.\nI flow with lunar cycles.\nMy intuition is clear and strong.",
        "crystals": "Moonstone, Selenite, Pearl, Pink Kunzite, White Calcite, Petalite",
        "benefits": ["Divine feminine balance", "Past life healing", "Intuition enhancement", "Lunar attunement", "Akashic access"]
    },
    {
        "id": "soul-star-chakra-cleanse",
        "name": "Soul Star Chakra Cleansing",
        "chakra": "Soul Star",
        "sanskrit_name": "Sutara/Seat of the Soul",
        "description": "Connect to your Higher Self and soul's light 6 inches above your crown—the Soul Star chakra is where your individual soul meets universal consciousness and downloads spiritual gifts.",
        "image_url": IMAGES["chakra_all"],  # Will update
        "duration_minutes": 20,
        "color": "White/Magenta/Gold",
        "element": "Soul Light",
        "location": "6 inches above crown",
        "order": 10,
        "cleansing_guide": """1. Sit in meditation. Visualize your crown chakra open and clear.

2. Extend Awareness Up: Move your consciousness 6 inches above your head. Feel or sense a sphere of brilliant white-gold light.

3. Higher Self Connection: This is the seat of your Higher Self. Ask your Higher Self to make its presence known.

4. Soul Light Download: Visualize pure white light with hints of magenta streaming down from your Soul Star into your crown, filling your entire being.

5. Spiritual Gifts: This chakra is where your spiritual gifts are stored. Ask what gifts are ready to activate in this lifetime.

6. Past Life Skills: Abilities from past lives can download through this chakra. Be open to receive ancient wisdom and skills.

7. Affirmation (repeat 7 times): "I am connected to my Higher Self. I receive my spiritual gifts. I am a being of light."

8. Karmic Clearing: Ask for any karmic cords or contracts that no longer serve you to be lovingly released at the soul level.

9. Seal: See your Soul Star glowing brilliant white-gold, a beacon of your soul's eternal light.""",
        "signs_of_imbalance": "Spiritual disconnection, feeling purposeless, blocked spiritual gifts, difficulty connecting with Higher Self, karmic loops, spiritual bypassing.",
        "affirmations": "I am connected to my Higher Self.\nMy spiritual gifts are activated.\nI am eternal soul consciousness.\nI release all karma that no longer serves.\nI receive divine guidance clearly.",
        "crystals": "Clear Quartz, Selenite, White Topaz, Danburite, Phenacite, Herkimer Diamond",
        "benefits": ["Higher Self connection", "Spiritual gift activation", "Karmic healing", "Soul purpose alignment", "Divine downloads"]
    },
    {
        "id": "stellar-gateway-chakra-cleanse",
        "name": "Stellar Gateway Chakra Cleansing",
        "chakra": "Stellar Gateway",
        "sanskrit_name": "Stellar Gateway",
        "description": "Open the portal to your galactic origins 12 inches above your crown—the Stellar Gateway connects you to star lineages, galactic councils, and cosmic consciousness beyond Earth.",
        "image_url": IMAGES["quantum_healing"],
        "duration_minutes": 25,
        "color": "Gold/Silver/Opalescent",
        "element": "Galactic/Stellar",
        "location": "12 inches above crown",
        "order": 11,
        "cleansing_guide": """1. Begin with crown and soul star already activated. Extend your awareness further up, 12 inches above your head.

2. Galactic Connection: Sense or visualize a gateway opening to the stars. You may see, feel, or know your connection to specific star systems.

3. Star Lineage: Ask to connect with your star family or galactic origins (Pleiadian, Sirian, Arcturian, Andromedan, or others). Trust what comes.

4. Cosmic Downloads: Through this chakra, you can receive transmissions from galactic beings and councils of light. Be receptive.

5. Gold-Silver Light: Visualize brilliant gold and silver light spiraling down from the stars, through your Stellar Gateway, into your body.

6. Multidimensional Awareness: This chakra expands consciousness beyond 3D. You may experience expanded perceptions.

7. Affirmation (repeat 7 times): "I am a galactic being of light. I connect with my star lineage. I receive cosmic wisdom."

8. Star Mission: Ask for clarity on your mission here on Earth as a being of cosmic origins.

9. Seal: See your Stellar Gateway as a shimmering gold-silver portal, connecting you to the cosmos while remaining grounded.""",
        "signs_of_imbalance": "Feeling like you don't belong on Earth, cosmic homesickness, disconnection from star origins, blocked galactic guidance, difficulty integrating spiritual and physical.",
        "affirmations": "I am a galactic being of light.\nI connect with my star family.\nI receive cosmic transmissions.\nMy star mission is clear.\nI bridge heaven and Earth.",
        "crystals": "Moldavite, Tektite, Celestite, Star Sapphire, Labradorite, Nuummite",
        "benefits": ["Star lineage connection", "Galactic downloads", "Cosmic consciousness", "Multidimensional awareness", "Star mission clarity"]
    },
    {
        "id": "universal-gateway-chakra-cleanse",
        "name": "Universal Gateway Chakra Cleansing",
        "chakra": "Universal Gateway",
        "sanskrit_name": "Universal/Divine Gateway",
        "description": "Touch the infinite at 18 inches above your crown—the Universal Gateway is your direct connection to Source, the unified field, and the consciousness that underlies all existence.",
        "image_url": IMAGES["quantum_healing"],
        "duration_minutes": 25,
        "color": "Rainbow/Diamond/Pure Light",
        "element": "Source/Infinite",
        "location": "18 inches above crown",
        "order": 12,
        "cleansing_guide": """1. This is the highest transpersonal chakra. Approach with reverence. Ground fully first.

2. Complete Column of Light: Visualize all lower chakras aligned and glowing—from Earth Star up through Crown, Soul Star, and Stellar Gateway.

3. Extend to Source: Move your consciousness 18 inches above your head. Here is the gateway to the Infinite.

4. Pure Presence: There is nothing to do here. Simply be. You are touching Source consciousness.

5. Diamond Light: If you can perceive it, see pure diamond-rainbow light that contains all colors and is beyond color.

6. Unity Consciousness: Experience yourself as not separate from Source. You are a wave in the infinite ocean.

7. Affirmation (whisper or think): "I am one with All That Is. I am Source experiencing itself. I am infinite."

8. Receive Grace: Any healing, activation, or transmission that Source wishes to provide flows freely. Simply receive.

9. Return Gently: Slowly bring awareness back down through each chakra. Ground into Earth Star. You have touched the infinite and returned.""",
        "signs_of_imbalance": "Spiritual ego, disconnection from Source, materialism, existential emptiness, inability to surrender, spiritual seeking without finding.",
        "affirmations": "I am one with Source.\nI am infinite consciousness.\nI surrender to divine will.\nI am the universe experiencing itself.\nAll is one.",
        "crystals": "Diamond, Clear Quartz (cathedral), Phenacite, Azeztulite, Herderite, Brookite",
        "benefits": ["Source connection", "Unity consciousness", "Divine grace", "Infinite peace", "Spiritual completion"]
    },
]

# Somatic Yoga Practices (separate collection)
SOMATIC_YOGA_DATA = [
    {
        "id": "trauma-release-somatic",
        "name": "Trauma Release Somatic Flow",
        "style": "Trauma-Informed",
        "description": "Gentle, body-centered practice for releasing stored trauma and tension. Combines slow movement with interoceptive awareness to safely process held emotions.",
        "image_url": IMAGES["somatic_yoga"],
        "duration_minutes": 30,
        "intensity": "Gentle",
        "practice_guide": """1. Begin lying down on your back, knees bent, feet flat.

2. Body Scan: Starting at your feet, slowly scan up through your body. Notice any areas of tension without trying to change them.

3. Breath Awareness: Let your natural breath move your belly. No forcing. Just observing.

4. Micro-Movements: Begin tiny, almost imperceptible movements. Rock your knees gently side to side.

5. Follow the Body: If your body wants to stretch, curl, or move in any way—follow it. Trust the innate wisdom.

6. Pandiculation: Consciously tense an area (like shoulders), hold briefly, then slowly release. Feel the difference.

7. Emotional Allowing: If emotions arise, breathe with them. They are releasing. You are safe.

8. Integration: Rest in stillness for 5-10 minutes. Let the nervous system reset.""",
        "body_focus": "Full body with emphasis on hips, psoas, and spine - common trauma storage areas",
        "breathing_pattern": "Natural, unforced belly breathing. Allow sighs and releases.",
        "benefits": ["Trauma release", "Nervous system regulation", "Tension relief", "Emotional processing", "Body reconnection"]
    },
    {
        "id": "restorative-somatic-yoga",
        "name": "Restorative Somatic Yoga",
        "style": "Restorative",
        "description": "Deeply restful practice using props and long holds to activate the parasympathetic nervous system and release chronic muscle tension patterns.",
        "image_url": IMAGES["somatic_yoga"],
        "duration_minutes": 45,
        "intensity": "Very Gentle",
        "practice_guide": """1. Gather props: pillows, blankets, bolster if available.

2. Supported Child's Pose: Kneel, place bolster/pillows between thighs, drape forward. Stay 5+ minutes.

3. Sense Inside: Rather than stretching, sense the internal experience. What do you feel?

4. Supported Fish: Bolster under shoulder blades, arms wide, heart open. Rest 5+ minutes.

5. Legs Up Wall: Hips close to wall, legs vertical. Deep nervous system rest. 10+ minutes.

6. Side-Lying Rest: Fetal position with pillow between knees. Feel held and safe.

7. Final Savasana: Full support under knees, blanket over body. Complete surrender. 10+ minutes.""",
        "body_focus": "Full body opening with spinal extension, hip release, and heart opening",
        "breathing_pattern": "Deep, slow belly breaths. Exhale longer than inhale for relaxation.",
        "benefits": ["Deep relaxation", "Stress relief", "Parasympathetic activation", "Sleep improvement", "Chronic pain relief"]
    },
    {
        "id": "grounding-somatic-flow",
        "name": "Grounding Somatic Flow",
        "style": "Grounding",
        "description": "Earth-connecting practice to anchor scattered energy, reduce anxiety, and establish a felt sense of safety through slow, mindful movement.",
        "image_url": IMAGES["somatic_yoga"],
        "duration_minutes": 25,
        "intensity": "Gentle",
        "practice_guide": """1. Stand barefoot. Feel your feet on the ground. Roots extending down.

2. Weight Shifts: Slowly shift weight left, then right. Feel the ground catching you.

3. Knee Bends: Bend and straighten knees very slowly. Feel your connection to earth.

4. Come to Hands and Knees: Feel all four points of contact. Press into earth.

5. Cat-Cow with Awareness: Move spine slowly. Notice each vertebra. Be inside the movement.

6. Child's Pose: Forehead to earth. Feel held by the ground beneath you.

7. Mountain Pose: Stand tall. Feet rooted, crown lifted. You are a bridge between earth and sky.

8. Closing: Place hands on belly. Feel your center. You are grounded. You are safe.""",
        "body_focus": "Feet, legs, core - the physical foundations of stability",
        "breathing_pattern": "Grounding exhale through feet. Imagine breath reaching the earth.",
        "benefits": ["Anxiety reduction", "Stability", "Present moment awareness", "Safety embodiment", "Earth connection"]
    },
    {
        "id": "hip-release-somatic",
        "name": "Hip Release & Emotional Freedom",
        "style": "Emotional Release",
        "description": "Focused somatic practice for releasing emotions stored in the hips and pelvis—anger, fear, sadness, and trauma often live here. Slow, conscious movement unlocks this energy.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 35,
        "intensity": "Moderate",
        "practice_guide": """1. Begin on back. Hug knees to chest. Rock gently side to side, massaging sacrum.

2. Happy Baby: Hold feet, knees wide. Stay 3 minutes. Emotions may arise—let them.

3. Reclined Pigeon: Right ankle on left knee. Stay 5 minutes each side. Breathe into tight spots.

4. Slow Hip Circles: Come to all fours. Circle hips slowly in each direction. Make it sensual, exploratory.

5. Low Lunge Hold: Deep lunge, back knee down. Sink hips forward. 3 minutes each side.

6. Frog Pose: Knees wide, hips sinking toward floor. Support with blankets. Stay 5+ minutes.

7. Spontaneous Movement: Lie on back. Let hips move however they want. Trust the body's release.

8. Integration: Constructive rest—knees bent, feet wide, knees leaning together. Rest 5 minutes.""",
        "body_focus": "Hips, pelvis, psoas, inner thighs, sacrum",
        "breathing_pattern": "Deep belly breaths into pelvis. Exhale with sound if needed—sighs, groans, releasing.",
        "benefits": ["Emotional release", "Hip flexibility", "Trauma processing", "Sexual energy flow", "Creative unblocking"]
    },
    {
        "id": "neck-shoulder-somatic",
        "name": "Neck & Shoulder Stress Release",
        "style": "Tension Release",
        "description": "Targeted somatic practice for releasing chronic tension patterns in neck, shoulders, and upper back—where we hold stress, responsibility, and the weight of the world.",
        "image_url": IMAGES["somatic_yoga"],
        "duration_minutes": 25,
        "intensity": "Gentle",
        "practice_guide": """1. Sit comfortably. Notice your shoulders. Are they creeping toward your ears?

2. Exaggerate the Tension: Actually raise shoulders up to ears. Hold. Then slowly release. Feel the difference.

3. Neck Pandiculation: Gently turn head right, add slight resistance with hand, release slowly. Repeat left.

4. Shoulder Rolls: Slow, exaggerated circles. Really feel each phase of the movement.

5. Wall Press: Stand facing wall, hands at shoulder height. Press gently, round back, cat stretch. Release. Repeat.

6. Thread the Needle: All fours, thread right arm under left. Rest temple on floor. 3 minutes each side.

7. Self-Massage: Use fingertips to massage neck, shoulders, base of skull. Find tender spots—stay there.

8. Savasana with Support: Roll towel under neck curve. Arms at sides, palms up. Rest 5 minutes.""",
        "body_focus": "Neck, shoulders, trapezius, upper back, jaw",
        "breathing_pattern": "Slow breaths, exhaling through mouth with soft sigh to release tension.",
        "benefits": ["Tension headache relief", "Neck mobility", "Stress release", "Better posture", "Jaw relaxation"]
    },
]

# Feminine Embodiment Practices for Rose Temple
FEMININE_EMBODIMENT_DATA = [
    {
        "id": "womb-awakening-practice",
        "name": "Womb Awakening & Healing",
        "category": "Womb Wisdom",
        "description": "Sacred practice to reconnect with womb energy—whether you have a physical womb or not. The womb space is the creative center of feminine power, intuition, and manifestation.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 30,
        "practice_guide": """1. Create Sacred Space: Light a candle. Place hands on lower belly. Set intention for healing.

2. Womb Breathing: Breathe deeply into your womb space. Feel it expand and soften with each breath.

3. Womb Awareness: Even if you've had a hysterectomy, the energetic womb remains. Feel into this sacred space.

4. Color Visualization: See your womb glowing with soft rose or coral light. This is the color of the healthy feminine.

5. Ancestral Womb Healing: Connect with all the women in your lineage. Breathe healing to any womb trauma through the generations.

6. Womb Voice: Ask your womb if she has a message for you. Listen. She may speak in words, images, or feelings.

7. Creative Power: The womb is where we birth—not just babies, but ideas, art, businesses. Feel your creative power here.

8. Self-Pleasure (Optional): If comfortable, gentle self-touch can awaken womb energy. This is sacred, not shameful.

9. Sealing: Visualize a rose blooming in your womb space. You are connected to the Rose lineage of the Divine Feminine.""",
        "benefits": ["Womb healing", "Creative awakening", "Feminine reconnection", "Ancestral healing", "Manifestation power"],
        "element": "Water"
    },
    {
        "id": "sacred-sensuality-practice",
        "name": "Sacred Sensuality Awakening",
        "category": "Sensuality",
        "description": "Reclaiming the body as a vessel of pleasure and sacred sensuality. This practice heals shame and awakens the senses as pathways to the Divine Feminine.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 25,
        "practice_guide": """1. Environment: Warm room. Soft music. Pleasant scents (rose, jasmine, sandalwood).

2. Mirror Gaze: Stand before a mirror. Look at yourself with love. Say: "I am beautiful. I am sacred."

3. Self-Touch: Slowly run your hands over your body—not sexually, but appreciatively. Feel your skin.

4. Sense Awakening: 
   - Taste something delicious slowly
   - Smell essential oils
   - Touch different textures
   - Listen to beautiful sounds
   - Gaze at beauty

5. Body Movement: Put on sensual music. Move your body in ways that feel pleasurable. No one is watching.

6. Breath of Pleasure: Breathe in pleasure. Exhale shame. Breathe in worthiness. Exhale guilt.

7. Affirmation: "My body is a temple. Pleasure is my birthright. I am sacred sensuality embodied."

8. Integration: Rest with hands on heart and womb. Thank your body for carrying you through life.""",
        "benefits": ["Sensuality healing", "Body acceptance", "Pleasure reclamation", "Shame release", "Feminine embodiment"],
        "element": "Fire"
    },
    {
        "id": "moon-cycle-attunement",
        "name": "Moon Cycle Attunement",
        "category": "Lunar Wisdom",
        "description": "Align your energy with the moon's phases to honor your natural rhythms. Women's bodies are intimately connected to lunar cycles—this practice restores that sacred connection.",
        "image_url": IMAGES["chakra_all"],
        "duration_minutes": 20,
        "practice_guide": """1. Know the Moon: Check the current lunar phase. New Moon? Full Moon? Waxing? Waning?

2. Body Check: Notice where you are in your own cycle (if menstruating). How do you feel today?

3. New Moon Practice: Set intentions. Journal dreams. Rest. Plant seeds (metaphorically and literally).

4. Waxing Moon Practice: Take action. Build energy. Move toward goals. Expand.

5. Full Moon Practice: Celebrate! Release what no longer serves. Bathe in moonlight. Charge crystals.

6. Waning Moon Practice: Let go. Slow down. Reflect. Clear space for new.

7. Dark Moon Practice: Deep rest. Shadow work. Introspection. Death and rebirth.

8. Alignment: Place hands on womb. Say: "I align my rhythms with the moon. I honor my cycles."

9. Moon Bathing: If possible, stand or sit under the moon. Let her light fill your womb space.""",
        "benefits": ["Lunar attunement", "Cycle wisdom", "Natural rhythm restoration", "Feminine intuition", "Manifestation timing"],
        "element": "Water"
    },
    {
        "id": "goddess-embodiment-practice",
        "name": "Goddess Embodiment Ritual",
        "category": "Divine Feminine",
        "description": "Invoke and embody the energy of a goddess—whether Isis, Aphrodite, Kali, Quan Yin, or others. Feel her power move through you and awaken your divine feminine nature.",
        "image_url": IMAGES["chakra_heart"],
        "duration_minutes": 35,
        "practice_guide": """1. Choose Your Goddess: Who calls to you? Isis (magic), Aphrodite (love), Kali (transformation), Quan Yin (compassion)?

2. Create an Altar: Place images, candles, flowers, offerings for your chosen goddess.

3. Invocation: "I call upon [Goddess Name]. I invite your energy to flow through me. I embody your wisdom."

4. Movement: How does this goddess move? Fierce like Kali? Graceful like Aphrodite? Regal like Isis? Move as she would.

5. Receive Her Message: Sit in meditation. Ask the goddess for guidance. Listen.

6. Embodiment: Stand tall. Feel her energy in your spine. You are not pretending—you are remembering.

7. Affirmation: "I am [Goddess Name]. Her power flows through me. I am the Divine Feminine incarnate."

8. Service: What does this goddess want you to bring to the world? Commit to one action.

9. Gratitude & Release: Thank the goddess. Feel her energy gently recede while her wisdom remains.""",
        "benefits": ["Divine feminine connection", "Empowerment", "Archetype embodiment", "Spiritual guidance", "Sacred power"],
        "element": "Spirit"
    },
    {
        "id": "rose-lineage-meditation",
        "name": "Rose Lineage Meditation",
        "category": "Rose Mysteries",
        "description": "Connect with the ancient lineage of the Rose—from Mary Magdalene to the priestesses of Isis to all who have carried the codes of the sacred feminine through time.",
        "image_url": IMAGES["chakra_heart"],
        "duration_minutes": 25,
        "practice_guide": """1. Hold a rose or visualize one. The rose is the symbol of the sacred feminine mysteries.

2. Breathe in the Rose: Inhale the essence of the rose into your heart. Feel it opening.

3. Mary Magdalene: Connect with the energy of Mary Magdalene, bride of Christ, keeper of the Grail.

4. Isis: Feel the presence of Isis, ancient Egyptian goddess of magic, motherhood, and resurrection.

5. Rose Priestesses: Sense the lineage of all women who have served the rose mysteries through history.

6. Receive the Codes: The rose carries light codes. Open to receive downloads of ancient wisdom.

7. Your Heart as Rose: Visualize your heart as a rose, petals opening. You are part of this lineage.

8. Affirmation: "I am a keeper of the Rose. I carry the codes of the sacred feminine. I remember."

9. Integration: Place your hands on your heart. Feel the rose blooming within you.""",
        "benefits": ["Lineage connection", "Heart opening", "Ancient wisdom", "Feminine codes", "Spiritual remembrance"],
        "element": "Spirit"
    },
]

# Masculine Embodiment Practices
MASCULINE_EMBODIMENT_DATA = [
    {
        "id": "sacred-warrior-practice",
        "name": "Sacred Warrior Activation",
        "category": "Warrior",
        "description": "Awaken the sacred warrior within—not aggression, but the masculine power of protection, purpose, and the courage to stand for what's right.",
        "image_url": IMAGES["chakra_solar"],
        "duration_minutes": 25,
        "practice_guide": """1. Stand Tall: Feel your spine lengthen. Shoulders back. You are the protector.

2. Warrior Breath: Powerful exhales through the mouth. Breath of fire—rapid belly pumps.

3. Solar Plexus Activation: Place hands on belly. Feel your power center. You are strong.

4. Protective Stance: Step into a warrior stance—wide legs, grounded. Feel the earth beneath you.

5. Roar (Yes, Roar): Make a sound of power. A roar, a "HA!", whatever expresses your strength.

6. Visualize What You Protect: See clearly who and what you stand for. Family, values, truth, justice.

7. Sword of Truth: Visualize a sword of light. You wield it only for truth and protection, never domination.

8. Affirmation: "I am a sacred warrior. I stand for what is right. My strength serves love."

9. Bow to Your Inner Warrior: Thank this aspect of yourself. He is here when you need him.""",
        "benefits": ["Healthy masculine power", "Courage", "Protection energy", "Purpose clarity", "Strength with heart"],
        "element": "Fire"
    },
    {
        "id": "heart-king-practice",
        "name": "Heart-Centered King Practice",
        "category": "King",
        "description": "Embody the mature masculine archetype of the King—not domination, but benevolent leadership, responsibility, and creating order that serves all.",
        "image_url": IMAGES["chakra_heart"],
        "duration_minutes": 30,
        "practice_guide": """1. Sit with Dignity: On a chair or cushion, sit as if on a throne. Not arrogant—regal.

2. Survey Your Kingdom: What is within your domain? Your body, your home, your family, your work?

3. Responsibility Inventory: Where have you avoided responsibility? Where do you need to step up?

4. Heart Connection: Place hand on heart. A good king rules from the heart, not the ego.

5. Boundaries: A king sets healthy boundaries. What needs a clearer boundary in your life?

6. Service: The king serves his people. How do you serve those you lead?

7. Decision-Making: Think of a decision you've been avoiding. A king decides. Make the call.

8. Affirmation: "I am a heart-centered king. I lead with wisdom and love. I serve those in my care."

9. Crown Visualization: See a golden crown of light above your head. You are sovereign of your life.""",
        "benefits": ["Mature leadership", "Responsibility", "Healthy boundaries", "Benevolent authority", "Service orientation"],
        "element": "Earth"
    },
    {
        "id": "lover-embodiment-practice",
        "name": "Sacred Lover Embodiment",
        "category": "Lover",
        "description": "Awaken the Lover archetype—the masculine capacity for deep feeling, passion, sensuality, and connection without losing oneself.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 25,
        "practice_guide": """1. Soften: Let go of hardness. Let your body soften, especially the belly and jaw.

2. Sense Awakening: Really feel—the temperature, the textures, the scents around you.

3. Heart Opening: Place hands on heart. Breathe into the chest. Feel it expand.

4. Permission to Feel: Men are often taught not to feel. Give yourself permission to feel everything.

5. Beauty Appreciation: Look around. Find something beautiful. Let it move you.

6. Music and Movement: Put on emotionally moving music. Let your body respond honestly.

7. Think of Who You Love: Let yourself fully feel love for someone. Don't hold back.

8. Passion Inventory: What do you love? What makes you feel alive? The Lover follows passion.

9. Affirmation: "I am a sacred lover. I feel deeply. I connect authentically. My passion is my gift."

10. Integration: Rest with hands on heart. Appreciate your capacity to love and feel.""",
        "benefits": ["Emotional intelligence", "Sensuality", "Passion", "Deep connection", "Heart opening"],
        "element": "Water"
    },
    {
        "id": "sage-wisdom-practice",
        "name": "Inner Sage & Magician Practice",
        "category": "Sage",
        "description": "Connect with the Sage/Magician archetype—the masculine wisdom keeper who understands life's mysteries and uses knowledge for transformation and healing.",
        "image_url": IMAGES["chakra_third_eye"],
        "duration_minutes": 30,
        "practice_guide": """1. Quiet Mind: Begin with 5 minutes of silent meditation. The sage values stillness.

2. Third Eye Activation: Focus on the space between your brows. Invite inner seeing.

3. What Do You Know?: Reflect on the wisdom you've gained through life. Honor your experience.

4. Book of Life: Visualize a book containing all the wisdom of your soul's journey. Open it.

5. Ask a Question: What do you need to know? Ask your inner sage. Listen in silence.

6. Alchemical Transformation: The magician transforms. What situation needs to be transformed? See it differently.

7. Teaching: The sage teaches. What wisdom do you have to share? Who needs to hear it?

8. Symbols: What symbols hold meaning for you? These are keys to your magic.

9. Affirmation: "I am wise. I see beyond the surface. I transform challenges into growth."

10. Reverence: Honor the mystery of existence. The sage knows he doesn't know everything—and bows to that.""",
        "benefits": ["Wisdom development", "Intuition", "Transformation", "Teaching ability", "Mystery appreciation"],
        "element": "Air"
    },
    {
        "id": "father-energy-practice",
        "name": "Healing & Embodying Father Energy",
        "category": "Father",
        "description": "Heal wounds with your own father while developing the positive father archetype within—nurturing strength, protective guidance, and the capacity to bless others.",
        "image_url": IMAGES["chakra_heart"],
        "duration_minutes": 35,
        "practice_guide": """1. Father Inventory: What did you receive from your father? What did you miss?

2. Wound Acknowledgment: If there's pain, let yourself feel it. Breathe with it.

3. Forgiveness Work: "I forgive my father for what he could not give. He did his best with what he had."

4. Positive Father Recall: Think of any positive father figures in your life. Let their energy in.

5. Divine Father: Connect with the concept of a Divine Father—the universe as supportive, guiding presence.

6. Be the Father: If you have children, connect to your father energy. If not, father your own inner child.

7. Blessing Practice: Visualize blessing someone—hands on their head, sending love and encouragement.

8. Guidance: What guidance do you wish a father had given you? Give it to yourself now.

9. Affirmation: "I heal my father wounds. I embody healthy father energy. I guide, protect, and bless."

10. Integration: Place hands on your own head. Bless yourself as a good father would.""",
        "benefits": ["Father wound healing", "Nurturing strength", "Guidance ability", "Protective love", "Blessing capacity"],
        "element": "Spirit"
    },
]


async def seed_all():
    """Seed all extended modality data to MongoDB."""
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Add timestamps to all data
    for dataset in [EXTENDED_CHAKRAS, SOMATIC_YOGA_DATA, FEMININE_EMBODIMENT_DATA, MASCULINE_EMBODIMENT_DATA]:
        for item in dataset:
            item["created_at"] = timestamp
            item["updated_at"] = timestamp
    
    # Seed Extended Chakras (append to existing)
    existing_ids = set()
    async for doc in db.chakra_cleansing.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_chakras = [c for c in EXTENDED_CHAKRAS if c["id"] not in existing_ids]
    if new_chakras:
        await db.chakra_cleansing.insert_many(new_chakras)
        print(f"✓ Added {len(new_chakras)} new chakras (extended 13-chakra system)")
    else:
        print("→ Extended chakras already exist")
    
    # Seed Somatic Yoga (new collection)
    existing_ids = set()
    async for doc in db.somatic_yoga.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_somatic = [s for s in SOMATIC_YOGA_DATA if s["id"] not in existing_ids]
    if new_somatic:
        await db.somatic_yoga.insert_many(new_somatic)
        print(f"✓ Added {len(new_somatic)} somatic yoga practices")
    else:
        print("→ Somatic yoga practices already exist")
    
    # Seed Feminine Embodiment
    existing_ids = set()
    async for doc in db.feminine_embodiment.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_feminine = [f for f in FEMININE_EMBODIMENT_DATA if f["id"] not in existing_ids]
    if new_feminine:
        await db.feminine_embodiment.insert_many(new_feminine)
        print(f"✓ Added {len(new_feminine)} feminine embodiment practices")
    else:
        print("→ Feminine embodiment practices already exist")
    
    # Seed Masculine Embodiment
    existing_ids = set()
    async for doc in db.masculine_embodiment.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_masculine = [m for m in MASCULINE_EMBODIMENT_DATA if m["id"] not in existing_ids]
    if new_masculine:
        await db.masculine_embodiment.insert_many(new_masculine)
        print(f"✓ Added {len(new_masculine)} masculine embodiment practices")
    else:
        print("→ Masculine embodiment practices already exist")
    
    # Update existing chakras with unique images (throat, third eye, crown)
    updates = [
        ("throat-chakra-cleanse", IMAGES["chakra_throat"]),
        ("third-eye-chakra-cleanse", IMAGES["chakra_third_eye"]),
    ]
    for chakra_id, new_image in updates:
        result = await db.chakra_cleansing.update_one(
            {"id": chakra_id},
            {"$set": {"image_url": new_image, "updated_at": timestamp}}
        )
        if result.modified_count:
            print(f"✓ Updated image for {chakra_id}")
    
    client.close()
    print("\n✨ Extended modalities seeding complete!")
    print(f"   - 13-chakra system (Earth Star → Universal Gateway)")
    print(f"   - {len(SOMATIC_YOGA_DATA)} Somatic Yoga practices")
    print(f"   - {len(FEMININE_EMBODIMENT_DATA)} Feminine Embodiment practices")
    print(f"   - {len(MASCULINE_EMBODIMENT_DATA)} Masculine Embodiment practices")


if __name__ == "__main__":
    asyncio.run(seed_all())
