import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Mountain, Droplets, Flame, Wind, Sparkles, 
  ChevronRight, X, Clock, Star, CheckCircle2, Heart
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const EarthAltars = ({ user, api }) => {
  const navigate = useNavigate();
  const [altars, setAltars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAltar, setSelectedAltar] = useState(null);
  const [filter, setFilter] = useState("all");

  const elementIcons = {
    Earth: Mountain,
    Water: Droplets,
    Fire: Flame,
    Air: Wind,
    Spirit: Sparkles
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" }
  };

  useEffect(() => {
    fetchAltars();
  }, [filter]);

  const fetchAltars = async () => {
    try {
      const url = filter === "all" ? "/earth-altars" : `/earth-altars?element=${filter}`;
      const response = await api.get(url);
      setAltars(response.data);
    } catch (error) {
      console.error("Failed to fetch altars:", error);
      toast.error("Could not load altar guides");
    } finally {
      setLoading(false);
    }
  };

  const logPractice = async (altar) => {
    try {
      await api.post("/practice-history", {
        practice_type: "earth_altar",
        practice_id: altar.id,
        duration_minutes: 30,
        element: altar.element
      });
      toast.success("Altar practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="earth-altars">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Earth <span className="italic text-primary">Altars</span></h1>
            <p className="text-sm text-muted-foreground">Sacred spaces for elemental connection</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Element Filter */}
        <div className="flex flex-wrap gap-2">
          {elements.map((el) => {
            const Icon = elementIcons[el] || Star;
            const colors = elementColors[el] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={el}
                onClick={() => setFilter(el)}
                data-testid={`filter-${el.toLowerCase()}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                  ${filter === el 
                    ? `${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}` 
                    : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
              >
                {el !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{el}</span>
              </button>
            );
          })}
        </div>

        {/* Altar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {altars.map((altar, index) => {
            const Icon = elementIcons[altar.element] || Mountain;
            const colors = elementColors[altar.element] || elementColors.Earth;
            return (
              <motion.div
                key={altar.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedAltar(altar)}
                data-testid={`altar-${altar.id}`}
              >
                {altar.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={altar.image_url}
                      alt={altar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className="text-xs font-medium">{altar.element}</span>
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
                        {altar.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{altar.purpose?.split(',')[0]}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {altar.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {altar.best_time || "Any time"}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {altars.length === 0 && (
          <div className="text-center py-12">
            <Mountain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No altars found for this element.</p>
          </div>
        )}
      </main>

      {/* Altar Detail Modal */}
      <AnimatePresence>
        {selectedAltar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedAltar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="altar-modal"
            >
              {selectedAltar.image_url && (
                <div className="relative h-64">
                  <img
                    src={selectedAltar.image_url}
                    alt={selectedAltar.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <button
                    onClick={() => setSelectedAltar(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                    data-testid="close-modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-serif mb-2">{selectedAltar.name}</h2>
                  <p className="text-muted-foreground">{selectedAltar.description}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Purpose</h3>
                  <p className="text-sm text-muted-foreground">{selectedAltar.purpose}</p>
                </div>

                {selectedAltar.items && (
                  <div>
                    <h3 className="font-medium mb-3">Sacred Items</h3>
                    <div className="space-y-2">
                      {selectedAltar.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAltar.setup_ritual && (
                  <div>
                    <h3 className="font-medium mb-3">Setup Ritual</h3>
                    <ol className="space-y-2">
                      {selectedAltar.setup_ritual.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedAltar.activation_prayer && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h3 className="font-medium mb-2">Activation Prayer</h3>
                    <p className="text-sm italic text-muted-foreground">{selectedAltar.activation_prayer}</p>
                  </div>
                )}

                {selectedAltar.therapeutic_applications && selectedAltar.therapeutic_applications.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Therapeutic Applications
                    </h3>
                    <div className="space-y-3">
                      {selectedAltar.therapeutic_applications.map((app, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="font-medium text-sm text-rose-300 mb-1">{app.condition}</div>
                          <p className="text-xs text-muted-foreground mb-2">{app.how_it_helps}</p>
                          <div className="text-xs bg-white/5 rounded-lg p-2 text-foreground/80">
                            <strong>Practice:</strong> {app.practice}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAltar.weekly_practice && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h3 className="font-medium mb-2 text-emerald-400">Weekly Practice</h3>
                    <p className="text-sm text-muted-foreground">{selectedAltar.weekly_practice}</p>
                  </div>
                )}

                <Button 
                  onClick={() => { logPractice(selectedAltar); setSelectedAltar(null); }}
                  className="w-full"
                  data-testid="complete-altar-btn"
                >
                  Complete Altar Setup
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EarthAltars;
