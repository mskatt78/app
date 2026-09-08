import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Filter, Clock, Lock,
  Mountain, Waves, Flame, Heart, Eye, Moon, Star,
  CloudOff,
} from "lucide-react";
import { useOfflineDownload } from "../hooks/useOfflineDownload";
import { OfflineDownloadButton } from "../components/OfflineDownloadButton";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { appLogger } from "../utils/logger";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import { getMeditationImage } from "../utils/shamanicImageTheme";

// Convert a meditation record into a multi-step practice object for GuidedPracticeOverlay
function buildMeditationPractice(meditation) {
  const steps = [];

  // Step 1 — Grounding & Intention
  steps.push(
    `Come into stillness. Find a comfortable position and close your eyes. Take three slow, deep breaths. Set your intention: ${meditation.description || "to journey within."}`
  );

  // Steps 2-N — Visualization body
  const viz = (meditation.visualization || "").trim();
  if (viz) {
    const paragraphs = viz.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 30);
    if (paragraphs.length >= 2) {
      steps.push(...paragraphs);
    } else {
      // Split by sentence boundaries and group into ~3 logical chunks
      const sentences = viz.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20);
      if (sentences.length >= 4) {
        const chunkSize = Math.ceil(sentences.length / 3);
        for (let i = 0; i < sentences.length; i += chunkSize) {
          const chunk = sentences.slice(i, i + chunkSize).join(" ").trim();
          if (chunk.length > 20) steps.push(chunk);
        }
      } else if (viz.length > 30) {
        steps.push(viz);
      }
    }
  }

  // Final step — Integration & Closing
  const benefitsStr = (meditation.benefits || []).join(", ");
  steps.push(
    `Gently return your awareness to the present moment. Feel the ground beneath you. Breathe naturally. Carry these gifts forward: ${benefitsStr || "peace, clarity, and renewal"}. When you are ready, slowly open your eyes.`
  );

  return {
    name: meditation.name,
    duration_minutes: meditation.duration_minutes,
    element: meditation.element,
    category: meditation.category,
    id: meditation.id,
    image_url: meditation.image_url,
    steps,
  };
}

const categories = [
  { value: "all", label: "All Meditations" },
  { value: "relaxation", label: "Relaxation" },
  { value: "grounding", label: "Grounding" },
  { value: "energy", label: "Energy" },
  { value: "nature", label: "Nature" },
  { value: "expansion", label: "Expansion" },
  { value: "healing", label: "Healing" },
  { value: "spiritual", label: "Spiritual" },
  { value: "heart", label: "Heart" },
  { value: "intuition", label: "Intuition" },
];

const categoryIcons = {
  relaxation: Waves,
  grounding: Mountain,
  energy: Flame,
  nature: Mountain,
  expansion: Star,
  healing: Heart,
  spiritual: Sparkles,
  heart: Heart,
  intuition: Eye,
};

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

const Meditations = ({ user, api }) => {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user });
  const [meditations, setMeditations] = useState([]);
  const [filteredMeditations, setFilteredMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [selectedLockedMeditation, setSelectedLockedMeditation] = useState(null);
  const { downloadedIds, downloadingId, downloadProgress, downloadPractice } = useOfflineDownload({ api });

  const meditationsUnlocked = premium.isSectionUnlocked("meditations");
  const meditationsProduct = premium.findProduct("meditations");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const canAccessMeditation = (meditation) => !meditation?.is_premium || meditationsUnlocked;

  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        const response = await api.get("/meditations");
        setMeditations(response.data);
        setFilteredMeditations(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch meditations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeditations();
  }, [api]);

  const handleDownloadForOffline = async (event, meditation) => {
    event.stopPropagation();
    if (downloadingId) return;
    if (!canAccessMeditation(meditation)) {
      setSelectedLockedMeditation(meditation);
      return;
    }
    const offlineId = `meditation:${meditation.id}`;
    if (downloadedIds.has(offlineId)) {
      navigate("/offline-practices");
      return;
    }
    const practice = buildMeditationPractice(meditation);
    await downloadPractice({
      id: offlineId,
      name: meditation.name,
      element: meditation.element,
      category: meditation.category,
      duration_minutes: meditation.duration_minutes,
      steps: practice.steps,
    });
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMeditations(meditations);
    } else {
      setFilteredMeditations(meditations.filter((m) => m.category === selectedCategory));
    }
  }, [selectedCategory, meditations]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const handleStartMeditation = (meditation) => {
    if (!canAccessMeditation(meditation)) {
      setSelectedLockedMeditation(meditation);
      return;
    }
    const practice = buildMeditationPractice(meditation);
    setGuidedPractice(practice);
  };

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/meditations",
    });
  };

  const handleExitPractice = () => {
    const practiceToLog = guidedPractice;
    setGuidedPractice(null);

    if (practiceToLog) {
      api.post("/practice-history", {
        practice_type: "meditation",
        practice_id: practiceToLog.id,
        duration_minutes: practiceToLog.duration_minutes,
        notes: `Completed ${practiceToLog.name}`,
      })
        .then(() => toast.success("Meditation complete. Namaste."))
        .catch(() => {
          // silent — don't block exit
        });
    }
  };

  return (
    <div className="min-h-screen bg-background relative" data-testid="meditations-page">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${getMeditationImage({ id: "meditations-hero", category: "spiritual", name: "Meditations Hero" })})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-testid="meditations-page-background-image"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/92 to-background" data-testid="meditations-page-background-overlay" />
      {/* Full-screen Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.steps}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Inner Journey</p>
              <h1 className="text-xl font-serif">
                Guided <span className="italic text-primary">Meditations</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/offline-practices")}
            className="border-white/10 text-muted-foreground hover:text-foreground"
            data-testid="offline-library-btn"
          >
            <CloudOff className="w-4 h-4 mr-1" /> Offline
          </Button>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="category-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-6">
        {!meditationsUnlocked && (
          <section className="rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-fuchsia-500/5 to-background p-4 mb-8" data-testid="meditations-premium-banner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300/70">Optional Premium</p>
                <h2 className="text-lg font-serif text-amber-100/90" data-testid="meditations-premium-banner-title">Meditations remain open</h2>
                <p className="text-sm text-muted-foreground mt-1" data-testid="meditations-premium-banner-description">Free journeys are prioritized. Premium unlocks deeper advanced experiences.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" className="text-cyan-100/80 hover:text-cyan-50" onClick={() => navigate("/pricing")} data-testid="meditations-view-subscription-button">Optional premium</Button>
              </div>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Moon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif mb-2">
                Journey <span className="italic text-primary">Within</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Guided meditations to explore your inner landscape, heal, and transform.
              </p>
              <p className="text-xs text-cyan-200/70 mt-2" data-testid="meditations-devotional-note">
                Receive each meditation as transmission—slow breath, open body awareness, and close with one grounded life action.
              </p>
            </motion.div>

            {/* Meditations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMeditations.map((meditation, index) => {
                const colors = elementColors[meditation.element] || elementColors.Spirit;
                const Icon = categoryIcons[meditation.category] || Sparkles;

                return (
                  <motion.div
                    key={meditation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                               ${colors.border} hover:scale-[1.02] transition-all duration-300 group`}
                    onClick={() => handleStartMeditation(meditation)}
                    data-testid={`meditation-card-${meditation.id}`}
                  >
                    {Boolean(meditation.is_premium) && !canAccessMeditation(meditation) && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-100 text-xs" data-testid={`meditation-premium-badge-${meditation.id}`}>
                          <Lock className="w-3 h-3" /> Premium
                        </span>
                      </div>
                    )}
                    {/* Card Image */}
                    <div className="relative h-40 overflow-hidden bg-black/45">
                      <img
                        src={getMeditationImage(meditation)}
                        alt={meditation.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500"
                        loading="lazy"
                        data-testid={`meditation-image-${meditation.id}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 text-lg font-serif text-white drop-shadow-lg">
                        {meditation.name}
                      </span>
                      <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                        <Clock className="w-3 h-3" />
                        {meditation.duration_minutes} min
                      </span>
                      <OfflineDownloadButton
                        offlineId={`meditation:${meditation.id}`}
                        downloadedIds={downloadedIds}
                        downloadingId={downloadingId}
                        downloadProgress={downloadProgress}
                        onClick={(event) => handleDownloadForOffline(event, meditation)}
                        dataTestId={`meditation-download-btn-${meditation.id}`}
                        className="absolute bottom-3 right-3"
                      />
                    </div>

                    <div className={`p-4 ${colors.bg}`}>
                      <h3 className="text-xl font-serif mb-2">{meditation.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {meditation.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
                        >
                          {meditation.element}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs capitalize">
                          {meditation.category}
                        </span>
                      </div>

                      {meditation.master_embodiment_protocol && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid={`meditation-master-embodiment-${meditation.id}`}>
                          <p className="text-[11px] uppercase tracking-wider text-amber-300 mb-2">Master Embodiment Protocol</p>
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {(meditation.master_embodiment_protocol.preparation_phase || [])[0]}
                          </p>
                        </div>
                      )}

                      {(meditation.best_for_tags || []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2" data-testid={`meditation-best-for-tags-${meditation.id}`}>
                          {meditation.best_for_tags.map((tag) => (
                            <span key={`meditation-best-for-${meditation.id}-${tag}`} className="px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {meditation.safety_notes && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20" data-testid={`meditation-safety-notes-${meditation.id}`}>
                          <p className="text-[11px] uppercase tracking-wider text-rose-300 mb-1">Contraindications / Safety</p>
                          <p className="text-xs text-rose-100/90 line-clamp-3">{meditation.safety_notes}</p>
                        </div>
                      )}

                      {(meditation.youtube_tutorials || []).length > 0 && (
                        <a
                          href={meditation.youtube_tutorials[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="mt-3 inline-block text-xs text-cyan-200 underline underline-offset-2"
                          data-testid={`meditation-youtube-link-${meditation.id}`}
                        >
                          {meditation.youtube_tutorials[0].title}
                        </a>
                      )}

                      {meditation.content_integrity?.verified && (
                        <p
                          className="mt-2 text-[11px] text-cyan-300/90"
                          data-testid={`meditation-integrity-${meditation.id}`}
                        >
                          Verified references ({meditation.content_integrity.references_count || 0})
                        </p>
                      )}
                      {meditation.content_integrity?.last_reviewed_at && (
                        <p className="text-[11px] text-muted-foreground" data-testid={`meditation-reviewed-at-${meditation.id}`}>
                          Last reviewed: {new Date(meditation.content_integrity.last_reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {selectedLockedMeditation && !meditationsUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="meditations-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <h3 className="text-2xl font-serif mb-2" data-testid="meditations-premium-lock-title">{selectedLockedMeditation.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="meditations-premium-lock-description">This meditation is part of Sacred Access membership.</p>
            <Button variant="outline" className="w-full border-amber-400/40 text-amber-100" onClick={() => navigate("/pricing")} data-testid="meditations-premium-lock-sacred-access-button">Sacred Access</Button>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedMeditation(null)} data-testid="meditations-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meditations;
