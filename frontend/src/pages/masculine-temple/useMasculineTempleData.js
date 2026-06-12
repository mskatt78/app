import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { appLogger } from "../../utils/logger";
import { apiClientConfig, archetypes, initialMasculineState } from "./constants";

const apiClient = axios.create(apiClientConfig);

export const useMasculineTempleData = () => {
  const [selectedArchetype, setSelectedArchetype] = useState(initialMasculineState.selectedArchetype);
  const [activeTab, setActiveTab] = useState(initialMasculineState.activeTab);
  const [embodimentPractices, setEmbodimentPractices] = useState(initialMasculineState.embodimentPractices);
  const [loadingPractices, setLoadingPractices] = useState(initialMasculineState.loadingPractices);
  const [selectedPractice, setSelectedPractice] = useState(initialMasculineState.selectedPractice);
  const [showIntro, setShowIntro] = useState(initialMasculineState.showIntro);

  const fetchPractices = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/masculine-embodiment");
      setEmbodimentPractices(data);
    } catch (error) {
      appLogger.warn("Masculine Temple practices load failed", error);
    } finally {
      setLoadingPractices(false);
    }
  }, []);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  const openArchetype = (archetype) => {
    setSelectedArchetype(archetype);
    setActiveTab("teachings");
  };

  const closeArchetype = () => setSelectedArchetype(null);

  return {
    archetypes,
    selectedArchetype,
    setSelectedArchetype,
    activeTab,
    setActiveTab,
    embodimentPractices,
    loadingPractices,
    selectedPractice,
    setSelectedPractice,
    showIntro,
    setShowIntro,
    openArchetype,
    closeArchetype,
  };
};