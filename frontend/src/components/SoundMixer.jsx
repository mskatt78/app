import { useEffect, useRef, useState } from "react";
import { Layers, Lock, MoonStar, Pause, Play, TimerOff } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";

const FADE_SECONDS = 30;
const TIMER_OPTIONS = [15, 30, 60];
const NONE = "none";

const MixerLayer = ({ label, sounds, value, onChange, volume, onVolume, testPrefix }) => (
  <div className="p-4 rounded-xl bg-black/20 border border-white/10">
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-card border-white/10" data-testid={`${testPrefix}-select`}>
        <SelectValue placeholder="Choose a sound" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>— None —</SelectItem>
        {sounds.map((sound) => (
          <SelectItem key={sound.id} value={sound.id} disabled={sound.locked} data-testid={`${testPrefix}-option-${sound.id}`}>
            <span className="flex items-center gap-2">
              {sound.locked && <Lock className="w-3 h-3 text-fuchsia-300" />}
              {sound.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <div className="mt-4 flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-12">Volume</span>
      <Slider value={[volume]} min={0} max={100} step={5} onValueChange={(v) => onVolume(v[0])} data-testid={`${testPrefix}-volume`} />
      <span className="text-xs text-muted-foreground w-8 text-right">{volume}%</span>
    </div>
  </div>
);

export const SoundMixer = ({ sounds }) => {
  const audioA = useRef(null);
  const audioB = useRef(null);
  const fadeFactor = useRef(1);
  const [layerA, setLayerA] = useState(NONE);
  const [layerB, setLayerB] = useState(NONE);
  const [volA, setVolA] = useState(80);
  const [volB, setVolB] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [activeMinutes, setActiveMinutes] = useState(null);
  const [remaining, setRemaining] = useState(0);

  const soundById = (id) => sounds.find((s) => s.id === id);
  const srcA = soundById(layerA)?.audio_url || "";
  const srcB = soundById(layerB)?.audio_url || "";

  const applyVolumes = (a = volA, b = volB) => {
    if (audioA.current) audioA.current.volume = (a / 100) * fadeFactor.current;
    if (audioB.current) audioB.current.volume = (b / 100) * fadeFactor.current;
  };

  useEffect(() => { applyVolumes(); }, [volA, volB]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    [[audioA, srcA], [audioB, srcB]].forEach(([ref, src]) => {
      const audio = ref.current;
      if (!audio) return;
      if (!src) { audio.pause(); return; }
      if (playing) audio.play().catch(() => {});
    });
    applyVolumes();
  }, [srcA, srcB, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAll = () => {
    setPlaying(false);
    fadeFactor.current = 1;
    setActiveMinutes(null);
    setRemaining(0);
    [audioA, audioB].forEach((ref) => ref.current && ref.current.pause());
  };

  useEffect(() => {
    if (!activeMinutes) return undefined;
    const tick = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= FADE_SECONDS) {
          fadeFactor.current = Math.max(0, next / FADE_SECONDS);
          applyVolumes();
        }
        if (next <= 0) {
          stopAll();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [activeMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasSound = Boolean(srcA || srcB);
  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <section className="mb-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5" data-testid="sound-mixer">
      <div className="flex items-center gap-2 mb-1">
        <Layers className="w-4 h-4 text-cyan-300" />
        <h3 className="text-sm uppercase tracking-wider text-cyan-200">Sound Mixer</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Layer two sounds together — like sacred rain over shamanic drums — to weave your personal soundscape.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MixerLayer label="Layer One" sounds={sounds} value={layerA} onChange={setLayerA} volume={volA} onVolume={setVolA} testPrefix="mixer-layer-a" />
        <MixerLayer label="Layer Two" sounds={sounds} value={layerB} onChange={setLayerB} volume={volB} onVolume={setVolB} testPrefix="mixer-layer-b" />
      </div>
      <audio ref={audioA} loop src={srcA || undefined} data-testid="mixer-audio-a" />
      <audio ref={audioB} loop src={srcB || undefined} data-testid="mixer-audio-b" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          className="border-cyan-400/40 text-cyan-100"
          disabled={!hasSound}
          onClick={() => { fadeFactor.current = 1; setActiveMinutes(null); setRemaining(0); setPlaying((p) => !p); }}
          data-testid="mixer-play-btn"
        >
          {playing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {playing ? "Pause Soundscape" : "Play Soundscape"}
        </Button>
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MoonStar className="w-3.5 h-3.5 text-primary" /> Sleep timer
        </span>
        {TIMER_OPTIONS.map((minutes) => (
          <button
            key={minutes}
            disabled={!hasSound}
            onClick={() => { fadeFactor.current = 1; setPlaying(true); setActiveMinutes(minutes); setRemaining(minutes * 60); }}
            className={`px-3 py-1 rounded-full text-xs border transition-colors disabled:opacity-40 ${
              activeMinutes === minutes
                ? "bg-primary/25 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            }`}
            data-testid={`mixer-sleep-${minutes}-btn`}
          >
            {minutes} min
          </button>
        ))}
        {activeMinutes && (
          <button
            onClick={stopAll}
            className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 flex items-center gap-1"
            data-testid="mixer-sleep-cancel-btn"
          >
            <TimerOff className="w-3 h-3" /> {formatTime(remaining)}
          </button>
        )}
      </div>
    </section>
  );
};
