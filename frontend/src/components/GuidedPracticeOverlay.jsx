import { useState, useEffect, useRef, useCallback } from "react";
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

function formatTime(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

function buildNarration(practice, stepsOverride) {
  const raw = stepsOverride
    || practice.steps
    || practice.cleansing_guide
    || practice.instructions
    || practice.visualization
    || practice.description
    || "";

  const body = Array.isArray(raw) ? raw.map(String).join(" ... ") : String(raw).trim();
  const enrichedBody = body.length < 100 && practice.description
    ? `${practice.description} ... ${body}`
    : body;

  const intro = `Welcome to ${practice.name}. Find a comfortable position and allow yourself to arrive fully in this sacred space.`;
  const closing = "When you feel complete, gently return your awareness to the present moment. Take three slow, grounding breaths. Well done. Namaste.";

  return [intro, enrichedBody, closing].filter(Boolean).join("\n\n");
}

export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const totalDuration = Math.max(60, Number(practice?.duration_minutes || 20) * 60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(totalDuration);
  const [isComplete, setIsComplete] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const timerRef = useRef(null);
  const ttsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ambientRef = useRef(null);
  const ttsStartedRef = useRef(false);
  const sessionEndRef = useRef(null);
  const autoStartRef = useRef(false);
  const ttsUrlRef = useRef(null);

  const element = (practice?.element || "spirit").toLowerCase();
  const bgGradient = ELEMENT_BG[element] || ELEMENT_BG.spirit;
  const elColor = ELEMENT_COLOR[element] || ELEMENT_COLOR.spirit;
  const narration = buildNarration(practice, stepsOverride);

  const stopAmbient = useCallback(() => {
    try {
      ambientRef.current?.src?.stop?.();
    } catch (_) {}
    ambientRef.current = null;
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
    ttsStartedRef.current = false;
    ttsRef.current?.pause();
    if (ttsUrlRef.current) {
      URL.revokeObjectURL(ttsUrlRef.current);
      ttsUrlRef.current = null;
    }
    stopAmbient();
    setIsPlaying(false);
    setTimeRemaining(totalDuration);
    setIsComplete(false);
    setTtsLoading(false);
    setTtsPlaying(false);
    setHasStarted(false);
  }, [practice?.id, practice?.name, totalDuration, narration, stopAmbient]);

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
    stopAmbient();
    if (ttsUrlRef.current) URL.revokeObjectURL(ttsUrlRef.current);
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
  }, [stopAmbient]);

  const generateTTS = useCallback(async () => {
    if (ttsStartedRef.current) return;
    ttsStartedRef.current = true;
    setTtsLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/tts/generate-base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narration, voice: "nova", speed: 0.9 }),
      });
      const data = await response.json();
      if (data.audio_base64) {
        const binary = atob(data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        ttsUrlRef.current = url;

        const audio = new Audio(url);
        audio.muted = muted;
        ttsRef.current = audio;

        audio.addEventListener("play", () => setTtsPlaying(true));
        audio.addEventListener("pause", () => setTtsPlaying(false));
        audio.addEventListener("ended", () => setTtsPlaying(false));

        await audio.play().catch(() => {});
      }
    } catch (_) {
      ttsStartedRef.current = false;
    } finally {
      setTtsLoading(false);
    }
  }, [muted, narration]);

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

    if (ttsRef.current?.paused) {
      ttsRef.current.play().catch(() => {});
    }

    if (!ttsStartedRef.current) {
      generateTTS();
    }
  }, [generateTTS, isComplete, isPlaying, startAmbientTrack, syncRemainingFromClock, timeRemaining]);

  useEffect(() => {
    if (practice && !autoStartRef.current && !isComplete) {
      autoStartRef.current = true;
      handlePlay();
    }
  }, [practice, isComplete, handlePlay]);

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
                You have completed {practice.duration_minutes} minutes of sacred practice. Carry this energy with you.
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
                  {hasStarted ? "remaining" : `${practice.duration_minutes} min · ${(ELEMENT_AMBIENT[element] || ELEMENT_AMBIENT.spirit).label}`}
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
              {ttsPlaying && !ttsLoading && (
                <div className={`text-center text-xs ${elColor} mb-4`}>
                  Guided narration playing
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 p-5 mb-6" data-testid="guided-practice-description">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Visualization Guide</p>
                <div className="space-y-3">
                  {narration.split(/\n\n+/).map((paragraph, index) => (
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
