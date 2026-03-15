import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Trophy, Flame, Moon, Clock, Eye, Wind, Leaf, Sparkles,
  Footprints, Hourglass, Lock, Star, Mountain, Droplets, Heart, Zap, Unlock
} from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const Achievements = ({ user, api }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const categoryIcons = {
    beginner: Footprints,
    dedication: Flame,
    mastery: Trophy,
    oracle: Eye,
    breathwork: Wind,
    yoga: Leaf,
    elements: Sparkles,
    heart: Heart,
    shamanic: Moon,
    special: Star,
    creative: Zap
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get("/achievements");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      toast.error("Could not load achievements");
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = data?.achievements?.filter(a => 
    filter === "all" || a.category === filter
  ) || [];

  const categories = ["all", "beginner", "dedication", "mastery", "elements", "oracle", "yoga", "breathwork", "heart", "shamanic", "creative", "special"];

  return (
    <div className="min-h-screen bg-background" data-testid="achievements-page">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Journey</p>
            <h1 className="text-xl font-serif">Achievements <span className="italic text-primary">& Badges</span></h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-card/50 border border-white/5 text-center"
              >
                <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{data?.stats?.total_unlocked || 0}</p>
                <p className="text-xs text-muted-foreground">Unlocked</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-card/50 border border-white/5 text-center"
              >
                <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-3xl font-bold">{(data?.stats?.total_achievements || 0) - (data?.stats?.total_unlocked || 0)}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-card/50 border border-white/5 text-center"
              >
                <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                <p className="text-3xl font-bold">{data?.stats?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-card/50 border border-white/5 text-center"
              >
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-3xl font-bold">{Math.floor((data?.stats?.total_minutes || 0) / 60)}</p>
                <p className="text-xs text-muted-foreground">Hours Practiced</p>
              </motion.div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat] || Star;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                      ${filter === cat 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
                    data-testid={`filter-${cat}`}
                  >
                    {cat !== "all" && <Icon className="w-4 h-4" />}
                    <span className="text-sm capitalize">{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAchievements.map((achievement, index) => {
                const Icon = categoryIcons[achievement.category] || Trophy;
                const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
                const badgeColor = achievement.badge_color || "#8b5cf6";
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 rounded-2xl border backdrop-blur-xl transition-all
                               ${achievement.unlocked 
                                 ? 'bg-card/50 border-white/10' 
                                 : 'bg-card/30 border-white/5 opacity-70'}`}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center relative"
                        style={{ backgroundColor: achievement.unlocked ? `${badgeColor}20` : 'rgba(255,255,255,0.05)' }}
                      >
                        <Icon 
                          className="w-8 h-8" 
                          style={{ color: achievement.unlocked ? badgeColor : '#6b7280' }}
                        />
                        {!achievement.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 
                            className="text-lg font-serif"
                            style={{ color: achievement.unlocked ? badgeColor : 'inherit' }}
                          >
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs"
                              style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}
                            >
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        
                        {/* Unlocks Info */}
                        {achievement.unlocks && (
                          <div className="flex items-center gap-2 mb-3 text-xs">
                            <Unlock className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400">
                              Unlocks: {achievement.unlocks.item?.replace('_', ' ') || achievement.unlocks.feature || achievement.unlocks.spread}
                            </span>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{achievement.progress} / {achievement.target}</span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className="h-2"
                            style={{ 
                              '--progress-color': achievement.unlocked ? badgeColor : '#6b7280'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No achievements in this category yet.</p>
              </div>
            )}

            {/* Motivation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground italic font-serif text-lg">
                "Each achievement unlocks new depths of your shamanic journey."
              </p>
              <p className="text-sm text-muted-foreground mt-2">- Ancient Wisdom</p>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Achievements;
