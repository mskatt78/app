import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Heart, Shield, ChevronDown, ChevronUp, Loader2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { EmbodimentProtocolPanel } from "../components/practice/EmbodimentProtocolPanel";
import { toast } from "sonner";
import axios from "axios";
import { usePremiumAccess } from "../hooks/usePremiumAccess";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { composeDeepGuidedNarration, ritualDeliveryPillars } from "../utils/guidedRitualComposer";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const MODALITY_COLORS = {
  reiki: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  shamanic: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  pranic: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  theta: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  crystal: { bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-400" },
  quantum: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  sound: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
};

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/\n|•|\.|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 8);
};

const buildEnergyImmersiveScript = (practice) => composeDeepGuidedNarration({
  title: practice?.name || "Energy Healing Ritual",
  element: practice?.element || practice?.modality || "Spirit",
  description: practice?.precision_description || practice?.description,
  teachings: [
    ...(toList(practice?.alchemy)),
    ...(toList(practice?.healing_trajectory)),
    ...(toList(practice?.how_it_works)),
    ...(toList(practice?.self_healing_guide)),
  ],
  rituals: [
    ...(toList(practice?.ritual)),
    ...(toList(practice?.ritual_practice)),
    ...(toList(practice?.practice)),
  ],
  ceremonies: [
    ...(toList(practice?.ceremony)),
    ...(toList(practice?.ceremonies)),
  ],
  embodiment: [
    ...(toList(practice?.embodiment)),
    ...(toList(practice?.embodiment_prompts)),
    ...ritualDeliveryPillars,
  ],
  integration: [
    ...(toList(practice?.integration_actions)),
    ...(toList(practice?.benefits)),
  ],
  invocation: practice?.devotional_invocation,
  closing: practice?.integration_vow,
});

export default function EnergyHealing() {
  const navigate = useNavigate();
  const premium = usePremiumAccess({ api, user: null });
  const energyUnlocked = premium.isSectionUnlocked("energy_healing");
  const fullAppProduct = premium.findProduct("full_app_unlock");
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [selectedLockedPractice, setSelectedLockedPractice] = useState(null);
  const [filterModality, setFilterModality] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/energy-healing");
      setPractices(data);
    } catch { toast.error("Failed to load practices"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    premium.finalizeCheckoutIfPresent({ search: window.location.search, clearUrl: true });
  }, [premium]);

  const canAccessPractice = (practice) => !practice?.is_premium || energyUnlocked;

  const handleUnlockFullApp = async () => {
    await premium.startPurchase({
      productId: "full_app_unlock",
      returnPath: "/energy-healing",
    });
  };

  const modalities = ["all", ...new Set(practices.map(p => p.modality).filter(Boolean))];
  const filtered = filterModality === "all" ? practices : practices.filter(p => p.modality?.toLowerCase() === filterModality.toLowerCase());
  const getColors = (m) => {
    const key = Object.keys(MODALITY_COLORS).find(k => m?.toLowerCase().includes(k));
    return MODALITY_COLORS[key] || MODALITY_COLORS.reiki;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="energy-healing-page">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-amber-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4 text-muted-foreground" data-testid="energy-back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Energy Healing</h1>
              <p className="text-muted-foreground mt-1">Self-healing guides for every modality</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!energyUnlocked && (
          <section className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4" data-testid="energy-healing-premium-banner">
            <p className="text-xs uppercase tracking-wider text-amber-200/80">Energy Healing Premium</p>
            <p className="text-sm text-muted-foreground mt-1" data-testid="energy-healing-premium-banner-description">First 4 practices are free. The rest unlock with subscription or full app access.</p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => navigate("/pricing")} data-testid="energy-healing-view-subscription-button">View Subscription Plans</Button>
              <Button variant="outline" onClick={handleUnlockFullApp} disabled={premium.purchaseLoadingId === "full_app_unlock"} data-testid="energy-healing-unlock-fullapp-button">
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
          </section>
        )}

        <div className="flex gap-2 flex-wrap mb-8">
          {modalities.map(m => (
            <button key={m} onClick={() => setFilterModality(m)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                filterModality === m ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`} data-testid={`filter-${m}`}>
              {m === "all" ? "All Modalities" : m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>
        ) : practices.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Healing Modalities Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Sacred healing teachings are being prepared. Add modalities through the Admin CMS.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((practice, index) => {
              const colors = getColors(practice.modality);
              return (
                <motion.div key={practice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 group ${colors.border} bg-white/[0.02]`}
                  onClick={() => {
                    if (!canAccessPractice(practice)) {
                      setSelectedLockedPractice(practice);
                      return;
                    }
                    setSelectedPractice(practice);
                    setExpandedSection("guide");
                  }}
                  data-testid={`healing-card-${practice.id}`}>
                  {practice.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>{practice.modality}</span>
                      {practice.is_premium && !canAccessPractice(practice) && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-300/40 backdrop-blur-sm" data-testid={`energy-healing-premium-badge-${practice.id}`}>
                          <Lock className="w-3 h-3 inline mr-1" />Premium
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className={`h-32 flex items-center justify-center ${colors.bg}`}>
                      <Sparkles className={`w-12 h-12 ${colors.text} opacity-40`} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-2 group-hover:text-amber-300 transition-colors">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {practice.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{practice.duration_minutes} min</span>}
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />Self-Healing Guide</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedPractice(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
              data-testid="healing-detail-modal">
              {selectedPractice.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs ${getColors(selectedPractice.modality).bg} ${getColors(selectedPractice.modality).text}`}>{selectedPractice.modality}</span>
                  {selectedPractice.element && <span className="px-3 py-1 rounded-full text-xs bg-white/5">{selectedPractice.element}</span>}
                  {selectedPractice.duration_minutes && <span className="px-3 py-1 rounded-full text-xs bg-white/5 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPractice.duration_minutes} min</span>}
                </div>
                <h2 className="text-2xl font-serif mb-3">{selectedPractice.name}</h2>
                <p className="text-foreground/85 leading-relaxed mb-4">{selectedPractice.description}</p>

                {/* Expandable sections */}
                {[
                  { key: "guide", label: "Self-Healing Guide", icon: Heart, content: selectedPractice.self_healing_guide },
                  { key: "how", label: "How It Works", icon: Sparkles, content: selectedPractice.how_it_works },
                  { key: "history", label: "History & Origin", icon: Shield, content: selectedPractice.history },
                  { key: "alchemy", label: "Alchemy", icon: Sparkles, content: selectedPractice.alchemy },
                  { key: "ritual", label: "Ritual Steps", icon: Heart, content: selectedPractice.ritual },
                  { key: "ceremony", label: "Ceremonial Arc", icon: Shield, content: selectedPractice.ceremony },
                  { key: "guided", label: "Guided Practice Arc", icon: Sparkles, content: selectedPractice.guided_practice },
                ].filter(s => s.content).map(section => (
                  <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      data-testid={`section-${section.key}`}>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <section.icon className="w-4 h-4 text-amber-400" />{section.label}
                      </span>
                      {expandedSection === section.key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSection === section.key && (
                      <div className="px-4 pb-4 text-sm text-foreground/85 whitespace-pre-line leading-relaxed">{section.content}</div>
                    )}
                  </div>
                ))}

                {selectedPractice.benefits && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Benefits</h3>
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedPractice.benefits === 'string' ? selectedPractice.benefits.split(',') : selectedPractice.benefits).map(b => (
                        <span key={b} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPractice.ritual_tools?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Ritual Tools</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPractice.ritual_tools.map((tool) => (
                        <span key={tool} className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPractice.meridian_functions?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Meridian & Function Links</h3>
                    <ul className="space-y-1">
                      {selectedPractice.meridian_functions.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-cyan-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPractice.body_ailment_connections?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Body / Ailment Connections</h3>
                    <ul className="space-y-1">
                      {selectedPractice.body_ailment_connections.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-amber-300">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <EmbodimentProtocolPanel
                  practiceName={selectedPractice.name}
                  element={selectedPractice.element || selectedPractice.modality || "Spirit"}
                  anatomyMode="meridian"
                  testIdPrefix="energy-healing-embodiment"
                />

                <section className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4" data-testid="energy-healing-anatomy-emotion-education">
                  <h3 className="text-sm font-medium mb-2">Body Signals Decoder (Beginner-Friendly)</h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• <span className="text-cyan-100">Heavy chest / sighing:</span> often linked to grief, protection fatigue, or unprocessed relational stress.</li>
                    <li>• <span className="text-cyan-100">Solar knot / nausea:</span> often linked to over-control, fear, or boundary confusion.</li>
                    <li>• <span className="text-cyan-100">Jaw / throat tension:</span> often linked to unspoken truth or fear of conflict.</li>
                    <li>• <span className="text-cyan-100">Pelvic guarding:</span> often linked to safety, intimacy, or creative-energy shutdown.</li>
                    <li>• <span className="text-cyan-100">Cold feet / leg heaviness:</span> often linked to survival stress and grounding depletion.</li>
                  </ul>
                </section>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-4" data-testid="energy-healing-guided-voice-panel">
                  <p className="text-xs uppercase tracking-wider text-primary/80 mb-1">Immersive Guided Voice</p>
                  <p className="text-xs text-muted-foreground mb-3">Listen to a deep ceremonial sequence with breath pacing, embodiment cues, and healing integration.</p>
                  <GuidedAudioButton
                    api={api}
                    script={buildEnergyImmersiveScript(selectedPractice)}
                    practiceName={selectedPractice.name}
                    durationMinutes={Math.max(14, Number(selectedPractice.duration_minutes || 24))}
                    element={selectedPractice.element || selectedPractice.modality || "Spirit"}
                    sourceTexts={[
                      selectedPractice.description,
                      selectedPractice.precision_description,
                      selectedPractice.self_healing_guide,
                      selectedPractice.how_it_works,
                      ...(toList(selectedPractice.alchemy)),
                      ...(toList(selectedPractice.ceremony)),
                    ]}
                    steps={[
                      ...(toList(selectedPractice.ritual)),
                      ...(toList(selectedPractice.guided_practice)),
                      ...(toList(selectedPractice.practice)),
                    ]}
                    className="w-full"
                  />
                </div>

                <Button variant="ghost" onClick={() => setSelectedPractice(null)} className="w-full mt-4">Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedLockedPractice && !energyUnlocked && (
        <div className="fixed inset-0 z-[220] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center" data-testid="energy-healing-premium-lock-modal">
          <div className="w-full max-w-lg rounded-2xl border border-fuchsia-500/30 bg-[#130f1f] p-6">
            <div className="flex items-center gap-2 text-fuchsia-200 mb-2"><Lock className="w-4 h-4" /><p className="text-xs uppercase tracking-wider">Premium Energy Healing</p></div>
            <h3 className="text-2xl font-serif mb-2" data-testid="energy-healing-premium-lock-title">{selectedLockedPractice.name}</h3>
            <p className="text-sm text-muted-foreground mb-4" data-testid="energy-healing-premium-lock-description">This modality is premium. Continue with subscription or full app access.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" className="border-cyan-400/40 text-cyan-100 sm:col-span-2" onClick={() => navigate("/pricing")} data-testid="energy-healing-premium-lock-subscription-button">View Subscription Plans</Button>
              <Button onClick={handleUnlockFullApp} variant="outline" className="border-amber-400/40 text-amber-100" data-testid="energy-healing-premium-lock-fullapp-button" disabled={premium.purchaseLoadingId === "full_app_unlock"}>
                {premium.purchaseLoadingId === "full_app_unlock" ? "Opening checkout..." : `Full App ${fullAppProduct?.price?.toFixed(2) || "369.00"}`}
              </Button>
            </div>
            <Button variant="ghost" className="w-full mt-3" onClick={() => setSelectedLockedPractice(null)} data-testid="energy-healing-premium-lock-close-button">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}
