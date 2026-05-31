import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, X, Sparkles, Feather, Flame, Waves, Wind,
  Star, Moon, Heart, Eye, ChevronRight, Zap
} from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";

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
              medicine for your soul's journey.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16 -mt-6">
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
              return (
                <motion.div
                  key={guardian.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelected(guardian)}
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
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-serif text-white font-semibold leading-tight">{guardian.name}</h3>
                      <p className={`text-xs ${catInfo.color} mt-0.5`}>{catInfo.label}</p>
                      <p className="text-[10px] text-cyan-300/90 mt-1" data-testid={`guardian-integrity-${guardian.id}`}>
                        {guardian.content_integrity?.verified
                          ? `Verified references (${guardian.content_integrity.references_count || 0})`
                          : "Curated content"}
                      </p>
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
                  <p className="text-foreground italic leading-relaxed">"{selected.message}"</p>
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
    </div>
  );
};

export default SacredGuardians;
