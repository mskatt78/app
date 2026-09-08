import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Flame, Star, Shield, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import { appLogger } from "../utils/logger";
import { getEncodedFrequencyImage } from "../utils/lightCodeVisualTheme";

const normalizeAlchemyItem = (item, source) => ({
  ...item,
  source,
  sourceLabel:
    source === "sacred-allies"
      ? "Sacred Allies"
      : source === "mystery-school"
        ? "Mystery School"
        : "Angelic Alchemy",
  typeLabel: item?.ally_type || item?.category || item?.angelic_order || "Alchemy",
});

const MYSTERY_STREAMS = [
  "egyptian_mystery",
  "priestess_rose",
  "emerald_tablet",
  "merlin_alchemy",
];

export default function AllAlchemyHub({ user, api }) {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!api) return;
    let mounted = true;
    const fetchAlchemy = async () => {
      try {
        const [sacredRes, angelicRes, ...mysteryResults] = await Promise.all([
          api.get("/sacred-ally-alchemy"),
          api.get("/angelic-alchemy"),
          ...MYSTERY_STREAMS.map((stream) => api.get("/mystery-school", { params: { stream } })),
        ]);

        if (!mounted) return;

        const sacred = Array.isArray(sacredRes?.data)
          ? sacredRes.data.map((item) => normalizeAlchemyItem(item, "sacred-allies"))
          : [];
        const angelic = Array.isArray(angelicRes?.data)
          ? angelicRes.data.map((item) => normalizeAlchemyItem(item, "angelic"))
          : [];

        const mystery = mysteryResults.flatMap((response) => {
          if (!Array.isArray(response?.data)) return [];
          return response.data.map((item) => normalizeAlchemyItem(item, "mystery-school"));
        });

        setItems([...sacred, ...angelic, ...mystery]);
      } catch (error) {
        appLogger.error("Failed loading alchemy hub", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAlchemy();
    return () => {
      mounted = false;
    };
  }, [api]);

  const featuredStats = useMemo(() => {
    const total = items.length;
    const mysteryCount = items.filter((item) => item.source === "mystery-school").length;
    const angelicCount = items.filter((item) => item.source === "angelic").length;
    const alliesCount = total - mysteryCount - angelicCount;
    return { total, alliesCount, angelicCount, mysteryCount };
  }, [items]);

  const handleCardClick = (item) => {
    const unlockKey =
      item.source === "angelic"
        ? "angelic_alchemy"
        : item.source === "mystery-school"
          ? "mystery_school"
          : "sacred_allies";

    const sectionUnlocked = premium.isSectionUnlocked(unlockKey);
    if (item?.is_premium && !sectionUnlocked) {
      navigate("/pricing");
      return;
    }

    const targetRoute =
      item.source === "angelic"
        ? "/angelic-alchemy"
        : item.source === "mystery-school"
          ? `/mystery-school-teachings?stream=${item.stream || "egyptian_mystery"}`
          : "/sacred-ally-alchemy";
    navigate(targetRoute);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="all-alchemy-hub-page">
      <header className="sticky top-0 z-40 bg-background/90 border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="all-alchemy-hub-back-button"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 text-center" data-testid="all-alchemy-hub-header-copy">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Unified Section</p>
            <h1 className="text-2xl md:text-3xl font-serif">All Alchemy Hub</h1>
          </div>
          <Button
            onClick={() => navigate("/pricing")}
            variant="outline"
            className="border-cyan-400/30 text-cyan-200 hover:text-cyan-100"
            data-testid="all-alchemy-hub-pricing-button"
          >
            Premium Access
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-background p-6" data-testid="all-alchemy-hub-hero">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-serif mb-2" data-testid="all-alchemy-hub-title">Sacred Allies + Angelic Alchemy in One Temple</h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl" data-testid="all-alchemy-hub-description">
                Explore dragon, kundalini, and galactic lineages beside archangel pathways—without hopping between sections.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center" data-testid="all-alchemy-hub-stats">
              <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-cyan-100" data-testid="all-alchemy-hub-total-count">{featuredStats.total}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Allies</p>
                <p className="text-lg font-semibold text-orange-100" data-testid="all-alchemy-hub-dragon-count">{featuredStats.alliesCount}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Angelic</p>
                <p className="text-lg font-semibold text-fuchsia-100" data-testid="all-alchemy-hub-starlineage-count">{featuredStats.angelicCount}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Mystery</p>
                <p className="text-lg font-semibold text-amber-100" data-testid="all-alchemy-hub-mystery-count">{featuredStats.mysteryCount}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => navigate("/sacred-ally-alchemy")} className="bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-100 hover:bg-fuchsia-500/30" data-testid="all-alchemy-hub-open-sacred-allies-button">
              <Flame className="w-4 h-4 mr-2" /> Sacred Allies
            </Button>
            <Button onClick={() => navigate("/angelic-alchemy")} className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/30" data-testid="all-alchemy-hub-open-angelic-button">
              <Shield className="w-4 h-4 mr-2" /> Angelic Alchemy
            </Button>
            <Button onClick={() => navigate("/mystery-school-teachings")} className="bg-amber-500/20 border border-amber-500/30 text-amber-100 hover:bg-amber-500/30" data-testid="all-alchemy-hub-open-mystery-school-button">
              <Star className="w-4 h-4 mr-2" /> Mystery School
            </Button>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="all-alchemy-hub-loading-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`alchemy-loading-${index}`} className="h-44 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="all-alchemy-hub-card-grid">
            {items.map((item, index) => {
              const locked = Boolean(item?.is_premium) && !premium.isSectionUnlocked(item.source === "angelic" ? "angelic_alchemy" : "sacred_allies");
              return (
                <motion.button
                  key={item.id || `alchemy-item-${index}`}
                  type="button"
                  onClick={() => handleCardClick(item)}
                  whileHover={{ y: -4 }}
                  className="relative overflow-hidden text-left rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-black/20 p-4 hover:border-cyan-400/40 transition-all shadow-[0_0_28px_rgba(185,134,255,0.08)]"
                  data-testid={`all-alchemy-hub-card-${item.id || index}`}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${item.image_url || getEncodedFrequencyImage(item.id || item.name || index)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: 0.2,
                    }}
                    data-testid={`all-alchemy-hub-card-image-bg-${item.id || index}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/45 to-black/75" />
                  <div className="relative">
                  <p className="inline-flex items-center mb-3 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border border-yellow-200/25 bg-black/45 text-yellow-100/90" data-testid={`all-alchemy-hub-encoded-badge-${item.id || index}`}>
                    Encoded Aura
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80" data-testid={`all-alchemy-hub-source-${item.id || index}`}>{item.sourceLabel}</span>
                    {locked ? <Lock className="w-4 h-4 text-fuchsia-300" /> : <Sparkles className="w-4 h-4 text-cyan-300" />}
                  </div>
                  <h3 className="text-lg font-serif leading-snug" data-testid={`all-alchemy-hub-name-${item.id || index}`}>{item.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1" data-testid={`all-alchemy-hub-type-${item.id || index}`}>{item.typeLabel}</p>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3" data-testid={`all-alchemy-hub-description-${item.id || index}`}>
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-cyan-200/80">
                    <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" /> Enter practice</span>
                    <span>{locked ? "Premium" : "Open"}</span>
                  </div>
                  </div>
                </motion.button>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
