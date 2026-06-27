import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Compass } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ShamanicCategoryFilter } from "./ShamanicCategoryFilter";
import { ShamanicHeader } from "./ShamanicHeader";
import { ShamanicPracticeGrid } from "./ShamanicPracticeGrid";
import { ShamanicPracticeModal } from "./ShamanicPracticeModal";
import { useShamanicPracticesData } from "./useShamanicPracticesData";
import PracticeVideos from "../../components/PracticeVideos";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { toast } from "sonner";

export default function ShamanicPracticesContainer({ api, user }) {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const {
    practices,
    loading,
    selectedPractice,
    setSelectedPractice,
    guidedPractice,
    setGuidedPractice,
    filter,
    setFilter,
    isPracticing,
    setIsPracticing,
    selectedLockedPractice,
    setSelectedLockedPractice,
    isLocked,
    logPractice,
    getSteps,
    formatPreparationText,
  } = useShamanicPracticesData(api);

  const shamanicUnlocked = premium.isSectionUnlocked("shamanic_practices");
  const shamanicProduct = premium.findProduct("shamanic_practices");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const isPremiumLocked = (practice) => Boolean(practice?.is_premium) && !shamanicUnlocked;

  const handleUnlockShamanic = async () => {
    await premium.startPurchase({
      productId: "shamanic_practices",
      returnPath: "/shamanic-practices",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/shamanic-practices",
    });
  };

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  return (
    <div className="min-h-screen bg-background" data-testid="shamanic-practices-page">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={async () => {
          const completed = guidedPractice;
          setGuidedPractice(null);
          if (!completed) return;
          await logPractice(completed);
          toast.success("Shamanic journey complete! Welcome back.");
        }}
      />

      <ShamanicHeader navigate={navigate} />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {!shamanicUnlocked && (
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-fuchsia-500/5 to-background p-4" data-testid="shamanic-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Optional Premium</p>
                <h2 className="text-lg font-serif text-amber-100/90" data-testid="shamanic-premium-banner-title">More pathways are now open for free</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="shamanic-premium-banner-description">Keep exploring freely — premium simply unlocks deeper advanced journeys.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="text-cyan-100/80 hover:text-cyan-50" onClick={() => navigate("/pricing")} data-testid="shamanic-view-subscription-button">
                  Optional premium
                </Button>
              </div>
            </div>
          </section>
        )}

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
          isPremiumLocked={isPremiumLocked}
          onLockedPractice={setSelectedLockedPractice}
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
        setGuidedPractice={setGuidedPractice}
        setSelectedPractice={setSelectedPractice}
        getSteps={getSteps}
        formatPreparationText={formatPreparationText}
        logPractice={logPractice}
        api={api}
        isPremiumLocked={isPremiumLocked}
        onLockedPractice={setSelectedLockedPractice}
      />

      {selectedLockedPractice && !shamanicUnlocked && (
        <div className="fixed inset-0 z-[240] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="shamanic-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <p className="text-xs uppercase tracking-wider text-fuchsia-200 mb-1">Premium Shamanic Journey</p>
            <h3 className="text-2xl font-serif mb-2" data-testid="shamanic-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="shamanic-premium-lock-description">This advanced pathway is premium. Unlock this section, subscribe, or unlock full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="shamanic-premium-lock-subscription-button">
                View Subscription Plans
              </Button>
              <Button onClick={handleUnlockShamanic} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="shamanic-premium-lock-unlock-button" disabled={premium.purchaseLoadingId === "shamanic_practices"}>
                {premium.purchaseLoadingId === "shamanic_practices" ? "Opening checkout..." : `Unlock ${shamanicProduct?.price?.toFixed(2) || "69.00"}`}
              </Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="shamanic-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="shamanic-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}