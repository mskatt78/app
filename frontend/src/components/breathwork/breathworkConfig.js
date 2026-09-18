export const BREATHWORK_SOUND_OPTIONS = [
  { id: "silence", label: "Quiet Practice" },
  { id: "ocean", label: "Ocean Waves · Real Recording" },
  { id: "rain", label: "Gentle Rain · Real Recording" },
  { id: "birds", label: "Birdsong · Real Recording" },
  { id: "whale", label: "Whale Song · Real Recording" },
  { id: "dolphin", label: "Dolphin Song · Real Recording" },
  { id: "drums_gentle", label: "Shamanic Drum · Real Recording" },
];

export const ELEMENT_DEFAULT_SOUNDS = {
  Earth: "birds",
  Water: "ocean",
  Fire: "silence",
  Air: "silence",
  Spirit: "rain",
};

export const BREATHWORK_ELEMENTS = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

export const ELEMENT_COLORS = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

export const PHASE_LABELS = {
  inhale: "Breathe In",
  hold: "Hold",
  exhale: "Breathe Out",
  hold_empty: "Hold Empty",
};
