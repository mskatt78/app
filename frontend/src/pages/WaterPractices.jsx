import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Droplets, Sparkles, Heart, Moon, Sun, 
  Play, X, Clock, Volume2, Star, Waves, Pause, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { appLogger } from "../utils/logger";

const normalizeWaterCategory = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "blessing";

  const compact = raw
    .replace(/&/g, "and")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const categoryAliases = {
    blessing: "blessing",
    blessings: "blessing",
    ceremony: "ceremony",
    ceremonies: "ceremony",
    ritual: "ritual",
    rituals: "ritual",
    frequency: "frequency",
    frequencies: "frequency",
    frequency_and_sound: "frequency",
    sound: "frequency",
    sound_healing: "frequency",
    crystalline: "crystalline",
    crystalline_charging: "crystalline",
    crystal: "crystalline",
    cleansing: "cleansing",
    energy_cleansing: "cleansing",
    moon: "moon",
    moon_water: "moon",
  };

  return categoryAliases[compact] || categoryAliases[raw] || raw;
};

const WATER_CATEGORY_FALLBACKS = {
  blessing: [
    {
      id: "water-blessing-fallback",
      name: "Morning Water Blessing",
      description: "A simple morning blessing practice to attune your water with intention and gratitude.",
      duration_minutes: 8,
      category: "blessing",
      benefits: ["Gentle grounding", "Morning clarity", "Heart coherence"],
      steps: [
        "Hold your glass with both hands and breathe slowly.",
        "Name one quality you want to embody today.",
        "Bless the water with gratitude and receive it slowly.",
      ],
    },
  ],
  ceremony: [
    {
      id: "water-ceremony-fallback",
      name: "Sacred Water Ceremony",
      description: "A complete ceremonial structure for blessing, charging, and sharing water with intention.",
      duration_minutes: 20,
      category: "ceremony",
      benefits: ["Ceremonial grounding", "Community coherence", "Energetic clarity"],
      materials: ["Glass bowl", "Fresh water", "Candle", "Journal"],
      steps: [
        "Create a quiet altar space with water and candlelight.",
        "State your intention aloud and breathe slowly for three cycles.",
        "Bless the water with gratitude, then hold a full minute of silence.",
        "Speak a clear dedication for healing, truth, and balance.",
        "Drink or share the water slowly, closing with thanks.",
      ],
      affirmation: "This water carries peace, wisdom, and sacred coherence.",
    },
  ],
  ritual: [
    {
      id: "water-ritual-fallback",
      name: "Daily Water Ritual",
      description: "A structured daily ritual to reset your nervous system and hydrate with intention.",
      duration_minutes: 12,
      category: "ritual",
      benefits: ["Daily reset", "Intentional hydration", "Emotional steadiness"],
      steps: [
        "Prepare one glass of clean water and sit comfortably.",
        "Place one hand on heart and one hand around the glass.",
        "Take five breaths with a longer exhale.",
        "Speak one intention for the day into the water.",
        "Drink slowly and feel your body receive the ritual.",
      ],
    },
  ],
  frequency: [
    {
      id: "water-frequency-fallback",
      name: "Frequency Water Resonance",
      description: "Use gentle tone and breath pacing to imprint calming coherence into your hydration ritual.",
      duration_minutes: 15,
      category: "frequency",
      benefits: ["Mental clarity", "Nervous-system ease", "Energetic attunement"],
      steps: [
        "Sit comfortably with a bowl or glass of water.",
        "Play a soft resonance tone and breathe 4-in/6-out.",
        "Hold awareness at the heart center for two minutes.",
        "Drink slowly while maintaining calm attention.",
      ],
    },
  ],
  crystalline: [
    {
      id: "water-crystalline-fallback",
      name: "Crystalline Water Charging",
      description: "A crystal-aligned hydration practice for focus, tenderness, and energetic reset.",
      duration_minutes: 10,
      category: "crystalline",
      benefits: ["Focused intention", "Emotional softness", "Clear hydration ritual"],
      steps: [
        "Place a safe crystal beside your water vessel.",
        "Set one sentence of intention aloud.",
        "Breathe slowly and hold the intention for 90 seconds.",
        "Drink the water with full attention.",
      ],
    },
  ],
  cleansing: [
    {
      id: "water-cleansing-fallback",
      name: "Energy Cleansing Water Reset",
      description: "A quick cleanse sequence for emotional release and energetic clarity.",
      duration_minutes: 12,
      category: "cleansing",
      benefits: ["Release stagnation", "Emotional reset", "Energetic clarity"],
      steps: [
        "Wash hands intentionally while exhaling tension.",
        "Sprinkle or anoint pulse points with water.",
        "Repeat: I release what is not mine to carry.",
        "Close with three grounding breaths.",
      ],
    },
  ],
  moon: [
    {
      id: "water-moon-fallback",
      name: "Moon Water Reflection",
      description: "A lunar-aligned evening practice for intuition, softness, and integration.",
      duration_minutes: 14,
      category: "moon",
      benefits: ["Intuitive listening", "Emotional integration", "Calm evening descent"],
      steps: [
        "Sit with moon water and dim lighting.",
        "Name one emotion you are ready to honor.",
        "Sip slowly while journaling short reflections.",
        "Close with gratitude and rest intention.",
      ],
    },
  ],
};

const stableWaterKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return `${prefix}-${slug || "item"}`;
};

const WaterPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [activeCategory, setActiveCategory] = useState("blessing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
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
  }, [audioRef]);

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
      appLogger.error("Failed to generate water practice audio", error);
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

  const [waterPractices, setWaterPractices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from API
  useEffect(() => {
    if (!api) return;
    api.get("/water-practices")
      .then(res => {
        if (res.data && res.data.length > 0) {
          const normalized = res.data.map((practice) => ({
            ...practice,
            category: normalizeWaterCategory(practice.category),
          }));
          setWaterPractices(normalized);
        }
      })
      .catch((error) => {
        appLogger.error("Failed to load water practices", error);
      })
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    if (!api || loading) return;
    const alreadyLoaded = waterPractices.some((practice) => normalizeWaterCategory(practice.category) === activeCategory);
    if (alreadyLoaded) return;

    api.get(`/water-practices?category=${activeCategory}`)
      .then((res) => {
        if (!Array.isArray(res.data) || res.data.length === 0) return;
        const normalized = res.data.map((practice) => ({
          ...practice,
          category: normalizeWaterCategory(practice.category || activeCategory),
        }));
        setWaterPractices((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const next = [...prev];
          normalized.forEach((item) => {
            if (!existingIds.has(item.id)) next.push(item);
          });
          return next;
        });
      })
      .catch((error) => {
        appLogger.warn(`Could not load additional water practices for category '${activeCategory}'`, error);
      });
  }, [activeCategory, api, loading, waterPractices]);

  const currentPractices = waterPractices.filter(
    (practice) => normalizeWaterCategory(practice.category) === activeCategory
  );
  const fallbackPractices = WATER_CATEGORY_FALLBACKS[activeCategory] || [];
  const displayPractices = currentPractices.length > 0 ? currentPractices : fallbackPractices;
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
          {loading ? (
            ["water-skeleton-1", "water-skeleton-2", "water-skeleton-3", "water-skeleton-4"].map((skeletonKey) => (
              <div key={skeletonKey} className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 mb-4" />
                <div className="h-5 bg-blue-500/20 rounded mb-2 w-3/4" />
                <div className="h-3 bg-white/10 rounded mb-1 w-full" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            ))
          ) : displayPractices.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No practices in this category yet.</p>
            </div>
          ) : displayPractices.map((practice, index) => (
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
                    {practice.benefits.slice(0, 3).map((benefit) => (
                      <span key={stableWaterKey(`benefit-${practice.id}`, benefit)} className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
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
                      {selectedPractice.materials.map((item) => (
                        <li key={stableWaterKey(`material-${selectedPractice.id}`, item)} className="flex items-center gap-2">
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
                      <li key={stableWaterKey(`step-${selectedPractice.id}`, step)} className="flex items-start gap-3 text-sm">
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
                      {selectedPractice.sacred_words.map((word) => (
                        <div key={stableWaterKey(`sacred-word-${selectedPractice.id}`, word.word)} className="p-3 rounded-lg bg-white/5">
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
                      {selectedPractice.chakra_waters.map((cw) => (
                        <div key={stableWaterKey(`chakra-water-${selectedPractice.id}`, `${cw.chakra}-${cw.crystal}`)} className="p-2 rounded-lg bg-white/5 flex items-center gap-3">
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
                      {selectedPractice.frequencies.map((freq) => (
                        <div key={stableWaterKey(`frequency-${selectedPractice.id}`, `${freq.hz}-${freq.name}`)} className="p-3 rounded-lg bg-white/5">
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
                      {selectedPractice.uses.map((useCase) => (
                        <li key={stableWaterKey(`use-${selectedPractice.id}`, useCase)} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-400" />
                          {useCase}
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
                <Button
                  onClick={() => setShowGuided(true)}
                  className="w-full bg-violet-500 hover:bg-violet-600 flex items-center justify-center gap-2"
                  data-testid="water-guided-btn"
                >
                  <Play className="w-4 h-4" /> Start Guided Practice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Practice Full-Screen Overlay */}
      <AnimatePresence>
        {showGuided && selectedPractice && (
          <GuidedPracticeOverlay
            practice={{
              name: selectedPractice.name,
              duration_minutes: selectedPractice.duration_minutes || 20,
              element: "Water",
              steps: selectedPractice.steps,
            }}
            onExit={() => setShowGuided(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterPractices;
