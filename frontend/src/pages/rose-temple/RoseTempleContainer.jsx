import { useNavigate } from "react-router-dom";
import { Crown, Loader2, Lock } from "lucide-react";
import { RoseTempleHeader } from "./RoseTempleHeader";
import { RoseTempleMainSections } from "./RoseTempleMainSections";
import { RoseTempleModals } from "./RoseTempleModals";
import { useRoseTempleData } from "./useRoseTempleData";
import { usePremiumAccess } from "../../hooks/usePremiumAccess";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import GuidedPracticeOverlay from "../../components/GuidedPracticeOverlay";
import { toast } from "sonner";

const RoseTempleContainer = ({ user, api }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const finalizeCheckoutIfPresent = premium.finalizeCheckoutIfPresent;
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);
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

  useEffect(() => {
    finalizeCheckoutIfPresent({ search: window.location.search });
  }, [finalizeCheckoutIfPresent]);

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/rose-temple",
    });
  };

  const buildRoseGuidedPractice = (item, type = "teaching") => {
    const steps = [
      item?.description,
      item?.content,
      ...(Array.isArray(item?.content) ? item.content.map((row) => `${row.heading}: ${row.body}`) : []),
      ...(Array.isArray(item?.instructions) ? item.instructions : []),
      ...(Array.isArray(item?.ritual_steps) ? item.ritual_steps : []),
    ].flat().filter((value) => typeof value === "string" && value.trim().length > 0).map((value) => value.trim());

    return {
      id: `rose-guided-${type}-${item?.id || item?.name || "session"}`,
      name: `${item?.title || item?.name || "Rose Temple"} Guided Practice`,
      category: "rose_temple",
      element: "Water",
      duration_minutes: item?.duration_minutes || 18,
      steps: steps.length > 0 ? steps : ["Arrive softly, breathe through the heart, and integrate this teaching into embodied action."],
    };
  };

  const startRoseGuidedPractice = (item, type = "teaching") => {
    setGuidedPractice(buildRoseGuidedPractice(item, type));
  };

  const exitRoseGuidedPractice = () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "rose_temple",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 18,
      element: completed.element || "Water",
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success("Rose Temple guided practice complete."))
      .catch(() => {
        // silent
      });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="rose-temple">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitRoseGuidedPractice}
      />

      <RoseTempleHeader onBack={() => navigate("/dashboard")} unlocked={roseTempleUnlocked} />

      {!roseTempleUnlocked && (
        <section className="max-w-6xl mx-auto p-6 pt-4" data-testid="rose-temple-premium-gate-panel">
          <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-background p-6">
            <p className="text-xs uppercase tracking-wider text-fuchsia-200/80 mb-1">Optional Premium</p>
            <h2 className="text-2xl font-serif flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-fuchsia-300" />
              Rose Temple remains open first
            </h2>
            <p className="text-sm text-muted-foreground mb-4" data-testid="rose-temple-premium-gate-description">
              Keep exploring freely, then continue with subscription or full app access for deeper layers.
            </p>
            <p className="text-xs text-fuchsia-100/70 mb-3" data-testid="rose-temple-devotional-note">
              Rose Temple is practiced as devotional embodiment: tenderness, truth, and practical integration in daily life.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-cyan-400/40 text-cyan-100"
                onClick={() => navigate("/pricing")}
                data-testid="rose-temple-view-subscription-button"
              >
                View Subscription
              </Button>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-200"
                onClick={handleUnlockFullApp}
                data-testid="rose-temple-unlock-fullapp-button"
                disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}
              >
                {premium.purchaseLoadingId === "full_app_unlock" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : <><Crown className="w-4 h-4 mr-2" />Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}</>}
              </Button>
            </div>
          </div>
        </section>
      )}

      <RoseTempleMainSections
        locked={false}
        loadingPractices={loadingPractices}
        embodimentPractices={embodimentPractices}
        sacredRites={sacredRites}
        onSelectTeaching={(item) => {
          setSelectedTeaching(item);
        }}
        onSelectPractice={(item) => {
          if (item?.is_premium && !roseTempleUnlocked) {
            setSelectedLockedPractice(item);
            return;
          }
          setSelectedPractice(item);
        }}
        onSelectRite={(item) => {
          setSelectedRite(item);
        }}
        onStartGuidedTeaching={(item) => {
          startRoseGuidedPractice(item, "teaching");
        }}
        onStartGuidedPractice={(item) => {
          if (item?.is_premium && !roseTempleUnlocked) {
            setSelectedLockedPractice(item);
            return;
          }
          startRoseGuidedPractice(item, "practice");
        }}
        onStartGuidedRite={(item) => {
          startRoseGuidedPractice(item, "rite");
        }}
      />

      <RoseTempleModals
        selectedTeaching={selectedTeaching}
        selectedPractice={selectedPractice}
        selectedRite={selectedRite}
        onStartGuidedTeaching={(item) => startRoseGuidedPractice(item, "teaching")}
        onStartGuidedPractice={(item) => startRoseGuidedPractice(item, "practice")}
        onStartGuidedRite={(item) => startRoseGuidedPractice(item, "rite")}
        onCloseTeaching={() => setSelectedTeaching(null)}
        onClosePractice={() => setSelectedPractice(null)}
        onCloseRite={() => setSelectedRite(null)}
        api={api}
      />

      {selectedLockedPractice && !roseTempleUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="rose-temple-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <h3 className="text-2xl font-serif mb-2" data-testid="rose-temple-premium-lock-title">{selectedLockedPractice.name || selectedLockedPractice.title || "Rose Temple"}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="rose-temple-premium-lock-description">This advanced rose pathway is premium. Continue with subscription or full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="rose-temple-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button
                variant="outline"
                className="border-amber-500/30 text-amber-200"
                onClick={handleUnlockFullApp}
                data-testid="rose-temple-premium-lock-fullapp-button"
                disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}
              >
                {premium.purchaseLoadingId === "full_app_unlock" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : <><Crown className="w-4 h-4 mr-2" />Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}</>}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="rose-temple-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoseTempleContainer;
