import { useCallback, useMemo, useState } from "react";
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

export const usePracticeJournalData = ({ api, navigate, user }) => {
  const [entries, setEntries] = useState(() => getStoredEntries());
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(() => getRandomPrompt());
  const [sharingId, setSharingId] = useState(null);
  const [formData, setFormData] = useState(createInitialJournalFormData());

  const resetForm = useCallback(() => {
    setFormData(createInitialJournalFormData());
    setShowForm(false);
    setEditingEntry(null);
    setCurrentPrompt(getRandomPrompt());
  }, []);

  const handleSubmit = useCallback(() => {
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
  }, [editingEntry, entries, formData, resetForm]);

  const handleDelete = useCallback((id) => {
    const nextEntries = entries.filter((entry) => entry.id !== id);
    setEntries(nextEntries);
    saveEntriesToStorage(nextEntries);
    toast.success("Entry deleted");
  }, [entries]);

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
    handleSubmit,
    handleDelete,
    resetForm,
    startEdit,
    handleShareToCommunity,
  };
};
