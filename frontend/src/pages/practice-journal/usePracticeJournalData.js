import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { migrateLocalToSession, setSessionItem } from "../../utils/clientStorage";
import { appLogger } from "../../utils/logger";
import {
  MOODS,
  PRACTICE_JOURNAL_STORAGE_KEY,
  createInitialJournalFormData,
  getMoonPhase,
  getRandomPrompt,
  getStreakMilestone,
} from "./constants";

const getStoredEntries = () => {
  try {
    const stored = migrateLocalToSession(PRACTICE_JOURNAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEntriesToStorage = (entries) => {
  setSessionItem(PRACTICE_JOURNAL_STORAGE_KEY, JSON.stringify(entries));
};

const calculateStreak = (entries) => {
  if (!entries.length) return 0;

  const sortedDates = [...new Set(entries.map((entry) => new Date(entry.created_at).toDateString()))]
    .sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  for (const dateString of sortedDates) {
    const entryDate = new Date(dateString);
    entryDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((checkDate - entryDate) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streak += 1;
      checkDate = entryDate;
      continue;
    }

    break;
  }

  return streak;
};

const WEEKDAY_SEQUENCE = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WEEKLY_REFLECTION_STOP_WORDS = new Set([
  "about", "after", "again", "also", "always", "around", "because", "being", "between", "could",
  "during", "every", "first", "focus", "from", "have", "into", "journey", "more", "need", "notes",
  "over", "practice", "really", "still", "that", "their", "there", "these", "this", "through", "today",
  "toward", "very", "what", "when", "where", "which", "with", "within", "would", "your", "feel", "felt",
  "body", "heart", "sacred", "energy", "healing",
]);

const normalizeDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const tokenizeWeeklyText = (...values) => {
  const joined = values
    .filter(Boolean)
    .map((value) => String(value))
    .join(" ")
    .toLowerCase();
  const tokens = joined.match(/[a-zA-Z']+/g) || [];
  return tokens.filter((token) => token.length >= 4 && !WEEKLY_REFLECTION_STOP_WORDS.has(token));
};

const buildWeeklyPlanFocus = (topType, keyThemes) => {
  const normalizedType = topType || "practice";
  const primaryTheme = keyThemes[0] || "integration";
  const secondaryTheme = keyThemes[1] || "regulation";

  const focuses = [
    `Regulate through ${normalizedType} rhythm`,
    `Deepen ${primaryTheme}`,
    "Anchor embodied boundaries",
    `Refine ${secondaryTheme}`,
    "Nourish recovery and hydration",
    "Expand devotional joy",
    "Integrate insights into aligned action",
  ];
  const practices = [
    `12-minute ${normalizedType} reset with long exhale pacing.`,
    "Journal one body sensation and one emotional shift before and after practice.",
    "Close one open loop with compassionate honesty and clear boundary language.",
    "Apply one recurring insight in a concrete real-life moment.",
    "Gentle movement + breath with low stimulation and deep replenishment.",
    "Celebrate one visible change in mood, presence, or relationships.",
    "Weekly review + choose one non-negotiable ritual anchor for next week.",
  ];
  const prompts = [
    "Where did my breath become medicine today?",
    `How did ${primaryTheme} shift my nervous system state?`,
    "What boundary honored both tenderness and truth?",
    `What did ${secondaryTheme} teach me about sustainable growth?`,
    "What did rest reveal that effort could not?",
    "What am I now ready to receive with less resistance?",
    "Which one ritual keeps this alchemy embodied next week?",
  ];

  return WEEKDAY_SEQUENCE.map((day, index) => ({
    day,
    focus: focuses[index],
    practice: practices[index],
    journal_prompt: prompts[index],
  }));
};

const buildWeeklyReflectionFromEntries = (entries, days = 7) => {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - Math.max(1, days));

  const inWindow = entries.filter((entry) => {
    const date = normalizeDate(entry.created_at);
    return date && date >= cutoff;
  });
  const sourceEntries = inWindow.length > 0 ? inWindow : entries.slice(0, 40);

  if (!sourceEntries.length) {
    return {
      period_start: cutoff.toISOString().slice(0, 10),
      period_end: now.toISOString().slice(0, 10),
      days_considered: days,
      entries_analyzed: 0,
      total_minutes: 0,
      average_mood_shift: 0,
      top_practice_types: [],
      key_themes: ["consistency", "grounding", "integration"],
      energetic_summary: "No entries yet this week. Begin with one short daily check-in and observe your mood shift before and after practice.",
      alchemy_focus: "Consistency over intensity",
      integration_vow: "I commit to one daily ritual pulse, even if brief, and track its real effect on body and mood.",
      weekly_alchemy_plan: buildWeeklyPlanFocus("practice", ["consistency", "grounding"]),
      source: "local",
      generated_at: new Date().toISOString(),
    };
  }

  const parsedDates = sourceEntries.map((entry) => normalizeDate(entry.created_at)).filter(Boolean);
  const sortedDates = parsedDates.sort((a, b) => a - b);
  const periodStart = sortedDates[0]?.toISOString().slice(0, 10) || cutoff.toISOString().slice(0, 10);
  const periodEnd = sortedDates[sortedDates.length - 1]?.toISOString().slice(0, 10) || now.toISOString().slice(0, 10);

  const totalMinutes = sourceEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry.duration_minutes) || 0), 0);
  const moodShiftValues = sourceEntries.map((entry) => (Number(entry.mood_after) || 0) - (Number(entry.mood_before) || 0));
  const averageMoodShift = moodShiftValues.length
    ? Number((moodShiftValues.reduce((sum, value) => sum + value, 0) / moodShiftValues.length).toFixed(2))
    : 0;

  const practiceCounts = {};
  sourceEntries.forEach((entry) => {
    const type = String(entry.practice_type || "other").toLowerCase();
    practiceCounts[type] = (practiceCounts[type] || 0) + 1;
  });
  const topPracticeTypes = Object.entries(practiceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));

  const tokenCounts = {};
  sourceEntries.forEach((entry) => {
    tokenizeWeeklyText(
      entry.reflection,
      entry.key_insights,
      entry.spiritual_downloads,
      entry.intentions,
      entry.body_sensations,
    ).forEach((token) => {
      tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    });
  });

  const keyThemes = Object.entries(tokenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token]) => token.replaceAll("_", " "));

  const dominantPracticeType = (topPracticeTypes[0]?.type || "practice").replaceAll("_", " ");
  const dominantTheme = keyThemes[0] || "integration";

  return {
    period_start: periodStart,
    period_end: periodEnd,
    days_considered: days,
    entries_analyzed: sourceEntries.length,
    total_minutes: totalMinutes,
    average_mood_shift: averageMoodShift,
    top_practice_types: topPracticeTypes,
    key_themes: keyThemes.length ? keyThemes : ["integration", "regulation", "clarity"],
    energetic_summary: `This week you logged ${sourceEntries.length} entries and ${totalMinutes} practice minutes. Your strongest current is ${dominantPracticeType}, with an average mood shift of ${averageMoodShift >= 0 ? "+" : ""}${averageMoodShift.toFixed(2)}.`,
    alchemy_focus: `Stabilize ${dominantTheme} through ${dominantPracticeType}`,
    integration_vow: `I honor this week's alchemy by practicing ${dominantPracticeType} with steady pacing, integrating ${dominantTheme}, and completing one grounded action each day.`,
    weekly_alchemy_plan: buildWeeklyPlanFocus(dominantPracticeType, keyThemes),
    source: "local",
    generated_at: new Date().toISOString(),
  };
};

const normalizeEntryFromApi = (entry) => ({
  ...entry,
  id: entry.id || entry.entry_id,
  voice_note_file_id: entry.voice_note_file_id || "",
  voice_note_duration_seconds: Number(entry.voice_note_duration_seconds || 0),
  voice_note_mime_type: entry.voice_note_mime_type || "",
  voice_note_url: entry.voice_note_url || "",
  voice_note_data_url: "",
});

const hydrateVoiceBlobUrl = async (api, entry) => {
  if (!entry.voice_note_url) {
    return entry;
  }

  try {
    const response = await api.get(entry.voice_note_url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(response.data);
    return {
      ...entry,
      voice_note_data_url: blobUrl,
    };
  } catch (error) {
    appLogger.warn("Voice note blob hydration failed", error);
    return entry;
  }
};

const revokeVoiceBlobUrls = (entries) => {
  entries.forEach((entry) => {
    if (entry?.voice_note_data_url?.startsWith?.("blob:")) {
      try {
        URL.revokeObjectURL(entry.voice_note_data_url);
      } catch (error) {
        appLogger.warn("Voice note blob URL revoke warning", error);
      }
    }
  });
};

const buildEntryPayloadForApi = (entry) => ({
  entry_id: entry.id,
  practice_name: entry.practice_name,
  practice_type: entry.practice_type,
  mood_before: Number(entry.mood_before || 3),
  mood_after: Number(entry.mood_after || 4),
  duration_minutes: Number(entry.duration_minutes || 0),
  body_sensations: entry.body_sensations || "",
  spiritual_downloads: entry.spiritual_downloads || "",
  intentions: entry.intentions || "",
  key_insights: entry.key_insights || "",
  reflection: entry.reflection || "",
  moon_phase: entry.moon_phase || "",
  moon_emoji: entry.moon_emoji || "",
  voice_note_file_id: entry.voice_note_file_id || null,
});

export const usePracticeJournalData = ({ api, navigate, user }) => {
  const [entries, setEntries] = useState(() => getStoredEntries());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(() => getRandomPrompt());
  const [sharingId, setSharingId] = useState(null);
  const [showWeeklyReflection, setShowWeeklyReflection] = useState(false);
  const [weeklyReflection, setWeeklyReflection] = useState(null);
  const [weeklyReflectionLoading, setWeeklyReflectionLoading] = useState(false);
  const [weeklyReflectionError, setWeeklyReflectionError] = useState("");
  const [formData, setFormData] = useState(createInitialJournalFormData());

  const isAuthenticated = Boolean(user?.user_id && api);

  useEffect(() => {
    let cancelled = false;
    const loadRemoteEntries = async () => {
      if (!isAuthenticated) {
        return;
      }

      try {
        const response = await api.get("/practice-journal");
        const normalized = Array.isArray(response.data)
          ? response.data.map(normalizeEntryFromApi)
          : [];

        const hydratedEntries = await Promise.all(normalized.map((entry) => hydrateVoiceBlobUrl(api, entry)));
        if (!cancelled) {
          setEntries((previous) => {
            revokeVoiceBlobUrls(previous);
            return hydratedEntries;
          });
          saveEntriesToStorage(hydratedEntries);
        }
      } catch (error) {
        if (!cancelled) {
          appLogger.warn("Remote practice journal sync failed", error);
        }
      }
    };

    loadRemoteEntries();

    return () => {
      cancelled = true;
    };
  }, [api, isAuthenticated]);

  useEffect(() => () => {
    revokeVoiceBlobUrls(entries);
  }, [entries]);

  const resetForm = useCallback(() => {
    setFormData(createInitialJournalFormData());
    setShowForm(false);
    setEditingEntry(null);
    setCurrentPrompt(getRandomPrompt());
  }, []);

  const uploadVoiceDataUrlIfNeeded = useCallback(async (rawDataUrl, durationSeconds) => {
    if (!rawDataUrl || !rawDataUrl.startsWith("data:")) {
      return null;
    }

    const response = await api.post("/voice-files/from-data-url", {
      data_url: rawDataUrl,
      duration_seconds: Number(durationSeconds || 0),
      category: "journal_voice_note",
    });
    return response?.data?.file_id || null;
  }, [api]);

  const handleSubmit = useCallback(async () => {
    if (!formData.practice_name.trim()) {
      toast.error("Please enter a practice name");
      return;
    }

    const moon = getMoonPhase();
    const entry = {
      id: editingEntry?.id || `journal_${Date.now()}`,
      ...formData,
      moon_phase: moon.phase,
      moon_emoji: moon.emoji,
      created_at: editingEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isAuthenticated) {
      try {
        let voiceNoteFileId = entry.voice_note_file_id || null;
        if (entry.voice_note_data_url && !voiceNoteFileId) {
          voiceNoteFileId = await uploadVoiceDataUrlIfNeeded(entry.voice_note_data_url, entry.voice_note_duration_seconds);
        }

        const payload = buildEntryPayloadForApi({
          ...entry,
          voice_note_file_id: voiceNoteFileId,
        });

        let saved;
        if (editingEntry?.id) {
          const response = await api.put(`/practice-journal/${editingEntry.id}`, payload);
          saved = normalizeEntryFromApi(response.data);
        } else {
          const response = await api.post("/practice-journal", payload);
          saved = normalizeEntryFromApi(response.data);
        }

        const hydratedSaved = await hydrateVoiceBlobUrl(api, saved);
        setEntries((previous) => {
          const next = editingEntry
            ? previous.map((existingEntry) => (existingEntry.id === editingEntry.id ? hydratedSaved : existingEntry))
            : [hydratedSaved, ...previous];
          saveEntriesToStorage(next);
          return next;
        });
        toast.success(editingEntry ? "Journal entry updated" : "Journal entry saved");
        resetForm();
        return;
      } catch (error) {
        appLogger.error("Remote journal save failed", error);
        toast.error("Could not save entry to your account");
        return;
      }
    }

    let nextEntries = [];
    if (editingEntry) {
      nextEntries = entries.map((existingEntry) => (existingEntry.id === editingEntry.id ? entry : existingEntry));
      toast.success("Journal entry updated");
    } else {
      nextEntries = [entry, ...entries];
      toast.success("Journal entry saved");
    }

    setEntries(nextEntries);
    saveEntriesToStorage(nextEntries);
    resetForm();
  }, [api, editingEntry, entries, formData, isAuthenticated, resetForm, uploadVoiceDataUrlIfNeeded]);

  const handleDelete = useCallback(async (id) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/practice-journal/${id}`);
      } catch (error) {
        appLogger.error("Remote journal delete failed", error);
        toast.error("Could not delete entry");
        return;
      }
    }

    const nextEntries = entries.filter((entry) => entry.id !== id);
    setEntries(nextEntries);
    saveEntriesToStorage(nextEntries);
    toast.success("Entry deleted");
  }, [api, entries, isAuthenticated]);

  const startEdit = useCallback((entry) => {
    setFormData({
      practice_name: entry.practice_name,
      practice_type: entry.practice_type,
      mood_before: entry.mood_before,
      mood_after: entry.mood_after,
      duration_minutes: entry.duration_minutes,
      body_sensations: entry.body_sensations || "",
      spiritual_downloads: entry.spiritual_downloads || "",
      intentions: entry.intentions || "",
      key_insights: entry.key_insights || "",
      reflection: entry.reflection || "",
      voice_note_file_id: entry.voice_note_file_id || "",
      voice_note_data_url: entry.voice_note_data_url || "",
      voice_note_duration_seconds: Number(entry.voice_note_duration_seconds || 0),
      voice_note_mime_type: entry.voice_note_mime_type || "",
      voice_note_url: entry.voice_note_url || "",
    });
    setEditingEntry(entry);
    setShowForm(true);
  }, []);

  const handleShareToCommunity = useCallback(async (entry) => {
    if (!api) {
      toast.error("Please log in to share to the community");
      return;
    }

    if (!entry.reflection && !entry.spiritual_downloads && !entry.key_insights) {
      toast.error("Add a reflection first before sharing to community");
      return;
    }

    setSharingId(entry.id);
    try {
      const content = [
        entry.reflection && `**Reflection:** ${entry.reflection}`,
        entry.spiritual_downloads && `**Spiritual Downloads:** ${entry.spiritual_downloads}`,
        entry.key_insights && `**Key Insights:** ${entry.key_insights}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const author = user?.name || user?.email || "Sacred Traveller";
      const sharedMoodLabel = MOODS.find((mood) => mood.value === entry.mood_after)?.label || "";

      await api.post("/community/posts", {
        title: `${entry.practice_name} — Journey Reflection`,
        content,
        author,
        type: "reflection",
        practice_type: entry.practice_type,
        moon_phase: entry.moon_phase,
        mood: sharedMoodLabel,
      });

      toast.success("Reflection shared to Sacred Circle!", {
        action: { label: "View Community", onClick: () => navigate("/community") },
      });
    } catch (error) {
      appLogger.error("Share failed:", error);
      toast.error("Could not share to community");
    } finally {
      setSharingId(null);
    }
  }, [api, navigate, user?.email, user?.name]);

  const generateWeeklyReflection = useCallback(async ({ force = false } = {}) => {
    if (!force && weeklyReflection) {
      setShowWeeklyReflection(true);
      return;
    }

    setWeeklyReflectionLoading(true);
    setWeeklyReflectionError("");
    try {
      if (isAuthenticated && api) {
        const response = await api.get("/practice-journal/weekly-reflection", {
          params: { days: 7 },
        });
        setWeeklyReflection(response?.data || null);
      } else {
        setWeeklyReflection(buildWeeklyReflectionFromEntries(entries, 7));
      }
    } catch (error) {
      appLogger.warn("Weekly reflection API failed, using local synthesis", error);
      setWeeklyReflectionError("Live weekly synthesis unavailable. Showing local reflection snapshot.");
      setWeeklyReflection(buildWeeklyReflectionFromEntries(entries, 7));
    } finally {
      setWeeklyReflectionLoading(false);
      setShowWeeklyReflection(true);
    }
  }, [api, entries, isAuthenticated, weeklyReflection]);

  const openWeeklyReflection = useCallback(() => {
    generateWeeklyReflection();
  }, [generateWeeklyReflection]);

  const closeWeeklyReflection = useCallback(() => {
    setShowWeeklyReflection(false);
  }, []);

  const filteredEntries = useMemo(() => entries.filter((entry) => {
    let matchesType = false;
    if (filterType === "all") {
      matchesType = true;
    } else if (entry.practice_type === filterType) {
      matchesType = true;
    }

    if (!searchTerm) {
      return matchesType;
    }

    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearchTerm = entry.practice_name.toLowerCase().includes(normalizedSearch)
      || entry.reflection?.toLowerCase().includes(normalizedSearch);

    return matchesType && matchesSearchTerm;
  }), [entries, filterType, searchTerm]);

  const thisWeek = entries.filter((entry) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(entry.created_at) > weekAgo;
  }).length;

  const streak = calculateStreak(entries);
  const milestone = getStreakMilestone(streak);

  return {
    entries,
    showForm,
    editingEntry,
    filterType,
    searchTerm,
    expandedEntry,
    currentPrompt,
    sharingId,
    showWeeklyReflection,
    weeklyReflection,
    weeklyReflectionLoading,
    weeklyReflectionError,
    formData,
    filteredEntries,
    streak,
    milestone,
    totalEntries: entries.length,
    thisWeek,
    setShowForm,
    setEditingEntry,
    setFilterType,
    setSearchTerm,
    setExpandedEntry,
    setCurrentPrompt,
    setFormData,
    openWeeklyReflection,
    closeWeeklyReflection,
    generateWeeklyReflection,
    handleSubmit,
    handleDelete,
    resetForm,
    startEdit,
    handleShareToCommunity,
  };
};
