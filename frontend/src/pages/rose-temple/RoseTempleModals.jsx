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
                <div className="grid sm:grid-cols-2 gap-3" data-testid="rose-teaching-depth-grid">
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="rose-teaching-why-heals-panel">
                    <p className="text-[11px] uppercase tracking-wider text-cyan-200 mb-1">Why This Heals</p>
                    <p className="text-xs text-muted-foreground">Deep feminine transmission repairs body-trust by pairing symbolic meaning with embodied pacing and relational integration.</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3" data-testid="rose-teaching-safety-notes-panel">
                    <p className="text-[11px] uppercase tracking-wider text-amber-200 mb-1">Safety Notes</p>
                    <p className="text-xs text-muted-foreground">If activation rises, slow your breath, orient to your environment, and return only when your body feels safe.</p>
                  </div>
                </div>
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
              <div className="grid sm:grid-cols-2 gap-3 mb-4" data-testid="rose-practice-depth-grid">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="rose-practice-why-heals-panel">
                  <p className="text-[11px] uppercase tracking-wider text-cyan-200 mb-1">Why This Heals</p>
                  <p className="text-xs text-muted-foreground">Rose practices stabilize emotional coherence by combining breath rhythm, tenderness, and practical integration actions.</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3" data-testid="rose-practice-safety-notes-panel">
                  <p className="text-[11px] uppercase tracking-wider text-amber-200 mb-1">Safety Notes</p>
                  <p className="text-xs text-muted-foreground">Work slowly and pause when intensity exceeds consent. Ground through feet, hydration, and orientation before re-entering.</p>
                </div>
              </div>
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
              <div className="grid sm:grid-cols-2 gap-3 mb-4" data-testid="rose-rite-depth-grid">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="rose-rite-why-heals-panel">
                  <p className="text-[11px] uppercase tracking-wider text-cyan-200 mb-1">Why This Heals</p>
                  <p className="text-xs text-muted-foreground">Rites create threshold containers where symbolic release and embodied commitment reorganize identity toward coherence.</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3" data-testid="rose-rite-safety-notes-panel">
                  <p className="text-[11px] uppercase tracking-wider text-amber-200 mb-1">Safety Notes</p>
                  <p className="text-xs text-muted-foreground">Use paced breath and clear boundaries. If overwhelm appears, pause, orient, and complete grounding before closure.</p>
                </div>
              </div>
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
