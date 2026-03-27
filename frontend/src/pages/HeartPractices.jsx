import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Heart, HeartHandshake, Sparkles, Users, Flower,
  ChevronRight, X, Clock, Play, Star, CheckCircle2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const HeartPractices = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPracticing, setIsPracticing] = useState(false);

  const categoryIcons = {
    self_love: Heart,
    compassion: HeartHandshake,
    forgiveness: Flower,
    gratitude: Star,
    connection: Users,
    healing: Sparkles
  };

  const categoryColors = {
    self_love: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    compassion: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    forgiveness: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    gratitude: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    connection: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    healing: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  };

  useEffect(() => {
    fetchPractices();
  }, [filter]);

  const fetchPractices = async () => {
    try {
      const url = filter === "all" ? "/heart-practices" : `/heart-practices?category=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch heart practices:", error);
      toast.error("Could not load heart practices");
    } finally {
      setLoading(false);
    }
  };

  const logPractice = async (practice) => {
    try {
      await api.post("/practice-history", {
        practice_type: "heart_practice",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes || 20,
        element: "Water"
      });
      toast.success("Heart practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const categories = ["all", "self_love", "compassion", "forgiveness", "gratitude", "connection", "healing"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="heart-practices">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Heart <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Open your heart center</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Heart;
            const colors = categoryColors[cat] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                data-testid={`filter-${cat}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                  ${filter === cat 
                    ? `${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}` 
                    : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
              >
                {cat !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practices.map((practice, index) => {
            const Icon = categoryIcons[practice.category] || Heart;
            const colors = categoryColors[practice.category] || categoryColors.self_love;
            return (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedPractice(practice)}
                data-testid={`practice-${practice.id}`}
              >
                {practice.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={practice.image_url}
                      alt={practice.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className="text-xs font-medium capitalize">{practice.category?.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
                        {practice.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{practice.tradition}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {practice.duration_minutes || 20} min
                    </span>
                    <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No heart practices found for this category.</p>
          </div>
        )}
      </main>

      {/* Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              data-testid="practice-modal"
            >
              {/* Close button */}
              <button
                onClick={() => { setSelectedPractice(null); setIsPracticing(false); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
                data-testid="close-modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {!isPracticing ? (
                  <>
                    {selectedPractice.image_url && (
                      <div className="relative h-48 sm:h-64">
                        <img
                          src={selectedPractice.image_url}
                          alt={selectedPractice.name}
                          className="w-full h-full object-cover rounded-t-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent rounded-t-2xl" />
                      </div>
                    )}
                    
                    <div className="p-6 space-y-6">
                      <div>
                        <h2 className="text-2xl font-serif mb-2">{selectedPractice.name}</h2>
                        <p className="text-sm text-muted-foreground italic mb-4">{selectedPractice.tradition}</p>
                        <p className="text-muted-foreground">{selectedPractice.description}</p>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-xl bg-pink-500/10">
                        <Clock className="w-5 h-5 text-pink-400" />
                        <div>
                          <p className="text-sm font-medium">Duration</p>
                          <p className="text-muted-foreground">{selectedPractice.duration_minutes || 20} minutes</p>
                        </div>
                      </div>

                      {selectedPractice.benefits && (
                        <div>
                          <h3 className="font-medium mb-3">Benefits</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedPractice.benefits.map((benefit, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-sm">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPractice.steps && (
                        <div>
                          <h3 className="font-medium mb-3">Practice Steps</h3>
                          <ol className="space-y-3">
                            {selectedPractice.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {selectedPractice.affirmation && (
                        <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
                          <h3 className="font-medium mb-2">Heart Affirmation</h3>
                          <p className="text-sm italic text-muted-foreground">"{selectedPractice.affirmation}"</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Guided Practice Mode - Clean Simple View */
                  <div className="p-6 space-y-5">
                    <div className="text-center pt-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-pink-400" />
                      </div>
                      <h2 className="text-2xl font-serif">{selectedPractice.name}</h2>
                      <p className="text-sm text-pink-300/70 mt-1">Guided Heart Practice — {selectedPractice.duration_minutes || 20} min</p>
                    </div>

                    {selectedPractice.affirmation && (
                      <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                        <p className="text-xs text-pink-400 uppercase tracking-wider mb-1">Hold this intention</p>
                        <p className="text-base italic text-pink-100">"{selectedPractice.affirmation}"</p>
                      </div>
                    )}

                    {selectedPractice.steps && selectedPractice.steps.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-4 text-pink-300">Follow these steps:</h3>
                        <div className="space-y-3">
                          {selectedPractice.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-pink-500/10">
                              <span className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/15 text-center">
                      <CheckCircle2 className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">When complete, press the button below to log your practice.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed button at bottom */}
              <div className="p-4 border-t border-white/10 bg-card rounded-b-2xl">
                {!isPracticing ? (
                  <button 
                    type="button"
                    onClick={() => setIsPracticing(true)}
                    className="w-full py-4 px-6 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', minHeight: '56px' }}
                    data-testid="begin-practice-btn"
                  >
                    <Play className="w-5 h-5" />
                    Begin Guided Heart Practice
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={async () => {
                        try {
                          await api.post("/practice-history", {
                            practice_type: "heart_practice",
                            practice_id: selectedPractice.id,
                            duration_minutes: selectedPractice.duration_minutes || 20,
                            element: "Water"
                          });
                          toast.success("Heart practice complete! Your heart is open.");
                        } catch (e) {
                          toast.success("Heart practice complete!");
                        }
                        setIsPracticing(false);
                        setSelectedPractice(null);
                      }}
                      className="flex-1 py-4 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 touch-manipulation"
                      style={{ minHeight: '56px' }}
                      data-testid="complete-practice-btn"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Practice
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsPracticing(false)}
                      className="py-4 px-5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center justify-center touch-manipulation"
                      style={{ minHeight: '56px' }}
                      data-testid="exit-practice-btn"
                    >
                      <X className="w-5 h-5" />
                    </button>
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

export default HeartPractices;
