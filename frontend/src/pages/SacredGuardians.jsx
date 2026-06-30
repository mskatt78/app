import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, X, Sparkles, Feather, Flame, Waves, Wind,
  Star, Moon, Heart, Eye, ChevronRight, Zap, Lock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

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

const SacredGuardians = ({ user, api }) => {
  const navigate = useNavigate();
  const [guardians, setGuardians] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="sacred-guardians-page">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/0191da63-58fb-4ee1-838d-801a94a094dc/images/ed68a7232984385ac7731392c7ad673cf719d7139109325a82dc4650afcb88a1.png"
            alt="Sacred Guardians"
            className="w-full h-full object-cover opacity-30"
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
            <p className="text-sm text-muted-foreground mt-1" data-testid="guardians-premium-banner-description">First guardians are free. Advanced guardians unlock with subscription or full app access.</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="guardians-premium-banner-subscription-button">View Subscription Plans</Button>
              <Button variant="outline" onClick={handleUnlockFullApp} disabled={premium.purchaseLoadingId === "full_app_unlock"} data-testid="guardians-premium-banner-fullapp-button">
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
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
                      src={guardian.image_url}
                      alt={guardian.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
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
                  src={selected.image_url}
                  alt={selected.name}
                  className="w-full h-full object-cover"
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

                {/* Sacred Message */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sacred Message
                  </h4>
                  <p className="text-foreground italic leading-relaxed">&ldquo;{selected.message}&rdquo;</p>
                </div>

                {/* Symbolism */}
                {selected.symbolism?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Symbolism & Meanings
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.symbolism.map((s, i) => (
                        <span key={`${selected.id || selected.name}-symbol-${String(s).slice(0, 24)}-${i}`} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spiritual Gifts */}
                {selected.spiritual_gifts?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      Spiritual Gifts
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.spiritual_gifts.map((gift, i) => (
                        <div key={`${selected.id || selected.name}-gift-${String(gift).slice(0, 24)}-${i}`} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{gift}</span>
                        </div>
                      ))}
                    </div>
                  </div>
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
            <p className="text-sm text-muted-foreground mb-4" data-testid="guardians-premium-lock-description">This guardian transmission is premium. Continue with subscription or full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="guardians-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="guardians-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedGuardian(null)} data-testid="guardians-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SacredGuardians;
