import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, Leaf, Sparkles, Music, Hand, Wind, Waves, Mountain,
  Trash2, Clock, Trophy, Flame
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

const Favorites = ({ user, api }) => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const typeIcons = {
    pose: Leaf,
    crystal: Sparkles,
    mantra: Music,
    mudra: Hand,
    breathwork: Wind,
    somatic: Waves,
    grounding: Mountain,
  };

  const typeLabels = {
    pose: "Yoga Poses",
    crystal: "Crystals",
    mantra: "Mantras",
    mudra: "Mudras",
    breathwork: "Breathwork",
    somatic: "Somatic",
    grounding: "Grounding",
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favsRes, statsRes] = await Promise.all([
          api.get("/favorites"),
          api.get("/practice-history/stats"),
        ]);
        setFavorites(favsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const removeFavorite = async (itemType, itemId) => {
    try {
      await api.delete(`/favorites/${itemType}/${itemId}`);
      setFavorites(prev => prev.filter(f => !(f.item_type === itemType && f.item_id === itemId)));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      toast.error("Could not remove favorite");
    }
  };

  const getFilteredFavorites = () => {
    if (activeTab === "all") return favorites;
    return favorites.filter(f => f.item_type === activeTab);
  };

  const getTypeCount = (type) => {
    return favorites.filter(f => f.item_type === type).length;
  };

  const filteredFavorites = getFilteredFavorites();

  return (
    <div className="min-h-screen bg-background" data-testid="favorites-page">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Collection</p>
              <h1 className="text-xl font-serif">Favorites & <span className="italic text-primary">Progress</span></h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-primary/10 border border-primary/20"
                >
                  <Trophy className="w-8 h-8 text-primary mb-2" />
                  <p className="text-3xl font-serif text-primary">{stats.current_streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/20"
                >
                  <Flame className="w-8 h-8 text-orange-400 mb-2" />
                  <p className="text-3xl font-serif text-orange-400">{stats.total_sessions}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20"
                >
                  <Clock className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-3xl font-serif text-blue-400">{stats.total_minutes}</p>
                  <p className="text-sm text-muted-foreground">Minutes Practiced</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20"
                >
                  <Heart className="w-8 h-8 text-purple-400 mb-2" />
                  <p className="text-3xl font-serif text-purple-400">{favorites.length}</p>
                  <p className="text-sm text-muted-foreground">Saved Favorites</p>
                </motion.div>
              </div>
            )}

            {/* Favorites Section */}
            <h2 className="text-2xl font-serif mb-6">Your <span className="italic text-primary">Saved Practices</span></h2>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-card/50 border border-white/5 mb-6">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
                  All ({favorites.length})
                </TabsTrigger>
                {Object.keys(typeLabels).map((type) => {
                  const count = getTypeCount(type);
                  if (count === 0) return null;
                  const Icon = typeIcons[type];
                  return (
                    <TabsTrigger key={type} value={type} className="data-[state=active]:bg-primary/20">
                      <Icon className="w-4 h-4 mr-1" />
                      {count}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredFavorites.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No favorites yet. Start exploring and save your favorite practices!</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => navigate("/yoga")}
                    >
                      Explore Yoga Library
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFavorites.map((fav, index) => {
                      const item = fav.item;
                      if (!item) return null;
                      
                      const Icon = typeIcons[fav.item_type] || Heart;
                      const colors = elementColors[item.element] || elementColors.Spirit;
                      
                      return (
                        <motion.div
                          key={`${fav.item_type}-${fav.item_id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-5 rounded-xl border backdrop-blur-xl relative group
                                     ${colors.bg} ${colors.border}`}
                        >
                          <button
                            onClick={() => removeFavorite(fav.item_type, fav.item_id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-destructive/10 text-destructive 
                                     opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${colors.bg}`}>
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {typeLabels[fav.item_type]}
                              </p>
                              <h4 className="font-serif text-lg truncate">{item.name}</h4>
                              {item.sanskrit_name && (
                                <p className="text-sm text-muted-foreground italic truncate">{item.sanskrit_name}</p>
                              )}
                              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                                {item.element}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
