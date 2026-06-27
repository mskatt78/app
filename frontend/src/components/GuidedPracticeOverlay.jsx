import { GuidedPracticeContent } from "./guided/GuidedPracticeContent";
import { MINIMUM_NARRATION_MINUTES, formatTime } from "./guided/guidedNarrationUtils";
import { useGuidedPracticeEngine } from "./guided/useGuidedPracticeEngine";

export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const engine = useGuidedPracticeEngine({ practice, stepsOverride });

  if (!practice) return null;

  return (
    <GuidedPracticeContent
      practice={practice}
      onExit={onExit}
      muted={engine.muted}
      setMuted={engine.setMuted}
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
      handlePlay={engine.handlePlay}
      handleStartVoiceOnly={engine.handleStartVoiceOnly}
      isPlaying={engine.isPlaying}
      formatTime={formatTime}
      minimumNarrationMinutes={MINIMUM_NARRATION_MINUTES}
      ambientLabel={engine.ambientLabel}
      toningLabel={engine.toningLabel}
      toningActive={engine.toningActive}
    />
  );
}