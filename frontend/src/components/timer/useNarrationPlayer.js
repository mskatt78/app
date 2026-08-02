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
        fetchNarrationAudioUrl(index + 1, nextText, controller).catch((error) => {
          console.error("Narration prefetch failed:", error);
        });
      }

      narrationIndexRef.current = index;
      setNarrationSegmentIndex(index);

      const player = ttsAudioRef.current;
      if (!player) return;
      player.src = url;
      player.playbackRate = tempoPlaybackRates[tempo] || 1;
      player.muted = isMuted;
      let advanced = false;
      let progressTimer = null;
      let segmentTimeout = null;
      let lastProgress = 0;
      let stagnantMs = 0;

      const cleanupMonitors = () => {
        if (progressTimer) {
          window.clearInterval(progressTimer);
          progressTimer = null;
        }
        if (segmentTimeout) {
          window.clearTimeout(segmentTimeout);
          segmentTimeout = null;
        }
      };

      const advance = (reason) => {
        if (advanced) return;
        advanced = true;
        cleanupMonitors();
        const nextIndex = narrationIndexRef.current + 1;
        narrationIndexRef.current = nextIndex;
        setNarrationSegmentIndex(nextIndex);
        if (isRunning) {
          playNarrationSegment(nextIndex).catch((error) => {
            console.error(`Narration continuation failed (${reason}):`, error);
          });
        }
      };

      player.onended = () => advance("ended");
      player.onerror = () => advance("error");
      player.onstalled = () => advance("stalled");
      player.onsuspend = () => {
        if (!player.ended && !player.paused) return;
        advance("suspend");
      };

      const estimatedSeconds = Math.max(20, Math.ceil(text.split(/\s+/).filter(Boolean).length / 2));
      segmentTimeout = window.setTimeout(() => {
        advance("timeout");
      }, Math.min(180000, estimatedSeconds * 2600));

      progressTimer = window.setInterval(() => {
        if (advanced || player.paused || player.ended) return;
        const ct = Number(player.currentTime || 0);
        if (ct > lastProgress + 0.12) {
          lastProgress = ct;
          stagnantMs = 0;
          return;
        }
        stagnantMs += 2000;
        if (stagnantMs >= 12000) {
          advance("progress-stall");
        }
      }, 2000);

      const started = await player.play().then(() => true).catch(() => false);
      if (!started) {
        cleanupMonitors();
        setAudioTapRequired(true);
        toast.info("Tap play once to enable voice guidance.");
      } else {
        setAudioTapRequired(false);
      }
    } catch (error) {
      console.error("Narration segment playback failed:", error);
      const nextIndex = index + 1;
      narrationIndexRef.current = nextIndex;
      setNarrationSegmentIndex(nextIndex);
      if (isRunning && nextIndex < narrationSegments.length) {
        playNarrationSegment(nextIndex).catch((nextError) => {
          console.error("Narration fallback continuation failed:", nextError);
        });
      }
    } finally {
      if (ttsAbortRef.current === controller) ttsAbortRef.current = null;
      setTtsLoading(false);
    }
  }, [autoNarrate, fetchNarrationAudioUrl, isMuted, isRunning, narrationSegments, tempo]);

  useEffect(() => {
    queueMicrotask(() => {
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
    });
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
