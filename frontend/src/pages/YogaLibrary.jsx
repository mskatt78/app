import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Clock, Heart, Filter, HeartOff, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";

const YogaLibrary = ({ user, api }) => {
  const navigate = useNavigate();
  const [poses, setPoses] = useState([]);
  const [filteredPoses, setFilteredPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedPose, setSelectedPose] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
    fetchFavorites();
  }, []);

  useEffect(() => {
    let filtered = poses;
    
    if (selectedElement !== "all") {
      filtered = filtered.filter(p => p.element === selectedElement);
    }
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => favorites.has(p.id));
    }
    
    setFilteredPoses(filtered);
  }, [selectedElement, poses, showFavoritesOnly, favorites]);

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

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/favorites?item_type=pose");
      const favIds = new Set(response.data.map(f => f.item_id));
      setFavorites(favIds);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (poseId, e) => {
    e.stopPropagation();
    
    try {
      if (favorites.has(poseId)) {
        await api.delete(`/favorites/pose/${poseId}`);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(poseId);
          return next;
        });
        toast.success("Removed from favorites");
      } else {
        await api.post("/favorites", { item_type: "pose", item_id: poseId });
        setFavorites(prev => new Set([...prev, poseId]));
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error("Could not update favorites");
    }
  };

  const getPoseCountByElement = (element) => {
    if (element === "all") return poses.length;
    return poses.filter(p => p.element === element).length;
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
              <h1 className="text-xl font-serif">
                Yoga <span className="italic text-primary">Library</span>
                <span className="text-sm text-muted-foreground ml-2">({poses.length} poses)</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={showFavoritesOnly ? "bg-primary" : "border-white/10"}
              data-testid="favorites-filter"
            >
              <Star className={`w-4 h-4 mr-1 ${showFavoritesOnly ? "fill-current" : ""}`} />
              Favorites ({favorites.size})
            </Button>
            
            <Select value={selectedElement} onValueChange={setSelectedElement}>
              <SelectTrigger data-testid="element-filter" className="w-44 bg-card border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {elements.map((el) => (
                  <SelectItem key={el} value={el}>
                    {el === "all" ? `All Elements (${poses.length})` : `${el} (${getPoseCountByElement(el)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Element Summary */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {elements.filter(e => e !== "all").map((el) => {
            const colors = elementColors[el];
            const count = getPoseCountByElement(el);
            return (
              <button
                key={el}
                onClick={() => setSelectedElement(selectedElement === el ? "all" : el)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${colors.bg} ${colors.border} border
                           ${selectedElement === el ? 'ring-1 ring-primary' : 'opacity-70 hover:opacity-100'}`}
              >
                <span className={colors.text}>{el}</span>
                <span className="text-muted-foreground ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6 pt-2">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredPoses.length === 0 ? (
          <div className="text-center py-16">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showFavoritesOnly ? "No favorite poses yet. Start adding some!" : "No poses match your filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoses.map((pose, index) => {
              const colors = elementColors[pose.element] || elementColors.Earth;
              const isFavorite = favorites.has(pose.id);
              
              return (
                <motion.div
                  key={pose.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer relative group
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedPose(pose)}
                  data-testid={`pose-card-${pose.id}`}
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(pose.id, e)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all
                               ${isFavorite ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100'}`}
                    data-testid={`favorite-btn-${pose.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  
                  <div className="flex items-start justify-between mb-4 pr-10">
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
        <DialogContent className="bg-card border-white/10 max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedPose && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-2 w-fit
                                 ${elementColors[selectedPose.element]?.bg} ${elementColors[selectedPose.element]?.text}`}>
                    {selectedPose.element}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      toggleFavorite(selectedPose.id, e);
                    }}
                    className={favorites.has(selectedPose.id) ? "text-primary" : "text-muted-foreground"}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${favorites.has(selectedPose.id) ? 'fill-current' : ''}`} />
                    {favorites.has(selectedPose.id) ? "Saved" : "Save"}
                  </Button>
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
