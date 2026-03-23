import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Sparkles, RotateCcw, Loader2, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { ShareButton } from "../components/ShareModal";

const OracleReadings = ({ user, api }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("single");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [pastReadings, setPastReadings] = useState([]);
  const [showPast, setShowPast] = useState(false);

  const spreadTypes = [
    { value: "single", label: "Single Card", cards: 1 },
    { value: "three_card", label: "Three Card Spread", cards: 3 },
    { value: "celtic_cross", label: "Celtic Cross", cards: 10 },
  ];

  useEffect(() => {
    fetchPastReadings();
  }, []);

  const fetchPastReadings = async () => {
    try {
      const response = await api.get("/oracle/readings");
      setPastReadings(response.data);
    } catch (error) {
      console.error("Failed to fetch past readings:", error);
    }
  };

  const performReading = async () => {
    setLoading(true);
    setReading(null);
    setShowCards(false);
    
    try {
      // Use guest endpoint if not logged in, regular endpoint if logged in
      const endpoint = user ? "/oracle/reading" : "/oracle/reading/guest";
      const response = await api.post(endpoint, {
        question: question || null,
        spread_type: spreadType,
      });
      
      setReading(response.data);
      setTimeout(() => setShowCards(true), 500);
      toast.success("The spirits have spoken");
      if (user) {
        fetchPastReadings();
      }
    } catch (error) {
      console.error("Reading failed:", error);
      toast.error("The spirits are silent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetReading = () => {
    setReading(null);
    setShowCards(false);
    setQuestion("");
  };

  const elementColors = {
    Earth: "text-emerald-400",
    Water: "text-blue-400",
    Fire: "text-orange-400",
    Air: "text-cyan-400",
    Spirit: "text-purple-400",
  };

  return (
    <div className="min-h-screen bg-background" data-testid="oracle-readings">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Divine Guidance</p>
              <h1 className="text-xl font-serif">Oracle <span className="italic text-primary">Readings</span></h1>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPast(!showPast)}
            className="border-white/10"
          >
            {showPast ? "New Reading" : "Past Readings"}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {showPast ? (
          /* Past Readings List */
          <div className="space-y-4">
            <h2 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Journey</span></h2>
            {pastReadings.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No readings yet. Consult the oracle...</p>
            ) : (
              pastReadings.map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl bg-card/50 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('en-US', { 
                          month: 'long', day: 'numeric', year: 'numeric' 
                        })}
                      </p>
                      {r.question && (
                        <p className="text-sm italic text-foreground/80 mt-1">"{r.question}"</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                      {spreadTypes.find(s => s.value === r.spread_type)?.label || r.spread_type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {r.cards?.map((card) => (
                      <span 
                        key={card.id}
                        className={`px-3 py-1 rounded-full bg-white/5 text-sm ${elementColors[card.element]}`}
                      >
                        {card.name} {card.is_reversed ? "(R)" : ""}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{r.interpretation}</p>
                </motion.div>
              ))
            )}
          </div>
        ) : reading ? (
          /* Reading Result */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Cards Display */}
            <div className="flex flex-wrap justify-center gap-6">
              <AnimatePresence>
                {showCards && reading.cards?.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    transition={{ delay: index * 0.3, duration: 0.6, type: "spring" }}
                    className={`w-52 rounded-2xl border backdrop-blur-xl overflow-hidden text-center
                               ${card.is_reversed ? 'rotate-180' : ''}
                               bg-gradient-to-br from-card to-card/50 border-white/10
                               shadow-[0_0_30px_rgba(212,175,55,0.15)]`}
                  >
                    <div className={card.is_reversed ? 'rotate-180' : ''}>
                      {card.image_url ? (
                        <div className="relative h-40 overflow-hidden">
                          <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                          <span className={`absolute bottom-2 left-2 right-2 text-sm font-serif text-white drop-shadow-lg`}>{card.name}</span>
                        </div>
                      ) : (
                        <div className={`w-12 h-12 mx-auto mt-6 mb-2 rounded-full flex items-center justify-center bg-white/5`}>
                          <Eye className={`w-6 h-6 ${elementColors[card.element]}`} />
                        </div>
                      )}
                      <div className="p-3">
                        {!card.image_url && <h4 className="font-serif text-base mb-1">{card.name}</h4>}
                        <p className={`text-xs ${elementColors[card.element]} mb-2`}>{card.element}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {card.is_reversed ? card.reversed_meaning : card.meaning}
                        </p>
                        {card.is_reversed && (
                          <span className="inline-block mt-2 px-2 py-1 rounded bg-destructive/20 text-destructive text-xs">
                            Reversed
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Interpretation */}
            {showCards && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reading.cards?.length * 0.3 + 0.5 }}
                className="p-8 rounded-2xl bg-card/50 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-serif">The Oracle Speaks</h3>
                </div>
                {question && (
                  <p className="text-sm italic text-muted-foreground mb-4">
                    Regarding: "{question}"
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {reading.interpretation?.replace(/#{1,3}\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                </p>
              </motion.div>
            )}

            {/* New Reading Button */}
            <div className="flex justify-center gap-4">
              <Button
                data-testid="new-reading-btn"
                onClick={resetReading}
                variant="outline"
                className="border-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Reading
              </Button>
              <ShareButton 
                title="My Oracle Reading from Soul Temple 2.0"
                description={`I drew ${reading.cards?.map(c => c.name).join(', ')} - ${reading.interpretation?.substring(0, 100)}...`}
                className="border border-white/10 rounded-full px-4 py-2 hover:bg-white/5"
              />
            </div>
          </motion.div>
        ) : (
          /* Reading Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto space-y-8"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-serif mb-2">Consult the <span className="italic text-primary">Oracle</span></h2>
              <p className="text-muted-foreground">
                Focus your intention and ask your question. The spirits will guide you.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Your Question (optional)</label>
                <Textarea
                  data-testid="oracle-question"
                  placeholder="What guidance do you seek?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-card/50 border-white/10 min-h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Spread Type</label>
                <Select value={spreadType} onValueChange={setSpreadType}>
                  <SelectTrigger data-testid="spread-select" className="bg-card/50 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {spreadTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.cards} card{type.cards > 1 ? 's' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                data-testid="draw-cards-btn"
                onClick={performReading}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground rounded-full py-6 text-lg font-serif italic
                          shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]
                          transition-all duration-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Consulting the spirits...
                  </>
                ) : (
                  "Draw the Cards"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default OracleReadings;
