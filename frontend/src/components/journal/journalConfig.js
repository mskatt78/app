import {
  BookOpen,
  Moon,
  Cloud,
  Feather,
  Smile,
  Zap,
  Heart,
  Brain,
  Mountain,
} from "lucide-react";

export const JOURNAL_TYPES = [
  { value: "all", label: "All Journals", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
  {
    value: "moon",
    label: "Moon Journal",
    icon: Moon,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description: "Track lunar cycles, set intentions, and reflect on moon energy",
  },
  {
    value: "dream",
    label: "Dream Journal",
    icon: Cloud,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description: "Record dreams, symbols, and messages from the subconscious",
  },
  {
    value: "personal",
    label: "Personal Diary",
    icon: Feather,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Daily reflections, gratitude, and personal insights",
  },
];

export const MOON_PHASES = [
  { value: "new_moon", label: "New Moon 🌑", energy: "New beginnings, setting intentions" },
  { value: "waxing_crescent", label: "Waxing Crescent 🌒", energy: "Building momentum, taking action" },
  { value: "first_quarter", label: "First Quarter 🌓", energy: "Challenges, decisions, commitment" },
  { value: "waxing_gibbous", label: "Waxing Gibbous 🌔", energy: "Refinement, patience, trust" },
  { value: "full_moon", label: "Full Moon 🌕", energy: "Culmination, release, celebration" },
  { value: "waning_gibbous", label: "Waning Gibbous 🌖", energy: "Gratitude, sharing wisdom" },
  { value: "last_quarter", label: "Last Quarter 🌗", energy: "Letting go, forgiveness" },
  { value: "waning_crescent", label: "Waning Crescent 🌘", energy: "Rest, reflection, surrender" },
];

export const MOODS = [
  { value: "peaceful", label: "Peaceful", icon: Smile, color: "text-blue-400" },
  { value: "energized", label: "Energized", icon: Zap, color: "text-orange-400" },
  { value: "grateful", label: "Grateful", icon: Heart, color: "text-pink-400" },
  { value: "reflective", label: "Reflective", icon: Brain, color: "text-purple-400" },
  { value: "challenged", label: "Challenged", icon: Mountain, color: "text-emerald-400" },
];

export const DEFAULT_NEW_ENTRY = {
  title: "",
  content: "",
  mood: "",
  tags: [],
  journal_type: "personal",
  dream_symbols: "",
  moon_phase: "",
  moon_intention: "",
};

export const formatJournalDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const JOURNAL_PROMPTS = [
  "What am I grateful for today?",
  "How did my practice make me feel?",
  "What insights arose during meditation?",
  "What element resonates with me now?",
  "What do I need to release?",
];
