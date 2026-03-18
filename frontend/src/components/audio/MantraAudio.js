// Mantra Chanting Audio Generator using Web Audio API
// Generates meditation bell sounds and om chanting tones

export const createMantraAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

// Generate a singing bowl / bell tone
export const playBellTone = (ctx, gainNode, frequency = 528, duration = 4) => {
  const now = ctx.currentTime;
  
  // Main tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  
  const oscGain = ctx.createGain();
  
  osc1.type = "sine";
  osc1.frequency.value = frequency;
  
  osc2.type = "sine";
  osc2.frequency.value = frequency * 2; // First harmonic
  
  osc3.type = "sine";
  osc3.frequency.value = frequency * 3; // Second harmonic
  
  // Envelope
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  osc1.connect(oscGain);
  osc2.connect(oscGain);
  osc3.connect(oscGain);
  oscGain.connect(gainNode);
  
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  osc3.stop(now + duration);
};

// Generate "Om" tone using multiple oscillators
export const playOmTone = (ctx, gainNode, baseFreq = 136.1, duration = 6) => {
  const now = ctx.currentTime;
  
  // Om is traditionally at 136.1 Hz (ॐ frequency)
  const frequencies = [
    baseFreq,        // Root
    baseFreq * 2,    // Octave
    baseFreq * 1.5,  // Fifth
    baseFreq * 3,    // Higher octave
  ];
  
  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;
    
    // Envelope - "Aaa-Uuu-Mmm" shape
    const vol = 0.15 / (i + 1);
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(vol, now + duration * 0.1); // Attack
    oscGain.gain.setValueAtTime(vol, now + duration * 0.5); // Sustain
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release
    
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    
    osc.start(now);
    osc.stop(now + duration);
  });
};

// Generate a repeating mantra chant rhythm
export const createMantraChantPattern = (ctx, gainNode, mantraLength = 5, tempo = "normal") => {
  const tempoMultipliers = {
    slow: 1.5,
    normal: 1.0,
    fast: 0.7
  };
  
  const multiplier = tempoMultipliers[tempo] || 1.0;
  const cycleDuration = mantraLength * multiplier;
  
  let intervalId = null;
  let isRunning = false;
  
  const playOneCycle = () => {
    if (!isRunning) return;
    
    // Bell at start
    playBellTone(ctx, gainNode, 528, 2);
    
    // Om tone midway
    setTimeout(() => {
      if (isRunning) {
        playOmTone(ctx, gainNode, 136.1, cycleDuration * 0.6 * 1000);
      }
    }, cycleDuration * 0.3 * 1000);
  };
  
  return {
    start: () => {
      isRunning = true;
      playOneCycle();
      intervalId = setInterval(playOneCycle, cycleDuration * 1000);
    },
    stop: () => {
      isRunning = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    setTempo: (newTempo) => {
      // Restart with new tempo
      if (isRunning) {
        if (intervalId) clearInterval(intervalId);
        const newMultiplier = tempoMultipliers[newTempo] || 1.0;
        const newCycleDuration = mantraLength * newMultiplier;
        intervalId = setInterval(playOneCycle, newCycleDuration * 1000);
      }
    }
  };
};

// Chakra frequencies for different mantras
export const CHAKRA_FREQUENCIES = {
  root: 256,      // C - LAM
  sacral: 288,    // D - VAM
  solar: 320,     // E - RAM
  heart: 341.3,   // F - YAM
  throat: 384,    // G - HAM
  third_eye: 426.7, // A - OM
  crown: 480,     // B - Silence/OM
};

// Element-based frequencies
export const ELEMENT_FREQUENCIES = {
  Earth: 256,   // Root chakra
  Water: 288,   // Sacral
  Fire: 320,    // Solar plexus
  Air: 384,     // Throat
  Spirit: 432,  // Universal frequency
};

// Create a mantra-specific sound based on element
export const playMantraSound = (ctx, gainNode, element = "Spirit", duration = 4) => {
  const freq = ELEMENT_FREQUENCIES[element] || 432;
  playOmTone(ctx, gainNode, freq / 3, duration);
  setTimeout(() => {
    playBellTone(ctx, gainNode, freq, 3);
  }, duration * 0.5 * 1000);
};

export default {
  createMantraAudioContext,
  playBellTone,
  playOmTone,
  createMantraChantPattern,
  playMantraSound,
  CHAKRA_FREQUENCIES,
  ELEMENT_FREQUENCIES
};
