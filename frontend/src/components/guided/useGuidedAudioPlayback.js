import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_GUIDED_TTS_SPEED, ensureTitleLedNarrationOpen, startToningLayer } from "./guidedNarrationUtils";
import {
  getEffectiveGuidedNarrationDurationMinutes,
  getEffectiveGuidedNarrationMode,
  normalizeGuidedNarrationDurationMinutes,
} from "../../utils/guidedNarrationSettings";
import {
  getGuidedPracticePreference,
  resolveGuidedSpeedValue,
  resolveGuidedVoiceId,
} from "../../utils/guidedVoiceSettings";
import { appLogger } from "../../utils/logger";

const MIN_NARRATION_MINUTES = 7;
const DEFAULT_QUICK_START_MINUTES = 12;
const SCRIPT_EXPANSION_TIMEOUT_MS = 18000;
const MAX_EXPANSION_SOURCE_SENTENCES = 32;
const MAX_EXPANSION_STEPS = 18;
const MAX_SEGMENT_WORDS = 120;
const MAX_SEGMENT_CHARS = 1400;
const MAX_SEGMENT_CACHE_SIZE = 8;
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

const countWords = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;

const limitWords = (text, maxWords = 40) => String(text || "").trim().split(/\s+/).slice(0, maxWords).join(" ").trim();

const normalizeForUniq = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();

const chunkSegmentForTTS = (text) => {
  const source = String(text || "").trim();
  if (!source) return [];

  const sentences = splitSentences(source);
  if (!sentences.length) return [limitWords(source, MAX_SEGMENT_WORDS)];

  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    const candidateWords = countWords(candidate);
    if (candidate.length <= MAX_SEGMENT_CHARS && candidateWords <= MAX_SEGMENT_WORDS) {
      current = candidate;
      continue;
    }

    if (current) chunks.push(current.trim());

    const sentenceWords = countWords(sentence);
    if (sentence.length > MAX_SEGMENT_CHARS || sentenceWords > MAX_SEGMENT_WORDS) {
      const tokens = sentence.split(/\s+/).filter(Boolean);
      for (let i = 0; i < tokens.length; i += MAX_SEGMENT_WORDS) {
        const tokenChunk = tokens.slice(i, i + MAX_SEGMENT_WORDS).join(" ").trim();
        if (tokenChunk) chunks.push(tokenChunk);
      }
      current = "";
    } else {
      current = sentence;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

const sanitizeSegmentsForTTS = (segments) => {
  const normalized = Array.isArray(segments)
    ? segments
      .map((segment) => String(segment || "").trim())
      .filter(Boolean)
    : [];

  const output = [];
  for (const segment of normalized) {
    output.push(...chunkSegmentForTTS(segment));
  }
  return output.filter(Boolean);
};

const base64ToObjectUrl = (base64Audio) => {
  const binary = window.atob(String(base64Audio || ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: "audio/mpeg" });
  return URL.createObjectURL(blob);
};

const buildFallbackNarrationSegments = ({ script, sourceTexts = [], steps = [], practiceName, label, element, targetMinutes }) => {
  const title = String(practiceName || label || "Guided Practice").trim();
  const elementName = String(element || "spirit").trim().toLowerCase();
  const targetWords = Math.max(MIN_NARRATION_MINUTES * 120, (Math.max(MIN_NARRATION_MINUTES, Number(targetMinutes) || MIN_NARRATION_MINUTES)) * 115);

  const seedSentences = [script, ...steps, ...sourceTexts]
    .flatMap((value) => splitSentences(value))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 20);

  const uniqueSeeds = [];
  const seen = new Set();
  for (const sentence of seedSentences) {
    const key = normalizeForUniq(sentence);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueSeeds.push(sentence);
  }

  const breathCues = [
    "Inhale softly through your nose and let your exhale become long and easy.",
    "Keep your jaw relaxed and your shoulders soft while your breath settles.",
    "Let your next breath anchor safety through your chest, belly, and pelvis.",
    "Take your time here and allow your nervous system to downshift without force.",
    "Stay with one breath at a time and let the pace be simple and sustainable.",
  ];

  const reflectionCues = [
    `This ${elementName} current supports gentle repair, grounded presence, and heart coherence.`,
    "Notice sensations first, then thoughts, and let your body set the pace.",
    "If intensity rises, soften effort and return to slower breathing.",
    "You are not behind. Depth comes from patience, not speed.",
    "Allow this moment to be enough and keep following the next calm breath.",
  ];

  const paragraphs = [
    `${title}. Welcome into this guided healing sequence. Arrive fully with one slow inhale and one longer exhale.`,
    `Ground into your body, open your heart, and let this ${elementName} practice unfold in safe, steady rhythm.`,
  ];

  if (uniqueSeeds.length) {
    paragraphs.push(...uniqueSeeds.slice(0, 18));
  } else {
    paragraphs.push("Begin gently. Keep breath smooth, body soft, and awareness anchored in sensation.");
  }

  let index = 0;
  let wordCount = countWords(paragraphs.join(" "));
  while (wordCount < targetWords) {
    const breath = breathCues[index % breathCues.length];
    const reflection = reflectionCues[index % reflectionCues.length];
    const seed = uniqueSeeds[index % Math.max(uniqueSeeds.length, 1)] || "Remain present and trust your pacing.";
    paragraphs.push(`${breath} ${reflection} ${seed}`);
    index += 1;
    wordCount = countWords(paragraphs.join(" "));
    if (index > 120) break;
  }

  paragraphs.push(`As you close ${title}, place one hand on your heart, one on your belly, and seal this practice with gratitude.`);
  return sanitizeSegmentsForTTS(paragraphs);
};

const buildQuickStartText = ({ script, sourceTexts = [], steps = [], label, practiceName, element }) => {
  const stepText = steps.filter(Boolean).slice(0, 3).join(" ");
  const sourceText = sourceTexts.filter(Boolean).slice(0, 3).join(" ");
  const base = String(script || "").trim();
  const title = String(practiceName || label || "Guided Practice").trim();
  const elementText = String(element || "spirit").trim();

  const quick = [
    `Welcome to ${title}.`,
    `Begin with one grounding breath and soften your shoulders, jaw, and belly.`,
    `This ${elementText} practice starts gently: stay inside comfort and follow your body.`,
    base,
    stepText,
    sourceText,
  ].filter(Boolean).join(" ");

  return quick.split(/\s+/).slice(0, 55).join(" ");
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
  const objectUrlRegistryRef = useRef(new Set());
  const playbackRunIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const playbackConfig = useMemo(() => ({
    script,
    sourceTexts,
    steps,
    practiceName,
    label,
    element,
    durationMinutes,
    preferredVoiceId: resolveGuidedVoiceId(voice),
    preferredSpeed: resolveGuidedSpeedValue() || DEFAULT_GUIDED_TTS_SPEED,
  }), [durationMinutes, element, label, practiceName, script, sourceTexts, steps]);

  const practicePreference = useMemo(() => {
    const key = String(practiceName || label || "").trim();
    return key ? getGuidedPracticePreference(key) : null;
  }, [label, practiceName]);

  const effectiveNarrationMinutes = useMemo(() => {
    const modalityDefault = getEffectiveGuidedNarrationDurationMinutes({
      practiceName,
      practiceType: label,
      element,
      sourceTexts,
      steps,
    });
    const preferred = practicePreference?.narrationDurationMinutes;
    const normalized = normalizeGuidedNarrationDurationMinutes(
      preferred ?? durationMinutes ?? modalityDefault ?? DEFAULT_QUICK_START_MINUTES,
    );
    const durationCap = Number(durationMinutes);
    if (!Number.isFinite(durationCap) || durationCap <= 0) return normalized;
    return Math.max(MIN_NARRATION_MINUTES, Math.min(normalized, Math.min(20, Math.round(durationCap))));
  }, [durationMinutes, element, label, practiceName, practicePreference?.narrationDurationMinutes, sourceTexts, steps]);

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

  const revokeObjectUrl = useCallback((url) => {
    if (!url || !objectUrlRegistryRef.current.has(url)) return;
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      appLogger.debug("Guided audio object URL revoke warning", error);
    }
    objectUrlRegistryRef.current.delete(url);
  }, []);

  const clearSegmentCache = useCallback(() => {
    segmentCacheRef.current.forEach((url) => revokeObjectUrl(url));
    segmentCacheRef.current.clear();
  }, [revokeObjectUrl]);

  const stopPlayback = useCallback(() => {
    playbackRunIdRef.current += 1;
    isStoppedRef.current = true;
    abortRef.current?.abort?.();
    abortRef.current = null;
    if (audioRef.current) {
      const previousSrc = audioRef.current.src;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      revokeObjectUrl(previousSrc);
    }
    clearSegmentCache();
    stopToning();
    setPlaying(false);
    setLoading(false);
  }, [clearSegmentCache, revokeObjectUrl, stopToning]);

  useEffect(() => () => {
    isStoppedRef.current = true;
    abortRef.current?.abort?.();
    if (audioRef.current) {
      const previousSrc = audioRef.current.src;
      audioRef.current.pause();
      audioRef.current = null;
      revokeObjectUrl(previousSrc);
    }
    clearSegmentCache();
    stopToning();
  }, [clearSegmentCache, revokeObjectUrl, stopToning]);

  const getSegmentAudio = useCallback(async (segmentText, controller) => {
    const voiceId = resolveGuidedVoiceId(
      practicePreference?.voiceProfile ? practicePreference.voiceProfile : voice,
    );
    const speedValue = resolveGuidedSpeedValue(practicePreference?.speedOption) || DEFAULT_GUIDED_TTS_SPEED;
    const key = `${voiceId}:${speedValue}::${segmentText}`;
    if (segmentCacheRef.current.has(key)) return segmentCacheRef.current.get(key);

    let response = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await api.post(
          "/tts/generate-base64",
          { text: segmentText, voice: voiceId, speed: speedValue },
          { signal: controller.signal },
        );
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

    const url = base64ToObjectUrl(response.data.audio_base64);
    objectUrlRegistryRef.current.add(url);
    segmentCacheRef.current.set(key, url);

    while (segmentCacheRef.current.size > MAX_SEGMENT_CACHE_SIZE) {
      const oldestKey = segmentCacheRef.current.keys().next().value;
      const oldestUrl = segmentCacheRef.current.get(oldestKey);
      segmentCacheRef.current.delete(oldestKey);
      // Keep currently playing source alive until playback moves on.
      if (audioRef.current?.src !== oldestUrl) {
        revokeObjectUrl(oldestUrl);
      }
    }

    return url;
  }, [api, practicePreference, revokeObjectUrl, voice]);

  const buildExpandedSegments = useCallback(async (controller) => {
    const {
      script: currentScript,
      sourceTexts: currentSourceTexts,
      steps: currentSteps,
      practiceName: currentPracticeName,
      label: currentLabel,
      element: currentElement,
      durationMinutes: currentDurationMinutes,
    } = playbackConfig;

    const mergedSources = [currentScript, ...currentSourceTexts]
      .flatMap((value) => splitSentences(value))
      .map((line) => limitWords(line, 38))
      .filter(Boolean)
      .slice(0, MAX_EXPANSION_SOURCE_SENTENCES);
    const mergedSteps = [...currentSteps, ...extractStepsFromScript(currentScript)]
      .flatMap((value) => splitSentences(value))
      .map((line) => limitWords(line, 30))
      .filter(Boolean)
      .slice(0, MAX_EXPANSION_STEPS);

    const quickStartSegments = [...mergedSteps.slice(0, 2), ...mergedSources.slice(0, 2)]
      .map((line) => limitWords(line, 30))
      .filter(Boolean)
      .slice(0, 3);

    const payload = {
      practice_name: currentPracticeName || currentLabel || "Guided Practice",
      element: currentElement,
      duration_minutes: effectiveNarrationMinutes,
      use_ai: true,
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
      const expansionAttempts = [
        payload,
        {
          ...payload,
          use_ai: false,
          include_toning: false,
        },
      ];

      for (const attemptPayload of expansionAttempts) {
        let timerId;
        try {
          const timeoutPromise = new Promise((_, reject) => {
            timerId = window.setTimeout(() => reject(new Error("Script expansion timeout")), SCRIPT_EXPANSION_TIMEOUT_MS);
          });
          const response = await Promise.race([
            api.post("/content/expand-script", attemptPayload, { signal: controller.signal }),
            timeoutPromise,
          ]);
          if (timerId) window.clearTimeout(timerId);

          const segments = sanitizeSegmentsForTTS(response?.data?.segments || []);
          if (!segments.length) continue;

          if (quickStartSegments.length > 0) {
            return [...quickStartSegments, ...segments];
          }
          return segments;
        } catch (attemptError) {
          if (timerId) window.clearTimeout(timerId);
          appLogger.warn("Guided script expansion attempt failed", attemptError);
        }
      }

      if (fallback) {
        const fallbackSegments = buildFallbackNarrationSegments({
          script: fallback,
          sourceTexts: mergedSources,
          steps: mergedSteps,
          practiceName: currentPracticeName,
          label: currentLabel,
          element: currentElement,
          targetMinutes: effectiveNarrationMinutes,
        });
        if (quickStartSegments.length > 0) {
          return [...quickStartSegments, ...fallbackSegments];
        }
        return fallbackSegments;
      }

      return quickStartSegments;
    } catch (error) {
      appLogger.warn("Guided script expansion fallback engaged", error);
      const fallbackSegments = buildFallbackNarrationSegments({
        script: fallback,
        sourceTexts: mergedSources,
        steps: mergedSteps,
        practiceName: currentPracticeName,
        label: currentLabel,
        element: currentElement,
        targetMinutes: effectiveNarrationMinutes,
      });
      if (fallbackSegments.length > 0) {
        if (quickStartSegments.length > 0) {
          return [...quickStartSegments, ...fallbackSegments];
        }
        return fallbackSegments;
      }
      return quickStartSegments;
    }
  }, [api, effectiveNarrationMinutes, playbackConfig]);

  const playSegmentsSequentially = useCallback(async (segments, controller) => {
    const activeRunId = playbackRunIdRef.current;
    if (!segments.length) throw new Error("No narration segments available");

    const playIndex = async (index) => {
      if (isStoppedRef.current || controller.signal.aborted || index >= segments.length || activeRunId !== playbackRunIdRef.current) {
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

      let audioUrl = null;
      try {
        audioUrl = await getSegmentAudio(segmentText, controller);
      } catch (segmentError) {
        appLogger.warn("Guided segment generation failed; skipping segment", {
          index,
          error: segmentError,
        });
        await playIndex(index + 1);
        return;
      }
      if (isStoppedRef.current || controller.signal.aborted || activeRunId !== playbackRunIdRef.current) return;

      const nextText = String(segments[index + 1] || "").trim();
      if (nextText) {
        getSegmentAudio(nextText, controller).catch((error) => {
          appLogger.debug("Guided prefetch segment failed", error);
        });
      }

      const audio = new Audio(audioUrl);
      audio.preload = "auto";
      audioRef.current = audio;
      toningLayerRef.current?.setMuted?.(true, 1);
      let advanced = false;
      let progressTimer = null;
      let stallTimer = null;
      let lastProgressTime = 0;
      let stagnantMs = 0;

      const cleanupMonitors = () => {
        if (progressTimer) {
          window.clearInterval(progressTimer);
          progressTimer = null;
        }
        if (stallTimer) {
          window.clearTimeout(stallTimer);
          stallTimer = null;
        }
      };

      const advanceToNext = (reason) => {
        if (advanced) return;
        advanced = true;
        cleanupMonitors();
        audio.onerror = null;
        audio.onended = null;
        audio.onpause = null;
        audio.onsuspend = null;
        audio.onstalled = null;
        const previousSrc = audio.src;
        audio.pause();
        audioRef.current = null;
        // Do not revoke immediately if the URL is still cached for potential retry.
        if (!segmentCacheRef.current.has(`${resolveGuidedVoiceId(practicePreference?.voiceProfile ? practicePreference.voiceProfile : voice)}:${resolveGuidedSpeedValue(practicePreference?.speedOption) || DEFAULT_GUIDED_TTS_SPEED}::${segmentText}`)) {
          revokeObjectUrl(previousSrc);
        }
        toningLayerRef.current?.setMuted?.(false, 0.2);

        if (isStoppedRef.current || controller.signal.aborted || activeRunId !== playbackRunIdRef.current) {
          setPlaying(false);
          setLoading(false);
          return;
        }

        playIndex(index + 1).catch((error) => {
          appLogger.warn(`Guided playback continuation failed (${reason})`, error);
          stopPlayback();
        });
      };

      audio.onerror = () => {
        appLogger.warn("Guided segment playback error; advancing", { index });
        advanceToNext("error");
      };
      audio.onended = () => advanceToNext("ended");
      audio.onstalled = () => advanceToNext("stalled-event");
      audio.onsuspend = () => {
        // Some Android webviews suspend streams prematurely; recover forward.
        if (!audio.ended && !audio.paused) return;
        advanceToNext("suspend-event");
      };
      audio.onpause = () => {
        if (audio.ended || isStoppedRef.current) return;
        window.setTimeout(() => {
          if (!audio.ended && audio.paused && !isStoppedRef.current) {
            advanceToNext("unexpected-pause");
          }
        }, 1200);
      };

      const expectedSeconds = Math.max(24, Math.ceil(countWords(segmentText) / 1.9));
      stallTimer = window.setTimeout(() => {
        advanceToNext("segment-timeout");
      }, Math.min(180000, expectedSeconds * 2400));

      progressTimer = window.setInterval(() => {
        if (advanced || audio.paused || audio.ended) return;
        const currentTime = Number(audio.currentTime || 0);
        if (currentTime > lastProgressTime + 0.12) {
          lastProgressTime = currentTime;
          stagnantMs = 0;
          return;
        }
        stagnantMs += 2000;
        if (stagnantMs >= 12000) {
          advanceToNext("progress-stall");
        }
      }, 2000);

      const started = await audio.play().then(() => true).catch(() => {
        toast.info("Tap play to start audio");
        return false;
      });

      if (activeRunId !== playbackRunIdRef.current) {
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
        return;
      }

      if (!started) {
        cleanupMonitors();
        toningLayerRef.current?.setMuted?.(false, 0.2);
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

      const elementKey = String(playbackConfig.element || "spirit").toLowerCase();
      toningLayerRef.current = startToningLayer(ctx, elementKey);
      toningLayerRef.current?.setMuted?.(false, 0.08);
    } catch (error) {
      appLogger.warn("Guided toning context setup failed", error);
      stopToning();
    }
  }, [playbackConfig.element, stopToning]);

  const handlePlay = useCallback(async () => {
    if (playing) {
      stopPlayback();
      return;
    }

    playbackRunIdRef.current += 1;
    isStoppedRef.current = false;
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    await setupToningContext();

    try {
      const expandedSegments = await buildExpandedSegments(controller);
      const titleLedSegments = ensureTitleLedNarrationOpen(expandedSegments, playbackConfig.practiceName || playbackConfig.label);
      await playSegmentsSequentially(titleLedSegments, controller);
    } catch (error) {
      if (!controller.signal.aborted && !isStoppedRef.current) {
        appLogger.error("Guided TTS playback failed", error);
        toast.info("Guided voice is temporarily unavailable");
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
