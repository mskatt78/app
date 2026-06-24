import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  ELEMENT_AMBIENT,
  ELEMENT_BG,
  ELEMENT_COLOR,
  DEFAULT_GUIDED_TTS_SPEED,
  MINIMUM_NARRATION_MINUTES,
  SCRIPT_EXPANSION_TIMEOUT_MS,
  wait,
  startAmbient,
  startToningLayer,
  flattenTextValue,
  buildNarrationPlan,
} from "./guidedNarrationUtils";
import { resolveDurationMinutes } from "../../utils/durationUtils";
import {
  getGuidedNarrationMode,
  getEffectiveGuidedNarrationMode,
  setGuidedNarrationMode,
} from "../../utils/guidedNarrationSettings";
import { getGuidedToningMultiplier } from "../../utils/guidedToningSettings";
import { appLogger } from "../../utils/logger";

export const useGuidedPracticeEngine = ({ practice, stepsOverride }) => {
  const narrationPlan = useMemo(() => buildNarrationPlan(practice || {}, stepsOverride), [practice, stepsOverride]);
  const defaultDurationMinutes = practice?.category === "shamanic" ? 30 : 20;
  const resolvedDurationMinutes = resolveDurationMinutes(
    practice?.duration_minutes ?? practice?.duration,
    defaultDurationMinutes,
  );
  const totalDuration = Math.max(
    MINIMUM_NARRATION_MINUTES * 60,
    resolvedDurationMinutes * 60,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(totalDuration);
  const [isComplete, setIsComplete] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [narrationParagraphs, setNarrationParagraphs] = useState(narrationPlan.paragraphs);
  const [narrationSegments, setNarrationSegments] = useState(narrationPlan.segments);
  const [narrationReady, setNarrationReady] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [audioTapRequired, setAudioTapRequired] = useState(false);
  const [selectedNarrationMode, setSelectedNarrationMode] = useState(() => getGuidedNarrationMode());
  const [toningActive, setToningActive] = useState(false);

  const timerRef = useRef(null);
  const ttsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const toningRef = useRef(null);
  const sessionEndRef = useRef(null);
  const autoStartRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isCompleteRef = useRef(false);
  const timeRemainingRef = useRef(totalDuration);
  const ttsCacheRef = useRef(new Map());
  const ttsPendingRef = useRef(new Map());
  const currentSegmentIndexRef = useRef(0);
  const scriptAbortRef = useRef(null);
  const hasStartedRef = useRef(false);
  const narrationPlanRef = useRef(narrationPlan);
  const practiceIdentityRef = useRef({ id: practice?.id, name: practice?.name });
  const narrationRunIdRef = useRef(0);

  const element = (practice?.element || "spirit").toLowerCase();
  const bgGradient = ELEMENT_BG[element] || ELEMENT_BG.spirit;
  const elColor = ELEMENT_COLOR[element] || ELEMENT_COLOR.spirit;

  const scriptExpansionContext = useMemo(() => {
    if (!practice) return null;

    const sourceTexts = Array.from(new Set(
      [
        practice.description,
        practice.why_this_heals,
        practice.practice_guide,
        practice.guidance,
        practice.spiritual_purpose,
        practice.extended_teachings,
        practice.meditation,
        practice.visualization,
        practice.activation,
        practice.affirmations,
        practice.benefits,
        practice.therapeutic_benefits,
        stepsOverride,
        practice.steps,
        practice.process_steps,
        practice.cleansing_guide,
        practice.instructions,
      ].flatMap(flattenTextValue).filter(Boolean)
    )).slice(0, 80);

    const steps = Array.from(new Set(
      [stepsOverride, practice.steps, practice.process_steps, practice.cleansing_guide, practice.instructions]
        .flatMap(flattenTextValue)
        .filter(Boolean)
    )).slice(0, 40);

    return {
      practiceId: practice.id || null,
      practiceName: practice.name || "Guided Practice",
      element: practice.element || "Spirit",
      durationMinutes: resolvedDurationMinutes,
      sourceTexts,
      steps,
    };
  }, [practice, resolvedDurationMinutes, stepsOverride]);

  const antiRepetitionMode = useMemo(() => {
    if (!scriptExpansionContext) {
      return selectedNarrationMode;
    }

    return getEffectiveGuidedNarrationMode({
      practiceName: scriptExpansionContext.practiceName,
      element: scriptExpansionContext.element,
      sourceTexts: scriptExpansionContext.sourceTexts,
      steps: scriptExpansionContext.steps,
    });
  }, [scriptExpansionContext, selectedNarrationMode]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  useEffect(() => {
    narrationPlanRef.current = narrationPlan;
    practiceIdentityRef.current = { id: practice?.id, name: practice?.name };
  }, [narrationPlan, practice?.id, practice?.name]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "guided_narration_mode" || event.key === "guided_narration_manual_override") {
        setSelectedNarrationMode(getGuidedNarrationMode());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleAntiRepetitionModeChange = useCallback((mode) => {
    const nextMode = setGuidedNarrationMode(mode);
    setSelectedNarrationMode(nextMode);
    toast.success(`Narration mode: ${nextMode === "strict" ? "Strict" : "Balanced"}`);
  }, []);

  const stopAmbient = useCallback(() => {
    try {
      ambientRef.current?.src?.stop?.();
    } catch (error) {
      appLogger.warn("Guided overlay ambient stop failed", error);
    }
    ambientRef.current = null;
  }, []);

  const stopToning = useCallback(() => {
    try {
      toningRef.current?.stop?.();
    } catch (error) {
      appLogger.warn("Guided overlay toning stop failed", error);
    }
    toningRef.current = null;
  }, []);

  const clearNarrationCache = useCallback(() => {
    ttsPendingRef.current.clear();
    ttsCacheRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (error) { appLogger.warn("Guided overlay URL revoke failed", error); }
    });
    ttsCacheRef.current.clear();
  }, []);

  const stopNarrationPlayback = useCallback((resetIndex = false) => {
    narrationRunIdRef.current += 1;
    setTtsPlaying(false);
    setTtsLoading(false);
    setAudioTapRequired(false);
    if (ttsRef.current) {
      ttsRef.current.onplay = null;
      ttsRef.current.onpause = null;
      ttsRef.current.onended = null;
      ttsRef.current.pause();
      if (resetIndex) {
        ttsRef.current.currentTime = 0;
      }
    }
    if (resetIndex) {
      currentSegmentIndexRef.current = 0;
      setCurrentSegmentIndex(0);
    }
  }, []);

  const syncRemainingFromClock = useCallback(() => {
    if (!sessionEndRef.current) return;

    const nextRemaining = Math.max(0, Math.ceil((sessionEndRef.current - Date.now()) / 1000));
    setTimeRemaining(nextRemaining);

    if (nextRemaining <= 0) {
      clearInterval(timerRef.current);
      sessionEndRef.current = null;
      setIsPlaying(false);
      setIsComplete(true);
      stopNarrationPlayback(false);
      stopAmbient();
      stopToning();
    }
  }, [stopAmbient, stopNarrationPlayback, stopToning]);

  const resetPracticeState = useCallback(() => {
    clearInterval(timerRef.current);
    sessionEndRef.current = null;
    autoStartRef.current = false;
    currentSegmentIndexRef.current = 0;
    setCurrentSegmentIndex(0);
    stopNarrationPlayback(true);
    clearNarrationCache();
    scriptAbortRef.current?.abort?.();
    scriptAbortRef.current = null;
    stopAmbient();
    stopToning();
    setIsPlaying(false);
    setTimeRemaining(totalDuration);
    timeRemainingRef.current = totalDuration;
    setIsComplete(false);
    setTtsLoading(false);
    setTtsPlaying(false);
    setHasStarted(false);
    setAudioTapRequired(false);
    setNarrationParagraphs(narrationPlanRef.current.paragraphs);
    setNarrationSegments(narrationPlanRef.current.segments);
    setNarrationReady(true);
    setScriptLoading(Boolean(practiceIdentityRef.current.id || practiceIdentityRef.current.name));
  }, [clearNarrationCache, stopAmbient, stopNarrationPlayback, stopToning, totalDuration]);

  const practiceKey = `${practice?.id || ""}:${practice?.name || ""}`;

  useEffect(() => {
    resetPracticeState();
  }, [practiceKey, resetPracticeState]);

  useEffect(() => {
    if (!scriptExpansionContext) {
      setScriptLoading(false);
      setNarrationReady(true);
      return undefined;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      setScriptLoading(false);
      setNarrationReady(true);
      return undefined;
    }

    const controller = new AbortController();
    scriptAbortRef.current?.abort?.();
    scriptAbortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), SCRIPT_EXPANSION_TIMEOUT_MS);

    const expandScript = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/content/expand-script`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            practice_id: scriptExpansionContext.practiceId,
            practice_name: scriptExpansionContext.practiceName,
            element: scriptExpansionContext.element,
            duration_minutes: scriptExpansionContext.durationMinutes,
            use_ai: false,
            include_toning: true,
            anti_repetition_mode: antiRepetitionMode,
            steps: scriptExpansionContext.steps,
            source_texts: scriptExpansionContext.sourceTexts,
          }),
        });

        if (!response.ok || controller.signal.aborted) return;
        const data = await response.json();
        const nextParagraphs = Array.isArray(data?.paragraphs) ? data.paragraphs.filter(Boolean) : [];
        const nextSegments = Array.isArray(data?.segments) ? data.segments.filter(Boolean) : [];

        if (nextParagraphs.length > 0 && nextSegments.length > 0 && !hasStartedRef.current && !isPlayingRef.current) {
          setNarrationParagraphs(nextParagraphs);
          setNarrationSegments(nextSegments);
          currentSegmentIndexRef.current = 0;
          setCurrentSegmentIndex(0);
          clearNarrationCache();
          stopNarrationPlayback(true);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          appLogger.warn("Guided script expansion fallback engaged in overlay engine", error);
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) {
          setScriptLoading(false);
          setNarrationReady(true);
        }
        if (scriptAbortRef.current === controller) {
          scriptAbortRef.current = null;
        }
      }
    };

    expandScript();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      if (scriptAbortRef.current === controller) {
        scriptAbortRef.current = null;
      }
    };
  }, [scriptExpansionContext, clearNarrationCache, antiRepetitionMode, stopNarrationPlayback]);

  useEffect(() => {
    if (isPlaying && !isComplete) {
      timerRef.current = setInterval(syncRemainingFromClock, 250);
      syncRemainingFromClock();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, isComplete, syncRemainingFromClock]);

  useEffect(() => {
    const baseAmbientGain = (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    const narrationDuckMultiplier = ttsPlaying ? 0.22 : 1;

    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : baseAmbientGain * narrationDuckMultiplier;
    }

    if (toningRef.current) {
      if (muted) {
        toningRef.current.setMuted?.(true, 1);
      } else {
        const toningMix = ttsPlaying ? 0 : 0.38;
        toningRef.current.setMuted?.(false, toningMix);
      }
    }

    if (ttsRef.current) ttsRef.current.muted = muted;
    const hasToningLayer = Boolean(toningRef.current);
    const toningEnabled = getGuidedToningMultiplier() > 0;
    setToningActive(hasToningLayer && !muted && isPlaying && toningEnabled);
  }, [muted, element, ttsPlaying, isPlaying]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    stopNarrationPlayback(false);
    scriptAbortRef.current?.abort?.();
    stopAmbient();
    stopToning();
    clearNarrationCache();
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
  }, [clearNarrationCache, stopAmbient, stopNarrationPlayback, stopToning]);

  const generateSegmentUrl = useCallback(async (segmentIndex) => {
    if (!narrationSegments[segmentIndex]) return null;
    if (ttsCacheRef.current.has(segmentIndex)) return ttsCacheRef.current.get(segmentIndex);
    if (ttsPendingRef.current.has(segmentIndex)) return ttsPendingRef.current.get(segmentIndex);

    const promise = (async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      let data = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(`${backendUrl}/api/tts/generate-base64`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: narrationSegments[segmentIndex], voice: "nova", speed: DEFAULT_GUIDED_TTS_SPEED }),
        });
        if (response.ok) {
          data = await response.json();
          if (data?.audio_base64) break;
        }
        await wait(300 * (attempt + 1));
      }

      if (!data?.audio_base64) return null;
      const binary = atob(data.audio_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      ttsCacheRef.current.set(segmentIndex, url);
      return url;
    })().finally(() => {
      ttsPendingRef.current.delete(segmentIndex);
    });

    ttsPendingRef.current.set(segmentIndex, promise);
    return promise;
  }, [narrationSegments]);

  const playNarrationSegment = useCallback(async (segmentIndex) => {
    const activeRunId = narrationRunIdRef.current;
    if (!narrationSegments[segmentIndex]) return;

    setTtsLoading(!ttsCacheRef.current.has(segmentIndex));
    try {
      const url = await generateSegmentUrl(segmentIndex);
      if (!url || !isPlayingRef.current || activeRunId !== narrationRunIdRef.current) return;

      generateSegmentUrl(segmentIndex + 1).catch((error) => {
        appLogger.debug("Guided segment prefetch warmup failed", error);
      });

      let audio = ttsRef.current;
      if (!audio) {
        audio = new Audio();
        audio.preload = "auto";
        ttsRef.current = audio;
      }

      audio.pause();
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;

      currentSegmentIndexRef.current = segmentIndex;
      setCurrentSegmentIndex(segmentIndex);
      audio.muted = muted;
      audio.src = url;
      audio.currentTime = 0;
      audio.onplay = () => {
        if (activeRunId !== narrationRunIdRef.current) return;
        setTtsPlaying(true);
        setAudioTapRequired(false);
        generateSegmentUrl(segmentIndex + 1).catch((error) => {
          appLogger.debug("Guided segment prefetch onplay failed", error);
        });
      };
      audio.onpause = () => {
        if (activeRunId !== narrationRunIdRef.current) return;
        setTtsPlaying(false);
      };
      audio.onended = () => {
        if (activeRunId !== narrationRunIdRef.current) return;
        setTtsPlaying(false);
        const nextIndex = segmentIndex + 1;
        currentSegmentIndexRef.current = nextIndex;
        setCurrentSegmentIndex(nextIndex);
        if (sessionEndRef.current && isPlayingRef.current && narrationSegments[nextIndex]) {
          playNarrationSegment(nextIndex);
        }
      };
      const started = await audio.play().then(() => true).catch(() => false);
      if (activeRunId !== narrationRunIdRef.current) return;
      if (!started) {
        setAudioTapRequired(true);
        toast.info("Tap play once to enable guidance audio.");
      }
    } catch (error) {
      appLogger.warn("Guided narration segment playback failed", error);
      setTtsPlaying(false);
    } finally {
      if (activeRunId === narrationRunIdRef.current) {
        setTtsLoading(false);
      }
    }
  }, [generateSegmentUrl, muted, narrationSegments]);

  const startAmbientTrack = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        ambientRef.current = startAmbient(ctx, element);
        toningRef.current = startToningLayer(ctx, element);
      } catch (error) {
        appLogger.warn("Guided ambient track setup failed", error);
        return;
      }
    }

    const baseAmbientGain = (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    const narrationDuckMultiplier = ttsPlaying ? 0.22 : 1;

    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : baseAmbientGain * narrationDuckMultiplier;
    }
    if (!toningRef.current && audioCtxRef.current) {
      toningRef.current = startToningLayer(audioCtxRef.current, element);
    }
    if (toningRef.current) {
      if (muted) {
        toningRef.current.setMuted?.(true, 1);
      } else {
        toningRef.current.setMuted?.(false, ttsPlaying ? 0 : 0.38);
      }
    }
  }, [element, muted, ttsPlaying]);

  const handlePlay = useCallback(() => {
    if (isCompleteRef.current) return;

    if (isPlaying) {
      syncRemainingFromClock();
      sessionEndRef.current = null;
      setIsPlaying(false);
      stopNarrationPlayback(false);
      if (ambientRef.current) ambientRef.current.gain.gain.value = 0;
      toningRef.current?.setMuted?.(true, 1);
      return;
    }

    narrationRunIdRef.current += 1;
    sessionEndRef.current = Date.now() + (timeRemainingRef.current * 1000);
    setIsPlaying(true);
    setHasStarted(true);
    startAmbientTrack();

    playNarrationSegment(currentSegmentIndexRef.current);
  }, [isPlaying, playNarrationSegment, startAmbientTrack, stopNarrationPlayback, syncRemainingFromClock]);

  useEffect(() => {
    if (practice && narrationReady && !autoStartRef.current && !isComplete) {
      autoStartRef.current = true;
      handlePlay();
    }
  }, [practice, narrationReady, isComplete, handlePlay]);

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return {
    element,
    bgGradient,
    elColor,
    muted,
    setMuted,
    isComplete,
    timeRemaining,
    hasStarted,
    scriptLoading,
    progress,
    ttsLoading,
    audioTapRequired,
    ttsPlaying,
    currentSegmentIndex,
    narrationSegments,
    narrationParagraphs,
    handlePlay,
    isPlaying,
    ambientLabel: (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).label,
    toningLabel: ttsPlaying ? "Toning layer ducked during voice" : "Toning layer active",
    toningActive,
    antiRepetitionMode,
    handleAntiRepetitionModeChange,
  };
};