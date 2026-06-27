import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Music, Play, Pause, Volume2, VolumeX, RotateCcw, Repeat, SkipForward, Gauge, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { Slider } from "../../components/ui/slider";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import AmbientSoundPlayer, { AMBIENT_SOUNDS } from "../../components/AmbientSoundPlayer";
import { toast } from "sonner";
import { 
  createMantraAudioContext, 
  playBellTone, 
  playOmTone, 
  playChantForMantra,
  playMantraSound,
  ELEMENT_FREQUENCIES 
} from "../../components/audio/MantraAudio";
import { appLogger } from "../../utils/logger";
import { MantrasFilters } from "./MantrasFilters";
import { MantrasLibraryGrid } from "./MantrasLibraryGrid";
import { MantrasCustomSection } from "./MantrasCustomSection";
import { MantrasPlayer } from "./MantrasPlayer";
import { useMantrasData } from "./useMantrasData";

const NATURAL_SOUND_OPTIONS = [
  { id: "ocean", label: AMBIENT_SOUNDS.ocean.name },
  { id: "rain", label: AMBIENT_SOUNDS.rain.name },
  { id: "nature", label: AMBIENT_SOUNDS.nature.name },
  { id: "wind", label: AMBIENT_SOUNDS.wind.name },
  { id: "fire", label: AMBIENT_SOUNDS.fire.name },
  { id: "silence", label: "Silence" },
];

const OM_CHANT_LOOP_URL = "https://cdn.pixabay.com/download/audio/2022/03/15/audio_6f95e7f9e0.mp3?filename=om-chant-loop-ambient-10274.mp3";

const isOmMantra = (mantra) => String(mantra?.name || "").trim().toLowerCase() === "om";

const resolveMantraAudioUrl = (mantra) => {
  if (!mantra) return "";
  // Keep OM fallback stream for users preferring direct external loop,
  // but in-app chanting now runs from generated chant audio for ALL mantras.
  if (isOmMantra(mantra)) return OM_CHANT_LOOP_URL;
  return mantra.audio_url || "";
};

const ELEMENT_NATURAL_DEFAULT = {
  Earth: "nature",
  Water: "ocean",
  Fire: "fire",
  Air: "wind",
  Spirit: "rain",
};

const safeCloseAudioContext = (contextRef) => {
  if (!contextRef.current) return;
  contextRef.current.close().catch((error) => {
    appLogger.warn("Error while closing mantra audio context", error);
  }).finally(() => {
    contextRef.current = null;
  });
};

const MantrasLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    filteredMantras,
    loading,
    selectedElement,
    setSelectedElement,
    favorites,
    userMantras,
    selectedNaturalSound,
    setSelectedNaturalSound,
    isCreatingMantra,
    setIsCreatingMantra,
    editingMantra,
    setEditingMantra,
    newMantra,
    setNewMantra,
    createUserMantra,
    updateUserMantra,
    deleteUserMantra,
    startEditingMantra,
    toggleFavorite,
  } = useMantrasData({ api, user });

  const [selectedMantra, setSelectedMantra] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [activeTab, setActiveTab] = useState("library"); // "library" or "custom"

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

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  const setupAudio = useCallback((url) => {
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
      appLogger.warn("Could not load mantra audio", { mantra: selectedMantra?.name, url });
    });
    
    audioRef.current = audio;
  }, [audioRef, isLooping, selectedMantra?.name, setAudioError, setAudioProgress, setCurrentRep, setIsPlaying, volume]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Stop Web Audio API context (generated mantra sounds)
      if (mantraAudioCtxRef.current) {
        safeCloseAudioContext(mantraAudioCtxRef);
      }
      if (mantraIntervalRef.current) {
        clearInterval(mantraIntervalRef.current);
        mantraIntervalRef.current = null;
      }
    };
  }, [audioRef, intervalRef, mantraAudioCtxRef, mantraIntervalRef]);

  // Audio setup when mantra is selected
  useEffect(() => {
    const resolvedUrl = resolveMantraAudioUrl(selectedMantra);
    if (resolvedUrl) {
      setupAudio(resolvedUrl);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioRef, selectedMantra, setupAudio]);

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
        if (mantraGainRef.current) {
          mantraGainRef.current.gain.value = volume || 0.7;
        }
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
        if (mantraGainRef.current) {
          mantraGainRef.current.gain.value = 0;
        }
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
    
    // Start generated chant-style mantra sound if enabled
    if (useGeneratedSound && !isMuted) {
      startMantraSound(selectedMantra, durationPerRep);
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
              playChantForMantra(
                mantraAudioCtxRef.current,
                mantraGainRef.current,
                selectedMantra.name,
                selectedMantra.element,
                Math.max(durationPerRep * 0.75, 2.8),
              );
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
  const startMantraSound = (mantra, cycleDuration) => {
    try {
      const ctx = createMantraAudioContext();
      mantraAudioCtxRef.current = ctx;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume * 1.5; // Increased volume for audibility
      gainNode.connect(ctx.destination);
      mantraGainRef.current = gainNode;
      
      // Play initial bell - louder and longer
      playBellTone(ctx, gainNode, ELEMENT_FREQUENCIES[mantra?.element] || 432, 2.2);

      // Chant-style synthesis for every mantra (OM and non-OM)
      playChantForMantra(
        ctx,
        gainNode,
        mantra?.name,
        mantra?.element,
        Math.max(cycleDuration * 0.9, 3.2),
      );
      
      // Show toast that sound is playing
      toast.success(
        isOmMantra(selectedMantra)
          ? "OM chant resonance playing"
          : `${mantra?.name || "Mantra"} chant resonance playing`
      );
      
      // Set up recurring chant sounds - more frequent
      mantraIntervalRef.current = setInterval(() => {
        if (mantraAudioCtxRef.current && mantraGainRef.current) {
          playChantForMantra(
            mantraAudioCtxRef.current,
            mantraGainRef.current,
            mantra?.name,
            mantra?.element,
            Math.max(cycleDuration * 0.8, 3),
          );
        }
      }, cycleDuration * 1000);
      
    } catch (error) {
      appLogger.warn("Could not start mantra sound", error);
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
      safeCloseAudioContext(mantraAudioCtxRef);
    } else {
      mantraAudioCtxRef.current = null;
    }
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
    setAudioError(false);
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
      appLogger.warn("Failed to log mantra practice", error);
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

  const handleNaturalSoundChange = (soundId) => {
    setSelectedNaturalSound(soundId);
  };

  const ensureElementNaturalDefault = (mantra) => {
    const saved = selectedNaturalSound;
    if (saved && NATURAL_SOUND_OPTIONS.some((option) => option.id === saved)) return;
    const next = ELEMENT_NATURAL_DEFAULT[mantra?.element] || "ocean";
    setSelectedNaturalSound(next);
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

  const renderMainContent = () => {
    if (activeTab === "custom") {
      return (
        <MantrasCustomSection
          user={user}
          navigate={navigate}
          userMantras={userMantras}
          elementColors={elementColors}
          setEditingMantra={setEditingMantra}
          setNewMantra={setNewMantra}
          setIsCreatingMantra={setIsCreatingMantra}
          startEditingMantra={startEditingMantra}
          deleteUserMantra={deleteUserMantra}
        />
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    }

    return (
      <MantrasLibraryGrid
        filteredMantras={filteredMantras}
        favorites={favorites}
        elementColors={elementColors}
        ensureElementNaturalDefault={ensureElementNaturalDefault}
        setSelectedMantra={setSelectedMantra}
        toggleFavorite={toggleFavorite}
        formatReviewedDate={formatReviewedDate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background" data-testid="mantras-library">
      <MantrasFilters
        navigate={navigate}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        elements={elements}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userMantrasCount={userMantras.length}
      />

      <main className="max-w-6xl mx-auto p-6">
        {renderMainContent()}
      </main>

      <MantrasPlayer
        selectedMantra={selectedMantra}
        hasPlayableAudio={Boolean(resolveMantraAudioUrl(selectedMantra))}
        onClose={handleDialogClose}
        elementColors={elementColors}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        isPlaying={isPlaying}
        audioError={audioError}
        currentRep={currentRep}
        audioProgress={audioProgress}
        audioDuration={audioDuration}
        formatTime={formatTime}
        isLooping={isLooping}
        toggleLoop={toggleLoop}
        toggleAudio={toggleAudio}
        skipToNext={skipToNext}
        isMuted={isMuted}
        toggleMute={toggleMute}
        volume={volume}
        handleVolumeChange={handleVolumeChange}
        selectedNaturalSound={selectedNaturalSound}
        handleNaturalSoundChange={handleNaturalSoundChange}
        naturalSoundOptions={NATURAL_SOUND_OPTIONS}
        isChanting={isChanting}
        tempo={tempo}
        setTempo={setTempo}
        tempoLabels={tempoLabels}
        useGeneratedSound={useGeneratedSound}
        setUseGeneratedSound={setUseGeneratedSound}
        resetChanting={resetChanting}
        startChanting={startChanting}
        stopChanting={stopChanting}
        tempoMultipliers={tempoMultipliers}
        setVolume={setVolume}
        setIsMuted={setIsMuted}
        setGuidedPractice={setGuidedPractice}
        createGuidedMantraPractice={createGuidedMantraPractice}
      />

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
                onValueChange={(value) => setNewMantra(prev => ({ ...prev, element: value === "none" ? "" : value }))}
              >
                <SelectTrigger className="bg-card/50 border-white/10">
                  <SelectValue placeholder="Connect to an element..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
