import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Wind, Play, Pause, RotateCcw, Filter, Volume2, VolumeX } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { AMBIENT_SOUNDS } from "../components/AmbientSoundPlayer";

const createBrownNoise = (audioContext) => {
  const bufferSize = 2 * audioContext.sampleRate;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let lastOut = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  const source = audioContext.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  return source;
};

const createFilteredNoise = (audioContext, frequency, Q = 1) => {
  const noise = createBrownNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = frequency;
  filter.Q.value = Q;
  noise.connect(filter);
  return { source: noise, output: filter };
};

const BREATHWORK_SOUND_OPTIONS = [
  { id: "tone", label: "Healing Frequency Tone" },
  { id: "ocean", label: AMBIENT_SOUNDS.ocean.name },
  { id: "rain", label: AMBIENT_SOUNDS.rain.name },
  { id: "nature", label: AMBIENT_SOUNDS.nature.name },
  { id: "wind", label: AMBIENT_SOUNDS.wind.name },
  { id: "fire", label: AMBIENT_SOUNDS.fire.name },
  { id: "silence", label: "Silence" },
];

const ELEMENT_DEFAULT_SOUNDS = {
  Earth: "nature",
  Water: "ocean",
  Fire: "fire",
  Air: "wind",
  Spirit: "rain",
};

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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState("tone");
  
  const intervalRef = useRef(null);
  const phaseRef = useRef(breathPhase);
  const progressRef = useRef(phaseProgress);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const ambientSourcesRef = useRef([]);

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
      // Stop oscillator
      try {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
          gainNodeRef.current = null;
        }
        ambientSourcesRef.current.forEach((source) => {
          try { source.stop?.(); } catch (_) {}
          try { source.disconnect?.(); } catch (_) {}
        });
        ambientSourcesRef.current = [];
      } catch (_) {}
      // Close AudioContext to fully release audio resources
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // Extract Hz frequency from session
  const extractFrequency = (session) => {
    if (!session?.frequency) return 432; // Default to 432 Hz
    const match = session.frequency.match(/(\d+)\s*[Hh]z/);
    return match ? parseInt(match[1]) : 432;
  };

  // Initialize Web Audio for frequency tone
  const initAudio = (frequency) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Create oscillator
      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);

      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0.15, audioContextRef.current.currentTime); // Low volume

      // Connect: oscillator -> gain -> output
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      oscillatorRef.current.start();
    } catch (error) {
      console.error('Audio init failed:', error);
    }
  };

  const initAmbientSound = (soundId) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(0.18, audioContextRef.current.currentTime);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      const ctx = audioContextRef.current;
      const sources = [];

      if (soundId === 'ocean') {
        const { source: low, output: lowOut } = createFilteredNoise(ctx, 200, 1);
        const { source: mid, output: midOut } = createFilteredNoise(ctx, 800, 0.5);
        lowOut.connect(gainNodeRef.current);
        midOut.connect(gainNodeRef.current);
        low.start();
        mid.start();
        sources.push(low, mid);
      } else if (soundId === 'rain') {
        const { source, output } = createFilteredNoise(ctx, 400, 2);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      } else if (soundId === 'nature' || soundId === 'fire') {
        const { source, output } = createFilteredNoise(ctx, 500, 0.5);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      } else if (soundId === 'wind') {
        const { source, output } = createFilteredNoise(ctx, 650, 3);
        output.connect(gainNodeRef.current);
        source.start();
        sources.push(source);
      }

      ambientSourcesRef.current = sources;
    } catch (error) {
      console.error('Ambient sound init failed:', error);
    }
  };

  const stopSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      ambientSourcesRef.current.forEach((source) => {
        try { source.stop?.(); } catch (_) {}
        try { source.disconnect?.(); } catch (_) {}
      });
      ambientSourcesRef.current = [];
    } catch (error) {
      // Ignore errors when stopping
    }
  };

  const playSelectedSound = (session, soundId = selectedSound) => {
    if (!soundEnabled || soundId === 'silence') return;
    stopSound();
    if (soundId === 'tone' && session?.frequency) {
      initAudio(extractFrequency(session));
      return;
    }
    initAmbientSound(soundId);
  };

  const toggleSound = () => {
    if (soundEnabled && oscillatorRef.current) {
      stopSound();
    } else if (soundEnabled && ambientSourcesRef.current.length > 0) {
      stopSound();
    } else if (!soundEnabled && isPlaying && activeSession) {
      playSelectedSound(activeSession, selectedSound);
    }
    setSoundEnabled(!soundEnabled);
  };

  useEffect(() => {
    if (isPlaying && activeSession && soundEnabled) {
      playSelectedSound(activeSession, selectedSound);
    }
    if (selectedSound === 'silence') {
      stopSound();
    }
  }, [selectedSound]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setSoundEnabled(true);
    setSelectedSound(ELEMENT_DEFAULT_SOUNDS[session.element] || "tone");
  };

  const togglePlay = () => {
    if (!activeSession) return;

    if (isPlaying) {
      clearInterval(intervalRef.current);
      stopSound();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSelectedSound(activeSession, selectedSound);
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
    stopSound();
    setIsPlaying(false);
    setBreathPhase("inhale");
    setPhaseProgress(0);
    setCycleCount(0);
  };

  const closeSession = () => {
    clearInterval(intervalRef.current);
    stopSound();
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
              <Button
                data-testid="sound-toggle-btn"
                onClick={toggleSound}
                variant="outline"
                size="icon"
                className={`rounded-full border-white/10 ${soundEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </div>

              <div className="w-full max-w-sm mb-8" data-testid="breathwork-sound-selector">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-3 text-center">Breath soundscape</p>
                <Select value={selectedSound} onValueChange={setSelectedSound}>
                  <SelectTrigger className="w-full bg-card border-white/10" data-testid="breathwork-sound-select">
                    <SelectValue placeholder="Choose sound" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREATHWORK_SOUND_OPTIONS.filter((option) => option.id !== 'tone' || activeSession.frequency).map((option) => (
                      <SelectItem key={option.id} value={option.id} data-testid={`breathwork-sound-option-${option.id}`}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Choose a nature sound, stay with the healing frequency tone, or practice in silence.
                </p>
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
            
            {/* Frequency & Instructions */}
            {(activeSession.frequency || activeSession.instructions || activeSession.why_this_heals || activeSession.full_instructions) && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-xl text-left space-y-4">
                {activeSession.why_this_heals && (
                  <div>
                    <h4 className="text-sm font-medium text-amber-400 mb-2">Why This Heals</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{activeSession.why_this_heals}</p>
                  </div>
                )}
                {activeSession.frequency && (
                  <p className="text-sm text-primary">
                    Frequency: {activeSession.frequency}
                    {soundEnabled && isPlaying && selectedSound === 'tone' && (
                      <span className="ml-2 text-xs text-emerald-400">(Playing)</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Selected sound: <span className="text-primary">{BREATHWORK_SOUND_OPTIONS.find((option) => option.id === selectedSound)?.label || 'Silence'}</span>
                  {soundEnabled && isPlaying && selectedSound !== 'tone' && selectedSound !== 'silence' && (
                    <span className="ml-2 text-xs text-emerald-400">(Playing)</span>
                  )}
                </p>
                {activeSession.full_instructions && (
                  <div>
                    <h4 className="text-sm font-medium text-violet-400 mb-2">Full Instructions</h4>
                    <div className="text-xs text-muted-foreground whitespace-pre-line max-h-48 overflow-y-auto pr-2">{activeSession.full_instructions}</div>
                  </div>
                )}
                {activeSession.instructions && !activeSession.full_instructions && (
                  <p className="text-xs text-muted-foreground">{activeSession.instructions}</p>
                )}
                {activeSession.best_time && (
                  <p className="text-xs text-muted-foreground opacity-70">Best time: {activeSession.best_time}</p>
                )}
              </div>
            )}
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
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => startSession(session)}
                  data-testid={`session-card-${session.id}`}
                >
                  {session.image_url && (
                    <div className="relative h-36 overflow-hidden">
                      <img src={session.image_url} alt={session.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>
                        {session.element}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    {!session.image_url && (
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                          <Wind className={`w-6 h-6 ${colors.text}`} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {session.element}
                        </span>
                      </div>
                    )}
                    
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
                    
                    {session.frequency && (
                      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-primary">Frequency:</span> {session.frequency.split(' - ')[0]}
                      </div>
                    )}
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
