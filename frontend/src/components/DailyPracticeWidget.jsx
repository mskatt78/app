import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sparkles, Gem, Star, Leaf, Wind, Waves, Mountain, Flame, ChevronRight, RefreshCw } from "lucide-react";

// ── Moon phase calculation ────────────────────────────────────────────────────
const getMoonPhase = (date) => {
  const known = new Date(2001, 0, 24); // Known new moon Jan 24 2001
  const days = (date - known) / 86400000;
  const cycle = 29.53059;
  const phase = ((days % cycle) + cycle) % cycle;
  if (phase < 1.85)  return { name: "New Moon",          emoji: "🌑", energy: "New Beginnings",   desc: "Plant seeds of intention in the fertile dark." };
  if (phase < 7.38)  return { name: "Waxing Crescent",   emoji: "🌒", energy: "Growth",           desc: "Nurture what you are building. Momentum gathers." };
  if (phase < 9.22)  return { name: "First Quarter",      emoji: "🌓", energy: "Action",           desc: "Take decisive steps. The path opens for those who move." };
  if (phase < 14.77) return { name: "Waxing Gibbous",    emoji: "🌔", energy: "Refinement",       desc: "Refine and prepare. Your dream is nearly ripe." };
  if (phase < 16.61) return { name: "Full Moon",          emoji: "🌕", energy: "Illumination",     desc: "Stand in your full light. Release what dims you." };
  if (phase < 22.15) return { name: "Waning Gibbous",    emoji: "🌖", energy: "Gratitude",        desc: "Share your gifts. Give thanks for all that bloomed." };
  if (phase < 23.99) return { name: "Last Quarter",       emoji: "🌗", energy: "Release",          desc: "Let go with grace. What served you has done its work." };
  return               { name: "Waning Crescent",         emoji: "🌘", energy: "Surrender",        desc: "Rest deeply. The dark is sacred. You are being composted." };
};

// ── Element by day (planetary correspondences) ───────────────────────────────
const ELEMENTS = [
  { element: "Fire",   icon: Flame,    color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/25", day: "Sunday",    planet: "Sun" },
  { element: "Water",  icon: Waves,    color: "text-blue-300",   bg: "bg-blue-500/10",   border: "border-blue-500/25",   day: "Monday",    planet: "Moon" },
  { element: "Fire",   icon: Flame,    color: "text-red-300",    bg: "bg-red-500/10",    border: "border-red-500/25",    day: "Tuesday",   planet: "Mars" },
  { element: "Air",    icon: Wind,     color: "text-cyan-300",   bg: "bg-cyan-500/10",   border: "border-cyan-500/25",   day: "Wednesday", planet: "Mercury" },
  { element: "Earth",  icon: Mountain, color: "text-emerald-300",bg: "bg-emerald-500/10",border: "border-emerald-500/25",day: "Thursday",  planet: "Jupiter" },
  { element: "Spirit", icon: Sparkles, color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/25", day: "Friday",    planet: "Venus" },
  { element: "Earth",  icon: Mountain, color: "text-stone-300",  bg: "bg-stone-500/10",  border: "border-stone-500/25",  day: "Saturday",  planet: "Saturn" },
];

// ── Crystals by element ───────────────────────────────────────────────────────
const CRYSTALS = {
  Earth:  ["Obsidian", "Smoky Quartz", "Moss Agate", "Red Jasper", "Garnet", "Black Tourmaline", "Shungite"],
  Water:  ["Moonstone", "Aquamarine", "Blue Lace Agate", "Selenite", "Labradorite", "Pearl", "Blue Calcite"],
  Fire:   ["Carnelian", "Citrine", "Sunstone", "Tiger's Eye", "Amber", "Fire Opal", "Red Garnet"],
  Air:    ["Clear Quartz", "Amethyst", "Celestite", "Blue Kyanite", "Sodalite", "Fluorite", "Apophyllite"],
  Spirit: ["Rainbow Moonstone", "Moldavite", "Sugilite", "Charoite", "Lepidolite", "Opal", "Phenacite"],
};

// ── Practice by moon phase ────────────────────────────────────────────────────
const PRACTICES = {
  "New Moon":        { type: "Ritual",     path: "/oracle",     label: "Draw an oracle card for your new cycle", cta: "Open Oracle" },
  "Waxing Crescent": { type: "Breathwork", path: "/breathwork", label: "Box breathing (4-4-4-4) — build momentum and clarity", cta: "Breathwork" },
  "First Quarter":   { type: "Movement",   path: "/yoga",       label: "Warrior sequence — embody decisive, active energy", cta: "Yoga Library" },
  "Waxing Gibbous":  { type: "Somatic",    path: "/somatic",    label: "Body scan — sense where you hold tension as dreams near fullness", cta: "Somatic Practice" },
  "Full Moon":       { type: "Ritual",     path: "/astrology",  label: "Moon water ceremony — charge intentions under full light", cta: "Moon Calendar" },
  "Waning Gibbous":  { type: "Gratitude",  path: "/meditations",label: "Gratitude meditation — reflect on what this cycle has brought", cta: "Meditations" },
  "Last Quarter":    { type: "Breathwork", path: "/breathwork", label: "4-8 breath (4 in, 8 out) — release what no longer serves", cta: "Breathwork" },
  "Waning Crescent": { type: "Rest",       path: "/meditations",label: "Yoga Nidra or deep rest — honour the sacred dark", cta: "Meditations" },
};

// ── Oracle messages (52 — rotates weekly, seeded by day of year) ──────────────
const ORACLE_MESSAGES = [
  "The seed you planted in the dark is already growing, even when you cannot see it.",
  "You are not behind. You are in sacred time, moving at the pace of your own unfolding.",
  "What you tend with love will flourish. Begin there.",
  "The earth beneath your feet is dreaming. What are you dreaming with her?",
  "Your roots are deeper than your fears. Let them hold you.",
  "The moon does not apologise for her dark phase. Neither should you.",
  "Every ending is the earth composting what it no longer needs. Trust the turning.",
  "You came here to be fully alive — not safe. Alive.",
  "The forest does not force its growth. It blooms in its own perfect season.",
  "What the fire cannot destroy is what is truly you.",
  "The river does not fight the rock — it finds its way through, in its own sacred time.",
  "Your body is the earth. When you tend it with reverence, all things become possible.",
  "In the language of the ancestors, your longing is a prayer.",
  "What are you willing to release to the fire today?",
  "The wind carries more than seeds — it carries prayers. Speak yours.",
  "You are standing on the shoulders of all who loved you before you were born.",
  "The crystal was formed over millions of years of pressure. So were you.",
  "Something is completing in you right now. Let it finish.",
  "The hawk does not hesitate once it sees its path. Trust your vision.",
  "In every darkness, there is a moon. In every winter, a seed is waiting.",
  "Your healing ripples backward through your bloodline and forward into your children's children.",
  "The deep is calling the deep. Trust what you hear when you are finally still.",
  "What the mind cannot solve, the body already knows. Drop into your centre.",
  "You are not here to be comfortable. You are here to be transformed.",
  "The tree in the storm does not argue with the wind. It bends, holds its roots, and stands again.",
  "Grief is love with nowhere to go. Let it flow — let it find the ocean.",
  "There is a version of you that has never doubted your worth. Remember her.",
  "The shaman does not fight the darkness — she befriends it and asks what it knows.",
  "Your body is a temple that breathes. Every breath is a ceremony.",
  "What would you do today if you were completely unafraid?",
  "The crystal remembers what the mind forgets. Hold one. Listen.",
  "You are made of the same stuff as stars. Your brilliance is your birthright.",
  "The land knows your name. It has always been waiting for you to come home.",
  "Today, one act of beauty will be enough. Let it be enough.",
  "The circle never breaks — it transforms. You are in a spiral, not a loop.",
  "What is asking to be born through you? The universe is waiting.",
  "Honour the wound. It is where your medicine grows.",
  "Your prayer does not need words. Your breath is already a prayer.",
  "The ancestors walk with you. You are never as alone as you feel.",
  "Something ancient in you is being called awake. Answer.",
  "Your sensitivity is not a weakness — it is your superpower, your divining rod.",
  "The river to the sea knows no straight path. Neither does healing.",
  "Plant one seed of kindness in the world today. Watch what grows.",
  "The fire ceremony is happening inside you right now. What is burning?",
  "You are the bridge between the world you came from and the world being born.",
  "In your deepest grief, the earth holds you. She has always held you.",
  "The seasons do not apologise for their turning. Celebrate yours.",
  "What if everything you have been through was preparing you for exactly this moment?",
  "The medicine is in the meaning you make of what you have survived.",
  "You are not the storm. You are the sky that holds it.",
  "The eagle sees from great height. Rise above the story. See the larger arc.",
  "Something in you knows the way. Be quiet enough to hear it.",
];

// ── Helper: Get day of year ───────────────────────────────────────────────────
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
};

const DailyPracticeWidget = ({ hemisphere = "south" }) => {
  const navigate = useNavigate();
  const [today, setToday] = useState(new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute daily values
  const moonPhase   = getMoonPhase(today);
  const elementData = ELEMENTS[today.getDay()];
  const ElementIcon = elementData.icon;
  const dayOfYear   = getDayOfYear(today);
  const crystalList = CRYSTALS[elementData.element];
  const crystal     = crystalList[dayOfYear % crystalList.length];
  const oracle      = ORACLE_MESSAGES[dayOfYear % ORACLE_MESSAGES.length];
  const practice    = PRACTICES[moonPhase.name];

  const dateStr = today.toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // Southern hemisphere moon is mirrored visually
  const moonEmoji = hemisphere === "south"
    ? { "🌒": "🌘", "🌔": "🌖", "🌖": "🌔", "🌘": "🌒" }[moonPhase.emoji] ?? moonPhase.emoji
    : moonPhase.emoji;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid="daily-practice-widget"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-background to-purple-950/40 backdrop-blur-xl mb-8"
    >
      {/* Decorative moon glow */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              {hemisphere === "south" ? "🌿 Southern Hemisphere" : "☀️ Northern Hemisphere"} · {dateStr}
            </p>
            <h2 className="text-2xl font-serif">Sacred Practice <span className="italic text-primary">of the Day</span></h2>
          </div>
          <button
            onClick={() => setToday(new Date())}
            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Main row: Moon + Element + Crystal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Moon Phase */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/8">
            <span className="text-3xl">{moonEmoji}</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{moonPhase.energy}</p>
              <p className="font-serif text-sm">{moonPhase.name}</p>
            </div>
          </div>

          {/* Element */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${elementData.bg} ${elementData.border}`} data-testid="element-of-day">
            <ElementIcon className={`w-7 h-7 ${elementData.color}`} />
            <div>
              <p className={`text-xs uppercase tracking-wider ${elementData.color}`}>{elementData.planet}'s Day</p>
              <p className="font-serif text-sm">{elementData.element}</p>
            </div>
          </div>

          {/* Crystal */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/8" data-testid="crystal-of-day">
            <Gem className="w-7 h-7 text-pink-300" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Crystal</p>
              <p className="font-serif text-sm">{crystal}</p>
            </div>
          </div>
        </div>

        {/* Oracle Message */}
        <motion.div
          className="p-5 rounded-xl bg-primary/5 border border-primary/15 mb-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          data-testid="oracle-message"
          whileHover={{ scale: 1.005 }}
        >
          <div className="flex items-start gap-3">
            <Star className="w-4 h-4 text-primary/60 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-primary/60 uppercase tracking-wider mb-2">Oracle of the Day</p>
              <p className="font-serif italic text-foreground/90 leading-relaxed">"{oracle}"</p>
            </div>
          </div>
        </motion.div>

        {/* Moon Phase Wisdom */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 px-1">
          <span className="text-foreground/70">{moonPhase.emoji} {moonPhase.name}:</span> {moonPhase.desc}
        </p>

        {/* Practice CTA */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/8">
          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-primary/60 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{practice.type} of the Day</p>
              <p className="text-sm text-foreground/80">{practice.label}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(practice.path)}
            className="ml-3 flex-shrink-0 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            data-testid="practice-cta"
          >
            {practice.cta} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyPracticeWidget;
