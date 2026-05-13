import { useState, useRef, useEffect } from "react";
import { Play, Square, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_GUIDED_TTS_SPEED } from "./guided/guidedNarrationUtils";

const MIN_NARRATION_MINUTES = 7;

const splitSentences = (text) =>
  String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 12);

const extractStepsFromScript = (script) => {
  const stepMatches = String(script || "").match(/Step\s*\d+\s*:\s*[^.?!]+(?:[.?!]|$)/gi) || [];
  return stepMatches
    .map((line) => line.replace(/^\s*Step\s*\d+\s*:\s*/i, "").trim())
    .filter(Boolean)
    .slice(0, 24);
};

const estimateMinutes = (script, providedMinutes) => {
  if (Number.isFinite(Number(providedMinutes)) && Number(providedMinutes) > 0) {
    return Math.max(MIN_NARRATION_MINUTES, Math.round(Number(providedMinutes)));
  }
  const words = String(script || "").trim().split(/\s+/).filter(Boolean).length;
  const estimated = Math.ceil(words / 120);
  return Math.max(MIN_NARRATION_MINUTES, estimated || MIN_NARRATION_MINUTES);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GuidedAudioButton — drop-in button that generates & plays TTS guided audio.
 * Props:
 *  - api: axios instance
 *  - script: string to read aloud
 *  - label: button label (default "Listen to Guided Practice")
 *  - voice: OpenAI voice name (default "nova")
 *  - className: extra Tailwind classes
 */
const GuidedAudioButton = ({
  api,
  script,
  label = "Listen to Guided Practice",
  voice = "nova",
  className = "",
  practiceName,
  durationMinutes,
  element = "Spirit",
  sourceTexts = [],
  steps = [],
}) => {
  const audioRef = useRef(null);
  const abortRef = useRef(null);
  const isStoppedRef = useRef(false);
  const segmentCacheRef = useRef(new Map());
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      abortRef.current?.abort?.();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      segmentCacheRef.current.clear();
    };
  }, []);

  const stopPlayback = () => {
    isStoppedRef.current = true;
    abortRef.current?.abort?.();
    abortRef.current = null;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
    setLoading(false);
  };

  const getSegmentAudio = async (segmentText, controller) => {
    const key = `${voice}::${segmentText}`;
    if (segmentCacheRef.current.has(key)) return segmentCacheRef.current.get(key);

    let response = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await api.post(
          "/tts/generate-base64",
          { text: segmentText, voice, speed: DEFAULT_GUIDED_TTS_SPEED },
          { signal: controller.signal }
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

    const audioBase64 = response?.data?.audio_base64;
    if (!audioBase64) throw new Error("Missing audio payload");
    const url = `data:audio/mp3;base64,${audioBase64}`;
    segmentCacheRef.current.set(key, url);
    return url;
  };

  const buildExpandedSegments = async (controller) => {
    const mergedSources = [script, ...sourceTexts]
      .flatMap((value) => splitSentences(value))
      .filter(Boolean)
      .slice(0, 80);

    const mergedSteps = [...steps, ...extractStepsFromScript(script)]
      .flatMap((value) => splitSentences(value))
      .filter(Boolean)
      .slice(0, 32);

    const payload = {
      practice_name: practiceName || label || "Guided Practice",
      element,
      duration_minutes: estimateMinutes(script, durationMinutes),
      use_ai: false,
      source_texts: mergedSources,
      steps: mergedSteps,
    };

    const fallback = String(script || "").trim();
    try {
      let timerId;
      const timeoutPromise = new Promise((_, reject) => {
        timerId = window.setTimeout(() => reject(new Error("Script expansion timeout")), 12000);
      });

      const response = await Promise.race([
        api.post("/content/expand-script", payload, { signal: controller.signal }),
        timeoutPromise,
      ]);
      window.clearTimeout(timerId);

      const segments = Array.isArray(response?.data?.segments) ? response.data.segments.filter(Boolean) : [];
      if (segments.length > 0) return segments;
      return fallback ? [fallback] : [];
    } catch (_) {
      return fallback ? [fallback] : [];
    }
  };

  const playSegmentsSequentially = async (segments, controller) => {
    if (!segments.length) throw new Error("No narration segments available");

    const playIndex = async (index) => {
      if (isStoppedRef.current || controller.signal.aborted || index >= segments.length) {
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
        getSegmentAudio(nextText, controller).catch(() => {});
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onerror = () => {
        toast.error("Audio playback error");
        stopPlayback();
      };
      audio.onended = () => {
        playIndex(index + 1).catch(() => stopPlayback());
      };
      const started = await audio.play().then(() => true).catch(() => {
        toast.info("Tap play to start audio");
        return false;
      });
      if (!started) {
        setPlaying(false);
        setLoading(false);
        return;
      }
      setPlaying(true);
      setLoading(false);
    };

    await playIndex(0);
  };

  const handlePlay = async () => {
    // If already playing, stop
    if (playing) {
      stopPlayback();
      return;
    }

    isStoppedRef.current = false;
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const expandedSegments = await buildExpandedSegments(controller);
      await playSegmentsSequentially(expandedSegments, controller);
    } catch (err) {
      if (controller.signal.aborted || isStoppedRef.current) return;
      console.error("TTS error:", err);
      toast.info("Guided audio unavailable — please try again shortly");
      setPlaying(false);
      setLoading(false);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      data-testid="guided-audio-btn"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
        ${playing
          ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
          : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
        }
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /><span>Preparing audio...</span></>
      ) : playing ? (
        <><Square className="w-4 h-4" /><span>Stop Audio</span></>
      ) : (
        <><Volume2 className="w-4 h-4" /><span>{label}</span></>
      )}
    </button>
  );
};

export default GuidedAudioButton;
