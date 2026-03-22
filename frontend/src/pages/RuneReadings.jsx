import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Moon, Sun, Eye, Star, Shuffle, 
  ChevronRight, RotateCcw, Info, X, Clock, Share2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ShareButton } from "../components/ShareModal";

const RuneReadings = ({ user, api }) => {
  const navigate = useNavigate();
  const [runes, setRunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [drawnRunes, setDrawnRunes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRune, setSelectedRune] = useState(null);
  const [showAllRunes, setShowAllRunes] = useState(false);

  const spreads = [
    {
      id: "single",
      name: "Single Rune",
      description: "Daily guidance or quick insight",
      runeCount: 1,
      positions: ["guidance"],
      icon: Star
    },
    {
      id: "three",
      name: "Three Norns",
      description: "Past, Present, Future reading",
      runeCount: 3,
      positions: ["past", "present", "future"],
      positionMeanings: ["What shaped this moment", "Your current energy", "Where this leads"],
      icon: Moon
    },
    {
      id: "celtic-cross",
      name: "Celtic Cross",
      description: "Deep comprehensive reading",
      runeCount: 10,
      positions: ["present", "challenge", "past", "future", "above", "below", "advice", "external", "hopes_fears", "outcome"],
      icon: Sun
    }
  ];

  useEffect(() => {
    fetchRunes();
  }, []);

  const fetchRunes = async () => {
    try {
      const response = await api.get("/runes");
      setRunes(response.data);
    } catch (error) {
      console.error("Failed to fetch runes:", error);
      toast.error("Could not load runes");
    } finally {
      setLoading(false);
    }
  };

  const drawRunes = async (spreadType) => {
    setIsDrawing(true);
    setDrawnRunes([]);
    
    try {
      let endpoint = "/runes/draw/single";
      if (spreadType === "three") endpoint = "/runes/draw/three";
      if (spreadType === "celtic-cross") endpoint = "/runes/draw/celtic-cross";
      
      const response = await api.get(endpoint);
      
      // Animate drawing one by one
      const runesData = Array.isArray(response.data) ? response.data : [response.data];
      
      for (let i = 0; i < runesData.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDrawnRunes(prev => [...prev, runesData[i]]);
      }
      
      toast.success("Runes revealed!");
    } catch (error) {
      console.error("Failed to draw runes:", error);
      toast.error("Could not draw runes");
    } finally {
      setIsDrawing(false);
    }
  };

  const getPositionLabel = (position) => {
    const labels = {
      past: "Past",
      present: "Present Situation",
      future: "Future Outcome",
      challenge: "Challenge/Crossing",
      above: "Conscious Goal",
      below: "Subconscious",
      advice: "Advice",
      external: "External Influences",
      hopes_fears: "Hopes & Fears",
      outcome: "Final Outcome",
      guidance: "Your Guidance"
    };
    return labels[position] || position;
  };

  const elementColors = {
    Fire: { bg: "bg-orange-500/20", text: "text-orange-300", border: "border-orange-500/30" },
    Water: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
    Earth: { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
    Air: { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
    Spirit: { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30" },
  };

  return (
    <div className="min-h-screen bg-background" data-testid="rune-readings">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Elder Futhark</p>
              <h1 className="text-xl font-serif">Rune <span className="italic text-primary">Readings</span></h1>
            </div>
          </div>
          <button 
            onClick={() => setShowAllRunes(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View All Runes
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <span className="text-4xl font-serif text-amber-300">ᚠ</span>
          </div>
          <h2 className="text-3xl font-serif mb-4">Consult the <span className="italic text-primary">Runes</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The Elder Futhark runes are ancient Germanic symbols that carry deep wisdom. 
            Select a spread and let the runes reveal their guidance.
          </p>
        </div>

        {!selectedSpread ? (
          /* Spread Selection */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spreads.map((spread) => {
              const Icon = spread.icon;
              return (
                <motion.div
                  key={spread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedSpread(spread)}
                  className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 
                           border border-amber-500/20 hover:border-amber-500/40 transition-all"
                  data-testid={`spread-${spread.id}`}
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-amber-300" />
                  </div>
                  <h3 className="text-xl font-serif mb-2">{spread.name}</h3>
                  <p className="text-muted-foreground mb-4">{spread.description}</p>
                  <div className="flex items-center gap-2 text-amber-300 text-sm">
                    <span>{spread.runeCount} rune{spread.runeCount > 1 ? 's' : ''}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Reading Area */
          <div className="space-y-8">
            {/* Spread Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif">{selectedSpread.name}</h3>
                <p className="text-muted-foreground">{selectedSpread.description}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setSelectedSpread(null); setDrawnRunes([]); }}
                  className="border-white/10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Spread
                </Button>
                <Button
                  onClick={() => drawRunes(selectedSpread.id)}
                  disabled={isDrawing}
                  className="bg-amber-600 hover:bg-amber-700"
                  data-testid="draw-runes-btn"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  {isDrawing ? "Drawing..." : drawnRunes.length > 0 ? "Draw Again" : "Draw Runes"}
                </Button>
              </div>
            </div>

            {/* Drawn Runes Display */}
            {drawnRunes.length > 0 && (
              <div className={`grid gap-6 ${
                selectedSpread.id === "single" ? "grid-cols-1 max-w-md mx-auto" :
                selectedSpread.id === "three" ? "grid-cols-1 md:grid-cols-3" :
                "grid-cols-2 md:grid-cols-5"
              }`}>
                {drawnRunes.map((rune, index) => {
                  const colors = elementColors[rune.element] || elementColors.Spirit;
                  return (
                    <motion.div
                      key={`${rune.id}-${index}`}
                      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onClick={() => setSelectedRune(rune)}
                      className={`cursor-pointer rounded-2xl overflow-hidden border ${colors.border} ${colors.bg}
                                hover:scale-105 transition-transform`}
                    >
                      {rune.image_url && (
                        <div className="h-32 overflow-hidden">
                          <img src={rune.image_url} alt={rune.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase mb-2">
                          {getPositionLabel(rune.position || selectedSpread.positions[index])}
                        </p>
                        <div className={`text-4xl font-serif mb-2 ${colors.text} ${rune.is_reversed ? 'rotate-180' : ''}`}>
                          {rune.symbol}
                        </div>
                        <h4 className="font-serif text-lg">{rune.name}</h4>
                        {rune.is_reversed && (
                          <span className="text-xs text-red-400">(Reversed)</span>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {rune.is_reversed && rune.reversed_meaning ? rune.reversed_meaning : rune.meaning}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Instructions when no runes drawn */}
            {drawnRunes.length === 0 && !isDrawing && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-12 h-12 text-amber-400" />
                </div>
                <p className="text-lg text-muted-foreground">
                  Focus on your question, then click "Draw Runes" when ready
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rune Detail Modal */}
      <AnimatePresence>
        {selectedRune && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedRune(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedRune.image_url && (
                <div className="h-48 overflow-hidden rounded-t-2xl">
                  <img src={selectedRune.image_url} alt={selectedRune.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className={`text-6xl font-serif mb-2 ${selectedRune.is_reversed ? 'rotate-180' : ''}`}>
                    {selectedRune.symbol}
                  </div>
                  <h2 className="text-2xl font-serif">{selectedRune.name}</h2>
                  <p className="text-sm text-muted-foreground">Phonetic: {selectedRune.phonetic} • {selectedRune.element}</p>
                  {selectedRune.is_reversed && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">
                      Reversed Position
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="font-medium mb-2">Meaning</h3>
                  <p className="text-muted-foreground">
                    {selectedRune.is_reversed && selectedRune.reversed_meaning 
                      ? selectedRune.reversed_meaning 
                      : selectedRune.meaning}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h3 className="font-medium mb-2">Advice</h3>
                  <p className="text-muted-foreground">{selectedRune.advice}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h3 className="font-medium mb-2">Shadow Aspect</h3>
                  <p className="text-muted-foreground">{selectedRune.shadow}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedRune.keywords?.map((keyword, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setSelectedRune(null)} className="flex-1" variant="outline">
                    Close
                  </Button>
                  <ShareButton 
                    title={`Rune: ${selectedRune.name}`}
                    description={`I drew the ${selectedRune.name} rune - ${selectedRune.meaning}`}
                    className="border border-white/10 rounded-lg px-4"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Runes Modal */}
      <AnimatePresence>
        {showAllRunes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAllRunes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-card p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-serif">Elder Futhark Runes</h2>
                <button onClick={() => setShowAllRunes(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                {runes.map((rune) => (
                  <div
                    key={rune.id}
                    onClick={() => { setSelectedRune(rune); setShowAllRunes(false); }}
                    className="cursor-pointer p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 
                             hover:bg-amber-500/20 transition-colors text-center"
                  >
                    <div className="text-3xl font-serif text-amber-300 mb-1">{rune.symbol}</div>
                    <p className="text-xs text-muted-foreground truncate">{rune.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RuneReadings;
