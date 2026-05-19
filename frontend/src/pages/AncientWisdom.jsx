import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, Sparkles, X, Flame, Droplets, Wind, Mountain,
  Globe, Atom, Sun, Moon, ChevronRight, Heart, Eye, Zap, Feather,
  BookOpen, Gem
} from "lucide-react";
import { Button } from "../components/ui/button";
import GuidedAudioButton from "../components/GuidedAudioButton";

const TRADITIONS = [
  { id: "all",          label: "All Traditions", icon: Globe,    color: "text-amber-400",   bg: "bg-amber-500/10",    border: "border-amber-500/20" },
  { id: "egyptian",     label: "Egyptian",       icon: Sun,      color: "text-yellow-400",  bg: "bg-yellow-500/10",   border: "border-yellow-500/20" },
  { id: "avalon",       label: "Avalon",         icon: Sparkles, color: "text-rose-400",    bg: "bg-rose-500/10",     border: "border-rose-500/20" },
  { id: "aboriginal",   label: "Aboriginal",     icon: Mountain, color: "text-orange-400",  bg: "bg-orange-500/10",   border: "border-orange-500/20" },
  { id: "celtic",       label: "Celtic",         icon: Feather,  color: "text-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/20" },
  { id: "peruvian",     label: "Peruvian",       icon: Flame,    color: "text-teal-400",    bg: "bg-teal-500/10",     border: "border-teal-500/20" },
  { id: "international",label: "International",  icon: Globe,    color: "text-violet-400",  bg: "bg-violet-500/10",   border: "border-violet-500/20" },
  { id: "lemurian",     label: "Lemurian/Mu",    icon: Droplets, color: "text-cyan-400",    bg: "bg-cyan-500/10",     border: "border-cyan-500/20" },
  { id: "atlantean",    label: "Atlantean",      icon: Gem,      color: "text-blue-400",    bg: "bg-blue-500/10",     border: "border-blue-500/20" },
  { id: "galactic",     label: "Galactic",       icon: Atom,     color: "text-indigo-400",  bg: "bg-indigo-500/10",   border: "border-indigo-500/20" },
];

const TRADITION_MAP = {
  egyptian:     { label: "Egyptian Alchemy",      color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  icon: Sun      },
  avalon:       { label: "Avalon Mysteries",      color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    icon: Sparkles },
  aboriginal:   { label: "Aboriginal Wisdom",     color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  icon: Mountain },
  celtic:       { label: "Celtic Alchemy",        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Feather  },
  peruvian:     { label: "Peruvian Alchemy",      color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20",    icon: Flame    },
  international:{ label: "International Wisdom",  color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: Globe    },
  lemurian:     { label: "Lemurian / Mu",         color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    icon: Droplets },
  atlantean:    { label: "Atlantean Alchemy",     color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: Gem      },
  galactic:     { label: "Galactic Energies",     color: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  icon: Atom     },
};

const AncientWisdom = ({ user, api }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await api.get("/ancient-wisdom");
        setEntries(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to fetch ancient wisdom:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [api]);

  useEffect(() => {
    if (activeTab === "all") setFiltered(entries);
    else setFiltered(entries.filter(e => e.tradition === activeTab));
  }, [activeTab, entries]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="ancient-wisdom-page">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://static.prod-images.emergentagent.com/jobs/0191da63-58fb-4ee1-838d-801a94a094dc/images/a0f2901affbdad2e83355fb4ece3d09eb63f134bedc6247f72a390b68e48fd17.png"
            alt="Ancient Wisdom"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400/80">Sacred Traditions</span>
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif mb-4">
              Ancient Wisdom <span className="italic text-primary">Traditions</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
              Journey through the sacred alchemical traditions of our world — Egyptian mysteries, Aboriginal Dreamtime,
              Celtic magic, Peruvian ceremonial wisdom, and the cosmic transmissions of Lemuria, Atlantis, and the Stars.
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-20 -mt-6">
        {/* Tradition Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {TRADITIONS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                data-testid={`filter-${t.id}`}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${isActive
                    ? `${t.bg} ${t.color} ${t.border} border scale-105 shadow-sm`
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((entry, i) => {
            const trad = TRADITION_MAP[entry.tradition] || TRADITION_MAP.egyptian;
            const Icon = trad.icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                onClick={() => setSelected(entry)}
                className={`cursor-pointer rounded-2xl overflow-hidden border group
                  ${trad.border} hover:scale-[1.03] transition-all duration-300`}
                data-testid={`entry-card-${entry.id}`}
              >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={entry.image_url}
                      alt={entry.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1
                      ${trad.bg} ${trad.color} border ${trad.border} backdrop-blur-sm`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className={`text-xs ${trad.color} mb-0.5`}>{trad.label}</p>
                      <h3 className="text-sm font-serif text-white font-semibold leading-tight">{entry.name}</h3>
                      {entry.title && (
                        <p className="text-xs text-white/50 mt-0.5 line-clamp-1">{entry.title}</p>
                      )}
                      <p className="text-[10px] text-cyan-300/90 mt-1" data-testid={`ancient-wisdom-integrity-${entry.id}`}>
                        {entry.content_integrity?.verified
                          ? `Verified references (${entry.content_integrity.references_count || 0})`
                          : "Curated content"}
                      </p>
                    </div>
                  </div>
                </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No entries found in this tradition.</p>
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
              data-testid="wisdom-detail-modal"
            >
              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden rounded-t-3xl">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
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
                    const trad = TRADITION_MAP[selected.tradition] || TRADITION_MAP.egyptian;
                    const Icon = trad.icon;
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs mb-2 ${trad.bg} ${trad.color} border ${trad.border}`}>
                        <Icon className="w-3 h-3" />
                        {trad.label}
                      </div>
                    );
                  })()}
                  <h2 className="text-3xl font-serif text-white">{selected.name}</h2>
                  {selected.title && <p className="text-sm text-white/60 mt-1 italic">{selected.title}</p>}
                  {selected.element && <p className="text-xs text-white/40 mt-0.5">Element: {selected.element}</p>}
                  {formatReviewedDate(selected.content_integrity?.last_reviewed_at) && (
                    <p className="text-xs text-cyan-300/90 mt-1" data-testid="ancient-wisdom-reviewed-at">
                      Last reviewed: {formatReviewedDate(selected.content_integrity?.last_reviewed_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{selected.description}</p>

                {selected.expanded_context && (
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <p className="text-xs uppercase tracking-widest text-cyan-300 mb-2">Expanded Context</p>
                    <p className="text-sm text-cyan-100/90 leading-relaxed">{selected.expanded_context}</p>
                  </div>
                )}

                {/* Sacred Message / Invocation */}
                {selected.message && (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                    <h4 className="text-xs uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sacred Message
                    </h4>
                    <p className="text-foreground italic leading-relaxed">"{selected.message}"</p>
                  </div>
                )}

                {selected.invocation && (
                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      Sacred Mantra / Invocation
                    </h4>
                    <p className="text-sm italic text-muted-foreground leading-relaxed">"{selected.invocation}"</p>
                    <div className="mt-3">
                      <GuidedAudioButton
                        api={api}
                        script={`Sacred invocation for ${selected.name}: ${selected.invocation}`}
                        label="Listen to Sacred Invocation"
                        voice="nova"
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Teachings */}
                {selected.teachings?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Sacred Teachings
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selected.teachings.map((teaching) => (
                        <span key={`teaching-${selected.id}-${teaching.slice(0, 40)}`} className="px-3 py-1 rounded-full bg-white/5 text-xs text-muted-foreground border border-white/10">{teaching}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sacred Tools */}
                {selected.sacred_tools?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      Sacred Tools & Offerings
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selected.sacred_tools.map((tool) => (
                        <div key={`tool-${selected.id}-${tool.slice(0, 40)}`} className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ceremony / Ritual Steps */}
                {selected.practice?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Ceremony / Ritual Steps
                    </h4>
                    <ol className="space-y-2">
                      {selected.practice.map((step, i) => (
                        <li key={`practice-${selected.id}-${step.slice(0, 40)}`} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xs text-rose-400 flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3">
                      <GuidedAudioButton
                        api={api}
                        script={`${selected.name} ceremony. ${selected.practice.map((s,i)=>`Step ${i+1}: ${s}`).join(". ")}`}
                        label="Listen to Ceremony Steps"
                        voice="nova"
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Crystals */}
                {selected.crystals?.length > 0 && (
                  <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <p className="text-xs text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5" />
                      Crystal Allies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selected.crystals.map((crystal) => (
                        <span key={`wisdom-crystal-${selected.id}-${String(crystal).toLowerCase()}`} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">{crystal}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chakra */}
                {selected.chakra && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                    <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-indigo-400 uppercase tracking-wider">Chakra Connection</p>
                      <p className="text-sm font-medium mt-0.5">{selected.chakra}</p>
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => setSelected(null)} data-testid="close-wisdom-btn">
                  Return to Traditions
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AncientWisdom;
