/**
 * Ambient Sound Player - Provides background audio for meditation practices
 * Uses Web Audio API to generate ambient sounds procedurally
 * This avoids CDN hotlinking issues and works offline
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

// Sound type definitions
const AMBIENT_SOUNDS = {
  silence: { name: "Silence", type: "none" },
  nature: { name: "Forest & Birds", type: "nature" },
  rain: { name: "Gentle Rain", type: "rain" },
  ocean: { name: "Ocean Waves", type: "ocean" },
  fire: { name: "Crackling Fire", type: "fire" },
  wind: { name: "Gentle Wind", type: "wind" },
  drums: { name: "Shamanic Drums", type: "drums" },
  singing_bowls: { name: "Singing Bowls", type: "bowls" },
  gentle_water: { name: "Flowing Stream", type: "water" },
  forest: { name: "Deep Forest", type: "nature" },
  ocean_waves: { name: "Beach Waves", type: "ocean" }
};

// Generate brown noise (deeper, more soothing than white noise)
const createBrownNoise = (audioContext) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Adjust volume
  }
  
  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;
  return whiteNoise;
};

// Create a low-pass filtered noise for ocean/wind sounds
const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

// Create a simple tone (for bowls)
const createTone = (audioContext, frequency) => {
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  return oscillator;
};

// Create drum pattern
const createDrumPattern = (audioContext, gainNode) => {
  const playDrum = () => {
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(80, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);
    
    oscGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
  };
  
  // Shamanic drum pattern: 4-7 beats per second (theta wave inducing)
  const bpm = 280; // ~4.7 beats per second
  const interval = 60000 / bpm;
  
  return setInterval(playDrum, interval);
};

// Create singing bowl sound
const createBowlSound = (audioContext, gainNode, baseFreq = 528) => {
  const playBowl = () => {
    const frequencies = [baseFreq, baseFreq * 2, baseFreq * 3, baseFreq * 4];
    
    frequencies.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      const volume = 0.15 / (i + 1);
      oscGain.gain.setValueAtTime(0, audioContext.currentTime);
      oscGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.5);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 8);
      
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      
      osc.start();
      osc.stop(audioContext.currentTime + 8);
    });
  };
  
  playBowl();
  return setInterval(playBowl, 10000); // Play every 10 seconds
};

const AmbientSoundPlayer = ({ 
  soundType = "silence", 
  autoPlay = false,
  showControls = true,
  volume: initialVolume = 0.5,
  onPlayStateChange = () => {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourcesRef = useRef([]);
  const intervalsRef = useRef([]);

  const cleanup = useCallback(() => {
    // Clear intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
    
    // Stop sources
    sourcesRef.current.forEach(source => {
      try { source.stop?.(); } catch (e) {}
      try { source.disconnect?.(); } catch (e) {}
    });
    sourcesRef.current = [];
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Handle volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume * 0.5;
    }
  }, [volume, isMuted]);

  const startSound = useCallback(() => {
    if (soundType === "silence") {
      setIsPlaying(true);
      onPlayStateChange(true);
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 0.5;
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;
      
      const sound = AMBIENT_SOUNDS[soundType];
      
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
          // Create multiple layers for ocean sound
          const { source: low, output: lowOut } = createFilteredNoise(ctx, 200, 1);
          const { source: mid, output: midOut } = createFilteredNoise(ctx, 800, 0.5);
          
          // Add LFO for wave motion
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.value = 0.1; // Very slow oscillation
          lfoGain.gain.value = 0.3;
          lfo.connect(lfoGain);
          lfoGain.connect(gainNode.gain);
          
          lowOut.connect(gainNode);
          midOut.connect(gainNode);
          low.start();
          mid.start();
          lfo.start();
          sourcesRef.current.push(low, mid, lfo);
          break;
        }
        
        case "wind": {
          const { source, output } = createFilteredNoise(ctx, 600, 3);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        
        case "fire": {
          // Crackling fire = filtered noise with random amplitude modulation
          const { source, output } = createFilteredNoise(ctx, 1000, 1);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        
        case "nature": {
          // Gentle ambient noise
          const { source, output } = createFilteredNoise(ctx, 500, 0.5);
          output.connect(gainNode);
          source.start();
          sourcesRef.current.push(source);
          break;
        }
        
        case "drums": {
          const drumInterval = createDrumPattern(ctx, gainNode);
          intervalsRef.current.push(drumInterval);
          break;
        }
        
        case "bowls": {
          // Singing bowl at 528 Hz (love frequency)
          const bowlInterval = createBowlSound(ctx, gainNode, 528);
          intervalsRef.current.push(bowlInterval);
          break;
        }
        
        default:
          break;
      }
      
      setIsPlaying(true);
      onPlayStateChange(true);
    } catch (e) {
      console.warn('Web Audio API error:', e);
    }
  }, [soundType, volume, onPlayStateChange]);

  const stopSound = useCallback(() => {
    cleanup();
    setIsPlaying(false);
    onPlayStateChange(false);
  }, [cleanup, onPlayStateChange]);

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-play support
  useEffect(() => {
    if (autoPlay && !isPlaying) {
      startSound();
    }
  }, [autoPlay]);

  if (!showControls) {
    return null;
  }

  const soundName = AMBIENT_SOUNDS[soundType]?.name || "Silence";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="rounded-full w-10 h-10"
        data-testid="ambient-play"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{soundName}</p>
        <p className="text-xs text-muted-foreground">Web Audio Generated</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Slider
          value={[volume * 100]}
          onValueChange={([v]) => setVolume(v / 100)}
          max={100}
          step={1}
          className="w-20"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="rounded-full w-8 h-8"
          data-testid="ambient-mute"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AmbientSoundPlayer;
export { AMBIENT_SOUNDS };
