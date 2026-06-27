import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import AddToJournal from "../../components/AddToJournal";
import { Button } from "../../components/ui/button";
import { composeDeepGuidedNarration, ritualDeliveryPillars } from "../../utils/guidedRitualComposer";

const OVERLAY_ANIMATION = { opacity: 0, scale: 0.96 };
const OVERLAY_ENTER = { opacity: 1, scale: 1 };

export const RoseTempleModals = ({
  selectedTeaching,
  selectedPractice,
  selectedRite,
  onStartGuidedTeaching,
  onStartGuidedPractice,
  onStartGuidedRite,
  onCloseTeaching,
  onClosePractice,
  onCloseRite,
  api,
}) => {
  return (
    <>
      <AnimatePresence>
        {selectedTeaching && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-teaching-modal">
            <motion.div
              initial={OVERLAY_ANIMATION}
              animate={OVERLAY_ENTER}
              exit={OVERLAY_ANIMATION}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-serif">{selectedTeaching.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTeaching.subtitle}</p>
                </div>
                <button onClick={onCloseTeaching} data-testid="rose-teaching-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {selectedTeaching.content?.map((item) => (
                  <div key={item.heading} className="rounded-xl border border-white/10 p-4 bg-background/50">
                    <h4 className="font-serif text-lg mb-2">{item.heading}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3" data-testid="rose-teaching-guided-voice-panel">
                  <p className="text-xs uppercase tracking-wider text-rose-200 mb-2">Guided Voice Transmission</p>
                  <GuidedAudioButton
                    api={api}
                    script={composeDeepGuidedNarration({
                      title: selectedTeaching.title,
                      element: "Water",
                      description: selectedTeaching.subtitle,
                      teachings: (selectedTeaching.content || []).map((item) => `${item.heading}: ${item.body}`),
                      embodiment: ritualDeliveryPillars,
                    })}
                    practiceName={selectedTeaching.title}
                    durationMinutes={18}
                    className="w-full"
                  />
                </div>
                <Button onClick={() => onStartGuidedTeaching?.(selectedTeaching)} className="w-full" data-testid="rose-teaching-modal-start-guided-btn">
                  <Play className="w-4 h-4 mr-2" /> Start Guided Teaching Practice
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPractice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-practice-modal">
            <motion.div
              initial={OVERLAY_ANIMATION}
              animate={OVERLAY_ENTER}
              exit={OVERLAY_ANIMATION}
              className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-serif">{selectedPractice.name}</h3>
                <button onClick={onClosePractice} data-testid="rose-practice-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedPractice.description}</p>
              <GuidedAudioButton
                api={api}
                script={composeDeepGuidedNarration({
                  title: selectedPractice.name,
                  element: "Water",
                  description: selectedPractice.description || selectedPractice.content,
                  embodiment: ritualDeliveryPillars,
                })}
                label={`Play ${selectedPractice.name} narration`}
              />
              <Button onClick={() => onStartGuidedPractice?.(selectedPractice)} className="w-full mt-3" data-testid="rose-practice-modal-start-guided-btn">
                <Play className="w-4 h-4 mr-2" /> Start Guided Practice
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRite && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-rite-modal">
            <motion.div
              initial={OVERLAY_ANIMATION}
              animate={OVERLAY_ENTER}
              exit={OVERLAY_ANIMATION}
              className="w-full max-w-2xl rounded-2xl bg-card border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-serif">{selectedRite.title || selectedRite.name}</h3>
                <button onClick={onCloseRite} data-testid="rose-rite-modal-close"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{selectedRite.description}</p>
              <GuidedAudioButton
                api={api}
                script={composeDeepGuidedNarration({
                  title: selectedRite.title || selectedRite.name,
                  element: "Water",
                  description: selectedRite.description,
                  rituals: selectedRite.ritual_steps,
                  embodiment: ritualDeliveryPillars,
                })}
                practiceName={selectedRite.title || selectedRite.name}
                durationMinutes={16}
                className="w-full mb-3"
              />
              <Button onClick={() => onStartGuidedRite?.(selectedRite)} className="w-full mb-3" data-testid="rose-rite-modal-start-guided-btn">
                <Play className="w-4 h-4 mr-2" /> Start Guided Rite
              </Button>
              <AddToJournal
                practiceType="rose_temple_rite"
                practiceName={selectedRite.title || selectedRite.name}
                defaultReflection={selectedRite.description || ""}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
