import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Filter, Loader2, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useBreathworkEngine } from "../components/breathwork/useBreathworkEngine";
import { BreathworkActiveSessionView } from "../components/breathwork/BreathworkActiveSessionView";
import { BreathworkSessionGrid } from "../components/breathwork/BreathworkSessionGrid";
import { BREATHWORK_ELEMENTS, ELEMENT_COLORS, PHASE_LABELS } from "../components/breathwork/breathworkConfig";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import { getBreathworkImage } from "../utils/shamanicImageTheme";
import { useOfflineDownload } from "../hooks/useOfflineDownload";

const buildBreathworkSteps = (session) => {
  const pattern = session.pattern || {};
  const patternLine = `Inhale for ${pattern.inhale || 4} counts${pattern.hold ? `, hold for ${pattern.hold}` : ""}, exhale for ${pattern.exhale || 4}${pattern.hold_empty ? `, and rest empty for ${pattern.hold_empty}` : ""}.`;
  return [
    `Welcome to ${session.name}. ${session.description || ""} Find a comfortable seat, lengthen your spine, and soften your shoulders and jaw.`,
    `The rhythm is: ${patternLine} Keep the counts gentle — never strain. Begin now, following the rhythm at your own natural pace.`,
    `Continue the cycle. ${patternLine} With every exhale, release tension down and out. With every inhale, receive fresh life force. Stay with several more rounds, letting the breath become smooth and effortless.`,
    `Slowly release the pattern and let your breath return to its natural flow. Notice what has shifted: ${(session.benefits || []).slice(0, 3).join(", ") || "calm, clarity, presence"}. Carry this state with you. When you are ready, gently open your eyes.`,
  ];
};

const Breathwork = ({ api, user }) => {
  const navigate = useNavigate();
  const engine = useBreathworkEngine({ api });
  const [catalogMode, setCatalogMode] = useState("all");
  const [selectedLockedSession, setSelectedLockedSession] = useState(null);
  const premium = usePremiumAccess({ api, user });
  const offline = useOfflineDownload({ api });

  const handleDownloadForOffline = async (event, session) => {
    event.stopPropagation();
    if (offline.downloadingId) return;
    const offlineId = `breathwork:${session.id}`;
    if (offline.downloadedIds.has(offlineId)) {
      navigate("/offline-practices");
      return;
    }
    await offline.downloadPractice({
      id: offlineId,
      name: session.name,
      element: session.element || "Air",
      category: "breathwork",
      duration_minutes: session.duration_minutes,
      steps: buildBreathworkSteps(session),
    });
  };
  const finalizeCheckoutIfPresent = premium.finalizeCheckoutIfPresent;
  const setPremiumFilter = engine.setPremiumFilter;

  useEffect(() => {
    finalizeCheckoutIfPresent({ search: window.location.search });
  }, [finalizeCheckoutIfPresent]);

  const premiumBreathworkUnlocked = premium.isSectionUnlocked("premium_breathwork");

  useEffect(() => {
    if (catalogMode === "free") {
      setPremiumFilter(false);
      return;
    }
    setPremiumFilter(true);
  }, [catalogMode, setPremiumFilter]);

  const fullAppProduct = premium.findProduct("full_app_unlock");

  const premiumSessionCount = useMemo(
    () => (engine.allSessions || []).filter((session) => Boolean(session.is_premium)).length,
    [engine.allSessions],
  );

  const canAccessSession = (session) => {
    if (!session?.is_premium) return true;
    return premiumBreathworkUnlocked;
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/breathwork",
    });
  };

  return (
    <div className="min-h-screen bg-background relative" data-testid="breathwork">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url(${getBreathworkImage({ id: "breathwork-hero", element: "Air", name: "Breathwork Hero" })})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-testid="breathwork-page-background-image"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/92 to-background" data-testid="breathwork-page-background-overlay" />
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => (engine.activeSession ? engine.closeSession() : navigate("/dashboard"))}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice</p>
              <h1 className="text-xl font-serif">Breathwork <span className="italic text-primary">Sessions</span></h1>
            </div>
          </div>

          {!engine.activeSession && (
            <Select value={engine.selectedElement} onValueChange={engine.setSelectedElement}>
              <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {BREATHWORK_ELEMENTS.map((element) => (
                  <SelectItem key={element} value={element}>
                    {element === "all" ? "All Elements" : element}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-6">
        {!engine.activeSession && (
          <section className="mb-6 rounded-2xl border border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 via-pink-500/10 to-background p-4" data-testid="breathwork-premium-banner">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-fuchsia-200/90">Premium Breathlove</p>
                <h2 className="text-lg font-serif flex items-center gap-2">
                  <Crown className="w-4 h-4 text-fuchsia-300" />
                  Heart-coherence + self-love rituals
                </h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="breathwork-premium-banner-description">
                  {premiumSessionCount} advanced Breathlove sessions available. {premiumBreathworkUnlocked ? "Unlocked for your account." : "Continue freely first, then upgrade anytime."}
                </p>
                <p className="text-xs text-fuchsia-100/70 mt-1" data-testid="breathwork-devotional-note">
                  Breathe as ceremony: regulate first, move at the speed of safety, then embody one real-life integration step.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Tabs value={catalogMode} onValueChange={setCatalogMode}>
                  <TabsList className="bg-black/30 border border-white/10" data-testid="breathwork-catalog-tabs">
                    <TabsTrigger value="all" data-testid="breathwork-catalog-tab-all">All</TabsTrigger>
                    <TabsTrigger value="free" data-testid="breathwork-catalog-tab-free">Free</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="hidden" />
                  <TabsContent value="free" className="hidden" />
                </Tabs>

                {!premiumBreathworkUnlocked && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      className="border-cyan-400/40 text-cyan-100"
                      onClick={() => navigate("/pricing")}
                      data-testid="breathwork-view-subscription-button"
                    >
                      Sacred Access
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {engine.activeSession ? (
          <BreathworkActiveSessionView
            activeSession={engine.activeSession}
            isPlaying={engine.isPlaying}
            breathPhase={engine.breathPhase}
            phaseProgress={engine.phaseProgress}
            cycleCount={engine.cycleCount}
            soundEnabled={engine.soundEnabled}
            selectedSound={engine.selectedSound}
            setSelectedSound={engine.setSelectedSound}
            pace={engine.pace}
            setPace={engine.setPace}
            paceMultiplier={engine.paceMultiplier}
            togglePlay={engine.togglePlay}
            resetSession={engine.resetSession}
            toggleSound={engine.toggleSound}
            getBreathCircleSize={engine.getBreathCircleSize}
            phaseLabels={PHASE_LABELS}
            elementColors={ELEMENT_COLORS}
            availableSoundOptions={engine.availableSoundOptions}
          />
        ) : engine.loading ? (
          <div className="flex items-center justify-center h-64" data-testid="breathwork-loading-state">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <BreathworkSessionGrid
            filteredSessions={engine.filteredSessions}
            elementColors={ELEMENT_COLORS}
            startSession={engine.startSession}
            canAccessSession={canAccessSession}
            onLockedSessionSelect={setSelectedLockedSession}
            offlineDownloadedIds={offline.downloadedIds}
            offlineDownloadingId={offline.downloadingId}
            offlineDownloadProgress={offline.downloadProgress}
            onOfflineDownload={handleDownloadForOffline}
          />
        )}

        {selectedLockedSession && !premiumBreathworkUnlocked && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedLockedSession(null)}>
            <div
              className="w-full max-w-md rounded-2xl border border-fuchsia-500/30 bg-card p-6"
              onClick={(event) => event.stopPropagation()}
              data-testid="breathwork-premium-lock-modal"
            >
              <h3 className="text-2xl font-serif mb-2" data-testid="breathwork-premium-lock-title">{selectedLockedSession.name}</h3>
              <p className="text-sm text-muted-foreground mb-4" data-testid="breathwork-premium-lock-description">
                This is a Premium Breathlove ritual. Continue with Sacred Access membership.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/pricing")}
                  variant="outline"
                  className="flex-1 border-cyan-400/40 text-cyan-100"
                  data-testid="breathwork-premium-lock-subscription-button"
                >
                  Subscription
                </Button>
                <Button variant="outline" onClick={() => setSelectedLockedSession(null)} className="flex-1" data-testid="breathwork-premium-lock-close-button">
                  Not now
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Breathwork;
