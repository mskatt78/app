"""
Seed data for Energy Healing, Free Form Movement, and Chakra Cleansing collections.
Run with: python -c "import asyncio; from data.seed_healing_modalities import seed_all; asyncio.run(seed_all())"
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# AI-generated image URLs
IMAGES = {
    "sekhem_egyptian": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/b6fae3c0cceefc21e1edb3fe80082713e5d496df44df1806b5952c3fb05efdb0.png",
    "australian_aboriginal": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/11447d1336c64fd9b949f32ceb908bf78d48ddba8f829c349ea36aac427f3af4.png",
    "crystal_healing": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/a26b925de3d93693907e0814a63b9b49e27c0b0ab73f5db17594e8ec692ef71f.png",
    "sound_healing": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/f9276b8b15ee0bfe14ee32cb7ef4c9bfbcdca9ce4b6f6be81a3eb7181366b1f3.png",
    "freeform_dance": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/bfa160f5c1406c20b01733894e46ad000bdda5bc9011a4095489ab158ff91537.png",
    "quantum_healing": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/8ed3c5244187116ac15623170bf5cfb0722e815611a2036476849a7f081021f9.png",
    "chakra_all": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/ace2a076d232e17f83130e3de840a429f08cdd696d0e20580af31a64676b9129.png",
    "somatic_yoga": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/332ca1a29950e4cecb210a3dc9444579511b230da8420cde70731198f4729a3d.png",
    "chakra_root": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/4f789faa21b0358abf4005f7e2e896ba04f2363b361027de76adaa38d0517871.png",
    "chakra_sacral": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/0bddcef7f53f8fb7cd1e021991ea81b8b777170abbf0841bf1dd9f5118b1035c.png",
    "chakra_solar": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/b1d6a77f129e8b2a5d8d663ee0088b0bf0896ca366f4e477ba3d32ae38e961ab.png",
    "chakra_heart": "https://static.prod-images.emergentagent.com/jobs/a8dcbcc8-4bb5-44d9-a29b-9babc824e7bc/images/2fb48658f784573b3260e3fff7138b26f6245a9867b447b6002f5a1ae300cec2.png",
}

# Energy Healing Modalities
ENERGY_HEALING_DATA = [
    {
        "id": "sekhem-egyptian-healing",
        "name": "Sekhem Egyptian Healing",
        "modality": "Egyptian",
        "description": "Ancient Egyptian healing art channeling the living light energy of the pyramids. Sekhem (meaning 'power' or 'might') works with the Eye of Horus and Ankh symbols to access divine healing frequencies.",
        "image_url": IMAGES["sekhem_egyptian"],
        "duration_minutes": 45,
        "element": "Light",
        "self_healing_guide": """1. Create Sacred Space: Light a candle and set your intention for healing. Visualize golden Egyptian light surrounding you.

2. Invoke the Ankh: Place your hands over your heart. Visualize the Ankh (☥) symbol glowing gold, representing the key of life.

3. Eye of Horus Activation: Close your eyes and imagine the Eye of Horus at your third eye, awakening inner sight and protection.

4. Pyramid Power: Visualize yourself sitting inside a golden pyramid. Feel the apex drawing cosmic energy down through your crown.

5. Channel Sekhem Light: With palms facing up, feel warm golden energy flowing through you. Direct this light to areas needing healing.

6. Seal the Healing: Cross your arms over your chest (Osiris position). Give thanks to the ancient Egyptian healing deities.

7. Ground: Touch the earth or floor, returning excess energy to the ground.""",
        "how_it_works": "Sekhem uses ancient Egyptian symbols as energy portals. The Ankh represents the union of masculine and feminine energies, while the Eye of Horus offers protection and healing vision. The pyramid shape amplifies and focuses universal life force energy.",
        "history": "Sekhem originated in ancient Egypt and was practiced by temple priests and priestesses. It was rediscovered in modern times through channeled information and has connections to Atlantean healing practices. The word appears in hieroglyphics as a scepter representing power.",
        "benefits": ["Spiritual awakening", "Past life healing", "Protection", "DNA activation", "Heart opening"]
    },
    {
        "id": "australian-aboriginal-healing",
        "name": "Aboriginal Dreamtime Healing",
        "modality": "Australian",
        "description": "Ancient Australian Aboriginal healing connecting to the Dreamtime—the eternal spiritual realm where all existence originates. Works with ancestral spirits, songlines, and the deep wisdom of the oldest continuous culture on Earth.",
        "image_url": IMAGES["australian_aboriginal"],
        "duration_minutes": 60,
        "element": "Earth",
        "self_healing_guide": """1. Connect to Country: Find a quiet outdoor space if possible. Place your bare feet on the earth. Acknowledge the traditional custodians of the land you're on.

2. Deep Earth Breathing: Breathe slowly, imagining roots extending from your feet deep into the red earth. Feel the ancient wisdom rising up.

3. Dreamtime Journey: Close your eyes and allow your consciousness to drift into the eternal now of Dreamtime. There is no past or future here.

4. Ancestor Connection: Call upon your ancestors and spirit guides. Feel their presence gathering around you in support.

5. Rainbow Serpent Healing: Visualize the Rainbow Serpent (creator being) moving through your body, clearing blockages and restoring vital force.

6. Singing Healing: Hum or tone a low, resonant sound. Aboriginal healing uses sound to shift energy. Let the vibration move through any areas of pain or stagnation.

7. Star Medicine: Look up (eyes open or closed) and receive healing light from the stars. Aboriginal people have deep star knowledge spanning 65,000+ years.

8. Gratitude Return: Thank the land, the ancestors, and the Dreamtime. Leave an offering if possible (water, a strand of hair, a song).""",
        "how_it_works": "Aboriginal healing recognizes that all of creation is interconnected through Dreamtime—an ever-present spiritual dimension. Illness is seen as disconnection from land, ancestors, or spiritual law. Healing restores these connections through ceremony, song, and earth medicine.",
        "history": "Aboriginal Australians have practiced continuous healing traditions for over 65,000 years—the longest unbroken spiritual lineage on Earth. Their medicine includes deep knowledge of plants, astronomy, ceremony, and the spiritual significance of the land itself.",
        "benefits": ["Earth connection", "Ancestral healing", "Deep grounding", "Time healing", "Soul retrieval"]
    },
    {
        "id": "crystal-healing-therapy",
        "name": "Crystal Healing Therapy",
        "modality": "Crystal",
        "description": "Using the natural vibrational frequencies of crystals and gemstones to balance energy centers, clear blockages, and promote physical, emotional, and spiritual healing.",
        "image_url": IMAGES["crystal_healing"],
        "duration_minutes": 30,
        "element": "Earth",
        "self_healing_guide": """1. Choose Your Crystal: Select intuitively or by need:
   - Clear Quartz: Amplification, clarity
   - Amethyst: Spiritual protection, intuition
   - Rose Quartz: Heart healing, self-love
   - Black Tourmaline: Protection, grounding

2. Cleanse the Crystal: Hold under running water, place in moonlight, or use sage smoke.

3. Program Your Crystal: Hold it, set your healing intention, breathe into it.

4. Lie Down Comfortably: Place crystals on or around your body:
   - Crown: Amethyst or clear quartz
   - Third Eye: Lapis lazuli or amethyst
   - Heart: Rose quartz or green aventurine
   - Root: Red jasper or black tourmaline

5. Receive: Relax for 15-20 minutes. Feel the crystals' vibrations harmonizing your energy field.

6. Integration: Slowly remove crystals. Drink water. Journal any insights.

7. Cleanse Again: Clear the crystals of absorbed energy before storing.""",
        "how_it_works": "Crystals have stable molecular structures that emit consistent vibrational frequencies. When placed on or near the body, these frequencies interact with our own biofield, helping to entrain our energy to more coherent patterns and clear stagnant energy.",
        "history": "Crystal healing has roots in ancient civilizations including Egypt, India, China, and Indigenous cultures worldwide. Modern crystal healing draws from these traditions combined with contemporary understanding of vibrational medicine.",
        "benefits": ["Energy balancing", "Chakra clearing", "Emotional release", "Stress relief", "Spiritual development"]
    },
    {
        "id": "sound-healing-bowls",
        "name": "Sound Bath Healing",
        "modality": "Sound",
        "description": "Immersive healing through the resonant frequencies of Tibetan singing bowls, crystal bowls, gongs, and other sacred instruments that shift brainwave states and release cellular tension.",
        "image_url": IMAGES["sound_healing"],
        "duration_minutes": 40,
        "element": "Ether",
        "self_healing_guide": """1. Prepare Your Space: Dim lights. Lie on a comfortable surface with a pillow and blanket.

2. Set Intention: Speak or think your healing intention clearly.

3. If Using a Singing Bowl:
   - Hold the bowl in your palm (not gripping)
   - Strike gently with the mallet
   - Circle the rim to sustain the tone
   - Feel the vibration in your body

4. Body Scanning with Sound: Move the bowl over different parts of your body:
   - Head/crown for clarity
   - Heart for emotional release
   - Belly for grounding

5. Vocal Toning: Add your own voice:
   - OM for whole body harmony
   - AH for heart opening
   - HUM for grounding

6. Silent Integration: After sounding, lie in silence for 5-10 minutes. The body continues to integrate.

7. Gentle Return: Wiggle fingers and toes. Roll to your side before sitting up.""",
        "how_it_works": "Sound waves create physical vibrations that penetrate every cell. Different frequencies affect different body systems—low tones ground and relax, high tones clarify and energize. Sound also shifts brainwave states from busy beta to meditative theta/delta.",
        "history": "Sound healing spans all cultures—from Australian didgeridoo to Tibetan bowls to Gregorian chant. The understanding that specific sounds affect consciousness and health is documented in the Vedas and was central to Egyptian temple practices.",
        "benefits": ["Deep relaxation", "Brainwave entrainment", "Pain relief", "Emotional release", "Cellular healing"]
    },
    {
        "id": "quantum-healing-hypnosis",
        "name": "Quantum Healing",
        "modality": "Quantum",
        "description": "Working at the quantum field level where consciousness and matter meet, accessing the infinite possibilities inherent in the unified field for healing and transformation.",
        "image_url": IMAGES["quantum_healing"],
        "duration_minutes": 45,
        "element": "Spirit",
        "self_healing_guide": """1. Enter the Field: Close your eyes. Take 10 slow breaths, each one expanding your awareness beyond your body.

2. Dissolve Boundaries: Sense yourself as energy, not solid matter. Imagine your atoms vibrating with space between them.

3. Access the Quantum Field: Visualize yourself floating in an infinite field of potential—pure consciousness before form.

4. Find the Blueprint: In this field exists your perfect energetic blueprint. Sense or see your body in perfect health.

5. Collapse the Wave: Focus your intention and emotion on this healthy version. Feel it as real. Quantum physics shows observation affects reality.

6. Merkaba Activation: Visualize a star tetrahedron (two interlocking pyramids) around your body, spinning with light.

7. DNA Light Activation: Imagine your DNA strands lighting up, activating dormant codes for health and evolution.

8. Return with Change: Bring this quantum healing back into your physical body. Trust the change has occurred at the deepest level.

9. Ground: Feel your body solid again. Know that healing continues beyond this session.""",
        "how_it_works": "Quantum healing works with the understanding that at the subatomic level, all possibilities exist simultaneously until observed. By shifting consciousness to a state of coherent intention, we can influence which possibility manifests in physical reality.",
        "history": "Quantum healing emerged from the intersection of quantum physics and consciousness studies. Influenced by Deepak Chopra, Dr. Joe Dispenza, and QHHT (Quantum Healing Hypnosis Technique) developed by Dolores Cannon.",
        "benefits": ["Reality shifting", "DNA activation", "Timeline healing", "Manifestation", "Consciousness expansion"]
    },
]

# Free Form Movement Practices
FREE_FORM_MOVEMENT_DATA = [
    {
        "id": "ecstatic-dance-liberation",
        "name": "Ecstatic Dance Liberation",
        "category": "Ecstatic",
        "description": "Free-form dance practice releasing inhibitions and accessing states of ecstasy through uninhibited movement. No choreography, no judgment—just pure expression.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 45,
        "intensity": "Variable",
        "practice_guide": """1. Create Safe Space: Choose music that moves you. Clear the floor. Commit to no judgment of yourself.

2. Opening Ceremony: Stand still. Set intention: "I release what no longer serves me. I welcome my authentic expression."

3. Wave 1 - Awakening (10 min): Start with slow, small movements. Wake up each body part. Sway, stretch, feel.

4. Wave 2 - Building (15 min): Let the music guide you. Move bigger. Shake, jump, spin. Release inhibition.

5. Wave 3 - Peak (10 min): Full expression! Primal movement. Make sounds. Claim the space. This is your medicine.

6. Wave 4 - Integration (10 min): Slow down gradually. Floor work. Gentle movement. Return to stillness.

7. Closing: Lie still for 3-5 minutes. Feel the energy settling. Place hands on heart. Give thanks.""",
        "music_suggestions": "Start with ambient/world music, build to rhythmic drums/electronic, peak with high-energy tracks, close with soft ambient. Recommended: 5Rhythms playlists, Prem Joshua, Beats Antique, Dead Can Dance.",
        "preparation": "Wear comfortable, non-restrictive clothing. Empty stomach recommended. Have water nearby. Close curtains for privacy.",
        "benefits": ["Emotional release", "Stress relief", "Joy activation", "Body acceptance", "Spiritual connection"]
    },
    {
        "id": "primal-shake-release",
        "name": "Primal Shake & Release",
        "category": "Primal",
        "description": "Therapeutic shaking practice activating the body's natural tremor response to release stored trauma, tension, and stagnant energy from the nervous system.",
        "image_url": IMAGES["somatic_yoga"],
        "duration_minutes": 20,
        "intensity": "Medium",
        "practice_guide": """1. Stand with feet hip-width apart. Slightly bend knees.

2. Begin Bouncing: Start bouncing from your knees, letting the movement ripple up through your whole body.

3. Add Shaking: Shake your hands vigorously. Let the shake spread to arms, shoulders, whole body.

4. Intensify: Shake faster for 5-7 minutes. Allow sounds—sighing, groaning, releasing.

5. Let It Happen: Transition from intentional shaking to allowing whatever movement wants to happen.

6. Spontaneous Movement: Your body may want to stomp, twist, flail. Trust it. This is neurogenic release.

7. Slow Down: Gradually reduce intensity over 2-3 minutes.

8. Rest: Lie down. Notice sensations. Tremors may continue—let them.

9. Integration: Stay lying for 5+ minutes. Drink water afterward.""",
        "music_suggestions": "Drumming, tribal beats, or silence. Avoid lyrics that engage the thinking mind.",
        "preparation": "This can bring up emotions. Have tissues nearby. Consider having someone available to talk to afterward if needed.",
        "benefits": ["Trauma release", "Nervous system reset", "Energy increase", "Anxiety relief", "Physical tension release"]
    },
    {
        "id": "intuitive-flow-movement",
        "name": "Intuitive Flow Journey",
        "category": "Intuitive",
        "description": "Listening deeply to the body's wisdom and allowing movement to arise organically, accessing inner guidance through somatic intelligence.",
        "image_url": IMAGES["freeform_dance"],
        "duration_minutes": 30,
        "intensity": "Gentle",
        "practice_guide": """1. Begin in Stillness: Sit or stand comfortably. Close eyes. Take 10 deep breaths.

2. Body Scan: Move attention slowly from crown to feet. Notice what's present without changing it.

3. Ask the Body: Silently ask your body: "What movement do you want?" Wait. Trust the first impulse.

4. Follow: Even if the movement is tiny—a finger twitch, a sway—follow it. Let it grow organically.

5. Surrender Control: Release the need to look graceful or make sense. You might roll on the floor, curl up, reach high.

6. Honor Stillness: If stillness arises, honor it. Not moving is also movement medicine.

7. Emotions Welcome: If tears come, let them. If laughter, let it. Movement is emotional release.

8. Closing Ritual: Place hands on heart. Thank your body for its wisdom. Notice how you feel now versus when you started.""",
        "music_suggestions": "Ambient, nature sounds, or silence. Music without lyrics allows deeper body listening.",
        "preparation": "Create a safe, private space. This practice can feel vulnerable—honor that.",
        "benefits": ["Body wisdom access", "Emotional processing", "Stress relief", "Self-trust building", "Mindfulness"]
    },
]

# Chakra Cleansing Practices
CHAKRA_CLEANSING_DATA = [
    {
        "id": "root-chakra-cleanse",
        "name": "Root Chakra Cleansing",
        "chakra": "Root",
        "sanskrit_name": "Muladhara",
        "description": "Ground and stabilize your foundation by clearing and balancing the root chakra at the base of the spine—your connection to safety, security, and belonging.",
        "image_url": IMAGES["chakra_root"],
        "duration_minutes": 15,
        "color": "Red",
        "element": "Earth",
        "location": "Base of spine",
        "cleansing_guide": """1. Sit or stand with feet flat on the ground. Feel the earth beneath you.

2. Visualize Roots: Imagine red roots growing from the base of your spine, reaching deep into the earth.

3. Red Light Breathing: Inhale and visualize rich red light entering through your root. Exhale any darkness or fear.

4. Affirmation (repeat 7 times): "I am safe. I am grounded. I belong on this Earth."

5. Muladhara Mantra: Chant "LAM" (pronounced LAAM) 7 times, feeling the vibration at your spine base.

6. Stomp & Ground: If standing, stomp your feet. Feel your right to be here.

7. Earth Connection: Place hands on the ground or a houseplant. Feel connection to living Earth.

8. Seal: Visualize a spinning red disc at your spine base, now clear and bright.""",
        "signs_of_imbalance": "Fear, anxiety, financial worries, feeling ungrounded, disconnection from body, frequent illness, eating disorders, hoarding, excessive materialism.",
        "affirmations": "I am safe and secure.\nI have a right to be here.\nThe Earth supports me.\nI am grounded in my body.\nI trust in the abundance of life.",
        "crystals": "Red Jasper, Black Tourmaline, Hematite, Smoky Quartz, Garnet, Bloodstone",
        "benefits": ["Security", "Stability", "Physical vitality", "Trust", "Prosperity consciousness"]
    },
    {
        "id": "sacral-chakra-cleanse",
        "name": "Sacral Chakra Cleansing",
        "chakra": "Sacral",
        "sanskrit_name": "Svadhisthana",
        "description": "Awaken creativity, sensuality, and emotional flow by clearing the sacral chakra located below the navel—your center of pleasure, passion, and creative life force.",
        "image_url": IMAGES["chakra_sacral"],
        "duration_minutes": 15,
        "color": "Orange",
        "element": "Water",
        "location": "Below navel",
        "cleansing_guide": """1. Sit comfortably. Place hands on your lower belly.

2. Hip Circles: Make slow circles with your hips—sitting or standing. Awaken the pelvic bowl.

3. Orange Light Breathing: Breathe warm orange light into your lower belly. Exhale any shame or guilt.

4. Water Visualization: Imagine your sacral chakra as a pool of warm, orange water. See it becoming clear and flowing.

5. Affirmation (repeat 7 times): "I am creative. I feel deeply. I embrace pleasure."

6. VAM Mantra: Chant "VAM" (pronounced VAAM) 7 times, feeling vibration in your lower belly.

7. Sensory Awakening: Touch something pleasurable—soft fabric, warm water. Fully feel it.

8. Seal: Visualize a spinning orange disc below your navel, glowing with creative fire.""",
        "signs_of_imbalance": "Creative blocks, guilt around pleasure, emotional numbness, sexual issues, addiction, codependency, fear of change, lower back pain.",
        "affirmations": "I allow pleasure in my life.\nMy creativity flows freely.\nI honor my emotions.\nI am passionate and alive.\nI embrace change with grace.",
        "crystals": "Carnelian, Orange Calcite, Sunstone, Moonstone, Tiger's Eye",
        "benefits": ["Creativity", "Emotional balance", "Sensuality", "Passion", "Healthy boundaries"]
    },
    {
        "id": "solar-plexus-chakra-cleanse",
        "name": "Solar Plexus Chakra Cleansing",
        "chakra": "Solar Plexus",
        "sanskrit_name": "Manipura",
        "description": "Ignite personal power and confidence by clearing the solar plexus chakra at the upper abdomen—your center of will, self-esteem, and transformation.",
        "image_url": IMAGES["chakra_solar"],
        "duration_minutes": 15,
        "color": "Yellow",
        "element": "Fire",
        "location": "Solar plexus",
        "cleansing_guide": """1. Stand tall. Place hands on your upper belly.

2. Power Pose: Stand like a superhero—feet wide, hands on hips, chest lifted. Hold for 2 minutes.

3. Yellow Sun Breathing: Breathe golden yellow light into your solar plexus. Feel warmth spreading. Exhale fear and self-doubt.

4. Fire Visualization: Imagine a bright yellow flame at your solar plexus. See it burning away old limitations.

5. Affirmation (repeat 7 times): "I am powerful. I am worthy. I honor myself."

6. RAM Mantra: Chant "RAM" (pronounced RAAM) 7 times, feeling vibration at your core.

7. Core Engagement: Do 10 slow breath-of-fire breaths (rapid belly pumps). Feel your inner fire.

8. Seal: Visualize a spinning golden sun at your solar plexus, radiating confidence.""",
        "signs_of_imbalance": "Low self-esteem, powerlessness, victim mentality, aggression, control issues, digestive problems, chronic fatigue, fear of rejection.",
        "affirmations": "I am confident and powerful.\nI honor my authentic self.\nI trust my decisions.\nI transform challenges into opportunities.\nI am worthy of respect.",
        "crystals": "Citrine, Yellow Jasper, Golden Tiger's Eye, Pyrite, Amber",
        "benefits": ["Confidence", "Personal power", "Clear boundaries", "Willpower", "Healthy ego"]
    },
    {
        "id": "heart-chakra-cleanse",
        "name": "Heart Chakra Cleansing",
        "chakra": "Heart",
        "sanskrit_name": "Anahata",
        "description": "Open to unconditional love and compassion by clearing the heart chakra at the center of your chest—the bridge between physical and spiritual, self and other.",
        "image_url": IMAGES["chakra_heart"],
        "duration_minutes": 20,
        "color": "Green",
        "element": "Air",
        "location": "Heart center",
        "cleansing_guide": """1. Sit comfortably. Place both hands on your heart.

2. Heart Breathing: Breathe directly into your heart center. Feel your chest expand with each breath.

3. Green-Pink Light: Visualize emerald green light mixed with soft pink filling your chest. Exhale grief, heartbreak, or resentment.

4. Forgiveness Practice: Bring to mind someone you need to forgive (including yourself). Say: "I forgive you. I release you. I set us both free."

5. Gratitude Flow: Think of 5 things/people you love. Feel your heart opening and warming.

6. Affirmation (repeat 7 times): "I am love. I give love freely. I receive love fully."

7. YAM Mantra: Chant "YAM" (pronounced YAAM) 7 times, feeling your heart vibrate with sound.

8. Heart Mudra: Bring hands to prayer position at heart. Feel the love within.

9. Seal: Visualize a spinning emerald green disc at your heart, radiating love to all beings.""",
        "signs_of_imbalance": "Fear of intimacy, jealousy, codependency, isolation, bitterness, lack of empathy, difficulty forgiving, respiratory or heart issues.",
        "affirmations": "I am open to love.\nI forgive myself and others.\nI give and receive love freely.\nMy heart is healed and whole.\nI am connected to all of life.",
        "crystals": "Rose Quartz, Green Aventurine, Rhodonite, Malachite, Emerald, Jade",
        "benefits": ["Unconditional love", "Compassion", "Forgiveness", "Healthy relationships", "Inner peace"]
    },
    {
        "id": "throat-chakra-cleanse",
        "name": "Throat Chakra Cleansing",
        "chakra": "Throat",
        "sanskrit_name": "Vishuddha",
        "description": "Speak your truth clearly and authentically by clearing the throat chakra—your center of communication, self-expression, and creative voice.",
        "image_url": IMAGES["chakra_all"],
        "duration_minutes": 15,
        "color": "Blue",
        "element": "Ether/Sound",
        "location": "Throat",
        "cleansing_guide": """1. Sit with spine tall. Gently roll your neck in circles to release tension.

2. Blue Light Breathing: Breathe bright blue light into your throat. Exhale anything unsaid or repressed.

3. Voice Warm-Up: Hum at different pitches. Feel vibration in your throat.

4. Speak Truth: Whisper, then speak, then declare: "I speak my truth clearly and confidently."

5. HAM Mantra: Chant "HAM" (pronounced HAAM) 7 times. Feel your throat chakra vibrate.

6. Silent Contemplation: Ask yourself: "What truth am I holding back?" Listen without judgment.

7. Lion's Breath: Inhale deeply, then exhale with tongue out, eyes up, making a "HAAA" sound. Repeat 3 times.

8. Affirmation (repeat 7 times): "My voice matters. I speak with clarity and truth."

9. Seal: Visualize a spinning bright blue disc at your throat, expressing freely.""",
        "signs_of_imbalance": "Fear of speaking up, shyness, talking too much, lying, inability to listen, thyroid issues, neck pain, sore throats.",
        "affirmations": "I speak my truth with ease.\nMy voice is valuable.\nI listen deeply to others.\nI express myself authentically.\nI communicate clearly.",
        "crystals": "Blue Lace Agate, Sodalite, Aquamarine, Lapis Lazuli, Turquoise, Amazonite",
        "benefits": ["Clear communication", "Authenticity", "Creative expression", "Active listening", "Speaking truth"]
    },
    {
        "id": "third-eye-chakra-cleanse",
        "name": "Third Eye Chakra Cleansing",
        "chakra": "Third Eye",
        "sanskrit_name": "Ajna",
        "description": "Awaken intuition and inner vision by clearing the third eye chakra between your brows—your center of insight, imagination, and higher perception.",
        "image_url": IMAGES["chakra_all"],
        "duration_minutes": 15,
        "color": "Indigo",
        "element": "Light",
        "location": "Between brows",
        "cleansing_guide": """1. Sit in meditation posture. Gaze gently at the space between your eyebrows.

2. Indigo Light Breathing: Breathe deep indigo light into your forehead. Exhale mental fog and illusion.

3. Third Eye Activation: Gently touch your third eye point. Visualize an eye slowly opening.

4. Visualization Practice: With eyes closed, visualize a candle flame, then a blue flower, then a night sky with stars. Build your inner sight.

5. OM Mantra: Chant "OM" (pronounced A-U-M) 7 times. Feel vibration at your forehead.

6. Intuition Question: Ask your intuition a question. Wait in silence. Trust the first impression.

7. Dream Recall: Commit to remembering your dreams. Say: "I remember my dreams clearly."

8. Affirmation (repeat 7 times): "I trust my intuition. I see clearly. I am connected to inner wisdom."

9. Seal: Visualize a spinning indigo disc at your third eye, glowing with inner knowing.""",
        "signs_of_imbalance": "Confusion, poor imagination, denial, headaches, nightmares, poor memory, difficulty concentrating, closed-mindedness.",
        "affirmations": "I trust my intuition.\nI see clearly with my inner eye.\nI am open to wisdom.\nI perceive the truth.\nMy imagination is vivid.",
        "crystals": "Amethyst, Lapis Lazuli, Labradorite, Fluorite, Sodalite, Azurite",
        "benefits": ["Intuition", "Clarity", "Imagination", "Insight", "Psychic abilities"]
    },
    {
        "id": "crown-chakra-cleanse",
        "name": "Crown Chakra Cleansing",
        "chakra": "Crown",
        "sanskrit_name": "Sahasrara",
        "description": "Connect to divine consciousness and spiritual oneness by clearing the crown chakra at the top of your head—your gateway to cosmic awareness and enlightenment.",
        "image_url": IMAGES["chakra_all"],
        "duration_minutes": 20,
        "color": "Violet/White",
        "element": "Cosmic/Thought",
        "location": "Crown of head",
        "cleansing_guide": """1. Sit in meditation. Let all thoughts settle like snow in a snow globe.

2. Violet-White Light: Visualize brilliant violet light, transitioning to pure white, entering through the crown of your head.

3. Thousand-Petaled Lotus: Imagine a lotus flower at your crown slowly opening its thousand petals to the cosmos.

4. Divine Connection: Feel yourself connected to something greater—the universe, source, God/dess. Let go of the small self.

5. Silence: Sit in pure silence for 5 minutes. Just be. No mantras, no visualization. Pure awareness.

6. AH Mantra: Softly chant "AH" or silence (the crown chakra is beyond sound) 7 times.

7. Cosmic Download: Open to receiving wisdom, light, and guidance from the highest source.

8. Gratitude to Source: Thank the divine/universe/source for this connection.

9. Affirmation (repeat 7 times): "I am one with all that is. I am divine consciousness."

10. Seal: Visualize a spinning thousand-petaled lotus of violet and white light at your crown.""",
        "signs_of_imbalance": "Spiritual disconnection, cynicism, closed-mindedness, materialism, learning difficulties, apathy, excessive attachment, depression.",
        "affirmations": "I am connected to divine wisdom.\nI am one with all that is.\nI trust my spiritual path.\nI am infinite consciousness.\nI surrender to the highest good.",
        "crystals": "Clear Quartz, Amethyst, Selenite, Howlite, Diamond, Lepidolite",
        "benefits": ["Spiritual connection", "Enlightenment", "Inner peace", "Wisdom", "Unity consciousness"]
    },
]

async def seed_all():
    """Seed all healing modality data to MongoDB."""
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME", "shamanic_elements")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    # Add timestamps
    for item in ENERGY_HEALING_DATA:
        item["created_at"] = timestamp
        item["updated_at"] = timestamp
    
    for item in FREE_FORM_MOVEMENT_DATA:
        item["created_at"] = timestamp
        item["updated_at"] = timestamp
    
    for item in CHAKRA_CLEANSING_DATA:
        item["created_at"] = timestamp
        item["updated_at"] = timestamp
    
    # Seed Energy Healing (append to existing)
    existing_ids = set()
    async for doc in db.energy_healing.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_energy = [e for e in ENERGY_HEALING_DATA if e["id"] not in existing_ids]
    if new_energy:
        await db.energy_healing.insert_many(new_energy)
        print(f"✓ Added {len(new_energy)} new energy healing modalities")
    else:
        print("→ Energy healing: No new modalities to add")
    
    # Seed Free Form Movement
    existing_ids = set()
    async for doc in db.free_form_movement.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_movement = [m for m in FREE_FORM_MOVEMENT_DATA if m["id"] not in existing_ids]
    if new_movement:
        await db.free_form_movement.insert_many(new_movement)
        print(f"✓ Added {len(new_movement)} free form movement practices")
    else:
        print("→ Free form movement: No new practices to add")
    
    # Seed Chakra Cleansing
    existing_ids = set()
    async for doc in db.chakra_cleansing.find({}, {"id": 1}):
        existing_ids.add(doc.get("id"))
    
    new_chakra = [c for c in CHAKRA_CLEANSING_DATA if c["id"] not in existing_ids]
    if new_chakra:
        await db.chakra_cleansing.insert_many(new_chakra)
        print(f"✓ Added {len(new_chakra)} chakra cleansing practices")
    else:
        print("→ Chakra cleansing: No new practices to add")
    
    client.close()
    print("\n✨ Healing modalities seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_all())
