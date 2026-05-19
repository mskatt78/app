import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Palette, Pen, Music, Camera, Sparkles,
  Clock, Play,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

const categoryIcons = {
  visual: Palette,
  writing: Pen,
  movement: Music,
  nature: Camera,
  meditation: Sparkles,
  ceremony: Sparkles,
};

const categoryColors = {
  visual:    { text: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
  writing:   { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  movement:  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  nature:    { text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  meditation:{ text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  ceremony:  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
};

const FILTER_CATS = ["all", "visual", "writing", "movement", "nature", "meditation", "ceremony"];

function buildPractice(process) {
  const steps = [];

  if (process.description) {
    steps.push(
      `Welcome to ${process.name}. ${process.description} Take a few slow breaths and arrive fully in this creative space.`
    );
  }

  if (process.process_steps?.length > 0) {
    steps.push(...process.process_steps);
  } else {
    steps.push(
      "Allow yourself to settle into creative stillness. There is no right or wrong — only your authentic expression.",
      "Let your hands, voice, or body lead. Follow the impulse without editing or judging.",
      "As you continue, notice what wants to emerge — a color, a word, a movement, a sound. Trust the first thing that comes.",
      "Allow the practice to complete itself in its own time. Rest in the satisfaction of having expressed something true."
    );
  }

  if (process.spiritual_purpose) {
    steps.push(
      `Hold this intention as you close: ${process.spiritual_purpose} Return to ordinary awareness gently, carrying your creative insight with you.`
    );
  } else {
    steps.push(
      "Gently return your awareness to the room. Take three grounding breaths. Notice how you feel — creative expression always changes us."
    );
  }

  return {
    name: process.name,
    duration_minutes: process.duration_minutes || 30,
    element: "Spirit",
    id: process.id,
    steps,
  };
}

const CreativeProcesses = ({ user, api }) => {
  const stableProcessKey = (prefix, value) => {
    const slug = String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 90);
    return `${prefix}-${slug || "item"}`;
  };

  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses, filter]);

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/creative-processes" : `/creative-processes?category=${filter}`;
      const response = await api.get(url);
      setProcesses(response.data);
    } catch (error) {
      console.error("Failed to fetch creative processes:", error);
      toast.error("Could not load creative processes");
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = (process) => {
    const practice = buildPractice(process);
    setSelectedProcess(null); // close detail modal first
    setGuidedPractice(practice);
  };

  const handleExitPractice = () => {
    const practiceToLog = guidedPractice;
    setGuidedPractice(null);

    if (practiceToLog) {
      api.post("/practice-history", {
        practice_type: "creative_process",
        practice_id: practiceToLog.id,
        duration_minutes: practiceToLog.duration_minutes,
        element: "Spirit",
        notes: `Completed ${practiceToLog.name}`,
      })
        .then(() => toast.success("Creative practice complete. Your spirit is expressed."))
        .catch(() => {
          // silent
        });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="creative-processes">
      {/* Full-screen Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.steps}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Creative <span className="italic text-primary">Processes</span></h1>
            <p className="text-sm text-muted-foreground">Shamanic art and creative expression</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {FILTER_CATS.map((cat) => {
            const Icon = categoryIcons[cat] || Sparkles;
            const colors = categoryColors[cat] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                  filter === cat
                    ? "bg-primary text-white"
                    : `${colors.bg} ${colors.text} hover:opacity-80`
                }`}
                data-testid={`filter-${cat}`}
              >
                {cat !== "all" && <Icon className="w-4 h-4" />}
                {cat === "all" ? "All Processes" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : processes.length === 0 ? (
          <div className="text-center py-16">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No creative processes found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process, index) => {
              const colors = categoryColors[process.category] || categoryColors.visual;
              const Icon = categoryIcons[process.category] || Sparkles;
              return (
                <motion.div
                  key={process.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border ${colors.bg} ${colors.border} cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden`}
                  onClick={() => setSelectedProcess(process)}
                  data-testid={`process-card-${process.id}`}
                >
                  {process.image_url && (
                    <div className="relative h-36 overflow-hidden">
                      <img src={process.image_url} alt={process.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    {!process.image_url && (
                      <div className={`flex items-center justify-between mb-3`}>
                        <div className={`p-2 rounded-xl ${colors.bg}`}>
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {process.category}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-serif mb-2">{process.name}</h3>
                    {process.tradition && (
                      <p className={`text-xs ${colors.text} italic mb-2`}>{process.tradition}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{process.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {process.duration_minutes || 30} min
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Process Detail Modal */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProcess(null)}
            data-testid="process-backdrop"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              data-testid="process-modal"
            >
              {/* Always-visible close button */}
              <button
                onClick={() => setSelectedProcess(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                data-testid="close-modal-btn"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 rounded-t-2xl">
                {selectedProcess.image_url && (
                  <div className="h-44 overflow-hidden rounded-t-2xl">
                    <img src={selectedProcess.image_url} alt={selectedProcess.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  {(() => {
                    const colors = categoryColors[selectedProcess.category] || categoryColors.visual;
                    return (
                      <>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {selectedProcess.category}
                        </div>
                        <h2 className="text-2xl font-serif">{selectedProcess.name}</h2>
                        {selectedProcess.tradition && (
                          <p className={`text-sm italic ${colors.text}`}>{selectedProcess.tradition}</p>
                        )}
                        <p className="text-muted-foreground leading-relaxed">{selectedProcess.description}</p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {selectedProcess.duration_minutes || 30} minutes
                        </div>

                        {selectedProcess.materials?.length > 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider ${colors.text} mb-2`}>Materials Needed</h4>
                            <ul className="space-y-1">
                              {selectedProcess.materials.map((material) => (
                                <li key={stableProcessKey(`material-${selectedProcess.id}`, material)} className="text-sm text-muted-foreground flex gap-2">
                                  <span className={`${colors.text} shrink-0`}>·</span>{material}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedProcess.process_steps?.length > 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider ${colors.text} mb-2`}>Practice Steps</h4>
                            <ol className="space-y-2">
                              {selectedProcess.process_steps.map((step, stepIndex) => (
                                <li key={stableProcessKey(`process-step-${selectedProcess.id}`, step)} className="text-sm text-muted-foreground flex gap-2">
                                  <span className={`${colors.text} shrink-0 font-medium`}>{stepIndex + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {selectedProcess.spiritual_purpose && (
                          <div className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                            <p className={`text-xs uppercase tracking-wider ${colors.text} mb-1`}>Spiritual Purpose</p>
                            <p className="text-sm italic text-muted-foreground">{selectedProcess.spiritual_purpose}</p>
                          </div>
                        )}

                        {selectedProcess.why_this_heals && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider ${colors.text} mb-2`}>Why This Heals</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedProcess.why_this_heals}</p>
                          </div>
                        )}

                        {selectedProcess.therapeutic_benefits?.length > 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider ${colors.text} mb-2`}>Benefits</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedProcess.therapeutic_benefits.map((benefit) => (
                                <span key={stableProcessKey(`therapeutic-benefit-${selectedProcess.id}`, benefit)} className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{benefit}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Fixed bottom action */}
              <div className="p-4 border-t border-white/10 rounded-b-2xl bg-card shrink-0">
                <Button
                  onClick={() => handleStartPractice(selectedProcess)}
                  className="w-full"
                  size="lg"
                  data-testid="begin-practice-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Begin Guided Practice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeProcesses;
