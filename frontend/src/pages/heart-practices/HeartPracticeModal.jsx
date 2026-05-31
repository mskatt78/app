import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Clock, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const resolvePracticeModalData = (selectedPractice) => {
  const practiceSteps = selectedPractice.steps || selectedPractice.ceremony_steps || selectedPractice.meditation_steps || selectedPractice.journey_steps || selectedPractice.ritual_steps || selectedPractice.visualization_steps || [];
  const practiceAffirmation = selectedPractice.affirmation || (Array.isArray(selectedPractice.affirmations) && selectedPractice.affirmations[0]) || "";
  return { practiceSteps, practiceAffirmation };
};

export const HeartPracticeModal = ({
  selectedPractice,
  isPracticing,
  setIsPracticing,
  stableHeartKey,
  onClose,
  api,
}) => {
  if (!selectedPractice) return null;
  const { practiceSteps, practiceAffirmation } = resolvePracticeModalData(selectedPractice);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          data-testid="practice-modal"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
            data-testid="close-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto">
            {!isPracticing ? (
              <>
                {selectedPractice.image_url && (
                  <div className="relative h-48 sm:h-64">
                    <img
                      src={selectedPractice.image_url}
                      alt={selectedPractice.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent rounded-t-2xl" />
                  </div>
                )}

                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-serif mb-2">{selectedPractice.name}</h2>
                    <p className="text-sm text-muted-foreground italic mb-4">{selectedPractice.tradition}</p>
                    <p className="text-muted-foreground">{selectedPractice.description}</p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10">
                    <Clock className="w-5 h-5 text-pink-400" />
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
                          <span key={stableHeartKey(`benefit-${selectedPractice.id}`, benefit)} className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-sm">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {practiceSteps.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Practice Steps</h3>
                      <ol className="space-y-3">
                        {practiceSteps.map((step, i) => (
                          <li key={stableHeartKey(`practice-step-${selectedPractice.id}`, step)} className="flex items-start gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-muted-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {practiceAffirmation && (
                    <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
                      <h3 className="font-medium mb-2">Heart Affirmation</h3>
                      <p className="text-sm italic text-muted-foreground">"{practiceAffirmation}"</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 space-y-5">
                <div className="text-center pt-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-pink-400" />
                  </div>
                  <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                  <p className="text-sm text-pink-300/70 mt-1">Guided Heart Practice — {selectedPractice.duration_minutes || 20} min</p>
                </div>

                {practiceAffirmation && (
                  <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                    <p className="text-xs text-pink-400 uppercase tracking-wider mb-1">Hold this intention</p>
                    <p className="text-base italic text-pink-100">"{practiceAffirmation}"</p>
                  </div>
                )}

                {practiceSteps.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-4 text-pink-300">Follow these steps:</h3>
                    <div className="space-y-3">
                      {practiceSteps.map((step, i) => (
                        <div key={stableHeartKey(`guided-step-${selectedPractice.id}`, step)} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-pink-500/10">
                          <span className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/15 text-center">
                  <CheckCircle2 className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">When complete, press the button below to log your practice.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
            {!isPracticing ? (
              <button
                type="button"
                onClick={() => setIsPracticing(true)}
                className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                style={{ WebkitTapHighlightColor: "transparent", minHeight: "56px" }}
                data-testid="begin-practice-btn"
              >
                <Play className="w-5 h-5" />
                Begin Guided Heart Practice
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post("/practice-history", {
                        practice_type: "heart_practice",
                        practice_id: selectedPractice.id,
                        duration_minutes: selectedPractice.duration_minutes || 20,
                        element: "Water",
                      });
                      toast.success("Heart practice complete! Your heart is open.");
                    } catch {
                      toast.success("Heart practice complete!");
                    }
                    setIsPracticing(false);
                    onClose();
                  }}
                  className="flex-1 py-4 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                  style={{ minHeight: "56px" }}
                  data-testid="complete-practice-btn"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Practice
                </button>
                <button
                  type="button"
                  onClick={() => setIsPracticing(false)}
                  className="py-4 px-5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center justify-center touch-manipulation"
                  style={{ minHeight: "56px" }}
                  data-testid="exit-practice-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};