export const CHAKRA_CONFIG = {
  earth_star: { color: "bg-stone-700", border: "border-stone-500/30", text: "text-stone-400", icon: "🌍", sanskrit: "Vasundhara", element: "Earth Core", location: "12 inches below feet", order: 0 },
  root: { color: "bg-red-500", border: "border-red-500/30", text: "text-red-400", icon: "🔴", sanskrit: "Muladhara", element: "Earth", location: "Base of spine", order: 1 },
  sacral: { color: "bg-orange-500", border: "border-orange-500/30", text: "text-orange-400", icon: "🟠", sanskrit: "Svadhisthana", element: "Water", location: "Below navel", order: 2 },
  solar: { color: "bg-yellow-500", border: "border-yellow-500/30", text: "text-yellow-400", icon: "🟡", sanskrit: "Manipura", element: "Fire", location: "Solar plexus", order: 3 },
  heart: { color: "bg-green-500", border: "border-green-500/30", text: "text-green-400", icon: "💚", sanskrit: "Anahata", element: "Air", location: "Heart center", order: 4 },
  higher_heart: { color: "bg-teal-400", border: "border-teal-400/30", text: "text-teal-300", icon: "💎", sanskrit: "Thymus", element: "Higher Air", location: "Between heart & throat", order: 5 },
  throat: { color: "bg-cyan-500", border: "border-cyan-500/30", text: "text-cyan-400", icon: "🔵", sanskrit: "Vishuddha", element: "Ether", location: "Throat", order: 6 },
  third_eye: { color: "bg-indigo-500", border: "border-indigo-500/30", text: "text-indigo-400", icon: "💜", sanskrit: "Ajna", element: "Light", location: "Between brows", order: 7 },
  crown: { color: "bg-violet-500", border: "border-violet-500/30", text: "text-violet-400", icon: "👑", sanskrit: "Sahasrara", element: "Cosmic", location: "Crown of head", order: 8 },
  causal: { color: "bg-pink-300", border: "border-pink-300/30", text: "text-pink-200", icon: "🌸", sanskrit: "Causal", element: "Divine Feminine", location: "Back of head", order: 9 },
  soul_star: { color: "bg-white", border: "border-white/30", text: "text-white", icon: "⭐", sanskrit: "Sutara", element: "Soul Light", location: "6 inches above crown", order: 10 },
  stellar: { color: "bg-amber-200", border: "border-amber-200/30", text: "text-amber-100", icon: "✨", sanskrit: "Stellar Gateway", element: "Galactic", location: "12 inches above crown", order: 11 },
  universal: { color: "bg-gradient-to-r from-violet-400 to-amber-300", border: "border-amber-300/30", text: "text-amber-200", icon: "🌌", sanskrit: "Universal Gateway", element: "Source", location: "18 inches above crown", order: 12 },
};

export const stableChakraKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return `${prefix}-${slug || "item"}`;
};

export const normalizeNarrationText = (content) => {
  if (content == null) return "";
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.join(". ").trim();
  return String(content).trim();
};

export const getChakraConfig = (chakra) => {
  const key = Object.keys(CHAKRA_CONFIG).find((chakraKey) => chakra?.toLowerCase().includes(chakraKey));
  return CHAKRA_CONFIG[key] || CHAKRA_CONFIG.heart;
};

export const getFilterButtonClassName = (filterChakra, chakra, config) => {
  if (filterChakra !== chakra) {
    return "bg-white/5 text-muted-foreground hover:bg-white/10";
  }
  if (config) {
    return `${config.color}/20 ${config.text} border ${config.border}`;
  }
  return "bg-violet-500/20 text-violet-300 border border-violet-500/40";
};