import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Flame, Heart, Loader2, Lock, Orbit, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import GuidedAudioButton from "../components/GuidedAudioButton";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { toast } from "sonner";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

const sanitizeToList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const text = String(value || "").trim();
  return text ? [text] : [];
};

const safePortalKey = (scope, value) => `${scope}-${String(value || "").replace(/\s+/g, "-").toLowerCase()}`;

const portalDeepLine = (sectionTitle, baseText, index) => {
  const text = String(baseText || "").trim();
  if (!text) return "";

  if (sectionTitle.toLowerCase().includes("ritual")) {
    return `Somatic practice ${index + 1}: complete this slowly, pausing every 90 seconds to track body signals and restore regulation before continuing.`;
  }
  if (sectionTitle.toLowerCase().includes("ceremon")) {
    return `Ceremonial anchor ${index + 1}: begin with consent and breath, perform the act in silence, and close by naming one concrete life commitment.`;
  }
  if (sectionTitle.toLowerCase().includes("integration")) {
    return `Aftercare protocol ${index + 1}: hydrate, orient, journal for 9 minutes, and complete one practical embodiment action in the next 24 hours.`;
  }
  return `Alchemy integration ${index + 1}: identify where this teaching applies today, then convert it into one compassionate boundary or aligned action.`;
};

const buildPortalMasterContainer = (portal) => {
  const teachings = sanitizeToList(portal?.alchemy_teachings);
  const rituals = sanitizeToList(portal?.rituals);
  const ceremonies = sanitizeToList(portal?.ceremonies);
  const integration = sanitizeToList(portal?.integration_practices);
  const safety = String(portal?.safety_notes || "Move at the speed of safety and support.").trim();

  return [
    {
      stage_id: "preparation",
      title: "Stage 1 · Preparation & Consent",
      duration: "10 min",
      steps: [
        `Invocation: ${portal?.opening_invocation || "I enter this portal with reverence and safety."}`,
        "Orient to your environment and establish body safety before deeper work.",
        safety,
      ],
    },
    {
      stage_id: "descent",
      title: "Stage 2 · Descent into Ritual",
      duration: "15-25 min",
      steps: [
        rituals[0] || "Begin with a grounding ritual and breathe slowly.",
        rituals[1] || "Complete the second ritual while tracking sensations.",
        rituals[2] || "Seal ritual descent with hand on heart and truthful naming.",
      ],
    },
    {
      stage_id: "embodiment",
      title: "Stage 3 · Embodiment Practice",
      duration: "20-30 min",
      steps: buildPortalEmbodimentPractices(portal),
    },
    {
      stage_id: "transformation",
      title: "Stage 4 · Ceremonial Transformation",
      duration: "20-35 min",
      steps: [
        ceremonies[0] || "Open the first ceremony with focused presence.",
        ceremonies[1] || "Move one pattern through transmutation and release.",
        ceremonies[2] || "Complete with vow and embodied closure.",
      ],
    },
    {
      stage_id: "integration",
      title: "Stage 5 · Integration (24 Hours + 7 Days)",
      duration: "1-7 days",
      steps: [
        teachings[0] || "Apply one key teaching in your next real-life challenge.",
        integration[0] || "Journal one insight and one concrete action before sleep.",
        ...buildPortalEmbodimentTimeline(portal),
      ],
    },
  ];
};

const buildPortalEmbodimentPractices = (portal) => {
  const portalName = String(portal?.name || "this portal").trim();

  return [
    `Somatic orientation (6 min): stand or sit with feet grounded, soften jaw/shoulders, and map where ${portalName} is felt in your body right now.`,
    "Breath + movement cycle (9 min): inhale 4 / exhale 6 while gently swaying or spinally undulating; pause every 90 seconds to note regulation changes.",
    "Voice embodiment (5 min): speak your ceremony intention aloud on exhale, then walk slowly for 1 minute integrating posture and breath.",
    "Action anchoring (4 min): choose one real-world boundary, conversation, or task to complete before sleep as embodied proof.",
  ];
};

const buildPortalEmbodimentTimeline = () => [
  "24h embodiment check: complete one visible action aligned with the portal insight.",
  "72h embodiment check: repeat breath-movement cycle and record changes in nervous-system response.",
  "7-day embodiment check: track one repeated behavior shift and one relationship or boundary shift.",
];

const HealingPortals = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portals, setPortals] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const premium = usePremiumAccess({ api, user });
  const finalizeCheckoutIfPresent = premium.finalizeCheckoutIfPresent;

  const loadPortals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/healing-portals");
      const sorted = (data || []).sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
      setPortals(sorted);
    } catch {
      toast.error("Unable to load healing portals");
      setPortals([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPortals();
  }, [loadPortals]);

  useEffect(() => {
    finalizeCheckoutIfPresent({ search: window.location.search });
  }, [finalizeCheckoutIfPresent]);

  const displayedPortals = useMemo(
    () => [...portals].sort((a, b) => (a.id === "portal-womb-healing" ? -1 : b.id === "portal-womb-healing" ? 1 : 0)),
    [portals]
  );

  const canAccessPortal = useCallback(
    (portal) => {
      if (!portal?.is_premium) return true;
      return premium.isSectionUnlocked("healing_portals");
    },
    [premium]
  );

  const startPortalGuidedPractice = useCallback((portal) => {
    const steps = [
      portal?.opening_invocation,
      portal?.description,
      ...sanitizeToList(portal?.alchemy_teachings),
      ...sanitizeToList(portal?.rituals),
      ...sanitizeToList(portal?.ceremonies),
      ...sanitizeToList(portal?.integration_practices),
    ].filter(Boolean);

    setGuidedPractice({
      id: `healing-portal-guided-${portal?.id || "session"}`,
      name: `${portal?.name || "Healing Portal"} Guided Practice`,
      category: "healing_portal",
      element: portal?.element || "Spirit",
      duration_minutes: portal?.duration_minutes || 20,
      steps: steps.length > 0 ? steps : ["Arrive, breathe, and complete one healing portal cycle with full embodied presence."],
    });
  }, []);

  const exitPortalGuidedPractice = useCallback(() => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "healing_portal",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 20,
      element: completed.element || "Spirit",
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success("Healing portal guided practice complete."))
      .catch(() => {
        // silent
      });
  }, [api, guidedPractice]);

  const fullAppProduct = premium.findProduct("full_app_unlock");
  const portalProduct = premium.findProduct("healing_portals");

  const handleUnlockPortals = async () => {
    await premium.startPurchase({
      productId: "healing_portals",
      returnPath: "/healing-portals",
    });
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/healing-portals",
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="healing-portals-page">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitPortalGuidedPractice}
      />

      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-amber-950/40 via-fuchsia-950/20 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="healing-portals-back-button">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Orbit className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif" data-testid="healing-portals-title">Healing Portals</h1>
              <p className="text-muted-foreground mt-1" data-testid="healing-portals-subtitle">Immersive ceremonial journeys for deep transformation</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10" data-testid="healing-portals-premium-banner">
            <p className="text-sm text-amber-100/90">
              <Crown className="inline w-4 h-4 mr-1" />
              Premium Portal Access: Womb · Shadow · Heart · Ancestral · Trauma
            </p>
            {!premium.isSectionUnlocked("healing_portals") && (
              <div className="mt-3 flex flex-wrap gap-2" data-testid="healing-portals-unlock-actions">
                <Button
                  onClick={handleUnlockPortals}
                  className="bg-fuchsia-500 hover:bg-fuchsia-600"
                  data-testid="healing-portals-unlock-section-button"
                  disabled={premium.purchaseLoadingId === "healing_portals" || premium.loading}
                >
                  {premium.purchaseLoadingId === "healing_portals" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : `Unlock Portals ${portalProduct?.price?.toFixed(2) || "69.00"}`}
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-400/40 text-amber-100"
                  onClick={handleUnlockFullApp}
                  data-testid="healing-portals-unlock-fullapp-button"
                  disabled={premium.purchaseLoadingId === "full_app_unlock" || premium.loading}
                >
                  {premium.purchaseLoadingId === "full_app_unlock" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening checkout...</> : <><Crown className="w-4 h-4 mr-2" />Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}</>}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24" data-testid="healing-portals-loading-state">
            <Loader2 className="w-9 h-9 animate-spin text-amber-300" />
          </div>
        ) : displayedPortals.length === 0 ? (
          <div className="text-center py-20" data-testid="healing-portals-empty-state">
            <Sparkles className="w-14 h-14 mx-auto mb-3 text-muted-foreground/40" />
            <h2 className="text-2xl font-serif mb-2">Portals are being prepared</h2>
            <p className="text-muted-foreground">Admin can add more portals from the admin collections.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="healing-portals-grid">
            {displayedPortals.map((portal, index) => {
              const locked = !canAccessPortal(portal);
              const ceremonies = sanitizeToList(portal.ceremonies);
              const rituals = sanitizeToList(portal.rituals);
              const teachings = sanitizeToList(portal.alchemy_teachings);

              return (
                <motion.div
                  key={portal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => setSelectedPortal(portal)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPortal(portal);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="text-left rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-amber-300/40 transition-all duration-300 overflow-hidden"
                  data-testid={`healing-portal-card-${portal.id}`}
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-200 border border-amber-500/20 capitalize" data-testid={`healing-portal-type-${portal.id}`}>
                        {portal.portal_type} portal
                      </span>
                      {portal.is_premium ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-200" data-testid={`healing-portal-premium-badge-${portal.id}`}>
                          Premium
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-xl font-serif" data-testid={`healing-portal-name-${portal.id}`}>{portal.name}</h3>
                    <p className="text-sm text-muted-foreground" data-testid={`healing-portal-tagline-${portal.id}`}>{portal.tagline || portal.description}</p>

                    <div className="space-y-1.5" data-testid={`healing-portal-preview-${portal.id}`}>
                      <p className="text-[11px] text-amber-100/90 line-clamp-1" data-testid={`healing-portal-alchemy-preview-${portal.id}`}>
                        ✦ Alchemy: {teachings[0] || "Deep transmutation and alignment."}
                      </p>
                      <p className="text-[11px] text-cyan-100/90 line-clamp-1" data-testid={`healing-portal-ritual-preview-${portal.id}`}>
                        🔥 Ritual: {rituals[0] || "Breath-led ritual grounding."}
                      </p>
                      <p className="text-[11px] text-fuchsia-100/90 line-clamp-1" data-testid={`healing-portal-ceremony-preview-${portal.id}`}>
                        🜂 Ceremony: {ceremonies[0] || "Ceremonial integration sequence."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-white/10">
                      <span data-testid={`healing-portal-duration-${portal.id}`}>{portal.duration_minutes || 20} min</span>
                      <span className="capitalize" data-testid={`healing-portal-element-${portal.id}`}>{portal.element || "Spirit"}</span>
                    </div>

                    {locked ? (
                      <div className="text-xs text-amber-300 flex items-center gap-1" data-testid={`healing-portal-locked-${portal.id}`}>
                        <Lock className="w-3.5 h-3.5" /> Membership required
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation();
                          startPortalGuidedPractice(portal);
                        }}
                        className="w-full mt-2 border-white/20"
                        data-testid={`healing-portal-card-start-guided-${portal.id}`}
                      >
                        Start Guided Practice
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPortal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedPortal(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-card"
              data-testid="healing-portal-detail-modal"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-serif" data-testid="healing-portal-detail-title">{selectedPortal.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1" data-testid="healing-portal-detail-description">{selectedPortal.description}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPortal(null)} data-testid="healing-portal-close-modal-button">Close</Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5" data-testid="healing-portal-detail-meta-duration">Duration: {selectedPortal.duration_minutes || 20} min</div>
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5 capitalize" data-testid="healing-portal-detail-meta-intensity">Intensity: {selectedPortal.intensity || "deep"}</div>
                </div>

                <PortalSection icon={Sparkles} title="Alchemy Teachings" items={sanitizeToList(selectedPortal.alchemy_teachings)} testId="healing-portal-alchemy-section" />
                <PortalSection icon={Flame} title="Rituals" items={sanitizeToList(selectedPortal.rituals)} testId="healing-portal-rituals-section" />
                <PortalSection icon={Heart} title="Ceremonies" items={sanitizeToList(selectedPortal.ceremonies)} testId="healing-portal-ceremonies-section" />
                <PortalSection icon={Orbit} title="Embodiment Practices" items={buildPortalEmbodimentPractices(selectedPortal)} testId="healing-portal-embodiment-section" />
                <PortalSection icon={Shield} title="Embodiment Integration Timeline" items={buildPortalEmbodimentTimeline(selectedPortal)} testId="healing-portal-embodiment-timeline-section" />
                <PortalSection icon={Shield} title="Integration" items={sanitizeToList(selectedPortal.integration_practices)} testId="healing-portal-integration-section" />

                <section className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-3" data-testid="healing-portal-master-container">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-300" />
                    Deep Transformational Healing Container
                  </h3>
                  <div className="space-y-3">
                    {buildPortalMasterContainer(selectedPortal).map((stage) => (
                      <div key={stage.stage_id} className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`healing-portal-master-stage-${stage.stage_id}`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm text-amber-100">{stage.title}</p>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">{stage.duration}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {stage.steps.map((step, idx) => (
                            <li key={`${stage.stage_id}-${idx}`} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-300">✦</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {!canAccessPortal(selectedPortal) ? (
                  <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4" data-testid="healing-portal-premium-lock-panel">
                    <p className="text-sm text-fuchsia-100 mb-3">
                      <Lock className="inline w-4 h-4 mr-1" /> This portal is part of Premium Membership.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleUnlockPortals} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="healing-portal-upgrade-button" disabled={premium.purchaseLoadingId === "healing_portals"}>
                        {premium.purchaseLoadingId === "healing_portals" ? "Opening checkout..." : "Unlock Portals"}
                      </Button>
                      <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="healing-portal-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                        {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : "Unlock Full App"}
                      </Button>
                      {!user ? (
                        <Button variant="outline" onClick={() => navigate("/")} data-testid="healing-portal-signin-button">
                          Sign In
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="healing-portal-guided-audio-panel">
                    <Button
                      onClick={() => startPortalGuidedPractice(selectedPortal)}
                      variant="outline"
                      className="w-full border-white/20"
                      data-testid="healing-portal-start-guided-overlay-button"
                    >
                      Start Guided Practice (Voice + Timer + Ambient)
                    </Button>
                    <GuidedAudioButton
                      api={api}
                      label="Play Guided Healing Portal"
                      practiceName={selectedPortal.name}
                      durationMinutes={selectedPortal.duration_minutes || 20}
                      element={selectedPortal.element || "Spirit"}
                      sourceTexts={[
                        selectedPortal.description,
                        selectedPortal.opening_invocation,
                        ...sanitizeToList(selectedPortal.alchemy_teachings),
                        ...sanitizeToList(selectedPortal.rituals),
                        ...sanitizeToList(selectedPortal.ceremonies),
                        ...sanitizeToList(selectedPortal.integration_practices),
                      ]}
                      script={[
                        selectedPortal.opening_invocation,
                        selectedPortal.description,
                        "Alchemy teachings:",
                        ...sanitizeToList(selectedPortal.alchemy_teachings),
                        "Ceremonial rituals:",
                        ...sanitizeToList(selectedPortal.rituals),
                        "Ceremonies:",
                        ...sanitizeToList(selectedPortal.ceremonies),
                        "Integration:",
                        ...sanitizeToList(selectedPortal.integration_practices),
                      ].filter(Boolean).join("\n\n")}
                      className="w-full"
                    />
                    {premium.loading ? (
                      <p className="text-xs text-muted-foreground" data-testid="healing-portal-subscription-checking">Checking premium access...</p>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PortalSection = ({ icon: Icon, title, items, testId }) => {
  if (!items?.length) return null;

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4" data-testid={testId}>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-amber-300" /> {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={safePortalKey(testId, item)} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="text-sm text-muted-foreground flex gap-2">
              <span className="text-amber-300">✦</span>
              <span>{item}</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed" data-testid={`${testId}-deep-line-${idx}`}>
              {portalDeepLine(title, item, idx)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HealingPortals;
