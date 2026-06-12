import { useEffect, useMemo, useState } from "react";
import { appLogger } from "../../utils/logger";

export const useAncientWisdomData = (api) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await api.get("/ancient-wisdom");
        setEntries(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch ancient wisdom", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [api]);

  const filteredEntries = useMemo(() => {
    if (activeTab === "all") return entries;
    return entries.filter((entry) => entry.tradition === activeTab);
  }, [activeTab, entries]);

  return {
    loading,
    activeTab,
    setActiveTab,
    selected,
    setSelected,
    filteredEntries,
  };
};