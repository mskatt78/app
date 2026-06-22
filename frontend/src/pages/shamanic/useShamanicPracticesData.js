import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

export const useShamanicPracticesData = (api) => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [unlockedContent, setUnlockedContent] = useState([]);
  const [isPracticing, setIsPracticing] = useState(false);

  const fetchPractices = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/shamanic-practices" : `/shamanic-practices?category=${filter}`;
      const response = await api.get(url);
      setPractices(response.data || []);
    } catch (error) {
      appLogger.error("Failed to fetch shamanic practices", error);
      toast.error("Could not load shamanic practices");
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  const fetchUnlockedContent = useCallback(async () => {
    try {
      const response = await api.get("/achievements");
      const unlocked = response.data.unlocked_content || [];
      setUnlockedContent(unlocked);
    } catch (error) {
      appLogger.warn("Failed to fetch unlocked shamanic content", error);
    }
  }, [api]);

  useEffect(() => {
    fetchPractices();
    fetchUnlockedContent();
  }, [fetchPractices, fetchUnlockedContent]);

  const isLocked = (practice) => {
    if (!practice?.requires_unlock) {
      return false;
    }
    const unlockItem = unlockedContent.find(
      (entry) => entry.item === "shamanic_practice" && entry.item_id === practice.id
    );
    return !unlockItem;
  };

  const logPractice = async (practice) => {
    try {
      await api.post("/practice-history", {
        practice_type: "shamanic_journey",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes || 30,
        element: "Spirit",
      });
      toast.success("Shamanic practice logged!");
    } catch (error) {
      appLogger.warn("Failed to log shamanic practice", error);
    }
  };

  const getSteps = (practice) => {
    if (!practice) return [];
    return (
      practice.journey_steps ||
      practice.visualization_steps ||
      practice.ritual_steps ||
      practice.ceremony_steps ||
      practice.steps ||
      []
    );
  };

  const formatPreparationText = (preparation) => {
    if (!preparation) return "";
    if (Array.isArray(preparation)) {
      return `Preparation: ${preparation.join(". ")}`;
    }
    return `Preparation: ${preparation}`;
  };

  return {
    practices,
    loading,
    selectedPractice,
    setSelectedPractice,
    guidedPractice,
    setGuidedPractice,
    filter,
    setFilter,
    unlockedContent,
    isPracticing,
    setIsPracticing,
    isLocked,
    logPractice,
    getSteps,
    formatPreparationText,
  };
};