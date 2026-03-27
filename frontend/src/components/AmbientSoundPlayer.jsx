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
  ocean: { name: "Ocean Waves", type: "ocean" },
  rain: { name: "Forest Rain", type: "rain" },
  singing_bowls: { name: "Tibetan Bowls", type: "bowls" },
  crystal_bowls: { name: "Crystal Bowls", type: "crystal_bowls" },
  binaural: { name: "Binaural Tones", type: "binaural" },
  nature: { name: "Forest & Birds", type: "nature" },
  fire: { name: "Crackling Fire", type: "fire" },
  wind: { name: "Gentle Wind", type: "wind" },
  drums: { name: "Shamanic Drums (Classic)", type: "drums" },
  drums_gentle: { name: "Gentle Ground Journey (90 BPM)", type: "drums_gentle" },
  drums_journey: { name: "Classic Theta Journey (240 BPM)", type: "drums_journey" },
  drums_awakening: { name: "Awakening Activation (420 BPM)", type: "drums_awakening" },
  drums_fire: { name: "Fire Ceremony Rhythm", type: "drums_fire" },
  drums_return: { name: "Journey Return Call", type: "drums_return" },
  gentle_water: { name: "Flowing Stream", type: "water" },
  // New healing sound types
  dolphin: { name: "Dolphin Song", type: "dolphin" },
  whale: { name: "Whale Song", type: "whale" },
  birds: { name: "Bird Chorus", type: "birds" },
  leaves: { name: "Leaves Rustling", type: "leaves" },
  harp: { name: "Healing Harp", type: "harp" },
  gong: { name: "Gong Bath", type: "gong" },
  chimes: { name: "Bells & Chimes", type: "chimes" },
  solfeggio_528: { name: "528 Hz Love Frequency", type: "solfeggio_528" },
  solfeggio_432: { name: "432 Hz Earth Tuning", type: "solfeggio_432" },
  didgeridoo: { name: "Didgeridoo Drone", type: "didgeridoo" },
  tuning_fork: { name: "Tuning Fork", type: "tuning_fork" },
  solfeggio_396: { name: "396 Hz Liberation", type: "solfeggio_396" },
  solfeggio_741: { name: "741 Hz Awakening", type: "solfeggio_741" },
  solfeggio_852: { name: "852 Hz Intuition", type: "solfeggio_852" },
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

// Dolphin: rapid frequency-modulated chirps and whistles
const createDolphinSound = (audioContext, gainNode) => {
  const playChirp = () => {
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    const startFreq = 3000 + Math.random() * 8000;
    const endFreq = startFreq + (Math.random() - 0.5) * 4000;
    const dur = 0.05 + Math.random() * 0.2;
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(100, endFreq), audioContext.currentTime + dur);
    g.gain.setValueAtTime(0.15, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);
    osc.connect(g); g.connect(gainNode);
    osc.start(); osc.stop(audioContext.currentTime + dur);
  };
  const interval = setInterval(() => {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) setTimeout(playChirp, i * 80);
  }, 400 + Math.random() * 600);
  return interval;
};

// Whale: deep, slow sweeping tones
const createWhaleSound = (audioContext, gainNode) => {
  const playSong = () => {
    // Primary whale call - shifted up to phone-audible range (200-600Hz)
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    const startFreq = 200 + Math.random() * 300;
    const endFreq = startFreq * (0.6 + Math.random() * 0.8);
    const dur = 3 + Math.random() * 4;
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(Math.max(150, endFreq), audioContext.currentTime + dur * 0.4);
    osc.frequency.linearRampToValueAtTime(startFreq * 1.2, audioContext.currentTime + dur * 0.7);
    osc.frequency.linearRampToValueAtTime(startFreq * 0.7, audioContext.currentTime + dur);
    g.gain.setValueAtTime(0, audioContext.currentTime);
    g.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.3);
    g.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + dur * 0.5);
    g.gain.linearRampToValueAtTime(0, audioContext.currentTime + dur);
    osc.connect(g); g.connect(gainNode);
    osc.start(); osc.stop(audioContext.currentTime + dur + 0.1);
    
    // Harmonic overtone for richness
    const osc2 = audioContext.createOscillator();
    const g2 = audioContext.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(startFreq * 1.5, audioContext.currentTime);
    osc2.frequency.linearRampToValueAtTime(endFreq * 1.5, audioContext.currentTime + dur * 0.7);
    g2.gain.setValueAtTime(0, audioContext.currentTime);
    g2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.5);
    g2.gain.linearRampToValueAtTime(0, audioContext.currentTime + dur);
    osc2.connect(g2); g2.connect(gainNode);
    osc2.start(); osc2.stop(audioContext.currentTime + dur + 0.1);
  };
  playSong();
  return setInterval(playSong, 4000 + Math.random() * 3000);
};

// Birds: multiple oscillators simulating bird calls
const createBirdsSound = (audioContext, gainNode) => {
  // Low ambient forest noise
  const { source: noise, output: noiseOut } = createFilteredNoise(audioContext, 300, 0.5);
  noiseOut.connect(gainNode);
  noise.start();
  const playBird = () => {
    const steps = 2 + Math.floor(Math.random() * 5);
    const baseFreq = 1500 + Math.random() * 3000;
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        const osc = audioContext.createOscillator();
        const g = audioContext.createGain();
        const f = baseFreq + (Math.random() - 0.5) * 800;
        const dur = 0.05 + Math.random() * 0.15;
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(f * (0.8 + Math.random() * 0.4), audioContext.currentTime + dur);
        g.gain.setValueAtTime(0.12, audioContext.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + dur);
        osc.connect(g); g.connect(gainNode);
        osc.start(); osc.stop(audioContext.currentTime + dur + 0.05);
      }, i * (80 + Math.random() * 120));
    }
  };
  const birdInterval = setInterval(playBird, 800 + Math.random() * 2000);
  return [noise, birdInterval];
};

// Leaves: bandpass-filtered noise with gentle modulation
const createLeavesSound = (audioContext, gainNode) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  const highpass = audioContext.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 1500;
  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 4000;
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.frequency.value = 0.3;
  lfoGain.gain.value = 0.15;
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  noiseSource.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gainNode);
  noiseSource.start();
  lfo.start();
  return [noiseSource, lfo];
};

// Harp: Karplus-Strong plucked string synthesis
const createHarpSound = (audioContext, gainNode) => {
  const HARP_NOTES = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 1046.50];
  const pluck = (freq) => {
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const g = audioContext.createGain();
    osc1.type = "triangle";
    osc2.type = "sine";
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 2;
    g.gain.setValueAtTime(0.2, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 4);
    osc1.connect(g); osc2.connect(g); g.connect(gainNode);
    osc1.start(); osc2.start();
    osc1.stop(audioContext.currentTime + 4);
    osc2.stop(audioContext.currentTime + 4);
  };
  let idx = 0;
  const playArpeggio = () => {
    const sequence = [0, 2, 4, 7, 4, 2];
    sequence.forEach((noteIdx, i) => {
      setTimeout(() => pluck(HARP_NOTES[noteIdx % HARP_NOTES.length] * (idx % 2 === 0 ? 1 : 0.5)), i * 300);
    });
    idx++;
  };
  playArpeggio();
  return setInterval(playArpeggio, 3000);
};

// Gong: noise impulse with harmonic decay
const createGongSound = (audioContext, gainNode) => {
  const strike = () => {
    const freqs = [55, 110, 165, 220, 330];
    freqs.forEach((f, i) => {
      const osc = audioContext.createOscillator();
      const g = audioContext.createGain();
      osc.type = i === 0 ? "sawtooth" : "sine";
      osc.frequency.value = f;
      const vol = 0.15 / (i + 1);
      g.gain.setValueAtTime(vol, audioContext.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 12 - i);
      osc.connect(g); g.connect(gainNode);
      osc.start(); osc.stop(audioContext.currentTime + 12);
    });
  };
  strike();
  return setInterval(strike, 15000);
};

// Chimes & Bells: bright bell tones
const createChimesSound = (audioContext, gainNode) => {
  const CHIME_FREQS = [523, 659, 784, 1047, 1319, 1568];
  const playChime = () => {
    const f = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.2, audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3);
    osc.connect(g); g.connect(gainNode);
    osc.start(); osc.stop(audioContext.currentTime + 3);
  };
  playChime();
  return setInterval(playChime, 1500 + Math.random() * 1000);
};

// Solfeggio: sustained pure tone at specific Hz
const createSolfeggioTone = (audioContext, gainNode, hz) => {
  const osc = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const g = audioContext.createGain();
  osc.type = "sine";
  osc2.type = "sine";
  osc.frequency.value = hz;
  osc2.frequency.value = hz * 1.0025; // slight detune for depth
  g.gain.value = 0.15;
  osc.connect(g); osc2.connect(g); g.connect(gainNode);
  osc.start(); osc2.start();
  return [osc, osc2];
};

// Didgeridoo: low drone with overtone resonance
const createDidgeridooSound = (audioContext, gainNode) => {
  const fundamental = audioContext.createOscillator();
  const harm2 = audioContext.createOscillator();
  const harm3 = audioContext.createOscillator();
  const g = audioContext.createGain();
  fundamental.type = "sawtooth";
  harm2.type = "sine";
  harm3.type = "sine";
  fundamental.frequency.value = 58;
  harm2.frequency.value = 116;
  harm3.frequency.value = 174;
  g.gain.value = 0.2;
  // LFO for circular breathing effect
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.frequency.value = 3.5;
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  fundamental.connect(g); harm2.connect(g); harm3.connect(g);
  g.connect(gainNode);
  fundamental.start(); harm2.start(); harm3.start(); lfo.start();
  return [fundamental, harm2, harm3, lfo];
};

// Tuning Fork: clean pure sine with slow attack
const createTuningForkSound = (audioContext, gainNode) => {
  const strike = () => {
    const osc = audioContext.createOscillator();
    const g = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = 432;
    g.gain.setValueAtTime(0, audioContext.currentTime);
    g.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 8);
    osc.connect(g); g.connect(gainNode);
    osc.start(); osc.stop(audioContext.currentTime + 8);
  };
  strike();
  return setInterval(strike, 9000);
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

// Gentle Grounding Drum — 90 BPM (~1.5 BPS), low earth frequency
const createGentleDrums = (audioContext, gainNode) => {
  const playDrum = () => {
    try {
      if (audioContext.state === 'closed') return;
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, audioContext.currentTime + 0.45);
      oscGain.gain.setValueAtTime(0.35, audioContext.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      osc.stop(audioContext.currentTime + 0.6);
    } catch(e) {}
  };
  return setInterval(playDrum, 667); // 90 BPM
};

// Classic Theta Journey Drum — 240 BPM (~4 BPS), traditional journey tempo
const createJourneyDrums = (audioContext, gainNode) => {
  const playDrum = () => {
    try {
      if (audioContext.state === 'closed') return;
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(78, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(38, audioContext.currentTime + 0.12);
      oscGain.gain.setValueAtTime(0.48, audioContext.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.28);
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      osc.stop(audioContext.currentTime + 0.28);
    } catch(e) {}
  };
  return setInterval(playDrum, 250); // 240 BPM
};

// Awakening Activation Drum — 420 BPM (~7 BPS), fire energy
const createAwakeningDrums = (audioContext, gainNode) => {
  const playDrum = () => {
    try {
      if (audioContext.state === 'closed') return;
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(92, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, audioContext.currentTime + 0.07);
      oscGain.gain.setValueAtTime(0.58, audioContext.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.14);
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      osc.stop(audioContext.currentTime + 0.14);
    } catch(e) {}
  };
  return setInterval(playDrum, 143); // 420 BPM
};

// Fire Ceremony — syncopated pattern [strong, rest, strong, strong, rest, strong, rest, strong]
const createFireCeremonyDrums = (audioContext, gainNode) => {
  const PATTERN = [1, 0, 1, 1, 0, 1, 0, 1];
  const ACCENTS = [0, 3, 5];
  let beat = 0;
  const playBeat = () => {
    try {
      if (audioContext.state === 'closed') return;
      if (PATTERN[beat % PATTERN.length]) {
        const isAccent = ACCENTS.includes(beat % PATTERN.length);
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(isAccent ? 86 : 68, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, audioContext.currentTime + 0.22);
        oscGain.gain.setValueAtTime(isAccent ? 0.62 : 0.38, audioContext.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.28);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        osc.stop(audioContext.currentTime + 0.28);
      }
      beat++;
    } catch(e) {}
  };
  return setInterval(playBeat, 190); // ~316 BPM subdivided
};

// Return Call — 4 fast beats, then pause, then 3 slow beats (classic journey return)
const createReturnCallDrums = (audioContext, gainNode) => {
  // Pattern: beats at ms offsets within a 4500ms cycle
  const FAST = [0, 160, 320, 480];
  const SLOW = [1700, 2300, 2900];
  const CYCLE = 4400;

  const playPattern = () => {
    FAST.forEach((delay) => {
      setTimeout(() => {
        try {
          if (audioContext.state === 'closed') return;
          const osc = audioContext.createOscillator();
          const g = audioContext.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(88, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.09);
          g.gain.setValueAtTime(0.52, audioContext.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
          osc.connect(g); g.connect(gainNode);
          osc.start(); osc.stop(audioContext.currentTime + 0.18);
        } catch(e) {}
      }, delay);
    });
    SLOW.forEach((delay) => {
      setTimeout(() => {
        try {
          if (audioContext.state === 'closed') return;
          const osc = audioContext.createOscillator();
          const g = audioContext.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(74, audioContext.currentTime);
          osc.frequency.exponentialRampToValueAtTime(38, audioContext.currentTime + 0.28);
          g.gain.setValueAtTime(0.56, audioContext.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.45);
          osc.connect(g); g.connect(gainNode);
          osc.start(); osc.stop(audioContext.currentTime + 0.45);
        } catch(e) {}
      }, delay);
    });
  };

  playPattern();
  return setInterval(playPattern, CYCLE);
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

// Create crystal bowl sound (higher frequency, 432 Hz tuning)
const createCrystalBowlSound = (audioContext, gainNode) => {
  const CRYSTAL_FREQS = [432, 528, 639, 741, 852];
  let idx = 0;
  const playBowl = () => {
    const baseFreq = CRYSTAL_FREQS[idx % CRYSTAL_FREQS.length];
    idx++;
    for (let i = 0; i < 3; i++) {
      const osc = audioContext.createOscillator();
      const oscGain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = baseFreq * (i + 1);
      const vol = 0.12 / (i + 1);
      oscGain.gain.setValueAtTime(0, audioContext.currentTime);
      oscGain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.3);
      oscGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 12);
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      osc.stop(audioContext.currentTime + 12);
    }
  };
  playBowl();
  return setInterval(playBowl, 13000);
};

// Create binaural beats (theta wave ~6 Hz for deep meditation)
const createBinauralBeats = (audioContext, gainNode, beatFreq = 6) => {
  const baseFreq = 200;
  const leftOsc = audioContext.createOscillator();
  const leftGain = audioContext.createGain();
  const leftPan = audioContext.createStereoPanner();
  leftOsc.type = "sine";
  leftOsc.frequency.value = baseFreq;
  leftGain.gain.value = 0.2;
  leftPan.pan.value = -1;
  leftOsc.connect(leftGain);
  leftGain.connect(leftPan);
  leftPan.connect(gainNode);
  leftOsc.start();

  const rightOsc = audioContext.createOscillator();
  const rightGain = audioContext.createGain();
  const rightPan = audioContext.createStereoPanner();
  rightOsc.type = "sine";
  rightOsc.frequency.value = baseFreq + beatFreq;
  rightGain.gain.value = 0.2;
  rightPan.pan.value = 1;
  rightOsc.connect(rightGain);
  rightGain.connect(rightPan);
  rightPan.connect(gainNode);
  rightOsc.start();

  return [leftOsc, rightOsc];
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
      gainNodeRef.current.gain.value = isMuted ? 0 : Math.max(volume * 1.5, 0.6);
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
      // Play silent buffer to unlock audio on mobile
      if (ctx.state === 'suspended') ctx.resume();
      const unlockBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const unlockSrc = ctx.createBufferSource();
      unlockSrc.buffer = unlockBuf;
      unlockSrc.connect(ctx.destination);
      unlockSrc.start(0);
      audioContextRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = Math.max(volume * 1.5, 0.6);
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

        case "drums_gentle": {
          const gentleInterval = createGentleDrums(ctx, gainNode);
          intervalsRef.current.push(gentleInterval);
          break;
        }

        case "drums_journey": {
          const journeyInterval = createJourneyDrums(ctx, gainNode);
          intervalsRef.current.push(journeyInterval);
          break;
        }

        case "drums_awakening": {
          const awakeningInterval = createAwakeningDrums(ctx, gainNode);
          intervalsRef.current.push(awakeningInterval);
          break;
        }

        case "drums_fire": {
          const fireInterval = createFireCeremonyDrums(ctx, gainNode);
          intervalsRef.current.push(fireInterval);
          break;
        }

        case "drums_return": {
          const returnInterval = createReturnCallDrums(ctx, gainNode);
          intervalsRef.current.push(returnInterval);
          break;
        }
        
        case "bowls": {
          // Singing bowl at 528 Hz (love frequency)
          const bowlInterval = createBowlSound(ctx, gainNode, 528);
          intervalsRef.current.push(bowlInterval);
          break;
        }

        case "crystal_bowls": {
          const crystalInterval = createCrystalBowlSound(ctx, gainNode);
          intervalsRef.current.push(crystalInterval);
          break;
        }

        case "binaural": {
          const binauralSources = createBinauralBeats(ctx, gainNode, 6);
          sourcesRef.current.push(...binauralSources);
          break;
        }

        case "dolphin": {
          const dolphinInterval = createDolphinSound(ctx, gainNode);
          intervalsRef.current.push(dolphinInterval);
          break;
        }

        case "whale": {
          const whaleInterval = createWhaleSound(ctx, gainNode);
          intervalsRef.current.push(whaleInterval);
          break;
        }

        case "birds": {
          const [birdNoise, birdInterval] = createBirdsSound(ctx, gainNode);
          sourcesRef.current.push(birdNoise);
          intervalsRef.current.push(birdInterval);
          break;
        }

        case "leaves": {
          const leavesResult = createLeavesSound(ctx, gainNode);
          sourcesRef.current.push(leavesResult[0], leavesResult[1]);
          break;
        }

        case "harp": {
          const harpInterval = createHarpSound(ctx, gainNode);
          intervalsRef.current.push(harpInterval);
          break;
        }

        case "gong": {
          const gongInterval = createGongSound(ctx, gainNode);
          intervalsRef.current.push(gongInterval);
          break;
        }

        case "chimes": {
          const chimesInterval = createChimesSound(ctx, gainNode);
          intervalsRef.current.push(chimesInterval);
          break;
        }

        case "solfeggio_528": {
          const solSources = createSolfeggioTone(ctx, gainNode, 528);
          sourcesRef.current.push(...solSources);
          break;
        }

        case "solfeggio_432": {
          const sol432Sources = createSolfeggioTone(ctx, gainNode, 432);
          sourcesRef.current.push(...sol432Sources);
          break;
        }

        case "solfeggio_396": {
          const sol396Sources = createSolfeggioTone(ctx, gainNode, 396);
          sourcesRef.current.push(...sol396Sources);
          break;
        }

        case "solfeggio_741": {
          const sol741Sources = createSolfeggioTone(ctx, gainNode, 741);
          sourcesRef.current.push(...sol741Sources);
          break;
        }

        case "solfeggio_852": {
          const sol852Sources = createSolfeggioTone(ctx, gainNode, 852);
          sourcesRef.current.push(...sol852Sources);
          break;
        }

        case "didgeridoo": {
          const didgeSources = createDidgeridooSound(ctx, gainNode);
          sourcesRef.current.push(...didgeSources);
          break;
        }

        case "tuning_fork": {
          const tuningInterval = createTuningForkSound(ctx, gainNode);
          intervalsRef.current.push(tuningInterval);
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
