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
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { Crown, Lock } from "lucide-react";

const MasculineTemple = ({ api, user }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const masculineTempleUnlocked = premium.isSectionUnlocked("masculine_temple");
  const masculineTempleLocked = !masculineTempleUnlocked;
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
        <MasculineEmbodimentGrid
          embodimentPractices={embodimentPractices}
          isLocked={masculineTempleLocked}
          setSelectedPractice={(practice) => (
            masculineTempleLocked
              ? premium.startPurchase({ productId: "masculine_temple", returnPath: "/masculine-temple" })
              : setSelectedPractice(practice)
          )}
        />
        <MasculineArchetypeGrid
          archetypes={archetypes}
          isLocked={masculineTempleLocked}
          openArchetype={(archetype) => (
            masculineTempleLocked
              ? premium.startPurchase({ productId: "masculine_temple", returnPath: "/masculine-temple" })
              : openArchetype(archetype)
          )}
        />
        {masculineTempleLocked && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4" data-testid="masculine-temple-lock-banner">
            <p className="text-sm text-amber-100/90">Masculine Temple is premium. Unlock to access full archetype pathways and embodiment practices.</p>
            <button
              onClick={() => premium.startPurchase({ productId: "masculine_temple", returnPath: "/masculine-temple" })}
              className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400/40 bg-amber-500/20 text-amber-100 text-sm"
              data-testid="masculine-temple-unlock-button"
            >
              <Lock className="w-4 h-4" /> Unlock <Crown className="w-4 h-4" />
            </button>
          </div>
        )}
        <MasculineQuoteBlock />
      </main>

      <MasculineArchetypeModal
        selectedArchetype={selectedArchetype}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedArchetype={setSelectedArchetype}
        api={api}
      />
      <MasculinePracticeModal selectedPractice={masculineTempleLocked ? null : selectedPractice} setSelectedPractice={setSelectedPractice} api={api} />
    </div>
  );
};

export default MasculineTemple;
