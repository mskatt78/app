import {
  Atom,
  Droplets,
  Feather,
  Flame,
  Gem,
  Globe,
  Mountain,
  Sparkles,
  Sun,
} from "lucide-react";

export const TRADITIONS = [
  { id: "all", label: "All Traditions", icon: Globe, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "egyptian", label: "Egyptian", icon: Sun, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: "avalon", label: "Avalon", icon: Sparkles, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "aboriginal", label: "Aboriginal", icon: Mountain, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "celtic", label: "Celtic", icon: Feather, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "peruvian", label: "Peruvian", icon: Flame, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  { id: "international", label: "International", icon: Globe, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { id: "lemurian", label: "Lemurian/Mu", icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { id: "atlantean", label: "Atlantean", icon: Gem, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "galactic", label: "Galactic", icon: Atom, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
];

export const TRADITION_MAP = {
  egyptian: { label: "Egyptian Alchemy", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: Sun },
  avalon: { label: "Avalon Mysteries", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: Sparkles },
  aboriginal: { label: "Aboriginal Wisdom", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: Mountain },
  celtic: { label: "Celtic Alchemy", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Feather },
  peruvian: { label: "Peruvian Alchemy", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", icon: Flame },
  international: { label: "International Wisdom", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", icon: Globe },
  lemurian: { label: "Lemurian / Mu", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: Droplets },
  atlantean: { label: "Atlantean Alchemy", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Gem },
  galactic: { label: "Galactic Energies", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: Atom },
};

export const formatReviewedDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};