import { Volume2 } from "lucide-react";
import { Progress } from "../ui/progress";
import { formatTime } from "./practiceTimerUtils";

export const TimerStatusPanel = ({
  remainingTime,
  currentSegment,
  currentSegmentIndex,
  normalizedSegments,
  currentSegmentDuration,
  segmentTime,
  segmentProgress,
  overallProgress,
  isMuted,
  audioPlaying,
  autoNarrate,
  ttsLoading,
  narrationPreparing,
  audioTapRequired,
  narrationSegmentIndex,
  narrationSegments,
  selectedBackgroundAudio,
}) => {
  return (
    <>
      <div className="relative z-10 text-center">
        <div className="text-6xl font-light tracking-wider mb-2" data-testid="practice-timer-remaining">
          {formatTime(remainingTime)}
        </div>
        <p className="text-sm text-muted-foreground">remaining</p>
      </div>

      {currentSegment && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4" data-testid="practice-timer-current-segment">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentSegmentIndex + 1} of {normalizedSegments.length}
            </span>
            <span className="text-sm text-primary">{formatTime(currentSegmentDuration - segmentTime)}</span>
          </div>
          <h4 className="font-medium text-lg mb-2">{currentSegment.name}</h4>
          {currentSegment.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{currentSegment.description}</p>
          )}
          <Progress value={segmentProgress} className="h-2" />
          {currentSegment.has_audio && !isMuted && audioPlaying && (
            <p className="text-xs text-primary/70 mt-2 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" /> Sound playing
            </p>
          )}
          {autoNarrate && ttsLoading && (
            <p className="text-xs text-violet-400/80 mt-2 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" /> Preparing narration...
            </p>
          )}
          {autoNarrate && narrationPreparing && (
            <p className="text-xs text-violet-400/80 mt-2 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" /> Weaving long-form script...
            </p>
          )}
          {autoNarrate && audioTapRequired && (
            <p className="text-xs text-violet-300/80 mt-2 flex items-center gap-1" data-testid="timer-audio-tap-required-status">
              <Volume2 className="w-3 h-3" /> Audio ready — tap play once to enable narration.
            </p>
          )}
          {autoNarrate && !narrationPreparing && narrationSegments.length > 0 && !ttsLoading && (
            <p className="text-xs text-violet-400/80 mt-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Narrating section {Math.min(narrationSegmentIndex + 1, narrationSegments.length)} of {narrationSegments.length}
            </p>
          )}
          {!isMuted && selectedBackgroundAudio !== "silence" && !audioPlaying && (
            <p className="text-xs text-amber-400/70 mt-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Tap play to start audio
            </p>
          )}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1" />
      </div>
    </>
  );
};
