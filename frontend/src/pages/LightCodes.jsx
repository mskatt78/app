import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Eye, Hexagon } from "lucide-react";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";
import { LightCodeModal } from "./light-codes/LightCodeModal";
import { categories, modalTabs } from "./light-codes/lightCodeConfig";

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
        appLogger.error("Failed to fetch light codes", error);
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

      <LightCodeModal
        selectedSymbol={selectedSymbol}
        activeCategoryInfo={activeCategoryInfo}
        modalTabs={modalTabs}
        modalTab={modalTab}
        setModalTab={setModalTab}
        onClose={() => setSelectedSymbol(null)}
      />
    </div>
  );
}
