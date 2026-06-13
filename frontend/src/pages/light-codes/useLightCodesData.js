import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import { categories } from "./lightCodeConfig";

export const useLightCodesData = (api) => {
  const [lightCodes, setLightCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("sacred_geometry");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [modalTab, setModalTab] = useState("essence");
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchLightCodes = async () => {
      try {
        const response = await api.get("/light-codes");
        setLightCodes(response.data);
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      } catch (error) {
        appLogger.error("Failed to fetch light codes", error);
        toast.error("Could not load light codes");
      } finally {
        setLoading(false);
      }
    };

    fetchLightCodes();
  }, [api]);

  const activeCategoryInfo = useMemo(() => categories.find((category) => category.id === activeCategory), [activeCategory]);

  const currentSymbols = useMemo(() => {
    if (!lightCodes) {
      return [];
    }

    return lightCodes[activeCategory] || [];
  }, [activeCategory, lightCodes]);

  const selectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setSelectedSymbol(null);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const openSymbol = (symbol) => {
    setModalTab("essence");
    setSelectedSymbol(symbol);
  };

  return {
    lightCodes,
    loading,
    activeCategory,
    selectedSymbol,
    modalTab,
    activeCategoryInfo,
    currentSymbols,
    contentRef,
    setSelectedSymbol,
    setModalTab,
    selectCategory,
    openSymbol,
  };
};
