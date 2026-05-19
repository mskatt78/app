import { Droplets, Flame, Mountain, Sparkles, Star, Wind } from "lucide-react";

export const stableElementPracticeKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return `${prefix}-${slug || "item"}`;
};

export const elementIcons = {
  Earth: Mountain,
  Water: Droplets,
  Fire: Flame,
  Air: Wind,
  Spirit: Sparkles,
  All: Star,
};

export const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  All: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

export const difficultyColors = {
  Beginner: "text-emerald-400 bg-emerald-500/10",
  Intermediate: "text-amber-400 bg-amber-500/10",
  Advanced: "text-red-400 bg-red-500/10",
};

export const elementalFilters = ["all", "Earth", "Water", "Fire", "Air", "Spirit", "All"];
