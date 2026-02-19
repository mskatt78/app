import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wind, Play, Pause, RotateCcw, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";

const Breathwork = ({ user, api }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [activeSession, setActiveSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(breathPhase);
  const progressRef = useRef(phaseProgress);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  const phaseLabels = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
    hold_empty: "Hold Empty",
  };

  useEffect(() => {
    fetchSessions();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    phaseRef.current = breathPhase;
  }, [breathPhase]);

  useEffect(() => {
    progressRef.current = phaseProgress;
  }, [phaseProgress]);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(sessions.filter(s => s.element === selectedElement));
    }
  }, [selectedElement, sessions]);

  const fetchSessions = async () => {
    try {
      const response = await api.get("/breathwork/sessions");
      setSessions(response.data);
      setFilteredSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = (session) => {
    setActiveSession(session);
    setBreathPhase("inhale");
    setPhaseProgress(0);
    setCycleCount(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!activeSession) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      runBreathCycle();
    }
  };

  const runBreathCycle = () => {
    if (!activeSession) return;

    const pattern = activeSession.pattern;
    const phases = ["inhale", "hold", "exhale", "hold_empty"];
    
    intervalRef.current = setInterval(() => {
      setPhaseProgress(prev => {
        const currentPhase = phaseRef.current;
        const phaseDuration = pattern[currentPhase] || 0;
        
        if (phaseDuration === 0) {
          // Skip this phase
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          setBreathPhase(phases[nextIndex]);
          if (nextIndex === 0) {
            setCycleCount(c => c + 1);
          }
          return 0;
        }
        
        const increment = 100 / (phaseDuration * 10); // 10 updates per second
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          const currentIndex = phases.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.length;
          setBreathPhase(phases[nextIndex]);
          if (nextIndex === 0) {
            setCycleCount(c => c + 1);
          }
          return 0;
        }
        
        return newProgress;
      });
    }, 100);
  };

  const resetSession = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setBreathPhase("inhale");
    setPhaseProgress(0);
    setCycleCount(0);
  };

  const closeSession = () => {
    clearInterval(intervalRef.current);
    setActiveSession(null);
    setIsPlaying(false);
  };

  const getBreathCircleSize = () => {
    if (breathPhase === "inhale") return 100 + (phaseProgress * 0.5);
    if (breathPhase === "exhale") return 150 - (phaseProgress * 0.5);
    return breathPhase === "hold" ? 150 : 100;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="breathwork">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeSession ? closeSession() : navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice</p>
              <h1 className="text-xl font-serif">Breathwork <span className="italic text-primary">Sessions</span></h1>
            </div>
          </div>

          {!activeSession && (
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
        {activeSession ? (
          /* Active Session View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[70vh]"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif mb-2">{activeSession.name}</h2>
              <p className="text-muted-foreground">{activeSession.description}</p>
            </div>

            {/* Breathing Circle */}
            <div className="relative mb-12">
              <motion.div
                animate={{ 
                  width: getBreathCircleSize(),
                  height: getBreathCircleSize(),
                }}
                transition={{ duration: 0.1 }}
                className={`rounded-full flex items-center justify-center
                           ${elementColors[activeSession.element]?.bg} 
                           ${elementColors[activeSession.element]?.border}
                           border-2`}
                style={{ minWidth: 100, minHeight: 100 }}
              >
                <div className="text-center">
                  <p className={`text-2xl font-serif ${elementColors[activeSession.element]?.text}`}>
                    {phaseLabels[breathPhase]}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeSession.pattern[breathPhase]}s
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Progress */}
            <div className="w-64 mb-8">
              <Progress value={phaseProgress} className="h-2" />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                data-testid="play-pause-btn"
                onClick={togglePlay}
                size="lg"
                className={`rounded-full w-16 h-16 ${
                  isPlaying ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </Button>
              <Button
                data-testid="reset-btn"
                onClick={resetSession}
                variant="outline"
                size="icon"
                className="rounded-full border-white/10"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Cycle Counter */}
            <p className="text-muted-foreground">
              Cycles completed: <span className="text-primary font-medium">{cycleCount}</span>
            </p>

            {/* Pattern Info */}
            <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
              <span>Inhale: {activeSession.pattern.inhale}s</span>
              {activeSession.pattern.hold > 0 && <span>Hold: {activeSession.pattern.hold}s</span>}
              <span>Exhale: {activeSession.pattern.exhale}s</span>
              {activeSession.pattern.hold_empty > 0 && <span>Hold Empty: {activeSession.pattern.hold_empty}s</span>}
            </div>
          </motion.div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          /* Sessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSessions.map((session, index) => {
              const colors = elementColors[session.element] || elementColors.Air;
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => startSession(session)}
                  data-testid={`session-card-${session.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Wind className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {session.element}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-2">{session.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{session.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{session.duration_minutes} minutes</span>
                    <span className="text-xs">
                      {session.pattern.inhale}-{session.pattern.hold}-{session.pattern.exhale}
                      {session.pattern.hold_empty > 0 ? `-${session.pattern.hold_empty}` : ''}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.benefits?.slice(0, 3).map((benefit) => (
                      <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Breathwork;
