import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Shuffle, RotateCcw
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { ShareButton } from "../../components/ShareModal";
import { appLogger } from "../../utils/logger";
import { ELEMENT_COLORS, SPREADS, getPositionLabel, getSpreadGridClassName } from "./runeReadingsConstants";
import { RuneReadingsHeader } from "./RuneReadingsHeader";
import { RuneSpreadSelector } from "./RuneSpreadSelector";
import { RuneLibraryModal } from "./RuneLibraryModal";

const DIVINATION_FALLBACK_IMAGE = "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg?auto=compress&cs=tinysrgb&w=1200";

const handleDivinationImageError = (event) => {
  const img = event.currentTarget;
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = DIVINATION_FALLBACK_IMAGE;
};

const RuneReadings = ({ user, api }) => {
  const navigate = useNavigate();
  const [runes, setRunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [drawnRunes, setDrawnRunes] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedRune, setSelectedRune] = useState(null);
  const [showAllRunes, setShowAllRunes] = useState(false);

  useEffect(() => {
    const fetchRunes = async () => {
      try {
        const response = await api.get("/runes");
        setRunes(response.data);
      } catch (error) {
        appLogger.error("Failed to fetch runes:", error);
        toast.error("Could not load runes");
      } finally {
        setLoading(false);
      }
    };

    fetchRunes();
  }, [api]);

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
      appLogger.error("Failed to draw runes:", error);
      toast.error("Could not draw runes");
    } finally {
      setIsDrawing(false);
    }
  };

  const getDrawRunesButtonLabel = () => {
    if (isDrawing) return "Drawing...";
    if (drawnRunes.length > 0) return "Draw Again";
    return "Draw Runes";
  };

  return (
    <div className="min-h-screen bg-background" data-testid="rune-readings">
      <RuneReadingsHeader onBack={() => navigate("/menu")} onOpenLibrary={() => setShowAllRunes(true)} />

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
          <RuneSpreadSelector spreads={SPREADS} onSelectSpread={setSelectedSpread} />
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
                  {getDrawRunesButtonLabel()}
                </Button>
              </div>
            </div>

            {/* Drawn Runes Display */}
            {drawnRunes.length > 0 && (
              <div className={`grid gap-6 ${getSpreadGridClassName(selectedSpread)}`}>
                {drawnRunes.map((rune, index) => {
                  const colors = ELEMENT_COLORS[rune.element] || ELEMENT_COLORS.Spirit;
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
                          <img src={rune.image_url} alt={rune.name} className="w-full h-full object-cover" onError={handleDivinationImageError} />
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
                  Focus on your question, then click &ldquo;Draw Runes&rdquo; when ready
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
                  <img src={selectedRune.image_url} alt={selectedRune.name} className="w-full h-full object-cover" onError={handleDivinationImageError} />
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

      <RuneLibraryModal
        open={showAllRunes}
        runes={runes}
        onClose={() => setShowAllRunes(false)}
        onSelectRune={(rune) => {
          setSelectedRune(rune);
          setShowAllRunes(false);
        }}
      />
    </div>
  );
};

export default RuneReadings;
