import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { ShamanicCategoryFilter } from "./ShamanicCategoryFilter";
import { ShamanicHeader } from "./ShamanicHeader";
import { ShamanicPracticeGrid } from "./ShamanicPracticeGrid";
import { ShamanicPracticeModal } from "./ShamanicPracticeModal";
import { useShamanicPracticesData } from "./useShamanicPracticesData";
import PracticeVideos from "../../components/PracticeVideos";

export default function ShamanicPracticesContainer({ api }) {
  const navigate = useNavigate();
  const {
    practices,
    loading,
    selectedPractice,
    setSelectedPractice,
    filter,
    setFilter,
    isPracticing,
    setIsPracticing,
    isLocked,
    logPractice,
    getSteps,
    formatPreparationText,
  } = useShamanicPracticesData(api);

  return (
    <div className="min-h-screen bg-background" data-testid="shamanic-practices-page">
      <ShamanicHeader navigate={navigate} />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <ShamanicCategoryFilter filter={filter} setFilter={setFilter} />

        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="shamanic-guidance-note">
          <p className="text-sm text-amber-300">
            ⚠️ These practices involve deep journeying. Begin with shorter sessions and ensure you are in a safe, comfortable environment.
          </p>
        </div>

        <ShamanicPracticeGrid
          loading={loading}
          practices={practices}
          isLocked={isLocked}
          navigate={navigate}
          setSelectedPractice={setSelectedPractice}
        />

        <PracticeVideos
          title="Shamanic Journey Videos"
          category="shamanic"
          icon={Compass}
          color="amber"
          showCategoryFilter={false}
        />
      </main>

      <ShamanicPracticeModal
        selectedPractice={selectedPractice}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
        setSelectedPractice={setSelectedPractice}
        getSteps={getSteps}
        formatPreparationText={formatPreparationText}
        logPractice={logPractice}
        api={api}
      />
    </div>
  );
}