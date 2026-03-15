import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Palette, Pen, Music, Camera, Sparkles,
  ChevronRight, X, Clock, Play
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const CreativeProcesses = ({ user, api }) => {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [filter, setFilter] = useState("all");

  const categoryIcons = {
    visual: Palette,
    writing: Pen,
    movement: Music,
    nature: Camera,
    meditation: Sparkles
  };

  const categoryColors = {
    visual: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    writing: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    movement: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    nature: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    meditation: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
  };

  useEffect(() => {
    fetchProcesses();
  }, [filter]);

  const fetchProcesses = async () => {
    try {
      const url = filter === "all" ? "/creative-processes" : `/creative-processes?category=${filter}`;
      const response = await api.get(url);
      setProcesses(response.data);
    } catch (error) {
      console.error("Failed to fetch creative processes:", error);
      toast.error("Could not load creative processes");
    } finally {
      setLoading(false);
    }
  };

  const logPractice = async (process) => {
    try {
      await api.post("/practice-history", {
        practice_type: "creative_process",
        practice_id: process.id,
        duration_minutes: process.duration_minutes || 30,
        element: "Spirit"
      });
      toast.success("Creative practice logged!");
    } catch (error) {
      console.error("Failed to log practice:", error);
    }
  };

  const categories = ["all", "visual", "writing", "movement", "nature", "meditation"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="creative-processes">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Creative <span className="italic text-primary">Processes</span></h1>
            <p className="text-sm text-muted-foreground">Shamanic art and creative expression</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Sparkles;
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
                <span className="text-sm capitalize">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processes.map((process, index) => {
            const Icon = categoryIcons[process.category] || Palette;
            const colors = categoryColors[process.category] || categoryColors.visual;
            return (
              <motion.div
                key={process.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedProcess(process)}
                data-testid={`process-${process.id}`}
              >
                {process.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={process.image_url}
                      alt={process.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className="text-xs font-medium capitalize">{process.category}</span>
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
                        {process.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{process.tradition}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {process.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {process.duration_minutes || 30} min
                    </span>
                    <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {processes.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No creative processes found for this category.</p>
          </div>
        )}
      </main>

      {/* Process Detail Modal */}
      <AnimatePresence>
        {selectedProcess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProcess(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              data-testid="process-modal"
            >
              {selectedProcess.image_url && (
                <div className="relative h-64">
                  <img
                    src={selectedProcess.image_url}
                    alt={selectedProcess.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <button
                    onClick={() => setSelectedProcess(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
                    data-testid="close-modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-serif mb-2">{selectedProcess.name}</h2>
                  <p className="text-sm text-muted-foreground italic mb-4">{selectedProcess.tradition}</p>
                  <p className="text-muted-foreground">{selectedProcess.description}</p>
                </div>

                {selectedProcess.materials && (
                  <div>
                    <h3 className="font-medium mb-3">Materials Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProcess.materials.map((material, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-sm text-muted-foreground">
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProcess.process_steps && (
                  <div>
                    <h3 className="font-medium mb-3">Creative Process</h3>
                    <ol className="space-y-3">
                      {selectedProcess.process_steps.map((step, i) => (
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

                {selectedProcess.spiritual_purpose && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h3 className="font-medium mb-2">Spiritual Purpose</h3>
                    <p className="text-sm italic text-muted-foreground">{selectedProcess.spiritual_purpose}</p>
                  </div>
                )}

                <Button 
                  onClick={() => { logPractice(selectedProcess); setSelectedProcess(null); }}
                  className="w-full"
                  data-testid="complete-process-btn"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Creative Practice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreativeProcesses;
