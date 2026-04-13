import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { GuidedPracticeContent } from "./guided/GuidedPracticeContent";
import {
  ELEMENT_AMBIENT,
  ELEMENT_BG,
  ELEMENT_COLOR,
  MINIMUM_NARRATION_MINUTES,
  SCRIPT_EXPANSION_TIMEOUT_MS,
  wait,
  formatTime,
  startAmbient,
  flattenTextValue,
  buildNarrationPlan,
} from "./guided/guidedNarrationUtils";

export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const narrationPlan = useMemo(() => buildNarrationPlan(practice || {}, stepsOverride), [practice, stepsOverride]);
  const totalDuration = Math.max(MINIMUM_NARRATION_MINUTES * 60, Number(practice?.duration_minutes || 20) * 60);
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

  const timerRef = useRef(null);
  const ttsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const sessionEndRef = useRef(null);
  const autoStartRef = useRef(false);
  const isPlayingRef = useRef(false);
  const ttsCacheRef = useRef(new Map());
  const ttsPendingRef = useRef(new Map());
  const currentSegmentIndexRef = useRef(0);
  const scriptAbortRef = useRef(null);
  const hasStartedRef = useRef(false);

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
      durationMinutes: practice.duration_minutes || MINIMUM_NARRATION_MINUTES,
      sourceTexts,
      steps,
    };
  }, [practice, stepsOverride]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  const stopAmbient = useCallback(() => {
    try {
      ambientRef.current?.src?.stop?.();
    } catch (_) {}
    ambientRef.current = null;
  }, []);

  const clearNarrationCache = useCallback(() => {
    ttsPendingRef.current.clear();
    ttsCacheRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (_) {}
    });
    ttsCacheRef.current.clear();
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
      ttsRef.current?.pause();
      stopAmbient();
    }
  }, [stopAmbient]);

  useEffect(() => {
    clearInterval(timerRef.current);
    sessionEndRef.current = null;
    autoStartRef.current = false;
    currentSegmentIndexRef.current = 0;
    setCurrentSegmentIndex(0);
    ttsRef.current?.pause();
    clearNarrationCache();
    scriptAbortRef.current?.abort?.();
    scriptAbortRef.current = null;
    stopAmbient();
    setIsPlaying(false);
    setTimeRemaining(totalDuration);
    setIsComplete(false);
    setTtsLoading(false);
    setTtsPlaying(false);
    setHasStarted(false);
    setAudioTapRequired(false);
    setNarrationParagraphs(narrationPlan.paragraphs);
    setNarrationSegments(narrationPlan.segments);
    setNarrationReady(true);
    setScriptLoading(Boolean(practice?.id || practice?.name));
  }, [practice?.id, practice?.name, totalDuration, clearNarrationCache, stopAmbient, narrationPlan]);

  useEffect(() => {
    if (!scriptExpansionContext) {
      setScriptLoading(false);
      setNarrationReady(false);
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
          ttsRef.current?.pause();
        }
      } catch (_) {
        // Keep local fallback narration plan when expansion fails or times out.
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
  }, [scriptExpansionContext, clearNarrationCache]);

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
    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    }
    if (ttsRef.current) ttsRef.current.muted = muted;
  }, [muted, element]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    ttsRef.current?.pause();
    scriptAbortRef.current?.abort?.();
    stopAmbient();
    clearNarrationCache();
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
  }, [clearNarrationCache, stopAmbient]);

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
          body: JSON.stringify({ text: narrationSegments[segmentIndex], voice: "nova", speed: 0.88 }),
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
    if (!narrationSegments[segmentIndex]) return;

    setTtsLoading(!ttsCacheRef.current.has(segmentIndex));
    try {
      const url = await generateSegmentUrl(segmentIndex);
      if (!url || !isPlayingRef.current) return;

      let audio = ttsRef.current;
      if (!audio) {
        audio = new Audio();
        ttsRef.current = audio;
      }

      currentSegmentIndexRef.current = segmentIndex;
      setCurrentSegmentIndex(segmentIndex);
      audio.muted = muted;
      audio.src = url;
      audio.currentTime = 0;
      audio.onplay = () => {
        setTtsPlaying(true);
        setAudioTapRequired(false);
        generateSegmentUrl(segmentIndex + 1).catch(() => {});
      };
      audio.onpause = () => setTtsPlaying(false);
      audio.onended = () => {
        setTtsPlaying(false);
        const nextIndex = segmentIndex + 1;
        currentSegmentIndexRef.current = nextIndex;
        setCurrentSegmentIndex(nextIndex);
        if (sessionEndRef.current && isPlayingRef.current && narrationSegments[nextIndex]) {
          playNarrationSegment(nextIndex);
        }
      };
      const started = await audio.play().then(() => true).catch(() => false);
      if (!started) {
        setAudioTapRequired(true);
        toast.info("Tap play once to enable guidance audio.");
      }
    } catch (_) {
      setTtsPlaying(false);
    } finally {
      setTtsLoading(false);
    }
  }, [generateSegmentUrl, muted, narrationSegments]);

  const startAmbientTrack = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        ambientRef.current = startAmbient(ctx, element);
      } catch (_) {
        return;
      }
    }

    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    }
  }, [element, muted]);

  const handlePlay = useCallback(() => {
    if (isComplete) return;

    if (isPlaying) {
      syncRemainingFromClock();
      sessionEndRef.current = null;
      setIsPlaying(false);
      ttsRef.current?.pause();
      if (ambientRef.current) ambientRef.current.gain.gain.value = 0;
      return;
    }

    sessionEndRef.current = Date.now() + (timeRemaining * 1000);
    setIsPlaying(true);
    setHasStarted(true);
    startAmbientTrack();

    if (ttsRef.current?.paused && ttsRef.current?.src) {
      ttsRef.current.play().catch(() => {});
      return;
    }

    playNarrationSegment(currentSegmentIndexRef.current);
  }, [isComplete, isPlaying, playNarrationSegment, startAmbientTrack, syncRemainingFromClock, timeRemaining]);

  useEffect(() => {
    if (practice && narrationReady && !autoStartRef.current && !isComplete) {
      autoStartRef.current = true;
      handlePlay();
    }
  }, [practice, narrationReady, isComplete, handlePlay]);

  if (!practice) return null;

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <GuidedPracticeContent
      practice={practice}
      onExit={onExit}
      muted={muted}
      setMuted={setMuted}
      isComplete={isComplete}
      bgGradient={bgGradient}
      elColor={elColor}
      timeRemaining={timeRemaining}
      hasStarted={hasStarted}
      scriptLoading={scriptLoading}
      element={element}
      progress={progress}
      ttsLoading={ttsLoading}
      audioTapRequired={audioTapRequired}
      ttsPlaying={ttsPlaying}
      currentSegmentIndex={currentSegmentIndex}
      narrationSegments={narrationSegments}
      narrationParagraphs={narrationParagraphs}
      handlePlay={handlePlay}
      isPlaying={isPlaying}
      formatTime={formatTime}
      minimumNarrationMinutes={MINIMUM_NARRATION_MINUTES}
      ambientLabel={(ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).label}
    />
  );
}
