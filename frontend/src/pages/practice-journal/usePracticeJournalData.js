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
