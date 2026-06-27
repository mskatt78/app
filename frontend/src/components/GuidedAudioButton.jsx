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
  retryVisible = true,
}) => {
  const effectiveLabel = practiceName ? `Play ${practiceName} Guided Voice` : (label || "Play Guided Voice");

  const { loading, playing, handlePlay } = useGuidedAudioPlayback({
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

      {retryVisible && (
        <button
          type="button"
          onClick={handlePlay}
          disabled={loading}
          data-testid="guided-audio-retry-btn"
          className="w-full px-4 py-2 rounded-xl text-xs border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50"
        >
          Tap to Retry Voice
        </button>
      )}
    </div>
  );
};

export default GuidedAudioButton;
