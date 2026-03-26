import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Play, Wind, ChevronDown, ChevronUp, Loader2, Music, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

const api = axios.create({ baseURL: `${process.env.REACT_APP_BACKEND_URL}/api` });

const CATEGORY_COLORS = {
  ecstatic: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", text: "text-fuchsia-400", icon: Sparkles },
  somatic: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: Heart },
  intuitive: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", icon: Wind },
  primal: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", icon: Music },
  flow: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", icon: Wind },
  expressive: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: Sparkles },
};

export default function FreeFormMovement() {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedSection, setExpandedSection] = useState("guide");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/free-form-movement");
      setPractices(data);
    } catch { toast.error("Failed to load practices"); }
    finally { setLoading(false); }
  };

  const categories = ["all", ...new Set(practices.map(p => p.category).filter(Boolean))];
  const filtered = filterCategory === "all" ? practices : practices.filter(p => p.category?.toLowerCase() === filterCategory.toLowerCase());
  
  const getColors = (cat) => {
    const key = Object.keys(CATEGORY_COLORS).find(k => cat?.toLowerCase().includes(k));
    return CATEGORY_COLORS[key] || CATEGORY_COLORS.flow;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="free-form-movement-page">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-fuchsia-950/30 to-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-fuchsia-500/10">
              <Wind className="w-8 h-8 text-fuchsia-400" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-serif">Free Form Movement</h1>
              <p className="text-muted-foreground mt-1">Liberation through intuitive dance & somatic expression</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                filterCategory === cat ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              }`} data-testid={`filter-${cat}`}>
              {cat === "all" ? "All Practices" : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" /></div>
        ) : practices.length === 0 ? (
          <div className="text-center py-20">
            <Wind className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-2xl font-serif mb-2">Movement Practices Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Sacred movement teachings are being prepared. Add practices through the Admin CMS.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((practice, index) => {
              const colors = getColors(practice.category);
              return (
                <motion.div key={practice.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-[1.02] transition-all duration-300 group ${colors.border} bg-white/[0.02]`}
                  onClick={() => { setSelectedPractice(practice); setExpandedSection("guide"); }}
                  data-testid={`movement-card-${practice.id}`}>
                  {practice.image_url ? (
                    <div className="relative h-44 overflow-hidden">
                      <img src={practice.image_url} alt={practice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm capitalize`}>{practice.category}</span>
                    </div>
                  ) : (
                    <div className={`h-32 flex items-center justify-center ${colors.bg}`}>
                      <Wind className={`w-12 h-12 ${colors.text} opacity-40`} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-2 group-hover:text-fuchsia-300 transition-colors">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{practice.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {practice.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{practice.duration_minutes} min</span>}
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" />Self-Guided</span>
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
              data-testid="movement-detail-modal">
              {selectedPractice.image_url && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img src={selectedPractice.image_url} alt={selectedPractice.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs ${getColors(selectedPractice.category).bg} ${getColors(selectedPractice.category).text} capitalize`}>{selectedPractice.category}</span>
                  {selectedPractice.intensity && <span className="px-3 py-1 rounded-full text-xs bg-white/5 capitalize">{selectedPractice.intensity} intensity</span>}
                  {selectedPractice.duration_minutes && <span className="px-3 py-1 rounded-full text-xs bg-white/5 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedPractice.duration_minutes} min</span>}
                </div>
                <h2 className="text-2xl font-serif mb-3">{selectedPractice.name}</h2>
                <p className="text-muted-foreground mb-4">{selectedPractice.description}</p>

                {/* Expandable sections */}
                {[
                  { key: "guide", label: "Practice Guide", icon: Play, content: selectedPractice.practice_guide },
                  { key: "music", label: "Music Suggestions", icon: Music, content: selectedPractice.music_suggestions },
                  { key: "preparation", label: "Preparation", icon: Sparkles, content: selectedPractice.preparation },
                ].filter(s => s.content).map(section => (
                  <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      data-testid={`section-${section.key}`}>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <section.icon className="w-4 h-4 text-fuchsia-400" />{section.label}
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
                        <span key={i} className="px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="ghost" onClick={() => setSelectedPractice(null)} className="w-full mt-4">Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
