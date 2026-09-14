import { GuidedPracticeContent } from "./guided/GuidedPracticeContent";
import { formatTime } from "./guided/guidedNarrationUtils";
import { useGuidedPracticeEngine } from "./guided/useGuidedPracticeEngine";
import { useEffect } from "react";

export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const engine = useGuidedPracticeEngine({ practice, stepsOverride });

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("soul-temple:guided-overlay-open"));
  }, []);

  if (!practice) return null;

  return (
    <GuidedPracticeContent
      practice={practice}
      onExit={onExit}
      muted={engine.muted}
      setMuted={engine.setMuted}
      voiceVolume={engine.voiceVolume}
      setVoiceVolume={engine.setVoiceVolume}
      ambientVolume={engine.ambientVolume}
      setAmbientVolume={engine.setAmbientVolume}
      isComplete={engine.isComplete}
      bgGradient={engine.bgGradient}
      elColor={engine.elColor}
      timeRemaining={engine.timeRemaining}
      hasStarted={engine.hasStarted}
      scriptLoading={engine.scriptLoading}
      element={engine.element}
      progress={engine.progress}
      ttsLoading={engine.ttsLoading}
      audioTapRequired={engine.audioTapRequired}
      ttsPlaying={engine.ttsPlaying}
      currentSegmentIndex={engine.currentSegmentIndex}
      narrationSegments={engine.narrationSegments}
      narrationParagraphs={engine.narrationParagraphs}
      playbackVoiceProfile={engine.playbackVoiceProfile}
      playbackSpeedOption={engine.playbackSpeedOption}
      onVoiceProfileChange={engine.handlePlaybackVoiceProfileChange}
      onSpeedOptionChange={engine.handlePlaybackSpeedOptionChange}
      customVoiceActive={engine.customVoiceActive}
      customVoiceProfileName={engine.customVoiceProfileName}
      handlePlay={engine.handlePlay}
      handleStartVoiceOnly={engine.handleStartVoiceOnly}
      isPlaying={engine.isPlaying}
      formatTime={formatTime}
      minimumNarrationMinutes={engine.playbackNarrationDurationMinutes}
      ambientLabel={engine.ambientLabel}
      toningLabel={engine.toningLabel}
      toningActive={engine.toningActive}
      narrationDurationOptions={engine.narrationDurationOptions}
      onNarrationDurationChange={engine.handlePlaybackNarrationDurationMinutesChange}
    />
  );
}