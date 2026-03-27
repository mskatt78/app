import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mountain, Waves, Flame, Wind, Sparkles, ChevronRight, X, Star, Leaf, Droplets, Zap, Eye, Globe, Heart, Moon, Sun, Music } from "lucide-react";

// Icon mapping for element ids (React components can't be stored in MongoDB)
const ELEMENT_ICONS = {
  mountain: Mountain,
  waves: Waves,
  flame: Flame,
  wind: Wind,
  sparkles: Sparkles,
};

const STATIC_ELEMENTS = [
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
      { name: "Earth Element Meditation", type: "Meditation", desc: "Close your eyes and imagine roots growing from the soles of your feet deep into the earth. Feel yourself being held. Feel the mineral richness of the earth feeding your roots. You are nourished. You belong here." },
      { name: "Shinrin-yoku (Forest Bathing)", type: "Nature", desc: "Spend 30-90 minutes walking slowly through a forest with no agenda. Not exercise — presence. Touch the bark of trees. Breathe deeply. Studies show forest bathing lowers cortisol, blood pressure, and activates natural killer cells for immunity." },
      { name: "Stone Circle Meditation", type: "Meditation", desc: "Collect seven stones that call to you. Arrange them in a circle large enough to sit inside. Sit in the center. Feel the ancient wisdom of stone — millions of years of patience — entering your body. Each stone is a teacher." },
      { name: "Ancestor Earth Offering", type: "Ritual", desc: "Dig a small hole in earth. Offer food: seeds, grain, fruit. Speak the names of your ancestors who worked this element — farmers, gardeners, those who knew the land. Cover the offering. Feel the circuit of gratitude closing." },
      { name: "Clay Body Work", type: "Somatic", desc: "Work with natural clay — mold it, shape it, feel its earthy weight and coolness. Let your hands remember that you too are made of earth. When you are done, return the clay to the earth with gratitude." }
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
      },
      {
        name: "Crystal Grid Earth Activation 🙏",
        timing: "New Moon or when manifesting material/physical desires",
        duration: "45 minutes",
        what_you_need: ["6-8 crystals of your choice", "A central anchor crystal (clear quartz or obsidian)", "A cloth or flat natural surface", "Pen and paper for intention", "Optional: dried herbs (rosemary, mugwort, sage)"],
        steps: [
          "Clear your space by smudging or opening windows. Set the intention that this grid serves your highest good.",
          "Write your Earth intention on paper: a specific physical desire — health, home, abundance, stability.",
          "Fold the paper and place it in the center of your cloth.",
          "Place your central crystal on top of the paper, speaking your intention into it.",
          "Arrange your other crystals in a pattern around the center — a circle, a star, or whatever feels right.",
          "Starting from the outside, use a pointed crystal (or your finger) to 'connect' each crystal to the center, drawing lines of light.",
          "Speak your intention aloud three times.",
          "Leave the grid in place for one full moon cycle (28 days), adding to it or refreshing it as guided."
        ],
        closing: "Visit your grid daily, even briefly. Place your hands above it and feel the energy. Add flowers, herbs, or water as the grid calls for tending."
      },
      {
        name: "Ancestral Earth Healing Ritual 🙏",
        timing: "Samhain (Oct 31), winter solstice, or when called by ancestral healing",
        duration: "1 hour",
        what_you_need: ["Photos of ancestors or written names", "Foods they loved or traditional foods of your lineage", "A candle per ancestor honored", "Earth from your homeland (if possible)", "A bowl of water"],
        steps: [
          "Set up a simple altar with photos or names of your ancestors on a cloth. Arrange the candles and food offerings.",
          "Light the candles one at a time, speaking each ancestor's name: 'I call on [name]. I welcome you. I honor you.'",
          "If you have homeland earth, hold it in your hands. Feel the land your people came from. Feel the centuries of your lineage living within you.",
          "Speak aloud: 'To all my ancestors of love and healing — I am grateful for the gift of life. I carry your wisdom. I heal what needs healing in our lineage.'",
          "Eat the traditional food consciously — this is communion with your ancestral line.",
          "Sit in silence for 10 minutes. What do you feel? What arises from the earth of your roots?",
          "Speak a prayer for the healing of your lineage: 'May all wounding in my ancestral line be healed. May I receive only the gifts of my ancestors. May I pass on only wisdom to those who come after me.'"
        ],
        closing: "Offer the food to the earth outside after the ceremony. The ancestors are fed when you feed the land."
      }
    ],
    ceremonies: [
      {
        name: "Community Earth Blessing Ceremony",
        timing: "Spring Equinox or Earth Day",
        duration: "1–2 hours (group)",
        description: "A ceremony for gathering with others to honor the Earth, strengthen community roots, and co-create collective intentions for the land you all share.",
        what_you_need: ["Enough stones for each participant", "A central altar space outdoors", "Food to share (a potluck or simple feast)", "A drum or percussion"],
        flow: [
          "Gather in a circle outdoors. Each person brings one stone they have collected with intention.",
          "Open with a land acknowledgement — naming the Indigenous people who cared for this land before you.",
          "Each person speaks their stone's message to the group: 'This stone carries...' or 'I offer this stone for...'",
          "Place stones together in a central pile — creating a shared altar of community intention.",
          "Share food in gratitude, telling stories of your roots: where you come from, what grounds you.",
          "Close with a collective Earth prayer spoken in unison.",
          "Leave the stone altar as a blessing for the land."
        ],
        closing_prayer: "We are of this Earth. We tend this Earth. We give back what we have received. The Earth is sacred, and so are we."
      },
      {
        name: "Harvest Thanksgiving Ceremony",
        timing: "Autumn Equinox or local harvest season",
        duration: "1 hour",
        description: "A ceremony of deep gratitude for the abundance the Earth provides — acknowledging all the seen and unseen labor, love, and life that went into the food on your table.",
        what_you_need: ["Local, seasonal foods", "An outdoor space or kitchen table decorated as altar", "Candles in autumn colors (gold, orange, brown)", "A journal"],
        flow: [
          "Before eating, gather around the food. Take three breaths together in silence.",
          "Trace the food backward: thank the cook, the delivery person, the farmer, the soil, the rain, the sun.",
          "Each person names one specific thing they are grateful to the Earth for this year.",
          "Pour a small offering of drink onto the earth or into a plant — a physical act of returning thanks.",
          "Eat slowly, savoring each bite as a sacred act of receiving Earth's abundance.",
          "After eating, journal: 'What did I receive from the Earth this year that I did not acknowledge?'"
        ],
        closing_prayer: "Thank you, Earth, for feeding us. We vow to tend you in return, for you are our body, and we are yours."
      }
    ],
    blessings: [
      {
        name: "Morning Earth Blessing",
        when: "First thing in the morning, before leaving your home",
        text: "Mother Earth, thank you for holding me through the night. Thank you for the body I inhabit — this magnificent, ancient vessel made of your very substance. Today I walk in gratitude upon you. May every step I take be a blessing, and may I remember, in each ordinary moment, that the ground beneath my feet is holy. So it is."
      },
      {
        name: "Before Eating Blessing",
        when: "Before any meal",
        text: "I give thanks to all the life that gave its life for mine. To the soil, the rain, the sun, the hands that tended and harvested. To the ancient mycelial networks that carried nutrients across miles of earth so that this food could arrive at my table. I receive this food with reverence. May it nourish every cell of my being."
      },
      {
        name: "Body Gratitude Blessing",
        when: "When touching your body — during bathing, dressing, or feeling pain",
        text: "This body is Earth made conscious. These bones are ancient minerals. This blood is ocean. I bless every part of this body — not for what it looks like, but for what it does. For every breath taken without my asking. For every heartbeat, every healing, every step. I am grateful to live in this body. This body is sacred ground."
      },
      {
        name: "Land Acknowledgement Blessing",
        when: "When arriving in a new place or beginning ceremonies outdoors",
        text: "I acknowledge that I stand on land that has been tended, loved, and made sacred by those who came before me. I honor the original peoples of this land and their deep relationship with these stones, these trees, these waters. I ask permission to be here. I offer my respect and my care. May I walk as a guest who honors the home of others."
      },
      {
        name: "Night Earth Return Blessing",
        when: "Before sleep",
        text: "Earth, I return to you in dreams as I do in death — with complete trust and surrender. As I lay my body down, I release the day back to you. Take what needs composting. Return to me what serves my growth. I am your child. I am safe. I am held. Thank you for another day of this extraordinary gift of embodied life."
      }
    ],
    affirmations: [
      "I am rooted, safe, and held by the Earth.",
      "My body is sacred ground.",
      "I am patient, present, and fully here.",
      "I belong to this earth, and the earth belongs to me.",
      "I am nourished, supported, and abundantly provided for.",
      "My roots go deep — I am stable in all storms.",
      "I trust the slow wisdom of the Earth within me.",
      "I am made of stars and soil — both ancient, both sacred."
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
      { name: "Moon Water Meditation", type: "Meditation", desc: "On a full moon night, place a glass of water in the moonlight. In meditation, imagine the moon's silver light filling your emotional body, clearing and cleansing like a gentle tide. Drink the moon water in the morning." },
      { name: "Ocean Breath (Ujjayi)", type: "Breathwork", desc: "Breathe in and out through the nose with a slight constriction at the back of the throat, creating an ocean-wave sound. This pranayama calms the nervous system, regulates emotion, and connects you to the rhythm of the tides." },
      { name: "Water Mirror Gazing", type: "Reflection", desc: "Fill a dark bowl with water and sit before it in candlelight. Gaze softly at your reflection without judgment. Let the water show you what you carry. What emotions rise as you look at yourself? What do you need to receive from yourself today?" },
      { name: "Emotion Mapping", type: "Somatic", desc: "Close your eyes. Scan your body for where you are holding emotions. Name the location and the sensation — not the story, just the physical feeling. Breathe into that place. Let the water of your inner body begin to move what has been stuck." },
      { name: "Swimming Meditation", type: "Movement", desc: "If you have access to water — ocean, lake, river, or pool — enter it slowly and consciously. Float on your back. Surrender completely to being held. Feel the water receiving the full weight of your body. This is what trust feels like." }
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
      },
      {
        name: "Ancestors of Water Ritual 🙏",
        timing: "Any water body — especially at the ocean",
        duration: "30–45 minutes",
        what_you_need: ["A body of water or a large bowl", "Flowers or herbs", "A photograph or written names of ancestors", "Blue or white candle"],
        steps: [
          "Go to water — the ocean is most powerful, but any natural water will do. Light your candle at the water's edge.",
          "Hold your ancestor photos or names to your heart. Remember: all life came from the ocean. Your first home was water — the amniotic fluid. Your ancestors' first home was the primordial ocean.",
          "Speak: 'To all my ancestors who crossed oceans, who drew water from wells, who prayed at riversides, who were born and died near water — I remember you.'",
          "Cast your flowers onto the water one by one, naming what each flower represents: one for grief, one for love, one for gratitude, one for healing.",
          "Stand in the water if possible — feet at minimum. Feel the meeting point of land and sea — this threshold is sacred in every culture.",
          "Ask the water to carry your healing prayers to your entire lineage: backward through time and forward into the future.",
          "Speak a final blessing: 'May the waters of my lineage flow clear. May I receive the gifts of my ancestors. May I heal what was wounded. So it is.'"
        ],
        closing: "Take some of the water home and use it to water a plant or add to your bath as a connection to this ceremony."
      },
      {
        name: "New Moon Dark Waters Ritual 🙏",
        timing: "New Moon — the dark phase",
        duration: "20 minutes",
        what_you_need: ["A bowl of dark water (add a drop of black ink or use a dark ceramic bowl)", "A silver or black candle", "Your journal"],
        steps: [
          "On the new moon night, create a dark water mirror: a bowl of water where you can see darkness, not reflection.",
          "Light your candle. Sit in the darkness with only the candle and the bowl.",
          "Gaze into the dark water and ask: 'What needs to be born in this new cycle? What is gestating in the dark waters of my unconscious?'",
          "Breathe and wait. Notice what images, feelings, or words arise from the depths.",
          "Speak your new moon intentions into the water: the seeds you are planting in the dark, before anyone can see them.",
          "Seal with: 'In the darkness, life begins. I trust what is growing in the unseen.'",
          "Pour the water onto the earth and journal for 10 minutes about what you received."
        ],
        closing: "New moon water ritual works with the UNSEEN — the underground spring, the seed in the dark, the dream before waking. Trust the mystery."
      }
    ],
    ceremonies: [
      {
        name: "Water Keeper Ceremony",
        timing: "World Water Day (March 22), or any watershed celebration",
        duration: "1–2 hours (group)",
        description: "Drawn from Indigenous water keeper traditions — a ceremony to honor water as a living being with rights, intelligence, and sacred purpose. This ceremony awakens the inner water keeper in every participant.",
        what_you_need: ["A bowl of water from a local source (river, rain, or spring)", "Blue and white flowers or offerings", "A drum", "Enough cups for all participants"],
        flow: [
          "Gather at a water source or around a central bowl. Begin with silence and three deep breaths.",
          "Share about the water: where it comes from, what it connects to, what makes it sacred in this place.",
          "Each participant speaks to the water — thanks, prayers, apologies for how we have treated the waters of the world.",
          "Pass a cup of water and each person offers a word into it before passing it on.",
          "The final cup is offered back to the earth, the river, or poured into a plant as a return.",
          "Close by making one collective commitment to the water — something concrete each person will do."
        ],
        closing_prayer: "Water is life. We are water. What we do to water, we do to ourselves. We choose to be keepers."
      },
      {
        name: "Community Grief Ceremony at Water",
        timing: "After collective loss — disaster, death, end of cycle",
        duration: "1 hour (group)",
        description: "Water is the element of grief. This ceremony creates a sacred container for collective mourning and emotional release — returning what needs to be returned to the great waters.",
        what_you_need: ["Access to water (or a large central bowl)", "Biodegradable offerings (flowers, leaves, paper)"],
        flow: [
          "Gather near water. Open by naming what has been lost — collectively, honestly.",
          "Period of open weeping, toning, or silent tears — all are honored.",
          "Each person speaks their grief aloud: 'I am grieving...'",
          "Offerings are cast into the water one by one — each one carrying a specific grief.",
          "Wait in silence for the water to receive and transform.",
          "Close with a song, a prayer, or simply sitting together in the changed silence."
        ],
        closing_prayer: "We give our grief to the water. The water receives all things. In the giving, we are made new."
      }
    ],
    blessings: [
      {
        name: "Morning Water Blessing",
        when: "Before drinking your first water of the day",
        text: "Sacred water, thank you for carrying life to me this morning. You have traveled through clouds, through mountains, through ancient aquifers to reach my lips. I receive you with full gratitude. May you carry love into every cell of my body. May I remember that I am mostly you — that the ocean lives in me, and I live in the ocean."
      },
      {
        name: "Before Bathing Blessing",
        when: "As you draw a bath or step into the shower",
        text: "I bless this water. I ask it to wash from me not just the physical but the energetic — the tension, the worry, the old stories I carry on my skin. I give thanks for this abundance: that clean water flows for me, that I am held in warmth and safety. May this bath be sacred. May I emerge renewed."
      },
      {
        name: "Tears Blessing",
        when: "When you are crying or feel like crying",
        text: "These tears are sacred. They are not weakness — they are intelligence. They are water returning to the ocean. I give permission for this water to flow. I honor what is being grieved, felt, released. Tears are the body's most ancient way of being honest. I receive this gift of feeling with gratitude and complete permission."
      },
      {
        name: "Rain Blessing",
        when: "When it begins to rain",
        text: "The sky is crying its blessings on the Earth. The rain remembers us — it falls on the just and the unjust alike, on the forest and the city, on the grief-stricken and the joyful. I receive this ancient water. I let it touch me. Rain, bless this land. Bless these stones and roots and the seeds sleeping in the dark. We are grateful."
      },
      {
        name: "Water Body Blessing",
        when: "When near a river, ocean, or lake",
        text: "I honor you — ancient water, flowing long before I arrived on this Earth and continuing long after I leave. You have shaped canyons and coastlines with patience beyond measure. You carry the memory of everything that has ever dissolved in you. I am honored to stand at your edge. I offer my respect and my prayer. Bless all who depend on you."
      }
    ],
    affirmations: [
      "I am fluid, adaptive, and free.",
      "My emotions are messengers, not enemies.",
      "I trust the wisdom of my feeling body.",
      "Like water, I can flow through any obstacle.",
      "I move with the current of life, not against it.",
      "My tears are holy water — they heal what they touch.",
      "I am held by the ancient waters of life.",
      "I flow, I feel, I release — I am water."
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
      { name: "Fire Ceremony", type: "Ritual", desc: "Write on paper what you are releasing. Read each thing aloud with conviction: 'I release...' Then burn the paper. As it burns, say: 'I am free. I am renewed. I am light.' Watch the smoke carry your intentions skyward." },
      { name: "Agni Sara (Fire Wash)", type: "Breathwork", desc: "Exhale completely, hold the breath out, and rapidly pump your abdominal muscles in and out (churning). Repeat 10-20 pumps, then inhale. This practice stokes the digestive fire, clears stagnation, and awakens solar plexus energy." },
      { name: "Surya Namaskar (Sun Salutation)", type: "Movement", desc: "12 sacred postures honoring the sun — practiced with devotion, each posture a prayer. At sunrise, face east and offer each round as gratitude to the solar fire that makes all life possible." },
      { name: "Authentic Expression Practice", type: "Somatic", desc: "Stand before a mirror. Let yourself fully be seen. Practice speaking your truth aloud — even if your voice shakes. Fire is your voice, your boundaries, your unapologetic presence. Shout if needed. Sing. Speak what has been silenced." },
      { name: "Visualization: Inner Sun", type: "Meditation", desc: "Close your eyes. In your solar plexus, imagine a small sun — golden and brilliant. With each breath, let it grow larger: expanding until it fills your entire chest, then your whole body, then radiating beyond your body into the room. You ARE light." }
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
      },
      {
        name: "Shadow Fire Burning Ritual 🙏",
        timing: "When carrying shame, self-judgment, or old wounds",
        duration: "30 minutes",
        what_you_need: ["A candle (red, orange, or gold)", "Paper and pen", "A fire-safe bowl"],
        steps: [
          "Light your candle. Sit in the warmth of its light.",
          "Write on paper all the things you judge in yourself — the parts you hide, the shame you carry, the ways you believe you are not enough.",
          "Read each item aloud: 'I have been ashamed of...' 'I have hidden...' 'I have believed I am not enough because...'",
          "Then, for each item, write underneath it: 'This is part of my humanity. The fire loves all of me. I release the shame but I keep the lesson.'",
          "Light the paper with your candle flame and place it in the fire-safe bowl to burn.",
          "Watch the shame transform into light, heat, and smoke.",
          "Say: 'I am not my wounds. I am the fire that transforms them. I am free.'"
        ],
        closing: "Take the ash outside and scatter it in wind or water. The shadow, burned consciously, becomes fuel for your light."
      },
      {
        name: "Passion Activation Ceremony 🙏",
        timing: "When feeling flat, unmotivated, or disconnected from purpose",
        duration: "20 minutes",
        what_you_need: ["Red or orange candle", "Something that represents your passion (a musical instrument, art materials, your journal, work tools)", "Energizing music"],
        steps: [
          "Light your candle. Put on music that moves you — drums, chanting, anything with fire in it.",
          "Stand up. Breathe deeply into your belly.",
          "Begin to move — nothing choreographed, nothing performative. Let your body show you what it wants to do.",
          "As you move, let yourself make sound — grunt, hum, shout, or sing. Fire lives in the voice.",
          "After 5 minutes of movement, stand still with your hands on your solar plexus.",
          "Ask: 'What does my fire want to create? What am I most afraid to want? What am I burning for?'",
          "Write for 10 minutes without stopping. The fire answers through the moving hand."
        ],
        closing: "Commit to ONE action this week that honors your fire. Do it even if imperfectly."
      }
    ],
    ceremonies: [
      {
        name: "Beltane Fire Ceremony",
        timing: "May 1 (Beltane) or any celebration of life, fertility, and passion",
        duration: "1–2 hours (group)",
        description: "The ancient Celtic fire festival of Beltane celebrates the full force of spring, the return of the sun's power, and the sacred marriage of masculine and feminine forces. Jumping the fire was the central act — a leap of faith and transformation.",
        what_you_need: ["A safe bonfire or large fire", "Ribbons in red, orange, gold", "Flower garlands", "Drum and music", "Permission to be joyful"],
        flow: [
          "Gather as the sun sets. Build and light the fire with ceremony.",
          "Circle the fire three times, each circle representing something you are releasing from the last half-year.",
          "Tie ribbons to a maypole or tree, weaving the community's energy together.",
          "One by one (or in pairs), participants leap over a smaller fire or through the smoke — making a wish, setting an intention.",
          "Dance around the fire. Celebrate. This is the element of aliveness.",
          "Share food, stories, and songs until the fire naturally dies."
        ],
        closing_prayer: "We leap through the fire and emerge renewed. The flame within each of us burns brighter. We are alive. We are grateful."
      },
      {
        name: "New Year Fire Ceremony",
        timing: "Any year threshold — new year, birthday, solstice",
        duration: "1 hour (group or solo)",
        description: "A ceremony to ritually close one chapter and ignite the next — using fire as the transformational element to burn what was, and illuminate what is being born.",
        what_you_need: ["A fire (candle or bonfire)", "Paper for each participant", "Pens", "A drum or rattle"],
        flow: [
          "Begin with silent reflection: what has this last cycle taught you?",
          "Write what you are releasing on one piece of paper.",
          "Write what you are calling in on another.",
          "Read each release aloud to the group. Burn them.",
          "Read each calling-in aloud. Keep these papers — they are your fire-seeds.",
          "Close with a collective prayer for the new cycle."
        ],
        closing_prayer: "What was needed has been given. What is no longer needed is released. We step into the new cycle with clear hearts and burning intention."
      }
    ],
    blessings: [
      {
        name: "Morning Fire Blessing",
        when: "At the first light of dawn or when lighting a morning candle",
        text: "Sacred fire, thank you for returning with the sun. I receive the light of this new day as a gift. May the fire within me burn brightly today — the fire of my will, my creativity, my courage, and my love. May I be warm without burning, bright without blinding, powerful without dominating. I am fire. I am light. I am alive."
      },
      {
        name: "Blessing Before Creative Work",
        when: "Before starting any creative project, writing, art, or passionate work",
        text: "I call on the sacred fire of creation. May it move through my hands, my voice, my vision — without obstruction, without self-censorship, without fear. I offer this work to the fire. May it burn away anything that is not true, and keep only what is real and necessary. May my work carry light into the world."
      },
      {
        name: "Solar Plexus Blessing",
        when: "When doubting yourself or facing a challenge that requires courage",
        text: "I bless the fire at my center. I acknowledge my power — not to control or override others, but the quiet, unbreakable certainty of knowing who I am and what I stand for. I breathe into my solar plexus and I call my power home. All the courage I have ever given away, I call it back now. I am enough. I am ready. I am fire."
      },
      {
        name: "Candle Lighting Blessing",
        when: "Each time you light a candle",
        text: "I light this fire with intention. May this flame carry my prayer to all who need it. May it be a beacon for anyone who is lost, warmth for anyone who is cold, courage for anyone who is afraid. This small flame is a piece of the great sun. This small life is a piece of the great fire of creation."
      },
      {
        name: "Cooking Fire Blessing",
        when: "Before cooking a meal",
        text: "I bless this fire that transforms raw earth into nourishment. I am participating in an act of alchemy that humans have performed for a million years — gathering around fire, transforming ingredients into medicine, feeding the people we love. May this meal carry the fire's blessing. May all who eat it be warmed, nourished, and ignited."
      }
    ],
    affirmations: [
      "I am radiant, powerful, and alive.",
      "My will is my sacred gift — I use it wisely.",
      "I transform with grace and emerge renewed.",
      "I am the light that illuminates my own path.",
      "My passion is my prayer — I follow it without apology.",
      "I have the courage to be fully, unapologetically myself.",
      "The fire within me burns bright and steady.",
      "I create, I express, I transform — I am fire."
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
      { name: "Sunrise Pranayama", type: "Breathwork", desc: "At dawn, sit outside or near an open window. Practice alternate nostril breathing (Nadi Shodhana): close the right nostril with your thumb, inhale through the left; close left with ring finger, exhale through right; inhale right; exhale left. Repeat for 10 cycles." },
      { name: "Kite Flying Meditation", type: "Nature", desc: "Fly a kite or watch one being flown. Feel yourself as the kite — carried by the wind, dancing freely, yet held by the thread of your own center. The Air element asks: how freely can you move while staying connected to what matters?" },
      { name: "Free Writing", type: "Creative", desc: "Set a timer for 10 minutes. Write without stopping, without editing, without reading back. This is Air mind — uncensored, flowing, alive. The pen is the breath. The page is the sky. Let yourself be surprised by what emerges." },
      { name: "Chanting / Toning", type: "Sound", desc: "Choose a vowel sound (A, E, I, O, U, or sacred sounds like OM, AH, HU, EH). Tone it on a single breath, sustaining the vibration. Feel how it resonates differently in different parts of your body. Voice is the most direct expression of the Air element." },
      { name: "Walking Meditation", type: "Movement", desc: "Walk slowly — one step per full breath. With each inhale, lift one foot. With each exhale, place it down. Feel the air on your skin, the sounds around you, the movement of clouds. This is walking as prayer." }
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
      },
      {
        name: "Dawn Air Awakening Ritual 🙏",
        timing: "At the first light of dawn, especially at Imbolc or Spring Equinox",
        duration: "20 minutes",
        what_you_need: ["An open window or doorway facing east", "A feather (to represent Air)", "A bell or wind chimes (if available)", "A journal"],
        steps: [
          "Rise just before dawn. Stand or sit at an east-facing window or outdoors.",
          "Hold your feather. Feel its lightness — this is the nature of Air. It carries without holding. It touches without grasping.",
          "As the first light appears, take three deep breaths — longer exhale than inhale, letting the night's staleness out.",
          "Ring your bell or move your wind chimes. The sound is Air made visible as vibration.",
          "Speak your dawn invocation: 'I welcome the Air of this new day. I open my mind to receive new thoughts. I open my voice to speak new truths. I open my arms to a new beginning.'",
          "Fan your feather around your head and crown — clearing any mental fog from sleep.",
          "Write for 5 minutes: the first thoughts of the day, uncensored. These are Air's first transmissions."
        ],
        closing: "Carry the feather in your pocket throughout the day as a reminder to stay light, curious, and open."
      },
      {
        name: "Truth Speaking Ritual 🙏",
        timing: "Before difficult conversations, creative presentations, or any time you need to speak your truth",
        duration: "10 minutes",
        what_you_need: ["A quiet space", "Blue lace agate or aquamarine crystal (optional)", "A candle (blue)"],
        steps: [
          "Sit quietly and place your hand on your throat.",
          "Breathe slowly. Feel any tightness, constriction, or fear in your throat. Simply acknowledge it: 'I see you. You are protecting me. I thank you.'",
          "Breathe in blue light — the color of your throat chakra — and feel it softening the tension.",
          "Speak aloud what you are afraid to say — in private, before you say it to anyone else. Hear your own voice holding your truth.",
          "Say: 'My voice is safe. My truth is worthy of being heard. I speak with clarity, kindness, and courage.'",
          "Take three full, deep breaths — expanding your chest, opening your throat.",
          "Walk forward into your conversation knowing: the Air element supports every authentic word."
        ],
        closing: "After the conversation, come back to this practice to release whatever arose and restore your throat's openness."
      }
    ],
    ceremonies: [
      {
        name: "Community Intention Ceremony at Sunrise",
        timing: "Spring Equinox, Imbolc, or any community new beginning",
        duration: "1 hour (group)",
        description: "A ceremony using the Air element's gift of communication and connection — gathering voices to speak intentions into the new dawn, releasing them to the wind.",
        what_you_need: ["An east-facing outdoor space", "Paper strips for each person", "A bowl and lighter (for burning or casting)", "A bell"],
        flow: [
          "Gather at dawn in a circle, all facing east.",
          "Each person writes one intention for the community on a paper strip.",
          "Open with a bell ringing and three collective breaths.",
          "Each person reads their intention aloud to the group.",
          "Tear the paper strips and cast them to the wind — or burn them together.",
          "Close with a collective hum or tone — every voice united in the Air."
        ],
        closing_prayer: "We breathe together. Our words carry our dreams. May the winds of this new day carry our intentions to their perfect fulfillment."
      },
      {
        name: "Sound Bath Ceremony",
        timing: "Any gathering that needs clearing and renewal",
        duration: "45 minutes–1 hour (group)",
        description: "A communal ceremony of sound healing — using voice, bowls, bells, and breath to clear the collective field and restore harmony. Sound is Air made sacred.",
        what_you_need: ["Singing bowls, chimes, bells, or simply voices", "A comfortable lying-down space for each participant", "Optional: feathers to distribute"],
        flow: [
          "Participants lie down comfortably. Begin with guided breathing — syncing the group's breath.",
          "Open with a long, collective hum — all voices together until harmony is felt.",
          "The leader moves through the space with bowls or bells, directing sound to each person.",
          "Invite participants to tone or hum themselves if inspired.",
          "Close with silence — at least 3 minutes of shared quiet after sound.",
          "Each person shares in one word: what they received."
        ],
        closing_prayer: "The air between us is sacred. The sound we have made together has woven us into one field. We are one breath."
      }
    ],
    blessings: [
      {
        name: "Morning Breath Blessing",
        when: "First conscious breath of the day",
        text: "I receive this breath — the first of a new day. This breath has been circling this planet for billions of years. It has been breathed by forests and oceans, by ancient peoples and future children. I am in communion with all life through this single breath. Thank you, Air. Thank you, lungs. Thank you, this day."
      },
      {
        name: "Blessing Before Speaking",
        when: "Before any important conversation or public speaking",
        text: "May the Air carry my words with kindness. May I speak only what is true, necessary, and helpful. May I listen as fully as I speak. May the space between my words be as sacred as the words themselves. Air, guide my voice. Let my truth be clear and my heart be open."
      },
      {
        name: "Wind Blessing",
        when: "When you feel the wind on your face",
        text: "I receive this wind as a blessing. It has come from far away, carrying the breath of forests, oceans, and sacred places. It touches me without holding me — teaching me about love that is free. Wind, blow away what is stale in my thinking. Bring fresh air to my mind and my heart. I am grateful for your wild, uncontrollable freedom."
      },
      {
        name: "Blessing of New Beginnings",
        when: "At the beginning of a new chapter, project, or day",
        text: "Air of new beginnings — I open my lungs and my life to you. Breathe new possibilities into me. Clear the old air of the past chapter from my cells. I am empty and ready to be filled. I release the need to know what comes next. I trust the breath. I trust the wind. I am lighter than I was yesterday."
      },
      {
        name: "Blessing of Clear Mind",
        when: "When feeling overwhelmed, scattered, or mentally foggy",
        text: "I ask for the clarity of Air. I ask for the quality of a fresh mountain breeze — cool, clean, and clarifying. Let my thoughts settle like leaves after a wind. Let only what is essential remain. I breathe in clarity. I breathe out confusion. My mind is clear. My path is visible. I can take the next step."
      }
    ],
    affirmations: [
      "My mind is clear, open, and free.",
      "I breathe in clarity and breathe out confusion.",
      "I communicate my truth with grace and ease.",
      "I am free — lighter than thought, freer than wind.",
      "My words carry healing and truth wherever they travel.",
      "I am curious, open-minded, and easily inspired.",
      "I release what no longer serves and breathe in what is new.",
      "I am the breath of life — always moving, always renewing."
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
      { name: "The Witness Practice", type: "Mindfulness", desc: "In any moment — especially difficult ones — ask: 'Who is aware of all this?' Not what you are thinking or feeling, but who is watching it. Rest your attention in that awareness that is prior to all content. That is Spirit in you." },
      { name: "Loving-Kindness (Metta) Meditation", type: "Meditation", desc: "Begin with: 'May I be happy, may I be safe, may I be healthy, may I live with ease.' Then expand: May my loved ones... May neutral people... May all beings everywhere be happy, safe, healthy, and at ease. This practice dissolves the boundaries between self and other." },
      { name: "Nature Immersion", type: "Nature", desc: "Sit in nature with absolutely no agenda — no phone, no book, no plan. Just be. Let the intelligence of the natural world hold you. Notice what happens when you stop trying to have an experience and simply allow experience to arise. This is Spirit practice." },
      { name: "Gratitude Contemplation", type: "Meditation", desc: "Sit quietly and bring to mind everything you are grateful for. Start with the small: your next breath. The warmth of the sun. Then expand. Let gratitude open into wonder: that anything exists at all. That you are here. That consciousness experiences itself through your eyes. Wonder IS Spirit." },
      { name: "Devotional Practice (Bhakti)", type: "Prayer", desc: "Choose a form of the divine that moves you — whether a deity, a quality (Love, Truth, Beauty), or pure consciousness. Make simple daily offerings: a flower, a word, a bow. Let devotion dissolve the ego's sense of separation. When you bow to the divine, the divine bows back." }
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
      },
      {
        name: "Vigil of Sacred Darkness 🙏",
        timing: "Winter Solstice or any night of deep transition",
        duration: "Dusk to dawn (or a portion)",
        what_you_need: ["A safe, comfortable space", "A single candle", "Warm blankets", "Journal and pen", "Optional: sacred text or music"],
        steps: [
          "Begin at dusk. Light one candle — let it be the only light.",
          "Sit in the near-darkness and simply be with the longest night. Notice resistance, boredom, fear. These are the guardians at the threshold of Spirit.",
          "At midnight (or after an hour), extinguish the candle. Sit in complete darkness for 10-15 minutes.",
          "In the dark, ask: 'What is alive in me that does not require light? What do I know that cannot be seen?'",
          "Relight the candle. This small flame in the darkness is one of the most ancient human acts — carrying its own enormous meaning.",
          "Journal by candlelight. What arose in the darkness? What gift did the vigil bring?",
          "Welcome the dawn consciously, watching the light return. This is the teaching: light always returns."
        ],
        closing: "The vigil teaches that you can be present with what is uncomfortable, unknown, and unlit — and survive. You can find Spirit even in the darkest places."
      },
      {
        name: "Five Element Integration Ceremony 🙏",
        timing: "Equinoxes, birthdays, significant completions",
        duration: "45–60 minutes",
        what_you_need: ["Earth: a stone or handful of soil", "Water: a bowl or glass", "Fire: a candle", "Air: a feather or bell", "Spirit: a crystal or sacred object"],
        steps: [
          "Create a sacred space with each elemental object placed in its direction.",
          "Begin with Earth: hold the stone. Feel your physical body, your ancestry, your roots. Give thanks for being embodied.",
          "Move to Water: hold the bowl. Feel your emotional body, your intuition, your flow. Give thanks for the capacity to feel.",
          "Move to Fire: hold the candle. Feel your will, your passion, your courage. Give thanks for the fire that drives your life.",
          "Move to Air: hold the feather. Feel your mind, your breath, your voice. Give thanks for the capacity to think and communicate.",
          "Move to Spirit: hold the crystal. Feel your deepest nature — prior to all elements. Simply rest in the awareness that IS.",
          "Bring all elements to your center: hold all five simultaneously and say: 'I am all of these. I am more than all of these. I am whole.'"
        ],
        closing: "This ceremony aligns all aspects of your being into one coherent whole. Do it seasonally to stay integrated."
      }
    ],
    ceremonies: [
      {
        name: "Collective Prayer Ceremony",
        timing: "Any gathering, especially in times of challenge or collective need",
        duration: "30–45 minutes (group)",
        description: "A ceremony of unified prayer — recognizing that consciousness is collective and prayer is amplified in community. 'Where two or three are gathered in my name, there I am also' — the Spirit element lives in sacred community.",
        what_you_need: ["A circle of chairs or cushions", "A central candle or sacred object", "Paper for each participant"],
        flow: [
          "Gather in a circle. One candle burns at center.",
          "Begin with 3 minutes of shared silence — simply being together, breathing together.",
          "Each person writes one prayer on paper.",
          "Prayers are placed at the center altar, unread — offered to Spirit.",
          "Group intones 'AUM' three times.",
          "Each person speaks one word to close: what they felt in the ceremony."
        ],
        closing_prayer: "What we cannot hold alone, we hold together. What we cannot see alone, we see together. Spirit moves through this circle. We are blessed."
      },
      {
        name: "Gratitude Mandala Ceremony",
        timing: "Solstices, harvest season, or any gathering of abundance",
        duration: "1 hour (group)",
        description: "A ceremony of collective gratitude — creating a living mandala together as an act of devotion, using natural materials to create beauty as prayer.",
        what_you_need: ["Natural materials: flowers, leaves, stones, seeds, feathers", "A large cloth or patch of earth as the canvas", "Optional: mantra music playing softly"],
        flow: [
          "Gather with your natural materials. Lay the cloth.",
          "Begin from the center and work outward in rings — like a mandala or flower.",
          "Each person adds one element, speaks one gratitude.",
          "Work in silence or with gentle mantra.",
          "When complete, stand back and receive the beauty of what you created together.",
          "Sit in contemplation of the mandala for 5 minutes.",
          "Dismantle it together, returning each element to the earth — like a Tibetan sand mandala, all things arise, exist, and dissolve."
        ],
        closing_prayer: "Like this mandala: we arise from nothing, we live fully, we return to source. All is well. All is Spirit."
      }
    ],
    blessings: [
      {
        name: "Universal Blessing",
        when: "At any time — this is the blessing of pure Spirit",
        text: "May all beings be happy. May all beings be safe. May all beings be healthy and free from suffering. May all beings live with ease. May all beings know their own divine nature. May all beings be loved. Including me. Especially me. Starting with me."
      },
      {
        name: "Morning Spirit Invocation",
        when: "Upon waking, before the day begins",
        text: "I awaken to another day of this extraordinary gift of life. Spirit, be with me. Move through my hands and voice and choices. May I be of service today without losing myself. May I be fully present. May I be awake to the sacred ordinary: the light, the breath, the faces of those I love. I am grateful. I am here. I am yours."
      },
      {
        name: "Blessing for What is Hard",
        when: "When facing difficulty, loss, or suffering",
        text: "I do not ask to be spared from difficulty. I ask for the grace to be present with it. I ask for the strength to stay soft when hardness would be easier. I ask for the wisdom to find the gift in what breaks me open. Spirit holds all of this — the joy and the grief, the light and the dark. I place this difficulty in that larger holding. It is not too much. It is, in fact, exactly enough."
      },
      {
        name: "Blessing at Day's End",
        when: "Before sleep",
        text: "I return this day to the divine. Every mistake, every gift, every moment of grace and every failure. I offer it all. I have done my best with what I had. The rest belongs to a wisdom greater than my own. I lay my body down in complete trust. I am cared for. I am not alone. Tomorrow is already being prepared. Goodnight, Spirit. I am home."
      },
      {
        name: "Blessing for Sacred Encounters",
        when: "When in the presence of someone who teaches or challenges you deeply",
        text: "I recognize the Spirit in you. Even in this difficulty. Even in this joy. The divine looks at me through your eyes and asks: can you love this too? Can you see me here? I bow to the teacher in you — the one who arrived in exactly the right form to give me exactly the lesson I needed. Thank you. I see you."
      }
    ],
    affirmations: [
      "I am one with all of life.",
      "I am whole, complete, and already home.",
      "Spirit moves through me and as me.",
      "I am love expressing itself as a human being.",
      "I am the awareness in which all experience arises.",
      "My life is a prayer. My presence is my offering.",
      "I trust the wisdom that holds all things together.",
      "I am not lost — I am exactly where I need to be."
    ]
  }
];

const ElementalTemples = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTemple, setActiveTemple] = useState(null);
  const [activeSection, setActiveSection] = useState("embodiment");
  const [elements, setElements] = useState(STATIC_ELEMENTS);

  // Fetch fresh data from API (enriched content from MongoDB)
  useEffect(() => {
    if (!api) return;
    api.get("/elemental-temples")
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Merge API data with static icon references
          const merged = res.data.map(el => ({
            ...el,
            icon: ELEMENT_ICONS[el.icon] || Mountain,
          }));
          setElements(merged);
        }
      })
      .catch(() => { /* silently use static data */ });
  }, [api]);

  const sections = [
    { id: "embodiment", label: "Embodiment" },
    { id: "inner", label: "Within You" },
    { id: "outer", label: "In Nature" },
    { id: "practices", label: "Practices" },
    { id: "rituals", label: "Rituals" },
    { id: "ceremonies", label: "Ceremonies" },
    { id: "blessings", label: "Blessings" },
    { id: "affirmations", label: "Affirmations" },
    { id: "safety_precautions", label: "Safety" }
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

                  {activeSection === "ceremonies" && (
                    <div className="space-y-6">
                      <p className="text-muted-foreground text-sm">Group and communal ceremonies for honoring the {activeTemple.element} element together. 🙏</p>
                      {(activeTemple.ceremonies || []).map((ceremony, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`rounded-2xl border overflow-hidden ${activeTemple.color.border}`}
                          data-testid={`ceremony-${i}`}
                        >
                          <div className={`p-5 ${activeTemple.color.bg}`}>
                            <h3 className="text-lg font-serif mb-1">{ceremony.name}</h3>
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Moon className={`w-3 h-3 ${activeTemple.color.text}`} />{ceremony.timing}</span>
                              <span>{ceremony.duration}</span>
                            </div>
                          </div>
                          <div className="p-5 bg-white/3 space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">{ceremony.description}</p>
                            {ceremony.what_you_need && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">You Will Need</p>
                                <div className="flex flex-wrap gap-2">
                                  {ceremony.what_you_need.map((item, j) => (
                                    <span key={j} className={`px-2.5 py-1 rounded-full text-xs border ${activeTemple.color.bg} ${activeTemple.color.text} ${activeTemple.color.border}`}>{item}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {ceremony.flow && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Ceremony Flow</p>
                                <ol className="space-y-3">
                                  {ceremony.flow.map((step, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                                      <span className={`w-6 h-6 rounded-full ${activeTemple.color.bg} border ${activeTemple.color.border} flex items-center justify-center text-xs ${activeTemple.color.text} flex-shrink-0`}>{j + 1}</span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            {ceremony.closing_prayer && (
                              <div className={`p-4 rounded-xl ${activeTemple.color.bg} border ${activeTemple.color.border}`}>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Closing Prayer</p>
                                <p className={`text-sm italic ${activeTemple.color.text} leading-relaxed`}>{ceremony.closing_prayer}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeSection === "blessings" && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-sm">Sacred blessings, prayers, and invocations for the {activeTemple.element} element. Speak them aloud, slowly, with full presence. 🙏</p>
                      {(activeTemple.blessings || []).map((blessing, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className={`rounded-2xl border p-5 ${activeTemple.color.bg} ${activeTemple.color.border}`}
                          data-testid={`blessing-${i}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-serif text-base">{blessing.name}</h4>
                            <Heart className={`w-4 h-4 ${activeTemple.color.text} flex-shrink-0 mt-0.5`} />
                          </div>
                          <p className={`text-xs ${activeTemple.color.text} mb-3 italic`}>{blessing.when}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 pl-4" style={{ borderColor: `var(--${activeTemple.color.accent}, currentColor)` }}>
                            "{blessing.text}"
                          </p>
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

                  {activeSection === "safety_precautions" && (
                    <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-red-400 text-xl">⚠</span>
                        <h3 className="text-xl font-serif text-red-300">Safety Precautions for {activeTemple.element} Work</h3>
                      </div>
                      {activeTemple.safety_precautions ? (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {activeTemple.safety_precautions}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Always approach elemental work with care and reverence. Ground yourself before and after practice, stay hydrated, and be gentle with what arises.
                        </p>
                      )}
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
