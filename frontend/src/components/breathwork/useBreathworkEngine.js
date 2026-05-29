import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const activeSessionRef = useRef(activeSession);
  const isPlayingRef = useRef(isPlaying);
  const selectedSoundRef = useRef(selectedSound);
  const soundEnabledRef = useRef(soundEnabled);
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
      gainNodeRef.current.gain.setValueAtTime(0.24, audioContextRef.current.currentTime);
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
      } else if (soundId === "nature") {
        const { source, output } = createFilteredNoise(ctx, 500, 0.5);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);

        const birdsLayer = createManagedTimeout(() => {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          chirp.type = "triangle";
          const start = 1400 + Math.random() * 1200;
          const end = 900 + Math.random() * 700;
          chirp.frequency.setValueAtTime(start, ctx.currentTime);
          chirp.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + 0.22);
          chirpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          chirpGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
          chirp.connect(chirpGain);
          chirpGain.connect(gainNodeRef.current);
          chirp.start(ctx.currentTime);
          chirp.stop(ctx.currentTime + 0.24);
        }, [900, 2400]);
        sources.push(birdsLayer);
      } else if (soundId === "fire") {
        const { source, output } = createFilteredNoise(ctx, 1000, 1);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);

        const crackleLayer = createManagedTimeout(() => {
          const burstDuration = 0.045 + Math.random() * 0.05;
          const bufferSize = Math.max(32, Math.floor(ctx.sampleRate * burstDuration));
          const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const channel = crackleBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i += 1) {
            channel[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
          }
          const crackle = ctx.createBufferSource();
          crackle.buffer = crackleBuffer;
          const highpass = ctx.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.value = 1300 + Math.random() * 1200;
          const crackleGain = ctx.createGain();
          crackleGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          crackleGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
          crackleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + burstDuration);
          crackle.connect(highpass);
          highpass.connect(crackleGain);
          crackleGain.connect(gainNodeRef.current);
          crackle.start(ctx.currentTime);
        }, [120, 360]);
        sources.push(crackleLayer);
      } else if (soundId === "wind") {
        const { source, output } = createFilteredNoise(ctx, 650, 3);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      } else if (soundId === "whale") {
        const whaleOsc = ctx.createOscillator();
        const whaleGain = ctx.createGain();
        const whaleLfo = ctx.createOscillator();
        const whaleLfoGain = ctx.createGain();

        whaleOsc.type = "sine";
        whaleOsc.frequency.value = 104;
        whaleGain.gain.value = 0.09;

        whaleLfo.type = "sine";
        whaleLfo.frequency.value = 0.055;
        whaleLfoGain.gain.value = 40;

        whaleLfo.connect(whaleLfoGain);
        whaleLfoGain.connect(whaleOsc.frequency);
        whaleOsc.connect(whaleGain);
        whaleGain.connect(gainNodeRef.current);

        whaleOsc.start();
        whaleLfo.start();

        sources.push({
          stop: () => {
            whaleOsc.stop();
            whaleLfo.stop();
          },
          disconnect: () => {
            whaleLfo.disconnect();
            whaleLfoGain.disconnect();
            whaleOsc.disconnect();
            whaleGain.disconnect();
          },
        });
      } else if (soundId === "dolphin") {
        const dolphinLayer = createManagedTimeout(() => {
          const call = ctx.createOscillator();
          const callGain = ctx.createGain();
          call.type = "sine";
          const start = 1100 + Math.random() * 700;
          const peak = start + 900 + Math.random() * 700;
          call.frequency.setValueAtTime(start, ctx.currentTime);
          call.frequency.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.12);
          call.frequency.exponentialRampToValueAtTime(start * 0.7, ctx.currentTime + 0.34);
          callGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          callGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.03);
          callGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36);
          call.connect(callGain);
          callGain.connect(gainNodeRef.current);
          call.start(ctx.currentTime);
          call.stop(ctx.currentTime + 0.38);
        }, [700, 2200]);
        sources.push(dolphinLayer);
      } else if (soundId === "birds") {
        const birdsOnlyLayer = createManagedTimeout(() => {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          chirp.type = "triangle";
          const start = 1700 + Math.random() * 1800;
          const end = 1100 + Math.random() * 900;
          chirp.frequency.setValueAtTime(start, ctx.currentTime);
          chirp.frequency.exponentialRampToValueAtTime(end, ctx.currentTime + 0.2);
          chirpGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          chirpGain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.02);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
          chirp.connect(chirpGain);
          chirpGain.connect(gainNodeRef.current);
          chirp.start(ctx.currentTime);
          chirp.stop(ctx.currentTime + 0.24);
        }, [600, 1600]);
        sources.push(birdsOnlyLayer);
      } else if (soundId === "chimes") {
        const chimeLayer = createManagedTimeout(() => {
          [0, 7, 12].forEach((semi, index) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            const freq = 528 * Math.pow(2, semi / 12);
            osc.type = "sine";
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.0001, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.05 / (index + 1), ctx.currentTime + 0.03 + index * 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8 + index * 0.3);
            osc.connect(g);
            g.connect(gainNodeRef.current);
            osc.start(ctx.currentTime + index * 0.01);
            osc.stop(ctx.currentTime + 2.4 + index * 0.3);
          });
        }, [4800, 9000]);
        sources.push(chimeLayer);
      } else if (soundId === "drums_gentle") {
        const drumsLayer = createManagedTimeout(() => {
          const body = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          body.type = "sine";
          body.frequency.setValueAtTime(120, ctx.currentTime);
          body.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.22);
          bodyGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          bodyGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
          bodyGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
          body.connect(bodyGain);
          bodyGain.connect(gainNodeRef.current);
          body.start(ctx.currentTime);
          body.stop(ctx.currentTime + 0.3);
        }, [680, 980]);
        sources.push(drumsLayer);
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
    if (currentlyEnabled && (oscillatorRef.current || ambientSourcesRef.current.length > 0)) {
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
