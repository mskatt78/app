import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Waves, Music, Volume2, Clock, Sparkles,
  Drum, Guitar, Wind, Droplets, Star, Heart, Filter
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import AmbientSoundPlayer, { AMBIENT_SOUNDS } from "../components/AmbientSoundPlayer";

const CATEGORIES = [
  { id: "all", label: "All Frequencies", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-500/10" },
  { id: "shamanic", label: "Shamanic Drums", icon: Drum, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "cetacean", label: "Dolphin & Whale", icon: Waves, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { id: "instrument", label: "Instruments", icon: Music, color: "text-violet-400", bg: "bg-violet-500/10" },
  { id: "frequency", label: "Pure Frequencies", icon: Volume2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "nature", label: "Nature Sounds", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10" },
];

const ELEMENT_COLORS = {
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Earth & Spirit": { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  "Spirit & Fire": { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "Earth & Fire": { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  "Earth & Air": { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  "Air & Spirit": { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

const SoundFrequencies = ({ user, api }) => {
  const navigate = useNavigate();
  const [frequencies, setFrequencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFreq, setSelectedFreq] = useState(null);
  const [filteredFreqs, setFilteredFreqs] = useState([]);

  useEffect(() => {
    const fetchFrequencies = async () => {
      try {
        const response = await api.get("/sound-frequencies");
        setFrequencies(response.data);
        setFilteredFreqs(response.data);
      } catch (error) {
        console.error("Failed to fetch frequencies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFrequencies();
  }, [api]);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredFreqs(frequencies);
    } else {
      setFilteredFreqs(frequencies.filter(f => f.category === activeCategory));
    }
  }, [activeCategory, frequencies]);

  const getColors = (element) => {
    return ELEMENT_COLORS[element] || ELEMENT_COLORS.Water;
  };

  return (
    <div className="min-h-screen bg-background" data-testid="sound-frequencies">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Vibrational Healing</p>
              <h1 className="text-xl font-serif">Sound & <span className="italic text-primary">Frequencies</span></h1>
            </div>
          </div>

          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-48 bg-card border-white/10" data-testid="category-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-serif mb-4">
            Heal with <span className="italic text-primary">Sound</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sound is the original medicine. From dolphin songs to crystal bowls, 
            from ancient drums to sacred frequencies — discover the healing power 
            of vibration and resonance.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`filter-${cat.id}`}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2
                ${activeCategory === cat.id 
                  ? `${cat.bg} ${cat.color} border border-current` 
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFreqs.map((freq, index) => {
                const colors = getColors(freq.element);
                return (
                  <motion.div
                    key={freq.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedFreq(freq)}
                    className="group cursor-pointer"
                    data-testid={`freq-card-${freq.id}`}
                  >
                    <div className={`rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-300
                                   ${colors.border} ${colors.bg} hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10`}>
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={freq.image_url}
                          alt={freq.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm border ${colors.border}`}>
                            {freq.element}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-black/50 text-white/80 backdrop-blur-sm">
                            {freq.frequency_range}
                          </span>
                        </div>
                        
                        {/* Title overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-lg font-serif text-white">{freq.name}</h3>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {freq.description}
                        </p>
                        
                        {/* Healing Properties Preview */}
                        <div className="flex flex-wrap gap-1">
                          {freq.healing_properties?.slice(0, 3).map((prop, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-muted-foreground">
                              {prop}
                            </span>
                          ))}
                          {freq.healing_properties?.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-primary">
                              +{freq.healing_properties.length - 3}
                            </span>
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
          <div className="text-center py-12">
            <Waves className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No frequencies found for this category.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedFreq} onOpenChange={() => setSelectedFreq(null)}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFreq && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getColors(selectedFreq.element).bg} ${getColors(selectedFreq.element).text}`}>
                    {selectedFreq.element}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-muted-foreground">
                    {selectedFreq.category}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedFreq.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Image */}
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={selectedFreq.image_url}
                    alt={selectedFreq.name}
                    className="w-full h-64 object-cover"
                  />
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {selectedFreq.description}
                </p>

                {/* Frequency Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Frequency Range</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{selectedFreq.frequency_range}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Recommended Duration</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{selectedFreq.duration_recommendation}</p>
                  </div>
                </div>

                {/* Healing Properties */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Healing Properties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreq.healing_properties?.map((prop, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-300 text-sm">
                        {prop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    How to Use
                  </h4>
                  <ul className="space-y-2">
                    {selectedFreq.how_to_use?.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Best For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFreq.best_for?.map((item, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chakra & Crystals */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="text-sm font-medium mb-2">Chakra</h4>
                    <p className="text-primary text-sm">{selectedFreq.chakra}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <h4 className="text-sm font-medium mb-2">Supporting Crystals</h4>
                    <p className="text-muted-foreground text-sm">
                      {selectedFreq.crystals?.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Ambient Sound Player — for ALL frequency types */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" />
                    Play {selectedFreq.name}
                  </h4>
                  {selectedFreq.audio_url ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">Custom audio recording</p>
                      <audio controls src={selectedFreq.audio_url} className="w-full" data-testid="custom-audio-player">
                        Your browser does not support audio.
                      </audio>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Synthesised healing audio — generated live in your browser
                      </p>
                      <AmbientSoundPlayer
                        soundType={selectedFreq.ambient_type || "crystal_bowls"}
                        autoPlay={false}
                        volume={0.6}
                        showControls={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SoundFrequencies;
