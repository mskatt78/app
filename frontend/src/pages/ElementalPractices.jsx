import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ElementalPracticeCard } from "../components/elemental/ElementalPracticeCard";
import { ElementalPracticeModal } from "../components/elemental/ElementalPracticeModal";
import { elementColors, elementIcons, elementalFilters } from "../components/elemental/elementalConfig";
import { appLogger } from "../utils/logger";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

const ElementalPractices = ({ api, user }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPracticing, setIsPracticing] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);

  const elementalUnlocked = premium.isSectionUnlocked("elemental_practices");
  const elementalProduct = premium.findProduct("elemental_practices");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const canAccessPractice = (practice) => !practice?.is_premium || elementalUnlocked;

  const buildElementalGuidedPractice = useCallback((practice) => {
    const steps = Array.isArray(practice.instructions) && practice.instructions.length > 0
      ? practice.instructions
      : [
          `Arrive in the ${practice.element || "Earth"} field through steady breath and body awareness.`,
          practice.description || `Open to ${practice.name} with reverence and full presence.`,
          "Continue through this sequence slowly and allow your awareness to integrate each phase.",
          "Close with gratitude and grounding in your body.",
        ];

    return {
      id: practice.id,
      name: practice.name,
      duration_minutes: practice.duration_minutes || 20,
      element: practice.element || "Earth",
      category: "elemental",
      steps,
    };
  }, []);

  const handleStartCardGuided = useCallback((practice) => {
    if (!canAccessPractice(practice)) {
      setSelectedLockedPractice(practice);
      return;
    }
    setGuidedPractice(buildElementalGuidedPractice(practice));
  }, [buildElementalGuidedPractice, elementalUnlocked]);

  const handleUnlockElementalPractices = async () => {
    await premium.startPurchase({
      productId: "elemental_practices",
      returnPath: "/elemental-practices",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/elemental-practices",
    });
  };

  const handleExitCardGuided = useCallback(() => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "elemental",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 20,
      element: completed.element,
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success(`${completed.name} complete. Elemental integration recorded.`))
      .catch(() => {
        // silent
      });
  }, [api, guidedPractice]);

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  const fetchPractices = useCallback(async () => {
    try {
      const url = filter === "all" ? "/elemental-practices" : `/elemental-practices?element=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch elemental practices", error);
      toast.error("Could not load elemental practices");
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  useEffect(() => {
    if (!selectedPractice) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPractice(null);
        setIsPracticing(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedPractice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="elemental-practices-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-practices">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={handleExitCardGuided}
      />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Elemental <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Deep connection with the five elements</p>
            <p className="text-xs text-cyan-200/70" data-testid="elemental-devotional-note">Treat each element as a living relationship: breathe, feel, and close with embodied integration.</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {!elementalUnlocked && (
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-fuchsia-500/5 to-background p-4" data-testid="elemental-practices-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Optional Premium</p>
                <h2 className="text-lg font-serif text-amber-100/90" data-testid="elemental-practices-premium-banner-title">Elemental healing remains open</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="elemental-practices-premium-banner-description">Most users can explore freely first. Premium is for deeper advanced mastery tracks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="text-cyan-100/80 hover:text-cyan-50" onClick={() => navigate("/pricing")} data-testid="elemental-practices-view-subscription-button">Optional premium</Button>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-2">
          {elementalFilters.map((element) => {
            const Icon = elementIcons[element] || Star;
            const colors = elementColors[element] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={element}
                onClick={() => setFilter(element)}
                data-testid={`filter-${element.toLowerCase()}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  filter === element
                    ? `${colors.bg} ${colors.text} border ${colors.border || "border-white/10"}`
                    : "bg-card/50 text-muted-foreground hover:bg-card"
                }`}
              >
                {element !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{element === "all" ? "All Elements" : element}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice, index) => (
            <ElementalPracticeCard
              key={practice.id}
              practice={practice}
              index={index}
              onSelect={(candidate) => {
                if (!canAccessPractice(candidate)) {
                  setSelectedLockedPractice(candidate);
                  return;
                }
                setSelectedPractice(candidate);
              }}
              onStartGuided={handleStartCardGuided}
              canAccessPractice={canAccessPractice}
              onLockedPractice={setSelectedLockedPractice}
              formatReviewedDate={formatReviewedDate}
            />
          ))}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-12" data-testid="elemental-empty-state">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No elemental practices found.</p>
          </div>
        )}
      </main>

      <ElementalPracticeModal
        api={api}
        selectedPractice={selectedPractice}
        setSelectedPractice={setSelectedPractice}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
        showGuided={showGuided}
        setShowGuided={setShowGuided}
        onLogComplete={(practice) => api.post("/practice-history", {
          practice_type: "elemental",
          practice_id: practice.id,
          duration_minutes: practice.duration_minutes || 20,
          element: practice.element,
          notes: `Completed guided ${practice.name}`,
        })}
        onToastComplete={(practice) => toast.success(`${practice.element} practice complete! You are aligned.`)}
        onLogError={(error) => {
          appLogger.warn("Failed to log elemental practice", error);
          toast.success("Elemental practice complete!");
        }}
      />

      {selectedLockedPractice && !elementalUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="elemental-practices-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Elemental Practice</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="elemental-practices-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="elemental-practices-premium-lock-description">This advanced elemental practice is premium. Unlock section, subscribe, or unlock full app.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="elemental-practices-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockElementalPractices} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="elemental-practices-premium-lock-unlock-button" disabled={premium.purchaseLoadingId === "elemental_practices"}>
                {premium.purchaseLoadingId === "elemental_practices" ? "Opening checkout..." : `Unlock ${elementalProduct?.price?.toFixed(2) || "59.00"}`}
              </Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="elemental-practices-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="elemental-practices-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementalPractices;
