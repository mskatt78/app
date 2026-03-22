import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Dna, Hexagon, Calendar, Clock, MapPin, 
  Sparkles, Star, Sun, Moon, ChevronRight, Download, Share2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ShareButton } from "../components/ShareModal";
import { toast } from "sonner";

// Gene Keys Gate Mapping (simplified - maps solar longitude to gates)
// The 64 gates are distributed around the zodiac wheel
const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// Gene Keys Data (Shadow/Gift/Siddhi)
const GENE_KEYS_DATA = {
  1: { shadow: "Entropy", gift: "Freshness", siddhi: "Beauty" },
  2: { shadow: "Dislocation", gift: "Orientation", siddhi: "Unity" },
  3: { shadow: "Chaos", gift: "Innovation", siddhi: "Innocence" },
  4: { shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness" },
  5: { shadow: "Impatience", gift: "Patience", siddhi: "Timelessness" },
  6: { shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace" },
  7: { shadow: "Division", gift: "Guidance", siddhi: "Virtue" },
  8: { shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness" },
  9: { shadow: "Inertia", gift: "Determination", siddhi: "Invincibility" },
  10: { shadow: "Self-Obsession", gift: "Naturalness", siddhi: "Being" },
  11: { shadow: "Obscurity", gift: "Idealism", siddhi: "Light" },
  12: { shadow: "Vanity", gift: "Discrimination", siddhi: "Purity" },
  13: { shadow: "Discord", gift: "Discernment", siddhi: "Empathy" },
  14: { shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness" },
  15: { shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence" },
  16: { shadow: "Indifference", gift: "Versatility", siddhi: "Mastery" },
  17: { shadow: "Opinion", gift: "Far-Sightedness", siddhi: "Omniscience" },
  18: { shadow: "Judgement", gift: "Integrity", siddhi: "Perfection" },
  19: { shadow: "Co-Dependence", gift: "Sensitivity", siddhi: "Sacrifice" },
  20: { shadow: "Superficiality", gift: "Self-Assurance", siddhi: "Presence" },
  21: { shadow: "Control", gift: "Authority", siddhi: "Valour" },
  22: { shadow: "Dishonour", gift: "Graciousness", siddhi: "Grace" },
  23: { shadow: "Complexity", gift: "Simplicity", siddhi: "Quintessence" },
  24: { shadow: "Addiction", gift: "Invention", siddhi: "Silence" },
  25: { shadow: "Constriction", gift: "Acceptance", siddhi: "Universal Love" },
  26: { shadow: "Pride", gift: "Artfulness", siddhi: "Invisibility" },
  27: { shadow: "Selfishness", gift: "Altruism", siddhi: "Selflessness" },
  28: { shadow: "Purposelessness", gift: "Totality", siddhi: "Immortality" },
  29: { shadow: "Half-Heartedness", gift: "Commitment", siddhi: "Devotion" },
  30: { shadow: "Desire", gift: "Lightness", siddhi: "Rapture" },
  31: { shadow: "Arrogance", gift: "Leadership", siddhi: "Humility" },
  32: { shadow: "Failure", gift: "Preservation", siddhi: "Veneration" },
  33: { shadow: "Forgetting", gift: "Mindfulness", siddhi: "Revelation" },
  34: { shadow: "Force", gift: "Strength", siddhi: "Majesty" },
  35: { shadow: "Hunger", gift: "Adventure", siddhi: "Boundlessness" },
  36: { shadow: "Turbulence", gift: "Humanity", siddhi: "Compassion" },
  37: { shadow: "Weakness", gift: "Equality", siddhi: "Tenderness" },
  38: { shadow: "Struggle", gift: "Perseverance", siddhi: "Honour" },
  39: { shadow: "Provocation", gift: "Dynamism", siddhi: "Liberation" },
  40: { shadow: "Exhaustion", gift: "Resolve", siddhi: "Divine Will" },
  41: { shadow: "Fantasy", gift: "Anticipation", siddhi: "Emanation" },
  42: { shadow: "Expectation", gift: "Detachment", siddhi: "Celebration" },
  43: { shadow: "Deafness", gift: "Insight", siddhi: "Epiphany" },
  44: { shadow: "Interference", gift: "Teamwork", siddhi: "Synarchy" },
  45: { shadow: "Dominance", gift: "Synergy", siddhi: "Communion" },
  46: { shadow: "Seriousness", gift: "Delight", siddhi: "Ecstasy" },
  47: { shadow: "Oppression", gift: "Transmutation", siddhi: "Transfiguration" },
  48: { shadow: "Inadequacy", gift: "Resourcefulness", siddhi: "Wisdom" },
  49: { shadow: "Reaction", gift: "Revolution", siddhi: "Rebirth" },
  50: { shadow: "Corruption", gift: "Equilibrium", siddhi: "Harmony" },
  51: { shadow: "Agitation", gift: "Initiative", siddhi: "Awakening" },
  52: { shadow: "Stress", gift: "Restraint", siddhi: "Stillness" },
  53: { shadow: "Immaturity", gift: "Expansion", siddhi: "Superabundance" },
  54: { shadow: "Greed", gift: "Aspiration", siddhi: "Ascension" },
  55: { shadow: "Victimisation", gift: "Freedom", siddhi: "Freedom" },
  56: { shadow: "Distraction", gift: "Enrichment", siddhi: "Intoxication" },
  57: { shadow: "Unease", gift: "Intuition", siddhi: "Clarity" },
  58: { shadow: "Dissatisfaction", gift: "Vitality", siddhi: "Bliss" },
  59: { shadow: "Dishonesty", gift: "Intimacy", siddhi: "Transparency" },
  60: { shadow: "Limitation", gift: "Realism", siddhi: "Justice" },
  61: { shadow: "Psychosis", gift: "Inspiration", siddhi: "Sanctity" },
  62: { shadow: "Intellect", gift: "Precision", siddhi: "Impeccability" },
  63: { shadow: "Doubt", gift: "Inquiry", siddhi: "Truth" },
  64: { shadow: "Confusion", gift: "Imagination", siddhi: "Illumination" }
};

// Human Design Types based on defined centers
const HUMAN_DESIGN_TYPES = {
  manifestor: {
    name: "Manifestor",
    strategy: "Inform Before Acting",
    notSelf: "Anger",
    signature: "Peace",
    description: "You are here to initiate and impact. Your closed aura creates independence."
  },
  generator: {
    name: "Generator",
    strategy: "Wait to Respond",
    notSelf: "Frustration",
    signature: "Satisfaction",
    description: "You are the life force of the planet. Wait for life to come to you."
  },
  manifestingGenerator: {
    name: "Manifesting Generator",
    strategy: "Wait to Respond, then Inform",
    notSelf: "Frustration and Anger",
    signature: "Satisfaction and Peace",
    description: "You are multi-passionate with sustainable energy. Skip steps when it feels right."
  },
  projector: {
    name: "Projector",
    strategy: "Wait for the Invitation",
    notSelf: "Bitterness",
    signature: "Success",
    description: "You are here to guide others. Your wisdom is valued when recognized."
  },
  reflector: {
    name: "Reflector",
    strategy: "Wait a Lunar Cycle",
    notSelf: "Disappointment",
    signature: "Surprise",
    description: "You mirror the health of your community. Take 28 days for major decisions."
  }
};

// Calculate solar longitude from date
const calculateSolarLongitude = (date) => {
  // Simplified calculation - approximates sun position
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Days since vernal equinox (March 20)
  const marchEquinox = new Date(year, 2, 20);
  let daysSinceEquinox = Math.floor((date - marchEquinox) / (1000 * 60 * 60 * 24));
  if (daysSinceEquinox < 0) daysSinceEquinox += 365;
  
  // Sun moves ~1 degree per day
  const longitude = (daysSinceEquinox * (360 / 365.25)) % 360;
  return longitude;
};

// Get gate from longitude
const getGateFromLongitude = (longitude) => {
  const gateSize = 360 / 64;
  const gateIndex = Math.floor(longitude / gateSize);
  return GATE_SEQUENCE[gateIndex % 64];
};

// Get line from longitude (1-6)
const getLineFromLongitude = (longitude) => {
  const gateSize = 360 / 64;
  const positionInGate = longitude % gateSize;
  const lineSize = gateSize / 6;
  return Math.floor(positionInGate / lineSize) + 1;
};

// Calculate Gene Keys profile
const calculateGeneKeysProfile = (birthDate) => {
  const date = new Date(birthDate);
  const designDate = new Date(date);
  designDate.setDate(designDate.getDate() - 88); // 88 days before birth
  
  const personalitySunLong = calculateSolarLongitude(date);
  const designSunLong = calculateSolarLongitude(designDate);
  
  // Earth is opposite Sun (180 degrees)
  const personalityEarthLong = (personalitySunLong + 180) % 360;
  const designEarthLong = (designSunLong + 180) % 360;
  
  return {
    lifesWork: {
      gate: getGateFromLongitude(personalitySunLong),
      line: getLineFromLongitude(personalitySunLong),
      sphere: "Life's Work",
      planet: "Personality Sun",
      description: "Your conscious purpose and external expression"
    },
    evolution: {
      gate: getGateFromLongitude(personalityEarthLong),
      line: getLineFromLongitude(personalityEarthLong),
      sphere: "Evolution",
      planet: "Personality Earth",
      description: "Your greatest challenge and growth opportunity"
    },
    radiance: {
      gate: getGateFromLongitude(designSunLong),
      line: getLineFromLongitude(designSunLong),
      sphere: "Radiance",
      planet: "Design Sun",
      description: "Your physical health and vitality"
    },
    purpose: {
      gate: getGateFromLongitude(designEarthLong),
      line: getLineFromLongitude(designEarthLong),
      sphere: "Purpose",
      planet: "Design Earth",
      description: "Your deepest wound and greatest gift"
    }
  };
};

// Calculate Human Design type (simplified)
const calculateHumanDesignType = (birthDate, birthTime) => {
  // This is a simplified calculation for demonstration
  // Real Human Design requires precise planetary positions
  const date = new Date(birthDate);
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Use birth time if provided to add more variation
  let timeOffset = 0;
  if (birthTime) {
    const [hours, minutes] = birthTime.split(':').map(Number);
    timeOffset = (hours * 60 + minutes) / 1440; // Fraction of day
  }
  
  const seed = (dayOfYear + timeOffset * 365) % 100;
  
  // Distribution based on actual HD statistics
  if (seed < 1) return "reflector";
  if (seed < 10) return "manifestor";
  if (seed < 30) return "projector";
  if (seed < 63) return "manifestingGenerator";
  return "generator";
};

// Calculate profile lines (1-6 lines) for Human Design
const calculateHDProfile = (birthDate) => {
  const date = new Date(birthDate);
  const personalitySunLong = calculateSolarLongitude(date);
  const designDate = new Date(date);
  designDate.setDate(designDate.getDate() - 88);
  const designSunLong = calculateSolarLongitude(designDate);
  
  const personalityLine = getLineFromLongitude(personalitySunLong);
  const designLine = getLineFromLongitude(designSunLong);
  
  const profileNames = {
    1: "Investigator",
    2: "Hermit",
    3: "Martyr",
    4: "Opportunist",
    5: "Heretic",
    6: "Role Model"
  };
  
  return {
    conscious: personalityLine,
    unconscious: designLine,
    name: `${personalityLine}/${designLine}`,
    fullName: `${profileNames[personalityLine]}/${profileNames[designLine]}`
  };
};

const ProfileCalculator = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("genekeys");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [geneKeysProfile, setGeneKeysProfile] = useState(null);
  const [humanDesignProfile, setHumanDesignProfile] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const calculateProfile = () => {
    if (!birthDate) {
      toast.error("Please enter your birth date");
      return;
    }

    setCalculating(true);
    
    // Simulate calculation delay for UX
    setTimeout(() => {
      const gkProfile = calculateGeneKeysProfile(birthDate);
      setGeneKeysProfile(gkProfile);
      
      const hdType = calculateHumanDesignType(birthDate, birthTime);
      const hdProfile = {
        type: HUMAN_DESIGN_TYPES[hdType],
        typeKey: hdType,
        profile: calculateHDProfile(birthDate),
        birthData: { date: birthDate, time: birthTime, place: birthPlace }
      };
      setHumanDesignProfile(hdProfile);
      
      setCalculating(false);
      toast.success("Profile calculated!");
    }, 1500);
  };

  const tabs = [
    { id: "genekeys", label: "Gene Keys Profile", icon: Dna },
    { id: "humandesign", label: "Human Design", icon: Hexagon }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="profile-calculator">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Discover Your</p>
            <h1 className="text-xl font-serif">Profile <span className="italic text-primary">Calculator</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-2xl font-serif mb-2">Discover Your Unique Blueprint</h2>
          <p className="text-muted-foreground max-w-lg mx-auto px-4">
            Enter your birth details to calculate your personal Gene Keys Activation Sequence 
            and Human Design type.
          </p>
        </motion.div>

        {/* Birth Data Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
        >
          <h3 className="font-serif text-lg">Birth Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <Calendar className="w-4 h-4 inline mr-1" />
                Birth Date *
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Birth Time (optional)
              </label>
              <Input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="HH:MM"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                <MapPin className="w-4 h-4 inline mr-1" />
                Birth Place (optional)
              </label>
              <Input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="City, Country"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * Birth date is required. Birth time improves Human Design accuracy. 
            For the most precise results, use your exact birth time from your birth certificate.
          </p>

          <Button 
            onClick={calculateProfile}
            disabled={calculating || !birthDate}
            className="w-full bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30"
          >
            {calculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Calculate My Profile
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {(geneKeysProfile || humanDesignProfile) && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 justify-center">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "genekeys" && geneKeysProfile && (
                <motion.div
                  key="genekeys"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif">Your Activation Sequence</h3>
                    <ShareButton 
                      title="My Gene Keys Profile"
                      description={`Life's Work: Gene Key ${geneKeysProfile.lifesWork.gate} - ${GENE_KEYS_DATA[geneKeysProfile.lifesWork.gate]?.gift}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(geneKeysProfile).map(([key, sphere], index) => {
                      const geneKey = GENE_KEYS_DATA[sphere.gate];
                      const colors = {
                        lifesWork: "from-amber-500/10 to-orange-500/5 border-amber-500/20",
                        evolution: "from-emerald-500/10 to-green-500/5 border-emerald-500/20",
                        radiance: "from-rose-500/10 to-pink-500/5 border-rose-500/20",
                        purpose: "from-violet-500/10 to-purple-500/5 border-violet-500/20"
                      };
                      
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-5 rounded-2xl bg-gradient-to-br ${colors[key]} border`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider">{sphere.sphere}</p>
                              <p className="text-sm text-muted-foreground/70">{sphere.planet}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-serif">{sphere.gate}.{sphere.line}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-red-400">Shadow:</span>
                              <span>{geneKey?.shadow}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-400">Gift:</span>
                              <span>{geneKey?.gift}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-violet-400">Siddhi:</span>
                              <span>{geneKey?.siddhi}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3 italic">{sphere.description}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-sm text-muted-foreground">
                      This is your Activation Sequence - the foundation of your Golden Path. 
                      Contemplate each Gene Key to unlock your genius.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/gene-keys")}
                      className="mt-2"
                    >
                      Explore All 64 Gene Keys <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "humandesign" && humanDesignProfile && (
                <motion.div
                  key="humandesign"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif">Your Human Design</h3>
                    <ShareButton 
                      title="My Human Design Type"
                      description={`I'm a ${humanDesignProfile.type.name}! Strategy: ${humanDesignProfile.type.strategy}`}
                    />
                  </div>

                  {/* Type Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-violet-500/10 border border-indigo-500/20 text-center"
                  >
                    <Hexagon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-serif mb-2">{humanDesignProfile.type.name}</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">{humanDesignProfile.type.description}</p>
                  </motion.div>

                  {/* Key Information */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Strategy</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.strategy}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                      <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Signature</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.signature}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                      <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Not-Self</p>
                      <p className="font-medium text-sm">{humanDesignProfile.type.notSelf}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                      <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Profile</p>
                      <p className="font-medium text-sm">{humanDesignProfile.profile.fullName}</p>
                    </div>
                  </div>

                  {/* Profile Lines */}
                  <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="font-medium mb-3">Your Profile: {humanDesignProfile.profile.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-muted-foreground">Conscious (Personality)</p>
                        <p className="text-lg font-serif">Line {humanDesignProfile.profile.conscious}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-xs text-muted-foreground">Unconscious (Design)</p>
                        <p className="text-lg font-serif">Line {humanDesignProfile.profile.unconscious}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> This is a simplified calculation. For a complete and accurate 
                      Human Design chart with all centers, channels, and gates, we recommend getting a 
                      professional reading with your exact birth time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/human-design")}
                      className="mt-2"
                    >
                      Learn More About Human Design <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfileCalculator;
