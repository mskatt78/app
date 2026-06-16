import { useNavigate } from "react-router-dom";
import { PRACTICE_ICONS } from "./ritualBuilderConstants";
import { useRitualBuilderData } from "./useRitualBuilderData";
import { RitualBuilderHeader } from "./RitualBuilderHeader";
import { RitualBuilderLoadingView } from "./RitualBuilderLoadingView";
import { RitualBuilderListView } from "./RitualBuilderListView";
import { RitualBuilderCreateView } from "./RitualBuilderCreateView";
import { RitualBuilderActiveView } from "./RitualBuilderActiveView";
import { RitualBuilderShareDialog } from "./RitualBuilderShareDialog";

const RitualBuilderContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    rituals,
    creating,
    activeRitual,
    isPlaying,
    currentStep,
    stepProgress,
    elapsedTime,
    shareDialogOpen,
    shareUrl,
    sharingRitualId,
    practices,
    newRitual,
    addingPractice,
    selectedType,
    selectedPractice,
    practiceDuration,
    totalDuration,
    contentMode,
    setCreating,
    setActiveRitual,
    setIsPlaying,
    setShareDialogOpen,
    setNewRitual,
    setAddingPractice,
    setSelectedType,
    setSelectedPractice,
    setPracticeDuration,
    addPracticeToRitual,
    removePractice,
    saveRitual,
    deleteRitual,
    shareRitual,
    copyShareUrl,
    startRitual,
  } = useRitualBuilderData(api);

  return (
    <div className="min-h-screen bg-background" data-testid="ritual-builder-page">
      <RitualBuilderHeader onBack={() => navigate("/menu")} />

      {contentMode === "loading" && <RitualBuilderLoadingView />}
      {contentMode === "list" && (
        <RitualBuilderListView
          rituals={rituals}
          sharingRitualId={sharingRitualId}
          onCreate={() => setCreating(true)}
          onStart={startRitual}
          onShare={shareRitual}
          onDelete={deleteRitual}
        />
      )}
      {contentMode === "creating" && (
        <RitualBuilderCreateView
          newRitual={newRitual}
          totalDuration={totalDuration}
          addingPractice={addingPractice}
          selectedType={selectedType}
          selectedPractice={selectedPractice}
          practiceDuration={practiceDuration}
          practices={practices}
          practiceIcons={PRACTICE_ICONS}
          setCreating={setCreating}
          setNewRitual={setNewRitual}
          setAddingPractice={setAddingPractice}
          setSelectedType={setSelectedType}
          setSelectedPractice={setSelectedPractice}
          setPracticeDuration={setPracticeDuration}
          addPracticeToRitual={addPracticeToRitual}
          removePractice={removePractice}
          saveRitual={saveRitual}
        />
      )}
      {contentMode === "active" && (
        <RitualBuilderActiveView
          activeRitual={activeRitual}
          currentStep={currentStep}
          stepProgress={stepProgress}
          elapsedTime={elapsedTime}
          isPlaying={isPlaying}
          practiceIcons={PRACTICE_ICONS}
          setIsPlaying={setIsPlaying}
          startRitual={startRitual}
          setActiveRitual={setActiveRitual}
        />
      )}

      <RitualBuilderShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareUrl={shareUrl}
        onCopy={copyShareUrl}
      />
    </div>
  );
};

export default RitualBuilderContainer;
