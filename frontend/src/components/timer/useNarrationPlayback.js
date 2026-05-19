import { useCallback, useEffect } from "react";
import { useNarrationCache } from "./useNarrationCache";
import { useNarrationPlayer } from "./useNarrationPlayer";
import { useNarrationRequest } from "./useNarrationRequest";

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
  const { fetchNarrationAudioUrl, clearNarrationCache } = useNarrationCache();

  const request = useNarrationRequest({
    autoNarrate,
    normalizedSegments,
    practiceType,
    element,
    calculatedTotal,
    clearNarrationCache,
  });

  const player = useNarrationPlayer({
    autoNarrate,
    isRunning,
    isMuted,
    tempo,
    narrationSegments: request.narrationSegments,
    fetchNarrationAudioUrl,
  });

  useEffect(() => {
    player.pauseNarration(true);
    player.setAudioTapRequired(false);
  }, [request.narrationSegments, player.pauseNarration, player.setAudioTapRequired, player]);

  useEffect(() => () => {
    clearNarrationCache();
  }, [clearNarrationCache]);

  const resetNarration = useCallback(() => {
    player.pauseNarration(true);
    player.setAudioTapRequired(false);
  }, [player]);

  return {
    ttsAudioRef: player.ttsAudioRef,
    ttsLoading: player.ttsLoading,
    narrationSegments: request.narrationSegments,
    narrationPreparing: request.narrationPreparing,
    narrationSegmentIndex: player.narrationSegmentIndex,
    audioTapRequired: player.audioTapRequired,
    pauseNarration: player.pauseNarration,
    resetNarration,
  };
};
