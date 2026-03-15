import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Hand, Filter, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent } from "../components/ui/dialog";

const MudrasLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [mudras, setMudras] = useState([]);
  const [filteredMudras, setFilteredMudras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedMudra, setSelectedMudra] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-900/40" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-900/40" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20 to-orange-900/40" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-900/40" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-900/40" },
  };

  const placeholderImage = "https://images.unsplash.com/photo-1595754069947-f9896fed5b38?w=800";

  useEffect(() => {
    fetchMudras();
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredMudras(mudras);
    } else {
      setFilteredMudras(mudras.filter(m => m.element === selectedElement));
    }
  }, [selectedElement, mudras]);

  const fetchMudras = async () => {
    try {
      const response = await api.get("/mudras");
      setMudras(response.data);
      setFilteredMudras(response.data);
    } catch (error) {
      console.error("Failed to fetch mudras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (mudraId) => {
    setImageErrors(prev => new Set([...prev, mudraId]));
  };

  return (
    <div className="min-h-screen bg-background" data-testid="mudras-library">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Gestures</p>
              <h1 className="text-xl font-serif">Mudras <span className="italic text-primary">Library</span></h1>
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMudras.map((mudra, index) => {
              const colors = elementColors[mudra.element] || elementColors.Spirit;
              const hasImageError = imageErrors.has(mudra.id);
              
              return (
                <motion.div
                  key={mudra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedMudra(mudra)}
                  data-testid={`mudra-card-${mudra.id}`}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={hasImageError ? placeholderImage : (mudra.image_url || placeholderImage)}
                      alt={mudra.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(mudra.id)}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                    
                    {/* Element Badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {mudra.element}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-1">{mudra.name}</h3>
                    {mudra.sanskrit_name && (
                      <p className="text-sm text-muted-foreground italic mb-3">{mudra.sanskrit_name}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {mudra.benefits?.slice(0, 3).map((benefit) => (
                        <span key={benefit} className="px-2 py-1 rounded-full bg-white/5 text-xs text-muted-foreground">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Mudra Detail Dialog */}
      <AnimatePresence>
        {selectedMudra && (
          <Dialog open={!!selectedMudra} onOpenChange={() => setSelectedMudra(null)}>
            <DialogContent className="bg-card border-white/10 max-w-lg max-h-[90vh] overflow-y-auto p-0">
              {/* Hero Image */}
              <div className="relative h-56">
                <img
                  src={imageErrors.has(selectedMudra.id) ? placeholderImage : (selectedMudra.image_url || placeholderImage)}
                  alt={selectedMudra.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(selectedMudra.id)}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${elementColors[selectedMudra.element]?.gradient || 'from-black/60 to-transparent'}`} />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedMudra(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className={`px-3 py-1 rounded-full text-xs ${elementColors[selectedMudra.element]?.bg} ${elementColors[selectedMudra.element]?.text} border ${elementColors[selectedMudra.element]?.border} mb-2 inline-block`}>
                    {selectedMudra.element} Element
                  </span>
                  <h2 className="text-2xl font-serif text-white">{selectedMudra.name}</h2>
                  {selectedMudra.sanskrit_name && (
                    <p className="text-white/70 italic">{selectedMudra.sanskrit_name}</p>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">{selectedMudra.description}</p>

                {/* How to Form */}
                {selectedMudra.instructions && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Hand className="w-4 h-4 text-primary" />
                      How to Form This Mudra
                    </h4>
                    <p className="text-muted-foreground leading-relaxed p-4 rounded-xl bg-white/5 border border-white/10">
                      {selectedMudra.instructions}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    Benefits
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMudra.benefits?.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practice Tip */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Practice:</strong> Hold this mudra during meditation 
                    for 5-15 minutes, or while doing breathwork to enhance its effects. 
                    The <strong className="text-primary">{selectedMudra.element}</strong> element connection helps {
                      selectedMudra.element === "Earth" ? "ground your energy and build stability" :
                      selectedMudra.element === "Water" ? "balance emotions and enhance intuition" :
                      selectedMudra.element === "Fire" ? "ignite transformation and inner power" :
                      selectedMudra.element === "Air" ? "clear the mind and expand awareness" :
                      "connect with your higher self and spiritual essence"
                    }.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MudrasLibrary;
