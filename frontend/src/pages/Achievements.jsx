import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Trophy, Flame, Moon, Clock, Eye, Wind, Leaf, Sparkles,
  Footprints, Hourglass, Lock
} from "lucide-react";
import { Progress } from "../components/ui/progress";

const Achievements = ({ user, api }) => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    footprints: Footprints,
    flame: Flame,
    moon: Moon,
    trophy: Trophy,
    clock: Clock,
    hourglass: Hourglass,
    eye: Eye,
    wind: Wind,
    leaf: Leaf,
    sparkles: Sparkles,
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await api.get("/achievements");
      setAchievements(response.data);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background" data-testid="achievements-page">
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
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Journey</p>
              <h1 className="text-xl font-serif">Achievements <span className="italic text-primary">& Badges</span></h1>
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
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-4xl font-serif mb-2">
                <span className="text-primary">{unlockedCount}</span> / {achievements.length}
              </h2>
              <p className="text-muted-foreground">Achievements Unlocked</p>
            </motion.div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = iconMap[achievement.icon] || Trophy;
                const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 rounded-2xl border backdrop-blur-xl transition-all
                               ${achievement.unlocked 
                                 ? 'bg-primary/10 border-primary/30' 
                                 : 'bg-card/30 border-white/5 opacity-70'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center relative
                                      ${achievement.unlocked 
                                        ? 'bg-primary/20' 
                                        : 'bg-white/5'}`}>
                        <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        {!achievement.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-serif ${achievement.unlocked ? 'text-primary' : 'text-foreground'}`}>
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{achievement.progress} / {achievement.target}</span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className={`h-2 ${achievement.unlocked ? '[&>div]:bg-primary' : ''}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Motivation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground italic font-serif text-lg">
                "The journey of a thousand miles begins with a single step."
              </p>
              <p className="text-sm text-muted-foreground mt-2">- Lao Tzu</p>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

export default Achievements;
