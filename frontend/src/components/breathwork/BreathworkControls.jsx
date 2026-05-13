import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "../ui/button";

export const BreathworkControls = ({
  isPlaying,
  togglePlay,
  resetSession,
  soundEnabled,
  toggleSound,
}) => {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        data-testid="play-pause-btn"
        onClick={togglePlay}
        size="lg"
        className={`rounded-full w-16 h-16 ${
          isPlaying ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
      </Button>
      <Button
        data-testid="reset-btn"
        onClick={resetSession}
        variant="outline"
        size="icon"
        className="rounded-full border-white/10"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>
      <Button
        data-testid="sound-toggle-btn"
        onClick={toggleSound}
        variant="outline"
        size="icon"
        className={`rounded-full border-white/10 ${soundEnabled ? "text-primary" : "text-muted-foreground"}`}
        title={soundEnabled ? "Sound On" : "Sound Off"}
      >
        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </Button>
    </div>
  );
};
