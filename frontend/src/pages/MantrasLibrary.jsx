import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Filter, Music, Play, Pause, Volume2, VolumeX, RotateCcw, Repeat, SkipForward, Gauge, Minus, Plus, PenLine, Trash2, Edit2, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { toast } from "sonner";
import { 
  createMantraAudioContext, 
  playBellTone, 
  playOmTone, 
  playMantraSound,
  ELEMENT_FREQUENCIES 
} from "../components/audio/MantraAudio";

const MantrasLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [mantras, setMantras] = useState([]);
  const [filteredMantras, setFilteredMantras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedMantra, setSelectedMantra] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  
  // User custom mantras
  const [activeTab, setActiveTab] = useState("library"); // "library" or "custom"
  const [userMantras, setUserMantras] = useState([]);
  const [isCreatingMantra, setIsCreatingMantra] = useState(false);
  const [editingMantra, setEditingMantra] = useState(null);
  const [newMantra, setNewMantra] = useState({
    text: "",
    category: "personal",
    element: "",
    notes: ""
  });
  
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
  
  // Speed/Tempo control for health reasons
  const [tempo, setTempo] = useState("normal"); // slow, normal, fast
  const tempoMultipliers = { slow: 1.5, normal: 1.0, fast: 0.7 };
  const tempoLabels = { slow: "Slow (Relaxed)", normal: "Normal", fast: "Fast (Energizing)" };
  
  // Generated mantra sound state
  const mantraAudioCtxRef = useRef(null);
  const mantraGainRef = useRef(null);
  const mantraIntervalRef = useRef(null);
  const [useGeneratedSound, setUseGeneratedSound] = useState(true); // Default to generated sound

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];
  
  const mantraCategories = [
    { value: "personal", label: "Personal Power" },
    { value: "healing", label: "Healing" },
    { value: "abundance", label: "Abundance" },
    { value: "protection", label: "Protection" },
    { value: "love", label: "Love & Compassion" },
  ];

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
    if (user) {
      fetchUserMantras();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Stop Web Audio API context (generated mantra sounds)
      if (mantraAudioCtxRef.current) {
        try { mantraAudioCtxRef.current.close(); } catch(e) {}
        mantraAudioCtxRef.current = null;
      }
      if (mantraIntervalRef.current) {
        clearInterval(mantraIntervalRef.current);
        mantraIntervalRef.current = null;
      }
    };
  }, []);

  const fetchUserMantras = async () => {
    try {
      const response = await api.get("/mantras/custom");
      setUserMantras(response.data);
    } catch (error) {
      console.error("Failed to fetch user mantras:", error);
    }
  };

  const createUserMantra = async () => {
    if (!newMantra.text.trim()) {
      toast.error("Please write your mantra");
      return;
    }
    try {
      const response = await api.post("/mantras/custom", {
        text: newMantra.text,
        category: newMantra.category,
        element: newMantra.element || null,
        notes: newMantra.notes || null
      });
      setUserMantras(prev => [response.data, ...prev]);
      setNewMantra({ text: "", category: "personal", element: "", notes: "" });
      setIsCreatingMantra(false);
      toast.success("Mantra saved!");
    } catch (error) {
      console.error("Failed to create mantra:", error);
      toast.error("Could not save mantra");
    }
  };

  const updateUserMantra = async () => {
    if (!editingMantra || !newMantra.text.trim()) return;
    try {
      const response = await api.put(`/mantras/custom/${editingMantra.mantra_id}`, {
        text: newMantra.text,
        category: newMantra.category,
        element: newMantra.element || null,
        notes: newMantra.notes || null
      });
      setUserMantras(prev => prev.map(m => 
        m.mantra_id === editingMantra.mantra_id ? response.data : m
      ));
      setNewMantra({ text: "", category: "personal", element: "", notes: "" });
      setEditingMantra(null);
      toast.success("Mantra updated!");
    } catch (error) {
      console.error("Failed to update mantra:", error);
      toast.error("Could not update mantra");
    }
  };

  const deleteUserMantra = async (mantraId) => {
    try {
      await api.delete(`/mantras/custom/${mantraId}`);
      setUserMantras(prev => prev.filter(m => m.mantra_id !== mantraId));
      toast.success("Mantra deleted");
    } catch (error) {
      console.error("Failed to delete mantra:", error);
      toast.error("Could not delete mantra");
    }
  };

  const startEditingMantra = (mantra) => {
    setEditingMantra(mantra);
    setNewMantra({
      text: mantra.text,
      category: mantra.category || "personal",
      element: mantra.element || "",
      notes: mantra.notes || ""
    });
    setIsCreatingMantra(true);
  };

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

  // Timer-based chanting (with optional generated sound)
  const startChanting = () => {
    if (!selectedMantra) return;
    setIsChanting(true);
    setCurrentRep(0);
    setChantProgress(0);
    
    const baseDuration = selectedMantra.duration_seconds || 10;
    const durationPerRep = baseDuration * tempoMultipliers[tempo];
    const totalReps = selectedMantra.repetitions || 108;
    
    // Start generated mantra sound if enabled
    if (useGeneratedSound && !isMuted) {
      startMantraSound(selectedMantra.element, durationPerRep);
    }
    
    intervalRef.current = setInterval(() => {
      setChantProgress(prev => {
        if (prev >= 100) {
          setCurrentRep(rep => {
            const newRep = rep + 1;
            if (newRep >= totalReps) {
              // Play completion bells
              if (!isMuted && mantraAudioCtxRef.current && mantraGainRef.current) {
                playBellTone(mantraAudioCtxRef.current, mantraGainRef.current, 528, 5);
              }
              stopChanting();
              logPractice();
              toast.success("Mantra practice complete!");
              return rep;
            }
            // Play bell chime at each repetition transition (audible cue for eyes-closed practice)
            if (!isMuted && mantraAudioCtxRef.current && mantraGainRef.current) {
              playBellTone(mantraAudioCtxRef.current, mantraGainRef.current, 
                ELEMENT_FREQUENCIES[selectedMantra.element] || 432, 2);
            }
            // Play sound for new repetition
            if (useGeneratedSound && !isMuted && mantraAudioCtxRef.current && mantraGainRef.current) {
              playMantraSound(mantraAudioCtxRef.current, mantraGainRef.current, selectedMantra.element, 3);
            }
            return newRep;
          });
          return 0;
        }
        return prev + (100 / (durationPerRep * 10));
      });
    }, 100);
  };
  
  // Start generated mantra sound
  const startMantraSound = (element, cycleDuration) => {
    try {
      const ctx = createMantraAudioContext();
      mantraAudioCtxRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 1.5; // Increased volume for audibility
      gainNode.connect(ctx.destination);
      mantraGainRef.current = gainNode;
      
      // Play initial bell - louder and longer
      playBellTone(ctx, gainNode, ELEMENT_FREQUENCIES[element] || 432, 4);
      
      // Show toast that sound is playing
      toast.success("Mantra sound playing - adjust volume if needed");
      
      // Set up recurring chant sounds - more frequent
      mantraIntervalRef.current = setInterval(() => {
        if (mantraAudioCtxRef.current && mantraGainRef.current) {
          playMantraSound(mantraAudioCtxRef.current, mantraGainRef.current, element, cycleDuration * 0.8);
        }
      }, cycleDuration * 1000);
      
    } catch (e) {
      console.warn("Could not start mantra sound:", e);
      toast.error("Could not play sound - please check your device volume");
    }
  };
  
  // Stop generated mantra sound
  const stopMantraSound = () => {
    if (mantraIntervalRef.current) {
      clearInterval(mantraIntervalRef.current);
      mantraIntervalRef.current = null;
    }
    if (mantraAudioCtxRef.current && mantraAudioCtxRef.current.state !== 'closed') {
      mantraAudioCtxRef.current.close();
    }
    mantraAudioCtxRef.current = null;
    mantraGainRef.current = null;
  };

  const stopChanting = () => {
    setIsChanting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopMantraSound();
  };

  const resetChanting = () => {
    stopChanting();
    setCurrentRep(0);
    setChantProgress(0);
    stopMantraSound();
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

  const getElementGuidance = (element) => {
    const key = (element || "Spirit").toLowerCase();
    if (key === "earth") return "stabilize your body and nervous system through grounded repetition";
    if (key === "water") return "soften emotional holding and restore compassionate flow";
    if (key === "fire") return "transform old patterns and awaken focused life force";
    if (key === "air") return "clear mental turbulence and strengthen inner witnessing";
    return "expand spiritual connection and return to sacred stillness";
  };

  const createGuidedMantraPractice = (mantra) => {
    const perRep = Math.max(6, Number(mantra?.duration_seconds || 10));
    const repsForGuidance = Math.max(21, Math.min(Number(mantra?.repetitions || 54), 72));
    const estimatedMinutes = Math.max(7, Math.ceil((perRep * repsForGuidance) / 60));
    const coreIntention = mantra?.translation || mantra?.practice_tips || "Return to breath and sacred sound.";
    const benefits = Array.isArray(mantra?.benefits) ? mantra.benefits : [];

    return {
      id: `guided-mantra-${mantra.id}`,
      name: `${mantra.name} Guided Journey`,
      element: mantra.element || "Spirit",
      duration_minutes: estimatedMinutes,
      description: `A continuous guided mantra immersion with breath pacing, repetition cycles, and integration cues for ${mantra.name}.`,
      instructions: [
        `Begin with steady breath and softly introduce the mantra: ${mantra.name}.`,
        `Repeat at a gentle rhythm while relaxing jaw, throat, and shoulders.`,
        `On each cycle, let the mantra carry attention inward instead of forcing concentration.`,
        `Use pauses to feel resonance in the ${mantra.chakra || "energy body"}.`,
      ],
      steps: [
        `Settle and breathe into the ${mantra.element || "spirit"} field.`,
        `Repeat ${mantra.name} with awareness of sound and vibration.`,
        `Receive the mantra medicine: ${coreIntention}.`,
        `Integrate the vibration through stillness and gratitude.`,
      ],
      guidance: `${mantra.name} can ${getElementGuidance(mantra.element)}. ${coreIntention}`,
      practice_guide: mantra.practice_tips || coreIntention,
      affirmations: [
        coreIntention,
        `I stay present with each repetition of ${mantra.name}.`,
        `Sacred sound is reshaping my breath, mind, and heart.`,
      ],
      benefits,
      why_this_heals: `${mantra.name} uses rhythmic repetition, breath entrainment, and attentional focus to regulate stress response and deepen embodied presence.`,
      extended_teachings: `${mantra.name} has traditionally been practiced as vibrational medicine. Consistent repetition over time trains the mind toward steadiness and devotional attention.`,
    };
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
        {/* Tabs: Library vs Custom */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "library"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
            }`}
            data-testid="tab-library"
          >
            <Music className="w-4 h-4" />
            Sacred Library
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "custom"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10"
            }`}
            data-testid="tab-custom"
          >
            <PenLine className="w-4 h-4" />
            My Mantras
            {userMantras.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-xs">
                {userMantras.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "custom" ? (
          /* Custom Mantras Section */
          <div className="space-y-6">
            {/* Create New Mantra Button */}
            {user ? (
              <Button
                onClick={() => {
                  setEditingMantra(null);
                  setNewMantra({ text: "", category: "personal", element: "", notes: "" });
                  setIsCreatingMantra(true);
                }}
                className="w-full py-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-pink-600/30"
                data-testid="create-mantra-btn"
              >
                <PenLine className="w-5 h-5 mr-2" />
                Write Your Own Powerful Mantra
              </Button>
            ) : (
              <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                <p className="text-lg font-serif mb-2">Sign in to create your own mantras</p>
                <p className="text-sm text-muted-foreground mb-4">Save and organize your personal sacred words</p>
                <Button onClick={() => navigate("/auth")} className="bg-purple-600 hover:bg-purple-700">
                  Sign In
                </Button>
              </div>
            )}

            {/* User's Custom Mantras List */}
            {userMantras.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMantras.map((mantra, index) => {
                  const colors = mantra.element ? elementColors[mantra.element] : { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400" };
                  return (
                    <motion.div
                      key={mantra.mantra_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 rounded-2xl border ${colors.bg} ${colors.border} relative group`}
                    >
                      {/* Actions */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditingMantra(mantra)}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          data-testid={`edit-mantra-${mantra.mantra_id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUserMantra(mantra.mantra_id)}
                          className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          data-testid={`delete-mantra-${mantra.mantra_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Category & Element Badge */}
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full bg-white/10 text-xs capitalize">
                          {mantra.category}
                        </span>
                        {mantra.element && (
                          <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                            {mantra.element}
                          </span>
                        )}
                      </div>

                      {/* Mantra Text */}
                      <p className="text-lg font-serif italic leading-relaxed mb-3">
                        "{mantra.text}"
                      </p>

                      {/* Notes */}
                      {mantra.notes && (
                        <p className="text-sm text-muted-foreground">
                          {mantra.notes}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : user && (
              <div className="text-center py-12">
                <PenLine className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-serif mb-2">No custom mantras yet</p>
                <p className="text-muted-foreground">Write your first powerful mantra above</p>
              </div>
            )}
          </div>
        ) : loading ? (
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
                  /* Timer-based Chanting Practice with Sound */
                  <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <h4 className="text-sm uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Chanting Timer with Sound
                    </h4>
                    
                    <div className="text-center mb-4">
                      <p className="text-4xl font-serif text-primary">{currentRep}</p>
                      <p className="text-sm text-muted-foreground">of {selectedMantra.repetitions} repetitions</p>
                    </div>

                    <Progress value={chantProgress} className="h-2 mb-4" />
                    
                    {/* Tempo/Speed Control for Health Reasons */}
                    <div className="mb-4 p-4 rounded-lg bg-black/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Gauge className="w-4 h-4" /> Pace Control
                        </span>
                        <span className="text-xs text-primary">{tempoLabels[tempo]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTempo("slow")}
                          disabled={isChanting}
                          className={`flex-1 text-xs ${tempo === "slow" ? "bg-blue-500/20 text-blue-400" : ""}`}
                        >
                          <Minus className="w-3 h-3 mr-1" /> Slow
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTempo("normal")}
                          disabled={isChanting}
                          className={`flex-1 text-xs ${tempo === "normal" ? "bg-primary/20 text-primary" : ""}`}
                        >
                          Normal
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTempo("fast")}
                          disabled={isChanting}
                          className={`flex-1 text-xs ${tempo === "fast" ? "bg-orange-500/20 text-orange-400" : ""}`}
                        >
                          Fast <Plus className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {tempo === "slow" ? "Relaxed pace for meditation & breathing conditions" : 
                         tempo === "fast" ? "Energizing pace for active practice" : 
                         "Standard pace for balanced practice"}
                      </p>
                    </div>
                    
                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-sm flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" /> 
                        <span className="font-medium">Meditation Sound</span>
                      </span>
                      <Button
                        variant={useGeneratedSound ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setUseGeneratedSound(!useGeneratedSound)}
                        className={useGeneratedSound ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                      >
                        {useGeneratedSound ? "ON - Bells & Om" : "OFF - Silent"}
                      </Button>
                    </div>
                    
                    {/* Sound Info */}
                    {useGeneratedSound && (
                      <p className="text-xs text-primary/80 text-center mb-4 p-2 rounded bg-primary/5">
                        🔔 Bell tones & Om sounds will play during your practice. Make sure your device volume is up!
                      </p>
                    )}
                    
                    {/* Volume Control (when sound enabled) */}
                    {useGeneratedSound && (
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
                          max={1}
                          step={0.01}
                          className="flex-1"
                        />
                      </div>
                    )}

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
                      {useGeneratedSound 
                        ? `Om tones & bells accompany your ${Math.round(selectedMantra.duration_seconds * tempoMultipliers[tempo])}s cycles.`
                        : `Chant along with each ${Math.round(selectedMantra.duration_seconds * tempoMultipliers[tempo])} second cycle.`
                      }
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="mantra-why-this-heals">
                    <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</h4>
                    <p className="text-sm text-emerald-100/80 leading-relaxed">
                      Repetition at stable rhythm helps settle fight-or-flight activation, while vocal resonance supports vagal tone and emotional regulation.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20" data-testid="mantra-integration-guide">
                    <h4 className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration</h4>
                    <p className="text-sm text-violet-100/80 leading-relaxed">
                      After chanting, sit in silence for 1-3 minutes. Let the vibration settle before returning to activity.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setGuidedPractice(createGuidedMantraPractice(selectedMantra))}
                  className="w-full py-6 rounded-xl bg-gradient-to-r from-primary to-amber-400 text-black hover:opacity-90"
                  data-testid="start-mantra-guided-practice-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Begin Guided Mantra Practice
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {guidedPractice && (
        <GuidedPracticeOverlay
          practice={guidedPractice}
          onExit={() => setGuidedPractice(null)}
        />
      )}

      {/* Create/Edit Custom Mantra Dialog */}
      <Dialog open={isCreatingMantra} onOpenChange={(open) => {
        setIsCreatingMantra(open);
        if (!open) {
          setEditingMantra(null);
          setNewMantra({ text: "", category: "personal", element: "", notes: "" });
        }
      }}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {editingMantra ? "Edit Your Mantra" : "Write Your Mantra"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Mantra Text */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Your Sacred Words</label>
              <Textarea
                value={newMantra.text}
                onChange={(e) => setNewMantra(prev => ({ ...prev, text: e.target.value }))}
                placeholder="I am worthy of love and abundance..."
                className="bg-card/50 border-white/10 min-h-24 text-lg font-serif"
                data-testid="mantra-text-input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Category</label>
              <Select 
                value={newMantra.category} 
                onValueChange={(value) => setNewMantra(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-card/50 border-white/10">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {mantraCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Element (optional) */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Element (optional)</label>
              <Select 
                value={newMantra.element} 
                onValueChange={(value) => setNewMantra(prev => ({ ...prev, element: value }))}
              >
                <SelectTrigger className="bg-card/50 border-white/10">
                  <SelectValue placeholder="Connect to an element..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {elements.filter(e => e !== "all").map((el) => (
                    <SelectItem key={el} value={el}>
                      {el}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Notes (optional)</label>
              <Input
                value={newMantra.notes}
                onChange={(e) => setNewMantra(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="When to use this mantra, what it means to you..."
                className="bg-card/50 border-white/10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingMantra(false);
                  setEditingMantra(null);
                  setNewMantra({ text: "", category: "personal", element: "", notes: "" });
                }}
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={editingMantra ? updateUserMantra : createUserMantra}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                data-testid="save-mantra-btn"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {editingMantra ? "Update Mantra" : "Save Mantra"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MantrasLibrary;
