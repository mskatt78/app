// Optional non-vocal practice tones.
// IMPORTANT: oscillator output is never presented as an authentic mantra chant or healing frequency.

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
  
  // Envelope - LOUDER
  oscGain.gain.setValueAtTime(0, now);
  oscGain.gain.linearRampToValueAtTime(0.8, now + 0.05);  // Increased from 0.4 to 0.8
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
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
  
  // A low drone used only as an optional non-vocal tone; no traditional frequency claim is made.
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
    
    // Envelope - "Aaa-Uuu-Mmm" shape - LOUDER
    const vol = 0.4 / (i + 1);  // Increased from 0.15 to 0.4
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(vol, now + duration * 0.1); // Attack
    oscGain.gain.setValueAtTime(vol, now + duration * 0.5); // Sustain
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release
    
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    
    osc.start(now);
    osc.stop(now + duration);
  });
};

const estimateSyllableCount = (text = "") => {
  const cleaned = String(text || "").toLowerCase().replace(/[^a-z\s]/g, " ").trim();
  if (!cleaned) return 2;
  const words = cleaned.split(/\s+/).filter(Boolean);
  const vowelGroups = words.reduce((total, word) => {
    const matches = word.match(/[aeiouy]+/g);
    return total + (matches ? matches.length : 1);
  }, 0);
  return Math.max(2, Math.min(12, vowelGroups));
};

const resolveMantraBaseFreq = (mantraText = "", element = "Spirit") => {
  const text = String(mantraText || "").toLowerCase();

  if (text.includes("om") || text.includes("aum")) return 136.1;
  if (text.includes("lam")) return CHAKRA_FREQUENCIES.root;
  if (text.includes("vam")) return CHAKRA_FREQUENCIES.sacral;
  if (text.includes("ram")) return CHAKRA_FREQUENCIES.solar;
  if (text.includes("yam")) return CHAKRA_FREQUENCIES.heart;
  if (text.includes("ham")) return CHAKRA_FREQUENCIES.throat;
  if (text.includes("so hum") || text.includes("sohum")) return 144;
  if (text.includes("gayatri")) return 156;
  if (text.includes("shanti")) return 148;

  return ELEMENT_FREQUENCIES[element] ? ELEMENT_FREQUENCIES[element] / 2 : 144;
};

// Legacy synthetic drone renderer. Do not expose this as a mantra voice/chant in the member UI.
export const playChantForMantra = (ctx, gainNode, mantraText = "", element = "Spirit", duration = 5) => {
  const now = ctx.currentTime;
  const baseFreq = resolveMantraBaseFreq(mantraText, element);
  const syllableCount = estimateSyllableCount(mantraText);
  const pulseDuration = Math.max(0.25, duration / syllableCount);

  // Foundational hum
  const hum = ctx.createOscillator();
  const humGain = ctx.createGain();
  const humFilter = ctx.createBiquadFilter();
  hum.type = "sine";
  hum.frequency.value = baseFreq * 0.5;
  humFilter.type = "lowpass";
  humFilter.frequency.value = baseFreq * 4;
  humGain.gain.setValueAtTime(0.001, now);
  humGain.gain.exponentialRampToValueAtTime(0.16, now + Math.min(0.5, duration * 0.15));
  humGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  hum.connect(humFilter);
  humFilter.connect(humGain);
  humGain.connect(gainNode);
  hum.start(now);
  hum.stop(now + duration + 0.05);

  // Syllable pulses to simulate chanting cadence
  for (let i = 0; i < syllableCount; i += 1) {
    const pulseStart = now + i * pulseDuration;
    const pulseEnd = Math.min(now + duration, pulseStart + pulseDuration * 0.95);

    const tone = ctx.createOscillator();
    const tone2 = ctx.createOscillator();
    const toneGain = ctx.createGain();
    const toneFilter = ctx.createBiquadFilter();

    tone.type = "triangle";
    tone2.type = "sine";
    tone.frequency.setValueAtTime(baseFreq, pulseStart);
    tone.frequency.linearRampToValueAtTime(baseFreq * 0.92, pulseEnd);
    tone2.frequency.setValueAtTime(baseFreq * 1.98, pulseStart);

    toneFilter.type = "bandpass";
    toneFilter.Q.value = 2.2;
    // Sweep mimics A-U-M vocal formant evolution
    toneFilter.frequency.setValueAtTime(baseFreq * 8, pulseStart);
    toneFilter.frequency.linearRampToValueAtTime(baseFreq * 5.2, pulseStart + (pulseEnd - pulseStart) * 0.6);
    toneFilter.frequency.linearRampToValueAtTime(baseFreq * 3.8, pulseEnd);

    toneGain.gain.setValueAtTime(0.0001, pulseStart);
    toneGain.gain.linearRampToValueAtTime(0.22, pulseStart + (pulseEnd - pulseStart) * 0.2);
    toneGain.gain.exponentialRampToValueAtTime(0.015, pulseEnd);

    tone.connect(toneFilter);
    tone2.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(gainNode);

    tone.start(pulseStart);
    tone2.start(pulseStart);
    tone.stop(pulseEnd + 0.02);
    tone2.stop(pulseEnd + 0.02);
  }
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
    
    // Low drone midway
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

// Legacy tone mappings for optional non-vocal sound design; not physiological or traditional claims
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
  Spirit: 432,  // neutral sound-design default
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
  playChantForMantra,
  createMantraChantPattern,
  playMantraSound,
  CHAKRA_FREQUENCIES,
  ELEMENT_FREQUENCIES
};
