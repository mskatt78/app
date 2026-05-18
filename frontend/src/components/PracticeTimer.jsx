import { useMemo } from "react";
import MeditationVisualizer from "./MeditationVisualizer";
import BreathingVisualizer from "./BreathingVisualizer";
import { TimerStatusPanel } from "./timer/TimerStatusPanel";
import { TimerControlsPanel } from "./timer/TimerControlsPanel";
import { NATURAL_SOUND_OPTIONS } from "./timer/practiceTimerUtils";
import { usePracticeTimerEngine } from "./timer/usePracticeTimerEngine";

const PracticeTimer = ({
  segments = [],
  totalDuration = 300,
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general",
  element = "Spirit",
  breathingPattern = null,
  visualizationType = "particles",
  allowSpeedControl = true,
  autoStartAudio = false,
  autoNarrate = true,
}) => {
  const getVisualization = () => {
    switch (practiceType) {
      case "heart": return "mandala";
      case "shamanic": return "aurora";
      case "elemental": return "element";
      case "breathwork": return "particles";
      case "chakra": return "chakra";
      default: return visualizationType;
    }
  };

  const engine = usePracticeTimerEngine({
    segments,
    totalDuration,
    onComplete,
    backgroundAudio,
    practiceType,
    element,
    autoStartAudio,
    autoNarrate,
  });

  const toningActive = useMemo(() => Boolean(autoNarrate && engine.isRunning && !engine.isMuted), [autoNarrate, engine.isMuted, engine.isRunning]);

  return (
    <div className="relative bg-card/50 border border-white/10 rounded-2xl p-6 space-y-6 overflow-hidden">
      {engine.showVisuals && (
        <MeditationVisualizer
          type={getVisualization()}
          element={element}
          isActive={engine.isRunning}
          intensity={0.4}
          className="opacity-50"
        />
      )}

      {breathingPattern && engine.isRunning && (
        <div className="flex justify-center py-4">
          <BreathingVisualizer
            pattern={breathingPattern}
            isActive={engine.isRunning}
            size={150}
            color={element.toLowerCase()}
          />
        </div>
      )}

      <TimerStatusPanel
        remainingTime={engine.remainingTime}
        currentSegment={engine.currentSegment}
        currentSegmentIndex={engine.currentSegmentIndex}
        normalizedSegments={engine.normalizedSegments}
        currentSegmentDuration={engine.currentSegmentDuration}
        segmentTime={engine.segmentTime}
        segmentProgress={engine.segmentProgress}
        overallProgress={engine.overallProgress}
        isMuted={engine.isMuted}
        audioPlaying={engine.audioPlaying}
        autoNarrate={autoNarrate}
        ttsLoading={engine.ttsLoading}
        narrationPreparing={engine.narrationPreparing}
        audioTapRequired={engine.audioTapRequired}
        narrationSegmentIndex={engine.narrationSegmentIndex}
        narrationSegments={engine.narrationSegments}
        selectedBackgroundAudio={engine.selectedBackgroundAudio}
        toningActive={toningActive}
      />

      <TimerControlsPanel
        isRunning={engine.isRunning}
        handleReset={engine.handleReset}
        handlePlayPause={engine.handlePlayPause}
        normalizedSegments={engine.normalizedSegments}
        currentSegmentIndex={engine.currentSegmentIndex}
        handleSkipSegment={engine.handleSkipSegment}
        isMuted={engine.isMuted}
        setIsMuted={engine.setIsMuted}
        showVisuals={engine.showVisuals}
        setShowVisuals={engine.setShowVisuals}
        allowSpeedControl={allowSpeedControl}
        tempo={engine.tempo}
        setTempo={engine.setTempo}
        selectedBackgroundAudio={engine.selectedBackgroundAudio}
        setSelectedBackgroundAudio={engine.setSelectedBackgroundAudio}
        NATURAL_SOUND_OPTIONS={NATURAL_SOUND_OPTIONS}
        audioVolume={engine.audioVolume}
        setAudioVolume={engine.setAudioVolume}
      />

      {autoNarrate && <audio ref={engine.ttsAudioRef} style={{ display: "none" }} />}
    </div>
  );
};

export default PracticeTimer;
