import { AnimatePresence } from "framer-motion";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import PracticeTimer from "../../components/PracticeTimer";
import ShareToCircle from "../../components/ShareToCircle";
import { stableShamanicKey } from "./constants";
import { resolveDurationMinutes } from "../../utils/durationUtils";

const getShamanicBackgroundAudio = (element) => {
  if (element === "Fire") return "fire";
  if (element === "Water") return "ocean";
  if (element === "Air") return "wind";
  if (element === "Earth") return "nature";
  return "drumming";
};

export const ShamanicPracticeOverlays = ({
  selectedPractice,
  showGuidedOverlay,
  setShowGuidedOverlay,
  showPracticeTimer,
  setShowPracticeTimer,
  showShareModal,
  setShowShareModal,
  getSteps,
  setShowPracticeGuide,
}) => {
  const resolvedDurationMinutes = selectedPractice ? resolveDurationMinutes(selectedPractice.duration_minutes, 30) : 30;

  return (
    <>
      <AnimatePresence>
        {showGuidedOverlay && selectedPractice && (
          <GuidedPracticeOverlay
            practice={{
              ...selectedPractice,
              duration_minutes: resolvedDurationMinutes,
              instructions: getSteps(selectedPractice),
            }}
            onExit={() => setShowGuidedOverlay(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPracticeTimer && selectedPractice && (
          <PracticeTimer
            totalDuration={resolvedDurationMinutes * 60}
            backgroundAudio={getShamanicBackgroundAudio(selectedPractice.element)}
            practiceType="shamanic"
            element={selectedPractice.element || "Spirit"}
            segments={
              getSteps(selectedPractice).length > 0
                ? getSteps(selectedPractice).map((step, index) => ({
                    name: `Step ${index + 1}`,
                    description: step,
                    duration_seconds: Math.floor((resolvedDurationMinutes * 60) / getSteps(selectedPractice).length),
                    has_audio: true,
                  }))
                : [
                    {
                      name: selectedPractice.name,
                      description: selectedPractice.description || "Allow yourself to journey deeply with the drumming.",
                      duration_seconds: resolvedDurationMinutes * 60,
                      has_audio: true,
                    },
                  ]
            }
            dataTestIdPrefix={stableShamanicKey("shamanic-timer", selectedPractice.id || selectedPractice.name)}
            onComplete={() => {
              setShowPracticeTimer(false);
              setShowPracticeGuide(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && selectedPractice && (
          <ShareToCircle
            practiceTitle={selectedPractice.name}
            practiceType="shamanic"
            defaultElement={selectedPractice.element || "Spirit"}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};