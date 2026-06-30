import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { usePremiumAccess } from "../hooks/usePremiumAccess";

const STREAM_OPTIONS = [
  { id: "egyptian_mystery", label: "Egyptian Mystery School", accent: "text-amber-200" },
  { id: "priestess_rose", label: "Priestess & Rose Lineage", accent: "text-rose-200" },
  { id: "emerald_tablet", label: "Emerald Tablet Alchemy", accent: "text-emerald-200" },
  { id: "merlin_alchemy", label: "Merlin Teachings & Alchemy", accent: "text-cyan-200" },
];

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

export default function MysterySchoolTeachings({ api, user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const premium = usePremiumAccess({ api, user });
  const [loading, setLoading] = useState(true);
  const [teachings, setTeachings] = useState([]);
  const [selected, setSelected] = useState(null);

  const activeStream = useMemo(() => {
    const queryStream = (searchParams.get("stream") || "").trim().toLowerCase();
    return STREAM_OPTIONS.find((s) => s.id === queryStream)?.id || STREAM_OPTIONS[0].id;
  }, [searchParams]);

  useEffect(() => {
    if (!api) return;
    let mounted = true;

    const fetchTeachings = async () => {
      setLoading(true);
      try {
        const response = await api.get("/mystery-school", { params: { stream: activeStream } });
        if (!mounted) return;
        setTeachings(Array.isArray(response?.data) ? response.data : []);
      } catch {
        if (mounted) setTeachings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTeachings();
    return () => {
      mounted = false;
    };
  }, [api, activeStream]);

  const handleStreamChange = (streamId) => {
    setSearchParams({ stream: streamId });
    setSelected(null);
  };

  const canAccess = (item) => {
    if (!item?.is_premium) return true;
    return premium.isSectionUnlocked(item?.premium_unlock_id || "mystery_school");
  };

  const handleOpenTeaching = (item) => {
    if (!canAccess(item)) {
      navigate("/pricing");
      return;
    }
    setSelected(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-background" data-testid="mystery-school-page">
      <header className="sticky top-0 z-40 bg-background/90 border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            data-testid="mystery-school-back-button"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="text-center flex-1" data-testid="mystery-school-header-copy">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80">Mystery School Temple</p>
            <h1 className="text-2xl md:text-3xl font-serif">Priestess, Emerald, and Merlin Teachings</h1>
          </div>
          <Button
            variant="outline"
            className="border-amber-500/30 text-amber-200 hover:text-amber-100"
            onClick={() => navigate("/pricing")}
            data-testid="mystery-school-pricing-button"
          >
            Premium Access
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2" data-testid="mystery-school-stream-tabs">
          {STREAM_OPTIONS.map((stream) => {
            const isActive = activeStream === stream.id;
            return (
              <button
                key={stream.id}
                onClick={() => handleStreamChange(stream.id)}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-amber-500/20 border-amber-400/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                data-testid={`mystery-school-stream-tab-${stream.id}`}
              >
                <p className={`text-sm font-medium ${stream.accent}`}>{stream.label}</p>
                <p className="text-xs text-muted-foreground mt-1">21 teachings (tiered access)</p>
              </button>
            );
          })}
        </section>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="mystery-school-loading-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`mystery-loading-${idx}`} className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="mystery-school-card-grid">
            {teachings.map((item) => {
              const locked = !canAccess(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenTeaching(item)}
                  className="text-left rounded-2xl border border-white/15 bg-gradient-to-br from-white/8 to-black/30 p-4 hover:border-amber-400/40 transition-colors"
                  data-testid={`mystery-school-card-${item.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 mb-3" data-testid={`mystery-school-card-image-wrap-${item.id}`}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      data-testid={`mystery-school-card-image-${item.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80" data-testid={`mystery-school-stream-${item.id}`}>
                      {item.stream_label || "Mystery School"}
                    </span>
                    {locked ? <Lock className="w-4 h-4 text-rose-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                  </div>
                  <h3 className="text-lg font-serif leading-snug" data-testid={`mystery-school-name-${item.id}`}>{item.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{item.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground mt-3 line-clamp-3" data-testid={`mystery-school-description-${item.id}`}>
                    {item.description}
                  </p>
                </button>
              );
            })}
          </section>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-slate-950/98 border-white/15" data-testid="mystery-school-modal">
          {selected && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif text-amber-100" data-testid="mystery-school-modal-title">
                  {selected.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground" data-testid="mystery-school-modal-subtitle">{selected.title}</p>
              </DialogHeader>

              <p className="text-foreground/85 leading-relaxed" data-testid="mystery-school-modal-description">{selected.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "alchemy", label: "Alchemy Teachings" },
                  { key: "ritual", label: "Ritual Steps" },
                  { key: "ceremony", label: "Ceremonial Arc" },
                  { key: "guided_practice", label: "Guided Practice Arc" },
                ].map((section) => {
                  const rows = toList(selected[section.key]);
                  if (!rows.length) return null;
                  return (
                    <div key={section.key} className="p-4 rounded-xl border border-white/20 bg-white/6" data-testid={`mystery-school-modal-section-${section.key}`}>
                      <h4 className="text-[11px] uppercase tracking-wider text-amber-200 mb-2">{section.label}</h4>
                      <ul className="space-y-1.5">
                        {rows.map((line, idx) => (
                          <li key={`${section.key}-${idx}`} className="text-sm leading-relaxed text-foreground/90">• {line}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
