import { useCallback, useRef, useState } from "react";
import { playTimerTransitionBell } from "./timerAudioEngine";
import { useAmbientAudio } from "./useAmbientAudio";
import { useNarrationPlayback } from "./useNarrationPlayback";
import { useTimerClock } from "./useTimerClock";

export const usePracticeTimerEngine = ({
  segments,
  totalDuration,
  onComplete,
  backgroundAudio,
  practiceType,
  element,
  autoStartAudio,
  autoNarrate,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [tempo, setTempo] = useState("normal");
  const lifecycleRef = useRef({
    onPause: () => {},
    onReset: () => {},
    onComplete: () => {},
  });

  const playTransitionBell = useCallback(() => {
    playTimerTransitionBell();
  }, []);

  const timerClock = useTimerClock({
    segments,
    totalDuration,
    autoStartAudio,
    isMuted,
    onTransition: playTransitionBell,
    onPause: () => lifecycleRef.current.onPause(),
    onReset: () => lifecycleRef.current.onReset(),
    onComplete: () => lifecycleRef.current.onComplete(),
  });

  const ambientAudio = useAmbientAudio({
    backgroundAudio,
    isRunning: timerClock.isRunning,
    isMuted,
    audioVolume,
    autoNarrate,
    element,
  });

  const narration = useNarrationPlayback({
    autoNarrate,
    isRunning: timerClock.isRunning,
    isMuted,
    tempo,
    normalizedSegments: timerClock.normalizedSegments,
    practiceType,
    element,
    calculatedTotal: timerClock.calculatedTotal,
  });

  lifecycleRef.current = {
    onPause: () => {
      narration.pauseNarration(false);
      ambientAudio.cleanupAudio();
    },
    onReset: () => {
      narration.resetNarration();
      ambientAudio.cleanupAudio();
    },
    onComplete: () => {
      ambientAudio.cleanupAudio();
      narration.resetNarration();
      onComplete?.();
    },
  };

  const handlePlayPause = useCallback(() => {
    if (!timerClock.isRunning) {
      ambientAudio.warmAudioContext();
    }
    timerClock.handlePlayPause();
  }, [ambientAudio, timerClock]);

  return {
    isRunning: timerClock.isRunning,
    isMuted,
    setIsMuted,
    showVisuals,
    setShowVisuals,
    audioVolume,
    setAudioVolume,
    tempo,
    setTempo,
    ttsLoading: narration.ttsLoading,
    narrationPreparing: narration.narrationPreparing,
    audioTapRequired: narration.audioTapRequired,
    narrationSegmentIndex: narration.narrationSegmentIndex,
    narrationSegments: narration.narrationSegments,
    selectedBackgroundAudio: ambientAudio.selectedBackgroundAudio,
    setSelectedBackgroundAudio: ambientAudio.setSelectedBackgroundAudio,
    ttsAudioRef: narration.ttsAudioRef,
    remainingTime: timerClock.remainingTime,
    currentSegment: timerClock.currentSegment,
    currentSegmentIndex: timerClock.currentSegmentIndex,
    normalizedSegments: timerClock.normalizedSegments,
    currentSegmentDuration: timerClock.currentSegmentDuration,
    segmentTime: timerClock.segmentTime,
    segmentProgress: timerClock.segmentProgress,
    overallProgress: timerClock.overallProgress,
    audioPlaying: ambientAudio.audioPlaying,
    handleReset: timerClock.handleReset,
    handlePlayPause,
    handleSkipSegment: timerClock.handleSkipSegment,
  };
};
