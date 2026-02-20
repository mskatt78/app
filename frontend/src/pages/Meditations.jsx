import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Filter, Clock, Play, Pause, RotateCcw,
  Mountain, Waves, Flame, Wind, Heart, Eye, Moon, Star
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";

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

  const startMeditation = (meditation) => {
    setActiveMeditation(meditation);
    setProgress(0);
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!activeMeditation) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const totalSeconds = activeMeditation.duration_minutes * 60;
      
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          setProgress((newTime / totalSeconds) * 100);
          
          if (newTime >= totalSeconds) {
            completeMeditation();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const resetMeditation = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
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
    setActiveMeditation(null);
    setIsPlaying(false);
    setProgress(0);
    setElapsedTime(0);
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
            {/* Meditation Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center
                             ${elementColors[activeMeditation.element]?.bg}`}>
                {(() => {
                  const Icon = categoryIcons[activeMeditation.category] || Sparkles;
                  return <Icon className={`w-10 h-10 ${elementColors[activeMeditation.element]?.text}`} />;
                })()}
              </div>
              <h2 className="text-3xl font-serif mb-2">{activeMeditation.name}</h2>
              <p className="text-muted-foreground">{activeMeditation.description}</p>
            </div>

            {/* Timer */}
            <div className="p-8 rounded-2xl bg-card/50 border border-primary/20 mb-8">
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
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetMeditation}
                  className="rounded-full border-white/10"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
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
                    className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                               ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                    onClick={() => startMeditation(meditation)}
                    data-testid={`meditation-card-${meditation.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meditation.duration_minutes} min
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-serif mb-2">{meditation.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{meditation.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                        {meditation.element}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 text-xs capitalize">
                        {meditation.category}
                      </span>
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
