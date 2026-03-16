import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Brain, Filter, Clock, Play, Heart, Footprints, 
  Eye, Ear, Sparkles, CheckCircle, Pause, RotateCcw, Volume2, VolumeX
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";
import HealthDisclaimer from "../components/HealthDisclaimer";

const Mindfulness = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPracticing, setIsPracticing] = useState(false);
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  const categories = [
    { value: "all", label: "All Practices" },
    { value: "awareness", label: "Awareness" },
    { value: "body", label: "Body" },
    { value: "daily", label: "Daily Life" },
    { value: "movement", label: "Movement" },
    { value: "heart", label: "Heart" },
    { value: "focus", label: "Focus" },
  ];

  const categoryIcons = {
    awareness: Eye,
    body: Footprints,
    daily: Sparkles,
    movement: Footprints,
    heart: Heart,
    focus: Brain,
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchPractices();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPractices(practices);
    } else {
      setFilteredPractices(practices.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, practices]);

  const fetchPractices = async () => {
    try {
      const response = await api.get("/mindfulness");
      setPractices(response.data);
      setFilteredPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setCurrentStep(0);
    setIsPracticing(true);
    const totalSeconds = (selectedPractice?.duration_minutes || 5) * 60;
    setTotalTime(totalSeconds);
    setTimeRemaining(totalSeconds);
    setTimerRunning(true);
  };

  // Timer effect
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeRemaining(totalTime);
    setCurrentStep(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (selectedPractice && currentStep < selectedPractice.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completePractice();
    }
  };

  const completePractice = async () => {
    setIsPracticing(false);
    try {
      await api.post("/practice-history", {
        practice_type: "mindfulness",
        practice_id: selectedPractice.id,
        duration_minutes: selectedPractice.duration_minutes,
        notes: `Completed ${selectedPractice.name}`,
      });
      toast.success("Practice complete! Well done.");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="mindfulness-page">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Present Moment</p>
              <h1 className="text-xl font-serif">Mindfulness <span className="italic text-primary">Practices</span></h1>
            </div>
          </div>

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
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-serif mb-2">Be <span className="italic text-primary">Here</span> Now</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mindfulness brings us back to the present moment - the only place where life truly happens.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractices.map((practice, index) => {
              const colors = elementColors[practice.element] || elementColors.Air;
              const Icon = categoryIcons[practice.category] || Brain;
              
              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedPractice(practice)}
                  data-testid={`practice-card-${practice.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {practice.duration_minutes} min
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-2">{practice.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {practice.element}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs capitalize">
                      {practice.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={!!selectedPractice} onOpenChange={() => { setSelectedPractice(null); setIsPracticing(false); }}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedPractice && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                  {selectedPractice.element} • {selectedPractice.category}
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPractice.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {!isPracticing ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed">{selectedPractice.description}</p>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{selectedPractice.duration_minutes} minutes</span>
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

                    <Button
                      onClick={startPractice}
                      className="w-full bg-primary"
                      data-testid="start-practice-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Practice
                    </Button>
                  </>
                ) : (
                  /* Guided Practice Mode with Timer */
                  <div className="py-4">
                    {/* Timer Display */}
                    <div className="text-center mb-6">
                      <div className="text-5xl font-light tracking-wider mb-2">
                        {formatTime(timeRemaining)}
                      </div>
                      <Progress 
                        value={totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0} 
                        className="h-2 mb-4" 
                      />
                      
                      {/* Timer Controls */}
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={resetTimer}
                          className="rounded-full border-white/10"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="lg"
                          onClick={toggleTimer}
                          className={`rounded-full w-14 h-14 ${timerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
                        >
                          {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsMuted(!isMuted)}
                          className="rounded-full border-white/10"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Step Progress */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Step {currentStep + 1} of {selectedPractice.instructions?.length}
                      </p>
                      <div className="flex justify-center gap-1 mb-4">
                        {selectedPractice.instructions?.map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-white/20'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center"
                    >
                      <p className="text-lg leading-relaxed">
                        {selectedPractice.instructions?.[currentStep]}
                      </p>
                    </motion.div>

                    <Button
                      onClick={nextStep}
                      className="w-full mt-6 bg-primary"
                    >
                      {currentStep < selectedPractice.instructions?.length - 1 ? (
                        "Next Step"
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Practice
                        </>
                      )}
                    </Button>
                    
                    {!isMuted && (
                      <p className="text-xs text-center text-muted-foreground mt-4">
                        🔔 Bell will sound at end of practice
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mindfulness;
