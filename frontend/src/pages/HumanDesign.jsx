import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Star, Sun, Moon, Zap, Users, Eye, 
  ChevronRight, X, Circle, Hexagon, Target, Shield, Heart, Brain,
  Calendar, CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
const SOLAR_WHEEL = [
  41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,
  27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,
  28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60
];
function getDayOfYear(d) {
  return Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
}
function getSolarPos(date) {
  const adj = ((getDayOfYear(date) - 22) + 365) % 365;
  const pos = Math.floor(adj * 64 / 365) % 64;
  const line = Math.max(1, Math.min(6, Math.floor(((adj*64/365)-pos)*6)+1));
  return { gate: SOLAR_WHEEL[pos], pos, line };
}
function calcHDProfile(birthDate) {
  const date = new Date(birthDate + "T12:00:00");
  const { gate: sunGate, line: sunLine } = getSolarPos(date);
  const earthGate = SOLAR_WHEEL[(SOLAR_WHEEL.indexOf(sunGate)+32)%64] || sunGate;
  const designDate = new Date(date.getTime() - 88*24*60*60*1000);
  const { gate: dGate, line: dLine } = getSolarPos(designDate);
  const dEarthGate = SOLAR_WHEEL[(SOLAR_WHEEL.indexOf(dGate)+32)%64] || dGate;
  return { sunGate, earthGate, dGate, dEarthGate,
           profile: `${sunLine}/${dLine}`, sunLine, dLine };
}

const PROFILE_LINES = {
  1:{name:"Investigator",desc:"Foundation-seeker. You need deep knowledge and security before you shine."},
  2:{name:"Hermit",desc:"Natural talent emerges through solitude then re-engaging the world."},
  3:{name:"Martyr",desc:"You learn through trial and error — your 'mistakes' are sacred wisdom."},
  4:{name:"Opportunist",desc:"Networks and community are your power base. Relationships open doors."},
  5:{name:"Heretic",desc:"Others project their hopes onto you. You're here to offer practical solutions."},
  6:{name:"Role Model",desc:"You live in three phases: trial (1–30), withdrawal (30–50), wisdom (50+)."},
};

// ── BodyGraph SVG Component ───────────────────────────────────────────────────
// Typical defined centers per type (simplified archetypes for visualisation)
const DEFINED_CENTERS_BY_TYPE = {
  generator:             ["Sacral","G","Root"],
  "manifesting-generator":["Sacral","Throat","G","Root"],
  projector:             ["G","Ajna"],
  manifestor:            ["Throat","Heart","SolarPlexus"],
  reflector:             [],
};
const CENTER_COLORS = {
  Head:"#f0c040", Ajna:"#74c08a", Throat:"#8B6A4A",
  G:"#f0c040", Heart:"#cc4444", SolarPlexus:"#e07030",
  Sacral:"#cc4444", Spleen:"#8B6A4A", Root:"#8B6A4A"
};
const UNDEFINED_COLOR = "transparent";
const STROKE_COLOR = "#ffffff22";
const DEFINED_STROKE = "#ffffff55";

const BodyGraph = ({ typId }) => {
  const defined = DEFINED_CENTERS_BY_TYPE[typId] || [];
  const def = (name) => defined.includes(name);
  const fill = (name) => def(name) ? CENTER_COLORS[name] : UNDEFINED_COLOR;
  const stroke = (name) => def(name) ? DEFINED_STROKE : "#ffffff33";

  // Channel connections
  const channels = [
    [[100,30],[100,46]],           // Head-Ajna
    [[100,66],[100,86]],           // Ajna-Throat
    [[100,116],[100,136]],         // Throat-G
    [[116,100],[132,114]],         // Throat-Heart
    [[128,144],[134,130]],         // G-Heart
    [[100,172],[100,188]],         // G-Sacral
    [[74,156],[60,162]],           // G-Spleen
    [[100,214],[100,264]],         // Sacral-Root
    [[128,200],[142,200]],         // Sacral-SolarPlexus
    [[52,170],[80,268]],           // Spleen-Root
    [[60,156],[72,200]],           // Spleen-Sacral
    [[150,214],[122,270]],         // SolarPlexus-Root
  ];

  return (
    <svg viewBox="0 0 200 310" className="w-full max-w-[220px] mx-auto drop-shadow-lg">
      {/* Channels */}
      {channels.map(([[x1,y1],[x2,y2]], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#ffffff18" strokeWidth="4" />
      ))}

      {/* Head — diamond */}
      <polygon points="100,0 120,16 100,32 80,16"
        fill={fill("Head")} stroke={stroke("Head")} strokeWidth="1.5" />

      {/* Ajna — triangle up */}
      <polygon points="80,46 120,46 100,68"
        fill={fill("Ajna")} stroke={stroke("Ajna")} strokeWidth="1.5" />

      {/* Throat — rect */}
      <rect x="76" y="86" width="48" height="28" rx="3"
        fill={fill("Throat")} stroke={stroke("Throat")} strokeWidth="1.5" />

      {/* G Center — diamond */}
      <polygon points="100,134 126,156 100,178 74,156"
        fill={fill("G")} stroke={stroke("G")} strokeWidth="1.5" />

      {/* Heart — small square right */}
      <rect x="130" y="113" width="28" height="26" rx="3"
        fill={fill("Heart")} stroke={stroke("Heart")} strokeWidth="1.5" />

      {/* Solar Plexus — triangle right */}
      <polygon points="140,188 164,188 152,214"
        fill={fill("SolarPlexus")} stroke={stroke("SolarPlexus")} strokeWidth="1.5" />

      {/* Sacral — rect */}
      <rect x="72" y="188" width="56" height="28" rx="3"
        fill={fill("Sacral")} stroke={stroke("Sacral")} strokeWidth="1.5" />

      {/* Spleen — triangle left */}
      <polygon points="36,148 60,148 48,172"
        fill={fill("Spleen")} stroke={stroke("Spleen")} strokeWidth="1.5" />

      {/* Root — rect */}
      <rect x="76" y="264" width="48" height="26" rx="3"
        fill={fill("Root")} stroke={stroke("Root")} strokeWidth="1.5" />

      {/* Labels */}
      {[
        {label:"HEAD", x:100, y:17},
        {label:"AJNA", x:100, y:59},
        {label:"THROAT", x:100, y:103},
        {label:"G", x:100, y:157},
        {label:"HEART", x:144, y:128},
        {label:"SP", x:152, y:203},
        {label:"SACRAL", x:100, y:205},
        {label:"SPLN", x:48, y:162},
        {label:"ROOT", x:100, y:280},
      ].map(({label,x,y}) => (
        <text key={label} x={x} y={y} textAnchor="middle" fontSize="5.5"
          fill="rgba(255,255,255,0.7)" fontFamily="serif" fontWeight="600">
          {label}
        </text>
      ))}
    </svg>
  );
};


const humanDesignTypes = [
  {
    id: "generator",
    name: "Generator",
    population: "~37%",
    icon: Zap,
    color: "orange",
    aura: "Open and Enveloping",
    strategy: "Wait to Respond",
    notSelf: "Frustration",
    signature: "Satisfaction",
    description: "Generators are the life force of the planet. They have sustainable energy from their defined Sacral Center. Their strategy is to wait for life to come to them and then respond with their gut (Sacral response).",
    keyTraits: [
      "Sustainable work energy when doing what they love",
      "Sacral 'uh-huh' or 'uh-uh' response guides decisions",
      "Magnetic aura that draws opportunities to them",
      "Master builders who create through response",
      "Need to be asked to access their wisdom"
    ],
    deconditioning: "Generators have been conditioned to initiate and push. The deconditioning process involves learning to wait, trusting that the right opportunities will come. When you respond rather than initiate, life flows with ease and you feel deep satisfaction.",
    affirmation: "I trust that life brings me exactly what I need. I wait, I respond, and I am satisfied."
  },
  {
    id: "manifesting-generator",
    name: "Manifesting Generator",
    population: "~33%",
    icon: Zap,
    color: "red",
    aura: "Open and Enveloping",
    strategy: "Wait to Respond, then Inform",
    notSelf: "Frustration and Anger",
    signature: "Satisfaction and Peace",
    description: "Manifesting Generators are multi-passionate energy beings who combine Generator sustainability with Manifestor initiating energy. They move quickly and often skip steps, which is correct for them.",
    keyTraits: [
      "Multi-passionate with many interests",
      "Fast-moving and efficient",
      "Skip steps naturally (correct for them)",
      "Need to respond AND inform before acting",
      "Can pivot quickly when something isn't working"
    ],
    deconditioning: "MGs have been told to slow down and focus on one thing. Your multi-passionate nature is a gift. Trust your Sacral response, inform those affected by your actions, and embrace your unique non-linear path.",
    affirmation: "I honor my multiple passions. I respond, I inform, and I move at my own pace."
  },
  {
    id: "projector",
    name: "Projector",
    population: "~20%",
    icon: Eye,
    color: "blue",
    aura: "Focused and Absorbing",
    strategy: "Wait for the Invitation",
    notSelf: "Bitterness",
    signature: "Success",
    description: "Projectors are here to guide and direct the energy of others. They have a focused, penetrating aura that can see deep into others. They need recognition and invitation to share their gifts.",
    keyTraits: [
      "Natural guides and advisors",
      "See systems and how to optimize them",
      "Need recognition before sharing wisdom",
      "Require rest and alone time to discharge energy",
      "Waiting for invitation protects their energy"
    ],
    deconditioning: "Projectors have been conditioned to work like Generators and initiate like Manifestors. The deconditioning process involves learning to wait for recognition and invitation, especially in career, love, and living situations. Your wisdom is valued when invited.",
    affirmation: "I wait for recognition and invitation. My guidance is valuable and I share it when invited."
  },
  {
    id: "manifestor",
    name: "Manifestor",
    population: "~9%",
    icon: Shield,
    color: "purple",
    aura: "Closed and Repelling",
    strategy: "Inform Before Acting",
    notSelf: "Anger",
    signature: "Peace",
    description: "Manifestors are the initiators, here to get things started. They have a closed aura that can feel repelling to others. By informing before acting, they reduce resistance and find peace.",
    keyTraits: [
      "Natural initiators who start things",
      "Independent and self-contained",
      "Impact others with their aura and actions",
      "Need freedom and space to create",
      "Informing prevents resistance from others"
    ],
    deconditioning: "Manifestors have been conditioned to ask permission. You don't need permission - you need to inform. The difference is crucial. Informing is not asking; it's a courtesy that allows others to adjust and reduces the resistance you feel.",
    affirmation: "I am free to initiate. I inform out of respect, not to seek permission. I find peace in my impact."
  },
  {
    id: "reflector",
    name: "Reflector",
    population: "~1%",
    icon: Moon,
    color: "violet",
    aura: "Resistant and Sampling",
    strategy: "Wait a Lunar Cycle (28 days)",
    notSelf: "Disappointment",
    signature: "Surprise",
    description: "Reflectors are rare beings with no defined centers. They sample and reflect the energy around them, making them barometers for the health of their community. They need a full lunar cycle to make major decisions.",
    keyTraits: [
      "Mirror the health of their community",
      "Experience all energies but identify with none",
      "Deeply affected by their environment",
      "Major decisions need 28 days (lunar cycle)",
      "Wisdom comes from talking through decisions"
    ],
    deconditioning: "Reflectors have been conditioned to make quick decisions like everyone else. Your lunar cycle strategy is not a limitation - it's your protection. In that 28 days, you experience the decision from every perspective. Take your time.",
    affirmation: "I honor my need for time. I wait through the full moon cycle and trust the clarity that comes."
  }
];

// Nine Centers
const centers = [
  {
    name: "Head",
    location: "Top",
    color: "yellow",
    theme: "Inspiration & Mental Pressure",
    defined: "Consistent source of inspiration and questions. Mental pressure to think and figure things out.",
    undefined: "Amplifies others' inspiration. Can get lost in questions that aren't yours. Wisdom: Not every question needs an answer.",
    biological: "Pineal Gland"
  },
  {
    name: "Ajna",
    location: "Between Head and Throat",
    color: "green",
    theme: "Mind & Conceptualization",
    defined: "Fixed way of processing and thinking. Reliable mental patterns. Strong opinions.",
    undefined: "Open mind that can see all perspectives. Amplifies others' certainty. Wisdom: Certainty isn't necessary.",
    biological: "Pituitary Gland"
  },
  {
    name: "Throat",
    location: "Center",
    color: "brown",
    theme: "Communication & Manifestation",
    defined: "Consistent way of speaking and expressing. Reliable voice and communication style.",
    undefined: "Flexible communication that adapts. Desire to attract attention. Wisdom: Wait for the right moment to speak.",
    biological: "Thyroid & Parathyroid"
  },
  {
    name: "G Center (Self)",
    location: "Center of Chest",
    color: "yellow",
    theme: "Identity & Direction",
    defined: "Fixed sense of self and direction. Reliable identity. Knows who they are and where they're going.",
    undefined: "Chameleon-like identity that adapts. Can get lost in others' direction. Wisdom: Place and people matter - be in the right environment.",
    biological: "Liver & Blood"
  },
  {
    name: "Heart (Ego)",
    location: "Right of Center",
    color: "red",
    theme: "Willpower & Value",
    defined: "Consistent willpower and drive. Can make and keep promises. Natural sense of self-worth.",
    undefined: "Amplifies others' willpower. Can feel pressure to prove worth. Wisdom: Nothing to prove - your value is inherent.",
    biological: "Heart, Stomach, Gallbladder"
  },
  {
    name: "Solar Plexus",
    location: "Right Side",
    color: "orange",
    theme: "Emotions & Feeling",
    defined: "Emotional authority. Waves of emotions are natural. Need to wait for clarity through the wave.",
    undefined: "Amplifies others' emotions. Can avoid confrontation. Wisdom: Not all emotions are yours - don't make decisions based on others' feelings.",
    biological: "Kidneys, Pancreas, Nervous System"
  },
  {
    name: "Sacral",
    location: "Below G Center",
    color: "red",
    theme: "Life Force & Work",
    defined: "Sustainable work energy. Sacral response (gut feeling) guides decisions. Generators and MGs have this.",
    undefined: "No consistent life force energy. Can overwork to keep up. Wisdom: You're not here to work like a Generator - rest is essential.",
    biological: "Ovaries, Testes"
  },
  {
    name: "Spleen",
    location: "Left Side",
    color: "brown",
    theme: "Intuition & Survival",
    defined: "Consistent intuition and immune response. Spontaneous knowing. Splenic authority speaks once.",
    undefined: "Amplifies others' fears and intuition. Can hold onto what's unhealthy. Wisdom: Let go of what's no longer serving you.",
    biological: "Spleen, Lymphatic System"
  },
  {
    name: "Root",
    location: "Bottom",
    color: "brown",
    theme: "Pressure & Adrenaline",
    defined: "Consistent way of handling stress. Natural drive and pressure. Can work under stress.",
    undefined: "Amplifies others' stress. Can feel rushed when there's no rush. Wisdom: You don't have to act on the pressure.",
    biological: "Adrenal Glands"
  }
];

// Key Gates (abbreviated list of meaningful ones)
const keyGates = [
  { number: 1, name: "Self-Expression", center: "G", theme: "Creative self-expression, individuality" },
  { number: 2, name: "The Receptive", center: "G", theme: "Direction, driver of vehicle of life" },
  { number: 7, name: "The Army", center: "G", theme: "Leadership, direction, role of the self" },
  { number: 10, name: "Treading", center: "G", theme: "Self-love, behavior, awakening" },
  { number: 13, name: "The Listener", center: "G", theme: "Listener, keeper of secrets" },
  { number: 20, name: "Contemplation", center: "Throat", theme: "Presence, the now, contemplation" },
  { number: 34, name: "Power", center: "Sacral", theme: "Pure power, available energy" },
  { number: 43, name: "Breakthrough", center: "Ajna", theme: "Insight, breakthrough, unique knowing" },
  { number: 46, name: "Love of the Body", center: "G", theme: "Serendipity, right place right time" },
  { number: 51, name: "Shock", center: "Heart", theme: "Initiative, shock, competitive spirit" },
  { number: 57, name: "The Gentle", center: "Spleen", theme: "Intuitive clarity, penetrating insight" },
  { number: 62, name: "Details", center: "Throat", theme: "Expressing details, naming things" },
  { number: 64, name: "Before Completion", center: "Head", theme: "Confusion to clarity, mental pressure" }
];

const HumanDesign = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);

  // My Chart state
  const [birthYear, setBirthYear]   = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay]     = useState("");
  const [hdProfile, setHdProfile]   = useState(null);
  const [chosenType, setChosenType] = useState(null);
  const [phase, setPhase] = useState(1); // 1=DOB, 2=type-pick, 3=results

  const currentYear = new Date().getFullYear();
  const years  = Array.from({length: currentYear - 1899}, (_,i) => currentYear - i);
  const months = [
    {value:"01",label:"January"},{value:"02",label:"February"},{value:"03",label:"March"},
    {value:"04",label:"April"},{value:"05",label:"May"},{value:"06",label:"June"},
    {value:"07",label:"July"},{value:"08",label:"August"},{value:"09",label:"September"},
    {value:"10",label:"October"},{value:"11",label:"November"},{value:"12",label:"December"},
  ];
  const days = Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"));

  const handleCalcProfile = () => {
    if (!birthYear||!birthMonth||!birthDay) return;
    const p = calcHDProfile(`${birthYear}-${birthMonth}-${birthDay}`);
    setHdProfile(p);
    setPhase(2);
  };

  const handleSelectType = (typeId) => {
    setChosenType(humanDesignTypes.find(t=>t.id===typeId));
    setPhase(3);
  };

  const resetChart = () => { setPhase(1); setHdProfile(null); setChosenType(null); setBirthYear(""); setBirthMonth(""); setBirthDay(""); };

  const tabs = [
    { id: "chart",    label: "My Chart" },
    { id: "types",    label: "5 Energy Types" },
    { id: "centers",  label: "9 Centers" },
    { id: "gates",    label: "64 Gates" },
    { id: "experiment", label: "Your Experiment" }
  ];

  const getTypeColor = (color) => {
    const colors = {
      orange: "from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-300",
      red: "from-red-500/10 to-rose-500/5 border-red-500/20 text-red-300",
      blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-300",
      purple: "from-purple-500/10 to-violet-500/5 border-purple-500/20 text-purple-300",
      violet: "from-violet-500/10 to-indigo-500/5 border-violet-500/20 text-violet-300"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="human-design">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wisdom System</p>
              <h1 className="text-xl font-serif">Human <span className="italic text-primary">Design</span></h1>
            </div>
          </div>
          <Hexagon className="w-6 h-6 text-primary/50" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Hexagon className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Human <span className="italic text-primary">Design</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6 text-lg">
            A synthesis of ancient wisdom and modern science — combining the I Ching, Kabbalah, 
            astrology, the chakra system, and quantum physics into a unique blueprint for living authentically.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* ── MY CHART TAB ── */}
          {activeTab === "chart" && (
            <motion.div key="chart" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="max-w-2xl mx-auto space-y-6">

              {/* Phase 1 — DOB input */}
              {phase === 1 && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Hexagon className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-serif mb-2">Your <span className="italic text-primary">Human Design Chart</span></h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Enter your birth date to discover your Profile and then identify your Energy Type for a personalised Human Design reading.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date of Birth
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <Select value={birthYear} onValueChange={setBirthYear}>
                          <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-year">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-card border-white/10">
                            {years.map(y=><SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={birthMonth} onValueChange={setBirthMonth}>
                          <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-month">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-white/10">
                            {months.map(m=><SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={birthDay} onValueChange={setBirthDay}>
                          <SelectTrigger className="bg-card/50 border-white/10" data-testid="hd-birth-day">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-card border-white/10">
                            {days.map(d=><SelectItem key={d} value={d}>{parseInt(d)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleCalcProfile} disabled={!birthYear||!birthMonth||!birthDay} className="w-full" data-testid="hd-calculate-btn">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Reveal My Profile
                    </Button>
                  </div>
                </div>
              )}

              {/* Phase 2 — Type selection */}
              {phase === 2 && hdProfile && (
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6">
                  {/* Profile revealed */}
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <p className="text-xs uppercase tracking-wider text-indigo-400 mb-1">Your Human Design Profile</p>
                    <p className="text-3xl font-serif text-indigo-300">{hdProfile.profile}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {PROFILE_LINES[hdProfile.sunLine]?.name} / {PROFILE_LINES[hdProfile.dLine]?.name}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                      <div className="p-3 rounded-xl bg-white/5 text-xs">
                        <p className="text-indigo-400 mb-1">Conscious Sun Gate</p>
                        <p className="font-mono text-lg text-foreground">{hdProfile.sunGate}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 text-xs">
                        <p className="text-violet-400 mb-1">Design Sun Gate</p>
                        <p className="font-mono text-lg text-foreground">{hdProfile.dGate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">Now select your Energy Type</p>
                    <p className="text-xs text-muted-foreground">Choose the description that resonates most deeply with your lived experience</p>
                  </div>

                  <div className="space-y-3">
                    {humanDesignTypes.map(t => {
                      const s = getTypeColor(t.color);
                      const Icon = t.icon;
                      return (
                        <motion.button key={t.id} whileTap={{scale:0.98}}
                          onClick={()=>handleSelectType(t.id)}
                          className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r ${s.split(' ').slice(0,2).join(' ')} border ${s.split(' ')[2]} hover:scale-[1.01] transition-all`}
                          data-testid={`hd-type-select-${t.id}`}>
                          <div className="flex items-center gap-3 mb-1">
                            <Icon className={`w-5 h-5 ${s.split(' ')[3]}`} />
                            <span className="font-serif text-lg">{t.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{t.population}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                          <p className={`text-xs mt-1 ${s.split(' ')[3]}`}>Strategy: {t.strategy}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                  <Button variant="outline" className="w-full border-white/10 text-xs" onClick={()=>setPhase(1)}>
                    ← Change Birth Date
                  </Button>
                </motion.div>
              )}

              {/* Phase 3 — Full results */}
              {phase === 3 && hdProfile && chosenType && (
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6" data-testid="hd-results">
                  {/* Header */}
                  <div className={`p-6 rounded-2xl bg-gradient-to-br ${getTypeColor(chosenType.color).split(' ').slice(0,2).join(' ')} border ${getTypeColor(chosenType.color).split(' ')[2]}`}>
                    <div className="flex items-center gap-4 mb-3">
                      {(() => { const Icon = chosenType.icon; return <Icon className={`w-10 h-10 ${getTypeColor(chosenType.color).split(' ')[3]}`} />; })()}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Type</p>
                        <h2 className="text-2xl font-serif">{chosenType.name}</h2>
                      </div>
                      <div className={`ml-auto px-3 py-1 rounded-full text-sm font-mono
                        bg-white/10 ${getTypeColor(chosenType.color).split(' ')[3]}`}>
                        Profile {hdProfile.profile}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{chosenType.description}</p>
                  </div>

                  {/* BodyGraph + Key Mechanics side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {/* BodyGraph */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 text-center">BodyGraph</p>
                      <BodyGraph typId={chosenType.id} />
                      <p className="text-center text-xs text-muted-foreground mt-3">Coloured = typically defined</p>
                    </div>

                    {/* Strategy + Authority + Signature + Not-Self */}
                    <div className="space-y-3">
                      {[
                        {label:"Strategy", value:chosenType.strategy, color:"green"},
                        {label:"Aura",     value:chosenType.aura,     color:"blue"},
                        {label:"Signature",value:chosenType.signature, color:"amber"},
                        {label:"Not-Self", value:chosenType.notSelf,   color:"red"},
                      ].map(({label,value,color})=>(
                        <div key={label} className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                          <p className={`text-xs text-${color}-400 uppercase tracking-wider mb-0.5`}>{label}</p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profile description */}
                  <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs uppercase tracking-wider text-violet-400 mb-2">Profile {hdProfile.profile} — {PROFILE_LINES[hdProfile.sunLine]?.name} / {PROFILE_LINES[hdProfile.dLine]?.name}</p>
                    <p className="text-sm text-muted-foreground">{PROFILE_LINES[hdProfile.sunLine]?.desc}</p>
                  </div>

                  {/* Key Traits */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      Key Traits
                    </h4>
                    <div className="space-y-2">
                      {chosenType.keyTraits.map((t,i)=>(
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deconditioning */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <h4 className="text-sm font-semibold mb-2 text-indigo-300">Deconditioning Path</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{chosenType.deconditioning}</p>
                  </div>

                  {/* Affirmation */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
                    <p className="text-lg font-serif italic">"{chosenType.affirmation}"</p>
                  </div>

                  <Button variant="outline" className="w-full border-white/10" onClick={resetChart} data-testid="hd-reset-btn">
                    Calculate New Chart
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── EXISTING TABS ── */}
          {activeTab === "types" && (
            <motion.div
              key="types"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                There are five energy types in Human Design, each with a unique aura, strategy, 
                and way of interacting with the world. Understanding your type is the foundation 
                of living your design.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {humanDesignTypes.map((type, index) => {
                  const Icon = type.icon;
                  const colorClasses = getTypeColor(type.color);
                  return (
                    <motion.div
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedType(type)}
                      className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-br ${colorClasses.split(' ').slice(0, 2).join(' ')} 
                                border ${colorClasses.split(' ')[2]} hover:scale-[1.02] transition-all`}
                      data-testid={`type-${type.id}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Icon className={`w-10 h-10 ${colorClasses.split(' ')[3]}`} />
                        <span className="text-xs text-muted-foreground">{type.population}</span>
                      </div>
                      <h3 className="font-serif text-xl mb-1">{type.name}</h3>
                      <p className={`text-sm ${colorClasses.split(' ')[3]} mb-2`}>Strategy: {type.strategy}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{type.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm opacity-70">
                        <ChevronRight className="w-4 h-4" />
                        <span>Learn More</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "centers" && (
            <motion.div
              key="centers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                The nine centers in your BodyGraph represent different aspects of your being. 
                Centers can be defined (colored, consistent energy) or undefined (white, amplifying others' energy).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {centers.map((center, index) => (
                  <motion.div
                    key={center.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCenter(center)}
                    className="cursor-pointer p-5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all"
                    data-testid={`center-${center.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full bg-${center.color}-500/30 border border-${center.color}-500/50`} />
                      <h4 className="font-serif text-lg">{center.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{center.theme}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "gates" && (
            <motion.div
              key="gates"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <h3 className="font-serif text-xl mb-3">The 64 Gates</h3>
                <p className="text-muted-foreground">
                  Based on the 64 hexagrams of the I Ching, the gates represent specific energies 
                  and themes in your design. When two gates connect across centers, they form a channel.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {keyGates.map((gate, index) => (
                  <motion.div
                    key={gate.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                    data-testid={`gate-${gate.number}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-mono text-indigo-300">
                        {gate.number}
                      </span>
                      <span className="font-medium">{gate.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{gate.theme}</p>
                    <p className="text-xs text-indigo-400 mt-1">{gate.center} Center</p>
                  </motion.div>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Showing key gates. Your complete chart reveals which of the 64 gates are activated in your design.
              </p>
            </motion.div>
          )}

          {activeTab === "experiment" && (
            <motion.div
              key="experiment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="p-8 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-2xl font-serif mb-4">Your Human Design Experiment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Human Design is not a belief system. It's an experiment. You're invited to test it 
                  in your own life and see if it works for you. The only way to know is to try.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif text-lg">How to Begin Your Experiment</h4>
                <ol className="space-y-4">
                  {[
                    "Get your free chart from a Human Design site using your birth date, time, and location.",
                    "Learn your Type and Strategy. This is the foundation of your experiment.",
                    "Observe your not-self theme (frustration, bitterness, anger, disappointment). Notice when it arises.",
                    "Practice your Strategy for at least 3 months before expecting major shifts.",
                    "Learn your Authority - this is how you make correct decisions for yourself.",
                    "Don't try to change everything at once. Small experiments lead to big realizations.",
                    "Be patient. Deconditioning takes approximately 7 years - the time for all cells to regenerate."
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-medium mb-3">The Ra Uru Hu Quote</h4>
                <p className="text-lg font-serif italic text-foreground/80">
                  "Love yourself. You are a unique being. There is no one like you. 
                  You are here to live out your own life, not anyone else's."
                </p>
                <p className="text-sm text-muted-foreground mt-2">— Ra Uru Hu, founder of Human Design</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-medium mb-2">Strategy & Authority</h5>
                  <p className="text-sm text-muted-foreground">
                    Your Strategy tells you how to navigate life correctly. Your Authority tells you 
                    how to make decisions. Together, they are your roadmap to living authentically.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <h5 className="font-medium mb-2">The Not-Self</h5>
                  <p className="text-sm text-muted-foreground">
                    The not-self is who you become when you're not living your design. Recognizing 
                    your not-self theme is the first step toward returning to your authentic self.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Type Detail Modal */}
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedType(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-serif">{selectedType.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedType.population} of population</p>
                  </div>
                  <button onClick={() => setSelectedType(null)} className="p-2 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-muted-foreground">{selectedType.description}</p>

                {/* Strategy & Signature */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Strategy</p>
                    <p className="font-medium">{selectedType.strategy}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Aura</p>
                    <p className="font-medium text-sm">{selectedType.aura}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Signature</p>
                    <p className="font-medium">{selectedType.signature}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Not-Self</p>
                    <p className="font-medium">{selectedType.notSelf}</p>
                  </div>
                </div>

                {/* Key Traits */}
                <div>
                  <h4 className="font-medium mb-3">Key Traits</h4>
                  <ul className="space-y-2">
                    {selectedType.keyTraits.map((trait, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deconditioning */}
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h4 className="font-medium mb-2 text-violet-300">Deconditioning</h4>
                  <p className="text-sm text-muted-foreground">{selectedType.deconditioning}</p>
                </div>

                {/* Affirmation */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
                  <p className="text-lg font-serif italic">"{selectedType.affirmation}"</p>
                </div>

                <Button onClick={() => setSelectedType(null)} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Detail Modal */}
      <AnimatePresence>
        {selectedCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCenter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-serif">{selectedCenter.name} Center</h2>
                    <p className="text-sm text-muted-foreground">{selectedCenter.theme}</p>
                  </div>
                  <button onClick={() => setSelectedCenter(null)} className="p-2 rounded-full hover:bg-white/10">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">When Defined (Colored)</p>
                    <p className="text-sm text-muted-foreground">{selectedCenter.defined}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">When Undefined (White)</p>
                    <p className="text-sm text-muted-foreground">{selectedCenter.undefined}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <p className="text-xs text-violet-400 uppercase tracking-wider mb-1">Biological Correlation</p>
                  <p className="text-sm">{selectedCenter.biological}</p>
                </div>

                <Button onClick={() => setSelectedCenter(null)} className="w-full" variant="outline">
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

export default HumanDesign;
