import { AnimatePresence, motion } from "framer-motion";
import { Clock, Compass, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import PracticeTimer from "../../components/PracticeTimer";
import { appLogger } from "../../utils/logger";

export const ShamanicPracticeModal = ({
  selectedPractice,
  isPracticing,
  setIsPracticing,
  setSelectedPractice,
  getSteps,
  formatPreparationText,
  logPractice,
  api,
}) => {
  return (
    <AnimatePresence>
      {selectedPractice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setSelectedPractice(null);
            setIsPracticing(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(event) => event.stopPropagation()}
            data-testid="practice-modal"
          >
            <button
              onClick={() => {
                setSelectedPractice(null);
                setIsPracticing(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-20"
              data-testid="close-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              {!isPracticing ? (
                <>
                  {selectedPractice.image_url && (
                    <div className="relative h-48 sm:h-64">
                      <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
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

                    {getSteps(selectedPractice).length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Journey Steps</h3>
                        <ol className="space-y-3">
                          {getSteps(selectedPractice).map((step, index) => (
                            <li key={`${selectedPractice.id}-step-${String(step).slice(0, 28)}-${index}`} className="flex items-start gap-3 text-sm">
                              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                                {index + 1}
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
                <div className="p-6 space-y-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Compass className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                    <p className="text-sm text-muted-foreground mt-2">Guided Shamanic Journey</p>
                  </div>

                  <div className="flex justify-center mb-2">
                    <GuidedAudioButton
                      api={api}
                      label="Play Guided Journey Narration"
                      script={[
                        `Welcome to this shamanic journey: ${selectedPractice.name}.`,
                        selectedPractice.description || "",
                        formatPreparationText(selectedPractice.preparation),
                        getSteps(selectedPractice).length > 0
                          ? `Your journey unfolds in ${getSteps(selectedPractice).length} steps. ${getSteps(selectedPractice)
                              .map((step, index) => `Step ${index + 1}: ${step}`)
                              .join(". ")}`
                          : "",
                        selectedPractice.closing_prayer
                          ? `When you are ready to close, offer this prayer: ${selectedPractice.closing_prayer}`
                          : "",
                        "Gently return to your body. Wiggle your fingers and toes. Take three deep breaths. Welcome back.",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  </div>

                  <PracticeTimer
                    segments={
                      getSteps(selectedPractice).length > 0
                        ? getSteps(selectedPractice).map((step, index) => ({
                            name: `Step ${index + 1}`,
                            description: step,
                            duration_seconds: Math.floor(((selectedPractice.duration_minutes || 30) * 60) / getSteps(selectedPractice).length),
                            has_audio: true,
                          }))
                        : [
                            {
                              name: selectedPractice.name,
                              description: selectedPractice.description || "Allow yourself to journey deeply with the drumming.",
                              duration_seconds: (selectedPractice.duration_minutes || 30) * 60,
                              has_audio: true,
                            },
                          ]
                    }
                    totalDuration={(selectedPractice.duration_minutes || 30) * 60}
                    backgroundAudio="drums"
                    autoStartAudio={true}
                    practiceType="shamanic"
                    element="Spirit"
                    visualizationType="aurora"
                    onComplete={async () => {
                      await logPractice(selectedPractice);
                      toast.success("Shamanic journey complete! Welcome back.");
                      setIsPracticing(false);
                      setSelectedPractice(null);
                    }}
                  />

                  {selectedPractice.closing_prayer && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                      <p className="text-sm text-indigo-300">Remember to close with:</p>
                      <p className="text-lg italic text-indigo-100 mt-2">"{selectedPractice.closing_prayer}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
              {!isPracticing ? (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const AC = window.AudioContext || window.webkitAudioContext;
                      const ctx = new AC();
                      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
                      const source = ctx.createBufferSource();
                      source.buffer = buffer;
                      source.connect(ctx.destination);
                      source.start(0);
                      window.__warmAudioCtx = ctx;
                    } catch (error) {
                      appLogger.warn("Could not warm audio context before shamanic practice", error);
                    }
                    setIsPracticing(true);
                  }}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                  style={{ WebkitTapHighlightColor: "transparent", minHeight: "56px" }}
                  data-testid="begin-practice-btn"
                >
                  <Compass className="w-5 h-5" />
                  Begin Guided Shamanic Journey
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPracticing(false)}
                  className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                  style={{ WebkitTapHighlightColor: "transparent", minHeight: "56px" }}
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
  );
};