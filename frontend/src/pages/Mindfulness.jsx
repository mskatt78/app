import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Brain, Filter, Clock, Lock, Play, Heart, Footprints, 
  Eye, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import PracticeTimer from "../components/PracticeTimer";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { toast } from "sonner";
import HealthDisclaimer from "../components/HealthDisclaimer";
import { appLogger } from "../utils/logger";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

const Mindfulness = ({ user, api }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);

  const stableMindfulKey = (prefix, value) => {
    const slug = String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90);
    return `${prefix}-${slug || "item"}`;
  };
  const [isPracticing, setIsPracticing] = useState(false);

  const mindfulnessUnlocked = premium.isSectionUnlocked("mindfulness_practices");
  const mindfulnessProduct = premium.findProduct("mindfulness_practices");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const canAccessPractice = (practice) => !practice?.is_premium || mindfulnessUnlocked;

  const buildMindfulnessGuidedPractice = (practice) => {
    const steps = Array.isArray(practice.instructions) && practice.instructions.length > 0
      ? practice.instructions
      : [
          "Settle into your body and soften your breath.",
          practice.description || `Open to ${practice.name} with calm attention.`,
          "Notice sensations, thoughts, and emotions without judgment.",
          "Close with gratitude and one conscious breath.",
        ];

    return {
      ...practice,
      category: "mindfulness",
      element: practice.element || "Air",
      duration_minutes: practice.duration_minutes || 12,
      steps,
    };
  };

  const startGuidedOverlay = (practice) => {
    if (!canAccessPractice(practice)) {
      setSelectedLockedPractice(practice);
      return;
    }
    setSelectedPractice(null);
    setIsPracticing(false);
    setGuidedPractice(buildMindfulnessGuidedPractice(practice));
  };

  const handleUnlockMindfulness = async () => {
    await premium.startPurchase({
      productId: "mindfulness_practices",
      returnPath: "/mindfulness",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/mindfulness",
    });
  };

  const exitGuidedOverlay = async () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    try {
      await api.post("/practice-history", {
        practice_type: "mindfulness",
        practice_id: completed.id,
        duration_minutes: completed.duration_minutes,
        notes: `Completed guided ${completed.name}`,
      });
      toast.success("Guided mindfulness complete.");
    } catch (error) {
      appLogger.error("Failed to log guided mindfulness", error);
    }
  };

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
    const fetchPractices = async () => {
      try {
        const response = await api.get("/mindfulness");
        setPractices(response.data);
        setFilteredPractices(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch practices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, [api]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredPractices(practices);
    } else {
      setFilteredPractices(practices.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, practices]);

  const startPractice = () => {
    setIsPracticing(true);
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
      appLogger.error("Failed to log practice:", error);
    }
  };

  const timerSegments = useMemo(() => {
    if (!selectedPractice) return [];
    const instructions = Array.isArray(selectedPractice.instructions) ? selectedPractice.instructions.filter(Boolean) : [];
    const durationSeconds = Math.max(60, (selectedPractice.duration_minutes || 5) * 60);

    if (!instructions.length) {
      return [{
        name: selectedPractice.name,
        description: selectedPractice.description || "Settle into mindful awareness and breathe gently.",
        duration_seconds: durationSeconds,
      }];
    }

    const stepDuration = Math.max(8, Math.floor(durationSeconds / instructions.length));
    const remainder = durationSeconds - (stepDuration * instructions.length);

    return instructions.map((instruction, index) => ({
      name: `Step ${index + 1}`,
      description: instruction,
      duration_seconds: stepDuration + (index === instructions.length - 1 ? remainder : 0),
    }));
  }, [selectedPractice]);

  return (
    <div className="min-h-screen bg-background" data-testid="mindfulness-page">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitGuidedOverlay}
      />

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
        {!mindfulnessUnlocked && (
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-cyan-500/5 to-background p-4 mb-8" data-testid="mindfulness-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Optional Premium</p>
                <h2 className="text-lg font-serif text-amber-100/90" data-testid="mindfulness-premium-banner-title">Mindfulness stays open and welcoming</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="mindfulness-premium-banner-description">Free practices lead the journey. Premium only adds advanced depth.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="text-cyan-100/80 hover:text-cyan-50" onClick={() => navigate("/pricing")} data-testid="mindfulness-view-subscription-button">Optional premium</Button>
              </div>
            </div>
          </section>
        )}

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
          <p className="text-xs text-cyan-200/70 mt-2" data-testid="mindfulness-devotional-note">
            Hold attention as ceremony: witness gently, regulate with breath, and integrate one compassionate action after each practice.
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
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => {
                    if (!canAccessPractice(practice)) {
                      setSelectedLockedPractice(practice);
                      return;
                    }
                    setSelectedPractice(practice);
                  }}
                  data-testid={`practice-card-${practice.id}`}
                >
                  {Boolean(practice.is_premium) && !canAccessPractice(practice) && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-100 text-xs" data-testid={`mindfulness-premium-badge-${practice.id}`}>
                        <Lock className="w-3 h-3" /> Premium
                      </span>
                    </div>
                  )}
                  {practice.image_url && (
                    <div className="relative h-36 overflow-hidden">
                      <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                        <Clock className="w-3 h-3" />{practice.duration_minutes} min
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    {!practice.image_url && (
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
                    )}
                    
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

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        startGuidedOverlay(practice);
                      }}
                      className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${colors.bg} ${colors.text} border ${colors.border || "border-white/10"} hover:opacity-90 transition-opacity`}
                      data-testid={`mindfulness-card-start-guided-${practice.id}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Guided Practice
                    </button>

                    {practice.linked_practices?.length > 0 && (
                      <p className="mt-2 text-[11px] text-cyan-300/90" data-testid={`mindfulness-links-count-${practice.id}`}>
                        Linked practices: {practice.linked_practices.length}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={!!selectedPractice} onOpenChange={() => { 
        setSelectedPractice(null); 
        setIsPracticing(false);
      }}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedPractice && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}>
                  {selectedPractice.element} • {selectedPractice.category}
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPractice.name}</DialogTitle>
                <DialogDescription className="sr-only" data-testid="mindfulness-practice-dialog-description">
                  Review mindfulness practice details and begin the guided timer session.
                </DialogDescription>
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

                    {selectedPractice.linked_practices?.length > 0 && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Linked Practices</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedPractice.linked_practices.map((link) => (
                            <span
                              key={stableMindfulKey(`linked-${selectedPractice.id}`, `${link.type}-${link.route}`)}
                              className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs"
                            >
                              {link.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={startPractice}
                      className="w-full bg-primary"
                      data-testid="start-practice-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Practice
                    </Button>
                    <Button
                      onClick={() => startGuidedOverlay(selectedPractice)}
                      variant="outline"
                      className="w-full border-white/15"
                      data-testid="mindfulness-start-guided-overlay-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Guided Practice (Voice + Ambient)
                    </Button>
                  </>
                ) : (
                  <div className="py-4" data-testid="mindfulness-practice-timer-shell">
                    <PracticeTimer
                      segments={timerSegments}
                      totalDuration={(selectedPractice.duration_minutes || 5) * 60}
                      onComplete={completePractice}
                      backgroundAudio="forest"
                      practiceType="mindfulness"
                      element={selectedPractice.element || "Air"}
                      autoStartAudio={true}
                      autoNarrate={true}
                      allowSpeedControl={true}
                    />
                    <Button
                      onClick={completePractice}
                      variant="outline"
                      className="w-full mt-6 border-white/15"
                      data-testid="complete-practice-early-btn"
                    >
                      Complete Early
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4" data-testid="mindfulness-auto-guidance-note">
                      Auto-guidance active: steps advance and voice guidance runs automatically.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedLockedPractice && !mindfulnessUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="mindfulness-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <h3 className="text-2xl font-serif mb-2" data-testid="mindfulness-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="mindfulness-premium-lock-description">This mindfulness protocol is premium. Unlock section, subscribe, or unlock full app.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="mindfulness-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockMindfulness} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="mindfulness-premium-lock-unlock-button" disabled={premium.purchaseLoadingId === "mindfulness_practices"}>
                {premium.purchaseLoadingId === "mindfulness_practices" ? "Opening checkout..." : `Unlock ${mindfulnessProduct?.price?.toFixed(2) || "49.00"}`}
              </Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="mindfulness-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="mindfulness-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mindfulness;
