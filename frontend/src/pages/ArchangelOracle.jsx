import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Feather, Sparkles, RotateCcw, Loader2, Heart, BookOpen, Star, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";

const ArchangelOracle = ({ user, api }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("single");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [allArchangels, setAllArchangels] = useState([]);
  const [selectedArchangel, setSelectedArchangel] = useState(null);
  const [showBrowse, setShowBrowse] = useState(false);

  const spreadTypes = [
    { value: "single", label: "Single Archangel", cards: 1, description: "One archangel brings you a focused message" },
    { value: "three_card", label: "Trinity Guidance", cards: 3, description: "Three archangels reveal past, present, future" },
  ];

  useEffect(() => {
    fetchArchangels();
  }, []);

  const fetchArchangels = async () => {
    try {
      const response = await api.get("/oracle/archangels");
      setAllArchangels(response.data);
    } catch (error) {
      console.error("Failed to fetch archangels:", error);
    }
  };

  const performReading = async () => {
    setLoading(true);
    setReading(null);
    setShowCards(false);
    setShowBrowse(false);
    
    try {
      const endpoint = user ? "/oracle/archangels/reading" : "/oracle/archangels/reading/guest";
      const response = await api.post(endpoint, {
        question: question || null,
        spread_type: spreadType,
      });
      
      setReading(response.data);
      setTimeout(() => setShowCards(true), 500);
      toast.success("The Archangels have come forward with love");
    } catch (error) {
      console.error("Reading failed:", error);
      toast.error("Please try again, beloved one");
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setShowCards(false);
    setQuestion("");
    setSelectedArchangel(null);
  };

  const elementColors = {
    Fire: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    Water: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    Air: "from-sky-500/20 to-indigo-500/20 border-sky-500/30",
    Earth: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    Spirit: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  };

  const elementTextColors = {
    Fire: "text-orange-400",
    Water: "text-blue-400",
    Air: "text-sky-400",
    Earth: "text-emerald-400",
    Spirit: "text-purple-400",
  };

  return (
    <div className="min-h-screen bg-background" data-testid="archangel-oracle">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Divine Guidance</p>
              <h1 className="text-xl font-serif">Archangel <span className="italic text-primary">Oracle</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowBrowse(!showBrowse); setSelectedArchangel(null); }}
              className="text-muted-foreground hover:text-primary"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Browse All
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Browse All Archangels */}
        {showBrowse && !selectedArchangel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif">Meet the Archangels</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowBrowse(false)}>
                Close
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allArchangels.map((angel) => (
                <motion.div
                  key={angel.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedArchangel(angel)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${elementColors[angel.element]} border cursor-pointer transition-all hover:shadow-lg hover:shadow-primary/10`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Feather className={`w-5 h-5 ${elementTextColors[angel.element]}`} />
                    <h3 className="font-serif text-lg">{angel.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{angel.title}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {angel.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Selected Archangel Detail */}
        {selectedArchangel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" size="sm" onClick={() => setSelectedArchangel(null)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to All
            </Button>
            
            <div className={`rounded-2xl bg-gradient-to-br ${elementColors[selectedArchangel.element]} border p-6`}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Feather className={`w-8 h-8 ${elementTextColors[selectedArchangel.element]}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif">{selectedArchangel.name}</h2>
                  <p className="text-primary">{selectedArchangel.title}</p>
                  <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                    <span>Element: {selectedArchangel.element}</span>
                    <span>•</span>
                    <span>Color: {selectedArchangel.color}</span>
                    <span>•</span>
                    <span>Crystal: {selectedArchangel.crystal}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" /> Domain
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedArchangel.domain}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Message for You
                  </h3>
                  <p className="italic text-foreground leading-relaxed">"{selectedArchangel.message}"</p>
                </div>

                <div>
                  <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Love Guidance
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedArchangel.love_guidance}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-medium text-amber-400 mb-2">Shadow / Reversed Meaning</h3>
                  <p className="text-muted-foreground">{selectedArchangel.reversed_meaning}</p>
                </div>

                <div>
                  <h3 className="font-medium text-primary mb-2">How to Invoke</h3>
                  <p className="text-muted-foreground leading-relaxed">{selectedArchangel.how_to_invoke}</p>
                </div>

                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h3 className="font-medium text-primary mb-2">Affirmation</h3>
                  <p className="text-foreground italic">"{selectedArchangel.affirmation}"</p>
                </div>

                <div>
                  <h3 className="font-medium text-primary mb-2">Prayer</h3>
                  <p className="text-muted-foreground italic leading-relaxed">"{selectedArchangel.prayer}"</p>
                </div>

                <div>
                  <h3 className="font-medium text-primary mb-2">Signs of Presence</h3>
                  <ul className="space-y-1">
                    {selectedArchangel.signs_of_presence?.map((sign, i) => (
                      <li key={i} className="text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reading Section */}
        {!showBrowse && !selectedArchangel && (
          <>
            {!reading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Hero */}
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center">
                    <Feather className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-serif mb-3">Receive Angelic Guidance</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    The Archangels are divine beings of light, love, and infinite compassion.
                    They wait to offer you guidance, healing, and protection. Ask your question
                    and allow them to come forward with messages meant only for you.
                  </p>
                </div>

                {/* Question Input */}
                <div className="bg-card rounded-2xl p-6 border border-white/10">
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Your Question (optional)
                  </label>
                  <Textarea
                    placeholder="What would you like guidance about? Love, career, healing, purpose..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[100px] resize-none"
                    data-testid="question-input"
                  />
                </div>

                {/* Spread Selection */}
                <div className="bg-card rounded-2xl p-6 border border-white/10">
                  <label className="text-sm text-muted-foreground mb-3 block">
                    Choose Your Spread
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {spreadTypes.map((spread) => (
                      <button
                        key={spread.value}
                        onClick={() => setSpreadType(spread.value)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          spreadType === spread.value
                            ? "bg-primary/20 border-primary/50 border"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {spread.cards === 1 ? (
                            <Sun className="w-4 h-4 text-primary" />
                          ) : (
                            <Moon className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium">{spread.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{spread.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perform Reading Button */}
                <Button
                  onClick={performReading}
                  disabled={loading}
                  className="w-full py-6 text-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
                  data-testid="receive-guidance-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting with the Archangels...
                    </>
                  ) : (
                    <>
                      <Feather className="w-5 h-5 mr-2" />
                      Receive Divine Guidance
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Reset Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif">Your Angelic Reading</h2>
                  <Button variant="ghost" onClick={resetReading}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Reading
                  </Button>
                </div>

                {/* Question Display */}
                {reading.question && (
                  <div className="bg-card rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-muted-foreground">Your Question:</p>
                    <p className="italic">"{reading.question}"</p>
                  </div>
                )}

                {/* Cards Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {showCards && reading.cards.map((card, index) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        transition={{ delay: index * 0.3, duration: 0.6 }}
                        className={`rounded-2xl bg-gradient-to-br ${elementColors[card.element]} border p-5 relative overflow-hidden`}
                        data-testid={`archangel-card-${index}`}
                      >
                        {/* Position indicator */}
                        {reading.cards.length > 1 && (
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                        )}

                        {/* Reversed indicator */}
                        {card.is_reversed && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">
                            Shadow
                          </div>
                        )}

                        <div className="text-center pt-4">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Feather className={`w-8 h-8 ${elementTextColors[card.element]}`} />
                          </div>
                          <h3 className="text-xl font-serif mb-1">{card.name}</h3>
                          <p className="text-sm text-primary mb-3">{card.title}</p>
                          
                          <div className="flex flex-wrap justify-center gap-1 mb-4">
                            {card.keywords?.slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                                {kw}
                              </span>
                            ))}
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Element: {card.element}</p>
                            <p>Color: {card.color}</p>
                            <p>Crystal: {card.crystal}</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm italic text-center">
                            {card.is_reversed 
                              ? `"${card.reversed_meaning}"` 
                              : `"${card.message?.slice(0, 150)}..."`
                            }
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* AI Interpretation */}
                {reading.interpretation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reading.cards.length * 0.3 + 0.5 }}
                    className="bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-2xl p-6 border border-primary/20"
                  >
                    <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Divine Interpretation
                    </h3>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {reading.interpretation}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Detailed Card Info */}
                {showCards && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reading.cards.length * 0.3 + 0.8 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-serif">Learn More About Your Archangels</h3>
                    {reading.cards.map((card, index) => (
                      <div key={card.id} className="bg-card rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-serif">{card.name}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => { setSelectedArchangel(card); setShowBrowse(true); }}
                          >
                            View Full Profile
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{card.love_guidance}</p>
                        <div className="bg-primary/10 rounded-lg p-3">
                          <p className="text-sm italic text-primary">"{card.affirmation}"</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ArchangelOracle;
