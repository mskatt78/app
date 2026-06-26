import { useCallback, useEffect, useMemo, useState } from "react";
import { Flame, Heart, Moon, Sparkles, Sun, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { appLogger } from "../../utils/logger";
import { CHAKRA_CONFIG, normalizeNarrationText } from "./chakraConfig";
import { resolveGuidedSpeedValue, resolveGuidedVoiceId } from "../../utils/guidedVoiceSettings";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

export const useChakraCleansingData = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filterChakra, setFilterChakra] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");
  const [audioState, setAudioState] = useState({ loading: false, audioUrl: null, sectionKey: null });
  const [showShare, setShowShare] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  useEffect(() => {
    return () => {
      if (audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
      }
    };
  }, [audioState.audioUrl]);

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const { data } = await api.get("/chakra-cleansing");
        setPractices(data);
      } catch (error) {
        appLogger.error("Failed to load chakra practices", error);
        toast.error("Failed to load practices");
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, []);

  const generateAudio = useCallback(
    async (text, sectionKey) => {
      const narrationText = normalizeNarrationText(text);
      if (!narrationText) return;

      if (audioState.sectionKey === sectionKey && audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
        setAudioState({ loading: false, audioUrl: null, sectionKey: null });
        return;
      }

      setAudioState({ loading: true, audioUrl: null, sectionKey });
      try {
        const voiceId = resolveGuidedVoiceId();
        const speedValue = resolveGuidedSpeedValue();
        const { data } = await api.post("/tts/generate-base64", {
          text: narrationText.slice(0, 3800),
          voice: voiceId,
          speed: speedValue,
        });
        const binary = atob(data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        setAudioState({ loading: false, audioUrl: url, sectionKey });
      } catch (error) {
        appLogger.error("Failed to generate chakra narration", error);
        toast.error("Could not generate audio narration");
        setAudioState({ loading: false, audioUrl: null, sectionKey: null });
      }
    },
    [audioState]
  );

  const chakras = useMemo(() => ["all", ...Object.keys(CHAKRA_CONFIG)], []);

  const filteredPractices = useMemo(() => {
    if (filterChakra === "all") return practices;
    return practices.filter((practice) =>
      practice.chakra?.toLowerCase().replace(/[^a-z]/g, "_").includes(filterChakra)
    );
  }, [filterChakra, practices]);

  const chakraStripItems = useMemo(() => {
    return Object.entries(CHAKRA_CONFIG).sort((a, b) => a[1].order - b[1].order);
  }, []);

  const sectionItems = useMemo(() => {
    if (!selectedPractice) return [];

    return [
      { key: "why", label: "Why This Heals", icon: Sparkles, content: selectedPractice.why_this_heals },
      {
        key: "teaching",
        label: "Deeper Teaching",
        icon: Sparkles,
        content: selectedPractice.deeper_teaching || selectedPractice.deeper_teachings,
      },
      { key: "guide", label: "Self-Healing Guide", icon: Heart, content: selectedPractice.cleansing_guide },
      { key: "somatic", label: "Somatic Practice", icon: Zap, content: selectedPractice.somatic_practice },
      { key: "signs", label: "Signs of Imbalance", icon: Flame, content: selectedPractice.signs_of_imbalance },
      { key: "healing", label: "Signs of Healing", icon: Sun, content: selectedPractice.signs_of_healing },
      { key: "shadow", label: "Shadow Work", icon: Moon, content: selectedPractice.shadow_work },
      {
        key: "practices",
        label: "Healing Practices",
        icon: Heart,
        content: Array.isArray(selectedPractice.healing_practices)
          ? selectedPractice.healing_practices.join("\n\n• ")
          : selectedPractice.healing_practices,
      },
      {
        key: "affirmations",
        label: "Healing Affirmations",
        icon: Heart,
        content: Array.isArray(selectedPractice.affirmations)
          ? selectedPractice.affirmations.join("\n")
          : selectedPractice.affirmations,
      },
      { key: "crystals", label: "Supporting Crystals", icon: Sparkles, content: selectedPractice.crystals },
    ].filter((section) => section.content);
  }, [selectedPractice]);

  const selectedPracticeBenefits = useMemo(() => {
    if (!selectedPractice?.benefits) return [];
    if (typeof selectedPractice.benefits === "string") {
      return selectedPractice.benefits
        .split(",")
        .map((benefit) => benefit.trim())
        .filter(Boolean);
    }
    return selectedPractice.benefits;
  }, [selectedPractice]);

  const dailyCeremonySteps = useMemo(() => {
    return selectedPractice?.daily_embodiment_ceremony?.steps || [];
  }, [selectedPractice]);

  const closePracticeModal = useCallback(() => {
    setSelectedPractice(null);
    setAudioState({ loading: false, audioUrl: null, sectionKey: null });
  }, []);

  return {
    loading,
    practices,
    filteredPractices,
    chakras,
    chakraStripItems,
    selectedPractice,
    setSelectedPractice,
    filterChakra,
    setFilterChakra,
    expandedSection,
    setExpandedSection,
    audioState,
    generateAudio,
    showShare,
    setShowShare,
    showGuided,
    setShowGuided,
    sectionItems,
    selectedPracticeBenefits,
    dailyCeremonySteps,
    closePracticeModal,
  };
};