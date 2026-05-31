import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Calendar, Clock, Flame, Trophy, TrendingUp,
  BarChart3, Target, Zap, Droplets, Wind, Mountain, Sparkles
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";

const PracticeLog = ({ user, api }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const elementIcons = {
    Earth: Mountain,
    Water: Droplets,
    Fire: Flame,
    Air: Wind,
    Spirit: Sparkles
  };

  const elementColors = {
    Earth: "text-emerald-400 bg-emerald-500/10",
    Water: "text-blue-400 bg-blue-500/10",
    Fire: "text-orange-400 bg-orange-500/10",
    Air: "text-cyan-400 bg-cyan-500/10",
    Spirit: "text-purple-400 bg-purple-500/10"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/practice-history/detailed-stats"),
          api.get("/practice-history?limit=20")
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        appLogger.error("Failed to fetch practice data:", error);
        toast.error("Could not load practice history");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const practiceTypeLabels = {
    yoga: "Yoga",
    breathwork: "Breathwork",
    meditation: "Meditation",
    oracle: "Oracle Reading",
    mantra: "Mantra",
    mudra: "Mudra",
    grounding: "Grounding",
    somatic: "Somatic",
    heart_practice: "Heart Practice",
    shamanic_journey: "Shamanic Journey",
    elemental: "Elemental Practice"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="practice-log">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Practice <span className="italic text-primary">Log</span></h1>
            <p className="text-sm text-muted-foreground">Track your sacred journey</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Streak</span>
            </div>
            <p className="text-3xl font-bold">{stats?.current_streak || 0}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Sessions</span>
            </div>
            <p className="text-3xl font-bold">{stats?.total_sessions || 0}</p>
            <p className="text-xs text-muted-foreground">completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Time</span>
            </div>
            <p className="text-3xl font-bold">{stats?.total_hours || 0}</p>
            <p className="text-xs text-muted-foreground">hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Readings</span>
            </div>
            <p className="text-3xl font-bold">{stats?.oracle_readings_count || 0}</p>
            <p className="text-xs text-muted-foreground">oracle</p>
          </motion.div>
        </div>

        {/* Weekly Chart */}
        {stats?.weekly_data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif">Weekly Activity</h3>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              {stats.weekly_data.map((day, i) => {
                const maxMinutes = Math.max(...stats.weekly_data.map(d => d.minutes), 1);
                const height = (day.minutes / maxMinutes) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/50 to-primary"
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-xs text-primary">{day.minutes}m</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Element Balance */}
        {stats?.by_element && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-card/50 border border-white/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-serif">Elemental Balance</h3>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(stats.by_element).map(([element, count]) => {
                const Icon = elementIcons[element] || Sparkles;
                const colors = elementColors[element] || "text-gray-400 bg-gray-500/10";
                const total = Object.values(stats.by_element).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={element} className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl ${colors.split(' ')[1]} flex items-center justify-center mb-2`}>
                      <Icon className={`w-6 h-6 ${colors.split(' ')[0]}`} />
                    </div>
                    <p className="text-sm font-medium">{element}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Practice History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-serif">Recent Practices</h3>
          </div>
          
          {history.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card/50 border border-white/5 text-center">
              <p className="text-muted-foreground">No practices recorded yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete a yoga session, meditation, or breathwork to start tracking!
              </p>
              <Button 
                onClick={() => navigate("/yoga")} 
                className="mt-4"
                data-testid="start-practice-btn"
              >
                Start Your First Practice
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => {
                const Icon = elementIcons[item.element] || Sparkles;
                const colors = elementColors[item.element] || "text-gray-400 bg-gray-500/10";
                return (
                  <motion.div
                    key={item.log_id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="p-4 rounded-xl bg-card/50 border border-white/5 flex items-center gap-4"
                    data-testid={`history-item-${index}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${colors.split(' ')[1]} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.split(' ')[0]}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {practiceTypeLabels[item.practice_type] || item.practice_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.duration_minutes} minutes • {item.element || 'Spirit'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.completed_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PracticeLog;
