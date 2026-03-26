import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Filter, Clock, Play, Pause, RotateCcw,
  Mountain, Waves, Flame, Wind, Heart, Eye, Moon, Star,
  Volume2, VolumeX, Loader2, Music
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { toast } from "sonner";
import AmbientSoundPlayer, { AMBIENT_SOUNDS } from "../components/AmbientSoundPlayer";

const Meditations = ({ user, api }) => {
  const navigate = useNavigate();
  const [meditations, setMeditations] = useState([]);
  const [filteredMeditations, setFilteredMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeMeditation, setActiveMeditation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  
  // Audio state - multi-part TTS
  const audioRef = useRef(null);
  const audioPartsRef = useRef([]); // Array of Audio objects for parts 1-4
  const currentPartRef = useRef(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioPartStatus, setAudioPartStatus] = useState(""); // e.g. "Part 1 of 4"
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [ambientSound, setAmbientSound] = useState("silence");

  const categories = [
    { value: "all", label: "All Meditations" },
    { value: "relaxation", label: "Relaxation" },
    { value: "grounding", label: "Grounding" },
    { value: "energy", label: "Energy" },
    { value: "nature", label: "Nature" },
    { value: "expansion", label: "Expansion" },
    { value: "healing", label: "Healing" },
    { value: "spiritual", label: "Spiritual" },
    { value: "heart", label: "Heart" },
    { value: "intuition", label: "Intuition" },
  ];

  const categoryIcons = {
    relaxation: Waves,
    grounding: Mountain,
    energy: Flame,
    nature: Mountain,
    expansion: Star,
    healing: Heart,
    spiritual: Sparkles,
    heart: Heart,
    intuition: Eye,
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchMeditations();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Stop all audio parts
      audioPartsRef.current.forEach(a => { if (a) { a.pause(); a.src = ''; } });
      audioPartsRef.current = [];
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMeditations(meditations);
    } else {
      setFilteredMeditations(meditations.filter(m => m.category === selectedCategory));
    }
  }, [selectedCategory, meditations]);

  const fetchMeditations = async () => {
    try {
      const response = await api.get("/meditations");
      setMeditations(response.data);
      setFilteredMeditations(response.data);
    } catch (error) {
      console.error("Failed to fetch meditations:", error);
    } finally {
      setLoading(false);
    }
  };

  const playNextPart = () => {
    const parts = audioPartsRef.current;
    const nextIdx = currentPartRef.current + 1;
    if (nextIdx < parts.length && parts[nextIdx]) {
      currentPartRef.current = nextIdx;
      const nextAudio = parts[nextIdx];
      nextAudio.volume = volume / 100;
      nextAudio.muted = isMuted;
      nextAudio.onended = playNextPart;
      audioRef.current = nextAudio;
      setAudioPartStatus(`Part ${nextIdx + 1} of 4`);
      nextAudio.play().catch(() => {});
    } else {
      // All parts finished
      setAudioPartStatus("Complete");
    }
  };

  const startMeditation = async (meditation) => {
    setActiveMeditation(meditation);
    setProgress(0);
    setElapsedTime(0);
    setAudioReady(false);
    setAudioLoading(true);
    setAudioPartStatus("Preparing audio...");
    audioPartsRef.current = [null, null, null, null];
    currentPartRef.current = 0;

    // START timer immediately so user doesn't wait
    setIsPlaying(true);
    const totalSeconds = meditation.duration_minutes * 60;
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        setProgress((next / totalSeconds) * 100);
        if (next >= totalSeconds) {
          clearInterval(intervalRef.current);
          completeMeditation();
        }
        return next;
      });
    }, 1000);

    // Load Part 1 first for quick start
    try {
      const response = await api.post(`/tts/meditation/${meditation.id}`, null, {
        params: { voice: "nova", part: 1 },
        timeout: 45000
      });
      
      if (response.data.audio_base64) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audio_base64}`);
        audioPartsRef.current[0] = audio;
        audio.volume = volume / 100;
        audio.onended = playNextPart;
        audioRef.current = audio;
        setAudioReady(true);
        setAudioPartStatus("Part 1 ready");
        audio.play().catch(() => {});
        toast.success("Guided audio playing");
        
        // Load remaining parts in background
        loadRemainingParts(meditation.id);
      } else {
        toast.info("Timer meditation active - follow on-screen guidance");
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
      toast.info("Timer active - audio timed out, follow guidance on screen");
    } finally {
      setAudioLoading(false);
    }
  };

  // Load parts 2-4 in background after part 1 starts
  const loadRemainingParts = async (meditationId) => {
    for (let partNum = 2; partNum <= 4; partNum++) {
      try {
        const response = await api.post(`/tts/meditation/${meditationId}`, null, {
          params: { voice: "nova", part: partNum },
          timeout: 50000
        });
        if (response.data.audio_base64) {
          const audio = new Audio(`data:audio/mp3;base64,${response.data.audio_base64}`);
          audio.volume = volume / 100;
          audioPartsRef.current[partNum - 1] = audio;
          setAudioPartStatus(`Parts 1-${partNum} loaded`);
        }
      } catch (err) {
        console.log(`Part ${partNum} skipped`);
      }
    }
  };

  const togglePlay = () => {
    if (!activeMeditation) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      if (audioRef.current && audioReady) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioRef.current && audioReady) audioRef.current.play().catch(console.error);
      const totalSeconds = activeMeditation.duration_minutes * 60;
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setProgress((newTime / totalSeconds) * 100);
          if (newTime >= totalSeconds) { completeMeditation(); return prev; }
          return newTime;
        });
      }, 1000);
    }
  };

  const resetMeditation = () => {
    clearInterval(intervalRef.current);
    audioPartsRef.current.forEach(a => { if (a) { a.pause(); a.currentTime = 0; } });
    currentPartRef.current = 0;
    if (audioPartsRef.current[0]) {
      audioRef.current = audioPartsRef.current[0];
      audioRef.current.onended = playNextPart;
    }
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
    setAudioPartStatus(audioReady ? "Part 1 of 4" : "");
  };
  
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const completeMeditation = async () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    
    try {
      await api.post("/practice-history", {
        practice_type: "meditation",
        practice_id: activeMeditation.id,
        duration_minutes: activeMeditation.duration_minutes,
        notes: `Completed ${activeMeditation.name}`,
      });
      toast.success("Meditation complete. Namaste.");
    } catch (error) {
      console.error("Failed to log meditation:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const closeMeditation = () => {
    clearInterval(intervalRef.current);
    audioPartsRef.current.forEach(a => { if (a) { a.pause(); a.src = ''; } });
    audioPartsRef.current = [];
    audioRef.current = null;
    currentPartRef.current = 0;
    setActiveMeditation(null);
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
    setAudioReady(false);
    setAudioLoading(false);
    setAudioPartStatus("");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="meditations-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeMeditation ? closeMeditation() : navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Inner Journey</p>
              <h1 className="text-xl font-serif">Guided <span className="italic text-primary">Meditations</span></h1>
            </div>
          </div>

          {!activeMeditation && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="category-filter" className="w-40 bg-card border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activeMeditation ? (
          /* Active Meditation View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            {/* Meditation Image Banner */}
            {activeMeditation.image_url && (
              <div className="relative h-52 rounded-2xl overflow-hidden mb-6">
                <img
                  src={activeMeditation.image_url}
                  alt={activeMeditation.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-serif text-white">{activeMeditation.name}</h2>
                  <p className="text-sm text-white/70 mt-1">{activeMeditation.description}</p>
                </div>
              </div>
            )}

            {/* Fallback header if no image */}
            {!activeMeditation.image_url && (
              <div className="text-center mb-6">
                <h2 className="text-3xl font-serif mb-2">{activeMeditation.name}</h2>
                <p className="text-muted-foreground">{activeMeditation.description}</p>
              </div>
            )}

            {/* Timer */}
            <div className="p-8 rounded-2xl bg-card/50 border border-primary/20 mb-8">
              {/* Audio Status */}
              {audioLoading && (
                <div className="flex items-center justify-center gap-2 mb-4 text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Preparing audio (may take 15-20 sec)...</span>
                </div>
              )}
              {audioReady && !audioLoading && (
                <div className="flex items-center justify-center gap-2 mb-4 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Guided audio playing — {audioPartStatus}</span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <p className="text-6xl font-serif text-primary mb-2">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {activeMeditation.duration_minutes}:00
                </p>
              </div>

              <Progress value={progress} className="h-2 mb-6" />

              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className={`rounded-full w-16 h-16 ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
                  data-testid="play-pause-btn"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetMeditation}
                  className="rounded-full border-white/10"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                {audioReady && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMute}
                    className="rounded-full border-white/10"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                )}
              </div>
              
              {/* Volume Control */}
              {audioReady && (
                <div className="flex items-center justify-center gap-3 mt-4 px-8">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-32"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Ambient Soundscapes */}
            <div className="p-5 rounded-2xl bg-card/30 border border-white/5 mb-6">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary">
                <Music className="w-4 h-4" />
                Ambient Soundscape
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["silence", "ocean", "rain", "singing_bowls", "crystal_bowls", "binaural"].map((key) => (
                  <button
                    key={key}
                    onClick={() => setAmbientSound(key)}
                    data-testid={`ambient-${key}`}
                    className={`px-2 py-2 rounded-xl text-xs text-center transition-all border
                      ${ambientSound === key
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                      }`}
                  >
                    {AMBIENT_SOUNDS[key]?.name || key}
                  </button>
                ))}
              </div>
              {ambientSound !== "silence" && (
                <AmbientSoundPlayer
                  soundType={ambientSound}
                  autoPlay={true}
                  volume={0.4}
                  showControls={true}
                />
              )}
            </div>

            {/* Visualization Guide */}
            <div className="p-6 rounded-2xl bg-card/30 border border-white/5">
              <h3 className="text-lg font-serif mb-4 text-primary">Visualization Guide</h3>
              <p className="text-muted-foreground leading-relaxed italic">
                {activeMeditation.visualization}
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {activeMeditation.benefits?.map((benefit) => (
                <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground">
                  {benefit}
                </span>
              ))}
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Moon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif mb-2">Journey <span className="italic text-primary">Within</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Guided meditations to explore your inner landscape, heal, and transform.
              </p>
            </motion.div>

            {/* Meditations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMeditations.map((meditation, index) => {
                const colors = elementColors[meditation.element] || elementColors.Spirit;
                const Icon = categoryIcons[meditation.category] || Sparkles;
                
                return (
                  <motion.div
                    key={meditation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                               ${colors.border} hover:scale-[1.02] transition-all duration-300 group`}
                    onClick={() => startMeditation(meditation)}
                    data-testid={`meditation-card-${meditation.id}`}
                  >
                    {/* Card Image */}
                    {meditation.image_url ? (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={meditation.image_url}
                          alt={meditation.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 text-lg font-serif text-white drop-shadow-lg">{meditation.name}</span>
                        <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                          <Clock className="w-3 h-3" />{meditation.duration_minutes} min
                        </span>
                      </div>
                    ) : (
                      <div className={`p-4 ${colors.bg} flex items-center justify-between`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />{meditation.duration_minutes} min
                        </span>
                      </div>
                    )}

                    <div className={`p-4 ${colors.bg}`}>
                      {!meditation.image_url && <h3 className="text-xl font-serif mb-2">{meditation.name}</h3>}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{meditation.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} border ${colors.border}`}>
                          {meditation.element}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs capitalize">
                          {meditation.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Meditations;
