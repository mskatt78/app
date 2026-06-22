import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

export const useHeartPracticesData = (api) => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchPractices = useCallback(async () => {
    try {
      const url = filter === "all" ? "/heart-practices" : `/heart-practices?category=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch heart practices", error);
      toast.error("Could not load heart practices");
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  useEffect(() => {
    if (!selectedPractice) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPractice(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedPractice]);

  return {
    practices,
    loading,
    selectedPractice,
    guidedPractice,
    filter,
    setSelectedPractice,
    setGuidedPractice,
    setFilter,
  };
};
