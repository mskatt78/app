import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mountain, Waves, Flame, Wind, Sparkles, ChevronRight, X, Star, Leaf, Droplets, Zap, Eye, Globe } from "lucide-react";

const elements = [
  {
    id: "earth",
    name: "Earth Temple",
    element: "Earth",
    symbol: "⬛",
    icon: Mountain,
    image: "https://images.pexels.com/photos/4017166/pexels-photo-4017166.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", accent: "emerald", glow: "shadow-emerald-500/20", gradient: "from-emerald-900/80 to-stone-900/60" },
    tagline: "Rooted. Abundant. Embodied.",
    description: "Earth is the foundation — the body itself, the ground beneath your feet, the slow wisdom of forests and stone. Earth teaches us patience, permanence, and the sacred act of being fully present in matter.",
    inner: "In you, Earth is your body, your bones, your sense of safety. It is your capacity to be fully here — not floating above your life but rooted within it. When Earth is in balance, you feel secure, nourished, and at home in yourself.",
    outer: "In the world, Earth is the soil, the forest, the mountain, the cave, the root system beneath the earth that fungi and trees use to communicate and share resources. It is the slow, patient pulse of geological time.",
    nature_connection: [
      "Walk barefoot on soil, grass, sand, or rock. Feel the texture and temperature beneath your feet.",
      "Sit at the base of a large tree. Place your back against the trunk. Breathe its rootedness into your own spine.",
      "Garden with bare hands. Plant seeds with intention. Watch what grows.",
      "Collect stones that call to you. Hold them and feel their ancient time.",
      "Eat food grown in local soil, prepared with care and eaten without distraction."
    ],
    practices: [
      { name: "Mountain Pose (Tadasana)", type: "Movement", desc: "Stand still as a mountain — feet rooted, crown lifted, entire body awake. Hold for 5 minutes while breathing deeply. Feel the weight and stability of your body." },
      { name: "Earth Breath", type: "Breathwork", desc: "Inhale for 4 counts through the nose. Hold for 4. Exhale slowly for 8. Repeat 10 cycles. Imagine breathing into the ground itself." },
      { name: "Body Gratitude Practice", type: "Somatic", desc: "Place both hands on your belly. Close your eyes. Begin to name every part of your body that is working right now, with gratitude. Start with your breath, your heartbeat, your digestion." },
      { name: "Earth Element Meditation", type: "Meditation", desc: "Close your eyes and imagine roots growing from the soles of your feet deep into the earth. Feel yourself being held. Feel the mineral richness of the earth feeding your roots. You are nourished. You belong here." }
    ],
    embodiment: "Earth embodiment is about inhabiting your physical body fully — feeling your feet, your weight, your texture against the world. It is about being so present that you become undeniable. The Earth archetype within us is the one who says: 'I am here. I take up space. I belong.' This is your foundation. Without it, all other elements spin without anchor.",
    wisdom: "The deepest wisdom of Earth is this: nothing is wasted. Every fallen leaf becomes soil. Every ending becomes beginning. The compost of your most difficult experiences is the richest ground for your most beautiful growth. Trust the process. Stay in your body. This too will nourish you.",
    rituals: [
      {
        name: "Sacred Planting Ceremony 🙏",
        timing: "New Moon or Spring Equinox",
        duration: "30–45 minutes",
        what_you_need: ["Seeds (herbs, flowers, or vegetables)", "Soil and a pot or garden plot", "A candle (green or brown)", "Your journal", "A small crystal (obsidian, smoky quartz, or moss agate)"],
        steps: [
          "Choose a seed that represents something you wish to grow — a new project, a quality of character, a dream. Name it.",
          "Prepare the soil with your bare hands, feeling its texture, temperature, and aliveness.",
          "Light the candle and hold the seed in your closed hands. Breathe three deep breaths into it, infusing it with your intention.",
          "Speak aloud: 'As I plant this seed, I plant this intention. May it be rooted in love, nourished by truth, and grow in divine timing.'",
          "Plant the seed gently. Press the soil around it with care — this is a sacred act of burial and beginning.",
          "Place the crystal beside the planting and record your intention in your journal.",
          "Water it consciously each day as an act of devotion to your own growth."
        ],
        closing: "Return to your plant regularly — not just to water, but to speak to it. The Earth element teaches that tending is a spiritual practice."
      },
      {
        name: "Grounding Body Ritual 🙏",
        timing: "Any time — especially when anxious, spacey, or overwhelmed",
        duration: "15–20 minutes",
        what_you_need: ["Bare feet and grass/soil/sand", "Optional: drumbeat music", "A stone to hold"],
        steps: [
          "Remove your shoes and socks. Stand barefoot on the earth outside.",
          "Take 10 slow, deep breaths. With each exhale, consciously send your awareness downward — into your feet, into the ground.",
          "Begin to walk very slowly, feeling each footstep as if the ground is greeting you back.",
          "Find a tree. Place both hands on its bark. Close your eyes. Breathe in its steadiness.",
          "Bend your knees slightly and gently bounce — shake your whole body loose, from the feet upward. Let the earth receive whatever you are releasing.",
          "Stand still. Feel the stillness of the ground beneath you. You are held. You are safe. You belong to this earth.",
          "Speak aloud: 'I am of the Earth. I am cared for. I am home.'"
        ],
        closing: "Carry the stone in your pocket for the rest of the day as a reminder of your groundedness."
      }
    ],
    affirmations: [
      "I am rooted, safe, and held by the Earth.",
      "My body is sacred ground.",
      "I am patient, present, and fully here.",
      "I belong to this earth, and the earth belongs to me."
    ]
  },
  {
    id: "water",
    name: "Water Temple",
    element: "Water",
    symbol: "🌊",
    icon: Waves,
    image: "https://images.pexels.com/photos/2860703/pexels-photo-2860703.jpeg?auto=compress&cs=tinysrgb&w=800",
    color: { text: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30", accent: "blue", glow: "shadow-blue-500/20", gradient: "from-blue-900/80 to-slate-900/60" },
    tagline: "Fluid. Feeling. Flowing.",
    description: "Water is the element of emotion, intuition, and the unconscious. Like water, we cannot be grasped — we can only be held in a vessel. Water teaches us that feeling is not weakness; it is the intelligence of the soul.",
    inner: "In you, Water is your emotional life — your capacity to feel deeply, to grieve, to love, to be moved. It is your intuition: that knowing that arrives before words. When Water is balanced, you flow with life rather than resist it. You can hold paradox, rest in uncertainty, and trust what you sense beyond the visible.",
    outer: "In the world, Water is the ocean, the river, the rain, the morning dew. It is the 70% of your own body that is ocean. It is the amniotic fluid that held you before birth. Water has memory — it carries information in its structure, responds to intention, and connects all living things.",
    nature_connection: [
      "Sit beside a river or stream and simply watch the water move. Notice how it navigates obstacles — flowing around, under, through.",
      "Stand in the rain and feel each drop on your skin. Let yourself be fully wet.",
      "Swim in natural water if possible — ocean, river, lake. Float on your back and surrender to being held.",
      "Collect rain water and use it to water plants or simply to hold. Feel its aliveness.",
      "Wake before dawn to watch the dew forming on grass and spiderwebs."
    ],
    practices: [
      { name: "Fluid Movement", type: "Movement", desc: "Put on slow, ambient music and move your body like water — undulating, flowing, never stopping in one shape. Let your spine become a river. Let your arms become waves. Release all rigidity." },
      { name: "Emotional Release Breathwork", type: "Breathwork", desc: "Circular breath — continuous inhale and exhale with no pause. Breathe into the belly, then chest, then release fully. Allow whatever emotions arise to move through. Sound is welcome — sighing, crying, toning." },
      { name: "Grief Practice", type: "Somatic", desc: "Find a private space. Place your hands on your heart. Think of something you are grieving — a loss, an unlived life, a relationship, a dream. Let the tears come. Grief is water returning to the ocean. It is healthy. It is necessary." },
      { name: "Moon Water Meditation", type: "Meditation", desc: "On a full moon night, place a glass of water in the moonlight. In meditation, imagine the moon's silver light filling your emotional body, clearing and cleansing like a gentle tide. Drink the moon water in the morning." }
    ],
    embodiment: "Water embodiment is the practice of feeling — fully, without bracing or numbing. It is learning to track the subtle currents of emotion in the body: the tightening in the throat, the warmth in the chest, the hollow ache of longing. Water asks you to stop managing your feelings and start experiencing them. Emotions are messengers. Every suppressed wave eventually creates a flood. Let them flow.",
    wisdom: "Water does not fight the rock — it goes around it, under it, and over centuries, shapes it. This is the wisdom of water: resistance is rarely the path. Feeling is not the obstacle — it is the way through. Your tears are not weakness. They are intelligence. They are the body's way of knowing.",
    rituals: [
      {
        name: "Moon Water Blessing Ceremony 🙏",
        timing: "Full Moon night",
        duration: "30 minutes",
        what_you_need: ["A glass or bowl of pure water", "A moonstone or clear quartz", "Candles (blue or silver)", "Rose petals (optional)", "Your journal"],
        steps: [
          "As the sun sets on the full moon night, prepare your space near a window with moonlight or outdoors.",
          "Fill a glass bowl or jar with pure water. Drop a moonstone or clear quartz into the water and surround it with rose petals if you have them.",
          "Light your candles and sit before the bowl. Gaze into the water and see the moon's reflection if possible.",
          "Place both hands over the water (not touching it). Breathe slowly. Speak your prayer for what you wish the water to carry — healing, clarity, emotional flow, release.",
          "Leave the water overnight in moonlight. In the morning, before drinking, hold the glass to your heart and set one final intention.",
          "Drink the moon water slowly and consciously, feeling it move through you.",
          "Pour any remaining water onto the earth or into a plant as an offering."
        ],
        closing: "The full moon amplifies what is present in the emotional body. Journal about what arose."
      },
      {
        name: "Emotional Cleansing River Ritual 🙏",
        timing: "Any time you carry heaviness",
        duration: "20–30 minutes",
        what_you_need: ["A river, ocean, stream, or bath", "Epsom or Himalayan salt", "A flower or leaf to offer"],
        steps: [
          "Prepare your water space — if using a bath, add salt and speak a blessing over the water before entering.",
          "Enter the water slowly and with full presence. Feel it moving over your skin.",
          "As you soak or stand in the water, consciously name what you are releasing — emotions, beliefs, relationships, memories. Speak them to the water.",
          "Submerge your hands or face in the water (or use a cloth to wash your face). As you do, say: 'I release what no longer flows through me with grace.'",
          "Sit in the water for at least 10 minutes in silence. Let the water do what water does — cleanse, soften, dissolve.",
          "When you are ready to leave, let the water drain slowly (bath) or step out of the natural water. Watch it carry your offerings away.",
          "Offer the flower or leaf to the water as thanks."
        ],
        closing: "Anoint yourself with oil or lotion after, moving upward from feet to heart — welcoming in what is fresh and new."
      }
    ],
    affirmations: [
      "I am fluid, adaptive, and free.",
      "My emotions are messengers, not enemies.",
      "I trust the wisdom of my feeling body.",
      "Like water, I can flow through any obstacle."
    ]
  },
  {
    id: "fire",
    name: "Fire Temple",
    element: "Fire",
    symbol: "🔥",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1605254252017-c84820fe9913?crop=entropy&cs=srgb&fm=jpg&w=800",
    color: { text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30", accent: "orange", glow: "shadow-orange-500/20", gradient: "from-orange-900/80 to-red-950/60" },
    tagline: "Transformed. Alive. Radiant.",
    description: "Fire is the element of transformation, will, and radiant power. It is the sacred force that burns away what no longer serves, illuminates the darkness, and ignites the passion to live fully and authentically.",
    inner: "In you, Fire is your will, your passion, your power to act. It is the spark of creativity, the courage to speak your truth, and the light of consciousness itself. When Fire is healthy, you are motivated without being driven, powerful without being dominating, bright without burning others.",
    outer: "In the world, Fire is the sun — the great life-giver without which nothing grows. It is the flame in the hearth that has gathered humans into community for all of human existence. It is the forest fire that clears the old growth to make way for new life. It is the volcano that creates new land.",
    nature_connection: [
      "Build a fire safely and tend it with full attention. Watch how it breathes, hungers, and transforms what it consumes.",
      "Rise before dawn to witness the sun rising. Watch the sky transform from dark to golden. Feel the first warmth on your face.",
      "Stand in direct sunlight, arms open, face upturned. Receive the light consciously.",
      "Burn something that represents what you are releasing — a written intention, a symbol — and watch it transform.",
      "Cook something from scratch over an open flame, present to the alchemy of heat and ingredients becoming nourishment."
    ],
    practices: [
      { name: "Power Breath (Kapalabhati)", type: "Breathwork", desc: "Rapid, forceful exhales through the nose with passive inhales. Start with 30 pumps, rest, and repeat three rounds. This ignites digestive fire, clears the mind, and activates energy." },
      { name: "Warrior Sequence", type: "Movement", desc: "Move through Warrior I, II, and III with fierce intention. Hold each for 10 breaths. Let your body be powerful, your gaze steady, your breath strong. You are a warrior of light." },
      { name: "Candle Meditation", type: "Meditation", desc: "Sit before a lit candle in a dark room. Gaze steadily at the flame without blinking until your eyes naturally blink. This is trataka — the practice of steady gazing — which strengthens willpower and concentration." },
      { name: "Fire Ceremony", type: "Ritual", desc: "Write on paper what you are releasing. Read each thing aloud with conviction: 'I release...' Then burn the paper. As it burns, say: 'I am free. I am renewed. I am light.' Watch the smoke carry your intentions skyward." }
    ],
    embodiment: "Fire embodiment is about inhabiting your full power — not power over others, but the radiant, self-sourced power of someone who knows who they are and why they are here. It is about feeling your life force — that hum of aliveness, that heat of desire and purpose — and letting it guide your choices. Fire asks: What are you willing to burn for?",
    wisdom: "The most important thing about fire is that it transforms but does not destroy. Wood becomes heat becomes light becomes ash that feeds new growth. Nothing is lost — everything is changed. This is the deeper truth of transformation: you are not diminished by what you release. You become more yourself.",
    rituals: [
      {
        name: "Sacred Fire Ceremony 🙏",
        timing: "Summer Solstice, Full Moon, or any threshold moment",
        duration: "45–60 minutes",
        what_you_need: ["A fire-safe vessel or outdoor fire", "Paper and pen", "Dried herbs (rosemary, sage, cedar)", "A candle if no fire is possible", "Drum or percussive music (optional)"],
        steps: [
          "Build your fire or light your candle with full presence. This fire is sacred — you are the fire-keeper.",
          "Sit before the fire for 5 minutes in silence. Feel its warmth. Let it warm your solar plexus — your power center.",
          "Write on paper: what you are releasing (fears, old stories, what no longer serves). Write boldly and completely.",
          "Read what you've written aloud to the fire. This is your declaration.",
          "When ready, feed the paper to the flames. As it burns, say: 'I release this to the fire. I am transformed. I am renewed.'",
          "Throw the dried herbs into the flames as an offering and prayer.",
          "Now write or speak your intentions — what you are calling IN. What you are willing to burn for.",
          "Close by raising both arms to the fire and feeling its light entering your chest, filling you with courage and aliveness."
        ],
        closing: "Drum, chant, move, or sit in sacred silence as the fire dies. The ash can be returned to the earth."
      },
      {
        name: "Solar Invocation Practice 🙏",
        timing: "At sunrise — most powerful at Summer Solstice",
        duration: "15 minutes",
        what_you_need: ["An open space where you can see the sunrise or feel sunlight", "Bare skin (arms and face at minimum)"],
        steps: [
          "Rise before the sun. Step outside or near a window facing east.",
          "As the first light appears, turn to face it fully. Stand in Tadasana — mountain pose — arms at sides.",
          "Take 3 deep, full breaths as the light grows.",
          "Slowly raise your arms — first out to the sides, then overhead. Turn your palms to face the sun.",
          "Feel the sunlight entering your palms, moving down your arms, filling your chest. You are receiving the fire of the sun.",
          "Speak your solar prayer aloud: 'Great Sun, I receive your light. Fill me with courage, clarity, and radiant purpose. I am alive. I am awake. I am burning brightly.'",
          "Lower your arms slowly. Place one hand on your solar plexus. Hold the warmth there."
        ],
        closing: "Note in your journal what the fire is calling you toward today."
      }
    ],
    affirmations: [
      "I am radiant, powerful, and alive.",
      "My will is my sacred gift — I use it wisely.",
      "I transform with grace and emerge renewed.",
      "I am the light that illuminates my own path."
    ]
  },
  {
    id: "air",
    name: "Air Temple",
    element: "Air",
    symbol: "🌬️",
    icon: Wind,
    image: "https://images.unsplash.com/photo-1581058478189-fdf8d2c6925e?crop=entropy&cs=srgb&fm=jpg&w=800",
    color: { text: "text-cyan-300", bg: "bg-cyan-500/10", border: "border-cyan-500/30", accent: "cyan", glow: "shadow-cyan-500/20", gradient: "from-cyan-900/80 to-slate-900/60" },
    tagline: "Free. Clear. Expansive.",
    description: "Air is the element of mind, breath, communication, and freedom. It is the most subtle and pervasive — like thought itself, it is everywhere and nowhere, connecting all things, impossible to grasp.",
    inner: "In you, Air is your mind — your thoughts, perceptions, and the quality of your awareness. It is your breath: the most direct link between the voluntary and involuntary, between the conscious and unconscious. It is your voice — the vibration of your truth moving through the world.",
    outer: "In the world, Air is the atmosphere — the thin, precious veil of gases that makes all life possible. It is the wind that carries seeds across continents, the breath shared between all living creatures, the invisible medium through which birds fly and sound travels and weather moves.",
    nature_connection: [
      "Lie in an open field and feel the wind move over your body. Notice how it changes — gusts, lulls, temperature shifts. Let it brush away mental debris.",
      "Climb to high ground and stand with your arms spread in the wind. Let it move through you.",
      "Listen deeply to sound — wind in trees, bird calls, distant music. Practice pure listening without labeling.",
      "Blow on dandelion seeds and watch them drift. Let each one carry a prayer.",
      "Sit in morning air before sunrise and be with the quality of that first light and coolness."
    ],
    practices: [
      { name: "4-7-8 Breath", type: "Breathwork", desc: "Inhale for 4 counts. Hold for 7. Exhale for 8. This activates the parasympathetic nervous system and calms anxious air energy. Repeat 4 rounds." },
      { name: "Humming Meditation", type: "Sound", desc: "Sit comfortably and begin to hum — any note or tone that feels natural. Feel the vibration in your skull, your chest, your whole body. Humming activates the vagus nerve, activates calm, and harmonizes the Air element." },
      { name: "Thought Watching", type: "Mindfulness", desc: "Sit for 10 minutes and simply observe your thoughts as if watching clouds move across a sky. Do not follow them. Do not judge them. Simply notice: 'There is a thought.' You are the sky. The thoughts are weather." },
      { name: "Sunrise Pranayama", type: "Breathwork", desc: "At dawn, sit outside or near an open window. Practice alternate nostril breathing (Nadi Shodhana): close the right nostril with your thumb, inhale through the left; close left with ring finger, exhale through right; inhale right; exhale left. Repeat for 10 cycles." }
    ],
    embodiment: "Air embodiment is the practice of mental clarity without rigidity — the ability to think freely, communicate honestly, and hold multiple perspectives without being swept away. It is being able to change your mind with grace, to follow inspiration without losing yourself, to speak truth with kindness. Air is the element of freedom — it cannot be confined, cannot be owned, cannot be made to stand still.",
    wisdom: "Air's greatest teaching is non-attachment. Thoughts come and go like weather — they do not define you. Your beliefs are not you. Your conclusions are not permanent. The mind that can hold a thought lightly, examine it, and release it if it no longer serves — this is a free mind. And freedom is the birthright of the Air element.",
    rituals: [
      {
        name: "Sacred Smoke Ceremony (Smudging) 🙏",
        timing: "New Moon, moving to a new home, beginning a new project, or whenever energy feels heavy",
        duration: "20–30 minutes",
        what_you_need: ["Dried sage, sweetgrass, palo santo, or rosemary", "A heat-safe abalone shell or ceramic bowl", "A feather or your hand to direct smoke", "A window open for energy to exit"],
        steps: [
          "Open all windows and doors. This allows stale energy to move out as the smoke moves through.",
          "Light your plant medicine and let it catch flame briefly, then gently blow it out so it smoulders.",
          "Begin at your front door and move clockwise through your space, fanning smoke into corners, doorways, and windows.",
          "As you move, speak your clearing prayer aloud: 'I release all that is heavy, all that is old, all that no longer serves this space. I call in clarity, light, and sacred purpose.'",
          "Smudge yourself last: fan the smoke from your feet upward, over your heart, your face, and the crown of your head.",
          "When complete, close all but one window. Let the last of the smoke find its way out, carrying what you've released.",
          "State your blessing for the space: 'This space is sacred. Only love lives here.'"
        ],
        closing: "Place fresh flowers or a clear quartz crystal as a welcoming presence for the new energy."
      },
      {
        name: "Wind Prayer Ceremony 🙏",
        timing: "A windy day, or any moment when you need to release and renew",
        duration: "15 minutes",
        what_you_need: ["An outdoor space where you can feel the wind", "Seeds or flower petals or torn paper with written intentions"],
        steps: [
          "Go outside where you can feel the wind moving. Stand with your feet shoulder-width apart.",
          "Close your eyes and simply breathe with the wind. Feel it enter your lungs, move through you, leave you.",
          "Write on small pieces of paper what you are releasing — or use seeds to represent intentions you are sending out.",
          "Hold them in your open hands and speak: 'Wind, carry this for me. Carry it to where it needs to go. I release my grip. I trust what flows.'",
          "Open your hands and let the wind take what you've offered. Truly release your hands — don't chase what flies away.",
          "Stand with arms open, face upturned to the sky. Breathe in the freshness of what the wind brings in return.",
          "End with the sound of your own voice — tone, sing, or speak one clear intention for what you are calling in."
        ],
        closing: "Journal the experience. Air moves fast — capture the clarity before it drifts."
      }
    ],
    affirmations: [
      "My mind is clear, open, and free.",
      "I breathe in clarity and breathe out confusion.",
      "I communicate my truth with grace and ease.",
      "I am free — lighter than thought, freer than wind."
    ]
  },
  {
    id: "spirit",
    name: "Spirit Temple",
    element: "Spirit",
    symbol: "✨",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1754851539824-5a87c5c7cb86?crop=entropy&cs=srgb&fm=jpg&w=800",
    color: { text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/30", accent: "purple", glow: "shadow-purple-500/20", gradient: "from-purple-900/80 to-indigo-950/60" },
    tagline: "Unified. Infinite. Divine.",
    description: "Spirit — the fifth element, the quintessence — is not separate from the other four. It is the animating force that moves through all of them. It is consciousness itself: the witness, the dreamer, the sacred ground of all being.",
    inner: "In you, Spirit is your deepest nature — the part of you that is prior to thoughts, feelings, sensations, and stories. It is the awareness that is aware: still, spacious, and completely untroubled by everything that arises within it. Some traditions call it the Atman, the Soul, the True Self, Buddha Nature, or simply: Love.",
    outer: "In the world, Spirit is the invisible web of connection — the field of consciousness that underlies all matter. It is what mystics and scientists are both reaching toward when they speak of unified field theory, the quantum field, the Akashic Records, the Tao, or the Kingdom of Heaven. It is the love that moves the sun and other stars.",
    nature_connection: [
      "Sit at dusk or dawn and simply be present without any agenda. Feel yourself as part of the world rather than separate from it.",
      "Look up at the night sky and contemplate the stars. Allow the enormity of existence to wash through you without trying to make sense of it.",
      "Spend time in complete silence — no screens, no music, no speaking. Let the hum of silence become audible.",
      "Witness a birth or a death if you are given the opportunity. Be present at thresholds.",
      "Create a gratitude altar with objects from each element: a stone, a shell, a candle, a feather, and something representing Spirit to you."
    ],
    practices: [
      { name: "Open Awareness Meditation", type: "Meditation", desc: "Simply sit. Let go of any technique. Let your awareness rest in the open, spacious quality of consciousness itself — not focusing on the breath, not watching thoughts, but simply being aware that you are aware. This is the direct recognition of Spirit." },
      { name: "Ho'oponopono", type: "Prayer", desc: "A Hawaiian practice of reconciliation and forgiveness. Silently or aloud, repeat: 'I love you. I'm sorry. Please forgive me. Thank you.' Direct it toward yourself, toward others, toward the world. This practice heals the Spirit of division and separation." },
      { name: "Sacred Geometry Contemplation", type: "Meditation", desc: "Focus on the Sri Yantra, the Flower of Life, or a simple equilateral triangle. Allow the geometric pattern to be a gateway — not something to analyze, but a doorway through which awareness moves into its own source." },
      { name: "The Witness Practice", type: "Mindfulness", desc: "In any moment — especially difficult ones — ask: 'Who is aware of all this?' Not what you are thinking or feeling, but who is watching it. Rest your attention in that awareness that is prior to all content. That is Spirit in you." }
    ],
    embodiment: "Spirit embodiment is the paradox of all spiritual practice: coming fully into the body in order to realize that you are more than the body. It is not transcendence of matter but the recognition of Spirit within matter. Every atom is alive. Every breath is sacred. Every moment is already what you've been seeking. The path home is not upward into abstraction — it is downward, into the root, into the body, into this exact breath.",
    wisdom: "There is only one teaching of the Spirit Temple, and it is this: You are already whole. The sense of separation — of being lost, broken, incomplete, unworthy — is the one illusion that all spiritual practice is designed to dissolve. You are not on the way to becoming something sacred. You are already sacred, already loved, already home. The journey is learning to rest in this, to live from this, to let this truth shape every breath.",
    rituals: [
      {
        name: "Sacred Altar Building Ceremony 🙏",
        timing: "New beginnings — new year, new moon, new chapter",
        duration: "1–2 hours",
        what_you_need: ["A shelf, table, or flat surface", "Objects representing each element: stone (earth), shell or bowl of water (water), candle (fire), feather (air)", "Something sacred to you (photo, statue, crystal, heirloom)", "A cloth to cover the altar surface", "Incense or a favorite scent"],
        steps: [
          "Choose the location with intention. An altar is a place for your consciousness to land — it should feel welcoming, not cluttered.",
          "Lay the cloth. This makes the surface sacred. Choose a color that speaks to your intention.",
          "Place the earth element in the north (or wherever feels right): a crystal, stone, or small plant.",
          "Place the water element in the west: a shell, a small bowl of water, or blue/silver stones.",
          "Place the fire element in the south: a candle — light it with intention and let it burn for the full ceremony.",
          "Place the air element in the east: a feather, incense smoke, or a bell.",
          "Place Spirit at the center: whatever is most sacred to you — a deity image, a family photo, a crystal that holds your prayer.",
          "Sit before the altar, close your eyes, and in silence, dedicate this space: 'This altar is a doorway. May it remind me that Spirit lives in all things, and all things live in Spirit.'"
        ],
        closing: "Tend your altar regularly — dust it, refresh the water, light the candle. It is alive as long as you attend to it."
      },
      {
        name: "Unity Ceremony 🙏",
        timing: "Solstices, Equinoxes, or whenever division feels strong",
        duration: "20 minutes",
        what_you_need: ["A quiet space", "A candle", "Optional: a mala or rosary"],
        steps: [
          "Sit comfortably. Light a candle. Take 7 deep breaths — the number of chakras, the number of directions.",
          "Place both hands on your heart. Feel its beating — the same rhythm that has kept you alive through every experience you've ever had.",
          "Begin to bring to mind all the people you are grateful for — slowly, one by one, see their faces.",
          "Then expand: bring in people you don't know but are alive right now, across the world, their hearts also beating.",
          "Expand further: all creatures, all trees, all waters, all skies — all connected by the same life force that moves in you.",
          "Stay in this expanded awareness for as long as you can. You are not alone. You have never been alone.",
          "Speak: 'I am one. I am connected to all life. I serve from this wholeness. I love from this wholeness.'"
        ],
        closing: "The ceremony doesn't end when you blow out the candle. Carry the sense of connection into the rest of your day."
      }
    ],
    affirmations: [
      "I am one with all of life.",
      "I am whole, complete, and already home.",
      "Spirit moves through me and as me.",
      "I am love expressing itself as a human being."
    ]
  }
];

const ElementalTemples = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTemple, setActiveTemple] = useState(null);
  const [activeSection, setActiveSection] = useState("embodiment");

  const sections = [
    { id: "embodiment", label: "Embodiment" },
    { id: "inner", label: "Within You" },
    { id: "outer", label: "In Nature" },
    { id: "practices", label: "Practices" },
    { id: "rituals", label: "Rituals 🙏" },
    { id: "affirmations", label: "Affirmations" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-temples">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeTemple ? setActiveTemple(null) : navigate(-1)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Temples</p>
              <h1 className="text-xl font-serif">
                {activeTemple ? (
                  <><span className="italic" style={{ color: `var(--${activeTemple.color.accent})` }}>{activeTemple.name}</span></>
                ) : (
                  <>Elemental <span className="italic text-primary">Temples</span></>
                )}
              </h1>
            </div>
          </div>
          <Globe className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!activeTemple ? (
            /* Temple Selection Grid */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Intro */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 pt-4"
              >
                <h2 className="text-4xl font-serif mb-4">The Five <span className="italic text-primary">Elemental Temples</span></h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Each element is a doorway — into nature, into the body, into the deepest layers of the self.
                  Enter your temple and discover what this element is calling you to embody.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elements.map((el, index) => {
                  const Icon = el.icon;
                  return (
                    <motion.div
                      key={el.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => { setActiveTemple(el); setActiveSection("embodiment"); }}
                      data-testid={`temple-${el.id}`}
                      className={`group cursor-pointer relative overflow-hidden rounded-2xl border
                                 ${el.color.bg} ${el.color.border}
                                 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${el.color.glow}`}
                    >
                      {/* Image */}
                      {el.image && (
                        <div className="relative h-36 overflow-hidden">
                          <img 
                            src={el.image} 
                            alt={el.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent`} />
                          <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${el.color.bg} border ${el.color.border} flex items-center justify-center backdrop-blur-sm`}>
                            <Icon className={`w-6 h-6 ${el.color.text}`} />
                          </div>
                          <span className={`absolute top-4 right-4 text-2xl font-serif ${el.color.text}`}>{el.element}</span>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-xl font-serif mb-1">{el.name}</h3>
                        <p className={`text-sm ${el.color.text} mb-3 italic`}>{el.tagline}</p>
                        <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed">{el.description}</p>
                        <div className={`mt-4 flex items-center gap-1 text-sm ${el.color.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <ChevronRight className="w-4 h-4" />
                          <span>Enter Temple</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Individual Temple View */
            <motion.div
              key={activeTemple.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              {/* Temple Hero */}
              <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} mb-8 text-center`}>
                <activeTemple.icon className={`w-16 h-16 mx-auto mb-4 ${activeTemple.color.text}`} />
                <h2 className="text-3xl font-serif mb-2">{activeTemple.name}</h2>
                <p className={`text-lg italic ${activeTemple.color.text} mb-4`}>{activeTemple.tagline}</p>
                <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">{activeTemple.description}</p>
              </div>

              {/* Section Navigation */}
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    data-testid={`section-${sec.id}`}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      activeSection === sec.id
                        ? `${activeTemple.color.bg} ${activeTemple.color.text} border ${activeTemple.color.border}`
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {activeSection === "embodiment" && (
                    <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                      <h3 className="text-xl font-serif mb-4 flex items-center gap-2">
                        <Star className={`w-5 h-5 ${activeTemple.color.text}`} />
                        Embodying {activeTemple.element}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{activeTemple.embodiment}</p>
                    </div>
                  )}

                  {activeSection === "inner" && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                        <h3 className="text-xl font-serif mb-3">{activeTemple.element} Within You</h3>
                        <p className="text-muted-foreground leading-relaxed">{activeTemple.inner}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-lg font-serif mb-3">The Wisdom of {activeTemple.element}</h3>
                        <p className="text-muted-foreground leading-relaxed italic">{activeTemple.wisdom}</p>
                      </div>
                    </div>
                  )}

                  {activeSection === "outer" && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                        <h3 className="text-xl font-serif mb-3">{activeTemple.element} in the World</h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">{activeTemple.outer}</p>
                        <h4 className="font-medium mb-3">Nature Connection Practices</h4>
                        <ul className="space-y-3">
                          {activeTemple.nature_connection.map((practice, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0 mt-0.5`}>
                                {i + 1}
                              </span>
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeSection === "practices" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeTemple.practices.map((practice, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-5 rounded-xl border ${activeTemple.color.bg} ${activeTemple.color.border}`}
                          data-testid={`practice-card-${i}`}
                        >
                          <span className={`text-xs ${activeTemple.color.text} uppercase tracking-wider`}>{practice.type}</span>
                          <h4 className="font-serif text-base mt-1 mb-2">{practice.name}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{practice.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === "rituals" && (
                    <div className="space-y-6">
                      <p className="text-muted-foreground text-sm">Sacred ceremonies for embodying the {activeTemple.element} element in your life. 🙏</p>
                      {(activeTemple.rituals || []).map((ritual, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`rounded-2xl border overflow-hidden ${activeTemple.color.border}`}
                          data-testid={`ritual-${i}`}
                        >
                          <div className={`p-5 ${activeTemple.color.bg}`}>
                            <h3 className="text-lg font-serif mb-1">{ritual.name}</h3>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Star className={`w-3 h-3 ${activeTemple.color.text}`} />{ritual.timing}</span>
                              <span>{ritual.duration}</span>
                            </div>
                          </div>
                          <div className="p-5 bg-white/3 space-y-4">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">You Will Need</p>
                              <div className="flex flex-wrap gap-2">
                                {ritual.what_you_need.map((item, j) => (
                                  <span key={j} className={`px-2.5 py-1 rounded-full text-xs border ${activeTemple.color.bg} ${activeTemple.color.text} ${activeTemple.color.border}`}>{item}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">The Practice</p>
                              <ol className="space-y-3">
                                {ritual.steps.map((step, j) => (
                                  <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                                    <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0`}>{j + 1}</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                            <div className={`p-3 rounded-xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                              <p className="text-xs text-muted-foreground/80 italic">{ritual.closing}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === "affirmations" && (
                    <div className={`p-8 rounded-2xl ${activeTemple.color.bg} border ${activeTemple.color.border} text-center`}>
                      <h3 className="text-xl font-serif mb-6">{activeTemple.element} Affirmations</h3>
                      <div className="space-y-4">
                        {activeTemple.affirmations.map((aff, i) => (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`text-lg font-serif italic ${activeTemple.color.text} leading-relaxed`}
                          >
                            "{aff}"
                          </motion.p>
                        ))}
                      </div>
                      <p className="mt-8 text-xs text-muted-foreground uppercase tracking-widest">
                        Speak these aloud with your hand on your heart
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ElementalTemples;
