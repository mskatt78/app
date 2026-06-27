import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { HeartPracticeModal } from "./HeartPracticeModal";
import { HEART_CATEGORIES, HEART_CATEGORY_COLORS, HEART_CATEGORY_ICONS, stableHeartKey } from "./heartPracticeConfig";
import { HeartPracticesFilters } from "./HeartPracticesFilters";
import { HeartPracticesGrid } from "./HeartPracticesGrid";
import { HeartPracticesHeader } from "./HeartPracticesHeader";
import { useHeartPracticesData } from "./useHeartPracticesData";
import { resolveDurationMinutes } from "../../utils/durationUtils";

const HeartPracticesContainer = ({ api }) => {
  const navigate = useNavigate();
  const {
    practices,
    loading,
    selectedPractice,
    guidedPractice,
    filter,
    setSelectedPractice,
    setGuidedPractice,
    setFilter,
  } = useHeartPracticesData(api);

  const resolveHeartPracticeSteps = (practice) => {
    const rawSteps = [
      practice.steps,
      practice.ceremony_steps,
      practice.meditation_steps,
      practice.journey_steps,
      practice.ritual_steps,
      practice.visualization_steps,
      practice.instructions,
      practice.practice_guide,
    ]
      .flat()
      .filter((item) => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());

    if (rawSteps.length > 0) return rawSteps;

    const fallback = [];
    if (practice.description) fallback.push(`Settle into your heart space. ${practice.description}`);
    if (practice.why_this_heals) fallback.push(practice.why_this_heals);
    if (practice.prayer) fallback.push(`Hold this prayer in your heart: ${practice.prayer}`);
    if (practice.affirmation) fallback.push(`Repeat softly: ${practice.affirmation}`);
    if (Array.isArray(practice.affirmations) && practice.affirmations.length) {
      fallback.push(`Repeat each heart affirmation slowly: ${practice.affirmations.join(". ")}`);
    }
    fallback.push("Stay present with your breath and emotional body. Allow each exhale to soften and release.");
    fallback.push("Close by placing both hands on your heart and offering gratitude for this practice.");

    return fallback.filter(Boolean);
  };

  const buildGuidedHeartPractice = (practice) => ({
    ...practice,
    element: practice.element || "Water",
    category: practice.category || "heart",
    duration_minutes: resolveDurationMinutes(practice.duration_minutes, 20),
    steps: resolveHeartPracticeSteps(practice),
  });

  const handleStartGuided = (practice) => {
    setSelectedPractice(null);
    setGuidedPractice(buildGuidedHeartPractice(practice));
  };

  const handleExitGuided = () => {
    const completedPractice = guidedPractice;
    setGuidedPractice(null);

    if (completedPractice) {
      api.post("/practice-history", {
        practice_type: "heart_practice",
        practice_id: completedPractice.id,
        duration_minutes: completedPractice.duration_minutes || 20,
        element: completedPractice.element || "Water",
        notes: `Completed ${completedPractice.name}`,
      })
        .then(() => toast.success("Heart practice complete. Your voice and heart are aligned."))
        .catch(() => {
          // silent fallback, do not block UX
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="heart-practices-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="heart-practices">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={handleExitGuided}
      />

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
          onStartGuided={handleStartGuided}
        />
      </main>

      <HeartPracticeModal
        selectedPractice={selectedPractice}
        stableHeartKey={stableHeartKey}
        onClose={() => {
          setSelectedPractice(null);
        }}
        onStartGuided={handleStartGuided}
      />
    </div>
  );
};

export default HeartPracticesContainer;
