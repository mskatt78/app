import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { Button } from "../components/ui/button";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

// Icon mapping for element ids (React components can't be stored in MongoDB)
import { ELEMENT_ICONS, STATIC_ELEMENTS, stableElementKey } from "./elemental-temples/elementalTempleData";
import { ElementalTempleGridView } from "./elemental-temples/ElementalTempleGridView";
import { ElementalTempleDetailView } from "./elemental-temples/ElementalTempleDetailView";

const ElementalTemples = ({ user, api }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [activeTemple, setActiveTemple] = useState(null);
  const [activeSection, setActiveSection] = useState("why_it_heals");
  const [elements, setElements] = useState(STATIC_ELEMENTS);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [showTempleLock, setShowTempleLock] = useState(false);
  const [selectedLockedTemple, setSelectedLockedTemple] = useState(null);

  const templesUnlocked = premium.isSectionUnlocked("elemental_temples");
  const fullAppProduct = premium.findProduct("full_app_unlock");
  const canAccessTemple = (temple) => !temple?.is_premium || templesUnlocked;

  const startTempleGuidedPractice = (temple, sectionId = "embodiment") => {
    if (!canAccessTemple(temple)) {
      setSelectedLockedTemple(temple);
      setShowTempleLock(true);
      return;
    }

    const section = sectionId === "rituals"
      ? temple.rituals?.[0]?.steps || []
      : sectionId === "ceremonies"
        ? temple.ceremonies?.[0]?.flow || []
        : sectionId === "practices"
          ? temple.practices?.map((practice) => practice.desc).filter(Boolean).slice(0, 8) || []
          : temple.embodiment
            ? [temple.embodiment]
            : [];

    const steps = section.length > 0
      ? section
      : [
          temple.description,
          temple.inner,
          temple.outer,
          `Close by speaking one ${temple.element} affirmation aloud with full breath and presence.`,
        ].filter(Boolean);

    setGuidedPractice({
      id: `temple-guided-${temple.id}-${sectionId}`,
      name: `${temple.name} · Guided ${sectionId.replace("_", " ")}`,
      category: "elemental_temple",
      element: temple.element || "Spirit",
      duration_minutes: 20,
      steps,
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/elemental-temples",
    });
  };

  const exitTempleGuidedPractice = () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "elemental_temple",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 20,
      element: completed.element || "Spirit",
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success("Elemental temple guided practice complete."))
      .catch(() => {
        // silent
      });
  };

  // Fetch fresh data from API (enriched content from MongoDB)
  useEffect(() => {
    if (!api) return;
    api.get("/elemental-temples")
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Merge: static data provides new deep fields; API provides updated practices/safety
          const merged = STATIC_ELEMENTS.map(staticEl => {
            const apiEl = res.data.find(el => el.id === staticEl.id);
            return apiEl
              ? {
                  ...staticEl,          // static data (includes why_it_heals, ancient_traditions, icon refs)
                  ...apiEl,             // API data overrides (practices, safety_precautions, etc.)
                  icon: ELEMENT_ICONS[apiEl.icon] || staticEl.icon || ELEMENT_ICONS.mountain,
                  // preserve static-only deep content fields
                  why_it_heals: staticEl.why_it_heals,
                  ancient_traditions: staticEl.ancient_traditions,
                  wisdom: staticEl.wisdom,
                  inner: staticEl.inner,
                  outer: staticEl.outer,
                  nature_connection: staticEl.nature_connection,
                  embodiment: staticEl.embodiment,
                  affirmations: staticEl.affirmations,
                  blessings: staticEl.blessings,
                  ceremonies: staticEl.ceremonies,
                  rituals: staticEl.rituals,
                }
              : staticEl;
          });
          setElements(merged);
        }
      })
      .catch(() => { /* silently use static data */ });
  }, [api]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const sections = [
    { id: "why_it_heals", label: "Why It Heals" },
    { id: "ancient_traditions", label: "Ancient Traditions" },
    { id: "embodiment", label: "Embodiment" },
    { id: "inner", label: "Within You" },
    { id: "outer", label: "In Nature" },
    { id: "practices", label: "Practices" },
    { id: "rituals", label: "Rituals" },
    { id: "ceremonies", label: "Ceremonies" },
    { id: "blessings", label: "Blessings" },
    { id: "affirmations", label: "Affirmations" },
    { id: "safety_precautions", label: "Safety" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-temples">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitTempleGuidedPractice}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeTemple ? setActiveTemple(null) : navigate(-1)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Temples</p>
              <h1 className="text-xl font-serif">
                {activeTemple ? (
                  <><span className="italic" style={{ color: `var(--${activeTemple.color.accent})` }}>{activeTemple.name}</span></>
                ) : (
                  <>Elemental <span className="italic text-primary">Temples</span></>
                )}
              </h1>
            </div>
          </div>
          <Globe className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!templesUnlocked && (
          <section
            className="mb-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-background p-4"
            data-testid="elemental-temples-premium-banner"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300">Premium Temple Access</p>
                <h2 className="text-xl font-serif text-amber-100" data-testid="elemental-temples-premium-banner-title">
                  Elemental Temples remain open first
                </h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="elemental-temples-premium-banner-description">
                  Explore freely first. Continue with subscription or full app for deeper advanced temple layers.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-cyan-400/40 text-cyan-100"
                  onClick={() => navigate("/pricing")}
                  data-testid="elemental-temples-view-subscription-button"
                >
                  View Subscription
                </Button>
                <Button
                  onClick={handleUnlockFullApp}
                  variant="outline"
                  className="border-amber-400/40 text-amber-100"
                  data-testid="elemental-temples-unlock-fullapp-button"
                  disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}
                >
                  {premium.purchaseLoadingId === "full_app_unlock"
                    ? "Opening checkout..."
                    : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
                </Button>
              </div>
            </div>
          </section>
        )}

        <AnimatePresence mode="wait">
          {!activeTemple ? (
            <ElementalTempleGridView
              elements={elements}
              setActiveTemple={setActiveTemple}
              setActiveSection={setActiveSection}
              canAccessTemple={canAccessTemple}
              onLockedTemple={(temple) => {
                setSelectedLockedTemple(temple);
                setShowTempleLock(true);
              }}
            />
          ) : (
            <ElementalTempleDetailView
              activeTemple={activeTemple}
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              stableElementKey={stableElementKey}
              onStartGuidedPractice={startTempleGuidedPractice}
              api={api}
            />
          )}
        </AnimatePresence>
      </main>

      {showTempleLock && !templesUnlocked && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="elemental-temples-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2">
              <Lock className="w-4 h-4" />
              <p className="text-xs uppercase tracking-wider">Premium Temple</p>
            </div>
            <h3 className="text-2xl font-serif mb-2" data-testid="elemental-temples-premium-lock-title">{selectedLockedTemple?.name || "Elemental Temples"}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="elemental-temples-premium-lock-description">
              This advanced temple pathway is premium. Continue with subscription or full app access.
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="border-cyan-400/40 text-cyan-100 sm:col-span-2"
                data-testid="elemental-temples-premium-lock-subscription-button"
              >
                View Subscription Plans
              </Button>
              <Button
                onClick={handleUnlockFullApp}
                variant="outline"
                className="border-amber-400/40 text-amber-100"
                data-testid="elemental-temples-premium-lock-fullapp-button"
                disabled={premium.purchaseLoadingId === "full_app_unlock"}
              >
                {premium.purchaseLoadingId === "full_app_unlock" ? (
                  "Opening checkout..."
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Full App {fullAppProduct?.price?.toFixed(2) || "369.00"}
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setShowTempleLock(false)}
              data-testid="elemental-temples-premium-lock-close-button"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementalTemples;
