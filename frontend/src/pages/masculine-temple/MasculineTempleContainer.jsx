import { useNavigate } from "react-router-dom";
import { archetypes } from "./constants";
import { MasculineArchetypeGrid } from "./MasculineArchetypeGrid";
import { MasculineArchetypeModal } from "./MasculineArchetypeModal";
import { MasculineEmbodimentGrid } from "./MasculineEmbodimentGrid";
import { MasculineHeader } from "./MasculineHeader";
import { MasculineHero } from "./MasculineHero";
import { MasculineIntroPanel } from "./MasculineIntroPanel";
import { MasculinePracticeModal } from "./MasculinePracticeModal";
import { MasculineQuoteBlock } from "./MasculineQuoteBlock";
import { useMasculineTempleData } from "./useMasculineTempleData";

const MasculineTemple = ({ api }) => {
  const navigate = useNavigate();
  const {
    selectedArchetype,
    setSelectedArchetype,
    activeTab,
    setActiveTab,
    embodimentPractices,
    selectedPractice,
    setSelectedPractice,
    showIntro,
    setShowIntro,
    openArchetype,
  } = useMasculineTempleData();

  return (
    <div className="min-h-screen bg-background" data-testid="masculine-temple">
      <MasculineHeader navigate={navigate} />

      <main className="max-w-5xl mx-auto p-6">
        <MasculineHero />
        <MasculineIntroPanel showIntro={showIntro} setShowIntro={setShowIntro} />
        <MasculineEmbodimentGrid embodimentPractices={embodimentPractices} setSelectedPractice={setSelectedPractice} />
        <MasculineArchetypeGrid archetypes={archetypes} openArchetype={openArchetype} />
        <MasculineQuoteBlock />
      </main>

      <MasculineArchetypeModal
        selectedArchetype={selectedArchetype}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedArchetype={setSelectedArchetype}
        api={api}
      />
      <MasculinePracticeModal selectedPractice={selectedPractice} setSelectedPractice={setSelectedPractice} api={api} />
    </div>
  );
};

export default MasculineTemple;
