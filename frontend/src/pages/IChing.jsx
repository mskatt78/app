import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Coins, RotateCcw, BookOpen, Info, X, Sparkles, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ShareButton } from "../components/ShareModal";

const IChing = ({ user, api }) => {
  const navigate = useNavigate();
  const [hexagrams, setHexagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState(false);
  const [result, setResult] = useState(null);
  const [showHexagramList, setShowHexagramList] = useState(false);
  const [selectedHexagram, setSelectedHexagram] = useState(null);
  const [coinAnimation, setCoinAnimation] = useState([]);

  const COIN_SLOTS = ["left", "center", "right"];

  const fetchHexagrams = useCallback(async () => {
    try {
      const response = await api.get("/i-ching");
      setHexagrams(response.data);
    } catch (error) {
      console.error("Failed to fetch hexagrams:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchHexagrams();
  }, [fetchHexagrams]);

  const castCoins = async () => {
    setCasting(true);
    setResult(null);
    setCoinAnimation([]);

    // Animate 6 coin tosses
    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setCoinAnimation((prev) => [
        ...prev,
        {
          id: `coin-toss-${i + 1}`,
          type: Math.random() > 0.5 ? "yang" : "yin",
        },
      ]);
    }

    try {
      const response = await api.get("/i-ching/cast/coins");
      await new Promise(resolve => setTimeout(resolve, 500));
      setResult(response.data);
      toast.success(`Hexagram ${response.data.number}: ${response.data.name}`);
    } catch (error) {
      console.error("Failed to cast I Ching:", error);
      toast.error("Could not complete casting");
    } finally {
      setCasting(false);
    }
  };

  const renderLine = (value, lineNumber, isChanging) => {
    const isYang = value === 7 || value === 9;
    const isOld = value === 6 || value === 9;
    
    return (
      <motion.div
        key={`hexagram-line-${lineNumber}`}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: lineNumber * 0.1 }}
        className="flex items-center justify-center gap-2 my-1"
      >
        {isYang ? (
          <div className={`h-3 w-32 rounded-full ${isOld ? 'bg-amber-500' : 'bg-white'}`} />
        ) : (
          <>
            <div className={`h-3 w-14 rounded-full ${isOld ? 'bg-amber-500' : 'bg-white'}`} />
            <div className="w-4" />
            <div className={`h-3 w-14 rounded-full ${isOld ? 'bg-amber-500' : 'bg-white'}`} />
          </>
        )}
        {isOld && (
          <span className="text-xs text-amber-400 ml-2">changing</span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background" data-testid="i-ching">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/menu")} className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Book of Changes</p>
              <h1 className="text-xl font-serif">I <span className="italic text-primary">Ching</span></h1>
            </div>
          </div>
          <button 
            onClick={() => setShowHexagramList(true)}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            64 Hexagrams
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
            <span className="text-3xl">☯</span>
          </div>
          <h2 className="text-3xl font-serif mb-4">The <span className="italic text-primary">Oracle</span> of Change</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The I Ching is one of the oldest divination systems, over 3,000 years old. 
            Using the three-coin method, cast your hexagram and receive ancient wisdom.
          </p>
        </div>

        {/* Casting Area */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent border border-red-500/20">
          <div className="text-center">
            <h3 className="text-xl font-serif mb-4">Three Coin Method</h3>
            <p className="text-muted-foreground mb-6">
              Focus on your question, then cast the coins. The hexagram will reveal the answer.
            </p>

            {/* Coin Animation */}
            {casting && (
              <div className="flex justify-center gap-4 mb-6">
                {COIN_SLOTS.map((slot, index) => (
                  <motion.div
                    key={`casting-coin-${slot}`}
                    animate={{ 
                      rotateY: [0, 360, 720, 1080],
                      y: [0, -30, 0]
                    }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 
                             flex items-center justify-center text-xl font-bold text-amber-900"
                  >
                    ☯
                  </motion.div>
                ))}
              </div>
            )}

            {/* Lines Being Cast */}
            {coinAnimation.length > 0 && !result && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Building hexagram...</p>
                <div className="flex flex-col-reverse items-center">
                  {coinAnimation.map((animationItem) => (
                    <motion.div
                      key={animationItem.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`h-3 my-1 rounded-full ${
                        animationItem.type === "yang" ? "w-24 bg-white" : "w-10 bg-white mx-1 inline-block"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={castCoins}
              disabled={casting}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
              data-testid="cast-coins-btn"
            >
              <Coins className="w-5 h-5 mr-2" />
              {casting ? "Casting..." : result ? "Cast Again" : "Cast the Coins"}
            </Button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hexagram Display */}
            <div className="p-8 rounded-2xl bg-card border border-white/10 text-center">
              <div className="flex flex-col-reverse items-center mb-6">
                {result.lines_cast?.map((value, index) => 
                  renderLine(value, index + 1, result.changing_lines?.includes(index + 1))
                )}
              </div>
              
              <h2 className="text-3xl font-serif mb-2">
                Hexagram {result.number}: {result.name}
              </h2>
              <p className="text-4xl mb-4">{result.chinese}</p>
              <div className="text-sm text-muted-foreground">
                {result.trigram_above} over {result.trigram_below} • {result.element} • {result.season}
              </div>
            </div>

            {/* Judgment */}
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <h3 className="font-serif text-xl mb-3 text-amber-300">The Judgment</h3>
              <p className="text-lg italic leading-relaxed">{result.judgment}</p>
            </div>

            {/* Image */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-serif text-xl mb-3">The Image</h3>
              <p className="text-muted-foreground leading-relaxed">{result.image}</p>
            </div>

            {/* Meaning */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-serif text-xl mb-3">Interpretation</h3>
              <p className="text-muted-foreground leading-relaxed">{result.meaning}</p>
            </div>

            {/* Advice */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h3 className="font-serif text-xl mb-3 text-green-300">Advice</h3>
              <p className="text-muted-foreground leading-relaxed">{result.advice}</p>
            </div>

            {/* Changing Lines */}
            {result.line_meanings && result.line_meanings.length > 0 && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <h3 className="font-serif text-xl mb-4 text-red-300">Changing Lines</h3>
                <div className="space-y-4">
                  {result.line_meanings.map((lm) => (
                    <div key={`changing-line-${lm.line}-${String(lm.meaning || "").slice(0, 40)}`} className="p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-red-400 mb-2">Line {lm.line}</p>
                      <p className="text-muted-foreground">{lm.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Button */}
            <div className="text-center">
              <ShareButton 
                title={`I Ching: Hexagram ${result.number} - ${result.name}`}
                description={`${result.chinese} - ${result.judgment?.substring(0, 120)}...`}
                className="border border-white/10 rounded-full px-6 py-3 hover:bg-white/5 inline-flex items-center gap-2"
              />
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            How the Three Coin Method Works
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="mb-2"><strong>The Casting:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Three coins are tossed six times</li>
                <li>Each toss creates one line of the hexagram</li>
                <li>Lines are built from bottom to top</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>The Lines:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Solid line (━━━) = Yang energy</li>
                <li>Broken line (━ ━) = Yin energy</li>
                <li>Changing lines show transformation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Hexagram List Modal */}
      <AnimatePresence>
        {showHexagramList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHexagramList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-card p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-serif">The 64 Hexagrams</h2>
                <button onClick={() => setShowHexagramList(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {hexagrams.map((hex) => (
                  <div
                    key={hex.id}
                    onClick={() => { setResult(hex); setShowHexagramList(false); }}
                    className="cursor-pointer p-4 rounded-xl bg-red-500/10 border border-red-500/20 
                             hover:bg-red-500/20 transition-colors text-center"
                  >
                    <div className="text-2xl mb-1">{hex.chinese}</div>
                    <p className="text-xs text-muted-foreground">{hex.number}. {hex.name}</p>
                  </div>
                ))}
                {hexagrams.length < 64 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>More hexagrams coming soon...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IChing;
