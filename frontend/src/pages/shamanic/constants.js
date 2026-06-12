import { Compass, Drum, Eye, Feather, Moon, TreeDeciduous } from "lucide-react";

export const shamanicCategories = ["all", "journey", "power_animal", "ancestral", "divination", "ceremony", "shadow"];

export const categoryIcons = {
  journey: Compass,
  power_animal: Feather,
  ancestral: TreeDeciduous,
  divination: Eye,
  ceremony: Drum,
  shadow: Moon,
};

export const categoryColors = {
  journey: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  power_animal: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ancestral: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  divination: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ceremony: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  shadow: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

export const getDifficultyColor = (difficulty) => {
  if (difficulty === "Beginner") return "text-green-400 bg-green-500/10 border-green-500/20";
  if (difficulty === "Advanced") return "text-red-400 bg-red-500/10 border-red-500/20";
  return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
};

export const stableShamanicKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${prefix}-${slug || "item"}`;
};

export const formatReviewedDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};