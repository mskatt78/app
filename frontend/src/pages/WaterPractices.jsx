import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Droplets, Sparkles, Heart, Moon, Sun, 
  Play, X, Clock, Volume2, Star, Waves, Pause, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const WaterPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [activeCategory, setActiveCategory] = useState("blessing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Generate guided audio for water practice
  const generateGuidedAudio = async () => {
    if (!selectedPractice || !api) return;
    
    setAudioLoading(true);
    
    // Create guided meditation script from practice steps
    const script = `Welcome to the ${selectedPractice.name}. 
    ${selectedPractice.description}
    
    Let's begin. ${selectedPractice.steps?.slice(0, 5).join('. ') || ''}
    
    ${selectedPractice.affirmation ? `Repeat this affirmation: ${selectedPractice.affirmation}` : ''}
    
    Take a moment to feel gratitude for this sacred practice with water.`;
    
    try {
      const response = await api.post("/tts/generate-base64", {
        text: script,
        voice: "nova",
        speed: 0.85
      });
      
      if (response.data.audio_base64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(`data:audio/mp3;base64,${response.data.audio_base64}`);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          toast.error("Audio playback failed");
          setIsPlaying(false);
        };
        
        await audioRef.current.play();
        setIsPlaying(true);
        toast.success("Guided audio started");
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast.error("Could not generate guided audio");
    } finally {
      setAudioLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      generateGuidedAudio();
    }
  };

  const categories = [
    { id: "blessing", name: "Water Blessings", icon: Heart, color: "text-blue-400" },
    { id: "ceremony", name: "Ceremonies", icon: Star, color: "text-violet-400" },
    { id: "ritual", name: "Rituals", icon: Moon, color: "text-purple-400" },
    { id: "frequency", name: "Frequency & Sound", icon: Waves, color: "text-cyan-400" },
    { id: "crystalline", name: "Crystalline Charging", icon: Sparkles, color: "text-cyan-300" },
    { id: "cleansing", name: "Energy Cleansing", icon: Droplets, color: "text-teal-400" },
    { id: "moon", name: "Moon Water", icon: Moon, color: "text-purple-400" },
  ];

  const waterPractices = {
    blessing: [
      {
        id: "intention-water",
        name: "Intention Water Blessing",
        description: "Program your water with specific intentions and positive energy. Based on Dr. Masaru Emoto's research showing water responds to words, thoughts, and intentions.",
        duration_minutes: 10,
        benefits: ["Energetically charged water", "Manifestation support", "Healing vibration", "Consciousness connection"],
        materials: ["Glass or crystal container (avoid plastic)", "Fresh spring or filtered water", "Paper and pen", "Quiet space"],
        steps: [
          "Fill your container with fresh, clean water",
          "Hold the container between your palms",
          "Close your eyes and take 3 deep breaths to center yourself",
          "Visualize golden light flowing from your heart, through your hands, into the water",
          "Speak your intention clearly: 'I bless this water with love and gratitude'",
          "Add specific intentions: health, clarity, peace, abundance, healing",
          "Write your intention on paper and place the container on top",
          "Leave for at least 4 hours (or overnight)",
          "Drink mindfully, feeling the intention entering your body",
          "Express gratitude before and after drinking"
        ],
        sacred_words: [
          { word: "Love", meaning: "Creates beautiful hexagonal crystals", effect: "Heart opening, healing" },
          { word: "Gratitude", meaning: "Forms the most beautiful crystal structures", effect: "Abundance, appreciation" },
          { word: "Peace", meaning: "Creates harmonious, balanced patterns", effect: "Calm, centeredness" },
          { word: "Healing", meaning: "Generates restorative energy patterns", effect: "Physical and emotional healing" },
          { word: "I Am Whole", meaning: "Creates complete, perfect crystal forms", effect: "Integration, completeness" }
        ],
        affirmation: "This water carries the vibration of my highest intention. As I drink, I become one with this blessing.",
        science: "Dr. Masaru Emoto's research demonstrated that water exposed to positive words and intentions forms beautiful crystalline structures when frozen, while negative words create chaotic patterns. Water has memory and responds to consciousness."
      },
      {
        id: "gratitude-water",
        name: "Gratitude Water Ritual",
        description: "The most powerful water blessing using the vibration of gratitude - the frequency that creates the most beautiful water crystals.",
        duration_minutes: 15,
        benefits: ["Highest vibrational water", "Abundance activation", "Heart coherence", "Cellular rejuvenation"],
        steps: [
          "Prepare your water in a glass container",
          "Write 'Thank You' or 'Gratitude' on paper, place container on it",
          "Hold the water and close your eyes",
          "Think of 3 things you're deeply grateful for - feel them in your heart",
          "Speak aloud: 'Thank you, water, for carrying life to every cell'",
          "Visualize the water molecules arranging into perfect hexagonal crystals",
          "See the water glowing with golden-white light",
          "Say: 'I am grateful. I am blessed. I am whole.'",
          "Drink slowly, savoring each sip",
          "Feel gratitude spreading through your entire body"
        ],
        affirmation: "Gratitude is the highest frequency. This water now carries the vibration of infinite blessing.",
        tip: "Emoto found that 'Thank You' in any language creates the most beautiful water crystals. Add this practice to your daily routine."
      },
      {
        id: "prayer-water",
        name: "Prayer Over Water",
        description: "Ancient practice of blessing water through prayer, used across all spiritual traditions. Combines intention, faith, and spoken word.",
        duration_minutes: 10,
        benefits: ["Spiritually activated water", "Divine connection", "Protection", "Purification"],
        steps: [
          "Hold your water vessel with both hands",
          "If you follow a tradition, use prayers from that lineage",
          "Or use this universal blessing:",
          "  'Divine Source of all life,'",
          "  'Bless this water with your light.'",
          "  'May it carry healing, love, and truth'",
          "  'To every cell of my being.'",
          "  'May all who drink be blessed.'",
          "  'So it is. Amen / Aho / Blessed Be.'",
          "Visualize light descending into the water",
          "Make the sign of blessing over the water (cross, spiral, or other sacred gesture)",
          "Drink with reverence"
        ],
        traditions: [
          { tradition: "Christian", practice: "Holy water blessing, sign of the cross" },
          { tradition: "Buddhist", practice: "Mantra chanting over water, especially Om Mani Padme Hum" },
          { tradition: "Hindu", practice: "Ganges water rituals, mantra infusion" },
          { tradition: "Indigenous", practice: "Water songs, tobacco offerings, gratitude ceremonies" },
          { tradition: "Jewish", practice: "Mikvah blessings, Sabbath water sanctification" }
        ],
        affirmation: "This water is blessed by the Divine. I drink in sacred communion with Source."
      }
    ],
    crystalline: [
      {
        id: "crystalline-activation",
        name: "Crystalline Water Activation",
        description: "Transform ordinary water into living, structured 'crystalline' water through sound, intention, and sacred geometry. Creates hexagonal water clusters for optimal cellular hydration.",
        duration_minutes: 20,
        benefits: ["Enhanced cellular hydration", "DNA activation", "Light body integration", "Consciousness expansion"],
        materials: ["Spring or filtered water", "Crystal (clear quartz ideal)", "Singing bowl or tuning fork (optional)", "Sacred geometry image"],
        steps: [
          "Begin with fresh, pure water in a glass container",
          "Place a clean crystal (quartz, amethyst, or shungite) beside or under the container",
          "Place a Flower of Life or other sacred geometry image under the container",
          "Hold your hands around the container without touching",
          "Tone 'OM' three times, directing the vibration into the water",
          "Or use a singing bowl, playing it near the water for 3-5 minutes",
          "Visualize the water molecules forming perfect hexagonal crystalline structures",
          "See the water filling with white-gold light",
          "Speak: 'I activate this water to its highest crystalline potential'",
          "State: 'This water now carries the frequency of perfect health and divine light'",
          "Leave in sunlight for 20 minutes, or moonlight for deeper activation",
          "Drink within 24 hours for maximum potency"
        ],
        frequencies: [
          { hz: 528, name: "Love Frequency", effect: "DNA repair, transformation" },
          { hz: 432, name: "Universal Frequency", effect: "Harmony, natural order" },
          { hz: 639, name: "Connection Frequency", effect: "Relationships, heart opening" },
          { hz: 741, name: "Awakening Frequency", effect: "Intuition, consciousness expansion" }
        ],
        affirmation: "This water is alive with crystalline light. Every drop carries the code of perfect health.",
        science: "Structured or 'hexagonal' water has a specific molecular arrangement that may enhance cellular hydration and biological functions. Sound frequencies can influence water's molecular structure."
      },
      {
        id: "light-code-water",
        name: "Light Code Water Infusion",
        description: "Infuse water with light codes and sacred symbols for spiritual activation and DNA awakening.",
        duration_minutes: 15,
        benefits: ["Spiritual activation", "Light body nourishment", "Higher dimensional connection", "Cellular awakening"],
        steps: [
          "Draw or print the Flower of Life symbol",
          "Place your water container in the center of the symbol",
          "Hold your hands over the water, palms down",
          "Visualize streams of light codes descending from above",
          "See these as geometric patterns of light entering the water",
          "Speak: 'I infuse this water with light codes of awakening'",
          "Visualize specific sacred geometry: Metatron's Cube, Sri Yantra, or Merkaba",
          "See the water glowing with rainbow light",
          "State your intention: 'This water activates my light body'",
          "Let sit for at least 30 minutes",
          "Drink with awareness of the light entering your cells"
        ],
        symbols: [
          { symbol: "Flower of Life", effect: "Creation codes, universal pattern" },
          { symbol: "Metatron's Cube", effect: "Sacred geometry of all forms" },
          { symbol: "Sri Yantra", effect: "Divine feminine activation" },
          { symbol: "Merkaba", effect: "Light body activation" }
        ],
        affirmation: "I drink liquid light. Every cell awakens to its divine blueprint."
      }
    ],
    cleansing: [
      {
        id: "energy-cleanse",
        name: "Energetic Water Cleansing",
        description: "Clear negative or stagnant energy from water before consumption. Essential for tap water or water from unknown sources.",
        duration_minutes: 5,
        benefits: ["Remove energetic impurities", "Clear negative imprints", "Reset water memory", "Prepare for blessing"],
        steps: [
          "Hold the water container and take a deep breath",
          "Visualize any dark, murky, or chaotic energy in the water",
          "Imagine brilliant white light descending from above",
          "See this light pushing all negativity down and out through the bottom",
          "Watch the water become crystal clear and glowing",
          "Speak: 'I release all negative energy from this water'",
          "Blow gently across the surface three times (breath carries life force)",
          "State: 'This water is now clear, pure, and ready to receive blessing'",
          "Optionally, stir the water counterclockwise 9 times to clear",
          "Then stir clockwise 9 times to activate",
          "The water is now ready for intention setting"
        ],
        clearing_methods: [
          { method: "Sunlight", description: "Place in direct sunlight for 30 minutes" },
          { method: "Moonlight", description: "Leave under full moon overnight" },
          { method: "Sound", description: "Ring a bell or singing bowl over it" },
          { method: "Salt", description: "Add a pinch of sea salt, let sit, then filter" },
          { method: "Crystal", description: "Place shungite or black tourmaline beside it" }
        ],
        affirmation: "This water is cleared of all that no longer serves. It is pure and ready for blessing."
      },
      {
        id: "chakra-water",
        name: "Chakra Cleansing Water",
        description: "Create water infused with specific chakra energies for targeted healing and balancing.",
        duration_minutes: 15,
        benefits: ["Chakra balancing", "Energy center healing", "Specific healing focus", "Color therapy"],
        chakra_waters: [
          { chakra: "Root", color: "Red", intention: "I am safe, grounded, and secure", crystal: "Red Jasper" },
          { chakra: "Sacral", color: "Orange", intention: "I embrace pleasure and creative flow", crystal: "Carnelian" },
          { chakra: "Solar Plexus", color: "Yellow", intention: "I am confident and powerful", crystal: "Citrine" },
          { chakra: "Heart", color: "Green/Pink", intention: "I give and receive love freely", crystal: "Rose Quartz" },
          { chakra: "Throat", color: "Blue", intention: "I speak my truth with clarity", crystal: "Blue Lace Agate" },
          { chakra: "Third Eye", color: "Indigo", intention: "I see clearly and trust my intuition", crystal: "Amethyst" },
          { chakra: "Crown", color: "Violet/White", intention: "I am connected to divine wisdom", crystal: "Clear Quartz" }
        ],
        steps: [
          "Choose the chakra you wish to work with",
          "Visualize the corresponding color filling your water",
          "Hold the water and repeat the chakra affirmation 7 times",
          "If using a crystal, place it beside (not in) the water",
          "See the water pulsing with the chakra's color",
          "Drink while focusing on that energy center",
          "Visualize the colored water flowing to and healing that chakra"
        ],
        affirmation: "This water carries the perfect frequency for my [chakra] healing."
      }
    ],
    moon: [
      {
        id: "full-moon-water",
        name: "Full Moon Water",
        description: "Charge water under the full moon for amplified intentions, release work, and feminine energy activation. Most potent water for manifestation.",
        duration_minutes: 5,
        overnight: true,
        benefits: ["Peak lunar energy", "Manifestation power", "Emotional release", "Feminine activation"],
        steps: [
          "Fill a clear glass container with spring or filtered water",
          "Just before sunset on the full moon, take it outside",
          "Hold it and set your intention: manifestation, release, or healing",
          "Speak: 'I charge this water with the full moon's power'",
          "State your specific intention aloud",
          "Place where moonlight will touch it directly",
          "Leave overnight until just after sunrise",
          "Retrieve before the sun fully heats it",
          "Store in a dark place and use within one moon cycle",
          "Add to baths, drink, anoint yourself, or use in rituals"
        ],
        uses: [
          "Drink for manifestation and intuition boost",
          "Add to bath for emotional release",
          "Anoint third eye for psychic activation",
          "Water plants for growth blessing",
          "Add to ritual workings",
          "Cleanse crystals and tools"
        ],
        affirmation: "This water holds the full moon's power. I manifest with lunar blessing."
      },
      {
        id: "new-moon-water",
        name: "New Moon Water",
        description: "Create water charged with new moon energy for new beginnings, planting seeds of intention, and deep introspection.",
        duration_minutes: 5,
        overnight: true,
        benefits: ["New beginning energy", "Intention seeding", "Inner wisdom", "Fresh start"],
        steps: [
          "On the new moon (dark moon), fill a dark-colored container with water",
          "Alternatively, use clear glass and cover with black cloth",
          "Hold and speak your new intentions for the coming cycle",
          "What are you calling in? What seeds are you planting?",
          "Place outside or on a windowsill",
          "The dark is where seeds germinate - honor the darkness",
          "Retrieve in the morning",
          "Drink on the new moon and following days",
          "Use to anoint new projects, plants, or yourself"
        ],
        affirmation: "In the darkness, new life begins. This water carries the seed of my intention."
      },
      {
        id: "eclipse-water",
        name: "Eclipse Water (Advanced)",
        description: "Extremely potent water charged during solar or lunar eclipses. For major transformation and shadow work.",
        duration_minutes: 5,
        benefits: ["Powerful transformation", "Shadow integration", "Major life shifts", "Portal energy"],
        caution: "Eclipse energy is intense. Use with clear intention. Not for daily consumption.",
        steps: [
          "Prepare water in a special container reserved for this purpose",
          "During the eclipse, hold the water and meditate on transformation",
          "What are you releasing? What are you becoming?",
          "Speak: 'I embrace transformation. I release what no longer serves.'",
          "Leave water exposed during the entire eclipse period",
          "Store in a dark place",
          "Use sparingly for major ritual work",
          "A few drops in regular water amplifies transformation",
          "Add to baths during intense life transitions"
        ],
        affirmation: "I embrace the shadow and the light. Transformation is my birthright."
      }
    ],
    ceremony: [
      {
        id: "water-gratitude-ceremony",
        name: "Sacred Water Gratitude Ceremony",
        description: "A full sacred ceremony to honour, bless, and give thanks for the gift of water — the source of all life. Draws on indigenous water-keeper traditions and Dr. Emoto's research.",
        duration_minutes: 30,
        benefits: ["Deep reverence for water", "Crystalline water activation", "Community healing", "Ancestral connection"],
        materials: ["A bowl of pure spring or filtered water", "Flowers or petals", "A candle (blue or white)", "Small crystals (optional)", "A drum, bell, or rattle (optional)"],
        steps: [
          "Create a sacred space: lay a cloth, place your water bowl at centre, surround with flowers, light your candle",
          "Face East (direction of new beginnings) and call in the water spirits: 'I call upon the sacred waters — the oceans, rivers, rain, and springs — to join this ceremony'",
          "Hold the bowl of water with both hands and bow in gratitude: 'Miigwech (thank you) for carrying life. Miigwech for nourishing every being on Earth'",
          "Speak loving words DIRECTLY to the water — 'I love you. You are sacred. You are holy. You are the blood of Mother Earth'",
          "Sound your drum, bell, or rattle three times to seal the blessing",
          "If with others, pass the bowl and invite each person to speak a single word of gratitude into the water",
          "With ceremony, pour a small amount onto the earth as an offering to the ancestors and water spirits",
          "Drink the blessed water consciously — each sip a communion with the sacred"
        ],
        affirmation: "Water is life. I am grateful. I am the keeper of water.",
        tradition_note: "In many Indigenous traditions, a Water Keeper is a sacred role — usually a woman — who tends to the water and speaks for it in ceremony. All of us can carry this responsibility."
      },
      {
        id: "water-release-ceremony",
        name: "Water Release & Renewal Ceremony",
        description: "A ceremony to release what no longer serves — grief, fear, pain, old stories — to the water, and call in fresh, renewed energy. Water receives and transforms.",
        duration_minutes: 45,
        benefits: ["Emotional liberation", "Grief release", "Energetic renewal", "Healing transmission"],
        materials: ["Access to flowing water (river, ocean, stream) OR a large bowl", "Biodegradable paper and a pen", "Flower petals or natural offerings", "Sea salt"],
        steps: [
          "Go to a body of water or prepare a large bowl with salted water — add 1 tablespoon of sea salt and stir",
          "Sit in silence for 5 minutes and allow what needs to be released to surface",
          "On biodegradable paper, write everything you are ready to let go of — do not censor yourself",
          "Hold the paper to your heart and say: 'I have carried this long enough. I release it now with love and gratitude'",
          "Tear the paper into small pieces and place it into the water bowl (or scatter petals onto the river/ocean)",
          "If using a bowl, add the paper pieces — they will dissolve in the salted water",
          "Watch the paper dissolve and feel the shift in your body. The water transforms what it receives",
          "Pour the bowl's contents onto earth away from where you walk — returning it to the cycle",
          "Now prepare a fresh bowl of clean water. Speak your intentions for renewal: 'I welcome clarity, joy, ease, love'",
          "Drink this water of renewal with reverence"
        ],
        affirmation: "I release to the waters what no longer flows through me. I am renewed."
      },
      {
        id: "new-moon-water-ceremony",
        name: "New Moon New Waters Ceremony",
        description: "A monthly ceremony aligned with the new moon to set intentions in water — planting the seeds of your desires in the most fertile energetic time.",
        duration_minutes: 20,
        benefits: ["Intention setting", "Manifestation support", "Emotional reset", "Cyclical living"],
        materials: ["A glass jar with a lid", "Spring or filtered water", "A moonstone, clear quartz, or rose quartz", "Blue or black ink pen", "Paper"],
        steps: [
          "On the night of the new moon (within 24 hours either side), gather your materials",
          "Write your intentions on paper — what you are calling in this lunar cycle. Be specific and write in present tense: 'I am...' 'I have...' 'I feel...'",
          "Fold the paper and place it under your glass jar",
          "Fill the jar with pure water. Drop your crystal into the water",
          "Hold the jar and breathe your intentions into it — really feel them as already true",
          "Seal the jar and place it on a window ledge — it does not need direct moonlight on a new moon. The energy is in the dark sky",
          "Leave overnight. In the morning, hold the jar and re-read your intentions",
          "Drink this water throughout the day, consciously receiving your intentions into your body"
        ],
        affirmation: "I plant my intentions in the sacred waters of this new moon. They are already becoming."
      }
    ],
    ritual: [
      {
        id: "morning-water-ritual",
        name: "Sacred Morning Water Ritual",
        description: "Begin every day with this potent ritual that blesses your body with conscious, intentional water — setting the frequency for your entire day.",
        duration_minutes: 10,
        benefits: ["Daily frequency setting", "Conscious hydration", "Gratitude practice", "Body honouring"],
        materials: ["A glass of pure water (spring or filtered)", "Optional: a pinch of Himalayan salt", "Optional: a slice of lemon or drop of lemon essential oil"],
        steps: [
          "Before checking your phone, before coffee, before speaking to anyone — tend to your water",
          "Fill a glass with pure water. If you have it, add a tiny pinch of Himalayan pink salt for minerals and trace elements",
          "Hold the glass between both palms and close your eyes",
          "Take three deep breaths. With each exhale, breathe your love into the water",
          "Speak (aloud or in your heart): 'Good morning, water. Thank you for giving me life today.'",
          "State one intention or quality you are calling in today: 'I ask this water to carry [peace / clarity / joy / courage] into every cell of my being'",
          "Drink slowly and mindfully. Feel the water moving through you.",
          "After drinking, place one hand on your belly and one on your heart. Say: 'I am grateful. I am alive. I am sacred water.'"
        ],
        affirmation: "With this first water, I set the frequency of my day. I choose love. I choose life.",
        tip: "This practice becomes transformational when done consistently. It takes 3 minutes. Within weeks, it reshapes how you relate to your body and to life."
      },
      {
        id: "water-sound-ritual",
        name: "Sound & Vibration Water Charging Ritual",
        description: "Use singing bowls, toning, drumming, and sacred sound to charge water with high frequencies. Sound changes the molecular structure of water — science and spirit agree.",
        duration_minutes: 15,
        benefits: ["Frequency-charged water", "Sound healing transmission", "Vibrational medicine", "Deep cellular nourishment"],
        materials: ["Glass bowl or cup of water", "Crystal singing bowl, Tibetan bowl, tuning fork, or simply your voice", "Optional: 528Hz or 432Hz frequency recording"],
        steps: [
          "Place your water in a glass container. If using a bowl, place the water bowl near (not touching) the singing bowl",
          "Begin by centring yourself — 3 deep breaths, shoulders relaxed, heart open",
          "Play 528Hz or 432Hz music near the water for 5 minutes, or:",
          "Tone 'AUM' or 'OM' three times, directing the sound vibration toward the water",
          "Strike your Tibetan or crystal bowl and hold it near the water — feel the vibration",
          "Speak these words in a low, resonant voice directly to the water: 'Love... Peace... Healing... Gratitude... Harmony... Joy...'",
          "Each word should be felt in your body as you speak — not just thought but felt",
          "Spend 3-5 minutes in each modality (sound, word, tone) — or combine them",
          "Complete with: 'I seal this water with the frequency of love'",
          "Drink with full awareness of what you are receiving"
        ],
        affirmation: "My voice is a healing instrument. The water carries my song into every cell.",
        science: "Masaru Emoto's water crystal research showed that words like 'Love' and 'Gratitude' produced the most beautiful crystalline structures. Music — especially Bach and classical — also produced beautiful crystals. Heavy metal music produced distorted patterns."
      },
      {
        id: "water-ancestor-ritual",
        name: "Ancestral Water Remembrance Ritual",
        description: "Honour your ancestral connection to water — we are all from ocean-dwelling ancestors. This ritual connects you to the ancient intelligence of water that lives within your very cells.",
        duration_minutes: 25,
        benefits: ["Ancestral healing", "Cellular memory activation", "Deep belonging", "Lineage healing"],
        materials: ["A glass bowl of water", "Photo or object representing your ancestors (optional)", "A blue or silver candle"],
        steps: [
          "Create a quiet, sacred space. Light a candle. Place your water bowl before you",
          "If you have ancestral photos or objects, place them nearby",
          "Breathe slowly and call in your ancestors: 'I call on all my ancestors of love and healing, from all lineages, across all time'",
          "Contemplate this truth: your body is made of water. The ocean called you into being. Life began in water 4 billion years ago",
          "Speak to the water: 'I remember. I remember that I am water. That my people came from water. That all life is water.'",
          "With your finger, draw a spiral in the water — the symbol of the sacred feminine, of time, of ocean",
          "Cup some water in your palms and bring it to your face — feel it on your skin. This is the ocean remembering itself",
          "Anoint your forehead, your heart, and your wrists with the water",
          "Sit in silence for 5 minutes. What memories arise? What do you feel in your body?",
          "Offer the remaining water to the earth or to a plant with gratitude"
        ],
        affirmation: "I remember. I am ancient water. I carry the ocean within me."
      }
    ],
    frequency: [
      {
        id: "loving-words-water",
        name: "Charging Water with Loving Words & Intentions",
        description: "Based on Dr. Masaru Emoto's groundbreaking research — water changes its crystalline structure in response to words, thoughts, and intentions. This practice transforms ordinary water into a living, high-vibrational medicine.",
        duration_minutes: 10,
        benefits: ["Living water activation", "Positive frequency infusion", "Cellular healing", "Consciousness medicine"],
        materials: ["A glass of pure water (spring or filtered is best)", "Paper and pen (optional)"],
        steps: [
          "Hold your glass of water at heart height",
          "Take 3 deep breaths to become fully present",
          "Speak these words DIRECTLY and LOVINGLY to the water — one at a time, feeling each word:",
          "  💙 LOVE — feel it radiate from your heart",
          "  💙 GRATITUDE — remember something you are deeply grateful for",
          "  💙 HEALING — see golden light entering the water",
          "  💙 PEACE — let your body soften as you say it",
          "  💙 JOY — smile as you speak it",
          "  💙 I LOVE YOU — say this to the water three times",
          "  💙 THANK YOU — say this to the water three times",
          "You can also write words on paper and wrap them around the glass — the water responds to the written word too",
          "Drink slowly, one sip at a time, feeling each sip as medicine entering your cells"
        ],
        power_words: [
          { word: "Love", frequency: "528 Hz (Miracle tone)", effect: "Creates perfect hexagonal crystals — the most beautiful patterns Emoto observed" },
          { word: "Gratitude", frequency: "432 Hz (Earth tuning)", effect: "Forms radiant snowflake-like crystals" },
          { word: "Peace", frequency: "396 Hz (Liberation)", effect: "Creates soft, harmonious patterns" },
          { word: "Healing", frequency: "741 Hz (Awakening)", effect: "Generates clean, clear crystalline forms" },
          { word: "I Love You", frequency: "All frequencies", effect: "The most powerful phrase in Emoto's research — in any language, it creates beauty" }
        ],
        affirmation: "Water hears me. Water heals me. I am water.",
        science: "Dr. Masaru Emoto exposed water to different words, music, and prayers, then photographed the water crystals under a microscope. Positive, loving words created beautiful symmetrical crystals. Negative words created distorted, broken patterns. This suggests water has a form of consciousness and memory."
      },
      {
        id: "solfeggio-water",
        name: "Solfeggio Frequency Water Infusion",
        description: "Play Solfeggio healing frequencies near your water to charge it with specific healing vibrations. Each frequency carries distinct healing properties.",
        duration_minutes: 15,
        benefits: ["Frequency-specific healing", "DNA repair support", "Vibrational medicine", "Cellular activation"],
        materials: ["Glass of water", "A device to play frequencies (phone/speaker)", "Optional: clear quartz crystal"],
        steps: [
          "Place your glass of water next to (or near) a speaker",
          "Search for your chosen Solfeggio frequency on YouTube or a streaming service",
          "396 Hz: for releasing guilt and fear — say 'I release...'",
          "432 Hz: for natural harmony — say 'I align with Earth's heartbeat'",
          "528 Hz: the Love/Miracle frequency — say 'I call in miraculous healing'",
          "639 Hz: for relationships — say 'I call in harmonious connection'",
          "741 Hz: for awakening — say 'I awaken to truth'",
          "852 Hz: for spiritual order — say 'I align with divine will'",
          "Play the frequency for 10-15 minutes with the water beside the speaker",
          "Hold your crystal over the water during charging if using one",
          "Drink the frequency-infused water with full conscious awareness"
        ],
        affirmation: "I drink healing frequencies. Every cell resonates with sacred sound."
      },
      {
        id: "crystal-charged-water",
        name: "Crystal-Charged Water Medicine",
        description: "Use the vibrational signature of crystals to infuse your water with specific healing energies. Each crystal imparts its unique frequency to the water.",
        duration_minutes: 120,
        benefits: ["Crystal frequency medicine", "Targeted healing", "Energetic enhancement", "Sacred water creation"],
        caution: "NOT all crystals are safe to place IN water. Use the method of placing crystals BESIDE or UNDER the container, not directly in the water, unless you are certain a crystal is non-toxic.",
        steps: [
          "Choose your crystal based on your intention:",
          "  Clear Quartz — amplifies all intentions, purification, clarity",
          "  Rose Quartz — love, self-compassion, heart healing",
          "  Amethyst — spiritual connection, peace, sleep (BESIDE container only)",
          "  Citrine — joy, abundance, vitality",
          "  Shungite — EMF protection, deep purification (safe in water)",
          "  Selenite — angelic connection, clearing (BESIDE container only — dissolves in water)",
          "Place the crystal BESIDE or UNDER the glass container (not in the water unless verified safe)",
          "Set the crystal and water in sunlight for 2-4 hours (some crystals fade in direct sun — research your crystal)",
          "Or set in moonlight overnight for a gentler, more feminine charge",
          "Speak your intention into the water before drinking",
          "Drink within 24 hours"
        ],
        affirmation: "The crystal kingdom speaks to my cells through this sacred water."
      }
    ]
  };

  const currentPractices = waterPractices[activeCategory] || [];
  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-background" data-testid="water-practices">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Element</p>
              <h1 className="text-xl font-serif">Water <span className="italic text-primary">Practices</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-teal-500/10 border border-blue-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Droplets className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Sacred <span className="italic text-primary">Water</span> Practices</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6 text-lg">
            Water is alive. It holds memory, responds to intention, and carries the vibration 
            of whatever it encounters. Learn to bless, charge, and transform your water into 
            living medicine.
          </p>
        </motion.div>

        {/* Emoto Quote */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-lg font-serif italic text-foreground/80 max-w-2xl mx-auto">
            "Water is the mirror that has the ability to show us what we cannot see. 
            It is a blueprint for our reality, which can change with a single positive thought."
          </p>
          <p className="text-sm text-muted-foreground mt-3">— Dr. Masaru Emoto</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 rounded-xl flex items-center gap-2 transition-all ${
                  isActive 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                    : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
                }`}
                data-testid={`category-${cat.id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentPractices.map((practice, index) => (
            <motion.div
              key={practice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPractice(practice)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5
                       hover:border-blue-500/40 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                  {practice.duration_minutes && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{practice.duration_minutes} min</span>
                      {practice.overnight && <span className="text-purple-400 ml-1">+ overnight</span>}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-serif mb-2 group-hover:text-primary transition-colors">
                  {practice.name}
                </h3>
                <p className="text-base text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                  {practice.description}
                </p>

                {practice.benefits && (
                  <div className="flex flex-wrap gap-2">
                    {practice.benefits.slice(0, 3).map((benefit, i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Science Note */}
        <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <h3 className="font-serif text-xl mb-3 flex items-center gap-2 text-cyan-300">
            <Sparkles className="w-5 h-5" />
            The Science of Water Memory
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Dr. Masaru Emoto's experiments showed that water exposed to positive words, music, 
            and intentions forms beautiful hexagonal crystals when frozen, while negative influences 
            create chaotic, incomplete structures. Though controversial in mainstream science, 
            this research suggests water may indeed respond to consciousness. Combined with water's 
            known ability to form "structured" or "hexagonal" clusters that may enhance cellular 
            hydration, these practices offer a bridge between ancient wisdom and modern understanding.
          </p>
        </div>
      </main>

      {/* Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPractice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-serif mb-2">{selectedPractice.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {selectedPractice.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedPractice.duration_minutes} min
                        </span>
                      )}
                      {selectedPractice.overnight && (
                        <span className="text-purple-400">+ overnight charging</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPractice(null)}
                    className="p-2 rounded-full hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{selectedPractice.description}</p>

                {/* Materials */}
                {selectedPractice.materials && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h3 className="font-medium mb-2 text-blue-300">Materials Needed</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedPractice.materials.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Droplets className="w-3 h-3 text-blue-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                <div>
                  <h3 className="font-medium mb-3">Practice Steps</h3>
                  <ol className="space-y-3">
                    {selectedPractice.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Sacred Words */}
                {selectedPractice.sacred_words && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <h3 className="font-medium mb-3 text-purple-300">Sacred Words for Water</h3>
                    <div className="space-y-2">
                      {selectedPractice.sacred_words.map((word, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5">
                          <p className="font-serif text-lg mb-1">{word.word}</p>
                          <p className="text-xs text-purple-300">{word.meaning}</p>
                          <p className="text-xs text-muted-foreground">Effect: {word.effect}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chakra Waters */}
                {selectedPractice.chakra_waters && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 via-green-500/10 to-purple-500/10 border border-white/10">
                    <h3 className="font-medium mb-3">Chakra Water Guide</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedPractice.chakra_waters.map((cw, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5 flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full`} style={{backgroundColor: cw.color.toLowerCase()}} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{cw.chakra}</p>
                            <p className="text-xs text-muted-foreground italic">"{cw.intention}"</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{cw.crystal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Frequencies */}
                {selectedPractice.frequencies && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <h3 className="font-medium mb-3 text-cyan-300">Healing Frequencies</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPractice.frequencies.map((freq, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5">
                          <p className="font-mono text-lg text-cyan-300">{freq.hz} Hz</p>
                          <p className="text-sm">{freq.name}</p>
                          <p className="text-xs text-muted-foreground">{freq.effect}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uses */}
                {selectedPractice.uses && (
                  <div className="p-4 rounded-xl bg-white/5">
                    <h3 className="font-medium mb-2">Uses</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedPractice.uses.map((use, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-400" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Affirmation */}
                {selectedPractice.affirmation && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-center">
                    <h3 className="font-medium mb-2 text-blue-300">Affirmation</h3>
                    <p className="text-lg font-serif italic">"{selectedPractice.affirmation}"</p>
                  </div>
                )}

                {/* Caution */}
                {selectedPractice.caution && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h3 className="font-medium mb-2 text-amber-300">Caution</h3>
                    <p className="text-sm text-muted-foreground">{selectedPractice.caution}</p>
                  </div>
                )}

                {/* Guided Audio Button */}
                {api && (
                  <Button 
                    onClick={toggleAudio}
                    disabled={audioLoading}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30"
                  >
                    {audioLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Audio...
                      </>
                    ) : isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Guided Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Play Guided Audio
                      </>
                    )}
                  </Button>
                )}

                <Button onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                    setIsPlaying(false);
                  }
                  setSelectedPractice(null);
                }} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterPractices;
