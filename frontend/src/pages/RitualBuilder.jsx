import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Trash2, Play, Pause, RotateCcw, Save, Clock,
  Leaf, Wind, Music, Hand, GripVertical, ChevronDown, Check, Share2, Copy, Link
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { toast } from "sonner";

const RitualBuilder = ({ user, api }) => {
  const navigate = useNavigate();
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeRitual, setActiveRitual] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharingRitualId, setSharingRitualId] = useState(null);

  // Available practices to add
  const [practices, setPractices] = useState({
    yoga: [],
    breathwork: [],
    mantra: [],
    mudra: [],
  });

  // New ritual form
  const [newRitual, setNewRitual] = useState({
    name: "",
    description: "",
    practices: [],
  });

  const [addingPractice, setAddingPractice] = useState(false);
  const [selectedType, setSelectedType] = useState("yoga");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceDuration, setPracticeDuration] = useState(5);

  const practiceIcons = {
    yoga: Leaf,
    breathwork: Wind,
    mantra: Music,
    mudra: Hand,
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && activeRitual) {
      interval = setInterval(() => {
        setStepProgress(prev => {
          const currentPractice = activeRitual.practices[currentStep];
          const stepDuration = currentPractice?.duration * 60 || 300; // seconds
          const increment = 100 / stepDuration;
          
          if (prev + increment >= 100) {
            // Move to next step
            if (currentStep < activeRitual.practices.length - 1) {
              setCurrentStep(s => s + 1);
              return 0;
            } else {
              // Ritual complete
              setIsPlaying(false);
              logRitualComplete();
              toast.success("Ritual complete! Blessed be.");
              return 100;
            }
          }
          return prev + increment;
        });
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, activeRitual]);

  const fetchData = async () => {
    try {
      const [ritualsRes, yogaRes, breathworkRes, mantraRes, mudraRes] = await Promise.all([
        api.get("/rituals"),
        api.get("/yoga/poses"),
        api.get("/breathwork/sessions"),
        api.get("/mantras"),
        api.get("/mudras"),
      ]);
      
      setRituals(ritualsRes.data);
      setPractices({
        yoga: yogaRes.data,
        breathwork: breathworkRes.data,
        mantra: mantraRes.data,
        mudra: mudraRes.data,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPracticeToRitual = () => {
    if (!selectedPractice) return;
    
    const practice = practices[selectedType].find(p => p.id === selectedPractice);
    if (!practice) return;

    setNewRitual(prev => ({
      ...prev,
      practices: [
        ...prev.practices,
        {
          type: selectedType,
          id: practice.id,
          name: practice.name,
          duration: practiceDuration,
        }
      ]
    }));

    setSelectedPractice(null);
    setPracticeDuration(5);
    setAddingPractice(false);
  };

  const removePractice = (index) => {
    setNewRitual(prev => ({
      ...prev,
      practices: prev.practices.filter((_, i) => i !== index)
    }));
  };

  const saveRitual = async () => {
    if (!newRitual.name || newRitual.practices.length === 0) {
      toast.error("Please add a name and at least one practice");
      return;
    }

    try {
      const totalDuration = newRitual.practices.reduce((sum, p) => sum + p.duration, 0);
      const response = await api.post("/rituals", {
        ...newRitual,
        total_duration: totalDuration,
      });
      
      setRituals(prev => [...prev, response.data]);
      setNewRitual({ name: "", description: "", practices: [] });
      setCreating(false);
      toast.success("Ritual saved!");
    } catch (error) {
      console.error("Failed to save ritual:", error);
      toast.error("Could not save ritual");
    }
  };

  const deleteRitual = async (ritualId) => {
    try {
      await api.delete(`/rituals/${ritualId}`);
      setRituals(prev => prev.filter(r => r.ritual_id !== ritualId));
      toast.success("Ritual deleted");
    } catch (error) {
      console.error("Failed to delete ritual:", error);
      toast.error("Could not delete ritual");
    }
  };

  const startRitual = (ritual) => {
    setActiveRitual(ritual);
    setCurrentStep(0);
    setStepProgress(0);
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const logRitualComplete = async () => {
    if (!activeRitual) return;
    try {
      await api.post("/practice-history", {
        practice_type: "ritual",
        practice_id: activeRitual.ritual_id,
        duration_minutes: activeRitual.total_duration,
        notes: `Completed ritual: ${activeRitual.name}`,
      });
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return newRitual.practices.reduce((sum, p) => sum + p.duration, 0);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="ritual-builder">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeRitual ? setActiveRitual(null) : navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Practice</p>
              <h1 className="text-xl font-serif">Daily <span className="italic text-primary">Rituals</span></h1>
            </div>
          </div>

          {!activeRitual && !creating && (
            <Button
              onClick={() => setCreating(true)}
              className="bg-primary text-primary-foreground"
              data-testid="create-ritual-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ritual
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : activeRitual ? (
          /* Active Ritual Player */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-serif mb-2">{activeRitual.name}</h2>
              <p className="text-muted-foreground">{activeRitual.description}</p>
            </div>

            {/* Current Practice */}
            <div className="p-8 rounded-2xl bg-card/50 border border-primary/20 mb-8">
              {activeRitual.practices[currentStep] && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {activeRitual.practices.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(elapsedTime)} / {activeRitual.total_duration} min
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    {(() => {
                      const Icon = practiceIcons[activeRitual.practices[currentStep].type] || Leaf;
                      return <Icon className="w-12 h-12 text-primary" />;
                    })()}
                    <div>
                      <h3 className="text-2xl font-serif">{activeRitual.practices[currentStep].name}</h3>
                      <p className="text-muted-foreground capitalize">
                        {activeRitual.practices[currentStep].type} • {activeRitual.practices[currentStep].duration} min
                      </p>
                    </div>
                  </div>

                  <Progress value={stepProgress} className="h-3 mb-6" />

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      size="lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`rounded-full w-16 h-16 ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary'}`}
                      data-testid="play-pause-btn"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setCurrentStep(0);
                        setStepProgress(0);
                        setElapsedTime(0);
                        setIsPlaying(false);
                      }}
                      className="rounded-full border-white/10"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Practice Steps */}
            <div className="space-y-2">
              {activeRitual.practices.map((practice, index) => {
                const Icon = practiceIcons[practice.type] || Leaf;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl flex items-center gap-4 transition-all
                               ${isActive ? 'bg-primary/20 border border-primary/30' : 
                                 isComplete ? 'bg-emerald-500/10 border border-emerald-500/20' : 
                                 'bg-card/30 border border-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                   ${isComplete ? 'bg-emerald-500' : isActive ? 'bg-primary' : 'bg-white/10'}`}>
                      {isComplete ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className={isActive ? 'text-foreground' : 'text-muted-foreground'}>{practice.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{practice.duration} min</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : creating ? (
          /* Create Ritual Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Ritual Name</label>
                <Input
                  value={newRitual.name}
                  onChange={(e) => setNewRitual(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Morning Awakening, Evening Wind Down..."
                  className="bg-card/50 border-white/10"
                  data-testid="ritual-name-input"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description (optional)</label>
                <Textarea
                  value={newRitual.description}
                  onChange={(e) => setNewRitual(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A sacred sequence to start the day..."
                  className="bg-card/50 border-white/10 min-h-20"
                />
              </div>

              {/* Practices List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-muted-foreground">Practices ({getTotalDuration()} min total)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingPractice(true)}
                    className="border-white/10"
                    data-testid="add-practice-btn"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Practice
                  </Button>
                </div>

                {newRitual.practices.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 text-center">
                    <p className="text-muted-foreground">Add practices to build your ritual</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {newRitual.practices.map((practice, index) => {
                      const Icon = practiceIcons[practice.type] || Leaf;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-xl bg-card/50 border border-white/5 flex items-center gap-4"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <Icon className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium">{practice.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{practice.type}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{practice.duration} min</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePractice(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Save/Cancel */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setNewRitual({ name: "", description: "", practices: [] });
                  }}
                  className="flex-1 border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveRitual}
                  className="flex-1 bg-primary"
                  data-testid="save-ritual-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Ritual
                </Button>
              </div>
            </div>

            {/* Add Practice Dialog */}
            <Dialog open={addingPractice} onOpenChange={setAddingPractice}>
              <DialogContent className="bg-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Add Practice</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Type</label>
                    <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setSelectedPractice(null); }}>
                      <SelectTrigger className="bg-card/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yoga">Yoga Pose</SelectItem>
                        <SelectItem value="breathwork">Breathwork</SelectItem>
                        <SelectItem value="mantra">Mantra</SelectItem>
                        <SelectItem value="mudra">Mudra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Practice</label>
                    <Select value={selectedPractice || ""} onValueChange={setSelectedPractice}>
                      <SelectTrigger className="bg-card/50 border-white/10">
                        <SelectValue placeholder="Select a practice" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {practices[selectedType]?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={practiceDuration}
                      onChange={(e) => setPracticeDuration(parseInt(e.target.value) || 5)}
                      className="bg-card/50 border-white/10"
                    />
                  </div>

                  <Button
                    onClick={addPracticeToRitual}
                    disabled={!selectedPractice}
                    className="w-full bg-primary"
                  >
                    Add to Ritual
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          /* Rituals List */
          <div>
            {rituals.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-serif mb-2">No Rituals Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create a daily ritual combining your favorite practices
                </p>
                <Button onClick={() => setCreating(true)} className="bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ritual
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rituals.map((ritual, index) => (
                  <motion.div
                    key={ritual.ritual_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 rounded-2xl bg-card/50 border border-white/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-serif">{ritual.name}</h3>
                        <p className="text-sm text-muted-foreground">{ritual.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRitual(ritual.ritual_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {ritual.practices?.slice(0, 4).map((p, i) => {
                        const Icon = practiceIcons[p.type] || Leaf;
                        return (
                          <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-xs flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {p.name}
                          </span>
                        );
                      })}
                      {ritual.practices?.length > 4 && (
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs">
                          +{ritual.practices.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {ritual.total_duration} min
                      </span>
                      <Button
                        onClick={() => startRitual(ritual)}
                        size="sm"
                        className="bg-primary"
                        data-testid={`start-ritual-${ritual.ritual_id}`}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RitualBuilder;
