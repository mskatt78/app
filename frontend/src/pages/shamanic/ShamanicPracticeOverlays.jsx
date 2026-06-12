import { AnimatePresence } from "framer-motion";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import PracticeTimer from "../../components/PracticeTimer";
import ShareToCircle from "../../components/ShareToCircle";
import { stableShamanicKey } from "./constants";

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
  return (
    <>
      <AnimatePresence>
        {showGuidedOverlay && selectedPractice && (
          <GuidedPracticeOverlay
            practice={{
              ...selectedPractice,
              duration_minutes: selectedPractice.duration_minutes || 20,
              instructions: getSteps(selectedPractice),
            }}
            onExit={() => setShowGuidedOverlay(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPracticeTimer && selectedPractice && (
          <PracticeTimer
            open={showPracticeTimer}
            onClose={() => setShowPracticeTimer(false)}
            duration={selectedPractice.duration_minutes || 20}
            title={selectedPractice.name}
            subtitle={selectedPractice.category}
            backgroundAudio={getShamanicBackgroundAudio(selectedPractice.element)}
            guidedScript={[
              selectedPractice.description,
              ...(Array.isArray(selectedPractice.preparation)
                ? selectedPractice.preparation
                : selectedPractice.preparation
                  ? [selectedPractice.preparation]
                  : []),
              ...getSteps(selectedPractice),
              selectedPractice.closing_prayer,
            ]
              .filter(Boolean)
              .join("\n\n")}
            voice="alloy"
            speed="slow"
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