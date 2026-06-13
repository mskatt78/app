import { useNavigate } from "react-router-dom";
import { HeartPracticeModal } from "./HeartPracticeModal";
import { HEART_CATEGORIES, HEART_CATEGORY_COLORS, HEART_CATEGORY_ICONS, stableHeartKey } from "./heartPracticeConfig";
import { HeartPracticesFilters } from "./HeartPracticesFilters";
import { HeartPracticesGrid } from "./HeartPracticesGrid";
import { HeartPracticesHeader } from "./HeartPracticesHeader";
import { useHeartPracticesData } from "./useHeartPracticesData";

const HeartPracticesContainer = ({ api }) => {
  const navigate = useNavigate();
  const {
    practices,
    loading,
    selectedPractice,
    filter,
    isPracticing,
    setSelectedPractice,
    setFilter,
    setIsPracticing,
  } = useHeartPracticesData(api);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="heart-practices-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="heart-practices">
      <HeartPracticesHeader navigate={navigate} />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <HeartPracticesFilters
          categories={HEART_CATEGORIES}
          categoryIcons={HEART_CATEGORY_ICONS}
          categoryColors={HEART_CATEGORY_COLORS}
          filter={filter}
          setFilter={setFilter}
        />

        <HeartPracticesGrid
          practices={practices}
          categoryIcons={HEART_CATEGORY_ICONS}
          categoryColors={HEART_CATEGORY_COLORS}
          setSelectedPractice={setSelectedPractice}
        />
      </main>

      <HeartPracticeModal
        selectedPractice={selectedPractice}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
        stableHeartKey={stableHeartKey}
        onClose={() => {
          setSelectedPractice(null);
          setIsPracticing(false);
        }}
        api={api}
      />
    </div>
  );
};

export default HeartPracticesContainer;
