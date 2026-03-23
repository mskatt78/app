import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Star, Moon, Sun, Eye, 
  Shuffle, ChevronRight, X, Heart, Briefcase, Compass
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const SPREADS = [
  { id: "single", name: "Single Card", description: "A quick answer or daily guidance", count: 1 },
  { id: "three", name: "Past-Present-Future", description: "Timeline perspective on your situation", count: 3 },
  { id: "celtic_cross", name: "Celtic Cross", description: "Deep, comprehensive reading", count: 10 },
];

const TarotReading = ({ user, api }) => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [reading, setReading] = useState(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [showDeck, setShowDeck] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await api.get("/tarot/cards");
      setCards(response.data);
    } catch (error) {
      console.error("Failed to fetch tarot cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReading = async (spread) => {
    setSelectedSpread(spread);
    setReadingLoading(true);
    setShowDeck(false);
    try {
      const response = await api.get(`/tarot/reading?spread=${spread}`);
      setReading(response.data);
    } catch (error) {
      console.error("Failed to get reading:", error);
    } finally {
      setReadingLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setSelectedSpread(null);
    setShowDeck(true);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="tarot-reading">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => reading ? resetReading() : navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Divination</p>
              <h1 className="text-xl font-serif">Tarot <span className="italic text-primary">Reading</span></h1>
            </div>
          </div>
          {reading && (
            <Button variant="outline" size="sm" onClick={resetReading} className="border-white/10">
              <Shuffle className="w-4 h-4 mr-2" />
              New Reading
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!reading ? (
          <>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-serif mb-4">
                Receive Your <span className="italic text-primary">Guidance</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The 22 Major Arcana cards represent life's spiritual lessons and karmic influences. 
                Choose your spread to receive wisdom from the cards.
              </p>
            </motion.div>

            {/* Spread Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {SPREADS.map((spread, index) => (
                <motion.button
                  key={spread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => getReading(spread.id)}
                  disabled={readingLoading}
                  className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 
                           border border-purple-500/20 hover:border-purple-500/40 transition-all 
                           hover:scale-[1.02] text-left group"
                  data-testid={`spread-${spread.id}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-400 font-serif">{spread.count}</span>
                    </div>
                    <h3 className="font-serif text-lg">{spread.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{spread.description}</p>
                  <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <span>Draw Cards</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Card Gallery */}
            {showDeck && (
              <div>
                <h3 className="text-lg font-serif mb-6 text-center">
                  <span className="text-muted-foreground">Explore the</span> Major Arcana
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {cards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedCard(card)}
                        className="cursor-pointer group"
                        data-testid={`card-${card.id}`}
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 
                                      group-hover:border-primary/40 transition-all group-hover:scale-105 
                                      shadow-lg group-hover:shadow-primary/20">
                          <img
                            src={card.image_url}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-center mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
                          {card.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Reading Results */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif mb-2">Your Reading</h2>
              <p className="text-muted-foreground">
                {SPREADS.find(s => s.id === selectedSpread)?.name} Spread
              </p>
            </div>

            {readingLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground">Shuffling the deck...</p>
              </div>
            ) : (
              <>
                {/* Cards Display */}
                <div className={`grid gap-6 ${
                  selectedSpread === "single" ? "grid-cols-1 max-w-sm mx-auto" :
                  selectedSpread === "three" ? "grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto" :
                  "grid-cols-2 md:grid-cols-5 max-w-5xl mx-auto"
                }`}>
                  {reading?.cards?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, rotateY: 180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-center text-primary uppercase tracking-wider">
                        {item.position}
                      </p>
                      <div 
                        onClick={() => setSelectedCard(item.card)}
                        className={`aspect-[2/3] rounded-xl overflow-hidden border cursor-pointer
                                  transition-all hover:scale-105 shadow-lg hover:shadow-primary/20
                                  ${item.reversed 
                                    ? "border-red-500/30 rotate-180" 
                                    : "border-purple-500/30"}`}
                      >
                        <img
                          src={item.card.image_url}
                          alt={item.card.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-serif text-sm">{item.card.name}</p>
                        {item.reversed && (
                          <p className="text-xs text-red-400">(Reversed)</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Interpretations */}
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-serif text-center mb-6">Card Meanings</h3>
                  {reading?.cards?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={item.card.image_url}
                          alt={item.card.name}
                          className={`w-16 h-24 rounded-lg object-cover ${item.reversed ? "rotate-180" : ""}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-primary uppercase tracking-wider">{item.position}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-serif">{item.card.name}</span>
                            {item.reversed && (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                                Reversed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.meaning}
                          </p>
                          <p className="text-xs text-primary mt-2 italic">
                            Advice: {item.card.advice}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </main>

      {/* Card Detail Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCard && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                    {selectedCard.number} - {selectedCard.arcana} Arcana
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-muted-foreground">
                    {selectedCard.element}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedCard.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Card Image */}
                <div className="flex justify-center">
                  <img
                    src={selectedCard.image_url}
                    alt={selectedCard.name}
                    className="w-48 rounded-xl shadow-lg"
                  />
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedCard.keywords?.map((keyword, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* Meanings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Upright Meaning
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedCard.upright_meaning}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Reversed Meaning
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedCard.reversed_meaning}</p>
                  </div>
                </div>

                {/* Life Areas */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 flex items-start gap-3">
                    <Heart className="w-5 h-5 text-pink-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-pink-400">Love</p>
                      <p className="text-sm text-muted-foreground">{selectedCard.love}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-400">Career</p>
                      <p className="text-sm text-muted-foreground">{selectedCard.career}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 flex items-start gap-3">
                    <Compass className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-400">Spiritual</p>
                      <p className="text-sm text-muted-foreground">{selectedCard.spiritual}</p>
                    </div>
                  </div>
                </div>

                {/* Yes/No */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Yes or No?</p>
                  <p className="font-serif text-lg text-primary">{selectedCard.yes_no}</p>
                </div>

                {/* Advice */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-2">Card's Advice</p>
                  <p className="font-serif italic text-foreground">"{selectedCard.advice}"</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TarotReading;
