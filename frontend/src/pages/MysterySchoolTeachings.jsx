import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Lock, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { shareInitiationCertificate } from "../utils/initiationCertificate";
import { ScrollText, Loader2 } from "lucide-react";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { appLogger } from "../utils/logger";
import { getEncodedFrequencyImage } from "../utils/lightCodeVisualTheme";
import { getMysterySchoolImage } from "../utils/shamanicImageTheme";

const STREAM_OPTIONS = [
  { id: "egyptian_mystery", label: "Egyptian Mystery School", accent: "text-amber-200" },
  { id: "priestess_rose", label: "Priestess & Rose Lineage", accent: "text-rose-200" },
  { id: "emerald_tablet", label: "Emerald Tablet Alchemy", accent: "text-emerald-200" },
  { id: "merlin_alchemy", label: "Merlin Teachings & Alchemy", accent: "text-cyan-200" },
  { id: "hathor_mystery", label: "Hathor Mystery School", accent: "text-yellow-200" },
  { id: "seven_sisters", label: "Seven Sisters · Pleiades", accent: "text-sky-200" },
  { id: "sophia_dragons", label: "Sophia Dragons · Cosmic Womb", accent: "text-violet-200" },
  { id: "magdalene_initiations", label: "Mary Magdalene Initiations", accent: "text-rose-200" },
  { id: "isis_priestess", label: "Isis Egyptian Priestess Path", accent: "text-amber-200" },
  { id: "hermetic_bardon", label: "Hermeticism · Bardon-inspired", accent: "text-emerald-200" },
];

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const getWombActivationText = (item) => {
  if (!item) return "";
  const activation = String(item.activation || item.womb_activation || "").trim();
  if (activation) return activation;
  const name = String(item.name || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  if (name.includes("13th rite") || title.includes("womb")) {
    return "My womb is not a space for storing wounds, suffering, trauma, or pain. My womb is a space for birthing and creating life in all forms and all ways.";
  }
  return "";
};

export default function MysterySchoolTeachings({ api, user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const premium = usePremiumAccess({ api, user });
  const [loading, setLoading] = useState(true);
  const [teachings, setTeachings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [guidedJourney, setGuidedJourney] = useState(null);
  const [journeyProgress, setJourneyProgress] = useState(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [certSharing, setCertSharing] = useState(false);

  const fetchJourneyProgress = useCallback(async () => {
    if (!api) return;
    try {
      const { data } = await api.get("/mystery-journey/progress");
      setJourneyProgress(data?.streams || null);
    } catch {
      setJourneyProgress(null);
    }
  }, [api]);

  useEffect(() => {
    fetchJourneyProgress();
  }, [fetchJourneyProgress]);

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

  const streamProgress = journeyProgress?.[activeStream] || null;

  const getJourneyState = (item) => {
    if (!streamProgress) return { completed: false, sequenceLocked: false, position: null, total: null };
    const index = streamProgress.order.indexOf(item.id);
    const completed = streamProgress.completed_ids.includes(item.id);
    return {
      completed,
      sequenceLocked: index >= 0 && index >= streamProgress.unlocked_count && !completed,
      position: index >= 0 ? index + 1 : null,
      total: streamProgress.total,
    };
  };

  const handleOpenTeaching = (item) => {
    if (!canAccess(item)) {
      navigate("/pricing");
      return;
    }
    setSelected(item);
  };

  const buildGuidedJourney = (item) => {
    const arc = toList(item.guided_practice);
    const ritual = toList(item.ritual);
    const ceremony = toList(item.ceremony);
    const steps = [
      `Welcome to ${item.name}, a guided journey from the ${item.stream_label || "Mystery School"} lineage stream. Settle your body, soften your breath, and arrive fully before we begin.`,
      item.description,
      ...(ceremony.length ? [`We open in ceremony: ${ceremony[0]}.`] : []),
      ...arc,
      ...(ritual.length ? [`To seal this journey: ${ritual[ritual.length - 1]}`] : []),
      "Return gently now. Carry one insight from this lineage into the rest of your day.",
    ].filter(Boolean);
    return {
      ...item,
      category: "mystery_school",
      element: String(item.element || "spirit").toLowerCase(),
      duration_minutes: item.duration_minutes || 14,
      steps,
    };
  };

  const startGuidedJourney = (item) => {
    if (!canAccess(item)) {
      navigate("/pricing");
      return;
    }
    const state = getJourneyState(item);
    if (state.sequenceLocked) {
      toast.info("The initiation path opens in order — complete the previous journey on this stream first.");
      return;
    }
    setSelected(null);
    setGuidedJourney(buildGuidedJourney(item));
  };

  const exitGuidedJourney = async () => {
    const completed = guidedJourney;
    setGuidedJourney(null);
    if (!completed) return;
    try {
      await api.post("/practice-history", {
        practice_type: "mystery_school",
        practice_id: completed.id,
        duration_minutes: completed.duration_minutes,
        notes: `Completed ${completed.name} guided journey`,
      });
      const { data } = await api.get("/mystery-journey/progress");
      const streams = data?.streams || null;
      setJourneyProgress(streams);
      const stream = streams?.[activeStream];
      const wasCompleteBefore = streamProgress && streamProgress.completed >= streamProgress.total;
      if (stream && stream.completed >= stream.total && !wasCompleteBefore) {
        setCertificateOpen(true);
      }
    } catch (error) {
      appLogger.warn("Could not log mystery journey completion", error);
    }
  };

  const activeStreamLabel = STREAM_OPTIONS.find((s) => s.id === activeStream)?.label || "Mystery School";

  const handleShareCertificate = async () => {
    setCertSharing(true);
    try {
      let memberName = user?.name || "";
      if (!memberName) {
        try {
          const { data } = await api.get("/auth/me");
          memberName = data?.name || "";
        } catch {
          memberName = "";
        }
      }
      await shareInitiationCertificate({
        streamLabel: activeStreamLabel,
        total: streamProgress?.total || 0,
        memberName,
      });
    } catch (error) {
      if (error?.name !== "AbortError") toast.error("Could not create the certificate");
    } finally {
      setCertSharing(false);
    }
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
            <h1 className="text-2xl md:text-3xl font-serif">Distinct Mystery Schools & Sacred Lineage Paths</h1>
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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2" data-testid="mystery-school-stream-tabs">
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
                <p className="text-xs text-muted-foreground mt-1">A distinct pathway · tiered access</p>
              </button>
            );
          })}
        </section>

        {streamProgress && (
          <section className="mt-4 p-4 rounded-2xl border border-amber-400/25 bg-amber-500/5" data-testid="lineage-progress-panel">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <p className="text-sm text-amber-100/90">
                Initiation path: <span className="font-medium text-amber-200">{streamProgress.completed} of {streamProgress.total}</span> journeys completed
              </p>
              <p className="text-xs text-muted-foreground" data-testid="lineage-progress-next">
                {streamProgress.completed >= streamProgress.total
                  ? "Path complete — every initiation walked"
                  : `Initiation ${Math.min(streamProgress.unlocked_count, streamProgress.total)} is open to you`}
              </p>
              {streamProgress.completed >= streamProgress.total && (
                <button
                  onClick={() => setCertificateOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-amber-500/20 border border-amber-400/40 text-amber-100 hover:bg-amber-500/30 transition-colors"
                  data-testid="view-certificate-btn"
                >
                  <ScrollText className="w-3.5 h-3.5" /> View Certificate
                </button>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500/70 to-yellow-300/80 transition-all duration-700"
                style={{ width: `${streamProgress.total ? Math.round((streamProgress.completed / streamProgress.total) * 100) : 0}%` }}
                data-testid="lineage-progress-bar"
              />
            </div>
          </section>
        )}

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
              const journeyState = getJourneyState(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleOpenTeaching(item)}
                  className="text-left rounded-2xl border border-white/15 bg-gradient-to-br from-white/8 to-black/30 p-4 hover:border-amber-400/40 transition-colors shadow-[0_0_30px_rgba(244,193,72,0.08)]"
                  data-testid={`mystery-school-card-${item.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 mb-3" data-testid={`mystery-school-card-media-wrap-${item.id}`}>
                    <img
                      src={getMysterySchoolImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      data-testid={`mystery-school-card-image-${item.id}`}
                    />
                    <div
                      className="absolute inset-0 mix-blend-screen"
                      style={{
                        backgroundImage: `url(${getEncodedFrequencyImage(`${item.id}-overlay`)})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.22,
                      }}
                      data-testid={`mystery-school-card-overlay-${item.id}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-[11px] px-2 py-1 rounded-full border border-yellow-200/30 bg-black/45 text-yellow-100/90" data-testid={`mystery-school-card-encoded-badge-${item.id}`}>
                      Symbolic Visual
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80" data-testid={`mystery-school-stream-${item.id}`}>
                      {journeyState.position ? `Initiation ${journeyState.position} · ` : ""}{item.stream_label || "Mystery School"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {journeyState.completed && <CheckCircle2 className="w-4 h-4 text-emerald-300" data-testid={`journey-complete-badge-${item.id}`} />}
                      {journeyState.sequenceLocked && <Lock className="w-4 h-4 text-amber-300/70" data-testid={`journey-sequence-lock-${item.id}`} />}
                      {locked ? <Lock className="w-4 h-4 text-rose-300" /> : (!journeyState.completed && !journeyState.sequenceLocked && <Sparkles className="w-4 h-4 text-amber-300" />)}
                    </span>
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

              <Button
                onClick={() => startGuidedJourney(selected)}
                className={`w-full sm:w-auto border ${
                  getJourneyState(selected).sequenceLocked
                    ? "bg-white/5 text-muted-foreground border-white/15 hover:bg-white/10"
                    : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/40"
                }`}
                data-testid="mystery-school-begin-journey-btn"
              >
                {getJourneyState(selected).sequenceLocked ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Complete the previous initiation first
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {getJourneyState(selected).completed ? "Journey Again" : "Begin Guided Journey"}
                  </>
                )}
              </Button>

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

              {getWombActivationText(selected) && (
                <div className="p-4 rounded-xl border border-rose-300/30 bg-rose-500/10" data-testid="mystery-school-modal-womb-activation">
                  <h4 className="text-[11px] uppercase tracking-wider text-rose-200 mb-2">13th Rite Of The Womb · Words of Intention</h4>
                  <p className="text-sm leading-relaxed text-rose-100/95">“{getWombActivationText(selected)}”</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={certificateOpen} onOpenChange={setCertificateOpen}>
        <DialogContent className="max-w-md bg-slate-950/98 border-amber-400/30" data-testid="certificate-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-amber-100 text-center">Path Complete</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-2">
            <ScrollText className="w-14 h-14 mx-auto text-amber-300" strokeWidth={1.2} />
            <p className="text-sm text-foreground/85 leading-relaxed">
              You have walked <span className="text-amber-200">every initiation</span> of the{" "}
              <span className="italic text-amber-200">{activeStreamLabel}</span> — all {streamProgress?.total || 0} guided journeys, completed in full presence.
            </p>
            <p className="text-xs text-muted-foreground">Your Certificate of Initiation is ready to keep or share.</p>
            <Button
              onClick={handleShareCertificate}
              disabled={certSharing}
              className="bg-amber-500/25 hover:bg-amber-500/35 text-amber-100 border border-amber-400/50"
              data-testid="share-certificate-btn"
            >
              {certSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScrollText className="w-4 h-4 mr-2" />}
              Receive Your Scroll
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <GuidedPracticeOverlay
        practice={guidedJourney}
        stepsOverride={guidedJourney?.steps}
        onExit={exitGuidedJourney}
      />
    </div>
  );
}
