import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import MeditationVisualizer from "./MeditationVisualizer";
import BreathingVisualizer from "./BreathingVisualizer";
import { toast } from "sonner";
import { TimerStatusPanel } from "./timer/TimerStatusPanel";
import { TimerControlsPanel } from "./timer/TimerControlsPanel";
import {
  DEFAULT_GUIDED_TTS_SPEED,
  fallbackNarrationSegments,
  MIN_NARRATION_MINUTES,
  NATURAL_SOUND_OPTIONS,
  PREFERRED_NATURAL_SOUND_KEY,
  SCRIPT_EXPANSION_TIMEOUT_MS,
  splitSentences,
  tempoPlaybackRates,
  wait,
} from "./timer/practiceTimerUtils";
import { playTimerTransitionBell, startPracticeAmbientAudio } from "./timer/timerAudioEngine";
import { getLocalItem, setLocalItem } from "../utils/clientStorage";
import { getEffectiveGuidedNarrationMode } from "../utils/guidedNarrationSettings";

const PracticeTimer = ({
  segments = [],
  totalDuration = 300,
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general",
  element = "Spirit",
  breathingPattern = null,
  visualizationType = "particles",
  allowSpeedControl = true,
  autoStartAudio = false,
  autoNarrate = true,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [tempo, setTempo] = useState("normal");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [narrationSegments, setNarrationSegments] = useState([]);
  const [narrationPreparing, setNarrationPreparing] = useState(false);
  const [narrationSegmentIndex, setNarrationSegmentIndex] = useState(0);
  const [audioTapRequired, setAudioTapRequired] = useState(false);
  const [selectedBackgroundAudio, setSelectedBackgroundAudio] = useState(() => {
    try {
      const saved = getLocalItem(PREFERRED_NATURAL_SOUND_KEY);
      if (saved && NATURAL_SOUND_OPTIONS.some((option) => option.id === saved)) {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    return backgroundAudio || "silence";
  });

  const intervalRef = useRef(null);
  const sessionEndRef = useRef(null);
  const completionRef = useRef(false);
  const autoStartedRef = useRef(false);
  const lastSegmentIndexRef = useRef(0);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourcesRef = useRef([]);
  const drumIntervalRef = useRef(null);
  const bowlIntervalRef = useRef(null);
  const ttsAudioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const ttsCacheRef = useRef(new Map());
  const ttsPendingRef = useRef(new Map());
  const narrationIndexRef = useRef(0);

  const normalizedSegments = useMemo(() => {
    if (!segments.length) return [];

    const prepared = segments.map((segment) => ({
      ...segment,
      duration_seconds: segment.duration_seconds || segment.duration || 60,
    }));
    const preparedTotal = prepared.reduce((sum, segment) => sum + segment.duration_seconds, 0);

    if (!totalDuration || totalDuration <= 0 || preparedTotal === 0 || preparedTotal === totalDuration) {
      return prepared;
    }

    const difference = totalDuration - preparedTotal;
    const lastIndex = prepared.length - 1;
    prepared[lastIndex] = {
      ...prepared[lastIndex],
      duration_seconds: Math.max(1, prepared[lastIndex].duration_seconds + difference),
    };

    return prepared;
  }, [segments, totalDuration]);

  const segmentsTotal = normalizedSegments.reduce((sum, segment) => sum + segment.duration_seconds, 0);
  const calculatedTotal = totalDuration && totalDuration > 0 ? totalDuration : (segmentsTotal || 300);

  const segmentEndTimes = useMemo(() => {
    let runningTotal = 0;
    return normalizedSegments.map((segment) => {
      runningTotal += segment.duration_seconds;
      return runningTotal;
    });
  }, [normalizedSegments]);

  const currentSegmentIndex = useMemo(() => {
    if (!normalizedSegments.length) return 0;
    const foundIndex = segmentEndTimes.findIndex((segmentEnd) => totalElapsed < segmentEnd);
    return foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
  }, [normalizedSegments, segmentEndTimes, totalElapsed]);

  const currentSegment = normalizedSegments[currentSegmentIndex];
  const currentSegmentStart = currentSegmentIndex > 0 ? segmentEndTimes[currentSegmentIndex - 1] : 0;
  const currentSegmentDuration = currentSegment?.duration_seconds || 60;
  const segmentTime = currentSegment
    ? Math.min(currentSegmentDuration, Math.max(0, totalElapsed - currentSegmentStart))
    : 0;
  const remainingTime = Math.max(0, calculatedTotal - totalElapsed);
  const overallProgress = (totalElapsed / calculatedTotal) * 100;
  const segmentProgress = currentSegment ? (segmentTime / currentSegmentDuration) * 100 : 0;

  useEffect(() => {
    if (!selectedBackgroundAudio && backgroundAudio) {
      setSelectedBackgroundAudio(backgroundAudio);
      return;
    }

    if (
      selectedBackgroundAudio === "silence"
      && backgroundAudio
      && backgroundAudio !== "silence"
      && !NATURAL_SOUND_OPTIONS.some((option) => option.id === selectedBackgroundAudio)
    ) {
      setSelectedBackgroundAudio(backgroundAudio);
    }
  }, [backgroundAudio, selectedBackgroundAudio]);

  useEffect(() => {
    if (!NATURAL_SOUND_OPTIONS.some((option) => option.id === selectedBackgroundAudio)) return;
    try {
      setLocalItem(PREFERRED_NATURAL_SOUND_KEY, selectedBackgroundAudio);
    } catch {
      // ignore localStorage errors
    }
  }, [selectedBackgroundAudio]);

  const getVisualization = () => {
    switch (practiceType) {
      case "heart": return "mandala";
      case "shamanic": return "aurora";
      case "elemental": return "element";
      case "breathwork": return "particles";
      case "chakra": return "chakra";
      default: return visualizationType;
    }
  };

  const cleanupAudio = useCallback(() => {
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
    if (bowlIntervalRef.current) {
      clearInterval(bowlIntervalRef.current);
      bowlIntervalRef.current = null;
    }
    sourcesRef.current.forEach((source) => {
      try { source.stop?.(); } catch (error) { console.error("PracticeTimer source stop failed:", error); }
      try { source.disconnect?.(); } catch (error) { console.error("PracticeTimer source disconnect failed:", error); }
    });
    sourcesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
    setAudioPlaying(false);
  }, []);

  const clearNarrationCache = useCallback(() => {
    ttsPendingRef.current.clear();
    ttsCacheRef.current.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    ttsCacheRef.current.clear();
  }, []);

  const stopNarrationPlayback = useCallback((resetIndex = false) => {
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    ttsAudioRef.current?.pause();
    if (ttsAudioRef.current) ttsAudioRef.current.onended = null;
    if (resetIndex) {
      narrationIndexRef.current = 0;
      setNarrationSegmentIndex(0);
    }
  }, []);

  const fetchNarrationAudioUrl = useCallback(async (index, text, controller) => {
    const cacheKey = `${index}::${text}`;
    if (ttsCacheRef.current.has(cacheKey)) return ttsCacheRef.current.get(cacheKey);

    if (ttsPendingRef.current.has(cacheKey)) {
      return ttsPendingRef.current.get(cacheKey);
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const pending = (async () => {
      let data = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(`${backendUrl}/api/tts/generate-base64`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: "nova", speed: DEFAULT_GUIDED_TTS_SPEED }),
          signal: controller.signal,
        });
        if (response.ok) {
          data = await response.json();
          if (data?.audio_base64) break;
        }
        if (controller.signal.aborted) break;
        await wait(300 * (attempt + 1));
      }
      return data;
    })()
      .then((data) => {
        if (!data?.audio_base64) throw new Error("No audio payload");
        const binary = atob(data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let position = 0; position < binary.length; position += 1) {
          bytes[position] = binary.charCodeAt(position);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        ttsCacheRef.current.set(cacheKey, url);
        return url;
      })
      .finally(() => {
        ttsPendingRef.current.delete(cacheKey);
      });

    ttsPendingRef.current.set(cacheKey, pending);
    return pending;
  }, []);

  const playNarrationSegment = useCallback(async (index) => {
    if (!autoNarrate || !narrationSegments.length || index >= narrationSegments.length) return;

    const text = String(narrationSegments[index] || "").trim();
    if (!text) {
      narrationIndexRef.current = index + 1;
      setNarrationSegmentIndex(index + 1);
      if (isRunning) playNarrationSegment(index + 1);
      return;
    }

    if (ttsAbortRef.current) ttsAbortRef.current.abort();
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    setTtsLoading(true);

    try {
      const url = await fetchNarrationAudioUrl(index, text, controller);
      if (controller.signal.aborted || !isRunning) return;

      const nextText = String(narrationSegments[index + 1] || "").trim();
      if (nextText) {
        fetchNarrationAudioUrl(index + 1, nextText, controller).catch(() => {});
      }

      narrationIndexRef.current = index;
      setNarrationSegmentIndex(index);

      const player = ttsAudioRef.current;
      if (!player) return;
      player.src = url;
      player.playbackRate = tempoPlaybackRates[tempo] || 1;
      player.muted = isMuted;
      player.onended = () => {
        const nextIndex = narrationIndexRef.current + 1;
        narrationIndexRef.current = nextIndex;
        setNarrationSegmentIndex(nextIndex);
        if (isRunning) playNarrationSegment(nextIndex);
      };
      const started = await player.play().then(() => true).catch(() => false);
      if (!started) {
        setAudioTapRequired(true);
        toast.info("Tap play once to enable voice guidance.");
      } else {
        setAudioTapRequired(false);
      }
    } catch (_) {
      // Ignore transient narration errors.
    } finally {
      if (ttsAbortRef.current === controller) ttsAbortRef.current = null;
      setTtsLoading(false);
    }
  }, [autoNarrate, fetchNarrationAudioUrl, isMuted, isRunning, narrationSegments, tempo]);

  const startAudio = useCallback(() => {
    startPracticeAmbientAudio({
      selectedBackgroundAudio,
      isMuted,
      audioVolume,
      audioContextRef,
      gainNodeRef,
      sourcesRef,
      drumIntervalRef,
      bowlIntervalRef,
      setAudioPlaying,
    });
  }, [audioVolume, isMuted, selectedBackgroundAudio]);

  const playTransitionBell = useCallback(() => {
    playTimerTransitionBell();
  }, []);

  const syncElapsedFromClock = useCallback(() => {
    if (!sessionEndRef.current) return;

    const nextRemaining = Math.max(0, Math.ceil((sessionEndRef.current - Date.now()) / 1000));
    const nextElapsed = Math.min(calculatedTotal, calculatedTotal - nextRemaining);

    if (normalizedSegments.length > 0) {
      const foundIndex = segmentEndTimes.findIndex((segmentEnd) => nextElapsed < segmentEnd);
      const nextSegmentIndex = foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
      if (nextSegmentIndex !== lastSegmentIndexRef.current && nextElapsed < calculatedTotal) {
        if (!isMuted) playTransitionBell();
        lastSegmentIndexRef.current = nextSegmentIndex;
      }
    }

    setTotalElapsed(nextElapsed);

    if (nextElapsed >= calculatedTotal && !completionRef.current) {
      completionRef.current = true;
      sessionEndRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      cleanupAudio();
      ttsAudioRef.current?.pause();
      narrationIndexRef.current = 0;
      setNarrationSegmentIndex(0);
      if (!isMuted) playTransitionBell();
      onComplete?.();
    }
  }, [calculatedTotal, cleanupAudio, isMuted, normalizedSegments.length, onComplete, playTransitionBell, segmentEndTimes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(syncElapsedFromClock, 250);
      syncElapsedFromClock();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, syncElapsedFromClock]);

  useEffect(() => {
    if (autoStartAudio && !isRunning && !autoStartedRef.current && calculatedTotal > 0) {
      autoStartedRef.current = true;
      completionRef.current = false;
      lastSegmentIndexRef.current = currentSegmentIndex;
      sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
      setIsRunning(true);
    }
  }, [autoStartAudio, calculatedTotal, currentSegmentIndex, isRunning, totalElapsed]);

  useEffect(() => {
    if (isRunning && !isMuted && selectedBackgroundAudio !== "silence") {
      if (!audioPlaying) startAudio();
    } else {
      cleanupAudio();
    }
  }, [audioPlaying, cleanupAudio, isMuted, isRunning, selectedBackgroundAudio, startAudio]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : audioVolume * 0.5;
    }
  }, [audioVolume, isMuted]);

  useEffect(() => {
    if (!autoNarrate) {
      setNarrationSegments([]);
      setNarrationPreparing(false);
      setAudioTapRequired(false);
      narrationIndexRef.current = 0;
      setNarrationSegmentIndex(0);
      return;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const steps = normalizedSegments
      .map((segment) => [segment.name, segment.description].filter(Boolean).join(": "))
      .filter(Boolean)
      .slice(0, 48);
    const sourceTexts = normalizedSegments
      .flatMap((segment) => [segment.description, segment.name])
      .flatMap((value) => splitSentences(value))
      .filter(Boolean)
      .slice(0, 96);

    const fallback = fallbackNarrationSegments(normalizedSegments);
    if (!steps.length && !sourceTexts.length && !fallback.length) {
      setNarrationSegments([]);
      setNarrationPreparing(false);
      setAudioTapRequired(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SCRIPT_EXPANSION_TIMEOUT_MS);

    clearNarrationCache();
    stopNarrationPlayback(true);
    setNarrationSegments(fallback);
    setNarrationPreparing(true);
    setTtsLoading(false);
    setAudioTapRequired(false);

    fetch(`${backendUrl}/api/content/expand-script`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        practice_name: normalizedSegments[0]?.name || `${practiceType} practice`,
        element,
        duration_minutes: Math.max(MIN_NARRATION_MINUTES, Math.ceil(calculatedTotal / 60)),
        use_ai: false,
        anti_repetition_mode: getEffectiveGuidedNarrationMode({
          practiceName: normalizedSegments[0]?.name,
          practiceType,
          element,
          sourceTexts,
          steps,
        }),
        steps,
        source_texts: sourceTexts,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        const expanded = Array.isArray(data?.segments) ? data.segments.filter(Boolean) : [];
        if (expanded.length && narrationIndexRef.current <= 0) {
          clearNarrationCache();
          stopNarrationPlayback(true);
          setNarrationSegments(expanded);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        // Keep already-loaded fallback narration when expansion fails.
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) setNarrationPreparing(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [autoNarrate, calculatedTotal, clearNarrationCache, element, normalizedSegments, practiceType, stopNarrationPlayback]);

  useEffect(() => {
    if (!autoNarrate || narrationPreparing) return;
    if (isRunning && narrationSegments.length > 0) {
      playNarrationSegment(Math.min(narrationIndexRef.current, narrationSegments.length - 1));
      return;
    }
    ttsAudioRef.current?.pause();
  }, [autoNarrate, isRunning, narrationPreparing, narrationSegments, playNarrationSegment]);

  useEffect(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.playbackRate = tempoPlaybackRates[tempo] || 1;
      ttsAudioRef.current.muted = isMuted;
    }
  }, [isMuted, tempo]);

  useEffect(() => () => {
    if (ttsAbortRef.current) ttsAbortRef.current.abort();
    stopNarrationPlayback(true);
    clearNarrationCache();
    cleanupAudio();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [cleanupAudio, clearNarrationCache, stopNarrationPlayback]);

  const warmAudioContext = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!window.__warmAudioCtx || window.__warmAudioCtx.state === "closed") {
        const ctx = new AC();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        window.__warmAudioCtx = ctx;
      }
    } catch (error) {
      console.error("PracticeTimer audio warm-up failed:", error);
    }
  };

  const handlePlayPause = () => {
    if (isRunning) {
      syncElapsedFromClock();
      sessionEndRef.current = null;
      setIsRunning(false);
      stopNarrationPlayback(false);
      cleanupAudio();
      return;
    }

    warmAudioContext();
    completionRef.current = false;
    lastSegmentIndexRef.current = currentSegmentIndex;
    sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
    setIsRunning(true);
  };

  const handleReset = () => {
    sessionEndRef.current = null;
    completionRef.current = false;
    lastSegmentIndexRef.current = 0;
    setIsRunning(false);
    setTotalElapsed(0);
    stopNarrationPlayback(true);
    setAudioTapRequired(false);
    cleanupAudio();
  };

  const handleSkipSegment = () => {
    if (currentSegmentIndex >= normalizedSegments.length - 1) return;

    const nextElapsed = segmentEndTimes[currentSegmentIndex];
    setTotalElapsed(nextElapsed);
    lastSegmentIndexRef.current = currentSegmentIndex + 1;
    if (isRunning) {
      sessionEndRef.current = Date.now() + ((calculatedTotal - nextElapsed) * 1000);
    }
    if (!isMuted) playTransitionBell();
  };

  return (
    <div className="relative bg-card/50 border border-white/10 rounded-2xl p-6 space-y-6 overflow-hidden">
      {showVisuals && (
        <MeditationVisualizer
          type={getVisualization()}
          element={element}
          isActive={isRunning}
          intensity={0.4}
          className="opacity-50"
        />
      )}

      {breathingPattern && isRunning && (
        <div className="flex justify-center py-4">
          <BreathingVisualizer
            pattern={breathingPattern}
            isActive={isRunning}
            size={150}
            color={element.toLowerCase()}
          />
        </div>
      )}

      <TimerStatusPanel
        remainingTime={remainingTime}
        currentSegment={currentSegment}
        currentSegmentIndex={currentSegmentIndex}
        normalizedSegments={normalizedSegments}
        currentSegmentDuration={currentSegmentDuration}
        segmentTime={segmentTime}
        segmentProgress={segmentProgress}
        overallProgress={overallProgress}
        isMuted={isMuted}
        audioPlaying={audioPlaying}
        autoNarrate={autoNarrate}
        ttsLoading={ttsLoading}
        narrationPreparing={narrationPreparing}
        audioTapRequired={audioTapRequired}
        narrationSegmentIndex={narrationSegmentIndex}
        narrationSegments={narrationSegments}
        selectedBackgroundAudio={selectedBackgroundAudio}
      />

      <TimerControlsPanel
        isRunning={isRunning}
        handleReset={handleReset}
        handlePlayPause={handlePlayPause}
        normalizedSegments={normalizedSegments}
        currentSegmentIndex={currentSegmentIndex}
        handleSkipSegment={handleSkipSegment}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        showVisuals={showVisuals}
        setShowVisuals={setShowVisuals}
        allowSpeedControl={allowSpeedControl}
        tempo={tempo}
        setTempo={setTempo}
        selectedBackgroundAudio={selectedBackgroundAudio}
        setSelectedBackgroundAudio={setSelectedBackgroundAudio}
        NATURAL_SOUND_OPTIONS={NATURAL_SOUND_OPTIONS}
        audioVolume={audioVolume}
        setAudioVolume={setAudioVolume}
      />

      {autoNarrate && <audio ref={ttsAudioRef} style={{ display: "none" }} />}
    </div>
  );
};

export default PracticeTimer;
