import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Clock, Heart, Sun, ChevronDown, ChevronUp, Loader2, Zap, Moon, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import axios from "axios";

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

  useEffect(() => { fetchPractices(); }, []);

  const fetchPractices = async () => {
    try {
      const { data } = await api.get("/chakra-cleansing");
      setPractices(data);
    } catch { toast.error("Failed to load practices"); }
    finally { setLoading(false); }
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
            onClick={() => setSelectedPractice(null)}>
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
                  { key: "guide", label: "Self-Healing Guide", icon: Heart, content: selectedPractice.cleansing_guide },
                  { key: "signs", label: "Signs of Imbalance", icon: Flame, content: selectedPractice.signs_of_imbalance },
                  { key: "affirmations", label: "Healing Affirmations", icon: Sun, content: selectedPractice.affirmations },
                  { key: "crystals", label: "Supporting Crystals", icon: Sparkles, content: selectedPractice.crystals },
                ].filter(s => s.content).map(section => (
                  <div key={section.key} className="mb-3 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                      data-testid={`section-${section.key}`}>
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <section.icon className="w-4 h-4 text-violet-400" />{section.label}
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
                    <h3 className="text-sm font-medium mb-2">Benefits When Balanced</h3>
                    <div className="flex flex-wrap gap-2">
                      {(typeof selectedPractice.benefits === 'string' ? selectedPractice.benefits.split(',') : selectedPractice.benefits).map((b, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs">{typeof b === 'string' ? b.trim() : b}</span>
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
