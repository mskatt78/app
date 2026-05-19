import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { JournalDialogs } from "../components/journal/JournalDialogs";
import { JournalMainSection } from "../components/journal/JournalMainSection";
import {
  DEFAULT_NEW_ENTRY,
  JOURNAL_TYPES,
  MOODS,
  MOON_PHASES,
  formatJournalDate,
} from "../components/journal/journalConfig";
import { appLogger } from "../utils/logger";

const Journal = ({ api }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filterMood, setFilterMood] = useState("all");
  const [activeJournalType, setActiveJournalType] = useState("all");
  const [newEntry, setNewEntry] = useState(DEFAULT_NEW_ENTRY);
  const [tagInput, setTagInput] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterMood !== "all") params.append("mood", filterMood);
      if (activeJournalType !== "all") params.append("journal_type", activeJournalType);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`/journal${queryString}`);
      setEntries(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch journal entries", error);
    } finally {
      setLoading(false);
    }
  }, [activeJournalType, api, filterMood]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async () => {
    if (!newEntry.content.trim()) {
      toast.error("Please write something in your journal");
      return;
    }

    try {
      const entryData = {
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood || null,
        tags: newEntry.tags.length > 0 ? newEntry.tags : null,
        journal_type: newEntry.journal_type,
        ...(newEntry.journal_type === "moon" ? { moon_phase: newEntry.moon_phase || null, moon_intention: newEntry.moon_intention || null } : {}),
        ...(newEntry.journal_type === "dream" ? { dream_symbols: newEntry.dream_symbols || null } : {}),
      };

      const response = await api.post("/journal", entryData);
      setEntries((prev) => [response.data, ...prev]);
      setNewEntry((prev) => ({ ...DEFAULT_NEW_ENTRY, journal_type: prev.journal_type }));
      setTagInput("");
      setCreating(false);
      toast.success("Journal entry saved");
    } catch (error) {
      appLogger.error("Failed to create journal entry", error);
      toast.error("Could not save entry");
    }
  }, [api, newEntry]);

  const deleteEntry = useCallback(async (entryId) => {
    try {
      await api.delete(`/journal/${entryId}`);
      setEntries((prev) => prev.filter((entry) => entry.entry_id !== entryId));
      setSelectedEntry(null);
      toast.success("Entry deleted");
    } catch (error) {
      appLogger.warn("Failed to delete journal entry", error);
      toast.error("Could not delete entry");
    }
  }, [api]);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }, [newEntry.tags, tagInput]);

  const removeTag = useCallback((tag) => {
    setNewEntry((prev) => ({ ...prev, tags: prev.tags.filter((entryTag) => entryTag !== tag) }));
  }, []);

  const getMoodIcon = useCallback((moodValue) => {
    const moodData = MOODS.find((mood) => mood.value === moodValue);
    if (!moodData) return null;
    const Icon = moodData.icon;
    return <Icon className={`w-4 h-4 ${moodData.color}`} />;
  }, []);

  const decoratedEntries = useMemo(() => entries.map((entry) => {
    if (entry.journal_type === "moon" && entry.moon_phase) {
      const phaseLabel = MOON_PHASES.find((phase) => phase.value === entry.moon_phase)?.label || entry.moon_phase;
      return { ...entry, moon_phase: phaseLabel };
    }
    return entry;
  }), [entries]);

  const resetEntry = useCallback(() => {
    setCreating(false);
    setNewEntry(DEFAULT_NEW_ENTRY);
    setTagInput("");
  }, []);

  return (
    <div className="min-h-screen bg-background" data-testid="journal-page">
      <JournalMainSection
        navigate={navigate}
        filterMood={filterMood}
        setFilterMood={setFilterMood}
        moods={MOODS}
        activeJournalType={activeJournalType}
        setActiveJournalType={setActiveJournalType}
        journalTypes={JOURNAL_TYPES}
        setCreating={setCreating}
        loading={loading}
        entries={decoratedEntries}
        formatDate={formatJournalDate}
        getMoodIcon={getMoodIcon}
        setSelectedEntry={setSelectedEntry}
        creating={creating}
      />

      <JournalDialogs
        creating={creating}
        setCreating={setCreating}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        moonPhases={MOON_PHASES}
        moods={MOODS}
        journalTypes={JOURNAL_TYPES}
        tagInput={tagInput}
        setTagInput={setTagInput}
        addTag={addTag}
        removeTag={removeTag}
        createEntry={createEntry}
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
        deleteEntry={deleteEntry}
        formatDate={formatJournalDate}
        getMoodIcon={getMoodIcon}
        resetEntry={resetEntry}
      />
    </div>
  );
};

export default Journal;
