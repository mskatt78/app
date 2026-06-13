export const PRACTICE_AREAS = [
  "Yoga",
  "Meditation",
  "Breathwork",
  "Oracle Readings",
  "Rune Readings",
  "I Ching",
  "Crystals",
  "Shamanic Practices",
  "Light Codes",
  "Somatic Movement",
  "Gene Keys",
  "Human Design",
  "Water Practices",
  "Rose Temple",
  "Elemental Temples",
];

const AVATAR_COLORS = [
  "bg-rose-500/30 text-rose-300 border-rose-500/30",
  "bg-violet-500/30 text-violet-300 border-violet-500/30",
  "bg-amber-500/30 text-amber-300 border-amber-500/30",
  "bg-teal-500/30 text-teal-300 border-teal-500/30",
  "bg-blue-500/30 text-blue-300 border-blue-500/30",
  "bg-emerald-500/30 text-emerald-300 border-emerald-500/30",
  "bg-pink-500/30 text-pink-300 border-pink-500/30",
  "bg-indigo-500/30 text-indigo-300 border-indigo-500/30",
];

export const getAvatarColor = (name = "") => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

export const formatReviewDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

export const renderStarsText = (rating) => "★".repeat(rating) + "☆".repeat(5 - rating);
