import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Heart, Sun, ChevronDown, ChevronUp, Loader2, Zap, Moon, Flame, Volume2, Share2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import AddToJournal from "../components/AddToJournal";
import ShareToCircle from "../components/ShareToCircle";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const CHAKRA_CONFIG = {
  earth_star: { color: "bg-stone-700", border: "border-stone-500/30", text: "text-stone-400", icon: "🌍", sanskrit: "Vasundhara", element: "Earth Core", location: "12 inches below feet", order: 0 },
  root: { color: "bg-red-500", border: "border-red-500/30", text: "text-red-400", icon: "🔴", sanskrit: "Muladhara", element: "Earth", location: "Base of spine", order: 1 },
  sacral: { color: "bg-orange-500", border: "border-orange-500/30", text: "text-orange-400", icon: "🟠", sanskrit: "Svadhisthana", element: "Water", location: "Below navel", order: 2 },
  solar: { color: "bg-yellow-500", border: "border-yellow-500/30", text: "text-yellow-400", icon: "🟡", sanskrit: "Manipura", element: "Fire", location: "Solar plexus", order: 3 },
  heart: { color: "bg-green-500", border: "border-green-500/30", text: "text-green-400", icon: "💚", sanskrit: "Anahata", element: "Air", location: "Heart center", order: 4 },
  higher_heart: { color: "bg-teal-400", border: "border-teal-400/30", text: "text-teal-300", icon: "💎", sanskrit: "Thymus", element: "Higher Air", location: "Between heart & throat", order: 5 },
  throat: { color: "bg-cyan-500", border: "border-cyan-500/30", text: "text-cyan-400", icon: "🔵", sanskrit: "Vishuddha", element: "Ether", location: "Throat", order: 6 },
  third_eye: { color: "bg-indigo-500", border: "border-indigo-500/30", text: "text-indigo-400", icon: "💜", sanskrit: "Ajna", element: "Light", location: "Between brows", order: 7 },
  crown: { color: "bg-violet-500", border: "border-violet-500/30", text: "text-violet-400", icon: "👑", sanskrit: "Sahasrara", element: "Cosmic", location: "Crown of head", order: 8 },
  causal: { color: "bg-pink-300", border: "border-pink-300/30", text: "text-pink-200", icon: "🌸", sanskrit: "Causal", element: "Divine Feminine", location: "Back of head", order: 9 },
  soul_star: { color: "bg-white", border: "border-white/30", text: "text-white", icon: "⭐", sanskrit: "Sutara", element: "Soul Light", location: "6 inches above crown", order: 10 },
  stellar: { color: "bg-amber-200", border: "border-amber-200/30", text: "text-amber-100", icon: "✨", sanskrit: "Stellar Gateway", element: "Galactic", location: "12 inches above crown", order: 11 },
  universal: { color: "bg-gradient-to-r from-violet-400 to-amber-300", border: "border-amber-300/30", text: "text-amber-200", icon: "🌌", sanskrit: "Universal Gateway", element: "Source", location: "18 inches above crown", order: 12 },
};

export default function ChakraCleansing() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filterChakra, setFilterChakra] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");
  const [audioState, setAudioState] = useState({ loading: false, audioUrl: null, sectionKey: null });
  const [showShare, setShowShare] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  useEffect(() => {
    return () => {
      if (audioState.audioUrl) URL.revokeObjectURL(audioState.audioUrl);
    };
  }, [audioState.audioUrl]);

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/chakra-cleansing");
      setPractices(data);
    } catch { toast.error("Failed to load practices"); }
    finally { setLoading(false); }
  };

  const generateAudio = async (text, sectionKey) => {
    if (!text) return;
    // Toggle off if same section already playing
    if (audioState.sectionKey === sectionKey && audioState.audioUrl) {
      URL.revokeObjectURL(audioState.audioUrl);
      setAudioState({ loading: false, audioUrl: null, sectionKey: null });
      return;
    }
    setAudioState({ loading: true, audioUrl: null, sectionKey });
    try {
      const safeText = typeof text === "string" ? text : text.join ? text.join(". ") : String(text);
      const { data } = await api.post("/tts/generate-base64", {
        text: safeText.slice(0, 3800),
        voice: "nova",
        speed: 0.85,
      });
      const binary = atob(data.audio_base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioState({ loading: false, audioUrl: url, sectionKey });
    } catch {
      toast.error("Could not generate audio narration");
      setAudioState({ loading: false, audioUrl: null, sectionKey: null });
    }
  };

  const chakras = ["all", ...Object.keys(CHAKRA_CONFIG)];
  const filtered = filterChakra === "all" ? practices : practices.filter(p => p.chakra?.toLowerCase().replace(/[^a-z]/g, '_').includes(filterChakra));
  
  const getChakraConfig = (chakra) => {
    const key = Object.keys(CHAKRA_CONFIG).find(k => chakra?.toLowerCase().includes(k));
    return CHAKRA_CONFIG[key] || CHAKRA_CONFIG.heart;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="chakra-cleansing-page">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 via-green-500/20 to-violet-500/20">
              <Zap className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Chakra Cleansing</h1>
              <p className="text-muted-foreground mt-1">Self-healing guides for all 13 energy centers</p>
            </div>
          </div>
          
          {/* Chakra visual strip - 13 chakras */}
          <div className="flex gap-1.5 mt-6 justify-center flex-wrap">
            {Object.entries(CHAKRA_CONFIG)
              .sort((a, b) => a[1].order - b[1].order)
              .map(([key, config], idx) => (
              <div key={key} className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${config.color} opacity-80 animate-pulse shadow-lg`} 
                style={{ animationDelay: `${idx * 0.08}s` }} 
                title={`${config.sanskrit} - ${config.location}`} />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Chakra filters */}
        <div className="flex gap-2 flex-wrap mb-8 justify-center">
          {chakras.map(chakra => {
            const config = CHAKRA_CONFIG[chakra];
            return (
              <button key={chakra} onClick={() => setFilterChakra(chakra)}
                className={`px-4 py-2 rounded-full text-sm capitalize transition-all flex items-center gap-2 ${
                  filterChakra === chakra 
                    ? config ? `${config.color}/20 ${config.text} border ${config.border}` : "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`} data-testid={`filter-${chakra}`}>
                {config && <span>{config.icon}</span>}
                {chakra === "all" ? "All Chakras" : chakra.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>
        ) : practices.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Chakra Practices Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Sacred chakra healing guides are being prepared. Add practices through the Admin CMS.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((practice, index) => {
              const config = getChakraConfig(practice.chakra);
              return (
                <motion.div key={practice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 group ${config.border} bg-white/[0.02]`}
                  onClick={() => { setSelectedPractice(practice); setExpandedSection("guide"); }}
                  data-testid={`chakra-card-${practice.id}`}>
                  {practice.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${config.color}/20 ${config.text} backdrop-blur-sm flex items-center gap-1`}>
                        {config.icon} {practice.chakra}
                      </span>
                    </div>
                  ) : (
                    <div className={`h-32 flex items-center justify-center ${config.color}/10`}>
                      <span className="text-5xl">{config.icon}</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className={`text-lg font-serif mb-2 group-hover:${config.text} transition-colors`}>{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {practice.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{practice.duration_minutes} min</span>}
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />Self-Healing</span>
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
            onClick={() => { setSelectedPractice(null); setAudioState({ loading: false, audioUrl: null, sectionKey: null }); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-white/10"
              data-testid="chakra-detail-modal">
              {selectedPractice.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                {(() => {
                  const config = getChakraConfig(selectedPractice.chakra);
                  return (
                    <>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${config.color}/20 ${config.text} flex items-center gap-1`}>
                          {config.icon} {selectedPractice.chakra}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-white/5">{config.sanskrit}</span>
                        <span className="px-3 py-1 rounded-full text-xs bg-white/5">{config.element} Element</span>
                        {selectedPractice.duration_minutes && (
                          <span className="px-3 py-1 rounded-full text-xs bg-white/5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />{selectedPractice.duration_minutes} min
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-serif mb-1">{selectedPractice.name}</h2>
                      <p className="text-sm text-muted-foreground mb-3">Location: {config.location}</p>
                      <p className="text-muted-foreground mb-4">{selectedPractice.description}</p>
                    </>
                  );
                })()}

                {/* Expandable sections */}
                {[
                  { key: "why", label: "Why This Heals", icon: Sparkles, content: selectedPractice.why_this_heals },
                  { key: "teaching", label: "Deeper Teaching", icon: Sparkles, content: selectedPractice.deeper_teaching || selectedPractice.deeper_teachings },
                  { key: "guide", label: "Self-Healing Guide", icon: Heart, content: selectedPractice.cleansing_guide },
                  { key: "somatic", label: "Somatic Practice", icon: Zap, content: selectedPractice.somatic_practice },
                  { key: "signs", label: "Signs of Imbalance", icon: Flame, content: selectedPractice.signs_of_imbalance },
                  { key: "healing", label: "Signs of Healing", icon: Sun, content: selectedPractice.signs_of_healing },
                  { key: "shadow", label: "Shadow Work", icon: Moon, content: selectedPractice.shadow_work },
                  { key: "practices", label: "Healing Practices", icon: Heart, content: selectedPractice.healing_practices?.join ? selectedPractice.healing_practices.join("\n\n• ") : selectedPractice.healing_practices },
                  { key: "affirmations", label: "Healing Affirmations", icon: Heart, content: Array.isArray(selectedPractice.affirmations) ? selectedPractice.affirmations.join("\n") : selectedPractice.affirmations },
                  { key: "crystals", label: "Supporting Crystals", icon: Sparkles, content: selectedPractice.crystals },
                ].filter(s => s.content).map(section => (
                  <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                        className="flex items-center gap-2 text-sm font-medium flex-1 text-left"
                        data-testid={`section-${section.key}`}
                      >
                        <section.icon className="w-4 h-4 text-violet-400" />{section.label}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => generateAudio(section.content, section.key)}
                          className={`p-1.5 rounded-full transition-all ${audioState.sectionKey === section.key ? "bg-violet-500/20 text-violet-300" : "hover:bg-white/10 text-muted-foreground"}`}
                          title="Listen to narration"
                          data-testid={`listen-${section.key}`}
                        >
                          {audioState.loading && audioState.sectionKey === section.key
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Volume2 className="w-3.5 h-3.5" />
                          }
                        </button>
                        <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)} className="p-1">
                          {expandedSection === section.key ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </div>
                    </div>
                    {expandedSection === section.key && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {audioState.audioUrl && audioState.sectionKey === section.key && (
                          <div className="mb-3 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <p className="text-[10px] text-violet-400 mb-1.5 font-medium">Guided Narration</p>
                            <audio controls autoPlay src={audioState.audioUrl} className="w-full" style={{ height: "36px" }} />
                          </div>
                        )}
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}

                {/* Safety Precautions */}
                {selectedPractice.safety_precautions && (
                  <div className="mb-3 border border-red-500/20 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === "safety" ? null : "safety")}
                      className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors"
                      data-testid="section-safety">
                      <span className="flex items-center gap-2 text-sm font-medium text-red-400">
                        ⚠ Safety Precautions
                      </span>
                      {expandedSection === "safety" ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
                    </button>
                    {expandedSection === "safety" && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed bg-red-500/3">{selectedPractice.safety_precautions}</div>
                    )}
                  </div>
                )}

                {/* Daily Embodiment Ceremony */}
                {selectedPractice.daily_embodiment_ceremony && (
                  <div className="mb-3 border border-emerald-500/20 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === "daily" ? null : "daily")}
                      className="w-full flex items-center justify-between p-4 hover:bg-emerald-500/5 transition-colors"
                      data-testid="section-daily">
                      <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <Flame className="w-4 h-4" /> Daily Embodiment Ceremony
                      </span>
                      {expandedSection === "daily" ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
                    </button>
                    {expandedSection === "daily" && (
                      <div className="px-4 pb-4 bg-emerald-500/3 space-y-3">
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-emerald-300 font-medium text-sm">{selectedPractice.daily_embodiment_ceremony.name}</span>
                          <span className="text-xs text-muted-foreground">— {selectedPractice.daily_embodiment_ceremony.duration}</span>
                        </div>
                        <ol className="space-y-2">
                          {(selectedPractice.daily_embodiment_ceremony.steps || []).map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">{i+1}</span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {selectedPractice.benefits && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Benefits When Balanced</h3>
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedPractice.benefits === 'string' ? selectedPractice.benefits.split(',') : selectedPractice.benefits).map((b, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <AddToJournal 
                    practiceName={selectedPractice.name} 
                    practiceType="chakra" 
                    duration={selectedPractice.duration_minutes || 15}
                    buttonVariant="outline"
                    buttonSize="default"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowShare(true)}
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
                    data-testid="chakra-share-btn"
                  >
                    <Share2 className="w-3.5 h-3.5" />Share
                  </Button>
                  <Button
                    onClick={() => setShowGuided(true)}
                    className="bg-violet-500 hover:bg-violet-600 flex items-center gap-1.5"
                    data-testid="chakra-guided-btn"
                  >
                    <Play className="w-3.5 h-3.5" />Guided Practice
                  </Button>
                  <Button variant="ghost" onClick={() => { setSelectedPractice(null); setAudioState({ loading: false, audioUrl: null, sectionKey: null }); }} className="flex-1">Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share to Sacred Circle Modal */}
      <AnimatePresence>
        {showShare && selectedPractice && (
          <ShareToCircle
            practiceTitle={`${selectedPractice.chakra || selectedPractice.name} Chakra Cleansing`}
            practiceType="journey"
            defaultElement={selectedPractice.element || "Spirit"}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>

      {/* Guided Practice Full-Screen Overlay */}
      <AnimatePresence>
        {showGuided && selectedPractice && (
          <GuidedPracticeOverlay
            practice={{
              name: `${selectedPractice.chakra || selectedPractice.name} Chakra — Self-Healing`,
              duration_minutes: selectedPractice.duration_minutes || 20,
              element: selectedPractice.element || "Spirit",
              cleansing_guide: selectedPractice.cleansing_guide,
            }}
            onExit={() => setShowGuided(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
