import { Crown, Dna, Heart, Moon, Sun, Zap } from "lucide-react";

export const geneKeysData = [
  { key: 1, shadow: "Entropy", gift: "Freshness", siddhi: "Beauty", theme: "From Entropy to Syntropy", codon: "AAA", amino: "Lys" },
  { key: 2, shadow: "Dislocation", gift: "Orientation", siddhi: "Unity", theme: "Returning to the One", codon: "AAC", amino: "Asn" },
  { key: 3, shadow: "Chaos", gift: "Innovation", siddhi: "Innocence", theme: "Through the Eyes of a Child", codon: "AAG", amino: "Lys" },
  { key: 4, shadow: "Intolerance", gift: "Understanding", siddhi: "Forgiveness", theme: "A Universal Panacea", codon: "AAU", amino: "Asn" },
  { key: 5, shadow: "Impatience", gift: "Patience", siddhi: "Timelessness", theme: "The Ending of Time", codon: "ACA", amino: "Thr" },
  { key: 6, shadow: "Conflict", gift: "Diplomacy", siddhi: "Peace", theme: "The Path to Peace", codon: "ACC", amino: "Thr" },
  { key: 7, shadow: "Division", gift: "Guidance", siddhi: "Virtue", theme: "Virtue is its Own Reward", codon: "ACG", amino: "Thr" },
  { key: 8, shadow: "Mediocrity", gift: "Style", siddhi: "Exquisiteness", theme: "Diamond of the Self", codon: "ACU", amino: "Thr" },
  { key: 9, shadow: "Inertia", gift: "Determination", siddhi: "Invincibility", theme: "The Power of the Infinitesimal", codon: "AGA", amino: "Arg" },
  { key: 10, shadow: "Self-Obsession", gift: "Naturalness", siddhi: "Being", theme: "Being at Ease", codon: "AGC", amino: "Ser" },
  { key: 11, shadow: "Obscurity", gift: "Idealism", siddhi: "Light", theme: "The Light of Eden", codon: "AGG", amino: "Arg" },
  { key: 12, shadow: "Vanity", gift: "Discrimination", siddhi: "Purity", theme: "A Pure Heart", codon: "AGU", amino: "Ser" },
  { key: 13, shadow: "Discord", gift: "Discernment", siddhi: "Empathy", theme: "Listening Through Love", codon: "AUA", amino: "Ile" },
  { key: 14, shadow: "Compromise", gift: "Competence", siddhi: "Bounteousness", theme: "Radiating Prosperity", codon: "AUC", amino: "Ile" },
  { key: 15, shadow: "Dullness", gift: "Magnetism", siddhi: "Florescence", theme: "An Eternally Flowering Spring", codon: "AUG", amino: "Met" },
  { key: 16, shadow: "Indifference", gift: "Versatility", siddhi: "Mastery", theme: "Magical Genius", codon: "AUU", amino: "Ile" },
  { key: 17, shadow: "Opinion", gift: "Far-Sightedness", siddhi: "Omniscience", theme: "The Eye", codon: "CAA", amino: "Gln" },
  { key: 18, shadow: "Judgement", gift: "Integrity", siddhi: "Perfection", theme: "The Healing Power of Mind", codon: "CAC", amino: "His" },
  { key: 19, shadow: "Co-Dependence", gift: "Sensitivity", siddhi: "Sacrifice", theme: "The Future Human Being", codon: "CAG", amino: "Gln" },
  { key: 20, shadow: "Superficiality", gift: "Self-Assurance", siddhi: "Presence", theme: "The Sacred Om", codon: "CAU", amino: "His" },
  { key: 21, shadow: "Control", gift: "Authority", siddhi: "Valour", theme: "A Noble Life", codon: "CCA", amino: "Pro" },
  { key: 22, shadow: "Dishonour", gift: "Graciousness", siddhi: "Grace", theme: "Grace Under Pressure", codon: "CCC", amino: "Pro" },
  { key: 23, shadow: "Complexity", gift: "Simplicity", siddhi: "Quintessence", theme: "The Alchemy of Simplicity", codon: "CCG", amino: "Pro" },
  { key: 24, shadow: "Addiction", gift: "Invention", siddhi: "Silence", theme: "The Ultimate Addiction", codon: "CCU", amino: "Pro" },
  { key: 25, shadow: "Constriction", gift: "Acceptance", siddhi: "Universal Love", theme: "The Myth of the Sacred Wound", codon: "CGA", amino: "Arg" },
  { key: 26, shadow: "Pride", gift: "Artfulness", siddhi: "Invisibility", theme: "Sacred Tricksters", codon: "CGC", amino: "Arg" },
  { key: 27, shadow: "Selfishness", gift: "Altruism", siddhi: "Selflessness", theme: "Food of the Gods", codon: "CGG", amino: "Arg" },
  { key: 28, shadow: "Purposelessness", gift: "Totality", siddhi: "Immortality", theme: "Embracing the Dark Side", codon: "CGU", amino: "Arg" },
  { key: 29, shadow: "Half-Heartedness", gift: "Commitment", siddhi: "Devotion", theme: "Leaping into the Void", codon: "CUA", amino: "Leu" },
  { key: 30, shadow: "Desire", gift: "Lightness", siddhi: "Rapture", theme: "Celestial Fire", codon: "CUC", amino: "Leu" },
  { key: 31, shadow: "Arrogance", gift: "Leadership", siddhi: "Humility", theme: "Sounding Your Truth", codon: "CUG", amino: "Leu" },
  { key: 32, shadow: "Failure", gift: "Preservation", siddhi: "Veneration", theme: "Ancestral Reverence", codon: "CUU", amino: "Leu" },
  { key: 33, shadow: "Forgetting", gift: "Mindfulness", siddhi: "Revelation", theme: "The Final Revelation", codon: "GAA", amino: "Glu" },
  { key: 34, shadow: "Force", gift: "Strength", siddhi: "Majesty", theme: "The Beauty of the Beast", codon: "GAC", amino: "Asp" },
  { key: 35, shadow: "Hunger", gift: "Adventure", siddhi: "Boundlessness", theme: "Wormholes and Miracles", codon: "GAG", amino: "Glu" },
  { key: 36, shadow: "Turbulence", gift: "Humanity", siddhi: "Compassion", theme: "Becoming Human", codon: "GAU", amino: "Asp" },
  { key: 37, shadow: "Weakness", gift: "Equality", siddhi: "Tenderness", theme: "Family Alchemy", codon: "GCA", amino: "Ala" },
  { key: 38, shadow: "Struggle", gift: "Perseverance", siddhi: "Honour", theme: "The Warrior of Light", codon: "GCC", amino: "Ala" },
  { key: 39, shadow: "Provocation", gift: "Dynamism", siddhi: "Liberation", theme: "The Tension of Transcendence", codon: "GCG", amino: "Ala" },
  { key: 40, shadow: "Exhaustion", gift: "Resolve", siddhi: "Divine Will", theme: "The Will to Surrender", codon: "GCU", amino: "Ala" },
  { key: 41, shadow: "Fantasy", gift: "Anticipation", siddhi: "Emanation", theme: "The Prime Emanation", codon: "GGA", amino: "Gly" },
  { key: 42, shadow: "Expectation", gift: "Detachment", siddhi: "Celebration", theme: "Letting Go of Living and Dying", codon: "GGC", amino: "Gly" },
  { key: 43, shadow: "Deafness", gift: "Insight", siddhi: "Epiphany", theme: "Opening the Mind", codon: "GGG", amino: "Gly" },
  { key: 44, shadow: "Interference", gift: "Teamwork", siddhi: "Synarchy", theme: "Karmic Relationships", codon: "GGU", amino: "Gly" },
  { key: 45, shadow: "Dominance", gift: "Synergy", siddhi: "Communion", theme: "Cosmic Communion", codon: "GUA", amino: "Val" },
  { key: 46, shadow: "Seriousness", gift: "Delight", siddhi: "Ecstasy", theme: "A Science of Luck", codon: "GUC", amino: "Val" },
  { key: 47, shadow: "Oppression", gift: "Transmutation", siddhi: "Transfiguration", theme: "Transmuting the Past", codon: "GUG", amino: "Val" },
  { key: 48, shadow: "Inadequacy", gift: "Resourcefulness", siddhi: "Wisdom", theme: "The Wonder of Uncertainty", codon: "GUU", amino: "Val" },
  { key: 49, shadow: "Reaction", gift: "Revolution", siddhi: "Rebirth", theme: "Changing the World from the Inside", codon: "UAA", amino: "Stop" },
  { key: 50, shadow: "Corruption", gift: "Equilibrium", siddhi: "Harmony", theme: "Cosmic Order", codon: "UAC", amino: "Tyr" },
  { key: 51, shadow: "Agitation", gift: "Initiative", siddhi: "Awakening", theme: "Initiative to Awakening", codon: "UAG", amino: "Stop" },
  { key: 52, shadow: "Stress", gift: "Restraint", siddhi: "Stillness", theme: "The Stillpoint", codon: "UAU", amino: "Tyr" },
  { key: 53, shadow: "Immaturity", gift: "Expansion", siddhi: "Superabundance", theme: "Evolving Beyond Greed", codon: "UCA", amino: "Ser" },
  { key: 54, shadow: "Greed", gift: "Aspiration", siddhi: "Ascension", theme: "The Serpent's Path", codon: "UCC", amino: "Ser" },
  { key: 55, shadow: "Victimisation", gift: "Freedom", siddhi: "Freedom", theme: "The Dragonfly's Dream", codon: "UCG", amino: "Ser" },
  { key: 56, shadow: "Distraction", gift: "Enrichment", siddhi: "Intoxication", theme: "Divine Intoxication", codon: "UCU", amino: "Ser" },
  { key: 57, shadow: "Unease", gift: "Intuition", siddhi: "Clarity", theme: "A Gentle Wind", codon: "UGA", amino: "Stop" },
  { key: 58, shadow: "Dissatisfaction", gift: "Vitality", siddhi: "Bliss", theme: "From Stress to Bliss", codon: "UGC", amino: "Cys" },
  { key: 59, shadow: "Dishonesty", gift: "Intimacy", siddhi: "Transparency", theme: "The Dragon in Your Genome", codon: "UGG", amino: "Trp" },
  { key: 60, shadow: "Limitation", gift: "Realism", siddhi: "Justice", theme: "The Cracking of the Vessel", codon: "UGU", amino: "Cys" },
  { key: 61, shadow: "Psychosis", gift: "Inspiration", siddhi: "Sanctity", theme: "The Holy of Holies", codon: "UUA", amino: "Leu" },
  { key: 62, shadow: "Intellect", gift: "Precision", siddhi: "Impeccability", theme: "The Language of Light", codon: "UUC", amino: "Phe" },
  { key: 63, shadow: "Doubt", gift: "Inquiry", siddhi: "Truth", theme: "Reaching the Source", codon: "UUG", amino: "Leu" },
  { key: 64, shadow: "Confusion", gift: "Imagination", siddhi: "Illumination", theme: "The Aurora", codon: "UUU", amino: "Phe" },
];

const SOLAR_WHEEL = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
};

const getSolarPosition = (date) => {
  const day = getDayOfYear(date);
  const adjusted = ((day - 22) + 365) % 365;
  const pos = Math.floor((adjusted * 64) / 365) % 64;
  const frac = (adjusted * 64) / 365 - pos;
  const line = Math.max(1, Math.min(6, Math.floor(frac * 6) + 1));
  return { pos, line };
};

export const calculateHologenicProfile = (birthDate) => {
  const date = new Date(`${birthDate}T12:00:00`);
  const { pos: sunPos, line: sunLine } = getSolarPosition(date);
  const earthPos = (sunPos + 32) % 64;

  const designDate = new Date(date.getTime() - (88 * 24 * 60 * 60 * 1000));
  const { pos: designPos, line: designLine } = getSolarPosition(designDate);
  const designEarthPos = (designPos + 32) % 64;

  return {
    lifesWork: { key: SOLAR_WHEEL[sunPos], line: sunLine, role: "Life's Work", sphere: "Conscious Sun", color: "amber" },
    evolution: { key: SOLAR_WHEEL[earthPos], line: sunLine, role: "Evolution", sphere: "Conscious Earth", color: "emerald" },
    radiance: { key: SOLAR_WHEEL[designPos], line: designLine, role: "Radiance", sphere: "Unconscious Sun", color: "violet" },
    purpose: { key: SOLAR_WHEEL[designEarthPos], line: designLine, role: "Purpose", sphere: "Unconscious Earth", color: "rose" },
    profile: `${sunLine}/${designLine}`,
  };
};

export const SPHERE_DESCRIPTIONS = {
  "Life's Work": "Your vocation and external purpose — the genius you are here to express in the world.",
  Evolution: "The core challenge that drives your growth and evolution throughout life.",
  Radiance: "Your physical vitality and the energy field you radiate. How your body reflects inner alignment.",
  Purpose: "Your core wound and deepest gift — the sacred purpose that emerged through your greatest challenges.",
};

export const PROFILE_LINES = {
  1: { name: "Investigator", desc: "You need a solid foundation of knowledge and security before you can shine." },
  2: { name: "Hermit", desc: "You have natural talents that emerge when you withdraw and then re-engage the world." },
  3: { name: "Martyr", desc: "You learn through trial and error. Your 'mistakes' are your greatest teachings." },
  4: { name: "Opportunist", desc: "You thrive through networks and relationships. Your community is your power base." },
  5: { name: "Heretic", desc: "Others project their hopes onto you. You are here to offer practical solutions." },
  6: { name: "Role Model", desc: "You live in three phases: trial (1-30), withdrawal (30-50), wisdom (50+)." },
};

export const sphereColors = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "bg-amber-500/20" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", badge: "bg-violet-500/20" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", badge: "bg-rose-500/20" },
};

export const KEY_ICONS = { amber: Sun, emerald: Dna, violet: Moon, rose: Heart };

export const stableGeneKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${prefix}-${slug || "item"}`;
};

export const sequenceColors = {
  amber: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-300",
  rose: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-300",
  violet: "from-violet-500/10 to-purple-500/5 border-violet-500/20 text-violet-300",
};

export const sequences = [
  {
    id: "activation",
    name: "Activation Sequence",
    subtitle: "Discovering Your Genius",
    icon: Zap,
    color: "amber",
    description: "The Activation Sequence reveals your four Prime Gifts and the pathway to your genius. It shows you how your higher purpose wants to emerge through your natural gifts.",
    spheres: [
      { name: "Life's Work", desc: "Your vocation and external purpose", position: "Top" },
      { name: "Evolution", desc: "The challenge that accelerates your growth", position: "Right" },
      { name: "Radiance", desc: "Your health and physical vitality", position: "Bottom" },
      { name: "Purpose", desc: "Your core wound and deepest gift", position: "Left" },
    ],
    contemplation: "To activate your genius, contemplate each sphere in sequence. Begin with Life's Work - what gifts want to express through your vocation? Move to Evolution - what challenges keep returning? Radiance shows how your body reflects your inner state. Purpose reveals the wound that, when embraced, becomes your greatest gift.",
  },
  {
    id: "venus",
    name: "Venus Sequence",
    subtitle: "Opening Your Heart",
    icon: Heart,
    color: "rose",
    description: "The Venus Sequence unlocks the pathway of relationships and emotional intelligence. It reveals how your heart opens through connection with others.",
    spheres: [
      { name: "Attraction", desc: "What draws people to you", position: "Top" },
      { name: "IQ (Emotional)", desc: "Your emotional intelligence", position: "Right" },
      { name: "SQ (Spiritual)", desc: "Your spiritual intelligence", position: "Bottom" },
      { name: "Core", desc: "Your deepest vulnerability", position: "Center" },
      { name: "Purpose (Venus)", desc: "Your heart's true calling", position: "Left" },
    ],
    contemplation: "The Venus Sequence is about softening. Begin by contemplating what you're attracted to and what attracts others to you. Move into your emotional patterns, then your spiritual nature. At the Core, you'll find your greatest vulnerability - the place where love can finally enter.",
  },
  {
    id: "pearl",
    name: "Pearl Sequence",
    subtitle: "Attaining Prosperity",
    icon: Crown,
    color: "violet",
    description: "The Pearl Sequence reveals your pathway to prosperity through service. It shows how your gifts can flourish in the world and create abundance.",
    spheres: [
      { name: "Vocation", desc: "Your unique contribution", position: "Top" },
      { name: "Culture", desc: "The communities you serve", position: "Right" },
      { name: "Brand", desc: "Your unique essence", position: "Bottom" },
      { name: "Pearl", desc: "Your ultimate gift to the world", position: "Center" },
    ],
    contemplation: "The Pearl forms when irritation (the shadow) is transformed through acceptance. Your Pearl is your ultimate contribution - the gift that forms through a lifetime of embracing your shadows. Contemplate: What is the unique pearl only you can offer the world?",
  },
];
