import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Waves, Filter, Play, Pause, RotateCcw,
  Volume2, VolumeX, Loader2, Clock, Music
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { toast } from "sonner";
import AmbientSoundPlayer, { AMBIENT_SOUNDS } from "../components/AmbientSoundPlayer";

const SomaticMovement = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedPractice, setSelectedPractice] = useState(null);
  
  // Active practice state (for guided mode)
  const [activePractice, setActivePractice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  
  // Audio state
  const audioRef = useRef(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [ambientSound, setAmbientSound] = useState("silence");

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-500" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-500" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "text-orange-500" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-500" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-500" },
  };

  useEffect(() => {
    fetchPractices();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredPractices(practices);
    } else {
      setFilteredPractices(practices.filter(p => p.element === selectedElement));
    }
  }, [selectedElement, practices]);

  const fetchPractices = async () => {
    try {
      const response = await api.get("/somatic");
      setPractices(response.data);
      setFilteredPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const startGuidedPractice = async (practice) => {
    setActivePractice(practice);
    setSelectedPractice(null);
    setProgress(0);
    setElapsedTime(0);
    setAudioReady(false);
    setAudioLoading(true);

    // Start timer immediately
    setIsPlaying(true);
    const totalSeconds = practice.duration_minutes * 60;
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        setProgress((next / totalSeconds) * 100);
        if (next >= totalSeconds) {
          clearInterval(intervalRef.current);
          completePractice();
        }
        return next;
      });
    }, 1000);

    // Generate audio in background
    try {
      const response = await api.post(`/tts/somatic/${practice.id}`, null, {
        params: { voice: "nova" }
      });
      if (response.data.audio_base64) {
        const audioData = `data:audio/mp3;base64,${response.data.audio_base64}`;
        audioRef.current = new Audio(audioData);
        audioRef.current.volume = volume / 100;
        audioRef.current.onended = () => setIsPlaying(false);
        setAudioReady(true);
        audioRef.current.play().catch(() => {});
        toast.success("Guided audio is playing");
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
      toast.info("Audio unavailable — timer active. Follow the instructions.");
      setAudioReady(false);
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlay = () => {
    if (!activePractice) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      if (audioRef.current && audioReady) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (audioRef.current && audioReady) audioRef.current.play().catch(console.error);
      const totalSeconds = activePractice.duration_minutes * 60;
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setProgress((newTime / totalSeconds) * 100);
          if (newTime >= totalSeconds) { completePractice(); return prev; }
          return newTime;
        });
      }, 1000);
    }
  };

  const resetPractice = () => {
    clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
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

  const completePractice = async () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    
    try {
      await api.post("/practice-history", {
        practice_type: "somatic",
        practice_id: activePractice.id,
        duration_minutes: activePractice.duration_minutes,
        notes: `Completed ${activePractice.name}`,
      });
      toast.success("Practice complete. Well done.");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const closePractice = () => {
    clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActivePractice(null);
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
    setAudioReady(false);
    setAudioLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="somatic-movement">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activePractice ? closePractice() : navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Body Wisdom</p>
              <h1 className="text-xl font-serif">Somatic <span className="italic text-primary">Movement</span></h1>
            </div>
          </div>

          {!activePractice && (
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
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {activePractice ? (
          /* Active Guided Practice View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            {/* Practice Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2
                             ${elementColors[activePractice.element]?.bg} ${elementColors[activePractice.element]?.text}`}>
                {activePractice.element} Element
              </div>
              <h2 className="text-3xl font-serif mb-2">{activePractice.name}</h2>
              <p className="text-muted-foreground">{activePractice.description}</p>
            </div>

            {/* Timer */}
            <div className="p-8 rounded-2xl bg-card/50 border border-primary/20 mb-8">
              {/* Audio Status */}
              {audioLoading && (
                <div className="flex items-center justify-center gap-2 mb-4 text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Preparing guided audio...</span>
                </div>
              )}
              {audioReady && !audioLoading && (
                <div className="flex items-center justify-center gap-2 mb-4 text-emerald-400">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm">Guided audio playing</span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <p className="text-6xl font-serif text-primary mb-2">
                  {formatTime(elapsedTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {activePractice.duration_minutes}:00
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
                  onClick={resetPractice}
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

            {/* Instructions */}
            <div className="p-6 rounded-2xl bg-card/30 border border-white/5">
              <h3 className="text-lg font-serif mb-4 text-primary">Movement Instructions</h3>
              <ol className="space-y-3">
                {activePractice.instructions?.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Benefits */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {activePractice.benefits?.map((benefit) => (
                <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground">
                  {benefit}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-serif mb-4">Move with <span className="italic text-primary">Intention</span></h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Somatic movement practices help release stored emotions and trauma from the body. 
                Each element offers a unique approach to healing through movement.
              </p>
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPractices.map((practice, index) => {
                  const colors = elementColors[practice.element] || elementColors.Water;
                  return (
                    <motion.div
                      key={practice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                                 ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                      onClick={() => setSelectedPractice(practice)}
                      data-testid={`practice-card-${practice.id}`}
                    >
                      {practice.image_url && (
                        <div className="relative h-40 overflow-hidden">
                          <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                        </div>
                      )}
                      <div className="p-6">
                      <div className={`flex items-start justify-between mb-4 ${practice.image_url ? 'hidden' : ''}`}>
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                          <Waves className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {practice.duration_minutes} min
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                            {practice.element}
                          </span>
                        </div>
                      </div>
                      {practice.image_url && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {practice.duration_minutes} min
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                            {practice.element}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-serif mb-3">{practice.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {practice.benefits?.map((benefit) => (
                          <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                            {benefit}
                          </span>
                        ))}
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={!!selectedPractice} onOpenChange={() => setSelectedPractice(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedPractice && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                  {selectedPractice.element} Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPractice.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground leading-relaxed">{selectedPractice.description}</p>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-muted-foreground">{selectedPractice.duration_minutes} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractice.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Tip:</strong> Find a quiet space where you can move freely. 
                    Let your body guide you - there is no wrong way to do this practice.
                  </p>
                </div>

                {/* Start Guided Practice Button */}
                <Button 
                  onClick={() => startGuidedPractice(selectedPractice)}
                  className="w-full"
                  size="lg"
                  data-testid="start-guided-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Guided Practice
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SomaticMovement;
