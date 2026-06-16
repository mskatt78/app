import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NATURAL_SOUND_OPTIONS, PREFERRED_NATURAL_SOUND_KEY } from "./practiceTimerUtils";
import { startPracticeAmbientAudio } from "./timerAudioEngine";
import { getLocalItem, setLocalItem } from "../../utils/clientStorage";
import { appLogger } from "../../utils/logger";

export const useAmbientAudio = ({
  backgroundAudio,
  isRunning,
  isMuted,
  audioVolume,
  autoNarrate,
  element,
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [selectedBackgroundAudio, setSelectedBackgroundAudio] = useState(() => {
    try {
      const saved = getLocalItem(PREFERRED_NATURAL_SOUND_KEY);
      if (saved && NATURAL_SOUND_OPTIONS.some((option) => option.id === saved)) {
        return saved;
      }
    } catch (error) {
      appLogger.warn("Could not read preferred natural sound from storage", error);
    }
    return backgroundAudio || "silence";
  });

  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourcesRef = useRef([]);
  const drumIntervalRef = useRef(null);
  const bowlIntervalRef = useRef(null);
  const toningLayerRef = useRef(null);

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
    } catch (error) {
      appLogger.warn("Could not persist preferred natural sound", error);
    }
  }, [selectedBackgroundAudio]);

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
      try { source.stop?.(); } catch (error) { appLogger.warn("PracticeTimer source stop failed", error); }
      try { source.disconnect?.(); } catch (error) { appLogger.warn("PracticeTimer source disconnect failed", error); }
    });
    sourcesRef.current = [];

    try {
      toningLayerRef.current?.stop?.();
    } catch (error) {
      appLogger.warn("PracticeTimer toning stop failed", error);
    }
    toningLayerRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
    setAudioPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    startPracticeAmbientAudio({
      selectedBackgroundAudio,
      isMuted,
      audioVolume,
      audioContextRef,
      gainNodeRef,
      toningLayerRef,
      element: String(element || "spirit").toLowerCase(),
      enableToning: Boolean(autoNarrate),
      sourcesRef,
      drumIntervalRef,
      bowlIntervalRef,
      setAudioPlaying,
    });
  }, [audioVolume, autoNarrate, element, isMuted, selectedBackgroundAudio]);

  const shouldPlayAmbient = useMemo(
    () => isRunning && !isMuted && (selectedBackgroundAudio !== "silence" || autoNarrate),
    [autoNarrate, isMuted, isRunning, selectedBackgroundAudio]
  );

  useEffect(() => {
    if (shouldPlayAmbient) {
      if (!audioPlaying) startAudio();
      return;
    }
    cleanupAudio();
  }, [audioPlaying, cleanupAudio, shouldPlayAmbient, startAudio]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : audioVolume * 0.5;
    }
    toningLayerRef.current?.setMuted?.(isMuted || !isRunning, audioVolume);
  }, [audioVolume, isMuted, isRunning]);

  const warmAudioContext = useCallback(() => {
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
      appLogger.warn("PracticeTimer audio warm-up failed", error);
    }
  }, []);

  useEffect(() => () => {
    cleanupAudio();
  }, [cleanupAudio]);

  return {
    audioPlaying,
    selectedBackgroundAudio,
    setSelectedBackgroundAudio,
    cleanupAudio,
    warmAudioContext,
  };
};
