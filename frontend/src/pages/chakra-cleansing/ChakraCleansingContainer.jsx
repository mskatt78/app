import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ShareToCircle from "../../components/ShareToCircle";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { ChakraDetailModal } from "./ChakraDetailModal";
import { ChakraFilterBar } from "./ChakraFilterBar";
import { ChakraHeader } from "./ChakraHeader";
import { ChakraPracticeGrid } from "./ChakraPracticeGrid";
import { useChakraCleansingData } from "./useChakraCleansingData";
import { resolveDurationMinutes } from "../../utils/durationUtils";

export default function ChakraCleansing() {
  const navigate = useNavigate();
  const {
    loading,
    filteredPractices,
    chakras,
    chakraStripItems,
    selectedPractice,
    setSelectedPractice,
    filterChakra,
    setFilterChakra,
    expandedSection,
    setExpandedSection,
    audioState,
    generateAudio,
    showShare,
    setShowShare,
    showGuided,
    setShowGuided,
    guidedPractice,
    closeGuidedPractice,
    sectionItems,
    selectedPracticeBenefits,
    dailyCeremonySteps,
    closePracticeModal,
  } = useChakraCleansingData();

  return (
    <div className="min-h-screen bg-background" data-testid="chakra-cleansing-page">
      <ChakraHeader navigate={navigate} chakraStripItems={chakraStripItems} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <ChakraFilterBar chakras={chakras} filterChakra={filterChakra} setFilterChakra={setFilterChakra} />
        <ChakraPracticeGrid
          loading={loading}
          practices={filteredPractices}
          onOpenPractice={(practice) => {
            setSelectedPractice(practice);
            setExpandedSection("guide");
          }}
        />
      </main>

      <ChakraDetailModal
        selectedPractice={selectedPractice}
        audioState={audioState}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        sectionItems={sectionItems}
        dailyCeremonySteps={dailyCeremonySteps}
        selectedPracticeBenefits={selectedPracticeBenefits}
        generateAudio={generateAudio}
        setShowShare={setShowShare}
        setShowGuided={setShowGuided}
        onClose={closePracticeModal}
      />

      {/* Share to Sacred Circle Modal */}
      <AnimatePresence>
        {showShare && selectedPractice && (
          <ShareToCircle
            practiceTitle={`${selectedPractice.chakra || selectedPractice.name} Chakra Cleansing`}
            practiceType="journey"
            defaultElement={selectedPractice.element || "Spirit"}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {/* Guided Practice Full-Screen Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={{
              ...guidedPractice,
              duration_minutes: resolveDurationMinutes(guidedPractice.duration_minutes, 20),
            }}
            onExit={closeGuidedPractice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
