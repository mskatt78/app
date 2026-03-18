import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mountain, Droplets, Flame, Wind, Sparkles, Star,
  ChevronRight, X, Clock, Play, Moon
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import PracticeTimer from "../components/PracticeTimer";

const ElementalPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPracticing, setIsPracticing] = useState(false);

  const elementIcons = {
    Earth: Mountain,
    Water: Droplets,
    Fire: Flame,
    Air: Wind,
    Spirit: Sparkles,
    All: Star
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    All: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
  };

  const difficultyColors = {
    Beginner: "text-emerald-400 bg-emerald-500/10",
    Intermediate: "text-amber-400 bg-amber-500/10",
    Advanced: "text-red-400 bg-red-500/10"
  };

  useEffect(() => {
    fetchPractices();
  }, [filter]);

  const fetchPractices = async () => {
    try {
      const url = filter === "all" ? "/elemental-practices" : `/elemental-practices?element=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch elemental practices:", error);
      toast.error("Could not load elemental practices");
    } finally {
      setLoading(false);
    }
  };

  const logPractice = async (practice) => {
    try {
      await api.post("/practice-history", {
        practice_type: "elemental",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes || 20,
        element: practice.element
      });
      toast.success("Elemental practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit", "All"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-practices">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Elemental <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Deep connection with the five elements</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Element Filter */}
        <div className="flex flex-wrap gap-2">
          {elements.map((el) => {
            const Icon = elementIcons[el] || Star;
            const colors = elementColors[el] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={el}
                onClick={() => setFilter(el)}
                data-testid={`filter-${el.toLowerCase()}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                  ${filter === el 
                    ? `${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}` 
                    : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
              >
                {el !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{el === "all" ? "All Elements" : el}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice, index) => {
            const Icon = elementIcons[practice.element] || Star;
            const colors = elementColors[practice.element] || elementColors.Spirit;
            return (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedPractice(practice)}
                data-testid={`practice-${practice.id}`}
              >
                {practice.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={practice.image_url}
                      alt={practice.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                        <span className="text-xs font-medium">{practice.element}</span>
                      </span>
                      {practice.difficulty && (
                        <span className={`px-3 py-1 rounded-full ${difficultyColors[practice.difficulty]}`}>
                          <span className="text-xs font-medium">{practice.difficulty}</span>
                        </span>
                      )}
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
                      <p className="text-xs text-muted-foreground capitalize">{practice.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {practice.duration_minutes || 20} min
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
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No elemental practices found.</p>
          </div>
        )}
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
                      <div className="relative h-64">
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
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                          {selectedPractice.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[selectedPractice.difficulty]}`}>
                              {selectedPractice.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{selectedPractice.description}</p>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-muted-foreground">{selectedPractice.duration_minutes || 20} minutes</p>
                        </div>
                      </div>

                      {selectedPractice.benefits && (
                        <div>
                          <h3 className="font-medium mb-3">Benefits</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedPractice.benefits.map((benefit, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPractice.instructions && (
                        <div>
                          <h3 className="font-medium mb-3">Instructions</h3>
                          <ol className="space-y-3">
                            {selectedPractice.instructions.map((step, i) => (
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

                      <div className="grid grid-cols-2 gap-4">
                        {selectedPractice.best_time && (
                          <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-muted-foreground mb-1">Best Time</p>
                            <p className="text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              {selectedPractice.best_time}
                            </p>
                          </div>
                        )}
                        {selectedPractice.moon_phase && (
                          <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-muted-foreground mb-1">Moon Phase</p>
                            <p className="text-sm flex items-center gap-2">
                              <Moon className="w-4 h-4 text-primary" />
                              {selectedPractice.moon_phase}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedPractice.caution && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <h3 className="font-medium mb-2 text-amber-400">Caution</h3>
                          <p className="text-sm text-muted-foreground">{selectedPractice.caution}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Guided Elemental Practice Mode with Timer */
                  <div className="p-6 space-y-6">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${elementColors[selectedPractice.element]?.bg || 'bg-primary/20'} flex items-center justify-center`}>
                        {(() => {
                          const Icon = elementIcons[selectedPractice.element] || Star;
                          return <Icon className={`w-8 h-8 ${elementColors[selectedPractice.element]?.text || 'text-primary'}`} />;
                        })()}
                      </div>
                      <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                      <p className="text-sm text-muted-foreground mt-2">Guided {selectedPractice.element} Practice</p>
                    </div>

                    <PracticeTimer
                      segments={selectedPractice.instructions?.map((step, i) => ({
                        name: `Step ${i + 1}: ${step.substring(0, 50)}${step.length > 50 ? '...' : ''}`,
                        duration_seconds: Math.floor((selectedPractice.duration_minutes || 20) * 60 / (selectedPractice.instructions?.length || 1)),
                        has_audio: false
                      })) || []}
                      totalDuration={(selectedPractice.duration_minutes || 20) * 60}
                      backgroundAudio={selectedPractice.element === "Fire" ? "fire" : selectedPractice.element === "Water" ? "ocean" : selectedPractice.element === "Air" ? "wind" : "nature"}
                      practiceType="elemental"
                      element={selectedPractice.element || "Earth"}
                      visualizationType="element"
                      onComplete={async () => {
                        try {
                          await api.post("/practice-history", {
                            practice_type: "elemental",
                            practice_id: selectedPractice.id,
                            duration_minutes: selectedPractice.duration_minutes || 20,
                            element: selectedPractice.element,
                            notes: `Completed guided ${selectedPractice.name}`
                          });
                          toast.success(`${selectedPractice.element} practice complete! You are aligned.`);
                          setIsPracticing(false);
                          setSelectedPractice(null);
                        } catch (error) {
                          console.error("Failed to log practice:", error);
                          toast.success("Elemental practice complete!");
                          setIsPracticing(false);
                          setSelectedPractice(null);
                        }
                      }}
                    />

                    {/* Element affirmation during practice */}
                    <div className={`p-4 rounded-xl ${elementColors[selectedPractice.element]?.bg || 'bg-primary/10'} border ${elementColors[selectedPractice.element]?.border || 'border-primary/20'} text-center`}>
                      <p className={`text-sm ${elementColors[selectedPractice.element]?.text || 'text-primary'}`}>
                        Connect with the {selectedPractice.element} element
                      </p>
                      <p className="text-lg text-white/80 mt-2">
                        Feel its energy flowing through you
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed button at bottom */}
              <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
                {!isPracticing ? (
                  <Button 
                    onClick={() => setIsPracticing(true)}
                    className="w-full py-4"
                    style={{ minHeight: '56px' }}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin Guided Elemental Practice
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => setIsPracticing(false)}
                    className="w-full py-4"
                    style={{ minHeight: '56px' }}
                    data-testid="exit-practice-btn"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Exit Practice
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElementalPractices;
