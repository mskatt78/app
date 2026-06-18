export const PRACTICE_JOURNAL_STORAGE_KEY = "shamanic_journal_entries";

export const MOODS = [
  { emoji: "😔", label: "Heavy", value: 1 },
  { emoji: "😐", label: "Neutral", value: 2 },
  { emoji: "🙂", label: "Calm", value: 3 },
  { emoji: "😊", label: "Peaceful", value: 4 },
  { emoji: "✨", label: "Radiant", value: 5 },
];

export const JOURNAL_PROMPTS = [
  "What sensations arose in your body during this practice?",
  "What emotions moved through you?",
  "Did any insights or messages come to you?",
  "What are you ready to release?",
  "What are you calling in?",
  "How does your body feel different now?",
  "What surprised you about this practice?",
  "What do you want to remember from this experience?",
  "What intention will you carry forward?",
  "What is your body telling you right now?",
];

export const PRACTICE_FILTERS = [
  "all",
  "chakra",
  "feminine",
  "masculine",
  "energy",
  "somatic",
  "movement",
];

export const PRACTICE_COLORS = {
  chakra: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  feminine: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/30" },
  masculine: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  energy: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
  somatic: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  movement: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  default: { bg: "bg-white/10", text: "text-white", border: "border-white/20" },
};

export const createInitialJournalFormData = () => ({
  practice_name: "",
  practice_type: "chakra",
  mood_before: 3,
  mood_after: 4,
  duration_minutes: 15,
  body_sensations: "",
  spiritual_downloads: "",
  intentions: "",
  key_insights: "",
  reflection: "",
  voice_note_data_url: "",
  voice_note_duration_seconds: 0,
  voice_note_mime_type: "",
});

export const getMoonPhase = (date = new Date()) => {
  const knownNewMoon = new Date(2024, 0, 11);
  const daysSince = Math.floor((date - knownNewMoon) / (1000 * 60 * 60 * 24));
  const moonAge = daysSince % 29.5;

  if (moonAge < 1.85) return { phase: "New Moon", emoji: "🌑", energy: "Introspective" };
  if (moonAge < 7.38) return { phase: "Waxing Crescent", emoji: "🌒", energy: "Building" };
  if (moonAge < 9.23) return { phase: "First Quarter", emoji: "🌓", energy: "Active" };
  if (moonAge < 14.77) return { phase: "Waxing Gibbous", emoji: "🌔", energy: "Refining" };
  if (moonAge < 16.61) return { phase: "Full Moon", emoji: "🌕", energy: "Peak" };
  if (moonAge < 22.15) return { phase: "Waning Gibbous", emoji: "🌖", energy: "Distributing" };
  if (moonAge < 23.99) return { phase: "Last Quarter", emoji: "🌗", energy: "Releasing" };
  return { phase: "Waning Crescent", emoji: "🌘", energy: "Surrendering" };
};

export const getStreakMilestone = (streak) => {
  if (streak >= 40) return { label: "Sacred 40", color: "text-yellow-400", icon: "✦" };
  if (streak >= 21) return { label: "21-Day Initiation", color: "text-amber-400", icon: "✦" };
  if (streak >= 14) return { label: "Fortnight Keeper", color: "text-orange-400", icon: "✦" };
  if (streak >= 7) return { label: "7-Day Guardian", color: "text-emerald-400", icon: "✦" };
  if (streak >= 3) return { label: "3-Day Seeker", color: "text-teal-400", icon: "✦" };
  return null;
};

export const getPracticeColors = (type) => PRACTICE_COLORS[type] || PRACTICE_COLORS.default;

export const getMoodByValue = (value) => MOODS.find((mood) => mood.value === value) || null;

export const getRandomPrompt = () => JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
