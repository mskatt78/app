import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

const PracticeTimer = ({ 
  segments = [], 
  totalDuration = 300, 
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general"
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTime, setSegmentTime] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef(null);

  // Calculate total duration from segments or use provided
  const calculatedTotal = segments.length > 0 
    ? segments.reduce((sum, seg) => sum + seg.duration_seconds, 0)
    : totalDuration;

  const currentSegment = segments[currentSegmentIndex];

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
              onComplete?.();
              return prev;
            }
          }
          
          return newTime;
        });
        
        setTotalElapsed(prev => {
          if (prev + 1 >= calculatedTotal) {
            setIsRunning(false);
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
    <div className="bg-card/50 border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Main Timer Display */}
      <div className="text-center">
        <div className="text-6xl font-light tracking-wider mb-2">
          {formatTime(calculatedTotal - totalElapsed)}
        </div>
        <p className="text-sm text-muted-foreground">remaining</p>
      </div>

      {/* Current Segment */}
      {currentSegment && (
        <div className="bg-white/5 rounded-xl p-4">
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
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full border-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={handlePlayPause}
          className={`rounded-full w-16 h-16 ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
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
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
          className="rounded-full border-white/10"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Background Audio Indicator */}
      {backgroundAudio !== "silence" && !isMuted && (
        <p className="text-xs text-center text-muted-foreground">
          Background: {backgroundAudio.replace(/_/g, ' ')}
        </p>
      )}
    </div>
  );
};

export default PracticeTimer;
