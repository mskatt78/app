import { useState, useRef, useEffect } from "react";
import { Play, Square, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";

/**
 * GuidedAudioButton — drop-in button that generates & plays TTS guided audio.
 * Props:
 *  - api: axios instance
 *  - script: string to read aloud
 *  - label: button label (default "Listen to Guided Practice")
 *  - voice: OpenAI voice name (default "nova")
 *  - className: extra Tailwind classes
 */
const GuidedAudioButton = ({ api, script, label = "Listen to Guided Practice", voice = "nova", className = "" }) => {
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    // If already playing, stop
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/tts/generate-base64", {
        text: script,
        voice,
        speed: 0.85,
      });
      if (response.data?.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audio_base64}`);
        audioRef.current = audio;
        audio.onended = () => setPlaying(false);
        audio.onerror = () => { setPlaying(false); toast.error("Audio playback error"); };
        await audio.play().catch(() => toast.info("Tap play to start audio"));
        setPlaying(true);
      } else {
        toast.error("Could not generate guided audio");
      }
    } catch (err) {
      console.error("TTS error:", err);
      toast.info("Guided audio unavailable — please try again shortly");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      data-testid="guided-audio-btn"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
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
        <><Volume2 className="w-4 h-4" /><span>{label}</span></>
      )}
    </button>
  );
};

export default GuidedAudioButton;
