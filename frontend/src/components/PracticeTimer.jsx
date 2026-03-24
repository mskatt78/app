import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { AMBIENT_SOUNDS } from "./AmbientSoundPlayer";
import MeditationVisualizer from "./MeditationVisualizer";
import BreathingVisualizer from "./BreathingVisualizer";

// Web Audio sound generation functions
const createBrownNoise = (audioContext) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }
  
  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  return whiteNoise;
};

const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

const PracticeTimer = ({ 
  segments = [], 
  totalDuration = 300, 
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general",
  element = "Spirit",
  breathingPattern = null,
  visualizationType = "particles",
  allowSpeedControl = true, // Enable tempo/speed control for health reasons
  autoStartAudio = false // Auto-start audio and timer when component mounts
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [segmentTime, setSegmentTime] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [tempo, setTempo] = useState("normal"); // slow, normal, fast
  const tempoMultipliers = { slow: 1.5, normal: 1.0, fast: 0.7 };
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourcesRef = useRef([]);
  const drumIntervalRef = useRef(null);
  const bowlIntervalRef = useRef(null);
  const autoStartedRef = useRef(false);

  // Calculate total duration from segments or use provided
  const calculatedTotal = segments.length > 0 
    ? segments.reduce((sum, seg) => sum + seg.duration_seconds, 0)
    : totalDuration;

  const currentSegment = segments[currentSegmentIndex];

  // Auto-start timer and audio if requested
  useEffect(() => {
    if (autoStartAudio && !autoStartedRef.current && segments.length > 0) {
      autoStartedRef.current = true;
      setIsRunning(true);
    }
  }, [autoStartAudio, segments.length]);

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

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
    if (bowlIntervalRef.current) {
      clearInterval(bowlIntervalRef.current);
      bowlIntervalRef.current = null;
    }
    sourcesRef.current.forEach(source => {
      try { source.stop?.(); } catch (e) {}
      try { source.disconnect?.(); } catch (e) {}
    });
    sourcesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
    setAudioPlaying(false);
  }, []);

  // Start audio
  const startAudio = useCallback(() => {
    if (backgroundAudio === "silence" || isMuted) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      // Reuse warmed AudioContext from user tap if available (mobile requirement)
      let ctx;
      if (window.__warmAudioCtx && window.__warmAudioCtx.state !== 'closed') {
        ctx = window.__warmAudioCtx;
        window.__warmAudioCtx = null;
        if (ctx.state === 'suspended') ctx.resume();
      } else {
        ctx = new AudioContext();
        if (ctx.state === 'suspended') ctx.resume();
      }
      audioContextRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = audioVolume * 0.5;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;
      
      const sound = AMBIENT_SOUNDS[backgroundAudio];
      
      switch (sound?.type) {
        case "rain":
        case "water": {
          const { source, output } = createFilteredNoise(ctx, 400, 2);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        case "ocean": {
          const { source: low, output: lowOut } = createFilteredNoise(ctx, 200, 1);
          const { source: mid, output: midOut } = createFilteredNoise(ctx, 800, 0.5);
          lowOut.connect(gainNode);
          midOut.connect(gainNode);
          low.start();
          mid.start();
          sourcesRef.current.push(low, mid);
          break;
        }
        case "wind": {
          const { source, output } = createFilteredNoise(ctx, 600, 3);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        case "fire":
        case "nature": {
          const { source, output } = createFilteredNoise(ctx, 500, 0.5);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        case "drums": {
          // Shamanic drumming - deep resonant frame drum at ~4.5 Hz journey tempo
          const playDrum = () => {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
            const now = ctx.currentTime;
            
            // Low drum body - deep resonant hit
            const drumBody = ctx.createOscillator();
            const drumGain = ctx.createGain();
            drumBody.type = "sine";
            drumBody.frequency.setValueAtTime(90, now);
            drumBody.frequency.exponentialRampToValueAtTime(50, now + 0.15);
            drumGain.gain.setValueAtTime(0.7, now);
            drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            drumBody.connect(drumGain);
            drumGain.connect(gainNode);
            drumBody.start(now);
            drumBody.stop(now + 0.35);
            
            // Drum skin slap - noise burst for realism
            const bufferSize = ctx.sampleRate * 0.05;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = 200;
            noiseFilter.Q.value = 1.5;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(gainNode);
            noise.start(now);
            
            // Low sub-resonance for depth
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = "sine";
            sub.frequency.setValueAtTime(45, now);
            subGain.gain.setValueAtTime(0.35, now);
            subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            sub.connect(subGain);
            subGain.connect(gainNode);
            sub.start(now);
            sub.stop(now + 0.25);
          };
          playDrum();
          // 222ms = ~4.5 Hz, traditional shamanic journey drumming tempo
          drumIntervalRef.current = setInterval(playDrum, 222);
          break;
        }
        case "bowls":
        case "singing_bowls": {
          const playBowl = () => {
            if (!audioContextRef.current) return;
            [528, 1056, 1584].forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const oscGain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.value = freq;
              const vol = 0.15 / (i + 1);
              oscGain.gain.setValueAtTime(0, ctx.currentTime);
              oscGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.5);
              oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
              osc.connect(oscGain);
              oscGain.connect(gainNode);
              osc.start();
              osc.stop(ctx.currentTime + 8);
            });
          };
          playBowl();
          bowlIntervalRef.current = setInterval(playBowl, 10000);
          break;
        }
      }
      setAudioPlaying(true);
    } catch (e) {
      console.warn('Web Audio API error:', e);
    }
  }, [backgroundAudio, audioVolume, isMuted]);

  // Handle audio when timer state changes
  useEffect(() => {
    if (isRunning && !isMuted && backgroundAudio !== "silence") {
      if (!audioPlaying) {
        startAudio();
      }
    } else {
      cleanupAudio();
    }
  }, [isRunning, isMuted, backgroundAudio, startAudio, cleanupAudio, audioPlaying]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : audioVolume * 0.5;
    }
  }, [audioVolume, isMuted]);

  // Play a gentle bell sound for segment transitions
  const playTransitionBell = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
      // Bell tone - gentle chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
      
      // Secondary harmonic for richer bell sound
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 1.0);
      
      setTimeout(() => ctx.close(), 2000);
    } catch (e) {
      // Audio not available - silent fallback
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cleanupAudio]);

  useEffect(() => {
    if (isRunning) {
      // Adjust interval based on tempo (slow = longer intervals = slower practice)
      const intervalMs = 1000 * tempoMultipliers[tempo];
      
      intervalRef.current = setInterval(() => {
        setSegmentTime(prev => {
          const newTime = prev + 1;
          
          // Check if segment is complete
          if (currentSegment && newTime >= currentSegment.duration_seconds) {
            // Move to next segment
            if (currentSegmentIndex < segments.length - 1) {
              setCurrentSegmentIndex(prev => prev + 1);
              if (!isMuted) playTransitionBell();
              return 0;
            } else {
              // Practice complete
              setIsRunning(false);
              cleanupAudio();
              if (!isMuted) playTransitionBell();
              onComplete?.();
              return prev;
            }
          }
          
          return newTime;
        });
        
        setTotalElapsed(prev => {
          if (prev + 1 >= calculatedTotal) {
            setIsRunning(false);
            cleanupAudio();
            onComplete?.();
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentSegment, currentSegmentIndex, segments.length, calculatedTotal, onComplete, tempo]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isRunning) {
      // Warm up AudioContext on user tap for mobile
      try { 
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!window.__warmAudioCtx || window.__warmAudioCtx.state === 'closed') {
          const c = new AC();
          if (c.state === 'suspended') c.resume();
          window.__warmAudioCtx = c;
        }
      } catch(e) {}
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentSegmentIndex(0);
    setSegmentTime(0);
    setTotalElapsed(0);
    cleanupAudio();
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
          {currentSegment.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              {currentSegment.description}
            </p>
          )}
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

      {/* Speed/Tempo Control for Health Reasons */}
      {allowSpeedControl && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Practice Speed
            </span>
            <span className="text-xs text-primary">
              {tempo === "slow" ? "Slow (Relaxed)" : tempo === "fast" ? "Fast (Energizing)" : "Normal"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isRunning && setTempo("slow")}
              disabled={isRunning}
              className={`flex-1 text-xs ${tempo === "slow" ? "bg-blue-500/20 text-blue-400" : ""}`}
            >
              Slow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isRunning && setTempo("normal")}
              disabled={isRunning}
              className={`flex-1 text-xs ${tempo === "normal" ? "bg-primary/20 text-primary" : ""}`}
            >
              Normal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isRunning && setTempo("fast")}
              disabled={isRunning}
              className={`flex-1 text-xs ${tempo === "fast" ? "bg-orange-500/20 text-orange-400" : ""}`}
            >
              Fast
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {tempo === "slow" ? "50% slower - for breathing conditions or deep relaxation" : 
             tempo === "fast" ? "30% faster - for energizing practice" : 
             "Standard pace"}
          </p>
        </div>
      )}

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
