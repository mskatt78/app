import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, X, Sparkles, Feather, Flame, Waves, Wind,
  Star, Moon, Heart, Eye, ChevronRight, Zap, Lock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { appLogger } from "../utils/logger";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { getGuardianImage } from "../utils/shamanicImageTheme";

const FALLBACK_GUARDIAN_IMAGE = getGuardianImage({ id: "guardian-fallback", category: "guardian", name: "Guardian Fallback" });

const CATEGORIES = [
  { id: "all", label: "All Guardians", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "power_animal", label: "Power Animals", icon: Feather, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "spirit_animal", label: "Spirit Animals", icon: Star, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { id: "dragon_energy", label: "Dragon Energy", icon: Flame, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { id: "angel", label: "Angels", icon: Zap, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { id: "familiar", label: "Familiars", icon: Moon, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "messenger", label: "Messengers", icon: Wind, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
];

const CATEGORY_MAP = {
  power_animal: { label: "Power Animal", icon: Feather, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  spirit_animal: { label: "Spirit Animal", icon: Star, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  dragon_energy: { label: "Dragon Energy", icon: Flame, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  angel: { label: "Angel", icon: Zap, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  familiar: { label: "Familiar", icon: Moon, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  messenger: { label: "Messenger", icon: Wind, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
};

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || "").trim()).filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
};

const GuardianCollapsibleSection = ({ sectionId, title, icon: Icon, testId, children }) => (
  <Accordion type="single" collapsible className="rounded-xl border border-white/10 bg-white/[0.03]" data-testid={testId}>
    <AccordionItem value={sectionId} className="border-b-0">
      <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline" data-testid={`${testId}-trigger`}>
        <span className="inline-flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4" data-testid={`${testId}-content`}>
        {children}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const SacredGuardians = ({ user, api }) => {
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [selectedLockedGuardian, setSelectedLockedGuardian] = useState(null);
  const premium = usePremiumAccess({ api, user });
  const guardiansUnlocked = premium.isSectionUnlocked("sacred_guardians");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    const fetchGuardians = async () => {
      try {
        const response = await api.get("/sacred-guardians");
        setGuardians(response.data);
        setFiltered(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch sacred guardians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardians();
  }, [api]);

  useEffect(() => {
    if (activeCategory === "all") {
      setFiltered(guardians);
    } else {
      setFiltered(guardians.filter(g => g.category === activeCategory));
    }
  }, [activeCategory, guardians]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const canAccessGuardian = (guardian) => !guardian?.is_premium || guardiansUnlocked;

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/sacred-guardians",
    });
  };

  const resolveGuardianRitual = (guardian) => {
    if (Array.isArray(guardian?.ritual) && guardian.ritual.length) return guardian.ritual;
    if (Array.isArray(guardian?.rituals) && guardian.rituals.length) return guardian.rituals;
    if (Array.isArray(guardian?.how_to_connect) && guardian.how_to_connect.length) return guardian.how_to_connect;
    return [];
  };

  const resolveGuardianCeremony = (guardian) => {
    if (Array.isArray(guardian?.ceremony) && guardian.ceremony.length) return guardian.ceremony;
    if (Array.isArray(guardian?.ceremonies) && guardian.ceremonies.length) return guardian.ceremonies;
    return resolveGuardianRitual(guardian).slice(0, 3).map((line, index) => `Ceremony ${index + 1}: ${line}`);
  };

  const resolveGuardianGuided = (guardian) => {
    if (Array.isArray(guardian?.guided_practice) && guardian.guided_practice.length) return guardian.guided_practice;
    if (Array.isArray(guardian?.practice) && guardian.practice.length) return guardian.practice;
    return resolveGuardianRitual(guardian).slice(0, 3).map((line, index) => `Guided phase ${index + 1}: ${line}`);
  };

  const resolveGuardianAlchemy = (guardian) => {
    if (Array.isArray(guardian?.alchemy) && guardian.alchemy.length) return guardian.alchemy;
    if (Array.isArray(guardian?.alchemy_teachings) && guardian.alchemy_teachings.length) return guardian.alchemy_teachings;
    return [];
  };

  const resolveGuardianEmbodimentPrompts = (guardian) => {
    const direct = toList(guardian?.embodiment_prompts);
    if (direct.length) return direct;
    return toList(guardian?.embodiment);
  };

  const resolveGuardianIntegrationActions = (guardian) => toList(guardian?.integration_actions);

  const resolveGuardianNervousSystemCues = (guardian) => toList(guardian?.nervous_system_cues);

  const resolveGuardianSafetyNotes = (guardian) => toList(guardian?.safety_notes);

  const resolveGuardianWhyHeals = (guardian) => toList(guardian?.why_this_heals);

  const handleGuardianImageError = (event) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied === "true") return;
    target.dataset.fallbackApplied = "true";
    target.src = FALLBACK_GUARDIAN_IMAGE;
  };

  const startGuardianGuidedPractice = (guardian) => {
    if (!guardian) return;
    const guidedSteps = resolveGuardianGuided(guardian);
    if (!guidedSteps.length) return;

    setGuidedPractice({
      id: `guardian-guided-${guardian.id || guardian.name || "practice"}`,
      name: `${guardian.name} · Guided Guardian Journey`,
      category: "sacred_guardians",
      element: guardian.element || "Spirit",
      duration_minutes: 15,
      description: guardian.description || "",
      steps: guidedSteps,
    });
    setSelected(null);
  };

  const handleExitGuardianGuidedPractice = () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "sacred_guardians",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 15,
      element: completed.element || "Spirit",
      notes: `Completed guided guardian journey: ${completed.name}`,
    }).catch(() => {
      // silent tracking failure
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="sacred-guardians-page">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={handleExitGuardianGuidedPractice}
      />

      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getGuardianImage({ id: "guardian-hero", category: "angel", name: "Guardian Hero" })}
            alt="Sacred Guardians"
            className="w-full h-full object-cover opacity-30"
            onError={handleGuardianImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-16">
          <button
            data-testid="back-btn"
            onClick={() => navigate("/menu")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Menu</span>
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-6 h-6 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400/80">Sacred Temple</span>
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif mb-4">
              Sacred Guardians <span className="italic text-primary">&amp; Allies</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              Discover your spirit allies across the unseen realms — power animals, dragon energies,
              angelic presences, familiars, and sacred messengers. Each carries unique wisdom and
              medicine for your soul&apos;s journey.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16 -mt-6">
        {!guardiansUnlocked && (
          <section className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4" data-testid="guardians-premium-banner">
            <p className="text-xs uppercase tracking-wider text-amber-200/80">Sacred Guardians Premium</p>
            <p className="text-sm text-muted-foreground mt-1" data-testid="guardians-premium-banner-description">First guardians are free. Advanced guardians unlock with Sacred Access membership.</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="guardians-premium-banner-subscription-button">Sacred Access</Button>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                data-testid={`filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isActive
                    ? `${cat.bg} ${cat.color} ${cat.border} border scale-105`
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </motion.div>

        {/* Guardians Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((guardian, index) => {
              const catInfo = CATEGORY_MAP[guardian.category] || CATEGORY_MAP.power_animal;
              const Icon = catInfo.icon;
              const guardianCardKey = `${guardian.id || guardian.name || "guardian"}-${index}`;
              return (
                <motion.div
                  key={guardianCardKey}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (!canAccessGuardian(guardian)) {
                      setSelectedLockedGuardian(guardian);
                      return;
                    }
                    setSelected(guardian);
                  }}
                  className={`cursor-pointer rounded-2xl overflow-hidden border group
                    ${catInfo.border} hover:scale-[1.03] transition-all duration-300`}
                  data-testid={`guardian-card-${guardian.id}`}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={getGuardianImage(guardian)}
                      alt={guardian.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={handleGuardianImageError}
                      data-testid={`guardian-image-${guardian.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                      ${catInfo.bg} ${catInfo.color} border ${catInfo.border} backdrop-blur-sm`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    {guardian.is_premium && !canAccessGuardian(guardian) && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-300/40 backdrop-blur-sm" data-testid={`guardian-premium-badge-${guardian.id}`}>
                        Premium
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-serif text-white font-semibold leading-tight">{guardian.name}</h3>
                      <p className={`text-xs ${catInfo.color} mt-0.5`}>{catInfo.label}</p>
                      {guardian.content_integrity?.verified && (
                        <p className="text-[10px] text-cyan-300/90 mt-1" data-testid={`guardian-integrity-${guardian.id}`}>
                          Verified references ({guardian.content_integrity.references_count || 0})
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No guardians found in this category.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-background border border-white/10"
              data-testid="guardian-detail-modal"
            >
              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl sm:rounded-t-3xl">
                <img
                  src={getGuardianImage(selected, 1)}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                  onError={handleGuardianImageError}
                  data-testid="guardian-detail-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                  data-testid="close-modal-btn"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-12">
                  {(() => {
                    const catInfo = CATEGORY_MAP[selected.category] || CATEGORY_MAP.power_animal;
                    const Icon = catInfo.icon;
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-2
                        ${catInfo.bg} ${catInfo.color} border ${catInfo.border}`}>
                        <Icon className="w-3 h-3" />
                        {catInfo.label}
                      </div>
                    );
                  })()}
                  <h2 className="text-3xl font-serif text-white">{selected.name}</h2>
                  {selected.element && (
                    <p className="text-sm text-white/60 mt-1">Element: {selected.element}</p>
                  )}
                  {formatReviewedDate(selected.content_integrity?.last_reviewed_at) && (
                    <p className="text-xs text-cyan-300/90 mt-1" data-testid="guardian-reviewed-at">
                      Last reviewed: {formatReviewedDate(selected.content_integrity?.last_reviewed_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{selected.description}</p>

                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20" data-testid="guardian-discernment-note">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Meet this guardian as a spiritual, symbolic or imaginal ally. Keep what feels meaningful, stay curious rather than forcing a message, and distinguish personal intuition from factual claims about an animal, culture or tradition.
                  </p>
                </div>

                {(selected.devotional_invocation || selected.embodiment_prompt || selected.integration_vow) && (
                  <div className="p-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/25" data-testid="guardian-devotional-panel">
                    <h4 className="text-xs uppercase tracking-wider text-fuchsia-200 mb-3">Devotional Embodiment Arc</h4>
                    {selected.devotional_invocation && (
                      <p className="text-sm text-fuchsia-50/95 leading-relaxed" data-testid="guardian-devotional-invocation">
                        <span className="text-fuchsia-200 mr-1">Invocation:</span>
                        {selected.devotional_invocation}
                      </p>
                    )}
                    {selected.embodiment_prompt && (
                      <p className="text-sm text-fuchsia-50/90 leading-relaxed mt-2" data-testid="guardian-devotional-embodiment-prompt">
                        <span className="text-fuchsia-200 mr-1">Embodiment prompt:</span>
                        {selected.embodiment_prompt}
                      </p>
                    )}
                    {selected.integration_vow && (
                      <p className="text-sm text-fuchsia-50/90 leading-relaxed mt-2" data-testid="guardian-devotional-integration-vow">
                        <span className="text-fuchsia-200 mr-1">Integration vow:</span>
                        {selected.integration_vow}
                      </p>
                    )}
                  </div>
                )}

                {resolveGuardianWhyHeals(selected).length > 0 && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/25" data-testid="guardian-why-this-heals">
                    <h4 className="text-[11px] uppercase tracking-wider text-cyan-200 mb-2">How This May Support You</h4>
                    <ul className="space-y-1.5">
                      {resolveGuardianWhyHeals(selected).slice(0, 5).map((line, index) => (
                        <li key={`guardian-why-${index}`} className="text-sm leading-relaxed text-cyan-50/95 flex items-start gap-2">
                          <span>✦</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contemplative Message */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Contemplative Message
                  </h4>
                  <p className="text-foreground italic leading-relaxed">&ldquo;{selected.message}&rdquo;</p>
                </div>

                {/* Symbolism */}
                {selected.symbolism?.length > 0 && (
                  <GuardianCollapsibleSection
                    sectionId="symbolism"
                    title="Symbolism & Meanings"
                    icon={Eye}
                    testId="guardian-symbolism-collapsible"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selected.symbolism.map((s, i) => (
                        <span key={`${selected.id || selected.name}-symbol-${String(s).slice(0, 24)}-${i}`} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </GuardianCollapsibleSection>
                )}

                {/* Spiritual Gifts */}
                {selected.spiritual_gifts?.length > 0 && (
                  <GuardianCollapsibleSection
                    sectionId="spiritual-gifts"
                    title="Spiritual Gifts"
                    icon={Star}
                    testId="guardian-spiritual-gifts-collapsible"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selected.spiritual_gifts.map((gift, i) => (
                        <div key={`${selected.id || selected.name}-gift-${String(gift).slice(0, 24)}-${i}`} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{gift}</span>
                        </div>
                      ))}
                    </div>
                  </GuardianCollapsibleSection>
                )}

                {/* How to Connect */}
                {selected.how_to_connect?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      How to Connect
                    </h4>
                    <ol className="space-y-2">
                      {selected.how_to_connect.map((step, i) => (
                        <li key={`${selected.id || selected.name}-step-${String(step).slice(0, 24)}-${i}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xs text-rose-400 flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Chakra */}
                {selected.chakra && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-violet-400 uppercase tracking-wider">Chakra Connection</p>
                      <p className="text-sm font-medium mt-0.5">{selected.chakra}</p>
                    </div>
                  </div>
                )}

                {resolveGuardianAlchemy(selected).length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30" data-testid="guardian-alchemy-teachings">
                    <h4 className="text-[11px] uppercase tracking-wider text-indigo-200 mb-2">Alchemy Teachings</h4>
                    <ul className="space-y-1.5">
                      {resolveGuardianAlchemy(selected).slice(0, 6).map((line, index) => (
                        <li key={`guardian-alchemy-${index}`} className="text-sm leading-relaxed text-indigo-50/95 flex items-start gap-2">
                          <span>✦</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resolveGuardianCeremony(selected).length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30" data-testid="guardian-ceremony-list">
                    <h4 className="text-[11px] uppercase tracking-wider text-amber-200 mb-2">Ceremonial Arc</h4>
                    <ol className="space-y-1.5">
                      {resolveGuardianCeremony(selected).slice(0, 6).map((line, index) => (
                        <li key={`guardian-ceremony-${index}`} className="text-sm leading-relaxed text-amber-50/95 flex items-start gap-2">
                          <span className="text-amber-300">{index + 1}.</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {resolveGuardianGuided(selected).length > 0 && (
                  <div className="p-4 rounded-xl bg-cyan-500/15 border border-cyan-500/30" data-testid="guardian-guided-practice-arc">
                    <h4 className="text-[11px] uppercase tracking-wider text-cyan-200 mb-2">Guided Practice Arc</h4>
                    <ol className="space-y-1.5">
                      {resolveGuardianGuided(selected).slice(0, 6).map((line, index) => (
                        <li key={`guardian-guided-${index}`} className="text-sm leading-relaxed text-cyan-50/95 flex items-start gap-2">
                          <span className="text-cyan-300">{index + 1}.</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ol>
                    <Button
                      className="w-full mt-3"
                      onClick={() => startGuardianGuidedPractice(selected)}
                      data-testid="guardian-start-guided-practice-button"
                    >
                      Begin Guided Practice
                    </Button>
                  </div>
                )}

                {resolveGuardianEmbodimentPrompts(selected).length > 0 && (
                  <GuardianCollapsibleSection
                    sectionId="embodiment-prompts"
                    title="Embodiment Prompts"
                    icon={Heart}
                    testId="guardian-embodiment-prompts-collapsible"
                  >
                    <ul className="space-y-1.5">
                      {resolveGuardianEmbodimentPrompts(selected).slice(0, 6).map((line, index) => (
                        <li key={`guardian-embodiment-${index}`} className="text-sm leading-relaxed text-emerald-50/95 flex items-start gap-2">
                          <span className="text-emerald-300">{index + 1}.</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </GuardianCollapsibleSection>
                )}

                {resolveGuardianIntegrationActions(selected).length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-500/12 border border-amber-500/25" data-testid="guardian-integration-actions">
                    <h4 className="text-[11px] uppercase tracking-wider text-amber-200 mb-2">Integration Actions</h4>
                    <ul className="space-y-1.5">
                      {resolveGuardianIntegrationActions(selected).slice(0, 6).map((line, index) => (
                        <li key={`guardian-integration-${index}`} className="text-sm leading-relaxed text-amber-50/95 flex items-start gap-2">
                          <span className="text-amber-300">✓</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(resolveGuardianNervousSystemCues(selected).length > 0 || resolveGuardianSafetyNotes(selected).length > 0) && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25" data-testid="guardian-safety-regulation-panel">
                    <h4 className="text-[11px] uppercase tracking-wider text-rose-200 mb-2">Safety & Nervous-System Guidance</h4>
                    {resolveGuardianNervousSystemCues(selected).length > 0 && (
                      <ul className="space-y-1.5 mb-2">
                        {resolveGuardianNervousSystemCues(selected).slice(0, 5).map((line, index) => (
                          <li key={`guardian-cue-${index}`} className="text-sm leading-relaxed text-rose-50/95 flex items-start gap-2">
                            <span>•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {resolveGuardianSafetyNotes(selected).length > 0 && (
                      <p className="text-xs text-rose-100/90 leading-relaxed" data-testid="guardian-safety-notes">
                        {resolveGuardianSafetyNotes(selected).join(" ")}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => setSelected(null)}
                  data-testid="close-guardian-btn"
                >
                  Return to Guardians
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedLockedGuardian && !guardiansUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="guardians-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Guardian</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="guardians-premium-lock-title">{selectedLockedGuardian.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="guardians-premium-lock-description">This guardian transmission is premium. Continue with Sacred Access membership.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="guardians-premium-lock-subscription-button">Sacred Access</Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedGuardian(null)} data-testid="guardians-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SacredGuardians;
