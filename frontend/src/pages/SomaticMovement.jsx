import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Waves, Filter, Play, Clock,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import PracticeVideos from "../components/PracticeVideos";

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

const SomaticMovement = ({ user, api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [filteredPractices, setFilteredPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  useEffect(() => {
    fetchPractices();
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredPractices(practices);
    } else {
      setFilteredPractices(practices.filter((p) => p.element === selectedElement));
    }
  }, [selectedElement, practices]);

  const fetchPractices = async () => {
    try {
      const response = await api.get("/somatic");
      setPractices(response.data);
      setFilteredPractices(response.data);
    } catch (error) {
      console.error("Failed to fetch practices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGuided = (practice) => {
    setSelectedPractice(null); // close dialog
    setGuidedPractice(practice);
  };

  const handleExitPractice = async () => {
    if (guidedPractice) {
      try {
        await api.post("/practice-history", {
          practice_type: "somatic",
          practice_id: guidedPractice.id,
          duration_minutes: guidedPractice.duration_minutes,
          notes: `Completed ${guidedPractice.name}`,
        });
        toast.success("Practice complete. Well done.");
      } catch (e) {
        // silent
      }
    }
    setGuidedPractice(null);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="somatic-movement">
      {/* Full-screen Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.instructions}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Body Wisdom</p>
              <h1 className="text-xl font-serif">
                Somatic <span className="italic text-primary">Movement</span>
              </h1>
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
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-serif mb-4">
            Move with <span className="italic text-primary">Intention</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Somatic movement practices help release stored emotions and trauma from the body.
            Each element offers a unique approach to healing through movement.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPractices.map((practice, index) => {
              const colors = elementColors[practice.element] || elementColors.Water;
              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedPractice(practice)}
                  data-testid={`practice-card-${practice.id}`}
                >
                  {practice.image_url && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={practice.image_url}
                        alt={practice.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className={`flex items-start justify-between mb-4 ${practice.image_url ? "hidden" : ""}`}>
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Waves className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {practice.duration_minutes} min
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {practice.element}
                        </span>
                      </div>
                    </div>
                    {practice.image_url && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {practice.duration_minutes} min
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                          {practice.element}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-serif mb-3">{practice.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {practice.benefits?.map((benefit) => (
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

        <PracticeVideos api={api} category="somatic" />
      </main>

      {/* Practice Detail Dialog */}
      <Dialog open={!!selectedPractice} onOpenChange={() => setSelectedPractice(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedPractice && (
            <>
              <DialogHeader>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                             ${elementColors[selectedPractice.element]?.bg} ${elementColors[selectedPractice.element]?.text}`}
                >
                  {selectedPractice.element} Element
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPractice.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground leading-relaxed">{selectedPractice.description}</p>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-muted-foreground">{selectedPractice.duration_minutes} minutes</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPractice.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Tip:</strong> Find a quiet space where you can move
                    freely. Let your body guide you — there is no wrong way to do this practice.
                  </p>
                </div>

                <Button
                  onClick={() => handleStartGuided(selectedPractice)}
                  className="w-full"
                  size="lg"
                  data-testid="start-guided-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Guided Practice
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SomaticMovement;
