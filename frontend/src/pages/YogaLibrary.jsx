import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Clock, Heart, Filter } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

const YogaLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [poses, setPoses] = useState([]);
  const [filteredPoses, setFilteredPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedPose, setSelectedPose] = useState(null);

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    fetchPoses();
  }, []);

  useEffect(() => {
    if (selectedElement === "all") {
      setFilteredPoses(poses);
    } else {
      setFilteredPoses(poses.filter(p => p.element === selectedElement));
    }
  }, [selectedElement, poses]);

  const fetchPoses = async () => {
    try {
      const response = await api.get("/yoga/poses");
      setPoses(response.data);
      setFilteredPoses(response.data);
    } catch (error) {
      console.error("Failed to fetch poses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="yoga-library">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice</p>
              <h1 className="text-xl font-serif">Yoga <span className="italic text-primary">Library</span></h1>
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

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoses.map((pose, index) => {
              const colors = elementColors[pose.element] || elementColors.Earth;
              return (
                <motion.div
                  key={pose.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedPose(pose)}
                  data-testid={`pose-card-${pose.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                      <Leaf className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                      {pose.element}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif mb-1">{pose.name}</h3>
                  <p className="text-sm text-muted-foreground italic mb-4">{pose.sanskrit_name}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{pose.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{pose.chakras?.[0]}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Pose Detail Dialog */}
      <Dialog open={!!selectedPose} onOpenChange={() => setSelectedPose(null)}>
        <DialogContent className="bg-card border-white/10 max-w-lg">
          {selectedPose && (
            <>
              <DialogHeader>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                               ${elementColors[selectedPose.element]?.bg} ${elementColors[selectedPose.element]?.text}`}>
                  {selectedPose.element}
                </div>
                <DialogTitle className="text-2xl font-serif">{selectedPose.name}</DialogTitle>
                <p className="text-muted-foreground italic">{selectedPose.sanskrit_name}</p>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                <p className="text-muted-foreground leading-relaxed">{selectedPose.description}</p>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Benefits</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPose.benefits?.map((benefit) => (
                      <span key={benefit} className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Chakras</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPose.chakras?.map((chakra) => (
                      <span key={chakra} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        {chakra}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Hold for {selectedPose.duration_minutes} minutes</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YogaLibrary;
