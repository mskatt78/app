import { Loader2, Square, Volume2 } from "lucide-react";
import { useGuidedAudioPlayback } from "./guided/useGuidedAudioPlayback";

/**
 * GuidedAudioButton — drop-in button that generates & plays TTS guided audio.
 * Props:
 *  - api: axios instance
 *  - script: string to read aloud
 *  - label: button label (default "Listen to Guided Practice")
 *  - voice: OpenAI voice name (default "nova")
 *  - className: extra Tailwind classes
 */
const GuidedAudioButton = ({
  api,
  script,
  label = "Listen to Guided Practice",
  voice = "nova",
  className = "",
  practiceName,
  durationMinutes,
  element = "Spirit",
  sourceTexts = [],
  steps = [],
  optionsVisible = true,
}) => {
  const effectiveLabel = practiceName ? `Play ${practiceName} Guided Voice` : (label || "Play Guided Voice");

  const {
    loading,
    playing,
    hasFailed,
    handlePlay,
    restartPlayback,
    stopPlayback,
  } = useGuidedAudioPlayback({
    api,
    script,
    label: effectiveLabel,
    voice,
    practiceName,
    durationMinutes,
    element,
    sourceTexts,
    steps,
  });

  return (
    <div className="w-full space-y-2" data-testid="guided-audio-control-stack">
      <button
        onClick={handlePlay}
        disabled={loading}
        data-testid="guided-audio-btn"
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
          ${playing
            ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
            : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          }
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /><span>Preparing audio...</span></>
        ) : playing ? (
          <><Square className="w-4 h-4" /><span>Stop Audio</span></>
        ) : (
          <><Volume2 className="w-4 h-4" /><span>{effectiveLabel}</span></>
        )}
      </button>

      {optionsVisible && (
        <div className="w-full px-3 py-2 rounded-xl text-xs border border-white/15 bg-white/[0.03] text-white/75" data-testid="guided-audio-voice-options-row">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/80">Voice Options</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={loading}
                className="px-2.5 py-1 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                data-testid="guided-audio-option-play"
              >
                Play
              </button>
              <button
                type="button"
                onClick={restartPlayback}
                disabled={loading}
                className="px-2.5 py-1 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                data-testid="guided-audio-option-restart"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={stopPlayback}
                disabled={loading}
                className="px-2.5 py-1 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                data-testid="guided-audio-option-stop"
              >
                Stop
              </button>
            </div>
          </div>
          {hasFailed ? (
            <p className="mt-2 text-[11px] text-amber-200" data-testid="guided-audio-failure-hint">
              Voice temporarily unavailable. Use Restart to try again.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GuidedAudioButton;
