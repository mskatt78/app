import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Waves, Music, Volume2, Clock, Sparkles,
  Drum, Wind, Droplets, Star, Heart, X
} from "lucide-react";
import { Button } from "../components/ui/button";
import AmbientSoundPlayer from "../components/AmbientSoundPlayer";

// Design system colors
const colors = {
  background: "#FDFBF7",
  surface: "#FFFFFF",
  primary: "#A96F6A",
  primaryHover: "#8A5652",
  secondary: "#E8D8CE",
  accent: "#D4AF37",
  textMain: "#3D2E2B",
  textMuted: "#7A706D",
  border: "#EAE1D9",
  success: "#6B8E73",
};

const HERO_IMAGE = "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=80";

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles, color: colors.accent },
  { id: "shamanic", label: "Shamanic Drums", icon: Drum, color: "#C4956A" },
  { id: "cetacean", label: "Dolphin & Whale", icon: Waves, color: "#5B8A9A" },
  { id: "instrument", label: "Instruments", icon: Music, color: colors.primary },
  { id: "frequency", label: "Pure Frequencies", icon: Volume2, color: colors.success },
  { id: "nature", label: "Nature Sounds", icon: Droplets, color: "#6B9AC4" },
];

const ELEMENT_COLORS = {
  Water: { text: "#5B8A9A", bg: "#E8F0F4", border: "#5B8A9A30" },
  Earth: { text: colors.success, bg: "#E8F4E8", border: `${colors.success}30` },
  Air: { text: "#6B9AC4", bg: "#E8F0F8", border: "#6B9AC430" },
  Fire: { text: "#C4956A", bg: "#FFF4E8", border: "#C4956A30" },
  Spirit: { text: colors.primary, bg: `${colors.primary}10`, border: `${colors.primary}30` },
  "Earth & Spirit": { text: colors.primary, bg: `${colors.primary}10`, border: `${colors.primary}30` },
  "Spirit & Fire": { text: colors.accent, bg: `${colors.accent}15`, border: `${colors.accent}30` },
  "Earth & Fire": { text: "#B85C38", bg: "#FFF0E8", border: "#B85C3830" },
  "Earth & Air": { text: "#5A9A7A", bg: "#E8F4F0", border: "#5A9A7A30" },
  "Air & Spirit": { text: "#7B68A6", bg: "#F0E8F4", border: "#7B68A630" },
};

const SoundFrequencies = ({ user, api }) => {
  const navigate = useNavigate();
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFreq, setSelectedFreq] = useState(null);
  const [filteredFreqs, setFilteredFreqs] = useState([]);

  useEffect(() => { fetchFrequencies(); }, []);
  useEffect(() => {
    setFilteredFreqs(activeCategory === "all" ? frequencies : frequencies.filter(f => f.category === activeCategory));
  }, [activeCategory, frequencies]);

  const fetchFrequencies = async () => {
    try { const response = await api.get("/sound-frequencies"); setFrequencies(response.data); setFilteredFreqs(response.data); } 
    catch (error) { console.error("Failed to fetch frequencies:", error); } 
    finally { setLoading(false); }
  };

  const getColors = (element) => ELEMENT_COLORS[element] || ELEMENT_COLORS.Water;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: "'Inter', sans-serif" }} data-testid="sound-frequencies">
      {/* Hero Header */}
      <header className="relative overflow-hidden" style={{ minHeight: "45vh" }}>
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.8)" }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${colors.background}10, ${colors.background}95)` }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 md:px-12 pt-8 pb-16">
          <button onClick={() => navigate("/menu")} className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105" style={{ color: colors.textMuted, backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)" }} data-testid="back-btn">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: colors.primary, fontWeight: 600 }}>Vibrational Healing</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: colors.textMain }}>
              Sound & Frequencies
            </h1>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
              Sound is the original medicine. From dolphin songs to crystal bowls, from ancient drums to sacred frequencies — discover the healing power of vibration and resonance.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} data-testid={`filter-${cat.id}`} className="px-5 py-2.5 rounded-full text-sm transition-all duration-300 flex items-center gap-2" style={{ backgroundColor: isActive ? `${cat.color}15` : colors.surface, color: isActive ? cat.color : colors.textMuted, border: `1px solid ${isActive ? cat.color : colors.border}` }}>
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: `${colors.primary}30`, borderTopColor: colors.primary }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFreqs.map((freq, index) => {
                const elemColors = getColors(freq.element);
                return (
                  <motion.div key={freq.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.04 }} onClick={() => setSelectedFreq(freq)} className="group cursor-pointer" data-testid={`freq-card-${freq.id}`}>
                    <div className="rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, boxShadow: "0 8px 30px rgba(169,111,106,0.05)" }}>
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden">
                        <img src={freq.image_url} alt={freq.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(61,46,43,0.7) 0%, transparent 50%)" }} />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm" style={{ backgroundColor: `${elemColors.bg}`, color: elemColors.text, border: `1px solid ${elemColors.border}` }}>
                            {freq.element}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full text-xs backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)", color: colors.textMuted }}>
                            {freq.frequency_range}
                          </span>
                        </div>
                        
                        {/* Title overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg text-white" style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{freq.name}</h3>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-5">
                        <p className="text-sm line-clamp-2 mb-4" style={{ color: colors.textMuted }}>{freq.description}</p>
                        
                        {/* Healing Properties Preview */}
                        <div className="flex flex-wrap gap-1.5">
                          {freq.healing_properties?.slice(0, 3).map((prop, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors.secondary}50`, color: colors.textMuted }}>{prop}</span>
                          ))}
                          {freq.healing_properties?.length > 3 && (
                            <span className="px-2.5 py-1 rounded-full text-xs" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>+{freq.healing_properties.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {filteredFreqs.length === 0 && !loading && (
          <div className="text-center py-16">
            <Waves className="w-12 h-12 mx-auto mb-4" style={{ color: `${colors.textMuted}40` }} />
            <p style={{ color: colors.textMuted }}>No frequencies found for this category.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedFreq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(61, 46, 43, 0.5)", backdropFilter: "blur(4px)" }} onClick={() => setSelectedFreq(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl my-8" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }} data-testid="freq-detail-modal">
              {/* Header with image */}
              <div className="relative">
                <div className="h-64 overflow-hidden rounded-t-3xl">
                  <img src={selectedFreq.image_url} alt={selectedFreq.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.background} 0%, ${colors.background}60 30%, transparent 60%)` }} />
                </div>
                <button onClick={() => setSelectedFreq(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ backgroundColor: `${colors.surface}90`, backdropFilter: "blur(8px)", color: colors.textMain }}><X className="w-5 h-5" /></button>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getColors(selectedFreq.element).bg, color: getColors(selectedFreq.element).text }}>{selectedFreq.element}</span>
                    <span className="px-3 py-1 rounded-full text-xs capitalize" style={{ backgroundColor: `${colors.secondary}80`, color: colors.textMuted }}>{selectedFreq.category}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: colors.textMain }}>{selectedFreq.name}</h2>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6" style={{ backgroundColor: colors.surface }}>
                {/* Description */}
                <p className="leading-relaxed" style={{ color: colors.textMuted }}>{selectedFreq.description}</p>

                {/* Frequency Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-2 mb-2"><Volume2 className="w-4 h-4" style={{ color: colors.primary }} /><span className="text-xs uppercase tracking-wider font-medium" style={{ color: colors.textMain }}>Frequency Range</span></div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>{selectedFreq.frequency_range}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                    <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4" style={{ color: colors.primary }} /><span className="text-xs uppercase tracking-wider font-medium" style={{ color: colors.textMain }}>Duration</span></div>
                    <p className="text-sm" style={{ color: colors.textMuted }}>{selectedFreq.duration_recommendation}</p>
                  </div>
                </div>

                {/* Healing Properties */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: colors.primary, fontWeight: 600 }}><Heart className="w-4 h-4" /> Healing Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreq.healing_properties?.map((prop, i) => (
                      <span key={i} className="px-4 py-2 rounded-full text-sm" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>{prop}</span>
                    ))}
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: colors.accent, fontWeight: 600 }}><Sparkles className="w-4 h-4" /> How to Use</h4>
                  <ol className="space-y-2">
                    {selectedFreq.how_to_use?.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm" style={{ color: colors.textMuted }}>
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Best For */}
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: colors.accent, fontWeight: 600 }}><Star className="w-4 h-4" /> Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreq.best_for?.map((item, i) => (
                      <span key={i} className="px-4 py-2 rounded-full text-sm" style={{ backgroundColor: `${colors.accent}10`, color: colors.accent }}>{item}</span>
                    ))}
                  </div>
                </div>

                {/* Chakra & Crystals */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                    <h4 className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: colors.textMain }}>Chakra</h4>
                    <p className="text-sm" style={{ color: colors.primary }}>{selectedFreq.chakra}</p>
                  </div>
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}>
                    <h4 className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: colors.textMain }}>Crystals</h4>
                    <p className="text-sm" style={{ color: colors.textMuted }}>{selectedFreq.crystals?.join(", ")}</p>
                  </div>
                </div>

                {/* Ambient Sound Player */}
                <div className="p-5 rounded-2xl" style={{ backgroundColor: `${colors.primary}08`, border: `1px solid ${colors.primary}20` }}>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: colors.textMain }}><Music className="w-4 h-4" style={{ color: colors.primary }} /> Play {selectedFreq.name}</h4>
                  {selectedFreq.audio_url ? (
                    <div><p className="text-xs mb-3" style={{ color: colors.textMuted }}>Custom audio recording</p><audio controls src={selectedFreq.audio_url} className="w-full" data-testid="custom-audio-player">Your browser does not support audio.</audio></div>
                  ) : (
                    <div><p className="text-xs mb-3" style={{ color: colors.textMuted }}>Synthesised healing audio — generated live in your browser</p><AmbientSoundPlayer soundType={selectedFreq.ambient_type || "crystal_bowls"} autoPlay={false} volume={0.6} showControls={true} /></div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SoundFrequencies;
