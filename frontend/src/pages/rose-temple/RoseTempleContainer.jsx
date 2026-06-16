import { useNavigate } from "react-router-dom";
import { RoseTempleHeader } from "./RoseTempleHeader";
import { RoseTempleMainSections } from "./RoseTempleMainSections";
import { RoseTempleModals } from "./RoseTempleModals";
import { useRoseTempleData } from "./useRoseTempleData";

const RoseTempleContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const {
    selectedTeaching,
    selectedPractice,
    embodimentPractices,
    loadingPractices,
    sacredRites,
    selectedRite,
    setSelectedTeaching,
    setSelectedPractice,
    setSelectedRite,
  } = useRoseTempleData();

  return (
    <div className="min-h-screen bg-background" data-testid="rose-temple">
      <RoseTempleHeader onBack={() => navigate("/dashboard")} />

      <RoseTempleMainSections
        loadingPractices={loadingPractices}
        embodimentPractices={embodimentPractices}
        sacredRites={sacredRites}
        onSelectTeaching={setSelectedTeaching}
        onSelectPractice={setSelectedPractice}
        onSelectRite={setSelectedRite}
      />

      <RoseTempleModals
        selectedTeaching={selectedTeaching}
        selectedPractice={selectedPractice}
        selectedRite={selectedRite}
        onCloseTeaching={() => setSelectedTeaching(null)}
        onClosePractice={() => setSelectedPractice(null)}
        onCloseRite={() => setSelectedRite(null)}
      />
    </div>
  );
};

export default RoseTempleContainer;
