import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Waves, Filter, Play, Clock, Lock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import PracticeVideos from "../components/PracticeVideos";
import { appLogger } from "../utils/logger";
import { resolveDurationMinutes } from "../utils/durationUtils";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import { EmbodimentProtocolPanel } from "../components/practice/EmbodimentProtocolPanel";

const movementTrackFilters = ["all", "Fascia Stretching"];

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

const FasciaStretching = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const premium = usePremiumAccess({ api, user });
  const somaticUnlocked = premium.isSectionUnlocked("somatic_practices");
  const fullAppProduct = premium.findProduct("full_app_unlock");

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  useEffect(() => {
    const fetchPractices = async () => {
      try {
        const response = await api.get("/fascia-stretching");
        setPractices(response.data);
        setFilteredPractices(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch practices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPractices();
  }, [api]);

  useEffect(() => {
    let nextPractices = practices;

    if (selectedElement !== "all") {
      nextPractices = nextPractices.filter((practice) => practice.element === selectedElement);
    }

    if (selectedTrack !== "all") {
      nextPractices = nextPractices.filter((practice) => practice.movement_track === selectedTrack);
    }

    setFilteredPractices(nextPractices);
  }, [selectedElement, selectedTrack, practices]);

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const canAccessPractice = (practice) => !practice?.is_premium || somaticUnlocked;

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/fascia-stretching",
    });
  };

  const handleStartGuided = (practice) => {
    setSelectedPractice(null); // close dialog
    setGuidedPractice(practice);
  };

  const handleExitPractice = () => {
    const practiceToLog = guidedPractice;
    setGuidedPractice(null);

    if (practiceToLog) {
      api.post("/practice-history", {
        practice_type: "somatic",
        practice_id: practiceToLog.id,
        duration_minutes: practiceToLog.duration_minutes,
        notes: `Completed ${practiceToLog.name}`,
      })
        .then(() => toast.success("Practice complete. Well done."))
        .catch(() => {
          // silent
        });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="fascia-stretching-page">
      {/* Full-screen Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.instructions}
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Body Wisdom</p>
              <h1 className="text-xl font-serif">
                Fascia <span className="italic text-primary">Stretching</span>
              </h1>
            </div>
          </div>

          <Select value={selectedElement} onValueChange={setSelectedElement}>
            <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {elements.map((el) => (
                <SelectItem key={el} value={el}>
                  {el === "all" ? "All Elements" : el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger data-testid="movement-track-filter" className="w-52 bg-card border-white/10">
              <Waves className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Fascia Track" />
            </SelectTrigger>
            <SelectContent>
              {movementTrackFilters.map((track) => (
                <SelectItem key={track} value={track}>
                  {track === "all" ? "All Tracks" : track}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-serif mb-4">
            Release with <span className="italic text-primary">Elastic Ease</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fascia Stretching focuses on connective tissue hydration, slow rebound mobility, and breath-led release.
            This stream is separate from Somatic Yoga and Chair Yoga so you can target myofascial restoration directly.
          </p>
        </motion.div>

        {!somaticUnlocked && (
          <section className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4" data-testid="fascia-premium-banner">
            <p className="text-xs uppercase tracking-wider text-amber-200/80">Fascia Stretching Premium Track</p>
            <p className="text-sm text-muted-foreground mt-1" data-testid="fascia-premium-banner-description">
              First fascia foundations are free. Advanced connective tissue sequences unlock with subscription or full app access.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="fascia-premium-banner-subscription-button">View Subscription Plans</Button>
              <Button variant="outline" onClick={handleUnlockFullApp} disabled={premium.purchaseLoadingId === "full_app_unlock"} data-testid="fascia-premium-banner-fullapp-button">
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractices.map((practice, index) => {
              const colors = elementColors[practice.element] || elementColors.Water;
              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => {
                    if (!canAccessPractice(practice)) {
                      setSelectedLockedPractice(practice);
                      return;
                    }
                    setSelectedPractice(practice);
                  }}
                  data-testid={`practice-card-${practice.id}`}
                >
                  {practice.image_url && (
                    <div className="relative h-40 overflow-hidden bg-black/45">
                      <img
                        src={practice.image_url}
                        alt={practice.name}
                        className="w-full h-full object-contain object-center"
                        loading="lazy"
                        data-testid={`practice-image-${practice.id}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className={`flex items-start justify-between mb-4 ${practice.image_url ? "hidden" : ""}`}>
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Waves className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resolveDurationMinutes(practice.duration_minutes, 35)} min
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {practice.element}
                        </span>
                      </div>
                    </div>
                    {practice.image_url && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {resolveDurationMinutes(practice.duration_minutes, 35)} min
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {practice.element}
                        </span>
                        {practice.is_premium && !canAccessPractice(practice) && (
                          <span className="px-2 py-1 rounded-full text-[10px] bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-300/40" data-testid={`fascia-premium-badge-${practice.id}`}>
                            <Lock className="w-3 h-3 inline mr-1" />Premium
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="text-xl font-serif mb-3">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>
                    {practice.movement_track && (
                      <p className="text-[11px] text-cyan-300/90 mb-2" data-testid={`movement-track-${practice.id}`}>
                        {practice.movement_track}
                      </p>
                    )}
                    {practice.breath_hybrid_mode && (
                      <p className="text-[11px] text-emerald-300/90 mb-3" data-testid={`breath-hybrid-${practice.id}`}>
                        {practice.breath_hybrid_mode}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {practice.benefits?.map((benefit) => (
                        <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!canAccessPractice(practice)) {
                          setSelectedLockedPractice(practice);
                          return;
                        }
                        setGuidedPractice({
                          ...practice,
                      category: "movement",
                          element: practice.element || "Water",
                          duration_minutes: resolveDurationMinutes(practice.duration_minutes, 35),
                          steps: Array.isArray(practice.instructions)
                            ? practice.instructions
                            : [
                                practice.description || "Settle into your body with soft breath and awareness.",
                                "Let movement emerge from sensation rather than force.",
                                "Integrate slowly and close with grounding through feet and pelvis.",
                              ],
                        });
                      }}
                      variant="outline"
                      className="w-full mt-3 border-white/15"
                      data-testid={`fascia-card-start-guided-${practice.id}`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Guided Practice
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <PracticeVideos api={api} category="movement" />
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={!!selectedPractice} onOpenChange={() => setSelectedPractice(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[88vh] overflow-y-auto" data-testid="fascia-practice-dialog-content">
          {selectedPractice && (
            <>
              <DialogHeader>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                             ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}
                >
                  {selectedPractice.element} Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPractice.name}</DialogTitle>
                <DialogDescription className="sr-only" data-testid="fascia-practice-dialog-description">
                  View fascia stretching guidance and start the selected guided practice.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4 pb-4" data-testid="fascia-practice-dialog-scroll-container">
                <p className="text-muted-foreground leading-relaxed">{selectedPractice.description}</p>

                {selectedPractice.movement_track && (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20" data-testid="selected-movement-track">
                    <p className="text-xs text-cyan-300 uppercase tracking-wide">Movement Track</p>
                    <p className="text-sm text-cyan-100 mt-1">{selectedPractice.movement_track}</p>
                  </div>
                )}

                {(selectedPractice.somatic_fascia_focus || selectedPractice.fascia_focus_area) && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="fascia-focus-panel">
                    <p className="text-xs text-emerald-300 uppercase tracking-wide">Fascia Focus</p>
                    <p className="text-sm text-emerald-100 mt-1">{selectedPractice.somatic_fascia_focus || selectedPractice.fascia_focus_area}</p>
                  </div>
                )}

                <EmbodimentProtocolPanel
                  practiceName={selectedPractice.name}
                  element={selectedPractice.element || "Water"}
                  testIdPrefix="fascia-stretching-embodiment"
                />

                {selectedPractice.breath_hybrid_sequence?.length > 0 && (
                  <div className="space-y-2" data-testid="selected-breath-hybrid-sequence">
                    <p className="text-xs text-primary uppercase tracking-wide">Breath Hybrid Sequence</p>
                    {selectedPractice.breath_hybrid_sequence.map((cue, index) => (
                      <p key={`${selectedPractice.id}-hybrid-${index}`} className="text-sm text-muted-foreground">
                        {cue}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-muted-foreground">{resolveDurationMinutes(selectedPractice.duration_minutes, 35)} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractice.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Tip:</strong> Find a quiet space where you can move
                    freely. Let your body guide you — there is no wrong way to do this practice. Stay in
                    your Somatic & Fascia Breath Hybrid rhythm and keep movement at a manageable intensity.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="fascia-earth-cosmic-frame">
                  <p className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Earth + Cosmic Coherence</p>
                  <ul className="space-y-1.5">
                    <li className="text-xs text-emerald-100/90">• Ground feet and pelvis as if rooting into living Earth before each movement phrase.</li>
                    <li className="text-xs text-emerald-100/90">• Match movement to long exhale and heart-centered attention for ceremonial steadiness.</li>
                    <li className="text-xs text-emerald-100/90">• Pause every 3-4 minutes to receive a cosmic guidance line, then continue with embodied devotion.</li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    if (!canAccessPractice(selectedPractice)) {
                      setSelectedPractice(null);
                      setSelectedLockedPractice(selectedPractice);
                      return;
                    }
                    setSelectedPractice(null);
                    setGuidedPractice({
                      ...selectedPractice,
                      category: "movement",
                      element: selectedPractice.element || "Water",
                      duration_minutes: resolveDurationMinutes(selectedPractice.duration_minutes, 35),
                      steps: Array.isArray(selectedPractice.instructions)
                        ? selectedPractice.instructions
                        : [
                            selectedPractice.description || "Settle into your body with soft breath and awareness.",
                            "Let movement emerge from sensation rather than force.",
                            "Integrate slowly and close with grounding through feet and pelvis.",
                          ],
                    });
                  }}
                  variant="outline"
                  className="w-full border-white/15"
                  size="lg"
                  data-testid="fascia-modal-start-guided-overlay-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Begin Guided Practice (Voice + Ambient)
                </Button>

                <Button
                  onClick={() => {
                    if (!canAccessPractice(selectedPractice)) {
                      setSelectedPractice(null);
                      setSelectedLockedPractice(selectedPractice);
                      return;
                    }
                    handleStartGuided(selectedPractice);
                  }}
                  className="w-full"
                  size="lg"
                  data-testid="start-guided-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Guided Practice
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedLockedPractice && !somaticUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="fascia-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Fascia Practice</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="fascia-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="fascia-premium-lock-description">This advanced fascia stretching practice is premium. Continue with subscription or full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="fascia-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="fascia-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="fascia-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FasciaStretching;
