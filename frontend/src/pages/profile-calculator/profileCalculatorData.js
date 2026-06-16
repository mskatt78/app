// Gene Keys Gate Mapping (simplified - maps solar longitude to gates)
// The 64 gates are distributed around the zodiac wheel
export const GATE_SEQUENCE = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

// Gene Keys Data (Shadow/Gift/Siddhi)
export const GENE_KEYS_DATA = {
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
export const HUMAN_DESIGN_TYPES = {
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

export const PROFILE_LINE_NAMES = {
  1: "Investigator",
  2: "Hermit",
  3: "Martyr",
  4: "Opportunist",
  5: "Heretic",
  6: "Role Model",
};

// Calculate solar longitude from date
export const calculateSolarLongitude = (date) => {
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
export const getGateFromLongitude = (longitude) => {
  const gateSize = 360 / 64;
  const gateIndex = Math.floor(longitude / gateSize);
  return GATE_SEQUENCE[gateIndex % 64];
};

// Get line from longitude (1-6)
export const getLineFromLongitude = (longitude) => {
  const gateSize = 360 / 64;
  const positionInGate = longitude % gateSize;
  const lineSize = gateSize / 6;
  return Math.floor(positionInGate / lineSize) + 1;
};

// Calculate Gene Keys profile
export const calculateGeneKeysProfile = (birthDate) => {
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
