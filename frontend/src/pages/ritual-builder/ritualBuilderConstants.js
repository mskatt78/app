import { Hand, Leaf, Music, Wind } from "lucide-react";

export const PRACTICE_ICONS = {
  yoga: Leaf,
  breathwork: Wind,
  mantra: Music,
  mudra: Hand,
};

export const EMPTY_RITUAL_FORM = {
  name: "",
  description: "",
  practices: [],
};

export const formatRitualTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getStepContainerClass = (isActive, isComplete) => {
  if (isActive) return "bg-primary/20 border border-primary/30";
  if (isComplete) return "bg-emerald-500/10 border border-emerald-500/20";
  return "bg-card/50 border border-white/10";
};
