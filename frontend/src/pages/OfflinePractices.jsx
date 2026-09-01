import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CloudOff, Trash2, Play, Pause, Clock, Moon, WifiOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  listOfflinePractices,
  getOfflinePractice,
  deleteOfflinePractice,
  getOfflineStorageEstimate,
  base64AudioToObjectUrl,
} from "../utils/offlineStore";
import { appLogger } from "../utils/logger";

const elementColors = {
  Earth: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  Water: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  Fire: "text-orange-400 border-orange-500/20 bg-orange-500/10",
  Air: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
  Spirit: "text-purple-400 border-purple-500/20 bg-purple-500/10",
};

const OfflinePractices = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentSegmentText, setCurrentSegmentText] = useState("");
  const [totalSegments, setTotalSegments] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const audioRef = useRef(null);
  const stoppedRef = useRef(false);
  const objectUrlsRef = useRef([]);

  const refresh = useCallback(async () => {
    try {
      const items = await listOfflinePractices();
      setPractices(items);
      setStorageInfo(await getOfflineStorageEstimate());
    } catch (error) {
      appLogger.error("Failed to load offline practices", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refresh]);

  const stopPlayback = useCallback(() => {
    stoppedRef.current = true;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];
    setPlayingId(null);
    setCurrentSegmentIndex(0);
    setCurrentSegmentText("");
    setTotalSegments(0);
  }, []);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const handlePlay = async (id) => {
    if (playingId === id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    stoppedRef.current = false;

    try {
      const practice = await getOfflinePractice(id);
      const segments = practice?.segments || [];
      if (!segments.length) {
        toast.error("This download has no audio. Delete and re-download it.");
        return;
      }
      setPlayingId(id);
      setTotalSegments(segments.length);

      const playIndex = (index) => {
        if (stoppedRef.current || index >= segments.length) {
          if (!stoppedRef.current) {
            toast.success("Practice complete. Namaste.");
            stopPlayback();
          }
          return;
        }
        const segment = segments[index];
        setCurrentSegmentIndex(index);
        setCurrentSegmentText(segment.text || "");
        const url = base64AudioToObjectUrl(segment.audio_base64);
        objectUrlsRef.current.push(url);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => playIndex(index + 1);
        audio.onerror = () => playIndex(index + 1);
        audio.play().catch(() => {
          toast.info("Tap play again to start audio");
          stopPlayback();
        });
      };

      playIndex(0);
    } catch (error) {
      appLogger.error("Offline playback failed", error);
      toast.error("Could not play this practice");
      stopPlayback();
    }
  };

  const handleDelete = async (id) => {
    if (playingId === id) stopPlayback();
    await deleteOfflinePractice(id);
    toast.success("Removed from offline library");
    refresh();
  };

  return (
    <div className="min-h-screen bg-background" data-testid="offline-practices-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="offline-back-btn"
              onClick={() => navigate("/meditations")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Always With You</p>
              <h1 className="text-xl font-serif">
                Offline <span className="italic text-primary">Practices</span>
              </h1>
            </div>
          </div>
          {!isOnline && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs" data-testid="offline-mode-badge">
              <WifiOff className="w-3 h-3" /> Offline mode
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <CloudOff className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">
            Your Sacred <span className="italic text-primary">Sanctuary</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Practices downloaded here play with full voice guidance even without internet — perfect for retreats, flights, and wild places.
          </p>
          {storageInfo && (
            <p className="text-xs text-muted-foreground mt-2" data-testid="offline-storage-info">
              Device storage used: ~{storageInfo.usageMb} MB
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : practices.length === 0 ? (
          <div className="text-center rounded-2xl border border-white/10 bg-card/50 p-10" data-testid="offline-empty-state">
            <Moon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-serif text-lg mb-1">No practices downloaded yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Open Meditations and tap the download icon on any practice to keep it with you offline.
            </p>
            <Button onClick={() => navigate("/meditations")} data-testid="offline-browse-meditations-btn">
              Browse Meditations
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {practices.map((practice) => {
              const isPlaying = playingId === practice.id;
              const colors = elementColors[practice.element] || elementColors.Spirit;
              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-5 ${isPlaying ? "border-primary/40 bg-primary/5" : "border-white/10 bg-card/50"}`}
                  data-testid={`offline-practice-${practice.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Button
                      size="icon"
                      className="rounded-full w-12 h-12 flex-shrink-0"
                      onClick={() => handlePlay(practice.id)}
                      data-testid={`offline-play-btn-${practice.id}`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg truncate">{practice.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] border ${colors}`}>{practice.element || "Spirit"}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" /> {practice.duration_minutes || "—"} min
                        </span>
                        <span className="text-xs text-muted-foreground">{practice.segmentCount} audio segments</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(practice.id)}
                      className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      data-testid={`offline-delete-btn-${practice.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isPlaying && (
                    <div className="mt-4 pt-4 border-t border-white/10" data-testid="offline-now-playing">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Now playing — segment {currentSegmentIndex + 1} of {totalSegments}
                      </p>
                      <div className="h-1.5 rounded-full bg-white/10 mb-3 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.round(((currentSegmentIndex + 1) / Math.max(totalSegments, 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed" data-testid="offline-current-segment-text">
                        {currentSegmentText}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OfflinePractices;
