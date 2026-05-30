import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_GUIDED_TTS_SPEED, startToningLayer } from "./guidedNarrationUtils";
import { getEffectiveGuidedNarrationMode } from "../../utils/guidedNarrationSettings";
import { appLogger } from "../../utils/logger";

const MIN_NARRATION_MINUTES = 7;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const splitSentences = (text) => String(text || "").split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter((line) => line.length > 12);
const extractStepsFromScript = (script) => {
  const stepMatches = String(script || "").match(/Step\s*\d+\s*:\s*[^.?!]+(?:[.?!]|$)/gi) || [];
  return stepMatches.map((line) => line.replace(/^\s*Step\s*\d+\s*:\s*/i, "").trim()).filter(Boolean).slice(0, 24);
};
const estimateMinutes = (script, providedMinutes) => {
  if (Number.isFinite(Number(providedMinutes)) && Number(providedMinutes) > 0) {
    return Math.max(MIN_NARRATION_MINUTES, Math.round(Number(providedMinutes)));
  }
  const words = String(script || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(MIN_NARRATION_MINUTES, Math.ceil(words / 120) || MIN_NARRATION_MINUTES);
};

export const useGuidedAudioPlayback = ({
  api,
  script,
  label,
  voice,
  practiceName,
  durationMinutes,
  element,
  sourceTexts,
  steps,
}) => {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const toningLayerRef = useRef(null);
  const abortRef = useRef(null);
  const isStoppedRef = useRef(false);
  const segmentCacheRef = useRef(new Map());
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const playbackConfigRef = useRef({
    script,
    sourceTexts,
    steps,
    practiceName,
    label,
    element,
    durationMinutes,
  });

  useEffect(() => {
    playbackConfigRef.current = {
      script,
      sourceTexts,
      steps,
      practiceName,
      label,
      element,
      durationMinutes,
    };
  }, [durationMinutes, element, label, practiceName, script, sourceTexts, steps]);

  const stopToning = useCallback(() => {
    try {
      toningLayerRef.current?.stop?.();
    } catch (error) {
      appLogger.warn("Guided toning cleanup failed", error);
    }
    toningLayerRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch((error) => {
        appLogger.debug("Guided audio context close warning", error);
      });
    }
    audioContextRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    isStoppedRef.current = true;
    abortRef.current?.abort?.();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    stopToning();
    setPlaying(false);
    setLoading(false);
  }, [stopToning]);

  useEffect(() => () => {
    isStoppedRef.current = true;
    abortRef.current?.abort?.();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    segmentCacheRef.current.clear();
    stopToning();
  }, [stopToning]);

  const getSegmentAudio = useCallback(async (segmentText, controller) => {
    const key = `${voice}::${segmentText}`;
    if (segmentCacheRef.current.has(key)) return segmentCacheRef.current.get(key);

    let response = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await api.post("/tts/generate-base64", { text: segmentText, voice, speed: DEFAULT_GUIDED_TTS_SPEED }, { signal: controller.signal });
        if (response?.data?.audio_base64) break;
      } catch (error) {
        lastError = error;
      }
      if (controller.signal.aborted) break;
      await wait(350 * (attempt + 1));
    }

    if (!response?.data?.audio_base64) {
      throw lastError || new Error("Missing audio payload");
    }

    const url = `data:audio/mp3;base64,${response.data.audio_base64}`;
    segmentCacheRef.current.set(key, url);
    return url;
  }, [api, voice]);

  const buildExpandedSegments = useCallback(async (controller) => {
    const {
      script: currentScript,
      sourceTexts: currentSourceTexts,
      steps: currentSteps,
      practiceName: currentPracticeName,
      label: currentLabel,
      element: currentElement,
      durationMinutes: currentDurationMinutes,
    } = playbackConfigRef.current;

    const mergedSources = [currentScript, ...currentSourceTexts].flatMap((value) => splitSentences(value)).filter(Boolean).slice(0, 80);
    const mergedSteps = [...currentSteps, ...extractStepsFromScript(currentScript)].flatMap((value) => splitSentences(value)).filter(Boolean).slice(0, 32);

    const payload = {
      practice_name: currentPracticeName || currentLabel || "Guided Practice",
      element: currentElement,
      duration_minutes: estimateMinutes(currentScript, currentDurationMinutes),
      use_ai: false,
      anti_repetition_mode: getEffectiveGuidedNarrationMode({
        practiceName: currentPracticeName || currentLabel,
        element: currentElement,
        sourceTexts: mergedSources,
        steps: mergedSteps,
      }),
      include_toning: true,
      source_texts: mergedSources,
      steps: mergedSteps,
    };

    const fallback = String(currentScript || "").trim();
    try {
      let timerId;
      const timeoutPromise = new Promise((_, reject) => {
        timerId = window.setTimeout(() => reject(new Error("Script expansion timeout")), 16000);
      });

      const response = await Promise.race([
        api.post("/content/expand-script", payload, { signal: controller.signal }),
        timeoutPromise,
      ]);
      window.clearTimeout(timerId);

      const segments = Array.isArray(response?.data?.segments) ? response.data.segments.filter(Boolean) : [];
      return segments.length > 0 ? segments : (fallback ? [fallback] : []);
    } catch (error) {
      appLogger.warn("Guided script expansion fallback engaged", error);
      return fallback ? [fallback] : [];
    }
  }, [api]);

  const playSegmentsSequentially = useCallback(async (segments, controller) => {
    if (!segments.length) throw new Error("No narration segments available");

    const playIndex = async (index) => {
      if (isStoppedRef.current || controller.signal.aborted || index >= segments.length) {
        stopToning();
        setPlaying(false);
        setLoading(false);
        return;
      }

      const segmentText = String(segments[index] || "").trim();
      if (!segmentText) {
        await playIndex(index + 1);
        return;
      }

      const audioUrl = await getSegmentAudio(segmentText, controller);
      if (isStoppedRef.current || controller.signal.aborted) return;

      const nextText = String(segments[index + 1] || "").trim();
      if (nextText) {
        getSegmentAudio(nextText, controller).catch((error) => {
          appLogger.debug("Guided prefetch segment failed", error);
        });
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      toningLayerRef.current?.setMuted?.(false, 0.14);
      audio.onerror = () => {
        toast.error("Audio playback error");
        stopPlayback();
      };
      audio.onended = () => {
        toningLayerRef.current?.setMuted?.(false, 0.32);
        playIndex(index + 1).catch(() => stopPlayback());
      };

      const started = await audio.play().then(() => true).catch(() => {
        toast.info("Tap play to start audio");
        return false;
      });

      if (!started) {
        toningLayerRef.current?.setMuted?.(false, 0.32);
        stopToning();
        setPlaying(false);
        setLoading(false);
        return;
      }
      setPlaying(true);
      setLoading(false);
    };

    await playIndex(0);
  }, [getSegmentAudio, stopPlayback, stopToning]);

  const setupToningContext = useCallback(async () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      const ctx = new AC();
      if (ctx.state === "suspended") await ctx.resume();
      audioContextRef.current = ctx;

      const elementKey = String(playbackConfigRef.current.element || "spirit").toLowerCase();
      toningLayerRef.current = startToningLayer(ctx, elementKey);
      toningLayerRef.current?.setMuted?.(false, 0.32);
    } catch (error) {
      appLogger.warn("Guided toning context setup failed", error);
      stopToning();
    }
  }, [stopToning]);

  const handlePlay = useCallback(async () => {
    if (playing) {
      stopPlayback();
      return;
    }

    isStoppedRef.current = false;
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    await setupToningContext();

    try {
      const expandedSegments = await buildExpandedSegments(controller);
      await playSegmentsSequentially(expandedSegments, controller);
    } catch (error) {
      if (!controller.signal.aborted && !isStoppedRef.current) {
        appLogger.error("Guided TTS playback failed", error);
        toast.info("Guided audio unavailable — please try again shortly");
        setPlaying(false);
        setLoading(false);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [buildExpandedSegments, playSegmentsSequentially, playing, setupToningContext, stopPlayback]);

  return {
    loading,
    playing,
    handlePlay,
  };
};
