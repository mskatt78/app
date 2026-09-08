import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { Button } from "../../components/ui/button";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { HeartPracticeModal } from "./HeartPracticeModal";
import { HEART_CATEGORIES, HEART_CATEGORY_COLORS, HEART_CATEGORY_ICONS, stableHeartKey } from "./heartPracticeConfig";
import { HeartPracticesFilters } from "./HeartPracticesFilters";
import { HeartPracticesGrid } from "./HeartPracticesGrid";
import { HeartPracticesHeader } from "./HeartPracticesHeader";
import { useHeartPracticesData } from "./useHeartPracticesData";
import { resolveDurationMinutes } from "../../utils/durationUtils";

const HeartPracticesContainer = ({ api, user }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);
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

  const heartUnlocked = premium.isSectionUnlocked("heart_practices");
  const heartProduct = premium.findProduct("heart_practices");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const canAccessPractice = (practice) => !practice?.is_premium || heartUnlocked;

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/heart-practices",
    });
  };

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

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
        {!heartUnlocked && (
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-pink-500/5 to-background p-4" data-testid="heart-practices-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Optional Premium</p>
                <h2 className="text-lg font-serif text-amber-100/90" data-testid="heart-practices-premium-banner-title">Healing pathways stay open first</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="heart-practices-premium-banner-description">Free heart practices come first — premium only extends deeper advanced tracks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="text-cyan-100/80 hover:text-cyan-50" onClick={() => navigate("/pricing")} data-testid="heart-practices-view-subscription-button">Optional premium</Button>
              </div>
            </div>
          </section>
        )}

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
          canAccessPractice={canAccessPractice}
          onLockedPractice={setSelectedLockedPractice}
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

      {selectedLockedPractice && !heartUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="heart-practices-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <h3 className="text-2xl font-serif mb-2" data-testid="heart-practices-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="heart-practices-premium-lock-description">This advanced heart practice is premium. Continue with Sacred Access membership.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="heart-practices-premium-lock-subscription-button">Sacred Access</Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="heart-practices-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeartPracticesContainer;
