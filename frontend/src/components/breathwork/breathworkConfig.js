import { AMBIENT_SOUNDS } from "../AmbientSoundPlayer";

export const BREATHWORK_SOUND_OPTIONS = [
  { id: "tone", label: "Healing Frequency Tone" },
  { id: "ocean", label: AMBIENT_SOUNDS.ocean.name },
  { id: "rain", label: AMBIENT_SOUNDS.rain.name },
  { id: "nature", label: AMBIENT_SOUNDS.nature.name },
  { id: "whale", label: AMBIENT_SOUNDS.whale.name },
  { id: "dolphin", label: AMBIENT_SOUNDS.dolphin.name },
  { id: "wind", label: AMBIENT_SOUNDS.wind.name },
  { id: "fire", label: AMBIENT_SOUNDS.fire.name },
  { id: "chimes", label: AMBIENT_SOUNDS.chimes.name },
  { id: "drums_gentle", label: AMBIENT_SOUNDS.drums_gentle.name },
  { id: "silence", label: "Silence" },
];

export const ELEMENT_DEFAULT_SOUNDS = {
  Earth: "nature",
  Water: "ocean",
  Fire: "fire",
  Air: "wind",
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
