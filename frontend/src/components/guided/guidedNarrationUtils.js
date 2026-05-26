import { getGuidedToningMultiplier } from "../../utils/guidedToningSettings";

export const ELEMENT_AMBIENT = {
  fire: { freq: 120, Q: 2, gain: 0.12, label: "Sacred Fire" },
  water: { freq: 300, Q: 0.5, gain: 0.1, label: "Ocean Waves" },
  earth: { freq: 60, Q: 1, gain: 0.14, label: "Forest Depths" },
  air: { freq: 800, Q: 0.4, gain: 0.08, label: "Wind Breeze" },
  spirit: { freq: 432, Q: 1.5, gain: 0.09, label: "Crystal Bowls" },
};

export const ELEMENT_BG = {
  fire: "from-orange-950 via-red-950 to-black",
  water: "from-blue-950 via-cyan-950 to-black",
  earth: "from-emerald-950 via-green-950 to-black",
  air: "from-sky-950 via-cyan-950 to-black",
  spirit: "from-violet-950 via-purple-950 to-black",
};

export const ELEMENT_COLOR = {
  fire: "text-orange-400",
  water: "text-blue-400",
  earth: "text-emerald-400",
  air: "text-cyan-400",
  spirit: "text-violet-400",
};

export const MINIMUM_NARRATION_MINUTES = 7;
export const TARGET_WORDS_PER_MINUTE = 120;
export const SEGMENT_TARGET_WORDS = 220;
export const FIRST_SEGMENT_TARGET_WORDS = 95;
export const SCRIPT_EXPANSION_TIMEOUT_MS = 25000;
export const DEFAULT_GUIDED_TTS_SPEED = 0.82;

const TONING_ROOT_FREQ = {
  fire: 160,
  water: 144,
  earth: 128,
  air: 192,
  spirit: 216,
};

export const resolveToningGain = (element = "spirit") => {
  const normalized = String(element || "spirit").toLowerCase();
  const gainMap = {
    fire: 0.022,
    water: 0.026,
    earth: 0.024,
    air: 0.02,
    spirit: 0.024,
  };
  return gainMap[normalized] ?? gainMap.spirit;
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const countWords = (text) => String(text || "").trim().split(/\s+/).filter(Boolean).length;

export const buildBrownNoise = (ctx) => {
  const bufferSize = 2 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  return buf;
};

export const startAmbient = (ctx, element) => {
  const cfg = ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit;
  const buffer = buildBrownNoise(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cfg.freq;
  filter.Q.value = cfg.Q;

  const gain = ctx.createGain();
  gain.gain.value = cfg.gain;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  return { src: source, gain };
};

export const startToningLayer = (ctx, element = "spirit", destination = null) => {
  const normalized = String(element || "spirit").toLowerCase();
  const root = TONING_ROOT_FREQ[normalized] || TONING_ROOT_FREQ.spirit;

  const output = destination || ctx.destination;
  const intensityMultiplier = getGuidedToningMultiplier();
  if (intensityMultiplier <= 0) {
    return {
      setMuted: () => {},
      stop: () => {},
    };
  }

  const master = ctx.createGain();
  const targetGain = resolveToningGain(normalized) * intensityMultiplier;
  master.gain.value = targetGain;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1100;
  filter.Q.value = 0.7;

  master.connect(filter);
  filter.connect(output);

  const buildVoice = (frequency, type, level) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = level;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    return { osc, gain };
  };

  const voices = [
    buildVoice(root, "sine", 0.9),
    buildVoice(root * 1.5, "triangle", 0.22),
    buildVoice(root * 2, "sine", 0.1),
  ];

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.value = 0.11;
  lfoGain.gain.value = targetGain * 0.45;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  const setMuted = (muted, mix = 1) => {
    const normalizedMix = Math.max(0.08, Math.min(1, Number(mix) || 1));
    const nextGain = muted ? 0 : targetGain * normalizedMix;
    master.gain.setTargetAtTime(nextGain, ctx.currentTime, 0.08);
  };

  const stop = () => {
    voices.forEach(({ osc, gain }) => {
      try { osc.stop(); } catch (_) {}
      try { osc.disconnect(); } catch (_) {}
      try { gain.disconnect(); } catch (_) {}
    });
    try { lfo.stop(); } catch (_) {}
    try { lfo.disconnect(); } catch (_) {}
    try { lfoGain.disconnect(); } catch (_) {}
    try { master.disconnect(); } catch (_) {}
    try { filter.disconnect(); } catch (_) {}
  };

  return { setMuted, stop };
};

export const flattenTextValue = (value) => {
  if (!value) return [];
  if (typeof value === "string") return [value.trim()];
  if (Array.isArray(value)) return value.flatMap(flattenTextValue);
  if (typeof value === "object") return Object.values(value).flatMap(flattenTextValue);
  return [String(value).trim()];
};

const splitIntoSentences = (text) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);

const normalizeForRepeatCheck = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .trim();

const stemKey = (text) => normalizeForRepeatCheck(text).split(" ").slice(0, 10).join(" ");

export function buildNarrationPlan(practice, stepsOverride) {
  const targetMinutes = Math.max(MINIMUM_NARRATION_MINUTES, Number(practice?.duration_minutes || 0) || MINIMUM_NARRATION_MINUTES);
  const targetWords = Math.max(MINIMUM_NARRATION_MINUTES * TARGET_WORDS_PER_MINUTE, targetMinutes * TARGET_WORDS_PER_MINUTE);

  const sources = [
    stepsOverride,
    practice.steps,
    practice.process_steps,
    practice.cleansing_guide,
    practice.instructions,
    practice.visualization,
    practice.description,
    practice.why_this_heals,
    practice.practice_guide,
    practice.guidance,
    practice.spiritual_purpose,
    practice.extended_teachings,
    practice.meditation,
    practice.activation,
    practice.affirmations,
    practice.benefits,
    practice.therapeutic_benefits,
  ];

  const contentPool = Array.from(new Set(
    sources
      .flatMap(flattenTextValue)
      .flatMap(splitIntoSentences)
      .map((sentence) => sentence.replace(/\s+/g, " ").trim())
      .filter(Boolean)
  ));

  const stepPool = Array.from(new Set(
    [stepsOverride, practice.steps, practice.process_steps, practice.cleansing_guide, practice.instructions]
      .flatMap(flattenTextValue)
      .flatMap(splitIntoSentences)
      .map((sentence) => sentence.replace(/\s+/g, " ").trim())
      .filter(Boolean)
  ));

  const stepKeys = new Set(stepPool.map((line) => normalizeForRepeatCheck(line)));
  const contextPool = contentPool.filter((line) => !stepKeys.has(normalizeForRepeatCheck(line)));

  const fallbackSentence = `${practice.name || "This practice"} is a sacred return to the body, the breath, and the deeper intelligence already living within you.`;
  const richSentences = contentPool.length > 0 ? contentPool : [fallbackSentence];
  const usableContextBase = contextPool.length > 0 ? contextPool : richSentences;
  const expansionContext = [
    "Allow this experience to unfold without needing immediate results.",
    "Your breath can be both anchor and medicine in this moment.",
    "Stay in relationship with sensation instead of fighting it.",
    "Let your awareness stay wide and your effort stay light.",
    "You can move slowly and still go very deep.",
    "This phase is about receiving, not performing.",
  ];
  const usableContext = Array.from(new Set([...usableContextBase, ...expansionContext]));
  const benefits = flattenTextValue(practice.benefits || practice.therapeutic_benefits).filter(Boolean);
  const affirmations = flattenTextValue(practice.affirmations).filter(Boolean);

  const reflectionPrompts = [
    "Take a slower breath here. Let your pace soften so your body feels safe, not hurried.",
    "Notice the small shifts as they arise—warmth, emotion, memory, or a subtle sense of space opening within you.",
    "If your mind wanders, come back gently. Nothing has gone wrong; this is part of being human.",
    "Stay with this practice a little longer than is convenient. Patience is part of the medicine.",
    "Keep the breath low and steady. Let each exhale deepen safety, grounding, and permission.",
    "Receive this moment instead of forcing it. Depth appears when you soften enough to listen.",
    "If it helps, imagine you're being guided by a calm trusted presence.",
    "Whenever you're ready, let this next breath be a small reset.",
  ];

  const phaseOpeners = [
    "Settle into this next layer with calm, deliberate pacing.",
    "As you continue, keep awareness close to breath and sensation.",
    "From here, let focus become quieter, steadier, and more embodied.",
    "Move through this phase with gentleness, precision, and trust.",
    "Let the next moments unfold with patience instead of urgency.",
    "Continue in a way that feels grounded, receptive, and sustainable.",
    "Allow this next chapter to open gradually from inside your body.",
    "Keep listening to the subtle signals beneath movement.",
    "Let breath and body keep meeting in one shared rhythm.",
    "Stay present with simplicity and let depth come naturally.",
    "Give this phase enough time to become embodied.",
    "Remain patient while your system reorganizes toward steadiness.",
    "If you need to slow down, that is wisdom, not failure.",
    "Whenever you're ready, continue with a softer inner tone.",
  ];

  const focusLeads = [
    "Place awareness near",
    "Let this moment center on",
    "Allow your attention to rest with",
    "Re-orient gently toward",
    "Keep your internal focus with",
  ];

  const continuityLeads = [
    "Let this quality continue through your next breaths",
    "Allow this insight to keep shaping your inner rhythm",
    "Remain connected to this while the practice evolves",
    "Keep this quietly active in the background of awareness",
    "Carry this into the next exhale without effort",
    "Let this spread gently through the whole body",
    "Sustain this awareness while you keep moving",
    "Keep this perspective present without strain",
  ];

  const breathCues = [
    "Keep your exhale slightly longer than your inhale.",
    "Let the inhale arrive naturally without pulling.",
    "Allow each breath cycle to soften unnecessary tension.",
    "Breathe in a way that feels sustainable for your nervous system.",
    "Stay with smooth nasal breathing and relaxed shoulders.",
    "Let your ribcage move gently while jaw and tongue soften.",
    "Receive each inhale as support and each exhale as release.",
    "Stay with a quiet cadence that keeps you grounded.",
  ];

  const paragraphs = [
    `Welcome to ${practice.name}. Take one easy inhale and a slow exhale, then let yourself arrive fully in this moment.`,
    `Feel jaw, shoulders, belly, and heart. This ${practice.element || "spirit"} practice opens gently, gathers grounded strength through the middle, and closes in soft integration.`,
  ];

  if (practice.description) {
      paragraphs.push(`${practice.description} Let these words become an atmosphere around you, not something to rush. Breathe with them and let them open in your own timing.`);
  }

  if (stepPool.length > 0) {
    const stepFrames = ["Enter this phase through", "Now explore", "Let this stage begin with", "Move gently into"];
      const somaticPrompts = [
        "Keep your breath smooth while tracking subtle sensation.",
        "Stay curious about what shifts in your body as you continue.",
        "Let the instruction become embodied rather than rushed.",
        "Use each exhale to release effort and return to presence.",
      ];

    stepPool.slice(0, 4).forEach((stepLine, idx) => {
      const frame = stepFrames[idx % stepFrames.length];
      const prompt = somaticPrompts[idx % somaticPrompts.length];
      paragraphs.push(`${frame} ${stepLine}. ${prompt}`);
    });
  }

  const usedStems = new Set(paragraphs.map((paragraph) => stemKey(paragraph)).filter(Boolean));
  let runningWords = paragraphs.reduce((total, paragraph) => total + countWords(paragraph), 0);
  let index = 0;
  while (runningWords < targetWords - 180) {
    const opener = phaseOpeners[index % phaseOpeners.length];
    const primary = usableContext[index % usableContext.length] || fallbackSentence;
    const secondary = usableContext[(index + 3) % usableContext.length] || fallbackSentence;
    const reflection = reflectionPrompts[index % reflectionPrompts.length];
    const benefit = benefits[index % Math.max(benefits.length, 1)];
    const affirmation = affirmations[index % Math.max(affirmations.length, 1)];
    const focusLead = focusLeads[index % focusLeads.length];
    const continuityLead = continuityLeads[index % continuityLeads.length];
    const breathCue = breathCues[(index * 2 + 1) % breathCues.length];

    const variant = index % 3;
    const paragraph = variant === 0
      ? [
          opener,
          `${focusLead} ${primary}`,
          `${continuityLead}: ${secondary}`,
          breathCue,
          benefit ? `Allow this work to support ${benefit}.` : "Allow this work to support the places within you ready for healing and integration.",
          affirmation ? `Quietly repeat: ${affirmation}.` : "Quietly remind yourself that you are safe enough to stay present.",
          reflection,
        ].join(" ")
      : variant === 1
        ? [
            opener,
            primary,
            `${focusLead} ${secondary} while breath remains smooth and unforced.`,
            breathCue,
            affirmation ? `Carry this inward statement softly: ${affirmation}.` : "Stay gentle and receptive as this phase opens.",
            reflection,
          ].join(" ")
        : [
            opener,
            `${continuityLead}: ${primary}.`,
            `${focusLead} ${secondary}.`,
            breathCue,
            benefit ? `Notice how this begins to restore ${benefit}.` : "Notice how this begins to restore steadiness and trust.",
            reflection,
          ].join(" ");

    const paragraphStem = stemKey(paragraph);
    if (paragraphStem && usedStems.has(paragraphStem)) {
      index += 1;
      continue;
    }

    paragraphs.push(paragraph);
    runningWords += countWords(paragraph);
    if (paragraphStem) usedStems.add(paragraphStem);
    index += 1;
  }

  paragraphs.push(
    `As this guided practice begins to close, stay for a few final breaths and notice the shift in your body, your emotional tone, and your inner clarity.`,
    "When you feel complete, return gently. Carry this blend of grace and grounded power into the rest of your day."
  );

  const segments = [];
  let currentSegment = [];
  let currentSegmentWords = 0;
  paragraphs.forEach((paragraph) => {
    const paragraphWords = countWords(paragraph);
    const currentTarget = segments.length === 0 ? FIRST_SEGMENT_TARGET_WORDS : SEGMENT_TARGET_WORDS;
    if (currentSegment.length > 0 && (currentSegmentWords + paragraphWords) > currentTarget) {
      segments.push(currentSegment.join("\n\n"));
      currentSegment = [];
      currentSegmentWords = 0;
    }
    currentSegment.push(paragraph);
    currentSegmentWords += paragraphWords;
  });
  if (currentSegment.length > 0) segments.push(currentSegment.join("\n\n"));

  return { paragraphs, segments, targetMinutes };
}
