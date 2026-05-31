import { AMBIENT_SOUNDS } from "../AmbientSoundPlayer";
import { createFilteredNoise } from "./practiceTimerUtils";
import { startToningLayer } from "../guided/guidedNarrationUtils";
import { appLogger } from "../../utils/logger";

export const startPracticeAmbientAudio = ({
  selectedBackgroundAudio,
  isMuted,
  audioVolume,
  element,
  enableToning,
  audioContextRef,
  gainNodeRef,
  toningLayerRef,
  sourcesRef,
  drumIntervalRef,
  bowlIntervalRef,
  setAudioPlaying,
}) => {
  const shouldPlayAmbient = selectedBackgroundAudio !== "silence";
  if (isMuted || (!shouldPlayAmbient && !enableToning)) return;

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

    if (shouldPlayAmbient) {
      const sound = AMBIENT_SOUNDS[selectedBackgroundAudio];
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
    }

    if (enableToning && toningLayerRef) {
      try {
        toningLayerRef.current?.stop?.();
      } catch (_) {
        // ignore stale toning cleanup errors
      }
      toningLayerRef.current = startToningLayer(ctx, element, gainNode);
      toningLayerRef.current?.setMuted?.(isMuted, audioVolume);
    }

    setAudioPlaying(true);
  } catch (error) {
    appLogger.warn("Web Audio API error:", error);
  }
};

export const playTimerTransitionBell = () => {
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
  } catch (error) {
    appLogger.error("PracticeTimer completion chime failed:", error);
  }
};