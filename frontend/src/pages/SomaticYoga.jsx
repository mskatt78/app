import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Heart, Leaf, ChevronDown, ChevronUp, Loader2, Activity, Feather, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { EmbodimentProtocolPanel } from "../components/practice/EmbodimentProtocolPanel";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { toast } from "sonner";
import axios from "axios";
import { resolveDurationMinutes } from "../utils/durationUtils";
import { getSubjectPoseImage } from "../utils/yogaPoseImageMapper";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const STYLE_COLORS = {
  gentle: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: Leaf },
  restorative: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: Moon },
  trauma: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: Heart },
  flow: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: Activity },
  intuitive: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", icon: Sparkles },
  grounding: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: Feather },
};

const SOMATIC_YOGA_SHAMANIC_IMAGES = [
  "https://images.unsplash.com/photo-1610295272575-7376b67b3e96?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1603983616619-faf118d6c374?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1609433861367-c3ab700c51d1?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1524863479829-916d8e77f114?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1526916027372-0c0852cef5d3?crop=entropy&cs=srgb&fm=jpg&q=85",
];

export default function SomaticYoga() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filterStyle, setFilterStyle] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/somatic-yoga");
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
    const subjectImage = getSubjectPoseImage(practice, "");
    if (subjectImage) return subjectImage;
    const baseIndex = Number.parseInt(String(practice?.id || index), 10);
    const safeIndex = Number.isFinite(baseIndex) ? baseIndex : index;
    return SOMATIC_YOGA_SHAMANIC_IMAGES[safeIndex % SOMATIC_YOGA_SHAMANIC_IMAGES.length];
  };

  return (
    <div className="min-h-screen bg-background" data-testid="somatic-yoga-page">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-emerald-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Somatic Yoga</h1>
              <p className="text-muted-foreground mt-1">Body-centered healing through mindful movement</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <h2 className="text-lg font-serif mb-2 text-emerald-400">What is Somatic Yoga?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Somatic Yoga combines traditional yoga with somatic awareness—the internal physical perception and experience of the body. 
            This practice emphasizes internal awareness rather than external form, helping release stored tension, trauma, and emotional patterns 
            held in the body. Through slow, mindful movements and body sensing, you reconnect with your innate wisdom for healing.
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
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
        ) : practices.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Somatic Yoga Practices Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Body-centered healing sequences are being prepared. Add practices through the Admin CMS.</p>
            
            {/* Helpful content while empty */}
            <div className="mt-8 max-w-xl mx-auto text-left p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <h3 className="font-serif text-lg mb-3 text-emerald-400">Key Somatic Yoga Principles</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Interoception:</strong> Cultivating awareness of internal body sensations</li>
                <li>• <strong>Pandiculation:</strong> Conscious contraction and slow release of muscles</li>
                <li>• <strong>Proprioception:</strong> Sensing body position and movement in space</li>
                <li>• <strong>Nervous System Regulation:</strong> Activating the parasympathetic response</li>
                <li>• <strong>Trauma Release:</strong> Allowing stored tension to naturally unwind</li>
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
                  data-testid={`somatic-card-${practice.id}`}>
                  {practice.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={getPracticeImage(practice, index)} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" data-testid={`somatic-yoga-card-image-${practice.id}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text} backdrop-blur-sm capitalize`}>{practice.style || practice.category}</span>
                    </div>
                  ) : (
                    <div className={`h-32 flex items-center justify-center ${config.bg}`}>
                      <config.icon className={`w-12 h-12 ${config.text} opacity-40`} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-2 group-hover:text-emerald-300 transition-colors">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {practice.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{practice.duration_minutes} min</span>}
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />Body-Centered</span>
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
              data-testid="somatic-detail-modal">
              {selectedPractice.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img src={getPracticeImage(selectedPractice, 0)} alt={selectedPractice.name} className="w-full h-full object-cover" data-testid="somatic-yoga-selected-image" />
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
                        <section.icon className="w-4 h-4 text-emerald-400" />{section.label}
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
                        <span key={`${selectedPractice.id || selectedPractice.name}-benefit-${String(b).slice(0, 24)}-${i}`} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPractice && (
                  <div className="mt-4" data-testid="somatic-yoga-voice-guidance-section">
                    <GuidedAudioButton
                      api={api}
                      script={`Welcome to ${selectedPractice.name}. ${selectedPractice.description || "Begin with steady breath and internal awareness."} ${selectedPractice.practice_guide || "Move slowly and stay inside comfortable range."} ${selectedPractice.breathing_pattern ? `Breathing pattern: ${selectedPractice.breathing_pattern}.` : "Keep inhale and exhale even."}`}
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
                  testIdPrefix="somatic-yoga-embodiment"
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
