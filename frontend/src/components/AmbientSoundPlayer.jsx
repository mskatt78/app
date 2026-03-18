/**
 * Ambient Sound Player - Provides background audio for meditation practices
 * Uses free audio from various sources and Web Audio API for generation
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

// Ambient sound definitions with URLs to free audio
const AMBIENT_SOUNDS = {
  silence: { name: "Silence", url: null },
  nature: { 
    name: "Forest & Birds", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3"
  },
  rain: { 
    name: "Gentle Rain", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-2394.mp3"
  },
  ocean: { 
    name: "Ocean Waves", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3"
  },
  fire: { 
    name: "Crackling Fire", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3"
  },
  wind: { 
    name: "Gentle Wind", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-blizzard-cold-winds-1153.mp3"
  },
  drums: { 
    name: "Shamanic Drums", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-tribal-dry-drum-558.mp3"
  },
  singing_bowls: { 
    name: "Singing Bowls", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-sound-593.mp3"
  },
  gentle_water: { 
    name: "Flowing Stream", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-river-stream-nature-1189.mp3"
  },
  forest: { 
    name: "Deep Forest", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3"
  },
  ocean_waves: { 
    name: "Beach Waves", 
    url: "https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3"
  }
};

// Generate a binaural beat using Web Audio API
const generateBinauralBeat = (audioContext, baseFreq = 200, beatFreq = 10) => {
  const leftOsc = audioContext.createOscillator();
  const rightOsc = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const merger = audioContext.createChannelMerger(2);
  
  leftOsc.frequency.value = baseFreq;
  rightOsc.frequency.value = baseFreq + beatFreq;
  leftOsc.type = 'sine';
  rightOsc.type = 'sine';
  
  leftOsc.connect(merger, 0, 0);
  rightOsc.connect(merger, 0, 1);
  merger.connect(gainNode);
  gainNode.gain.value = 0.3;
  
  return { leftOsc, rightOsc, gainNode };
};

const AmbientSoundPlayer = ({ 
  soundType = "silence", 
  autoPlay = false,
  showControls = true,
  volume: initialVolume = 0.5,
  binauralFrequency = null, // e.g., 432, 528, 639 Hz
  onPlayStateChange = () => {}
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const binauralRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    const sound = AMBIENT_SOUNDS[soundType];
    
    if (sound?.url) {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = "auto";
      
      audio.addEventListener('canplaythrough', () => setIsLoaded(true));
      audio.addEventListener('error', (e) => {
        console.warn('Audio load error:', e);
        setIsLoaded(true); // Still allow UI to function
      });
      
      audioRef.current = audio;
    } else {
      setIsLoaded(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopBinaural();
    };
  }, [soundType]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (binauralRef.current?.gainNode) {
      binauralRef.current.gainNode.gain.value = isMuted ? 0 : volume * 0.3;
    }
  }, [volume, isMuted]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && isLoaded) {
      play();
    }
  }, [autoPlay, isLoaded]);

  const startBinaural = useCallback(() => {
    if (!binauralFrequency) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const binaural = generateBinauralBeat(
        audioContextRef.current, 
        binauralFrequency, 
        10 // 10Hz alpha waves for relaxation
      );
      
      binaural.gainNode.connect(audioContextRef.current.destination);
      binaural.leftOsc.start();
      binaural.rightOsc.start();
      
      binauralRef.current = binaural;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }, [binauralFrequency]);

  const stopBinaural = useCallback(() => {
    if (binauralRef.current) {
      binauralRef.current.leftOsc?.stop();
      binauralRef.current.rightOsc?.stop();
      binauralRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
    }
    if (binauralFrequency) {
      startBinaural();
    }
    setIsPlaying(true);
    onPlayStateChange(true);
  }, [binauralFrequency, startBinaural, onPlayStateChange]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    stopBinaural();
    setIsPlaying(false);
    onPlayStateChange(false);
  }, [stopBinaural, onPlayStateChange]);

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
        disabled={!isLoaded && soundType !== "silence"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{soundName}</p>
        {binauralFrequency && (
          <p className="text-xs text-muted-foreground">{binauralFrequency}Hz Binaural</p>
        )}
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
