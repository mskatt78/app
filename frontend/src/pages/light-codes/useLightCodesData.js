import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import { categories } from "./lightCodeConfig";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import {
  getEncodedFrequencyImage,
  SACRED_GEOMETRY_IMAGE_OVERRIDES,
  SACRED_GEOMETRY_SYMBOL_OVERRIDES,
} from "../../utils/lightCodeVisualTheme";
import { getLightCodeImage } from "../../utils/shamanicImageTheme";

const SOURCE_SECTIONS = [
  "sacred_geometry",
  "ancient_alphabets",
  "light_language_symbols",
  "galactic_codes",
  "chakra_codes",
];

const buildEncodedFrequencySymbols = (lightCodes) => {
  if (!lightCodes || typeof lightCodes !== "object") return [];

  const sourceEntries = SOURCE_SECTIONS.flatMap((sectionId) => {
    const rows = Array.isArray(lightCodes[sectionId]) ? lightCodes[sectionId] : [];
    return rows.map((row) => ({ ...row, source_section: sectionId }));
  }).filter(Boolean);

  const uniqueByName = new Map();
  sourceEntries.forEach((entry) => {
    const key = String(entry?.name || entry?.id || "").trim().toLowerCase();
    if (!key || uniqueByName.has(key)) return;
    uniqueByName.set(key, entry);
  });

  return Array.from(uniqueByName.values())
    .slice(0, 14)
    .map((entry, index) => {
      const codeId = `encoded-frequency-${index + 1}-${entry?.id || entry?.name || "symbol"}`;
      const isPremium = index >= 4;
      return {
        ...entry,
        id: codeId,
        name: `Encoded ${entry?.name || `Transmission ${index + 1}`}`,
        title: entry?.title || "Encoded Frequency Transmission",
        description: entry?.description || entry?.meaning || "A high-order ceremonial light code for symbolic activation and embodied integration.",
        image_url: getLightCodeImage({ id: codeId, name: entry?.name, source_section: entry?.source_section }),
        source_section: entry?.source_section,
        is_premium: isPremium,
        premium_unlock_id: "light_codes",
        tier: isPremium ? "premium" : "free",
      };
    });
};

export const useLightCodesData = (api, user) => {
  const [lightCodes, setLightCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("encoded_frequency");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [selectedLockedSymbol, setSelectedLockedSymbol] = useState(null);
  const [modalTab, setModalTab] = useState("essence");
  const contentRef = useRef(null);
  const premium = usePremiumAccess({ api, user });

  const lightCodesUnlocked = premium.isSectionUnlocked("light_codes");

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

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

  const encodedFrequencySymbols = useMemo(() => buildEncodedFrequencySymbols(lightCodes), [lightCodes]);

  const currentSymbols = useMemo(() => {
    if (!lightCodes) {
      return [];
    }

    if (activeCategory === "encoded_frequency") {
      return encodedFrequencySymbols;
    }

    const symbols = lightCodes[activeCategory] || [];
    return symbols.map((symbol, index) => {
      const stableKey = `${activeCategory}-${symbol?.id || symbol?.name || index}`;
      const isSacredGeometry = activeCategory === "sacred_geometry";
      const geometryImage = isSacredGeometry ? SACRED_GEOMETRY_IMAGE_OVERRIDES[symbol?.id] : null;
      const geometrySymbol = isSacredGeometry ? SACRED_GEOMETRY_SYMBOL_OVERRIDES[symbol?.id] : null;
      return {
        ...symbol,
        image_url: geometryImage || getLightCodeImage({ ...symbol, id: stableKey, source_section: activeCategory }),
        symbol: geometrySymbol || symbol?.symbol,
        geometry_verified: isSacredGeometry && Boolean(geometryImage),
      };
    });
  }, [activeCategory, encodedFrequencySymbols, lightCodes]);

  useEffect(() => {
    if (activeCategory === "encoded_frequency") {
      return;
    }
    if (!currentSymbols.length) {
      setActiveCategory("encoded_frequency");
    }
  }, [activeCategory, currentSymbols.length]);

  const selectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setSelectedSymbol(null);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const openSymbol = (symbol) => {
    if (symbol?.is_premium && !lightCodesUnlocked) {
      setSelectedLockedSymbol(symbol);
      return;
    }
    setModalTab("essence");
    setSelectedSymbol(symbol);
  };

  return {
    lightCodes,
    loading,
    activeCategory,
    selectedSymbol,
    selectedLockedSymbol,
    modalTab,
    activeCategoryInfo,
    currentSymbols,
    lightCodesUnlocked,
    premium,
    contentRef,
    setSelectedSymbol,
    setSelectedLockedSymbol,
    setModalTab,
    selectCategory,
    openSymbol,
  };
};
