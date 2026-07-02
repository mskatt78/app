import { AnimatePresence, motion } from "framer-motion";
import { Clock, Moon, Play, Sparkles, Star, X } from "lucide-react";
import { Button } from "../ui/button";
import GuidedAudioButton from "../GuidedAudioButton";
import GuidedPracticeOverlay from "../GuidedPracticeOverlay";
import { EmbodimentProtocolPanel } from "../practice/EmbodimentProtocolPanel";
import PracticeTimer from "../PracticeTimer";
import { difficultyColors, elementColors, elementIcons, stableElementPracticeKey } from "./elementalConfig";
import { appLogger } from "../../utils/logger";

const getElementBackgroundAudio = (element) => {
  if (element === "Fire") return "fire";
  if (element === "Water") return "ocean";
  if (element === "Air") return "wind";
  return "nature";
};

export const ElementalPracticeModal = ({
  api,
  selectedPractice,
  setSelectedPractice,
  isPracticing,
  setIsPracticing,
  showGuided,
  setShowGuided,
  onLogComplete,
  onToastComplete,
  onLogError,
}) => (
  <>
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
            onClick={(event) => event.stopPropagation()}
            data-testid="practice-modal"
          >
            <button onClick={() => { setSelectedPractice(null); setIsPracticing(false); }} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10" data-testid="close-modal">
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              {!isPracticing ? (
                <>
                  {selectedPractice.image_url && (
                    <div className="relative h-64">
                      <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
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
                          {selectedPractice.benefits.map((benefit) => (
                            <span key={stableElementPracticeKey(`element-benefit-${selectedPractice.id}`, benefit)} className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground">
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
                          {selectedPractice.instructions.map((step, stepIndex) => (
                            <li key={stableElementPracticeKey(`element-step-${selectedPractice.id}`, step)} className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                                {stepIndex + 1}
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

                    {selectedPractice.why_this_heals && (
                      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20" data-testid="elemental-practice-why-heals-panel">
                        <h3 className="font-medium mb-2 text-cyan-200">Why This Heals</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedPractice.why_this_heals}</p>
                      </div>
                    )}

                    {selectedPractice.safety_notes && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="elemental-practice-safety-notes-panel">
                        <h3 className="font-medium mb-2 text-amber-300">Safety Notes</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedPractice.safety_notes}</p>
                      </div>
                    )}

                    {Array.isArray(selectedPractice.integration_actions) && selectedPractice.integration_actions.length > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="elemental-practice-integration-actions-panel">
                        <h3 className="font-medium mb-2 text-emerald-200">Integration Actions</h3>
                        <ul className="space-y-2">
                          {selectedPractice.integration_actions.map((step, index) => (
                            <li key={`${selectedPractice.id}-integration-${index}`} className="text-sm text-muted-foreground flex gap-2" data-testid={`elemental-practice-integration-action-${index}`}>
                              <span className="text-emerald-300">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <EmbodimentProtocolPanel
                      practiceName={selectedPractice.name}
                      element={selectedPractice.element || "Earth"}
                      testIdPrefix="elemental-practice-embodiment"
                    />
                  </div>
                </>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${elementColors[selectedPractice.element]?.bg || "bg-primary/20"} flex items-center justify-center`}>
                      {(() => {
                        const Icon = elementIcons[selectedPractice.element] || Star;
                        return <Icon className={`w-8 h-8 ${elementColors[selectedPractice.element]?.text || "text-primary"}`} />;
                      })()}
                    </div>
                    <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                    <p className="text-sm text-muted-foreground mt-2">Guided {selectedPractice.element} Practice</p>
                  </div>

                  <div className="flex justify-center mb-2">
                    <GuidedAudioButton
                      api={api}
                      label="Play Guided Narration"
                      script={[
                        `Welcome to this ${selectedPractice.element} elemental practice: ${selectedPractice.name}.`,
                        selectedPractice.description || "",
                        selectedPractice.instructions
                          ? `Follow these steps: ${selectedPractice.instructions.map((step, index) => `Step ${index + 1}: ${step}`).join(". ")}`
                          : "",
                        "Take a moment to honour the element you have worked with. Breathe deeply and return to stillness.",
                      ].filter(Boolean).join(" ")}
                    />
                  </div>

                  <PracticeTimer
                    segments={selectedPractice.instructions?.map((step, index) => ({
                      name: `Step ${index + 1}`,
                      description: step,
                      duration_seconds: Math.floor(((selectedPractice.duration_minutes || 20) * 60) / (selectedPractice.instructions?.length || 1)),
                      has_audio: false,
                    })) || []}
                    totalDuration={(selectedPractice.duration_minutes || 20) * 60}
                    backgroundAudio={getElementBackgroundAudio(selectedPractice.element)}
                    autoStartAudio={true}
                    autoNarrate={true}
                    practiceType="elemental"
                    element={selectedPractice.element || "Earth"}
                    visualizationType="element"
                    onComplete={async () => {
                      try {
                        await onLogComplete(selectedPractice);
                        onToastComplete(selectedPractice);
                      } catch (error) {
                        onLogError(error);
                      } finally {
                        setIsPracticing(false);
                        setSelectedPractice(null);
                      }
                    }}
                  />

                  <div className={`p-4 rounded-xl ${elementColors[selectedPractice.element]?.bg || "bg-primary/10"} border ${elementColors[selectedPractice.element]?.border || "border-primary/20"} text-center`}>
                    <p className={`text-sm ${elementColors[selectedPractice.element]?.text || "text-primary"}`}>Connect with the {selectedPractice.element} element</p>
                    <p className="text-lg text-white/80 mt-2">Feel its energy flowing through you</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl flex gap-2">
              {!isPracticing ? (
                <>
                  <Button
                    onClick={() => {
                      try {
                        const AC = window.AudioContext || window.webkitAudioContext;
                        const context = new AC();
                        const buffer = context.createBuffer(1, context.sampleRate * 0.1, context.sampleRate);
                        const source = context.createBufferSource();
                        source.buffer = buffer;
                        source.connect(context.destination);
                        source.start(0);
                        window.__warmAudioCtx = context;
                      } catch (error) {
                        appLogger.warn("Audio warm-up failed", error);
                      }
                      setIsPracticing(true);
                    }}
                    className="flex-1 py-4"
                    style={{ minHeight: "56px" }}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Begin Guided Practice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowGuided(true)}
                    className="py-4 px-4 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                    style={{ minHeight: "56px" }}
                    data-testid="elemental-fullscreen-btn"
                    title="Open full-screen guided practice"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsPracticing(false)} className="w-full py-4" style={{ minHeight: "56px" }} data-testid="exit-practice-btn">
                  <X className="w-4 h-4 mr-2" />
                  Exit Practice
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {showGuided && selectedPractice && (
        <GuidedPracticeOverlay
          practice={{
            name: selectedPractice.name,
            duration_minutes: selectedPractice.duration_minutes || 20,
            element: selectedPractice.element || "Earth",
            steps: selectedPractice.instructions,
          }}
          onExit={() => setShowGuided(false)}
        />
      )}
    </AnimatePresence>
  </>
);
