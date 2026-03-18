import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import AmbientSoundPlayer, { AMBIENT_SOUNDS } from "./AmbientSoundPlayer";
import MeditationVisualizer from "./MeditationVisualizer";
import BreathingVisualizer from "./BreathingVisualizer";

const PracticeTimer = ({ 
  segments = [], 
  totalDuration = 300, 
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general",
  element = "Spirit",
  breathingPattern = null, // Optional: { inhale: 4, hold: 4, exhale: 4, hold_empty: 0 }
  visualizationType = "particles" // particles, aurora, mandala, chakra, element
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTime, setSegmentTime] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Calculate total duration from segments or use provided
  const calculatedTotal = segments.length > 0 
    ? segments.reduce((sum, seg) => sum + seg.duration_seconds, 0)
    : totalDuration;

  const currentSegment = segments[currentSegmentIndex];

  // Map practice type to visualization
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

  // Initialize audio on mount
  useEffect(() => {
    if (backgroundAudio && backgroundAudio !== "silence" && AMBIENT_SOUNDS[backgroundAudio]?.url) {
      const audio = new Audio(AMBIENT_SOUNDS[backgroundAudio].url);
      audio.loop = true;
      audio.volume = audioVolume;
      audioRef.current = audio;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [backgroundAudio]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && !isMuted) {
        audioRef.current.volume = audioVolume;
        audioRef.current.play().catch(e => console.warn('Audio autoplay blocked:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isRunning, isMuted, audioVolume]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSegmentTime(prev => {
          const newTime = prev + 1;
          
          // Check if segment is complete
          if (currentSegment && newTime >= currentSegment.duration_seconds) {
            // Move to next segment
            if (currentSegmentIndex < segments.length - 1) {
              setCurrentSegmentIndex(prev => prev + 1);
              return 0;
            } else {
              // Practice complete
              setIsRunning(false);
              if (audioRef.current) audioRef.current.pause();
              onComplete?.();
              return prev;
            }
          }
          
          return newTime;
        });
        
        setTotalElapsed(prev => {
          if (prev + 1 >= calculatedTotal) {
            setIsRunning(false);
            if (audioRef.current) audioRef.current.pause();
            onComplete?.();
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentSegment, currentSegmentIndex, segments.length, calculatedTotal, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentSegmentIndex(0);
    setSegmentTime(0);
    setTotalElapsed(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSkipSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setTotalElapsed(prev => prev + (currentSegment.duration_seconds - segmentTime));
      setCurrentSegmentIndex(prev => prev + 1);
      setSegmentTime(0);
    }
  };

  const overallProgress = (totalElapsed / calculatedTotal) * 100;
  const segmentProgress = currentSegment 
    ? (segmentTime / currentSegment.duration_seconds) * 100 
    : 0;

  return (
    <div className="relative bg-card/50 border border-white/10 rounded-2xl p-6 space-y-6 overflow-hidden">
      {/* Background Visualization */}
      {showVisuals && (
        <MeditationVisualizer
          type={getVisualization()}
          element={element}
          isActive={isRunning}
          intensity={0.4}
          className="opacity-50"
        />
      )}

      {/* Breathing Visualizer (if pattern provided) */}
      {breathingPattern && isRunning && (
        <div className="flex justify-center py-4">
          <BreathingVisualizer
            pattern={breathingPattern}
            isActive={isRunning}
            size={150}
            color={element.toLowerCase()}
          />
        </div>
      )}

      {/* Main Timer Display */}
      <div className="relative z-10 text-center">
        <div className="text-6xl font-light tracking-wider mb-2">
          {formatTime(calculatedTotal - totalElapsed)}
        </div>
        <p className="text-sm text-muted-foreground">remaining</p>
      </div>

      {/* Current Segment */}
      {currentSegment && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentSegmentIndex + 1} of {segments.length}
            </span>
            <span className="text-sm text-primary">
              {formatTime(currentSegment.duration_seconds - segmentTime)}
            </span>
          </div>
          <h4 className="font-medium text-lg mb-2">{currentSegment.name}</h4>
          <Progress value={segmentProgress} className="h-2" />
          {currentSegment.has_audio && !isMuted && (
            <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Audio guidance available
            </p>
          )}
        </div>
      )}

      {/* Overall Progress */}
      <div className="relative z-10">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1" />
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full border-white/10"
          data-testid="timer-reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={handlePlayPause}
          className={`rounded-full w-16 h-16 ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
          data-testid="timer-play-pause"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        {segments.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipSegment}
            disabled={currentSegmentIndex >= segments.length - 1}
            className="rounded-full border-white/10"
            data-testid="timer-skip"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="rounded-full border-white/10"
          data-testid="timer-mute"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowVisuals(!showVisuals)}
          className="rounded-full border-white/10"
          data-testid="timer-visuals"
        >
          {showVisuals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {/* Background Audio Indicator */}
      {backgroundAudio && backgroundAudio !== "silence" && (
        <div className="relative z-10">
          <p className="text-xs text-center text-muted-foreground mb-2">
            Background: {AMBIENT_SOUNDS[backgroundAudio]?.name || backgroundAudio.replace(/_/g, ' ')}
          </p>
          {!isMuted && isRunning && (
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume * 100}
                onChange={(e) => setAudioVolume(e.target.value / 100)}
                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeTimer;
