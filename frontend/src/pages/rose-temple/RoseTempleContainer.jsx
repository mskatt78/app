import { useNavigate } from "react-router-dom";
import { Crown, Loader2, Lock } from "lucide-react";
import { RoseTempleHeader } from "./RoseTempleHeader";
import { RoseTempleMainSections } from "./RoseTempleMainSections";
import { RoseTempleModals } from "./RoseTempleModals";
import { useRoseTempleData } from "./useRoseTempleData";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { Button } from "../../components/ui/button";
import { useEffect } from "react";

const RoseTempleContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const finalizeCheckoutIfPresent = premium.finalizeCheckoutIfPresent;
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
  } = useRoseTempleData(api);

  const roseTempleUnlocked = premium.isSectionUnlocked("rose_temple");
  const fullAppProduct = premium.findProduct("full_app_unlock");
  const roseProduct = premium.findProduct("rose_temple");

  useEffect(() => {
    finalizeCheckoutIfPresent({ search: window.location.search });
  }, [finalizeCheckoutIfPresent]);

  const handleUnlockRoseTemple = async () => {
    await premium.startPurchase({
      productId: "rose_temple",
      returnPath: "/rose-temple",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/rose-temple",
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="rose-temple">
      <RoseTempleHeader onBack={() => navigate("/dashboard")} unlocked={roseTempleUnlocked} />

      {!roseTempleUnlocked && (
        <section className="max-w-6xl mx-auto p-6 pt-4" data-testid="rose-temple-premium-gate-panel">
          <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-background p-6">
            <p className="text-xs uppercase tracking-wider text-fuchsia-200 mb-1">Premium Access</p>
            <h2 className="text-2xl font-serif flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-fuchsia-300" />
              Rose Temple is currently locked
            </h2>
            <p className="text-sm text-muted-foreground mb-4" data-testid="rose-temple-premium-gate-description">
              Unlock this section-only offering or choose Full App unlock. Access activates immediately after payment.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-fuchsia-500 hover:bg-fuchsia-600"
                onClick={handleUnlockRoseTemple}
                data-testid="rose-temple-unlock-section-button"
                disabled={premium.purchaseLoadingId === "rose_temple" || premium.loading}
              >
                {premium.purchaseLoadingId === "rose_temple" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : `Unlock Rose Temple ${roseProduct?.price?.toFixed(2) || "59.00"}`}
              </Button>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-200"
                onClick={handleUnlockFullApp}
                data-testid="rose-temple-unlock-fullapp-button"
                disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}
              >
                {premium.purchaseLoadingId === "full_app_unlock" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : <><Crown className="w-4 h-4 mr-2" />Full App ${fullAppProduct?.price?.toFixed(2) || "149.00"}</>}
              </Button>
            </div>
          </div>
        </section>
      )}

      <RoseTempleMainSections
        locked={!roseTempleUnlocked}
        loadingPractices={loadingPractices}
        embodimentPractices={embodimentPractices}
        sacredRites={sacredRites}
        onSelectTeaching={(item) => {
          if (!roseTempleUnlocked) return;
          setSelectedTeaching(item);
        }}
        onSelectPractice={(item) => {
          if (!roseTempleUnlocked) return;
          setSelectedPractice(item);
        }}
        onSelectRite={(item) => {
          if (!roseTempleUnlocked) return;
          setSelectedRite(item);
        }}
      />

      {roseTempleUnlocked && (
        <RoseTempleModals
          selectedTeaching={selectedTeaching}
          selectedPractice={selectedPractice}
          selectedRite={selectedRite}
          onCloseTeaching={() => setSelectedTeaching(null)}
          onClosePractice={() => setSelectedPractice(null)}
          onCloseRite={() => setSelectedRite(null)}
        />
      )}
    </div>
  );
};

export default RoseTempleContainer;
