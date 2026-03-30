import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, Volume2, VolumeX, CheckCircle2 } from "lucide-react";

const ELEMENT_AMBIENT = {
  fire: { freq: 120, Q: 2, gain: 0.12, label: "Sacred Fire" },
  water: { freq: 300, Q: 0.5, gain: 0.1, label: "Ocean Waves" },
  earth: { freq: 60, Q: 1, gain: 0.14, label: "Forest Depths" },
  air: { freq: 800, Q: 0.4, gain: 0.08, label: "Wind Breeze" },
  spirit: { freq: 432, Q: 1.5, gain: 0.09, label: "Crystal Bowls" },
};

const ELEMENT_BG = {
  fire: "from-orange-950 via-red-950 to-black",
  water: "from-blue-950 via-cyan-950 to-black",
  earth: "from-emerald-950 via-green-950 to-black",
  air: "from-sky-950 via-cyan-950 to-black",
  spirit: "from-violet-950 via-purple-950 to-black",
};

const ELEMENT_COLOR = {
  fire: "text-orange-400",
  water: "text-blue-400",
  earth: "text-emerald-400",
  air: "text-cyan-400",
  spirit: "text-violet-400",
};

const MINIMUM_NARRATION_MINUTES = 7;
const TARGET_WORDS_PER_MINUTE = 120;
const SEGMENT_TARGET_WORDS = 220;
const SCRIPT_EXPANSION_TIMEOUT_MS = 25000;

function formatTime(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function buildBrownNoise(ctx) {
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
}

function startAmbient(ctx, element) {
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
}

function flattenTextValue(value) {
  if (!value) return [];
  if (typeof value === "string") return [value.trim()];
  if (Array.isArray(value)) return value.flatMap(flattenTextValue);
  if (typeof value === "object") return Object.values(value).flatMap(flattenTextValue);
  return [String(value).trim()];
}

function splitIntoSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

function normalizeForRepeatCheck(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .trim();
}

function buildNarrationPlan(practice, stepsOverride) {
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
    "Breathe slowly here. Let the pace soften so your body does not feel rushed. There is nowhere else you need to be right now.",
    "Notice the smallest shifts as they arise: warmth, tingling, emotion, memory, or a subtle sense of spaciousness opening within you.",
    "If your mind wanders, come back gently. This is not a performance. It is a return to the truth already living inside your body.",
    "Stay with the practice a little longer than feels convenient. Let patience become part of the medicine.",
    "Keep the breath low and steady. Allow each exhale to lengthen the feeling of safety, grounding, and inner permission.",
    "Receive this moment instead of trying to force it. The practice deepens when you soften enough to listen.",
  ];

  const phaseOpeners = [
    "Now settle into the next layer of the practice with calm, deliberate pacing.",
    "As you continue, keep your awareness close to breath and sensation.",
    "From here, let your focus become quieter, steadier, and more embodied.",
    "Move through this phase with gentleness, precision, and trust.",
    "Let the next moments unfold with patience rather than urgency.",
    "Continue in a way that feels grounded, receptive, and sustainable.",
    "Allow this next chapter to open gradually from inside your body.",
    "Keep listening to the subtle signals beneath the surface of movement.",
    "Let your breath and body keep meeting in one shared rhythm.",
    "Stay present with simplicity and let depth come naturally.",
    "Give this phase enough time to become truly embodied.",
    "Remain patient while your system reorganizes toward steadiness.",
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
    `Welcome to ${practice.name}. Settle into a comfortable position and let your breath begin to slow. Allow the outer world to soften at the edges so your awareness can gather here, in this sacred practice, with your full and willing presence.`,
    `Begin by arriving deliberately. Feel the surface beneath you. Notice your jaw, your shoulders, your belly, and your heart. Let yourself unclench in any place that has been carrying too much. This practice belongs to the ${practice.element || "spirit"} element, inviting you into steadiness, receptivity, and deeper inner contact.`,
  ];

  if (practice.description) {
    paragraphs.push(`${practice.description} Let these words become an atmosphere around you, not something to rush through. Breathe with them. Feel them. Let them open slowly in your own timing.`);
  }

  if (stepPool.length > 0) {
    const stepFrames = [
      "Enter this phase through",
      "Now explore",
      "Let this stage begin with",
      "Move gently into",
    ];
    const somaticPrompts = [
      "Keep your breath smooth while tracking subtle sensation.",
      "Stay curious about what shifts in your body as you continue.",
      "Let the instruction become embodied instead of rushed.",
      "Use each exhale to release effort and return to presence.",
    ];

    stepPool.slice(0, 4).forEach((stepLine, idx) => {
      const frame = stepFrames[idx % stepFrames.length];
      const prompt = somaticPrompts[idx % somaticPrompts.length];
      const paragraph = `${frame} ${stepLine}. ${prompt}`;
      paragraphs.push(paragraph);
    });
  }

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

    paragraphs.push(paragraph);
    runningWords += countWords(paragraph);
    index += 1;
  }

  paragraphs.push(
    `As this guided practice begins to close, do not leave it too quickly. Let the medicine settle. Notice what has changed in your breath, your body, your feeling state, or your inner images. Honor even the smallest shift. It matters.`,
    "When you feel complete, gently return your awareness to the present moment. Take three slow, grounding breaths. Carry the truth of this practice with you. Well done. Namaste."
  );

  const segments = [];
  let currentSegment = [];
  let currentSegmentWords = 0;
  paragraphs.forEach((paragraph) => {
    const paragraphWords = countWords(paragraph);
    if (currentSegmentWords >= SEGMENT_TARGET_WORDS && currentSegment.length > 0) {
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

export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const narrationPlan = useMemo(() => buildNarrationPlan(practice || {}, stepsOverride), [practice, stepsOverride]);
  const totalDuration = Math.max(MINIMUM_NARRATION_MINUTES * 60, Number(practice?.duration_minutes || 20) * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(totalDuration);
  const [isComplete, setIsComplete] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [narrationParagraphs, setNarrationParagraphs] = useState(narrationPlan.paragraphs);
  const [narrationSegments, setNarrationSegments] = useState(narrationPlan.segments);
  const [narrationReady, setNarrationReady] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const timerRef = useRef(null);
  const ttsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const sessionEndRef = useRef(null);
  const autoStartRef = useRef(false);
  const isPlayingRef = useRef(false);
  const ttsCacheRef = useRef(new Map());
  const ttsPendingRef = useRef(new Map());
  const currentSegmentIndexRef = useRef(0);
  const scriptAbortRef = useRef(null);

  const element = (practice?.element || "spirit").toLowerCase();
  const bgGradient = ELEMENT_BG[element] || ELEMENT_BG.spirit;
  const elColor = ELEMENT_COLOR[element] || ELEMENT_COLOR.spirit;

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const stopAmbient = useCallback(() => {
    try {
      ambientRef.current?.src?.stop?.();
    } catch (_) {}
    ambientRef.current = null;
  }, []);

  const clearNarrationCache = useCallback(() => {
    ttsPendingRef.current.clear();
    ttsCacheRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (_) {}
    });
    ttsCacheRef.current.clear();
  }, []);

  const syncRemainingFromClock = useCallback(() => {
    if (!sessionEndRef.current) return;

    const nextRemaining = Math.max(0, Math.ceil((sessionEndRef.current - Date.now()) / 1000));
    setTimeRemaining(nextRemaining);

    if (nextRemaining <= 0) {
      clearInterval(timerRef.current);
      sessionEndRef.current = null;
      setIsPlaying(false);
      setIsComplete(true);
      ttsRef.current?.pause();
      stopAmbient();
    }
  }, [stopAmbient]);

  useEffect(() => {
    clearInterval(timerRef.current);
    sessionEndRef.current = null;
    autoStartRef.current = false;
    currentSegmentIndexRef.current = 0;
    setCurrentSegmentIndex(0);
    ttsRef.current?.pause();
    clearNarrationCache();
    scriptAbortRef.current?.abort?.();
    scriptAbortRef.current = null;
    stopAmbient();
    setIsPlaying(false);
    setTimeRemaining(totalDuration);
    setIsComplete(false);
    setTtsLoading(false);
    setTtsPlaying(false);
    setHasStarted(false);
    setNarrationParagraphs(narrationPlan.paragraphs);
    setNarrationSegments(narrationPlan.segments);
    setNarrationReady(false);
    setScriptLoading(Boolean(practice));
  }, [practice?.id, practice?.name, totalDuration, clearNarrationCache, stopAmbient, narrationPlan, practice]);

  useEffect(() => {
    if (!practice) {
      setScriptLoading(false);
      setNarrationReady(false);
      return undefined;
    }

    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      setScriptLoading(false);
      setNarrationReady(true);
      return undefined;
    }

    const controller = new AbortController();
    scriptAbortRef.current?.abort?.();
    scriptAbortRef.current = controller;
    const timeoutId = window.setTimeout(() => controller.abort(), SCRIPT_EXPANSION_TIMEOUT_MS);

    const expandScript = async () => {
      const sourceTexts = Array.from(new Set(
        [
          practice.description,
          practice.why_this_heals,
          practice.practice_guide,
          practice.guidance,
          practice.spiritual_purpose,
          practice.extended_teachings,
          practice.meditation,
          practice.visualization,
          practice.activation,
          practice.affirmations,
          practice.benefits,
          practice.therapeutic_benefits,
          stepsOverride,
          practice.steps,
          practice.process_steps,
          practice.cleansing_guide,
          practice.instructions,
        ].flatMap(flattenTextValue).filter(Boolean)
      )).slice(0, 80);

      const steps = Array.from(new Set(
        [stepsOverride, practice.steps, practice.process_steps, practice.cleansing_guide, practice.instructions]
          .flatMap(flattenTextValue)
          .filter(Boolean)
      )).slice(0, 40);

      try {
        const response = await fetch(`${backendUrl}/api/content/expand-script`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            practice_id: practice.id || null,
            practice_name: practice.name || "Guided Practice",
            element: practice.element || "Spirit",
            duration_minutes: practice.duration_minutes || MINIMUM_NARRATION_MINUTES,
            use_ai: true,
            steps,
            source_texts: sourceTexts,
          }),
        });

        if (!response.ok || controller.signal.aborted) return;
        const data = await response.json();
        const nextParagraphs = Array.isArray(data?.paragraphs) ? data.paragraphs.filter(Boolean) : [];
        const nextSegments = Array.isArray(data?.segments) ? data.segments.filter(Boolean) : [];

        if (nextParagraphs.length > 0 && nextSegments.length > 0) {
          setNarrationParagraphs(nextParagraphs);
          setNarrationSegments(nextSegments);
          currentSegmentIndexRef.current = 0;
          setCurrentSegmentIndex(0);
          clearNarrationCache();
          ttsRef.current?.pause();
        }
      } catch (_) {
        // Keep local fallback narration plan when expansion fails or times out.
      } finally {
        window.clearTimeout(timeoutId);
        if (!controller.signal.aborted) {
          setScriptLoading(false);
          setNarrationReady(true);
        }
        if (scriptAbortRef.current === controller) {
          scriptAbortRef.current = null;
        }
      }
    };

    expandScript();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      if (scriptAbortRef.current === controller) {
        scriptAbortRef.current = null;
      }
    };
  }, [practice, stepsOverride, clearNarrationCache]);

  useEffect(() => {
    if (isPlaying && !isComplete) {
      timerRef.current = setInterval(syncRemainingFromClock, 250);
      syncRemainingFromClock();
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, isComplete, syncRemainingFromClock]);

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    }
    if (ttsRef.current) ttsRef.current.muted = muted;
  }, [muted, element]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    ttsRef.current?.pause();
    scriptAbortRef.current?.abort?.();
    stopAmbient();
    clearNarrationCache();
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
  }, [clearNarrationCache, stopAmbient]);

  const generateSegmentUrl = useCallback(async (segmentIndex) => {
    if (!narrationSegments[segmentIndex]) return null;
    if (ttsCacheRef.current.has(segmentIndex)) return ttsCacheRef.current.get(segmentIndex);
    if (ttsPendingRef.current.has(segmentIndex)) return ttsPendingRef.current.get(segmentIndex);

    const promise = (async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/tts/generate-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narrationSegments[segmentIndex], voice: "nova", speed: 0.88 }),
      });
      const data = await response.json();
      if (!data.audio_base64) return null;
      const binary = atob(data.audio_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      ttsCacheRef.current.set(segmentIndex, url);
      return url;
    })().finally(() => {
      ttsPendingRef.current.delete(segmentIndex);
    });

    ttsPendingRef.current.set(segmentIndex, promise);
    return promise;
  }, [narrationSegments]);

  const playNarrationSegment = useCallback(async (segmentIndex) => {
    if (!narrationSegments[segmentIndex]) return;

    setTtsLoading(!ttsCacheRef.current.has(segmentIndex));
    try {
      const url = await generateSegmentUrl(segmentIndex);
      if (!url || !isPlayingRef.current) return;

      let audio = ttsRef.current;
      if (!audio) {
        audio = new Audio();
        ttsRef.current = audio;
      }

      currentSegmentIndexRef.current = segmentIndex;
      setCurrentSegmentIndex(segmentIndex);
      audio.muted = muted;
      audio.src = url;
      audio.currentTime = 0;
      audio.onplay = () => {
        setTtsPlaying(true);
        generateSegmentUrl(segmentIndex + 1).catch(() => {});
      };
      audio.onpause = () => setTtsPlaying(false);
      audio.onended = () => {
        setTtsPlaying(false);
        const nextIndex = segmentIndex + 1;
        currentSegmentIndexRef.current = nextIndex;
        setCurrentSegmentIndex(nextIndex);
        if (sessionEndRef.current && isPlayingRef.current && narrationSegments[nextIndex]) {
          playNarrationSegment(nextIndex);
        }
      };
      await audio.play().catch(() => {});
    } catch (_) {
      setTtsPlaying(false);
    } finally {
      setTtsLoading(false);
    }
  }, [generateSegmentUrl, muted, narrationSegments]);

  const startAmbientTrack = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        ambientRef.current = startAmbient(ctx, element);
      } catch (_) {
        return;
      }
    }

    if (ambientRef.current) {
      ambientRef.current.gain.gain.value = muted ? 0 : (ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).gain;
    }
  }, [element, muted]);

  const handlePlay = useCallback(() => {
    if (isComplete) return;

    if (isPlaying) {
      syncRemainingFromClock();
      sessionEndRef.current = null;
      setIsPlaying(false);
      ttsRef.current?.pause();
      if (ambientRef.current) ambientRef.current.gain.gain.value = 0;
      return;
    }

    sessionEndRef.current = Date.now() + (timeRemaining * 1000);
    setIsPlaying(true);
    setHasStarted(true);
    startAmbientTrack();

    if (ttsRef.current?.paused && ttsRef.current?.src) {
      ttsRef.current.play().catch(() => {});
      return;
    }

    playNarrationSegment(currentSegmentIndexRef.current);
  }, [isComplete, isPlaying, playNarrationSegment, startAmbientTrack, syncRemainingFromClock, timeRemaining]);

  useEffect(() => {
    if (practice && narrationReady && !autoStartRef.current && !isComplete) {
      autoStartRef.current = true;
      handlePlay();
    }
  }, [practice, narrationReady, isComplete, handlePlay]);

  if (!practice) return null;

  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] bg-gradient-to-b ${bgGradient} flex flex-col`}
      data-testid="guided-practice-overlay"
    >
      <div className="flex items-center justify-between px-5 pt-6 pb-3 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Guided Practice</p>
          <h2 className="text-lg font-serif text-white truncate" data-testid="guided-practice-title">{practice.name}</h2>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            onClick={() => setMuted((current) => !current)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={muted ? "Unmute" : "Mute"}
            data-testid="guided-mute-btn"
          >
            {muted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-white/80" />}
          </button>
          <button
            onClick={onExit}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            data-testid="guided-close-top"
            aria-label="Exit practice"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-6"
              data-testid="practice-complete-screen"
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
              <div>
                <h3 className="text-3xl font-serif text-white mb-3">Practice Complete</h3>
                <p className="text-white/60 text-sm">{practice.name}</p>
              </div>
              <p className="text-white/50 text-sm max-w-xs">
                You have completed {Math.max(MINIMUM_NARRATION_MINUTES, practice.duration_minutes || MINIMUM_NARRATION_MINUTES)} minutes of sacred practice. Carry this energy with you.
              </p>
              <button
                onClick={onExit}
                className="mt-2 px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium"
                data-testid="guided-exit-complete"
              >
                Return
              </button>
            </motion.div>
          ) : (
            <motion.div key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
              <div className="text-center mt-6 mb-4">
                <p className={`text-7xl font-serif font-light ${elColor} tabular-nums`}>
                  <span data-testid="guided-practice-timer">{formatTime(timeRemaining)}</span>
                </p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-widest">
                  {hasStarted
                    ? "remaining"
                    : scriptLoading
                      ? "Preparing long-form guidance..."
                      : `${Math.max(MINIMUM_NARRATION_MINUTES, practice.duration_minutes || MINIMUM_NARRATION_MINUTES)} min · ${(ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).label}`}
                </p>
              </div>

              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    element === "fire"
                      ? "from-orange-500 to-red-500"
                      : element === "water"
                        ? "from-blue-500 to-cyan-500"
                        : element === "earth"
                          ? "from-emerald-500 to-green-500"
                          : element === "air"
                            ? "from-sky-500 to-cyan-500"
                            : "from-violet-500 to-purple-500"
                  }`}
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>

              {ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4 flex items-center justify-center gap-2`}>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Preparing your guide...
                </div>
              )}
              {scriptLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`} data-testid="guided-script-expanding-status">
                  Weaving an expanded guided script for your full session...
                </div>
              )}
              {ttsPlaying && !ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`}>
                  Guided narration playing • section {Math.min(currentSegmentIndex + 1, narrationSegments.length)} of {narrationSegments.length}
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 p-5 mb-6" data-testid="guided-practice-description">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Visualization Guide</p>
                <div className="space-y-3">
                  {narrationParagraphs.map((paragraph, index) => (
                    <p key={`${practice.id || practice.name}-${index}`} className="text-sm text-white/70 leading-relaxed">{paragraph.trim()}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={handlePlay}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isPlaying
                      ? "bg-white/20 hover:bg-white/30"
                      : `bg-gradient-to-br ${
                          element === "fire"
                            ? "from-orange-500 to-red-600"
                            : element === "water"
                              ? "from-blue-500 to-cyan-600"
                              : element === "earth"
                                ? "from-emerald-500 to-green-600"
                                : element === "air"
                                  ? "from-sky-500 to-cyan-600"
                                  : "from-violet-500 to-purple-600"
                        } hover:opacity-90`
                  }`}
                  data-testid="guided-play-btn"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isComplete && (
        <div className="flex-shrink-0 px-5 pb-6 pt-2">
          <button
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/40"
            data-testid="guided-exit-btn"
          >
            <X className="w-4 h-4" /> Exit Practice
          </button>
        </div>
      )}
    </motion.div>
  );
}
