import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, Play, Pause, RotateCcw, Save, Clock,
  Leaf, Wind, Music, Hand, GripVertical, ChevronDown, Check, Share2, Copy, Sparkles
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";

const RitualBuilderContainer = ({ user, api }) => {
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

  const [practices, setPractices] = useState({
    yoga: [],
    breathwork: [],
    mantra: [],
    mudra: [],
  });

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

  const fetchData = useCallback(async () => {
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
      appLogger.error("Failed to fetch ritual builder data", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPracticeToRitual = () => {
    if (!selectedPractice) return;

    const practice = practices[selectedType].find((p) => p.id === selectedPractice);
    if (!practice) return;

    setNewRitual((prev) => ({
      ...prev,
      practices: [
        ...prev.practices,
        {
          type: selectedType,
          id: practice.id,
          name: practice.name,
          duration: practiceDuration,
        },
      ],
    }));

    setSelectedPractice(null);
    setPracticeDuration(5);
    setAddingPractice(false);
  };

  const removePractice = (index) => {
    setNewRitual((prev) => ({
      ...prev,
      practices: prev.practices.filter((_, i) => i !== index),
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

      setRituals((prev) => [...prev, response.data]);
      setNewRitual({ name: "", description: "", practices: [] });
      setCreating(false);
      toast.success("Ritual saved!");
    } catch (error) {
      appLogger.error("Failed to save ritual", error);
      toast.error("Could not save ritual");
    }
  };

  const deleteRitual = async (ritualId) => {
    try {
      await api.delete(`/rituals/${ritualId}`);
      setRituals((prev) => prev.filter((r) => r.ritual_id !== ritualId));
      toast.success("Ritual deleted");
    } catch (error) {
      appLogger.warn("Failed to delete ritual", error);
      toast.error("Could not delete ritual");
    }
  };

  const shareRitual = async (ritualId) => {
    setSharingRitualId(ritualId);
    try {
      const response = await api.post(`/rituals/${ritualId}/share`);
      const fullUrl = `${window.location.origin}/rituals/shared/${response.data.share_code}`;
      setShareUrl(fullUrl);
      setShareDialogOpen(true);
    } catch (error) {
      appLogger.warn("Failed to share ritual", error);
      toast.error("Could not create share link");
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const startRitual = (ritual) => {
    setActiveRitual(ritual);
    setCurrentStep(0);
    setStepProgress(0);
    setElapsedTime(0);
    setIsPlaying(false);
  };

  const logRitualComplete = useCallback(async () => {
    if (!activeRitual) return;
    try {
      await api.post("/practice-history", {
        practice_type: "ritual",
        practice_id: activeRitual.ritual_id,
        duration_minutes: activeRitual.total_duration,
        notes: `Completed ritual: ${activeRitual.name}`,
      });
    } catch (error) {
      appLogger.warn("Failed to log ritual practice", error);
    }
  }, [activeRitual, api]);

  useEffect(() => {
    let interval;
    if (isPlaying && activeRitual) {
      interval = setInterval(() => {
        setStepProgress((prev) => {
          const currentPractice = activeRitual.practices[currentStep];
          const stepDuration = currentPractice?.duration * 60 || 300;
          const increment = 100 / stepDuration;

          if (prev + increment >= 100) {
            if (currentStep < activeRitual.practices.length - 1) {
              setCurrentStep((s) => s + 1);
              return 0;
            }

            setIsPlaying(false);
            logRitualComplete();
            toast.success("Ritual complete! Blessed be.");
            return 100;
          }
          return prev + increment;
        });
        setElapsedTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, activeRitual, logRitualComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = () => newRitual.practices.reduce((sum, p) => sum + p.duration, 0);

  const getMainContentMode = () => {
    if (loading) return "loading";
    if (activeRitual) return "active";
    if (creating) return "creating";
    return "list";
  };

  const getStepContainerClass = (isActive, isComplete) => {
    if (isActive) return "bg-primary/20 border border-primary/30";
    if (isComplete) return "bg-emerald-500/10 border border-emerald-500/20";
    return "bg-card/50 border border-white/10";
  };

  const renderLoadingView = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your rituals...</p>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif mb-2">Ritual Builder</h1>
          <p className="text-muted-foreground">Create your custom sacred practice sequences</p>
        </div>
        <Button onClick={() => setCreating(true)} className="bg-primary" data-testid="create-ritual-btn">
          <Plus className="w-4 h-4 mr-2" /> Create New Ritual
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="rituals-grid">
        {rituals.map((ritual, index) => (
          <motion.div
            key={ritual.ritual_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/10 hover:border-primary/30 transition-all"
            data-testid={`ritual-card-${ritual.ritual_id}`}
          >
            <h3 className="text-xl font-serif mb-2">{ritual.name}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ritual.description || "No description"}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{ritual.total_duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4" />
                <span>{ritual.practices?.length || 0} practices</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => startRitual(ritual)} className="flex-1" data-testid={`start-ritual-${ritual.ritual_id}`}>
                <Play className="w-3 h-3 mr-1" /> Start
              </Button>
              <Button size="sm" variant="outline" onClick={() => shareRitual(ritual.ritual_id)} disabled={sharingRitualId === ritual.ritual_id} data-testid={`share-ritual-${ritual.ritual_id}`}>
                <Share2 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteRitual(ritual.ritual_id)} data-testid={`delete-ritual-${ritual.ritual_id}`}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {rituals.length === 0 && (
        <div className="text-center py-12" data-testid="empty-rituals">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No rituals created yet. Start building your sacred sequence.</p>
        </div>
      )}
    </div>
  );

  const renderCreatingView = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif">Create New Ritual</h1>
        <Button variant="ghost" onClick={() => setCreating(false)}>
          Cancel
        </Button>
      </div>

      <div className="p-6 rounded-2xl bg-card/50 border border-white/10 space-y-4">
        <Input
          placeholder="Ritual name"
          value={newRitual.name}
          onChange={(e) => setNewRitual((prev) => ({ ...prev, name: e.target.value }))}
          data-testid="ritual-name-input"
        />
        <Textarea
          placeholder="Describe your ritual intention..."
          value={newRitual.description}
          onChange={(e) => setNewRitual((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          data-testid="ritual-description-input"
        />

        <div className="p-4 rounded-xl bg-background/50 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Practices ({newRitual.practices.length})</h3>
            <Button size="sm" variant="outline" onClick={() => setAddingPractice(!addingPractice)} data-testid="add-practice-toggle">
              <Plus className="w-3 h-3 mr-1" /> Add Practice
            </Button>
          </div>

          {addingPractice && (
            <div className="space-y-3 p-3 rounded-lg bg-card border border-white/10 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger data-testid="practice-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="breathwork">Breathwork</SelectItem>
                    <SelectItem value="mantra">Mantra</SelectItem>
                    <SelectItem value="mudra">Mudra</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPractice || ""} onValueChange={setSelectedPractice}>
                  <SelectTrigger data-testid="practice-select"><SelectValue placeholder="Select practice" /></SelectTrigger>
                  <SelectContent>
                    {practices[selectedType].map((practice) => (
                      <SelectItem key={practice.id} value={practice.id}>{practice.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={practiceDuration}
                  onChange={(e) => setPracticeDuration(parseInt(e.target.value, 10) || 5)}
                  placeholder="Minutes"
                  data-testid="practice-duration-input"
                />
              </div>
              <Button size="sm" onClick={addPracticeToRitual} data-testid="confirm-add-practice">Add</Button>
            </div>
          )}

          <div className="space-y-2" data-testid="ritual-practice-list">
            {newRitual.practices.map((practice, index) => {
              const Icon = practiceIcons[practice.type];
              return (
                <div key={`${practice.id}-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-white/10">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <Icon className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{practice.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{practice.type} • {practice.duration} min</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removePractice(index)} data-testid={`remove-practice-${index}`}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Duration</span>
            <span className="font-medium">{getTotalDuration()} minutes</span>
          </div>
        </div>

        <Button onClick={saveRitual} className="w-full bg-primary" data-testid="save-ritual-btn">
          <Save className="w-4 h-4 mr-2" /> Save Ritual
        </Button>
      </div>
    </div>
  );

  const renderActiveView = () => {
    const currentPractice = activeRitual?.practices?.[currentStep];
    const progressPercent = activeRitual?.practices?.length ? ((currentStep + stepProgress / 100) / activeRitual.practices.length) * 100 : 0;

    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6" data-testid="active-ritual-view">
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-2">{activeRitual?.name}</h1>
          <p className="text-muted-foreground">Step {currentStep + 1} of {activeRitual?.practices?.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card/50 border border-white/10 space-y-4">
          <Progress value={progressPercent} className="h-2" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Practice</p>
            <h2 className="text-2xl font-serif">{currentPractice?.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{currentPractice?.type} • {currentPractice?.duration} minutes</p>
          </div>

          <Progress value={stepProgress} className="h-1" />

          <div className="text-center text-sm text-muted-foreground">Elapsed: {formatTime(elapsedTime)}</div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)} data-testid="toggle-ritual-playback-btn">
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button variant="outline" onClick={() => startRitual(activeRitual)} data-testid="reset-ritual-btn">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button variant="ghost" onClick={() => setActiveRitual(null)} data-testid="exit-ritual-btn">Exit</Button>
          </div>
        </div>

        <div className="space-y-2">
          {activeRitual?.practices?.map((practice, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            const Icon = practiceIcons[practice.type];

            return (
              <div key={`${practice.id}-${index}`} className={`p-3 rounded-lg ${getStepContainerClass(isActive, isComplete)}`} data-testid={`ritual-step-${index}`}>
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-sm">{practice.name}</span>
                  {isComplete && <Check className="w-4 h-4 text-emerald-400" />}
                  {isActive && <ChevronDown className="w-4 h-4 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const contentMode = getMainContentMode();

  return (
    <div className="min-h-screen bg-background" data-testid="ritual-builder-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="ritual-builder-back-btn">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sequence Builder</p>
              <h1 className="text-xl font-serif">Ritual <span className="italic text-primary">Builder</span></h1>
            </div>
          </div>
        </div>
      </header>

      {contentMode === "loading" && renderLoadingView()}
      {contentMode === "list" && renderListView()}
      {contentMode === "creating" && renderCreatingView()}
      {contentMode === "active" && renderActiveView()}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Share Ritual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-background border border-white/10 break-all text-sm" data-testid="ritual-share-url">
              {shareUrl}
            </div>
            <Button className="w-full" onClick={copyShareUrl} data-testid="copy-ritual-share-url-btn">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RitualBuilderContainer;
