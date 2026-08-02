import { AMBIENT_SOUNDS } from "../AmbientSoundPlayer";

export const tempoPlaybackRates = { slow: 0.9, normal: 1.0, fast: 1.12 };
export const MIN_NARRATION_MINUTES = 7;
export const SCRIPT_EXPANSION_TIMEOUT_MS = 25000;
export const DEFAULT_GUIDED_TTS_SPEED = 0.82;
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const PREFERRED_NATURAL_SOUND_KEY = "preferred-natural-sound";

export const NATURAL_SOUND_OPTIONS = [
  { id: "ocean", label: AMBIENT_SOUNDS.ocean.name },
  { id: "rain", label: AMBIENT_SOUNDS.rain.name },
  { id: "nature", label: AMBIENT_SOUNDS.nature.name },
  { id: "whale", label: AMBIENT_SOUNDS.whale.name },
  { id: "dolphin", label: AMBIENT_SOUNDS.dolphin.name },
  { id: "wind", label: AMBIENT_SOUNDS.wind.name },
  { id: "fire", label: AMBIENT_SOUNDS.fire.name },
  { id: "chimes", label: AMBIENT_SOUNDS.chimes.name },
  { id: "drums_gentle", label: AMBIENT_SOUNDS.drums_gentle.name },
  { id: "silence", label: "Silence" },
];

export const createBrownNoise = (audioContext) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i += 1) {
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

export const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const splitSentences = (text) =>
  String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 10);

const countWords = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;

export const fallbackNarrationSegments = (normalizedSegments, targetMinutes = MIN_NARRATION_MINUTES) => {
  const baseSentences = normalizedSegments
    .flatMap((segment) => [segment.name, segment.description])
    .flatMap((value) => splitSentences(value))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (!baseSentences.length) return [];

  const reflectiveCues = [
    "Let your exhale lengthen and allow your body to settle before you move forward.",
    "Notice one sensation in your chest and one sensation in your belly without trying to change either.",
    "Stay with the breath you have, not the breath you think you should have.",
    "If intensity rises, slow down and return to a softer rhythm.",
    "Choose kindness in pacing. Depth arrives through repetition and safety.",
    "Name one small action you can complete today that reflects this guidance.",
  ];

  const targetWordCount = Math.max(MIN_NARRATION_MINUTES * 115, Math.ceil(Number(targetMinutes || MIN_NARRATION_MINUTES) * 110));
  const expanded = [
    "Welcome. Begin with a slow inhale and a longer, softer exhale.",
    ...baseSentences,
  ];

  let loopIndex = 0;
  while (countWords(expanded.join(" ")) < targetWordCount) {
    const base = baseSentences[loopIndex % baseSentences.length];
    const cue = reflectiveCues[loopIndex % reflectiveCues.length];
    expanded.push(`${cue} ${base}`);
    loopIndex += 1;
    if (loopIndex > 220) break;
  }

  expanded.push("Close this practice by naming one grounded action you will complete in the next twenty four hours.");

  const chunks = [];
  let buffer = [];
  let words = 0;
  expanded.forEach((sentence) => {
    const sentenceWords = countWords(sentence);
    if (words >= 95 && buffer.length) {
      chunks.push(buffer.join(" "));
      buffer = [];
      words = 0;
    }
    buffer.push(sentence);
    words += sentenceWords;
  });

  if (buffer.length) chunks.push(buffer.join(" "));
  return chunks.filter(Boolean);
};
