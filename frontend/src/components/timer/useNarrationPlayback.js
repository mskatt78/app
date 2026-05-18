import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_GUIDED_TTS_SPEED,
  fallbackNarrationSegments,
  MIN_NARRATION_MINUTES,
  SCRIPT_EXPANSION_TIMEOUT_MS,
  splitSentences,
  tempoPlaybackRates,
  wait,
} from "./practiceTimerUtils";
import { getEffectiveGuidedNarrationMode } from "../../utils/guidedNarrationSettings";

export const useNarrationPlayback = ({
  autoNarrate,
  isRunning,
  isMuted,
  tempo,
  normalizedSegments,
  practiceType,
  element,
  calculatedTotal,
}) => {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [narrationSegments, setNarrationSegments] = useState([]);
  const [narrationPreparing, setNarrationPreparing] = useState(false);
  const [narrationSegmentIndex, setNarrationSegmentIndex] = useState(0);
  const [audioTapRequired, setAudioTapRequired] = useState(false);

  const ttsAudioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const ttsCacheRef = useRef(new Map());
  const ttsPendingRef = useRef(new Map());
  const narrationIndexRef = useRef(0);

  const clearNarrationCache = useCallback(() => {
    ttsPendingRef.current.clear();
    ttsCacheRef.current.forEach((url) => {
      if (typeof url === "string" && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    ttsCacheRef.current.clear();
  }, []);

  const pauseNarration = useCallback((resetIndex = false) => {
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
    if (ttsPendingRef.current.has(cacheKey)) return ttsPendingRef.current.get(cacheKey);

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
    pauseNarration(true);
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
        include_toning: true,
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
          pauseNarration(true);
          setNarrationSegments(expanded);
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) setNarrationPreparing(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [autoNarrate, calculatedTotal, clearNarrationCache, element, normalizedSegments, practiceType, pauseNarration]);

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
    pauseNarration(true);
    clearNarrationCache();
  }, [clearNarrationCache, pauseNarration]);

  const resetNarration = useCallback(() => {
    pauseNarration(true);
    setAudioTapRequired(false);
  }, [pauseNarration]);

  return {
    ttsAudioRef,
    ttsLoading,
    narrationSegments,
    narrationPreparing,
    narrationSegmentIndex,
    audioTapRequired,
    pauseNarration,
    resetNarration,
  };
};
