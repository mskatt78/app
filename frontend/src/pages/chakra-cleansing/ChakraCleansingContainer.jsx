import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ShareToCircle from "../../components/ShareToCircle";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { Button } from "../../components/ui/button";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { ChakraDetailModal } from "./ChakraDetailModal";
import { ChakraFilterBar } from "./ChakraFilterBar";
import { ChakraHeader } from "./ChakraHeader";
import { ChakraPracticeGrid } from "./ChakraPracticeGrid";
import { useChakraCleansingData } from "./useChakraCleansingData";
import { resolveDurationMinutes } from "../../utils/durationUtils";

export default function ChakraCleansing({ api, user }) {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);
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

  const chakraUnlocked = premium.isSectionUnlocked("chakra_cleansing");
  const chakraProduct = premium.findProduct("chakra_cleansing");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const canAccessPractice = (practice) => !practice?.is_premium || chakraUnlocked;

  const handleUnlockChakra = async () => {
    await premium.startPurchase({
      productId: "chakra_cleansing",
      returnPath: "/chakra-cleansing",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/chakra-cleansing",
    });
  };

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  return (
    <div className="min-h-screen bg-background" data-testid="chakra-cleansing-page">
      <ChakraHeader navigate={navigate} chakraStripItems={chakraStripItems} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!chakraUnlocked && (
          <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-background p-4 mb-6" data-testid="chakra-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300">Chakra Access Model</p>
                <h2 className="text-xl font-serif text-amber-100" data-testid="chakra-premium-banner-title">~30% free, advanced chakra protocols premium</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="chakra-premium-banner-description">Subscription, section unlock, or full app unlock available.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="border-cyan-400/40 text-cyan-100" onClick={() => navigate("/pricing")} data-testid="chakra-view-subscription-button">View Subscription</Button>
                <Button onClick={handleUnlockChakra} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="chakra-unlock-button" disabled={premium.purchaseLoadingId === "chakra_cleansing" || premium.loading}>
                  {premium.purchaseLoadingId === "chakra_cleansing" ? "Opening checkout..." : `Unlock ${chakraProduct?.price?.toFixed(2) || "59.00"}`}
                </Button>
                <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="chakra-unlock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}>
                  {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
                </Button>
              </div>
            </div>
          </section>
        )}

        <ChakraFilterBar chakras={chakras} filterChakra={filterChakra} setFilterChakra={setFilterChakra} />
        <ChakraPracticeGrid
          loading={loading}
          practices={filteredPractices}
          canAccessPractice={canAccessPractice}
          onOpenPractice={(practice) => {
            if (!canAccessPractice(practice)) {
              setSelectedLockedPractice(practice);
              return;
            }
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

      {selectedLockedPractice && !chakraUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="chakra-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <h3 className="text-2xl font-serif mb-2" data-testid="chakra-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="chakra-premium-lock-description">This chakra protocol is premium. Unlock section, subscribe, or unlock full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="chakra-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockChakra} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="chakra-premium-lock-unlock-button" disabled={premium.purchaseLoadingId === "chakra_cleansing"}>
                {premium.purchaseLoadingId === "chakra_cleansing" ? "Opening checkout..." : `Unlock ${chakraProduct?.price?.toFixed(2) || "59.00"}`}
              </Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="chakra-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="chakra-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
