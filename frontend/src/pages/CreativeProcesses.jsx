import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Palette, Pen, Music, Camera, Sparkles,
  Clock, Play, Lock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { appLogger } from "../utils/logger";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { composeDeepGuidedNarration, ritualDeliveryPillars } from "../utils/guidedRitualComposer";

const categoryIcons = {
  visual: Palette,
  writing: Pen,
  movement: Music,
  nature: Camera,
  meditation: Sparkles,
  ceremony: Sparkles,
  "earth-crafting": Sparkles,
  "sacred-tool-birthing": Sparkles,
};

const categoryColors = {
  visual:    { text: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
  writing:   { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  movement:  { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  nature:    { text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  meditation:{ text: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  ceremony:  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  "earth-crafting": { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "sacred-tool-birthing": { text: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
};

const FILTER_CATS = ["all", "visual", "writing", "movement", "nature", "meditation", "ceremony", "earth-crafting", "sacred-tool-birthing"];

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

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/\n|•|\.|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 8);
};

const buildCreativeImmersiveScript = (process) => composeDeepGuidedNarration({
  title: process?.name || "Creative Ritual",
  element: process?.element || "Spirit",
  description: process?.precision_description || process?.description,
  teachings: [
    ...(toList(process?.alchemy)),
    ...(toList(process?.healing_trajectory)),
    ...(toList(process?.why_this_heals)),
    ...(toList(process?.spiritual_purpose)),
  ],
  rituals: [
    ...(toList(process?.ritual)),
    ...(toList(process?.ritual_practice)),
    ...(toList(process?.process_steps)),
    ...(toList(process?.practice)),
  ],
  ceremonies: [
    ...(toList(process?.ceremony)),
    ...(toList(process?.ceremonies)),
  ],
  embodiment: [
    ...(toList(process?.embodiment)),
    ...(toList(process?.embodiment_prompts)),
    ...ritualDeliveryPillars,
  ],
  integration: [
    ...(toList(process?.integration_actions)),
    ...(toList(process?.therapeutic_benefits)),
  ],
  invocation: process?.devotional_invocation,
  closing: process?.integration_vow,
});

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
  const location = useLocation();
  const premium = usePremiumAccess({ api, user });
  const creativeUnlocked = premium.isSectionUnlocked("sacred_art_therapy");
  const fullAppProduct = premium.findProduct("full_app_unlock");
  const initialCategory = new URLSearchParams(location.search).get("category");
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(FILTER_CATS.includes(initialCategory || "") ? initialCategory : "all");
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedLockedProcess, setSelectedLockedProcess] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const canAccessProcess = (process) => !process?.is_premium || creativeUnlocked;

  useEffect(() => {
    const fetchProcesses = async () => {
      setLoading(true);
      try {
        const url = filter === "all" ? "/creative-processes" : `/creative-processes?category=${filter}`;
        const response = await api.get(url);
        setProcesses(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch creative processes:", error);
        toast.error("Could not load creative processes");
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, [api, filter]);

  const handleStartPractice = (process) => {
    if (!canAccessProcess(process)) {
      setSelectedLockedProcess(process);
      return;
    }
    const practice = buildPractice(process);
    setSelectedProcess(null); // close detail modal first
    setGuidedPractice(practice);
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/creative",
    });
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
        {!creativeUnlocked && (
          <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4" data-testid="creative-premium-banner">
            <p className="text-sm text-muted-foreground mt-1" data-testid="creative-premium-banner-description">
              First sacred art practices are free. Earth crafting and advanced rituals unlock with Sacred Access membership.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="creative-premium-banner-subscription-button">Sacred Access</Button>
            </div>
          </section>
        )}

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
                  onClick={() => {
                    if (!canAccessProcess(process)) {
                      setSelectedLockedProcess(process);
                      return;
                    }
                    setSelectedProcess(process);
                  }}
                  data-testid={`process-card-${process.id}`}
                >
                  {process.image_url && (
                    <div className="relative h-36 overflow-hidden bg-black/45">
                      <img
                        src={process.image_url}
                        alt={process.name}
                        className="w-full h-full object-contain object-center"
                        loading="lazy"
                        data-testid={`process-image-${process.id}`}
                      />
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

                    {process.is_premium && !canAccessProcess(process) && (
                      <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-300/40" data-testid={`creative-premium-badge-${process.id}`}>
                        <Lock className="w-3 h-3" /> Premium
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {process.duration_minutes || 30} min
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStartPractice(process);
                      }}
                      className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${colors.bg} ${colors.text} border ${colors.border || "border-white/10"} hover:opacity-90 transition-opacity`}
                      data-testid={`creative-card-start-guided-${process.id}`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Guided Practice
                    </button>
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

                        {selectedProcess.ethical_materials?.length > 0 && (
                          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4" data-testid="creative-ethical-sourcing-panel">
                            <h4 className="text-xs uppercase tracking-wider text-emerald-200 mb-2">Ethical Sourcing & Reciprocity</h4>
                            <ul className="space-y-1.5">
                              {selectedProcess.ethical_materials.map((line) => (
                                <li key={stableProcessKey(`ethical-material-${selectedProcess.id}`, line)} className="text-sm text-emerald-100/90 flex gap-2">
                                  <span className="shrink-0">•</span>
                                  <span>{line}</span>
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

                        {selectedProcess.ceremony?.length > 0 && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4" data-testid="creative-ceremony-panel">
                            <h4 className="text-xs uppercase tracking-wider text-amber-200 mb-2">Ceremony Sequence</h4>
                            <ul className="space-y-1.5">
                              {selectedProcess.ceremony.map((line) => (
                                <li key={stableProcessKey(`ceremony-line-${selectedProcess.id}`, line)} className="text-sm text-amber-100/90 flex gap-2">
                                  <span className="shrink-0">•</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
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

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4" data-testid="creative-guided-voice-panel">
                          <p className="text-xs uppercase tracking-wider text-primary/80 mb-1">Immersive Guided Voice</p>
                          <p className="text-xs text-muted-foreground mb-3">Play an expanded ceremonial narration with embodiment cues and integration actions.</p>
                          <GuidedAudioButton
                            api={api}
                            script={buildCreativeImmersiveScript(selectedProcess)}
                            practiceName={selectedProcess.name}
                            durationMinutes={Math.max(12, Number(selectedProcess.duration_minutes || 18))}
                            element={selectedProcess.element || "Spirit"}
                            sourceTexts={[
                              selectedProcess.description,
                              selectedProcess.precision_description,
                              selectedProcess.spiritual_purpose,
                              selectedProcess.why_this_heals,
                              ...(toList(selectedProcess.alchemy)),
                              ...(toList(selectedProcess.ceremony)),
                            ]}
                            steps={[
                              ...(toList(selectedProcess.ritual)),
                              ...(toList(selectedProcess.process_steps)),
                              ...(toList(selectedProcess.guided_practice)),
                            ]}
                            className="w-full"
                          />
                        </div>
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

      {selectedLockedProcess && !creativeUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="creative-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Sacred Art Practice</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="creative-premium-lock-title">{selectedLockedProcess.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="creative-premium-lock-description">This ritual is premium. Continue with Sacred Access membership.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="creative-premium-lock-subscription-button">Sacred Access</Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedProcess(null)} data-testid="creative-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeProcesses;
