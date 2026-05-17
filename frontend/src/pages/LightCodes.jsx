import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Star, Eye, Hexagon, Square, X, Volume2, Zap, Globe } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

const categories = [
  {
    id: "sacred_geometry",
    name: "Sacred Geometry",
    icon: Hexagon,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "The mathematical patterns underlying all creation",
    philosophy: "These patterns teach that spirit is not separate from matter. Form itself can become a doorway into reverence, coherence, and direct contact with the intelligence of life.",
    lineage: "Egyptian temple science, Pythagorean schools, yantra traditions, and contemplative geometry",
    integration: "Best for restoring order when the mind feels scattered or spiritually overextended.",
  },
  {
    id: "ancient_alphabets",
    name: "Ancient Alphabets",
    icon: Square,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description: "Sacred symbols from ancient wisdom traditions",
    philosophy: "Sacred letters were once understood as powers — breaths, names, and vibrational keys. They shape the inner world before they ever become spoken language.",
    lineage: "Sanskrit mantra, Hebrew mysticism, hieroglyphic priesthoods, Ogham, Adinkra, and calligraphic traditions",
    integration: "Best for sound work, mantra, prayer, and remembering the body as a resonant instrument.",
  },
  {
    id: "light_language_symbols",
    name: "Light Language",
    icon: Star,
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    description: "Activational codes for spiritual awakening",
    philosophy: "These symbols work more through felt resonance than literal definition. They give the intuitive mind permission to speak in image, pulse, sensation, and subtle memory.",
    lineage: "Visionary healing arts, kundalini symbolism, sigil work, ecstatic devotion, and modern energy transmission",
    integration: "Best for inner activation work — but always grounded back into breath, body, and daily life.",
  },
  {
    id: "galactic_codes",
    name: "Galactic Codes",
    icon: Globe,
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    description: "Light transmissions from star systems & galactic civilizations",
    philosophy: "Star teachings become medicine when they expand identity without disconnecting us from Earth. They help the soul remember scale, perspective, and cosmic participation.",
    lineage: "Star lore, temple astronomy, navigational cosmologies, and contemporary galactic remembrance streams",
    integration: "Best when you need hope, perspective, and a wider frame for your life path.",
  },
  {
    id: "chakra_codes",
    name: "Chakra Activation",
    icon: Zap,
    color: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    description: "Sacred codes for each energy center from Earth Star to Stellar Gateway",
    philosophy: "The chakra map is profound because it refuses to split consciousness from the body. Every center is a spiritual lesson lived through sensation, emotion, voice, action, and awareness.",
    lineage: "Tantric subtle-body science, mantra yoga, integrative energy work, and embodied mysticism",
    integration: "Best for full-spectrum healing where grounding, emotion, voice, intuition, and spirit all need to come into relationship.",
  },
];

const modalTabs = [
  { id: "essence", label: "Essence" },
  { id: "why", label: "Why It Heals" },
  { id: "traditions", label: "Ancient Traditions" },
  { id: "practice", label: "Practice Guide" },
];

export default function LightCodes({ user, api }) {
  const navigate = useNavigate();
  const [lightCodes, setLightCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("sacred_geometry");
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [modalTab, setModalTab] = useState("essence");

  const contentRef = useRef(null);

  useEffect(() => {
    const fetchLightCodes = async () => {
      try {
        const response = await api.get("/light-codes");
        setLightCodes(response.data);
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      } catch (error) {
        console.error("Failed to fetch light codes:", error);
        toast.error("Could not load light codes");
      } finally {
        setLoading(false);
      }
    };

    fetchLightCodes();
  }, [api]);

  const activeCategoryInfo = useMemo(
    () => categories.find((category) => category.id === activeCategory),
    [activeCategory],
  );

  const currentSymbols = useMemo(() => {
    if (!lightCodes) return [];
    return lightCodes[activeCategory] || [];
  }, [activeCategory, lightCodes]);

  const openSymbol = (symbol) => {
    setModalTab("essence");
    setSelectedSymbol(symbol);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="light-codes">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="light-codes-back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Symbols</p>
              <h1 className="text-xl font-serif" data-testid="light-codes-heading">Light Codes & <span className="italic text-primary">Light Linguistics</span></h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground" data-testid="light-codes-count-badge">
            <span>{currentSymbols.length} transmissions</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{activeCategoryInfo?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(120,119,198,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.18),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(3,7,18,0.88))] px-6 py-10 sm:px-10 sm:py-14"
          data-testid="light-codes-hero"
        >
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Hexagon className="w-7 h-7 text-violet-400" />
                </div>
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">ॐ</span>
                </div>
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/40 mb-3">Symbol, sound, and subtle anatomy</p>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-[1.05] max-w-3xl">
                  Light Codes for the <span className="italic text-primary">body of consciousness</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed" data-testid="light-codes-hero-description">
                This temple gathers sacred geometry, temple alphabets, DNA helix transmissions, galactic remembrance, and chakra activations into one contemplative library. Each symbol now carries deeper healing philosophy, lineage context, and practice guidance — not just a surface meaning.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-codes-hero-card-lineage">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35 mb-2">Ancient stream</p>
                <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.lineage}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-codes-hero-card-focus">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35 mb-2">Why this category heals</p>
                <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.integration}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setSelectedSymbol(null);
                  setTimeout(() => contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }}
                className={`px-5 py-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
                  isActive
                    ? `${category.bg} ${category.color} border ${category.border} shadow-[0_0_0_1px_rgba(255,255,255,0.04)]`
                    : "bg-card/50 text-muted-foreground border border-white/5 hover:border-white/10 hover:-translate-y-0.5"
                }`}
                data-testid={`category-${category.id}`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs opacity-70 hidden sm:block">{category.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]" ref={contentRef}>
          <div className={`rounded-3xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-6`} data-testid="light-codes-category-philosophy">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Category philosophy</p>
            <h3 className="text-2xl font-serif mb-3">{activeCategoryInfo?.name}</h3>
            <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.philosophy}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-category-lineage">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Ancient lineage</p>
            <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.lineage}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-category-integration">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Integration note</p>
            <p className="text-sm text-white/75 leading-relaxed">{activeCategoryInfo?.integration}</p>
          </div>
        </div>

        {lightCodes?.linguistic_foundations?.length > 0 && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2" data-testid="light-codes-linguistic-foundations">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Linguistic foundations</p>
              <div className="space-y-3">
                {lightCodes.linguistic_foundations.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm font-medium text-foreground mb-1">{item.title}</p>
                    <p className="text-xs text-white/70 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6" data-testid="light-codes-lineage-notes">
              <p className="text-xs uppercase tracking-[0.28em] text-white/40 mb-3">Symbol lineage notes</p>
              <ul className="space-y-2">
                {(lightCodes.symbol_lineage_notes || []).map((note) => (
                  <li key={note} className="text-sm text-white/75 flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20" data-testid="light-codes-loading">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="light-codes-grid">
            {currentSymbols.map((symbol, index) => (
              <motion.button
                type="button"
                key={symbol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => openSymbol(symbol)}
                className={`group text-left rounded-[1.75rem] overflow-hidden border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} hover:-translate-y-1 transition-all duration-300`}
                data-testid={`light-code-card-${symbol.id}`}
              >
                {symbol.image_url ? (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={symbol.image_url}
                      alt={symbol.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      data-testid={`light-code-image-${symbol.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <span className="text-xl">{symbol.symbol || "✨"}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`aspect-[4/3] flex items-center justify-center ${activeCategoryInfo?.bg}`}>
                    <span className="text-7xl">{symbol.symbol || "✨"}</span>
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="text-xl font-serif group-hover:text-primary transition-colors" data-testid={`light-code-name-${symbol.id}`}>
                        {symbol.name}
                      </h3>
                      <div className={`flex items-center gap-1 text-sm ${activeCategoryInfo?.color}`}>
                        <Eye className="w-4 h-4" />
                        <span>Open</span>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed line-clamp-3" data-testid={`light-code-description-${symbol.id}`}>
                      {symbol.description || symbol.meaning}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {symbol.healing_lens && (
                      <span className="px-3 py-1 rounded-full bg-white/8 text-[11px] uppercase tracking-[0.18em] text-white/55" data-testid={`light-code-lens-${symbol.id}`}>
                        {symbol.healing_lens}
                      </span>
                    )}
                    {symbol.lineage && (
                      <span className="px-3 py-1 rounded-full bg-white/8 text-[11px] text-white/60" data-testid={`light-code-lineage-${symbol.id}`}>
                        {symbol.lineage.split("·")[0].trim()}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${activeCategoryInfo?.color}`} data-testid={`light-code-purpose-${symbol.id}`}>
                    {symbol.purpose || symbol.meaning}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center" data-testid="light-codes-wisdom-quote">
          <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary/50" />
          <blockquote className="text-lg font-serif italic text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            “Sacred symbols are not ornaments for belief. They are instruments for attention — ways the soul remembers pattern, proportion, lineage, and light.”
          </blockquote>
        </div>
      </main>

      <AnimatePresence>
        {selectedSymbol && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedSymbol(null)}
            data-testid="light-code-modal-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-[2rem] border border-white/10 bg-card"
              onClick={(event) => event.stopPropagation()}
              data-testid="light-code-modal"
            >
              <button
                onClick={() => setSelectedSymbol(null)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center z-10 border border-white/10"
                data-testid="light-code-modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[280px] lg:min-h-full">
                  {selectedSymbol.image_url ? (
                    <img
                      src={selectedSymbol.image_url}
                      alt={selectedSymbol.name}
                      className="w-full h-full object-cover lg:absolute lg:inset-0"
                      data-testid="light-code-modal-image"
                    />
                  ) : (
                    <div className={`h-full min-h-[280px] flex items-center justify-center ${activeCategoryInfo?.bg}`}>
                      <span className="text-8xl">{selectedSymbol.symbol || "✨"}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
                    <div className="inline-flex items-center gap-3 rounded-full bg-black/45 px-4 py-2 border border-white/10 backdrop-blur-md">
                      <span className="text-2xl">{selectedSymbol.symbol || "✨"}</span>
                      <span className="text-sm text-white/80" data-testid="light-code-modal-lineage">{selectedSymbol.lineage}</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif text-white" data-testid="light-code-modal-title">{selectedSymbol.name}</h2>
                      <p className="text-sm text-white/70 mt-2 max-w-xl" data-testid="light-code-modal-description">{selectedSymbol.description}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className={`rounded-2xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-4`} data-testid="light-code-modal-meaning-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Meaning</p>
                      <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.meaning || selectedSymbol.purpose}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="light-code-modal-healing-card">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-2">Healing lens</p>
                      <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.healing_lens}</p>
                    </div>
                  </div>

                  {selectedSymbol.pronunciation && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10" data-testid="light-code-modal-pronunciation">
                      <Volume2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">Pronunciation</p>
                        <p className="font-medium mt-1">{selectedSymbol.pronunciation}</p>
                      </div>
                    </div>
                  )}

                  <Tabs value={modalTab} onValueChange={setModalTab} className="w-full" data-testid="light-code-modal-tabs">
                    <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent p-0 justify-start">
                      {modalTabs.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] data-[state=active]:bg-white data-[state=active]:text-slate-950"
                          data-testid={`light-code-tab-${tab.id}`}
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <TabsContent value="essence" className="space-y-4" data-testid="light-code-tab-content-essence">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Essence</p>
                        <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.extended_teachings}</p>
                      </div>
                      {selectedSymbol.meditation && (
                        <div className={`rounded-2xl border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} p-5`} data-testid="light-code-modal-meditation">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Contemplation</p>
                          <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.meditation}</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="why" className="space-y-4" data-testid="light-code-tab-content-why">
                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70 mb-3">Why it heals</p>
                        <p className="text-sm text-white/80 leading-relaxed">{selectedSymbol.why_this_heals}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="traditions" className="space-y-4" data-testid="light-code-tab-content-traditions">
                      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70 mb-3">Ancient traditions</p>
                        <p className="text-sm text-white/80 leading-relaxed">{selectedSymbol.ancient_traditions}</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="practice" className="space-y-4" data-testid="light-code-tab-content-practice">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70 mb-3">Practice guide</p>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">{selectedSymbol.practice_guide}</p>
                      </div>

                      {selectedSymbol.how_to_draw && (
                        <div className="rounded-2xl border border-rose-500/30 overflow-hidden" data-testid="light-code-modal-drawing-guide">
                          <div className="p-4 bg-rose-500/10 border-b border-rose-500/20">
                            <h3 className="font-medium text-rose-200 text-lg">Sacred Geometry Drawing Guide</h3>
                            <p className="text-xs text-white/50 mt-1">Move slowly and let the drawing become part of the ritual.</p>
                          </div>
                          <div className="p-4 bg-amber-500/5 border-b border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-amber-400">⚠</span>
                              <h4 className="text-sm font-medium text-amber-300">Preparation & grounding</h4>
                            </div>
                            <ul className="text-xs text-white/60 space-y-1.5">
                              <li>• Ground for a few minutes before drawing.</li>
                              <li>• Set a clear intention before beginning the pattern.</li>
                              <li>• Work slowly enough that breath and line stay connected.</li>
                              <li>• Integrate with water, stillness, and journaling afterward.</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-rose-500/5">
                            <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
                              {selectedSymbol.how_to_draw.replace(/(\d+)\./g, "\n$1.").trim()}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedSymbol.activation && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5" data-testid="light-code-modal-activation">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/40 mb-3">Activation</p>
                          <p className="text-sm text-white/75 leading-relaxed">{selectedSymbol.activation}</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <Button onClick={() => setSelectedSymbol(null)} className="w-full" variant="outline" data-testid="light-code-modal-close-bottom-btn">
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
