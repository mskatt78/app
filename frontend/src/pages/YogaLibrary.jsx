import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Leaf, Clock, Heart, Filter, Star, ChevronRight, X, AlertTriangle, Check, Users, Accessibility } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../components/ui/dialog";
import { toast } from "sonner";
import HealthDisclaimer from "../components/HealthDisclaimer";
import GuidedAudioButton from "../components/GuidedAudioButton";
import { appLogger } from "../utils/logger";

const YogaLibrary = ({ user, api }) => {
  const stablePoseKey = (prefix, value) => {
    const slug = String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
    return `${prefix}-${slug || "item"}`;
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedPose, setSelectedPose] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [mobilityMode, setMobilityMode] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const initialQueryPoseIdRef = useRef(searchParams.get("pose"));

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", gradient: "from-emerald-500/20 to-emerald-900/40" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", gradient: "from-blue-500/20 to-blue-900/40" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", gradient: "from-orange-500/20 to-orange-900/40" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", gradient: "from-cyan-500/20 to-cyan-900/40" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", gradient: "from-purple-500/20 to-purple-900/40" },
  };

  const difficultyColors = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-yellow-500/20 text-yellow-400",
    Advanced: "bg-red-500/20 text-red-400",
  };

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  const getElementPracticeTip = (element) => {
    if (element === "Earth") return "ground and stabilize your energy";
    if (element === "Water") return "enhance flow and emotional release";
    if (element === "Fire") return "ignite your inner power and transformation";
    if (element === "Air") return "expand awareness and create lightness";
    return "connect with your higher self and spiritual essence";
  };

  const fetchPoses = useCallback(async () => {
    try {
      const response = await api.get("/yoga/poses");
      setPoses(response.data);

      if (initialQueryPoseIdRef.current) {
        const preselectedPose = response.data.find((pose) => pose.id === initialQueryPoseIdRef.current);
        if (preselectedPose) {
          setSelectedPose(preselectedPose);
        }
        initialQueryPoseIdRef.current = null;
      }
    } catch (error) {
      appLogger.error("Failed to fetch poses", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await api.get("/favorites?item_type=pose");
      const favIds = new Set(response.data.map(f => f.item_id));
      setFavorites(favIds);
    } catch (error) {
      appLogger.warn("Failed to fetch yoga favorites", error);
    }
  }, [api]);

  useEffect(() => {
    fetchPoses();
    fetchFavorites();
  }, [fetchFavorites, fetchPoses]);

  const filteredPoses = useMemo(
    () => poses.filter((pose) => {
      if (selectedElement !== "all" && pose.element !== selectedElement) return false;
      if (showFavoritesOnly && !favorites.has(pose.id)) return false;
      if (mobilityMode && pose.difficulty !== "Beginner") return false;
      return true;
    }),
    [selectedElement, poses, showFavoritesOnly, favorites, mobilityMode],
  );

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
      appLogger.warn("Failed to toggle yoga favorite", error);
      toast.error("Could not update favorites");
    }
  };

  const getPoseCountByElement = (element) => {
    if (element === "all") return poses.length;
    return poses.filter(p => p.element === element).length;
  };

  const handleImageError = (poseId) => {
    setImageErrors(prev => new Set([...prev, poseId]));
  };

  const getPlaceholderImage = (element) => {
    const placeholders = {
      Earth: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
      Water: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
      Fire: "https://images.unsplash.com/photo-1573384666979-2b1e160d2d08?w=800",
      Air: "https://images.unsplash.com/photo-1557897467-d59fb33eb834?w=800",
      Spirit: "https://images.unsplash.com/photo-1767611067414-b11b40fd0612?w=800",
    };
    return placeholders[element] || placeholders.Earth;
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

            <Button
              variant={mobilityMode ? "default" : "outline"}
              size="sm"
              onClick={() => setMobilityMode(!mobilityMode)}
              className={mobilityMode ? "bg-emerald-600 hover:bg-emerald-700" : "border-white/10"}
              data-testid="mobility-filter"
              title="Show only beginner/accessible poses suitable for mobility challenges"
            >
              <Accessibility className="w-4 h-4 mr-1" />
              Accessible
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

        {/* Mobility Mode Banner */}
        {mobilityMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
          >
            <Accessibility className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-emerald-300">
              Showing <strong>Beginner / Accessible</strong> poses only — suitable for those with mobility challenges, injuries, or new to yoga. 
              Each pose includes contraindications to help you practice safely.
            </p>
          </motion.div>
        )}

        {/* Partner Yoga Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary/70" />
            <p className="text-xs text-muted-foreground">Practicing with a partner? Try our dedicated Partner Yoga poses.</p>
          </div>
          <button
            onClick={() => navigate("/partner-yoga")}
            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
            data-testid="partner-yoga-link"
          >
            Explore <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6 pt-2">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!loading && filteredPoses.length === 0 && (
          <div className="text-center py-16">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {showFavoritesOnly ? "No favorite poses yet. Start adding some!" : "No poses match your filter."}
            </p>
          </div>
        )}

        {!loading && filteredPoses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoses.map((pose, index) => {
              const colors = elementColors[pose.element] || elementColors.Earth;
              const isFavorite = favorites.has(pose.id);
              const hasImageError = imageErrors.has(pose.id);
              
              return (
                <motion.div
                  key={pose.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`rounded-2xl border backdrop-blur-xl cursor-pointer relative group overflow-hidden
                             ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => setSelectedPose(pose)}
                  data-testid={`pose-card-${pose.id}`}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={hasImageError ? getPlaceholderImage(pose.element) : (pose.image_url || getPlaceholderImage(pose.element))}
                      alt={pose.name}
                      className="w-full h-full object-contain object-center bg-black/35"
                      onError={() => handleImageError(pose.id)}
                      data-testid={`pose-image-${pose.id}`}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient}`} />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(pose.id, e)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all backdrop-blur-sm
                                 ${isFavorite ? 'bg-primary/40 text-primary' : 'bg-black/30 text-white opacity-0 group-hover:opacity-100'}`}
                      data-testid={`favorite-btn-${pose.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    {/* Element Badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs backdrop-blur-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {pose.element}
                    </span>
                    
                    {/* Difficulty Badge */}
                    {pose.difficulty && (
                      <span className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs ${difficultyColors[pose.difficulty] || difficultyColors.Beginner}`}>
                        {pose.difficulty}
                      </span>
                    )}

                    {(pose.image_source === "wikimedia_commons_verified" || pose.content_integrity?.verified) && (
                      <span
                        className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-[10px] bg-black/55 text-emerald-200 border border-emerald-300/30 backdrop-blur-sm"
                        data-testid={`verified-source-badge-${pose.id}`}
                      >
                        Verified Source
                      </span>
                    )}

                    {pose.image_source === "pending_verification" && (
                      <span
                        className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-[10px] bg-black/55 text-amber-200 border border-amber-300/30 backdrop-blur-sm"
                        data-testid={`pending-source-badge-${pose.id}`}
                      >
                        Pending Source Review
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-serif mb-1">{pose.name}</h3>
                    <p className="text-sm text-muted-foreground italic mb-3">{pose.sanskrit_name}</p>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pose.description}</p>

                    {pose.content_integrity?.verified && (
                      <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`pose-integrity-${pose.id}`}>
                        Verified references ({pose.content_integrity.references_count || 0})
                      </p>
                    )}
                    {formatReviewedDate(pose.content_integrity?.last_reviewed_at) && (
                      <p className="text-[11px] text-muted-foreground mb-3" data-testid={`pose-reviewed-at-${pose.id}`}>
                        Last reviewed: {formatReviewedDate(pose.content_integrity?.last_reviewed_at)}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{pose.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Pose Detail Dialog */}
      <AnimatePresence>
        {selectedPose && (
          <Dialog open={!!selectedPose} onOpenChange={() => setSelectedPose(null)}>
            <DialogContent className="bg-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto p-0">
              <DialogTitle className="sr-only" data-testid="yoga-pose-dialog-title">Yoga Pose Details</DialogTitle>
              <DialogDescription className="sr-only" data-testid="yoga-pose-dialog-description">
                Detailed yoga pose guidance including instructions, benefits, cautions, and spiritual context.
              </DialogDescription>
              {/* Hero Image */}
              <div className="relative h-64">
                <img
                  src={imageErrors.has(selectedPose.id) ? getPlaceholderImage(selectedPose.element) : (selectedPose.image_url || getPlaceholderImage(selectedPose.element))}
                  alt={selectedPose.name}
                  className="w-full h-full object-contain object-center bg-black/45"
                  onError={() => handleImageError(selectedPose.id)}
                  data-testid="selected-pose-image"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${elementColors[selectedPose.element]?.gradient || 'from-black/60 to-transparent'}`} />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedPose(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleFavorite(selectedPose.id, e)}
                  className={`absolute top-4 left-4 backdrop-blur-sm ${favorites.has(selectedPose.id) ? "text-primary bg-primary/20" : "text-white bg-black/30"}`}
                >
                  <Heart className={`w-4 h-4 mr-1 ${favorites.has(selectedPose.id) ? 'fill-current' : ''}`} />
                  {favorites.has(selectedPose.id) ? "Saved" : "Save"}
                </Button>
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${elementColors[selectedPose.element]?.bg} ${elementColors[selectedPose.element]?.text} border ${elementColors[selectedPose.element]?.border}`}>
                      {selectedPose.element}
                    </span>
                    {(selectedPose.image_source === "wikimedia_commons_verified" || selectedPose.content_integrity?.verified) && (
                      <span
                        className="px-2 py-1 rounded-full text-[10px] bg-black/55 text-emerald-200 border border-emerald-300/30 backdrop-blur-sm"
                        data-testid="selected-pose-verified-source-badge"
                      >
                        Verified Source
                      </span>
                    )}
                    {selectedPose.image_source === "pending_verification" && (
                      <span
                        className="px-2 py-1 rounded-full text-[10px] bg-black/55 text-amber-200 border border-amber-300/30 backdrop-blur-sm"
                        data-testid="selected-pose-pending-source-badge"
                      >
                        Pending Source Review
                      </span>
                    )}
                    {selectedPose.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs ${difficultyColors[selectedPose.difficulty] || difficultyColors.Beginner}`}>
                        {selectedPose.difficulty}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-serif text-white">{selectedPose.name}</h2>
                  <p className="text-lg text-white/70 italic">{selectedPose.sanskrit_name}</p>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed text-lg">{selectedPose.description}</p>

                {selectedPose.master_embodiment_protocol && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="selected-pose-master-embodiment-protocol">
                    <h3 className="text-sm uppercase tracking-wider text-amber-300 mb-3">Master Embodiment Protocol</h3>
                    <div className="space-y-3">
                      {[
                        { key: "preparation_phase", label: "Preparation" },
                        { key: "embodiment_phase", label: "Embodiment" },
                        { key: "integration_phase", label: "Integration" },
                      ].map((section) => (
                        <div key={section.key} className="p-3 rounded-lg bg-black/20 border border-white/10" data-testid={`selected-pose-master-${section.key}`}>
                          <p className="text-xs text-amber-200 font-medium mb-2">{section.label}</p>
                          <ul className="space-y-1.5">
                            {(selectedPose.master_embodiment_protocol?.[section.key] || []).map((step, index) => (
                              <li key={`selected-pose-${section.key}-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-300">✦</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {(selectedPose.master_embodiment_protocol?.seven_day_embodiment || []).length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-black/20 border border-white/10" data-testid="selected-pose-master-seven-day">
                        <p className="text-xs text-amber-200 font-medium mb-2">7-Day Embodiment Path</p>
                        <ol className="space-y-1.5">
                          {selectedPose.master_embodiment_protocol.seven_day_embodiment.map((step, index) => (
                            <li key={`selected-pose-seven-day-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-amber-300">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {(selectedPose.youtube_tutorials || []).length > 0 && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20" data-testid="selected-pose-youtube-tutorials">
                    <h3 className="text-sm uppercase tracking-wider text-cyan-300 mb-2">YouTube Tutorials</h3>
                    <div className="space-y-2">
                      {selectedPose.youtube_tutorials.map((item, index) => (
                        <a
                          key={`selected-pose-youtube-${index}`}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-cyan-100 underline underline-offset-2 break-words"
                          data-testid={`selected-pose-youtube-link-${index}`}
                        >
                          {item.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration & Chakras */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Hold for {selectedPose.duration_minutes} minutes</span>
                  </div>
                  {selectedPose.chakras?.map((chakra) => (
                    <span key={chakra} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm">
                      {chakra} Chakra
                    </span>
                  ))}
                </div>

                {/* Step-by-Step Instructions */}
                {selectedPose.instructions && selectedPose.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">1</span>
                      How to Get Into This Pose
                    </h3>
                    <div className="space-y-3 pl-10">
                      {selectedPose.instructions.map((instruction, idx) => (
                        <motion.div
                          key={stablePoseKey(`instruction-${selectedPose.id || selectedPose.name}`, instruction)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-muted-foreground leading-relaxed">{instruction}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPose && (
                  <div className="pl-10">
                    <GuidedAudioButton
                      api={api}
                      script={`Welcome to ${selectedPose.name}. ${selectedPose.description}. ${selectedPose.instructions?.join(". ") || "Move gently and breathe naturally."} Keep your awareness in the body and soften your jaw and shoulders as you hold the posture.`}
                      title={`Guided ${selectedPose.name}`}
                      element={selectedPose.element || "Spirit"}
                      duration={Math.max(8, selectedPose.duration_minutes || 8)}
                      practiceName={selectedPose.name}
                    />
                  </div>
                )}

                {/* Benefits */}
                {selectedPose.benefits && selectedPose.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <Check className="w-4 h-4" />
                      </span>
                      Benefits
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-10">
                      {selectedPose.benefits.map((benefit, idx) => (
                        <motion.div
                          key={benefit}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/10"
                        >
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contraindications */}
                {selectedPose.contraindications && selectedPose.contraindications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-serif mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      Cautions & Contraindications
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-10">
                      {selectedPose.contraindications.map((item) => (
                        <span key={item} className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-300 text-sm border border-orange-500/20">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spiritual Purpose */}
                {selectedPose.spiritual_purpose && (
                  <div>
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">✦</span>
                      Spiritual Purpose
                    </h3>
                    <div className="pl-10 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{selectedPose.spiritual_purpose}</p>
                    </div>
                  </div>
                )}

                {selectedPose.somatic_fascia_focus && (
                  <div data-testid="selected-pose-fascia-focus">
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">◎</span>
                      Somatic & Fascia Focus
                    </h3>
                    <div className="pl-10 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedPose.somatic_fascia_focus}</p>
                    </div>
                  </div>
                )}

                {selectedPose.breath_hybrid_cue && (
                  <div data-testid="selected-pose-breath-hybrid">
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">◈</span>
                      Breath Hybrid Cue
                    </h3>
                    <div className="pl-10 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedPose.breath_hybrid_cue}</p>
                      {selectedPose.mindfulness_prompt && (
                        <p className="text-sm text-cyan-200/80 mt-3">Mindfulness: {selectedPose.mindfulness_prompt}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedPose.source_references?.length > 0 && (
                  <div data-testid="selected-pose-source-references">
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">↗</span>
                      Source References
                    </h3>
                    <div className="pl-10 space-y-2">
                      {selectedPose.source_references.slice(0, 3).map((ref) => (
                        <a
                          key={ref}
                          href={ref}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-sm text-amber-200/80 hover:text-amber-200 underline underline-offset-2 break-all"
                          data-testid={`selected-pose-reference-${stablePoseKey(selectedPose.id || selectedPose.name, ref)}`}
                        >
                          {ref}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPose.image_source === "pending_verification" && (
                  <div data-testid="selected-pose-pending-verification-note">
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300">!</span>
                      Source Review Status
                    </h3>
                    <div className="pl-10 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        This pose is currently marked as pending source verification.
                      </p>
                      {selectedPose.image_validation?.priority && (
                        <p className="text-sm text-amber-200/80 mt-2">
                          Priority: {selectedPose.image_validation.priority}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Energetic Effects */}
                {selectedPose.energetic_effects && (
                  <div>
                    <h3 className="text-lg font-serif mb-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">⚡</span>
                      Energetic Effects
                    </h3>
                    <div className="pl-10 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedPose.energetic_effects}</p>
                    </div>
                  </div>
                )}

                {/* Practice Tip */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Practice Tip:</strong> Connect with your breath throughout this pose. 
                    Inhale to create space, exhale to deepen. Listen to your body and modify as needed.
                    This pose works with the <strong className="text-primary">{selectedPose.element}</strong> element to {
                      getElementPracticeTip(selectedPose.element)
                    }.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YogaLibrary;
