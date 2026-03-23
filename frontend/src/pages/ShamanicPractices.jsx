import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Feather, Moon, Eye, Drum, TreeDeciduous, Compass,
  ChevronRight, X, Clock, Play, Lock, AlertTriangle, Trophy, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import PracticeTimer from "../components/PracticeTimer";
import GuidedAudioButton from "../components/GuidedAudioButton";
import PracticeVideos from "../components/PracticeVideos";

const ShamanicPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [unlockedContent, setUnlockedContent] = useState([]);
  const [isPracticing, setIsPracticing] = useState(false);

  const categoryIcons = {
    journey: Compass,
    power_animal: Feather,
    ancestral: TreeDeciduous,
    divination: Eye,
    ceremony: Drum,
    shadow: Moon
  };

  const categoryColors = {
    journey: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
    power_animal: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    ancestral: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    divination: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    ceremony: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    shadow: { text: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" }
  };

  useEffect(() => {
    fetchPractices();
    fetchUnlockedContent();
  }, [filter]);

  const fetchPractices = async () => {
    try {
      const url = filter === "all" ? "/shamanic-practices" : `/shamanic-practices?category=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch shamanic practices:", error);
      toast.error("Could not load shamanic practices");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnlockedContent = async () => {
    try {
      const response = await api.get("/achievements");
      const unlocked = response.data.unlocked_content || [];
      setUnlockedContent(unlocked);
    } catch (error) {
      console.error("Failed to fetch unlocked content:", error);
    }
  };

  const isLocked = (practice) => {
    if (practice.requires_unlock) {
      const unlockItem = unlockedContent.find(
        u => u.item === "shamanic_practice" && u.item_id === practice.id
      );
      return !unlockItem;
    }
    return false;
  };

  const logPractice = async (practice) => {
    try {
      await api.post("/practice-history", {
        practice_type: "shamanic_journey",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes || 30,
        element: "Spirit"
      });
      toast.success("Shamanic practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const categories = ["all", "journey", "power_animal", "ancestral", "divination", "ceremony", "shadow"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="shamanic-practices">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Shamanic <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Deep journeys and ceremonial work</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Warning */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-400 font-medium">Sacred Practices</p>
            <p className="text-xs text-muted-foreground mt-1">
              These are deep shamanic practices. Approach with respect and intention. 
              Some practices require achievement unlocks for safety and proper preparation.
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Feather;
            const colors = categoryColors[cat] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                data-testid={`filter-${cat}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                  ${filter === cat 
                    ? `${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}` 
                    : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
              >
                {cat !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practices.map((practice, index) => {
            const Icon = categoryIcons[practice.category] || Feather;
            const colors = categoryColors[practice.category] || categoryColors.journey;
            const locked = isLocked(practice);
            
            return (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           transition-all duration-500 cursor-pointer relative`}
                onClick={() => locked ? navigate("/achievements") : setSelectedPractice(practice)}
                data-testid={`practice-${practice.id}`}
              >
                {/* Locked overlay with blur blend effect */}
                {locked && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10 backdrop-blur-[2px] bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex items-center justify-center"
                  >
                    <div className="text-center p-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/40 flex items-center justify-center"
                      >
                        <Lock className="w-6 h-6 text-amber-400" />
                      </motion.div>
                      <p className="text-amber-400 font-medium text-sm mb-1">Sacred Practice</p>
                      <p className="text-xs text-amber-200/60 mb-3">Unlock through achievements</p>
                      <div className="flex items-center justify-center gap-1 text-xs text-amber-400/80">
                        <Trophy className="w-3 h-3" />
                        <span>View progress</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                {/* Unlocked sparkle indicator */}
                {!locked && practice.requires_unlock && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                )}
                {practice.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={practice.image_url}
                      alt={practice.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${locked ? '' : 'group-hover:scale-105'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className="text-xs font-medium capitalize">{practice.category?.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
                        {practice.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{practice.tradition}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {practice.duration_minutes || 30} min
                    </span>
                    <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-12">
            <Feather className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No shamanic practices found for this category.</p>
          </div>
        )}
        <PracticeVideos api={api} category="shamanic" />
      </main>

      {/* Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              data-testid="practice-modal"
            >
              {/* Close button always visible */}
              <button
                onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10"
                data-testid="close-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {!isPracticing ? (
                  <>
                    {selectedPractice.image_url && (
                      <div className="relative h-48 sm:h-64">
                        <img
                          src={selectedPractice.image_url}
                          alt={selectedPractice.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                      </div>
                    )}
                    
                    <div className="p-6 space-y-6">
                      <div>
                        <h2 className="text-2xl font-serif mb-2">{selectedPractice.name}</h2>
                        <p className="text-sm text-muted-foreground italic mb-4">{selectedPractice.tradition}</p>
                        <p className="text-muted-foreground">{selectedPractice.description}</p>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/10">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-muted-foreground">{selectedPractice.duration_minutes || 30} minutes</p>
                        </div>
                      </div>

                      {selectedPractice.preparation && (
                        <div>
                          <h3 className="font-medium mb-3">Preparation</h3>
                          <p className="text-sm text-muted-foreground">{selectedPractice.preparation}</p>
                        </div>
                      )}

                      {selectedPractice.journey_steps && (
                        <div>
                          <h3 className="font-medium mb-3">Journey Steps</h3>
                          <ol className="space-y-3">
                            {selectedPractice.journey_steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                                  {i + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {selectedPractice.safety_notes && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <h3 className="font-medium mb-2 text-amber-400">Safety Notes</h3>
                          <p className="text-sm text-muted-foreground">{selectedPractice.safety_notes}</p>
                        </div>
                      )}

                      {selectedPractice.closing_prayer && (
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                          <h3 className="font-medium mb-2">Closing Prayer</h3>
                          <p className="text-sm italic text-muted-foreground">"{selectedPractice.closing_prayer}"</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Guided Shamanic Journey Mode with Timer */
                  <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Compass className="w-8 h-8 text-indigo-400" />
                      </div>
                      <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                      <p className="text-sm text-muted-foreground mt-2">Guided Shamanic Journey</p>
                    </div>

                    {/* Guided Audio Player */}
                    <div className="flex justify-center mb-2">
                      <GuidedAudioButton
                        api={api}
                        label="Play Guided Journey Narration"
                        script={[
                          `Welcome to this shamanic journey: ${selectedPractice.name}.`,
                          selectedPractice.description || "",
                          selectedPractice.preparation ? `Preparation: ${selectedPractice.preparation}` : "",
                          selectedPractice.journey_steps ? `Your journey unfolds in ${selectedPractice.journey_steps.length} steps. ` + selectedPractice.journey_steps.map((s, i) => `Step ${i+1}: ${s}`).join(". ") : "",
                          selectedPractice.closing_prayer ? `When you are ready to close, offer this prayer: ${selectedPractice.closing_prayer}` : "",
                          "Gently return to your body. Wiggle your fingers and toes. Take three deep breaths. Welcome back."
                        ].filter(Boolean).join(" ")}
                      />
                    </div>

                    <PracticeTimer
                      segments={selectedPractice.journey_steps?.map((step, i) => ({
                        name: `Step ${i + 1}: ${step.substring(0, 50)}${step.length > 50 ? '...' : ''}`,
                        duration_seconds: Math.floor((selectedPractice.duration_minutes || 30) * 60 / (selectedPractice.journey_steps?.length || 1)),
                        has_audio: false
                      })) || []}
                      totalDuration={(selectedPractice.duration_minutes || 30) * 60}
                      backgroundAudio="drums"
                      practiceType="shamanic"
                      element="Spirit"
                      visualizationType="aurora"
                      onComplete={async () => {
                        try {
                          await api.post("/practice-history", {
                            practice_type: "shamanic_journey",
                            practice_id: selectedPractice.id,
                            duration_minutes: selectedPractice.duration_minutes || 30,
                            element: "Spirit",
                            notes: `Completed guided ${selectedPractice.name}`
                          });
                          toast.success("Shamanic journey complete! Welcome back.");
                          setIsPracticing(false);
                          setSelectedPractice(null);
                        } catch (error) {
                          console.error("Failed to log practice:", error);
                          toast.success("Shamanic journey complete!");
                          setIsPracticing(false);
                          setSelectedPractice(null);
                        }
                      }}
                    />

                    {/* Closing prayer during practice */}
                    {selectedPractice.closing_prayer && (
                      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                        <p className="text-sm text-indigo-300">Remember to close with:</p>
                        <p className="text-lg italic text-indigo-100 mt-2">"{selectedPractice.closing_prayer}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed button at bottom */}
              <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
                {!isPracticing ? (
                  <button 
                    type="button"
                    onClick={() => setIsPracticing(true)}
                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', minHeight: '56px' }}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-5 h-5" />
                    Begin Guided Shamanic Journey
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsPracticing(false)}
                    className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', minHeight: '56px' }}
                    data-testid="exit-practice-btn"
                  >
                    <X className="w-5 h-5" />
                    Exit Journey
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShamanicPractices;
