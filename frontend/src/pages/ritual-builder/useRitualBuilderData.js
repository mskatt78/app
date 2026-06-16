import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import { EMPTY_RITUAL_FORM } from "./ritualBuilderConstants";

export const useRitualBuilderData = (api) => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeRitual, setActiveRitual] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharingRitualId, setSharingRitualId] = useState(null);
  const [practices, setPractices] = useState({
    yoga: [],
    breathwork: [],
    mantra: [],
    mudra: [],
  });
  const [newRitual, setNewRitual] = useState(EMPTY_RITUAL_FORM);
  const [addingPractice, setAddingPractice] = useState(false);
  const [selectedType, setSelectedType] = useState("yoga");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceDuration, setPracticeDuration] = useState(5);

  const fetchData = useCallback(async () => {
    try {
      const [ritualsRes, yogaRes, breathworkRes, mantraRes, mudraRes] = await Promise.all([
        api.get("/rituals"),
        api.get("/yoga/poses"),
        api.get("/breathwork/sessions"),
        api.get("/mantras"),
        api.get("/mudras"),
      ]);

      setRituals(ritualsRes.data);
      setPractices({
        yoga: yogaRes.data,
        breathwork: breathworkRes.data,
        mantra: mantraRes.data,
        mudra: mudraRes.data,
      });
    } catch (error) {
      appLogger.error("Failed to fetch ritual builder data", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPracticeToRitual = useCallback(() => {
    if (!selectedPractice) return;

    const practice = practices[selectedType].find((item) => item.id === selectedPractice);
    if (!practice) return;

    setNewRitual((prev) => ({
      ...prev,
      practices: [
        ...prev.practices,
        {
          type: selectedType,
          id: practice.id,
          name: practice.name,
          duration: practiceDuration,
        },
      ],
    }));

    setSelectedPractice(null);
    setPracticeDuration(5);
    setAddingPractice(false);
  }, [practiceDuration, practices, selectedPractice, selectedType]);

  const removePractice = useCallback((index) => {
    setNewRitual((prev) => ({
      ...prev,
      practices: prev.practices.filter((_, i) => i !== index),
    }));
  }, []);

  const saveRitual = useCallback(async () => {
    if (!newRitual.name || newRitual.practices.length === 0) {
      toast.error("Please add a name and at least one practice");
      return;
    }

    try {
      const totalDuration = newRitual.practices.reduce((sum, item) => sum + item.duration, 0);
      const response = await api.post("/rituals", {
        ...newRitual,
        total_duration: totalDuration,
      });

      setRituals((prev) => [...prev, response.data]);
      setNewRitual(EMPTY_RITUAL_FORM);
      setCreating(false);
      toast.success("Ritual saved!");
    } catch (error) {
      appLogger.error("Failed to save ritual", error);
      toast.error("Could not save ritual");
    }
  }, [api, newRitual]);

  const deleteRitual = useCallback(async (ritualId) => {
    try {
      await api.delete(`/rituals/${ritualId}`);
      setRituals((prev) => prev.filter((ritual) => ritual.ritual_id !== ritualId));
      toast.success("Ritual deleted");
    } catch (error) {
      appLogger.warn("Failed to delete ritual", error);
      toast.error("Could not delete ritual");
    }
  }, [api]);

  const shareRitual = useCallback(async (ritualId) => {
    setSharingRitualId(ritualId);
    try {
      const response = await api.post(`/rituals/${ritualId}/share`);
      const fullUrl = `${window.location.origin}/rituals/shared/${response.data.share_code}`;
      setShareUrl(fullUrl);
      setShareDialogOpen(true);
    } catch (error) {
      appLogger.warn("Failed to share ritual", error);
      toast.error("Could not create share link");
    } finally {
      setSharingRitualId(null);
    }
  }, [api]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  }, [shareUrl]);

  const startRitual = useCallback((ritual) => {
    setActiveRitual(ritual);
    setCurrentStep(0);
    setStepProgress(0);
    setElapsedTime(0);
    setIsPlaying(false);
  }, []);

  const logRitualComplete = useCallback(async () => {
    if (!activeRitual) return;
    try {
      await api.post("/practice-history", {
        practice_type: "ritual",
        practice_id: activeRitual.ritual_id,
        duration_minutes: activeRitual.total_duration,
        notes: `Completed ritual: ${activeRitual.name}`,
      });
    } catch (error) {
      appLogger.warn("Failed to log ritual practice", error);
    }
  }, [activeRitual, api]);

  useEffect(() => {
    let interval;
    if (isPlaying && activeRitual) {
      interval = setInterval(() => {
        setStepProgress((prev) => {
          const currentPractice = activeRitual.practices[currentStep];
          const stepDuration = currentPractice?.duration * 60 || 300;
          const increment = 100 / stepDuration;

          if (prev + increment >= 100) {
            if (currentStep < activeRitual.practices.length - 1) {
              setCurrentStep((stepIndex) => stepIndex + 1);
              return 0;
            }

            setIsPlaying(false);
            logRitualComplete();
            toast.success("Ritual complete! Blessed be.");
            return 100;
          }

          return prev + increment;
        });
        setElapsedTime((time) => time + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeRitual, currentStep, isPlaying, logRitualComplete]);

  const totalDuration = useMemo(
    () => newRitual.practices.reduce((sum, item) => sum + item.duration, 0),
    [newRitual.practices],
  );

  const contentMode = useMemo(() => {
    if (loading) return "loading";
    if (activeRitual) return "active";
    if (creating) return "creating";
    return "list";
  }, [activeRitual, creating, loading]);

  return {
    rituals,
    loading,
    creating,
    activeRitual,
    isPlaying,
    currentStep,
    stepProgress,
    elapsedTime,
    shareDialogOpen,
    shareUrl,
    sharingRitualId,
    practices,
    newRitual,
    addingPractice,
    selectedType,
    selectedPractice,
    practiceDuration,
    totalDuration,
    contentMode,
    setCreating,
    setActiveRitual,
    setIsPlaying,
    setShareDialogOpen,
    setNewRitual,
    setAddingPractice,
    setSelectedType,
    setSelectedPractice,
    setPracticeDuration,
    addPracticeToRitual,
    removePractice,
    saveRitual,
    deleteRitual,
    shareRitual,
    copyShareUrl,
    startRitual,
  };
};
