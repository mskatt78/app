import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mountain, Clock, TreeDeciduous, Play, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import PracticeTimer from "../components/PracticeTimer";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { useOfflineDownload } from "../hooks/useOfflineDownload";
import { OfflineDownloadButton } from "../components/OfflineDownloadButton";
import { appLogger } from "../utils/logger";
import { resolveDurationMinutes } from "../utils/durationUtils";

const GroundingPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const { downloadedIds, downloadingId, downloadProgress, downloadPractice } = useOfflineDownload({ api });

  const handleDownloadForOffline = async (event, exercise) => {
    event.stopPropagation();
    if (downloadingId) return;
    const offlineId = `grounding:${exercise.id}`;
    if (downloadedIds.has(offlineId)) {
      navigate("/offline-practices");
      return;
    }
    const practice = toGuidedGroundingPractice(exercise);
    await downloadPractice({
      id: offlineId,
      name: exercise.name,
      element: "Earth",
      category: "grounding",
      duration_minutes: practice.duration_minutes,
      steps: practice.steps,
    });
  };

  const resolveGroundingSteps = (exercise) => {
    const base = Array.isArray(exercise.instructions)
      ? exercise.instructions.filter((step) => typeof step === "string" && step.trim())
      : [];

    if (base.length) return base;

    return [
      `Settle into ${exercise.name}.`,
      exercise.description || "Allow your body to soften into grounded awareness.",
      "Bring your attention to your feet and the support beneath you.",
      "With each exhale, release tension down into the earth.",
      "Close by placing a hand on your heart and naming one thing you are grateful for.",
    ].filter(Boolean);
  };

  const toGuidedGroundingPractice = (exercise) => ({
    ...exercise,
    element: exercise.element || "Earth",
    category: exercise.category || "grounding",
    duration_minutes: resolveDurationMinutes(exercise.duration_minutes, 15),
    steps: resolveGroundingSteps(exercise),
  });

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await api.get("/grounding");
        setExercises(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [api]);

  return (
    <div className="min-h-screen bg-background" data-testid="grounding-practices">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={async () => {
          const completed = guidedPractice;
          setGuidedPractice(null);
          if (!completed) return;
          try {
            await api.post("/practice-history", {
              practice_type: "grounding",
              practice_id: completed.id,
              duration_minutes: completed.duration_minutes,
              notes: `Completed ${completed.name}`,
            });
            toast.success("Practice complete! You are grounded.");
          } catch (error) {
            appLogger.error("Failed to log practice:", error);
            toast.success("Practice complete!");
          }
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Earth Connection</p>
              <h1 className="text-xl font-serif">Grounding <span className="italic text-primary">Practices</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 py-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/10 border border-emerald-500/20"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <TreeDeciduous className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-serif mb-4">Return to <span className="italic text-primary">Earth</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto px-6">
            Grounding practices help you connect with the stabilizing energy of Mother Earth. 
            Use these exercises when feeling scattered, anxious, or disconnected.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl 
                          cursor-pointer hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                onClick={() => setSelectedExercise(exercise)}
                data-testid={`exercise-card-${exercise.id}`}
              >
                {exercise.image_url && (
                  <div className="relative h-36 overflow-hidden">
                    <img src={exercise.image_url} alt={exercise.name} className="w-full h-full object-cover" loading="lazy" data-testid={`grounding-image-${exercise.id}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                      <Clock className="w-3 h-3" />{exercise.duration_minutes} min
                    </span>
                    <OfflineDownloadButton
                      offlineId={`grounding:${exercise.id}`}
                      downloadedIds={downloadedIds}
                      downloadingId={downloadingId}
                      downloadProgress={downloadProgress}
                      onClick={(event) => handleDownloadForOffline(event, exercise)}
                      dataTestId={`grounding-download-btn-${exercise.id}`}
                      className="absolute bottom-3 right-3"
                    />
                  </div>
                )}
                <div className="p-6">
                  {!exercise.image_url && (
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/10">
                        <Mountain className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{exercise.duration_minutes} min</span>
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-serif mb-3">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{exercise.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {exercise.benefits?.slice(0, 2).map((benefit) => (
                      <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-8 rounded-2xl bg-card/50 border border-white/5"
        >
          <h3 className="text-xl font-serif mb-4 text-emerald-400">Grounding Tips</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Practice barefoot outdoors when possible for maximum earth connection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Combine grounding with breathwork for enhanced calming effects</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Use grounding crystals like Black Tourmaline or Smoky Quartz to amplify the practice</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary">•</span>
              <span>Morning grounding sets a stable foundation for the entire day</span>
            </li>
          </ul>
        </motion.div>
      </main>

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => { setSelectedExercise(null); setIsPracticing(false); }}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                {selectedExercise.image_url && (
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3 -mx-2">
                    <img src={selectedExercise.image_url} alt={selectedExercise.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               bg-emerald-500/10 text-emerald-400">
                  Earth Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedExercise.name}</DialogTitle>
                <DialogDescription className="sr-only" data-testid="grounding-exercise-dialog-description">
                  Review exercise instructions, benefits, and launch the grounding practice timer.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {!isPracticing ? (
                  <>
                    <p className="text-muted-foreground leading-relaxed">{selectedExercise.description}</p>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                      <Clock className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-muted-foreground">{selectedExercise.duration_minutes} minutes</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExercise.benefits?.map((benefit) => (
                          <span key={benefit} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedExercise.instructions?.length > 0 && (
                      <div>
                        <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Steps</h4>
                        <ul className="space-y-2">
                          {selectedExercise.instructions.map((step, i) => (
                            <li key={`${selectedExercise.id}-step-${String(step).slice(0, 40)}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs flex-shrink-0">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(selectedExercise.alchemy || selectedExercise.ritual || selectedExercise.ceremony || selectedExercise.why_this_heals || selectedExercise.integration_guide || selectedExercise.master_embodiment_protocol) && (
                      <div className="space-y-4" data-testid="grounding-depth-panels">
                        {Array.isArray(selectedExercise.alchemy) && selectedExercise.alchemy.length > 0 && (
                          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20" data-testid="grounding-alchemy-panel">
                            <h4 className="text-xs uppercase tracking-wider text-cyan-300 mb-2">Alchemy</h4>
                            <ul className="space-y-1.5">
                              {selectedExercise.alchemy.slice(0, 4).map((line, index) => (
                                <li key={`grounding-alchemy-${index}`} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-cyan-300">✦</span>
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(selectedExercise.why_this_heals || selectedExercise.integration_guide) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="grounding-healing-integration-grid">
                            <article className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="grounding-why-this-heals">
                              <h4 className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Why this heals</h4>
                              <p className="text-sm text-muted-foreground">{selectedExercise.why_this_heals || "Grounding regulates stress reactivity by restoring body orientation and sensory safety in the present moment."}</p>
                            </article>

                            <article className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20" data-testid="grounding-integration-guide">
                              <h4 className="text-xs uppercase tracking-wider text-violet-300 mb-2">Integration guide</h4>
                              <p className="text-sm text-muted-foreground">{selectedExercise.integration_guide || "After practice, complete one concrete action while grounded: hydrate, journal, communicate clearly, or complete one calm task."}</p>
                            </article>
                          </div>
                        )}

                        {selectedExercise.master_embodiment_protocol && (
                          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="grounding-master-embodiment-protocol">
                            <h4 className="text-xs uppercase tracking-wider text-amber-300 mb-3">Master Embodiment Protocol</h4>
                            <div className="space-y-3">
                              {[
                                { key: "preparation_phase", label: "Preparation" },
                                { key: "embodiment_phase", label: "Embodiment" },
                                { key: "integration_phase", label: "Integration" },
                              ].map((section) => (
                                <div key={section.key} className="p-3 rounded-lg bg-black/20 border border-white/10" data-testid={`grounding-master-${section.key}`}>
                                  <p className="text-xs text-amber-200 font-medium mb-2">{section.label}</p>
                                  <ul className="space-y-1.5">
                                    {(selectedExercise.master_embodiment_protocol?.[section.key] || []).slice(0, 4).map((step, index) => (
                                      <li key={`grounding-master-${section.key}-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <span className="text-amber-300">✦</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        if (!selectedExercise) return;
                        setSelectedExercise(null);
                        setIsPracticing(false);
                        setGuidedPractice(toGuidedGroundingPractice(selectedExercise));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      data-testid="start-practice-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Begin Guided Grounding Practice
                    </Button>

                    <div className="flex justify-center">
                      <OfflineDownloadButton
                        offlineId={`grounding:${selectedExercise.id}`}
                        downloadedIds={downloadedIds}
                        downloadingId={downloadingId}
                        downloadProgress={downloadProgress}
                        onClick={(event) => handleDownloadForOffline(event, selectedExercise)}
                        dataTestId={`grounding-dialog-download-btn-${selectedExercise.id}`}
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-emerald-400">Remember:</strong> The Earth is always there to support you. 
                        You need only place your awareness on it to feel its grounding presence.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Timer Mode */
                  <div className="space-y-6">
                    <PracticeTimer
                      segments={selectedExercise.timer_segments || []}
                      totalDuration={selectedExercise.duration_minutes * 60}
                      backgroundAudio={selectedExercise.background_audio || "nature"}
                      autoStartAudio={true}
                      practiceType="grounding"
                      onComplete={async () => {
                        try {
                          await api.post("/practice-history", {
                            practice_type: "grounding",
                            practice_id: selectedExercise.id,
                            duration_minutes: selectedExercise.duration_minutes,
                            notes: `Completed ${selectedExercise.name}`,
                          });
                          toast.success("Practice complete! You are grounded.");
                          setIsPracticing(false);
                        } catch (error) {
                          appLogger.error("Failed to log practice:", error);
                          toast.success("Practice complete!");
                          setIsPracticing(false);
                        }
                      }}
                    />

                    <Button
                      variant="outline"
                      onClick={() => setIsPracticing(false)}
                      className="w-full"
                    >
                      Exit Practice
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroundingPractices;
