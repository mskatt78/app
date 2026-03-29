import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { AMBIENT_SOUNDS } from "./AmbientSoundPlayer";
import MeditationVisualizer from "./MeditationVisualizer";
import BreathingVisualizer from "./BreathingVisualizer";

const createBrownNoise = (audioContext) => {
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

const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const tempoPlaybackRates = { slow: 0.9, normal: 1.0, fast: 1.12 };

const PracticeTimer = ({
  segments = [],
  totalDuration = 300,
  onComplete,
  backgroundAudio = "silence",
  practiceType = "general",
  element = "Spirit",
  breathingPattern = null,
  visualizationType = "particles",
  allowSpeedControl = true,
  autoStartAudio = false,
  autoNarrate = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showVisuals, setShowVisuals] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [tempo, setTempo] = useState("normal");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState(null);

  const intervalRef = useRef(null);
  const sessionEndRef = useRef(null);
  const completionRef = useRef(false);
  const autoStartedRef = useRef(false);
  const lastSegmentIndexRef = useRef(0);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourcesRef = useRef([]);
  const drumIntervalRef = useRef(null);
  const bowlIntervalRef = useRef(null);
  const ttsAudioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const ttsUrlRef = useRef(null);

  const normalizedSegments = useMemo(() => {
    if (!segments.length) return [];

    const prepared = segments.map((segment) => ({
      ...segment,
      duration_seconds: segment.duration_seconds || segment.duration || 60,
    }));
    const preparedTotal = prepared.reduce((sum, segment) => sum + segment.duration_seconds, 0);

    if (!totalDuration || totalDuration <= 0 || preparedTotal === 0 || preparedTotal === totalDuration) {
      return prepared;
    }

    const difference = totalDuration - preparedTotal;
    const lastIndex = prepared.length - 1;
    prepared[lastIndex] = {
      ...prepared[lastIndex],
      duration_seconds: Math.max(1, prepared[lastIndex].duration_seconds + difference),
    };

    return prepared;
  }, [segments, totalDuration]);

  const segmentsTotal = normalizedSegments.reduce((sum, segment) => sum + segment.duration_seconds, 0);
  const calculatedTotal = totalDuration && totalDuration > 0 ? totalDuration : (segmentsTotal || 300);

  const segmentEndTimes = useMemo(() => {
    let runningTotal = 0;
    return normalizedSegments.map((segment) => {
      runningTotal += segment.duration_seconds;
      return runningTotal;
    });
  }, [normalizedSegments]);

  const currentSegmentIndex = useMemo(() => {
    if (!normalizedSegments.length) return 0;
    const foundIndex = segmentEndTimes.findIndex((segmentEnd) => totalElapsed < segmentEnd);
    return foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
  }, [normalizedSegments, segmentEndTimes, totalElapsed]);

  const currentSegment = normalizedSegments[currentSegmentIndex];
  const currentSegmentStart = currentSegmentIndex > 0 ? segmentEndTimes[currentSegmentIndex - 1] : 0;
  const currentSegmentDuration = currentSegment?.duration_seconds || 60;
  const segmentTime = currentSegment
    ? Math.min(currentSegmentDuration, Math.max(0, totalElapsed - currentSegmentStart))
    : 0;
  const remainingTime = Math.max(0, calculatedTotal - totalElapsed);
  const overallProgress = (totalElapsed / calculatedTotal) * 100;
  const segmentProgress = currentSegment ? (segmentTime / currentSegmentDuration) * 100 : 0;

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

  const cleanupAudio = useCallback(() => {
    if (drumIntervalRef.current) {
      clearInterval(drumIntervalRef.current);
      drumIntervalRef.current = null;
    }
    if (bowlIntervalRef.current) {
      clearInterval(bowlIntervalRef.current);
      bowlIntervalRef.current = null;
    }
    sourcesRef.current.forEach((source) => {
      try { source.stop?.(); } catch (_) {}
      try { source.disconnect?.(); } catch (_) {}
    });
    sourcesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    gainNodeRef.current = null;
    setAudioPlaying(false);
  }, []);

  const startAudio = useCallback(() => {
    if (backgroundAudio === "silence" || isMuted) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      let ctx;
      if (window.__warmAudioCtx && window.__warmAudioCtx.state !== "closed") {
        ctx = window.__warmAudioCtx;
        window.__warmAudioCtx = null;
        if (ctx.state === "suspended") ctx.resume();
      } else {
        ctx = new AudioContext();
        if (ctx.state === "suspended") ctx.resume();
      }

      audioContextRef.current = ctx;
      const gainNode = ctx.createGain();
      gainNode.gain.value = Math.max(audioVolume * 1.5, 0.6);
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
          const playDrum = () => {
            if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
            const now = ctx.currentTime;

            const drumBody = ctx.createOscillator();
            const drumGain = ctx.createGain();
            drumBody.type = "sine";
            drumBody.frequency.setValueAtTime(90, now);
            drumBody.frequency.exponentialRampToValueAtTime(50, now + 0.15);
            drumGain.gain.setValueAtTime(1.0, now);
            drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            drumBody.connect(drumGain);
            drumGain.connect(gainNode);
            drumBody.start(now);
            drumBody.stop(now + 0.35);

            const bufferSize = ctx.sampleRate * 0.05;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i += 1) {
              data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = "bandpass";
            noiseFilter.frequency.value = 200;
            noiseFilter.Q.value = 1.5;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.6, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(gainNode);
            noise.start(now);

            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = "sine";
            sub.frequency.setValueAtTime(45, now);
            subGain.gain.setValueAtTime(0.5, now);
            subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            sub.connect(subGain);
            subGain.connect(gainNode);
            sub.start(now);
            sub.stop(now + 0.25);
          };
          playDrum();
          drumIntervalRef.current = setInterval(playDrum, 222);
          break;
        }
        case "bowls":
        case "singing_bowls": {
          const playBowl = () => {
            if (!audioContextRef.current) return;
            [528, 1056, 1584].forEach((freq, index) => {
              const osc = ctx.createOscillator();
              const oscGain = ctx.createGain();
              osc.type = "sine";
              osc.frequency.value = freq;
              const volume = 0.15 / (index + 1);
              oscGain.gain.setValueAtTime(0, ctx.currentTime);
              oscGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
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
        default:
          break;
      }

      setAudioPlaying(true);
    } catch (error) {
      console.warn("Web Audio API error:", error);
    }
  }, [audioVolume, backgroundAudio, isMuted]);

  const playTransitionBell = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, ctx.currentTime);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 1.0);
      setTimeout(() => ctx.close(), 2000);
    } catch (_) {}
  }, []);

  const syncElapsedFromClock = useCallback(() => {
    if (!sessionEndRef.current) return;

    const nextRemaining = Math.max(0, Math.ceil((sessionEndRef.current - Date.now()) / 1000));
    const nextElapsed = Math.min(calculatedTotal, calculatedTotal - nextRemaining);

    if (normalizedSegments.length > 0) {
      const foundIndex = segmentEndTimes.findIndex((segmentEnd) => nextElapsed < segmentEnd);
      const nextSegmentIndex = foundIndex === -1 ? normalizedSegments.length - 1 : foundIndex;
      if (nextSegmentIndex !== lastSegmentIndexRef.current && nextElapsed < calculatedTotal) {
        if (!isMuted) playTransitionBell();
        lastSegmentIndexRef.current = nextSegmentIndex;
      }
    }

    setTotalElapsed(nextElapsed);

    if (nextElapsed >= calculatedTotal && !completionRef.current) {
      completionRef.current = true;
      sessionEndRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      cleanupAudio();
      ttsAudioRef.current?.pause();
      if (!isMuted) playTransitionBell();
      onComplete?.();
    }
  }, [calculatedTotal, cleanupAudio, isMuted, normalizedSegments.length, onComplete, playTransitionBell, segmentEndTimes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(syncElapsedFromClock, 250);
      syncElapsedFromClock();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, syncElapsedFromClock]);

  useEffect(() => {
    if (autoStartAudio && !autoStartedRef.current && calculatedTotal > 0) {
      autoStartedRef.current = true;
      completionRef.current = false;
      lastSegmentIndexRef.current = currentSegmentIndex;
      sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
      setIsRunning(true);
    }
  }, [autoStartAudio, calculatedTotal, currentSegmentIndex, totalElapsed]);

  useEffect(() => {
    if (isRunning && !isMuted && backgroundAudio !== "silence") {
      if (!audioPlaying) startAudio();
    } else {
      cleanupAudio();
    }
  }, [audioPlaying, backgroundAudio, cleanupAudio, isMuted, isRunning, startAudio]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : audioVolume * 0.5;
    }
  }, [audioVolume, isMuted]);

  useEffect(() => {
    if (!autoNarrate || !currentSegment) return;

    const text = (currentSegment.description || currentSegment.name || "").trim();
    if (!text) return;

    if (ttsAbortRef.current) ttsAbortRef.current.abort();
    const controller = new AbortController();
    ttsAbortRef.current = controller;

    if (ttsUrlRef.current) {
      URL.revokeObjectURL(ttsUrlRef.current);
      ttsUrlRef.current = null;
      setTtsAudioUrl(null);
    }

    setTtsLoading(true);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    fetch(`${backendUrl}/api/tts/generate-base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 3800), voice: "nova", speed: 0.85 }),
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.audio_base64) return;
        const binary = atob(data.audio_base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        ttsUrlRef.current = url;
        setTtsAudioUrl(url);
      })
      .catch(() => {})
      .finally(() => setTtsLoading(false));
  }, [autoNarrate, currentSegment]);

  useEffect(() => {
    if (ttsAudioUrl && ttsAudioRef.current) {
      ttsAudioRef.current.src = ttsAudioUrl;
      ttsAudioRef.current.playbackRate = tempoPlaybackRates[tempo] || 1;
      if (isRunning) ttsAudioRef.current.play().catch(() => {});
    }
  }, [isRunning, tempo, ttsAudioUrl]);

  useEffect(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.playbackRate = tempoPlaybackRates[tempo] || 1;
      ttsAudioRef.current.muted = isMuted;
    }
  }, [isMuted, tempo]);

  useEffect(() => () => {
    if (ttsAbortRef.current) ttsAbortRef.current.abort();
    if (ttsUrlRef.current) URL.revokeObjectURL(ttsUrlRef.current);
    cleanupAudio();
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [cleanupAudio]);

  const warmAudioContext = () => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!window.__warmAudioCtx || window.__warmAudioCtx.state === "closed") {
        const ctx = new AC();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        window.__warmAudioCtx = ctx;
      }
    } catch (_) {}
  };

  const handlePlayPause = () => {
    if (isRunning) {
      syncElapsedFromClock();
      sessionEndRef.current = null;
      setIsRunning(false);
      ttsAudioRef.current?.pause();
      cleanupAudio();
      return;
    }

    warmAudioContext();
    completionRef.current = false;
    lastSegmentIndexRef.current = currentSegmentIndex;
    sessionEndRef.current = Date.now() + ((calculatedTotal - totalElapsed) * 1000);
    setIsRunning(true);
    if (ttsAudioRef.current?.paused) ttsAudioRef.current.play().catch(() => {});
  };

  const handleReset = () => {
    sessionEndRef.current = null;
    completionRef.current = false;
    lastSegmentIndexRef.current = 0;
    setIsRunning(false);
    setTotalElapsed(0);
    ttsAudioRef.current?.pause();
    cleanupAudio();
  };

  const handleSkipSegment = () => {
    if (currentSegmentIndex >= normalizedSegments.length - 1) return;

    const nextElapsed = segmentEndTimes[currentSegmentIndex];
    setTotalElapsed(nextElapsed);
    lastSegmentIndexRef.current = currentSegmentIndex + 1;
    if (isRunning) {
      sessionEndRef.current = Date.now() + ((calculatedTotal - nextElapsed) * 1000);
    }
    if (!isMuted) playTransitionBell();
  };

  return (
    <div className="relative bg-card/50 border border-white/10 rounded-2xl p-6 space-y-6 overflow-hidden">
      {showVisuals && (
        <MeditationVisualizer
          type={getVisualization()}
          element={element}
          isActive={isRunning}
          intensity={0.4}
          className="opacity-50"
        />
      )}

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

      <div className="relative z-10 text-center">
        <div className="text-6xl font-light tracking-wider mb-2" data-testid="practice-timer-remaining">
          {formatTime(remainingTime)}
        </div>
        <p className="text-sm text-muted-foreground">remaining</p>
      </div>

      {currentSegment && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-4" data-testid="practice-timer-current-segment">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentSegmentIndex + 1} of {normalizedSegments.length}
            </span>
            <span className="text-sm text-primary">{formatTime(currentSegmentDuration - segmentTime)}</span>
          </div>
          <h4 className="font-medium text-lg mb-2">{currentSegment.name}</h4>
          {currentSegment.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">{currentSegment.description}</p>
          )}
          <Progress value={segmentProgress} className="h-2" />
          {currentSegment.has_audio && !isMuted && audioPlaying && (
            <p className="text-xs text-primary/70 mt-2 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" /> Sound playing
            </p>
          )}
          {autoNarrate && ttsLoading && (
            <p className="text-xs text-violet-400/80 mt-2 flex items-center gap-1 animate-pulse">
              <Volume2 className="w-3 h-3" /> Preparing narration...
            </p>
          )}
          {autoNarrate && ttsAudioUrl && !ttsLoading && (
            <p className="text-xs text-violet-400/80 mt-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Narrating step...
            </p>
          )}
          {!isMuted && backgroundAudio !== "silence" && !audioPlaying && (
            <p className="text-xs text-amber-400/70 mt-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Tap play to start audio
            </p>
          )}
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Overall Progress</span>
          <span>{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="h-1" />
      </div>

      <div className="relative z-10 flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full border-white/10" data-testid="timer-reset">
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          size="lg"
          onClick={handlePlayPause}
          className={`rounded-full w-16 h-16 ${isRunning ? "bg-orange-500 hover:bg-orange-600" : "bg-primary"}`}
          data-testid="timer-play-pause"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </Button>

        {normalizedSegments.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipSegment}
            disabled={currentSegmentIndex >= normalizedSegments.length - 1}
            className="rounded-full border-white/10"
            data-testid="timer-skip"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        )}

        <Button variant="outline" size="icon" onClick={() => setIsMuted((current) => !current)} className="rounded-full border-white/10" data-testid="timer-mute">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={() => setShowVisuals((current) => !current)} className="rounded-full border-white/10" data-testid="timer-visuals">
          {showVisuals ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
      </div>

      {allowSpeedControl && (
        <div className="relative z-10 bg-white/5 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Practice Speed</span>
            <span className="text-xs text-primary">
              {tempo === "slow" ? "Slow (Relaxed)" : tempo === "fast" ? "Fast (Energizing)" : "Normal"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("slow")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "slow" ? "bg-blue-500/20 text-blue-400" : ""}`}>
              Slow
            </Button>
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("normal")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "normal" ? "bg-primary/20 text-primary" : ""}`}>
              Normal
            </Button>
            <Button variant="ghost" size="sm" onClick={() => !isRunning && setTempo("fast")} disabled={isRunning} className={`flex-1 text-xs ${tempo === "fast" ? "bg-orange-500/20 text-orange-400" : ""}`}>
              Fast
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {tempo === "slow"
              ? "Softer narration pace while the full timer still stays exact"
              : tempo === "fast"
                ? "Brighter narration pace while the full timer still stays exact"
                : "Balanced narration pace with precise timing"}
          </p>
        </div>
      )}

      {backgroundAudio && backgroundAudio !== "silence" && (
        <div className="relative z-10">
          <p className="text-xs text-center text-muted-foreground mb-2">
            Background: {AMBIENT_SOUNDS[backgroundAudio]?.name || backgroundAudio.replace(/_/g, " ")}
          </p>
          {!isMuted && isRunning && (
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume * 100}
                onChange={(event) => setAudioVolume(event.target.value / 100)}
                className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                data-testid="timer-volume-slider"
              />
            </div>
          )}
        </div>
      )}

      {autoNarrate && <audio ref={ttsAudioRef} style={{ display: "none" }} />}
    </div>
  );
};

export default PracticeTimer;
