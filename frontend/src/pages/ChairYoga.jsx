import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Heart, Leaf, ChevronDown, ChevronUp, Loader2, Activity, Feather, Moon, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { EmbodimentProtocolPanel } from "../components/practice/EmbodimentProtocolPanel";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { toast } from "sonner";
import axios from "axios";
import { resolveDurationMinutes } from "../utils/durationUtils";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const STYLE_COLORS = {
  gentle: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: Leaf },
  restorative: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: Moon },
  trauma: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: Heart },
  flow: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: Activity },
  intuitive: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", icon: Sparkles },
  grounding: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: Feather },
};

const CHAIR_YOGA_SHAMANIC_IMAGES = [
  "https://images.unsplash.com/photo-1562088287-6d37803aca2f?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1562088287-bde35a1ea917?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1610295272575-7376b67b3e96?crop=entropy&cs=srgb&fm=jpg&q=85",
];

export default function ChairYoga() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filterStyle, setFilterStyle] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/chair-yoga");
      setPractices(data);
    } catch { toast.error("Failed to load practices"); }
    finally { setLoading(false); }
  };

  const styles = ["all", ...new Set(practices.map(p => p.style).filter(Boolean))];
  const filtered = filterStyle === "all" ? practices : practices.filter(p => p.style?.toLowerCase() === filterStyle.toLowerCase());
  
  const getStyleConfig = (style) => {
    const key = Object.keys(STYLE_COLORS).find(k => style?.toLowerCase().includes(k));
    return STYLE_COLORS[key] || STYLE_COLORS.gentle;
  };

  const getPracticeImage = (practice, index = 0) => {
    const baseIndex = Number.parseInt(String(practice?.id || index), 10);
    const safeIndex = Number.isFinite(baseIndex) ? baseIndex : index;
    return CHAIR_YOGA_SHAMANIC_IMAGES[safeIndex % CHAIR_YOGA_SHAMANIC_IMAGES.length];
  };

  return (
    <div className="min-h-screen bg-background" data-testid="chair-yoga-page">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-emerald-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-lime-500/10">
              <Users className="w-8 h-8 text-lime-300" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Chair Yoga</h1>
              <p className="text-muted-foreground mt-1">Accessible seated healing for every mobility level</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <h2 className="text-lg font-serif mb-2 text-lime-300">What is Chair Yoga?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Chair Yoga offers the therapeutic essence of yoga with seated, supported adaptations. It is ideal for nervous-system regulation,
            rehabilitation phases, limited mobility days, or anyone wanting joint-safe embodiment work. Through paced breath, supported mobility,
            and mindful sensing, Chair Yoga builds strength, steadiness, and emotional ease without strain.
          </p>
        </div>

        {/* Style filters */}
        {styles.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {styles.map(style => {
              const config = STYLE_COLORS[style] || STYLE_COLORS.gentle;
              return (
                <button key={style} onClick={() => setFilterStyle(style)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                    filterStyle === style ? `${config.bg} ${config.text} border ${config.border}` : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`} data-testid={`filter-${style}`}>
                  {style === "all" ? "All Styles" : style}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-lime-300" /></div>
        ) : practices.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Chair Yoga Practices Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Accessible seated sequences are being prepared. Add practices through the Admin CMS.</p>
            
            {/* Helpful content while empty */}
            <div className="mt-8 max-w-xl mx-auto text-left p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <h3 className="font-serif text-lg mb-3 text-lime-300">Key Chair Yoga Principles</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Support First:</strong> Use stable seating and optional wall support</li>
                <li>• <strong>Joint Safety:</strong> Move pain-free and avoid forcing range</li>
                <li>• <strong>Breath Pacing:</strong> Match movement to smooth inhale/exhale cycles</li>
                <li>• <strong>Accessibility:</strong> Adapt posture depth to your energy level</li>
                <li>• <strong>Integration:</strong> Close with grounding and hydration</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((practice, index) => {
              const config = getStyleConfig(practice.style);
              return (
                <motion.div key={practice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 group ${config.border} bg-white/[0.02]`}
                  onClick={() => { setSelectedPractice(practice); setExpandedSection("guide"); }}
                  data-testid={`chair-yoga-card-${practice.id}`}>
                  {practice.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={getPracticeImage(practice, index)} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" data-testid={`chair-yoga-card-image-${practice.id}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} backdrop-blur-sm capitalize`}>{practice.style || practice.category}</span>
                    </div>
                  ) : (
                    <div className={`h-32 flex items-center justify-center ${config.bg}`}>
                      <config.icon className={`w-12 h-12 ${config.text} opacity-40`} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-2 group-hover:text-lime-300 transition-colors">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {practice.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{practice.duration_minutes} min</span>}
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />Seated & Supported</span>
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
              data-testid="chair-yoga-detail-modal">
              {selectedPractice.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img src={getPracticeImage(selectedPractice, 0)} alt={selectedPractice.name} className="w-full h-full object-cover" data-testid="chair-yoga-selected-image" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs ${getStyleConfig(selectedPractice.style).bg} ${getStyleConfig(selectedPractice.style).text} capitalize`}>{selectedPractice.style || selectedPractice.category}</span>
                  {selectedPractice.intensity && <span className="px-3 py-1 rounded-full text-xs bg-white/5 capitalize">{selectedPractice.intensity}</span>}
                  {selectedPractice.duration_minutes && <span className="px-3 py-1 rounded-full text-xs bg-white/5 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPractice.duration_minutes} min</span>}
                </div>
                <h2 className="text-2xl font-serif mb-3">{selectedPractice.name}</h2>
                <p className="text-muted-foreground mb-4">{selectedPractice.description}</p>

                {/* Expandable sections */}
                {[
                  { key: "guide", label: "Practice Guide", icon: Activity, content: selectedPractice.practice_guide },
                  { key: "body", label: "Body Focus Areas", icon: Heart, content: selectedPractice.body_focus },
                  { key: "breathing", label: "Breathing Pattern", icon: Feather, content: selectedPractice.breathing_pattern },
                ].filter(s => s.content).map(section => (
                  <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      data-testid={`section-${section.key}`}>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <section.icon className="w-4 h-4 text-lime-300" />{section.label}
                      </span>
                      {expandedSection === section.key ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSection === section.key && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{section.content}</div>
                    )}
                  </div>
                ))}

                {selectedPractice.benefits && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Benefits</h3>
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedPractice.benefits === 'string' ? selectedPractice.benefits.split(',') : selectedPractice.benefits).map((b, i) => (
                        <span key={`${selectedPractice.id || selectedPractice.name}-benefit-${String(b).slice(0, 24)}-${i}`} className="px-3 py-1 rounded-full bg-lime-500/10 text-lime-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPractice && (
                  <div className="mt-4" data-testid="chair-yoga-voice-guidance-section">
                    <GuidedAudioButton
                      api={api}
                      script={`Welcome to ${selectedPractice.name}. ${selectedPractice.description || "Begin seated with a long spine and soft breath."} ${selectedPractice.practice_guide || "Move gently, breathe steadily, and stop if anything feels sharp."} ${selectedPractice.breathing_pattern ? `Breathing pattern: ${selectedPractice.breathing_pattern}.` : "Keep inhale and exhale smooth and even."}`}
                      label={`Play ${selectedPractice.name} Voice Guidance`}
                      element={selectedPractice.element || "Earth"}
                      durationMinutes={resolveDurationMinutes(selectedPractice.duration_minutes, 8)}
                      practiceName={selectedPractice.name}
                      sourceTexts={[
                        selectedPractice.description,
                        selectedPractice.practice_guide,
                        selectedPractice.body_focus,
                        selectedPractice.breathing_pattern,
                      ].filter(Boolean)}
                      steps={Array.isArray(selectedPractice.instructions) ? selectedPractice.instructions : []}
                    />
                  </div>
                )}

                <EmbodimentProtocolPanel
                  practiceName={selectedPractice.name}
                  element={selectedPractice.element || "Earth"}
                  anatomyMode="muscle"
                  testIdPrefix="chair-yoga-embodiment"
                />

                <Button variant="ghost" onClick={() => setSelectedPractice(null)} className="w-full mt-4">Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
