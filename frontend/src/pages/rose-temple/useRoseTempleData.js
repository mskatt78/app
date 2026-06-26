import { useCallback, useEffect, useMemo, useState } from "react";
import { appLogger } from "../../utils/logger";

export const useRoseTempleData = (api) => {
  const [selectedTeaching, setSelectedTeaching] = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [embodimentPractices, setEmbodimentPractices] = useState([]);
  const [loadingPractices, setLoadingPractices] = useState(true);
  const [sacredRites, setSacredRites] = useState([]);
  const [selectedRite, setSelectedRite] = useState(null);

  const fetchEmbodimentPractices = useCallback(async () => {
    try {
      const { data } = await api.get("/feminine-embodiment");
      setEmbodimentPractices(data);
    } catch (error) {
      appLogger.error("Failed loading feminine embodiment practices:", error);
    } finally {
      setLoadingPractices(false);
    }
  }, [api]);

  const fetchSacredRites = useCallback(async () => {
    try {
      const { data } = await api.get("/sacred-rites");
      setSacredRites(data);
    } catch (error) {
      appLogger.error("Failed loading sacred rites:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchEmbodimentPractices();
    fetchSacredRites();
  }, [fetchEmbodimentPractices, fetchSacredRites]);

  const state = useMemo(
    () => ({
      selectedTeaching,
      selectedPractice,
      embodimentPractices,
      loadingPractices,
      sacredRites,
      selectedRite,
    }),
    [embodimentPractices, loadingPractices, sacredRites, selectedPractice, selectedRite, selectedTeaching],
  );

  const actions = useMemo(
    () => ({
      setSelectedTeaching,
      setSelectedPractice,
      setSelectedRite,
    }),
    [],
  );

  return { ...state, ...actions };
};
