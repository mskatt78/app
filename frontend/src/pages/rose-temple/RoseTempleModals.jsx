import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import GuidedAudioButton from "../../components/GuidedAudioButton";
import AddToJournal from "../../components/AddToJournal";

const OVERLAY_ANIMATION = { opacity: 0, scale: 0.96 };
const OVERLAY_ENTER = { opacity: 1, scale: 1 };

export const RoseTempleModals = ({
  selectedTeaching,
  selectedPractice,
  selectedRite,
  onCloseTeaching,
  onClosePractice,
  onCloseRite,
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
                text={selectedPractice.description || selectedPractice.content || "Rose Temple embodiment practice"}
                label={`Play ${selectedPractice.name} narration`}
              />
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
