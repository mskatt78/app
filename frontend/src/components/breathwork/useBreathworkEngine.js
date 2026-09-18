import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appLogger } from "../../utils/logger";
import { BREATHWORK_SOUND_OPTIONS, ELEMENT_DEFAULT_SOUNDS } from "./breathworkConfig";

const PACE_MULTIPLIERS = { classic: 1, gentle: 1.5, slow: 2 };
export const BREATH_PACE_OPTIONS = [
  { id: "classic", label: "Classic", hint: "As designed" },
  { id: "gentle", label: "Gentle", hint: "1.5× slower" },
  { id: "slow", label: "Slow & Soft", hint: "2× slower" },
];

const createManagedTimeout = (callback, delayRange = [1000, 2000]) => {
  let timeoutId = null;
  let active = true;

  const tick = () => {
    if (!active) return;
    callback();
    const [min, max] = delayRange;
    const nextDelay = min + Math.random() * Math.max(0, max - min);
    timeoutId = window.setTimeout(tick, nextDelay);
  };

  tick();

  return {
    stop: () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    },
    disconnect: () => {},
  };
};

export const useBreathworkEngine = ({ api }) => {
  const [sessions, setSessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedSound, setSelectedSound] = useState("silence");
  const [pace, setPace] = useState("classic");

  const intervalRef = useRef(null);
  const paceRef = useRef(1);
  const phaseRef = useRef(breathPhase);
  const activeSessionRef = useRef(activeSession);
  const isPlayingRef = useRef(isPlaying);
  const selectedSoundRef = useRef(selectedSound);
  const soundEnabledRef = useRef(soundEnabled);
  const recordingRef = useRef(null);

  const stopSound = useCallback(() => {
    try {
      if (recordingRef.current) {
        recordingRef.current.pause();
        recordingRef.current.currentTime = 0;
        recordingRef.current = null;
      }
    } catch (error) {
      appLogger.error("Breathwork stopAudio failed", error);
    }
  }, []);

  const REAL_BREATHWORK_AUDIO = {
    ocean: "/audio/ocean.mp3",
    rain: "/audio/rain.mp3",
    birds: "/audio/birds.mp3",
    whale: "/audio/whale.mp3",
    dolphin: "/audio/dolphin.mp3",
    drums_gentle: "/audio/drums.mp3",
  };

  const initAmbientSound = useCallback((soundId) => {
    const src = REAL_BREATHWORK_AUDIO[soundId];
    if (!src) return; // silence is preferable to synthetic filler
    try {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.32;
      recordingRef.current = audio;
      audio.play().catch((error) => appLogger.warn("Breathwork recording playback needs user interaction", error));
    } catch (error) {
      appLogger.error("Breathwork recording init failed", error);
    }
  }, []);

  const playSelectedSound = useCallback((_session, soundId, enabled = soundEnabled) => {
    stopSound();
    if (!enabled || soundId === "silence") return;
    initAmbientSound(soundId);
  }, [initAmbientSound, soundEnabled, stopSound]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await api.get("/breathwork/sessions");
      setAllSessions(response.data || []);
      setSessions(response.data || []);
      setFilteredSessions(response.data || []);
    } catch (error) {
      appLogger.error("Failed to fetch breathwork sessions", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSessions();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopSound();
    };
  }, [fetchSessions, stopSound]);

  useEffect(() => {
    phaseRef.current = breathPhase;
  }, [breathPhase]);

  useEffect(() => {
    paceRef.current = PACE_MULTIPLIERS[pace] || 1;
  }, [pace]);

  useEffect(() => {
    activeSessionRef.current = activeSession;
    isPlayingRef.current = isPlaying;
    selectedSoundRef.current = selectedSound;
    soundEnabledRef.current = soundEnabled;
  }, [activeSession, isPlaying, selectedSound, soundEnabled]);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredSessions(sessions);
      return;
    }
    setFilteredSessions(sessions.filter((session) => session.element === selectedElement));
  }, [selectedElement, sessions]);

  const setPremiumFilter = useCallback((allowPremium) => {
    const source = allSessions;
    const nextSessions = allowPremium ? source : source.filter((session) => !session.is_premium);
    setSessions(nextSessions);
  }, [allSessions]);

  const shouldPlaySelectedSound = useMemo(
    () => isPlaying && Boolean(activeSession) && soundEnabled,
    [activeSession, isPlaying, soundEnabled]
  );

  useEffect(() => {
    if (shouldPlaySelectedSound && activeSession) {
      playSelectedSound(activeSession, selectedSound);
      return;
    }
    if (selectedSound === "silence") {
      stopSound();
    }
  }, [activeSession, playSelectedSound, selectedSound, shouldPlaySelectedSound, stopSound]);

  const runBreathCycle = useCallback(() => {
    if (!activeSession) return;

    const pattern = activeSession.pattern;
    const phases = ["inhale", "hold", "exhale", "hold_empty"];

    intervalRef.current = setInterval(() => {
      setPhaseProgress((prev) => {
        const currentPhase = phaseRef.current;
        const phaseDuration = pattern[currentPhase] || 0;

        if (phaseDuration === 0) {
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          setBreathPhase(phases[nextIndex]);
          if (nextIndex === 0) setCycleCount((count) => count + 1);
          return 0;
        }

        const increment = 100 / (phaseDuration * paceRef.current * 10);
        const nextProgress = prev + increment;
        if (nextProgress >= 100) {
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          setBreathPhase(phases[nextIndex]);
          if (nextIndex === 0) setCycleCount((count) => count + 1);
          return 0;
        }
        return nextProgress;
      });
    }, 100);
  }, [activeSession]);

  const startSession = useCallback((session) => {
    setActiveSession(session);
    setBreathPhase("inhale");
    setPhaseProgress(0);
    setCycleCount(0);
    setIsPlaying(false);
    setSoundEnabled(true);
    setSelectedSound(ELEMENT_DEFAULT_SOUNDS[session.element] || "tone");
  }, []);

  const togglePlay = useCallback(() => {
    const currentSession = activeSessionRef.current;
    if (!currentSession) return;

    if (isPlayingRef.current) {
      clearInterval(intervalRef.current);
      stopSound();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    playSelectedSound(currentSession, selectedSoundRef.current);
    runBreathCycle();
  }, [playSelectedSound, runBreathCycle, stopSound]);

  const toggleSound = useCallback(() => {
    const currentlyEnabled = soundEnabledRef.current;
    if (currentlyEnabled && recordingRef.current) {
      stopSound();
    } else if (!currentlyEnabled && isPlayingRef.current && activeSessionRef.current) {
      playSelectedSound(activeSessionRef.current, selectedSoundRef.current, true);
    }
    setSoundEnabled((prev) => !prev);
  }, [playSelectedSound, stopSound]);

  const resetSession = useCallback(() => {
    clearInterval(intervalRef.current);
    stopSound();
    setIsPlaying(false);
    setBreathPhase("inhale");
    setPhaseProgress(0);
    setCycleCount(0);
  }, [stopSound]);

  const closeSession = useCallback(() => {
    clearInterval(intervalRef.current);
    stopSound();
    setActiveSession(null);
    setIsPlaying(false);
  }, [stopSound]);

  const getBreathCircleSize = useCallback(() => {
    if (breathPhase === "inhale") return 100 + (phaseProgress * 0.5);
    if (breathPhase === "exhale") return 150 - (phaseProgress * 0.5);
    return breathPhase === "hold" ? 150 : 100;
  }, [breathPhase, phaseProgress]);

  return {
    loading,
    selectedElement,
    setSelectedElement,
    allSessions,
    filteredSessions,
    setPremiumFilter,
    activeSession,
    isPlaying,
    breathPhase,
    phaseProgress,
    cycleCount,
    soundEnabled,
    selectedSound,
    setSelectedSound,
    togglePlay,
    toggleSound,
    resetSession,
    closeSession,
    startSession,
    getBreathCircleSize,
    pace,
    setPace,
    availableSoundOptions: BREATHWORK_SOUND_OPTIONS,
    paceMultiplier: PACE_MULTIPLIERS[pace] || 1,
  };
};
