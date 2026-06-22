import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, Flame, Waves, Wind, Shield, X, Feather, Star, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";

const TABS = [
  { id: "allies", label: "Sacred Ally Alchemy", icon: Flame },
  { id: "angelic", label: "Angelic Alchemy", icon: Shield },
];

const FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "dragon", label: "Dragon", icon: Flame },
  { id: "fairies", label: "Fairies", icon: Wind },
  { id: "wolves", label: "Wolves", icon: Feather },
  { id: "whales", label: "Whales", icon: Waves },
  { id: "dolphins", label: "Dolphins", icon: Star },
  { id: "sacred_allies", label: "Other Sacred Allies", icon: Sparkles },
];

const AngelicBadge = ({ value }) => (
  <span className="px-2 py-1 rounded-full text-[11px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200" data-testid="angelic-geometry-badge">
    {value}
  </span>
);

const SectionList = ({ title, icon: Icon, items, testId }) => (
  <div className="space-y-2" data-testid={testId}>
    <h4 className="text-sm font-medium flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" /> {title}
    </h4>
    <ul className="space-y-2">
      {items?.map((item, idx) => (
        <li key={`${title}-${idx}-${String(item).slice(0, 20)}`} className="flex items-start gap-2 text-sm text-muted-foreground">
          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default function SacredAllyAlchemy({ api }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("allies");
  const [loading, setLoading] = useState(true);
  const [allyFilter, setAllyFilter] = useState("all");
  const [allies, setAllies] = useState([]);
  const [angelic, setAngelic] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [alliesRes, angelicRes] = await Promise.all([
          api.get("/sacred-ally-alchemy"),
          api.get("/angelic-alchemy"),
        ]);
        setAllies(Array.isArray(alliesRes.data) ? alliesRes.data : []);
        setAngelic(Array.isArray(angelicRes.data) ? angelicRes.data : []);
      } catch (error) {
        appLogger.error("Failed loading Sacred Ally Alchemy", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filteredAllies = useMemo(() => {
    if (allyFilter === "all") return allies;
    return allies.filter((item) => String(item.category || "").toLowerCase() === allyFilter);
  }, [allies, allyFilter]);

  const cards = tab === "allies" ? filteredAllies : angelic;

  return (
    <div className="min-h-screen bg-background" data-testid="sacred-ally-alchemy-page">
      <header className="border-b border-white/10 bg-card/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="sacred-ally-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Sacred Temple</p>
            <h1 className="text-xl sm:text-2xl font-serif">Sacred Ally & Angelic <span className="italic text-primary">Alchemy</span></h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 via-background to-amber-900/20 p-5" data-testid="sacred-ally-hero-copy">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Work deeply with Dragon Alchemy, Fairies, Wolves, Whales with Song Lines, Dolphins, and expanded Sacred Allies — plus Angelic Alchemy including Metatron’s Cube and practical ritual pathways.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="sacred-ally-tabs">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                data-testid={`sacred-ally-tab-${item.id}`}
                className={`px-4 py-2 rounded-full text-sm border transition-all flex items-center gap-2 ${
                  active
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {tab === "allies" && (
          <div className="flex flex-wrap gap-2" data-testid="sacred-ally-filters">
            {FILTERS.map((item) => {
              const Icon = item.icon;
              const active = allyFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAllyFilter(item.id)}
                  data-testid={`sacred-ally-filter-${item.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-amber-500/15 border-amber-500/35 text-amber-200"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {item.label}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="h-56 rounded-2xl border border-white/10 bg-card/40 animate-pulse" data-testid="sacred-ally-loading" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="sacred-ally-grid">
            {cards.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="text-left rounded-2xl border border-white/10 bg-card/50 hover:bg-card/70 transition-all overflow-hidden"
                data-testid={`sacred-ally-card-${item.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full border border-white/20 bg-black/40 text-white/85" data-testid={`sacred-ally-card-category-${item.id}`}>
                    {item.category || item.ally_type || item.angelic_order}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-serif" data-testid={`sacred-ally-card-title-${item.id}`}>{item.name}</h3>
                  {item.sacred_geometry && <AngelicBadge value={item.sacred_geometry} />}
                  <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`sacred-ally-card-description-${item.id}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-background"
              data-testid="sacred-ally-detail-modal"
            >
              <div className="relative aspect-[16/7]">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70"
                  data-testid="sacred-ally-modal-close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-12">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">{selected.category || selected.ally_type || selected.angelic_order}</p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white" data-testid="sacred-ally-modal-title">{selected.name}</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {selected.sacred_geometry && (
                  <div data-testid="sacred-ally-modal-geometry-wrap">
                    <AngelicBadge value={`Sacred Geometry: ${selected.sacred_geometry}`} />
                  </div>
                )}

                <p className="text-sm text-muted-foreground" data-testid="sacred-ally-modal-description">{selected.description}</p>

                <SectionList title="Alchemy Teachings" icon={Sparkles} items={selected.alchemy_teachings} testId="sacred-ally-alchemy-teachings" />

                {selected.song_lines?.length > 0 && (
                  <SectionList title="Whale Song Lines" icon={Waves} items={selected.song_lines} testId="sacred-ally-song-lines" />
                )}

                {selected.song_line_practices?.length > 0 && (
                  <SectionList title="Song Line Practices" icon={Waves} items={selected.song_line_practices} testId="sacred-ally-song-line-practices" />
                )}

                <SectionList title={selected.practical_rituals ? "Practical Alchemy Rituals" : "Rituals"} icon={Flame} items={selected.practical_rituals || selected.rituals} testId="sacred-ally-rituals" />
                <SectionList title="Journal Prompts" icon={Feather} items={selected.journal_prompts} testId="sacred-ally-journal-prompts" />
                <SectionList title="Affirmations" icon={Star} items={selected.affirmations} testId="sacred-ally-affirmations" />

                <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-source-integrity">
                  <p className="text-xs text-muted-foreground mb-2">Source Integrity</p>
                  <p className="text-xs text-cyan-300/90">{selected.content_integrity?.verified ? `Verified references (${selected.content_integrity?.references_count || 0})` : "Curated reference set"}</p>
                  {selected.source_references?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {selected.source_references.slice(0, 3).map((ref) => (
                        <li key={ref}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline break-all" data-testid={`sacred-ally-source-ref-${selected.id}`}>
                            {ref}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button onClick={() => setSelected(null)} className="w-full" data-testid="sacred-ally-modal-close-bottom">
                  Return to Alchemy Library
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
