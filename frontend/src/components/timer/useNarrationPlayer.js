import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { tempoPlaybackRates } from "./practiceTimerUtils";

export const useNarrationPlayer = ({
  autoNarrate,
  isRunning,
  isMuted,
  tempo,
  narrationSegments,
  fetchNarrationAudioUrl,
}) => {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [narrationSegmentIndex, setNarrationSegmentIndex] = useState(0);
  const [audioTapRequired, setAudioTapRequired] = useState(false);

  const ttsAudioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const narrationIndexRef = useRef(0);

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
      narrationIndexRef.current = 0;
      setNarrationSegmentIndex(0);
      setAudioTapRequired(false);
      return;
    }

    if (isRunning && narrationSegments.length > 0) {
      playNarrationSegment(Math.min(narrationIndexRef.current, narrationSegments.length - 1));
      return;
    }
    ttsAudioRef.current?.pause();
  }, [autoNarrate, isRunning, narrationSegments, playNarrationSegment]);

  useEffect(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.playbackRate = tempoPlaybackRates[tempo] || 1;
      ttsAudioRef.current.muted = isMuted;
    }
  }, [isMuted, tempo]);

  useEffect(() => () => {
    if (ttsAbortRef.current) ttsAbortRef.current.abort();
    pauseNarration(true);
  }, [pauseNarration]);

  return {
    ttsAudioRef,
    ttsLoading,
    narrationSegmentIndex,
    audioTapRequired,
    setAudioTapRequired,
    pauseNarration,
  };
};
