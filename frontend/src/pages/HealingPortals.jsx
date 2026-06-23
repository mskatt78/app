import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, Flame, Heart, Loader2, Lock, Orbit, Shield, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { toast } from "sonner";

const sanitizeToList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const text = String(value || "").trim();
  return text ? [text] : [];
};

const safePortalKey = (scope, value) => `${scope}-${String(value || "").replace(/\s+/g, "-").toLowerCase()}`;

const HealingPortals = ({ user, api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portals, setPortals] = useState([]);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

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

  const loadSubscription = useCallback(async () => {
    if (!user) {
      setHasSubscription(false);
      setSubscriptionChecked(true);
      return;
    }

    try {
      const { data } = await api.get("/payments/subscription-status");
      setHasSubscription(Boolean(data?.is_subscribed));
    } catch {
      setHasSubscription(false);
    } finally {
      setSubscriptionChecked(true);
    }
  }, [api, user]);

  useEffect(() => {
    loadPortals();
    loadSubscription();
  }, [loadPortals, loadSubscription]);

  const displayedPortals = useMemo(
    () => [...portals].sort((a, b) => (a.id === "portal-womb-healing" ? -1 : b.id === "portal-womb-healing" ? 1 : 0)),
    [portals]
  );

  const canAccessPortal = useCallback(
    (portal) => {
      if (!portal?.is_premium) return true;
      return Boolean(user && hasSubscription);
    },
    [user, hasSubscription]
  );

  return (
    <div className="min-h-screen bg-background" data-testid="healing-portals-page">
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
                <motion.button
                  key={portal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => setSelectedPortal(portal)}
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
                    ) : null}
                  </div>
                </motion.button>
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
                <PortalSection icon={Shield} title="Integration" items={sanitizeToList(selectedPortal.integration_practices)} testId="healing-portal-integration-section" />

                {!canAccessPortal(selectedPortal) ? (
                  <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4" data-testid="healing-portal-premium-lock-panel">
                    <p className="text-sm text-fuchsia-100 mb-3">
                      <Lock className="inline w-4 h-4 mr-1" /> This portal is part of Premium Membership.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => navigate("/pricing")} className="bg-fuchsia-500 hover:bg-fuchsia-600" data-testid="healing-portal-upgrade-button">
                        Unlock Membership
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
                    {!subscriptionChecked ? (
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
        {items.map((item) => (
          <li key={safePortalKey(testId, item)} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-amber-300">✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default HealingPortals;
