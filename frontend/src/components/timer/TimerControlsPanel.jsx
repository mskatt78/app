import { Eye, EyeOff, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AMBIENT_SOUNDS } from "../AmbientSoundPlayer";

export const TimerControlsPanel = ({
  isRunning,
  handleReset,
  handlePlayPause,
  normalizedSegments,
  currentSegmentIndex,
  handleSkipSegment,
  isMuted,
  setIsMuted,
  showVisuals,
  setShowVisuals,
  allowSpeedControl,
  tempo,
  setTempo,
  selectedBackgroundAudio,
  setSelectedBackgroundAudio,
  NATURAL_SOUND_OPTIONS,
  audioVolume,
  setAudioVolume,
}) => {
  return (
    <>
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full border-white/10" data-testid="timer-reset">
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={handlePlayPause}
          className={`rounded-full w-16 h-16 ${isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-primary"}`}
          data-testid="timer-play-pause"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        {normalizedSegments.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipSegment}
            disabled={currentSegmentIndex >= normalizedSegments.length - 1}
            className="rounded-full border-white/10"
            data-testid="timer-skip"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        <Button variant="outline" size="icon" onClick={() => setIsMuted((current) => !current)} className="rounded-full border-white/10" data-testid="timer-mute">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={() => setShowVisuals((current) => !current)} className="rounded-full border-white/10" data-testid="timer-visuals">
          {showVisuals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {allowSpeedControl && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Practice Speed</span>
            <span className="text-xs text-primary">
              {tempo === "slow" ? "Slow (Relaxed)" : tempo === "fast" ? "Fast (Energizing)" : "Normal"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("slow")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "slow" ? "bg-blue-500/20 text-blue-400" : ""}`}>
              Slow
            </Button>
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("normal")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "normal" ? "bg-primary/20 text-primary" : ""}`}>
              Normal
            </Button>
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("fast")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "fast" ? "bg-orange-500/20 text-orange-400" : ""}`}>
              Fast
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {tempo === "slow"
              ? "Softer narration pace while the full timer still stays exact"
              : tempo === "fast"
                ? "Brighter narration pace while the full timer still stays exact"
                : "Balanced narration pace with precise timing"}
          </p>
        </div>
      )}

      <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-3" data-testid="timer-natural-sound-selector">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Natural Soundscape</span>
          <span className="text-xs text-primary">
            {NATURAL_SOUND_OPTIONS.find((option) => option.id === selectedBackgroundAudio)?.label || AMBIENT_SOUNDS[selectedBackgroundAudio]?.name || "Custom"}
          </span>
        </div>
        <Select value={selectedBackgroundAudio} onValueChange={setSelectedBackgroundAudio}>
          <SelectTrigger className="bg-card/50 border-white/10" data-testid="timer-natural-sound-select-trigger">
            <SelectValue placeholder="Select sound" />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            {NATURAL_SOUND_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id} data-testid={`timer-natural-sound-option-${option.id}`}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBackgroundAudio && selectedBackgroundAudio !== "silence" && (
        <div className="relative z-10">
          <p className="text-xs text-center text-muted-foreground mb-2">
            Background: {AMBIENT_SOUNDS[selectedBackgroundAudio]?.name || selectedBackgroundAudio.replace(/_/g, " ")}
          </p>
          {!isMuted && isRunning && (
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume * 100}
                onChange={(event) => setAudioVolume(event.target.value / 100)}
                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                data-testid="timer-volume-slider"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
