import { useCallback, useEffect, useRef, useState } from "react";
import { appLogger } from "../../utils/logger";
import { BREATHWORK_SOUND_OPTIONS, ELEMENT_DEFAULT_SOUNDS } from "./breathworkConfig";

const createBrownNoise = (audioContext) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  const source = audioContext.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  return source;
};

const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

export const useBreathworkEngine = ({ api }) => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("tone");

  const intervalRef = useRef(null);
  const phaseRef = useRef(breathPhase);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const ambientSourcesRef = useRef([]);

  const extractFrequency = useCallback((session) => {
    if (!session?.frequency) return 432;
    const match = session.frequency.match(/(\d+)\s*[Hh]z/);
    return match ? parseInt(match[1], 10) : 432;
  }, []);

  const stopSound = useCallback(() => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      ambientSourcesRef.current.forEach((source) => {
        try { source.stop?.(); } catch (error) { appLogger.warn("Failed stopping ambient source", error); }
        try { source.disconnect?.(); } catch (error) { appLogger.warn("Failed disconnecting ambient source", error); }
      });
      ambientSourcesRef.current = [];
    } catch (error) {
      appLogger.error("Breathwork stopAudio failed", error);
    }
  }, []);

  const initAudio = useCallback((frequency) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.type = "sine";
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0.15, audioContextRef.current.currentTime);

      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      oscillatorRef.current.start();
    } catch (error) {
      appLogger.error("Breathwork tone init failed", error);
    }
  }, []);

  const initAmbientSound = useCallback((soundId) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0.18, audioContextRef.current.currentTime);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      const ctx = audioContextRef.current;
      const sources = [];

      if (soundId === "ocean") {
        const { source: low, output: lowOut } = createFilteredNoise(ctx, 200, 1);
        const { source: mid, output: midOut } = createFilteredNoise(ctx, 800, 0.5);
        lowOut.connect(gainNodeRef.current);
        midOut.connect(gainNodeRef.current);
        low.start();
        mid.start();
        sources.push(low, mid);
      } else if (soundId === "rain") {
        const { source, output } = createFilteredNoise(ctx, 400, 2);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      } else if (soundId === "nature" || soundId === "fire") {
        const { source, output } = createFilteredNoise(ctx, 500, 0.5);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      } else if (soundId === "wind") {
        const { source, output } = createFilteredNoise(ctx, 650, 3);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      }

      ambientSourcesRef.current = sources;
    } catch (error) {
      appLogger.error("Breathwork ambient init failed", error);
    }
  }, []);

  const playSelectedSound = useCallback((session, soundId, enabled = soundEnabled) => {
    if (!enabled || soundId === "silence") return;
    stopSound();
    if (soundId === "tone" && session?.frequency) {
      initAudio(extractFrequency(session));
      return;
    }
    initAmbientSound(soundId);
  }, [extractFrequency, initAmbientSound, initAudio, soundEnabled, stopSound]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await api.get("/breathwork/sessions");
      setSessions(response.data);
      setFilteredSessions(response.data);
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
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((error) => {
          appLogger.warn("Failed closing breathwork audio context", error);
        });
        audioContextRef.current = null;
      }
    };
  }, [fetchSessions, stopSound]);

  useEffect(() => {
    phaseRef.current = breathPhase;
  }, [breathPhase]);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredSessions(sessions);
      return;
    }
    setFilteredSessions(sessions.filter((session) => session.element === selectedElement));
  }, [selectedElement, sessions]);

  useEffect(() => {
    if (isPlaying && activeSession && soundEnabled) {
      playSelectedSound(activeSession, selectedSound);
    }
    if (selectedSound === "silence") {
      stopSound();
    }
  }, [activeSession, isPlaying, playSelectedSound, selectedSound, soundEnabled, stopSound]);

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

        const increment = 100 / (phaseDuration * 10);
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
    if (!activeSession) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      stopSound();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    playSelectedSound(activeSession, selectedSound);
    runBreathCycle();
  }, [activeSession, isPlaying, playSelectedSound, runBreathCycle, selectedSound, stopSound]);

  const toggleSound = useCallback(() => {
    if (soundEnabled && (oscillatorRef.current || ambientSourcesRef.current.length > 0)) {
      stopSound();
    } else if (!soundEnabled && isPlaying && activeSession) {
      playSelectedSound(activeSession, selectedSound, true);
    }
    setSoundEnabled((prev) => !prev);
  }, [activeSession, isPlaying, playSelectedSound, selectedSound, soundEnabled, stopSound]);

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
    filteredSessions,
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
    availableSoundOptions: BREATHWORK_SOUND_OPTIONS,
  };
};
