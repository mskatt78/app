import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Filter, Music, Play, Pause, Volume2, VolumeX, RotateCcw, Repeat, SkipForward } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { toast } from "sonner";

const MantrasLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [mantras, setMantras] = useState([]);
  const [filteredMantras, setFilteredMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedMantra, setSelectedMantra] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  
  // Chanting state
  const [isChanting, setIsChanting] = useState(false);
  const [currentRep, setCurrentRep] = useState(0);
  const [chantProgress, setChantProgress] = useState(0);
  const intervalRef = useRef(null);
  
  // Audio state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [audioError, setAudioError] = useState(false);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20" },
  };

  useEffect(() => {
    fetchMantras();
    fetchFavorites();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredMantras(mantras);
    } else {
      setFilteredMantras(mantras.filter(m => m.element === selectedElement));
    }
  }, [selectedElement, mantras]);

  // Audio setup when mantra is selected
  useEffect(() => {
    if (selectedMantra?.audio_url) {
      setupAudio(selectedMantra.audio_url);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedMantra]);

  const setupAudio = (url) => {
    setAudioError(false);
    setAudioProgress(0);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(url);
    audio.volume = volume;
    audio.loop = isLooping;
    
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setAudioProgress((audio.currentTime / audio.duration) * 100);
    });
    
    audio.addEventListener('ended', () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentRep(prev => prev + 1);
      }
    });
    
    audio.addEventListener('error', () => {
      setAudioError(true);
      toast.error("Could not load audio. Using timer mode instead.");
    });
    
    audioRef.current = audio;
  };

  const fetchMantras = async () => {
    try {
      const response = await api.get("/mantras");
      setMantras(response.data);
      setFilteredMantras(response.data);
    } catch (error) {
      console.error("Failed to fetch mantras:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/favorites?item_type=mantra");
      const favIds = new Set(response.data.map(f => f.item_id));
      setFavorites(favIds);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (mantraId, e) => {
    e?.stopPropagation();
    try {
      if (favorites.has(mantraId)) {
        await api.delete(`/favorites/mantra/${mantraId}`);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(mantraId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", { item_type: "mantra", item_id: mantraId });
        setFavorites(prev => new Set([...prev, mantraId]));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Audio controls
  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setAudioError(true);
        toast.error("Could not play audio");
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.7;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const skipToNext = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentRep(prev => prev + 1);
    }
  };

  // Timer-based chanting (fallback when no audio)
  const startChanting = () => {
    if (!selectedMantra) return;
    setIsChanting(true);
    setCurrentRep(0);
    setChantProgress(0);
    
    const durationPerRep = selectedMantra.duration_seconds || 10;
    const totalReps = selectedMantra.repetitions || 108;
    
    intervalRef.current = setInterval(() => {
      setChantProgress(prev => {
        if (prev >= 100) {
          setCurrentRep(rep => {
            const newRep = rep + 1;
            if (newRep >= totalReps) {
              stopChanting();
              logPractice();
              toast.success("Mantra practice complete!");
              return rep;
            }
            return newRep;
          });
          return 0;
        }
        return prev + (100 / (durationPerRep * 10));
      });
    }, 100);
  };

  const stopChanting = () => {
    setIsChanting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetChanting = () => {
    stopChanting();
    setCurrentRep(0);
    setChantProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioProgress(0);
    }
  };

  const logPractice = async () => {
    if (!selectedMantra) return;
    try {
      const duration = Math.ceil((selectedMantra.duration_seconds * selectedMantra.repetitions) / 60);
      await api.post("/practice-history", {
        practice_type: "mantra",
        practice_id: selectedMantra.id,
        duration_minutes: duration,
        notes: `Chanted ${selectedMantra.name} ${selectedMantra.repetitions} times`,
      });
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDialogClose = () => {
    setSelectedMantra(null);
    resetChanting();
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="mantras-library">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sounds</p>
              <h1 className="text-xl font-serif">Mantras <span className="italic text-primary">Library</span></h1>
            </div>
          </div>

          <Select value={selectedElement} onValueChange={setSelectedElement}>
            <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {elements.map((el) => (
                <SelectItem key={el} value={el}>
                  {el === "all" ? "All Elements" : el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMantras.map((mantra, index) => {
              const colors = elementColors[mantra.element] || elementColors.Spirit;
              const isFavorite = favorites.has(mantra.id);
              const hasAudio = !!mantra.audio_url;
              
              return (
                <motion.div
                  key={mantra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer relative group
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedMantra(mantra)}
                  data-testid={`mantra-card-${mantra.id}`}
                >
                  {/* Audio Badge */}
                  {hasAudio && (
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                        <Volume2 className="w-3 h-3" />
                        Audio
                      </span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(mantra.id, e)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all
                               ${isFavorite ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex items-start justify-between mb-4 pr-10 pt-6">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Music className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                        {mantra.element}
                      </span>
                      {mantra.chakra && (
                        <p className="text-xs text-muted-foreground mt-1">{mantra.chakra} Chakra</p>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-2">{mantra.name}</h3>
                  {mantra.sanskrit && (
                    <p className="text-2xl text-primary/80 mb-3 font-serif">{mantra.sanskrit}</p>
                  )}
                  <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">"{mantra.translation}"</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{mantra.duration_seconds}s per rep</span>
                    <span>{mantra.repetitions} repetitions</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mantra Detail Dialog with Audio Player */}
      <Dialog open={!!selectedMantra} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedMantra && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                                 ${elementColors[selectedMantra.element]?.bg} ${elementColors[selectedMantra.element]?.text}`}>
                    {selectedMantra.element} • {selectedMantra.chakra} Chakra
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => toggleFavorite(selectedMantra.id, e)}
                    className={favorites.has(selectedMantra.id) ? "text-primary" : "text-muted-foreground"}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${favorites.has(selectedMantra.id) ? 'fill-current' : ''}`} />
                    {favorites.has(selectedMantra.id) ? "Saved" : "Save"}
                  </Button>
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedMantra.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Sanskrit Display */}
                {selectedMantra.sanskrit && (
                  <motion.div 
                    className="text-center py-8 rounded-xl bg-white/5 relative overflow-hidden"
                    animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${elementColors[selectedMantra.element]?.gradient} to-transparent opacity-30`} />
                    <p className="text-5xl text-primary font-serif relative z-10">{selectedMantra.sanskrit}</p>
                  </motion.div>
                )}

                {/* Translation */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Translation</h4>
                  <p className="text-lg italic text-foreground/90">"{selectedMantra.translation}"</p>
                </div>

                {/* Audio Player Section */}
                {selectedMantra.audio_url && !audioError ? (
                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <h4 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Audio Player
                    </h4>
                    
                    {/* Repetition Counter */}
                    <div className="text-center mb-4">
                      <p className="text-4xl font-serif text-primary">{currentRep}</p>
                      <p className="text-sm text-muted-foreground">repetitions completed</p>
                    </div>

                    {/* Audio Progress */}
                    <div className="mb-4">
                      <Progress value={audioProgress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatTime((audioProgress / 100) * audioDuration)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleLoop}
                        className={`rounded-full ${isLooping ? 'text-primary bg-primary/20' : 'text-muted-foreground'}`}
                        title={isLooping ? "Loop On" : "Loop Off"}
                      >
                        <Repeat className="w-5 h-5" />
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={toggleAudio}
                        className={`rounded-full w-16 h-16 ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
                        data-testid="audio-play-btn"
                      >
                        {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={skipToNext}
                        className="rounded-full text-muted-foreground hover:text-primary"
                        title="Skip to next rep"
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.01}
                        className="flex-1"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      {isLooping ? "Audio will loop continuously. Count your repetitions mentally." : "Audio will play once per repetition."}
                    </p>
                  </div>
                ) : (
                  /* Timer-based Chanting Practice (fallback) */
                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <h4 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Chanting Timer
                    </h4>
                    
                    <div className="text-center mb-4">
                      <p className="text-4xl font-serif text-primary">{currentRep}</p>
                      <p className="text-sm text-muted-foreground">of {selectedMantra.repetitions} repetitions</p>
                    </div>

                    <Progress value={chantProgress} className="h-2 mb-4" />

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        onClick={isChanting ? stopChanting : startChanting}
                        className={`rounded-full w-14 h-14 ${isChanting ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
                        data-testid="chant-play-btn"
                      >
                        {isChanting ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={resetChanting}
                        className="rounded-full border-white/10"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Chant along with each cycle. {selectedMantra.duration_seconds} seconds per repetition.
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMantra.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pronunciation & Frequency Section - NEW */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedMantra.pronunciation && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
                      <h4 className="text-xs uppercase tracking-wider text-primary mb-2">Pronunciation</h4>
                      <p className="text-sm font-medium">{selectedMantra.pronunciation}</p>
                    </div>
                  )}
                  {selectedMantra.frequency_hz && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <h4 className="text-xs uppercase tracking-wider text-blue-400 mb-2">Frequency</h4>
                      <p className="text-sm font-medium">{selectedMantra.frequency_hz} Hz</p>
                      {selectedMantra.vibrational_note && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {selectedMantra.vibrational_note}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Music Recommendation */}
                {selectedMantra.music_recommendation && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recommended Music</h4>
                    <p className="text-sm text-foreground/80">{selectedMantra.music_recommendation}</p>
                  </div>
                )}

                {/* Practice Tip */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Practice Tip:</strong> {selectedMantra.practice_tips || `Find a comfortable seated position. 
                    Close your eyes and focus on the sound and vibration of the mantra. 
                    Let each repetition deepen your connection to the ${selectedMantra.element.toLowerCase()} element
                    and your ${selectedMantra.chakra} chakra.`}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MantrasLibrary;
