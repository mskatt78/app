import { Flower, Heart, HeartHandshake, Sparkles, Star, Users } from "lucide-react";

export const HEART_CATEGORIES = ["all", "self_love", "compassion", "forgiveness", "gratitude", "connection", "healing"];

export const HEART_CATEGORY_ICONS = {
  self_love: Heart,
  compassion: HeartHandshake,
  forgiveness: Flower,
  gratitude: Star,
  connection: Users,
  healing: Sparkles,
};

export const HEART_CATEGORY_COLORS = {
  self_love: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  compassion: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  forgiveness: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  gratitude: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  connection: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  healing: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export const resolveReviewedDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString();
};

export const stableHeartKey = (prefix, value) => {
  const slug = String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${prefix}-${slug || "item"}`;
};
