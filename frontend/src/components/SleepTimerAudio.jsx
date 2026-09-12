import { useEffect, useRef, useState } from "react";
import { MoonStar, TimerOff } from "lucide-react";

const FADE_SECONDS = 30;
const OPTIONS = [15, 30, 60];

export const SleepTimerAudio = ({ src, credit, testId = "custom-audio-player" }) => {
  const audioRef = useRef(null);
  const [activeMinutes, setActiveMinutes] = useState(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!activeMinutes) return undefined;
    const tick = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        const audio = audioRef.current;
        if (audio && next <= FADE_SECONDS) {
          audio.volume = Math.max(0, next / FADE_SECONDS);
        }
        if (next <= 0) {
          if (audio) {
            audio.pause();
            audio.volume = 1;
          }
          setActiveMinutes(null);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [activeMinutes]);

  const startTimer = (minutes) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1;
      if (audio.paused) audio.play().catch(() => {});
    }
    setActiveMinutes(minutes);
    setRemaining(minutes * 60);
  };

  const cancelTimer = () => {
    const audio = audioRef.current;
    if (audio) audio.volume = 1;
    setActiveMinutes(null);
    setRemaining(0);
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div>
      {credit && <p className="text-xs text-muted-foreground mb-3">{credit}</p>}
      <audio ref={audioRef} controls loop src={src} className="w-full" data-testid={testId}>
        Your browser does not support audio.
      </audio>
      <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="sleep-timer-controls">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MoonStar className="w-3.5 h-3.5 text-primary" /> Sleep timer
        </span>
        {OPTIONS.map((minutes) => (
          <button
            key={minutes}
            onClick={() => startTimer(minutes)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              activeMinutes === minutes
                ? "bg-primary/25 border-primary/50 text-primary"
                : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
            }`}
            data-testid={`sleep-timer-${minutes}-btn`}
          >
            {minutes} min
          </button>
        ))}
        {activeMinutes && (
          <button
            onClick={cancelTimer}
            className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 flex items-center gap-1"
            data-testid="sleep-timer-cancel-btn"
          >
            <TimerOff className="w-3 h-3" /> {formatTime(remaining)}
          </button>
        )}
      </div>
      {activeMinutes && remaining <= FADE_SECONDS && (
        <p className="mt-2 text-xs text-primary/80" data-testid="sleep-timer-fading-note">Softly fading out…</p>
      )}
    </div>
  );
};
