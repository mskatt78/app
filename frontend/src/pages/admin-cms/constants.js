import {
  CreditCard,
  Feather,
  Flame,
  MapPin,
  Mountain,
  Palette,
  Radio,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";

export const TAB_ICONS = {
  yoga: Sparkles,
  mudras: Sparkles,
  breathwork: Wind,
  crystals: Mountain,
  mantras: Sparkles,
  "earth-altars": Mountain,
  "elemental-practices": Zap,
  "heart-practices": Flame,
  "creative-processes": Palette,
  "shamanic-practices": Feather,
  retreats: MapPin,
  books: Sparkles,
  "custom-oracle-cards": CreditCard,
  "live-sessions": Radio,
  "preset-rituals": Sparkles,
};

export const EXCLUDED_TABS = new Set(["workshops", "events", "courses"]);

export const getElementColor = (element) =>
  ({
    Earth: "bg-emerald-500/20 text-emerald-400",
    Water: "bg-blue-500/20 text-blue-400",
    Fire: "bg-orange-500/20 text-orange-400",
    Air: "bg-cyan-500/20 text-cyan-400",
    Spirit: "bg-purple-500/20 text-purple-400",
  }[element] || "bg-white/10");