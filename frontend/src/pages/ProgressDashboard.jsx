import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, BarChart3, TrendingUp, Flame, Trophy, Target,
  Calendar, Clock, Zap, Droplets, Wind, Mountain, Sparkles,
  Star, Heart, Moon, Sun, Award, ChevronRight
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const ProgressDashboard = ({ user, api }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const elementIcons = {
    Earth: Mountain,
    Water: Droplets,
    Fire: Flame,
    Air: Wind,
    Spirit: Sparkles
  };

  const elementColors = {
    Earth: { text: "text-emerald-400", bg: "bg-emerald-500", light: "bg-emerald-500/20" },
    Water: { text: "text-blue-400", bg: "bg-blue-500", light: "bg-blue-500/20" },
    Fire: { text: "text-orange-400", bg: "bg-orange-500", light: "bg-orange-500/20" },
    Air: { text: "text-cyan-400", bg: "bg-cyan-500", light: "bg-cyan-500/20" },
    Spirit: { text: "text-purple-400", bg: "bg-purple-500", light: "bg-purple-500/20" }
  };

  const practiceCategories = [
    { id: "yoga", name: "Yoga", icon: Sparkles, color: "emerald" },
    { id: "breathwork", name: "Breathwork", icon: Wind, color: "cyan" },
    { id: "meditation", name: "Meditation", icon: Moon, color: "purple" },
    { id: "oracle", name: "Oracle", icon: Star, color: "amber" },
    { id: "mantra", name: "Mantras", icon: Heart, color: "rose" },
    { id: "grounding", name: "Grounding", icon: Mountain, color: "green" },
    { id: "somatic", name: "Somatic", icon: Zap, color: "orange" },
    { id: "shamanic", name: "Shamanic", icon: Flame, color: "red" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/practice-history/detailed-stats"),
          api.get("/practice-history?limit=50")
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);

        // Calculate weekly data for chart
        const weekly = calculateWeeklyData(historyRes.data);
        setWeeklyData(weekly);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
        // Use mock data for demo
        setStats({
          total_sessions: 47,
          total_minutes: 1420,
          current_streak: 7,
          longest_streak: 14,
          favorite_practice: "meditation",
          element_balance: {
            Earth: 12,
            Water: 18,
            Fire: 8,
            Air: 15,
            Spirit: 22
          },
          practice_counts: {
            yoga: 12,
            breathwork: 8,
            meditation: 15,
            oracle: 5,
            mantra: 4,
            grounding: 3
          },
          achievements_unlocked: 8,
          weekly_goal: 5,
          weekly_completed: 4
        });
        setWeeklyData([
          { day: "Mon", minutes: 25, sessions: 2 },
          { day: "Tue", minutes: 40, sessions: 3 },
          { day: "Wed", minutes: 15, sessions: 1 },
          { day: "Thu", minutes: 35, sessions: 2 },
          { day: "Fri", minutes: 50, sessions: 4 },
          { day: "Sat", minutes: 30, sessions: 2 },
          { day: "Sun", minutes: 45, sessions: 3 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  const calculateWeeklyData = (history) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekData = days.map(day => ({ day, minutes: 0, sessions: 0 }));

    history.forEach(item => {
      const itemDate = new Date(item.created_at || item.timestamp);
      if (itemDate >= weekStart) {
        const dayIndex = itemDate.getDay();
        weekData[dayIndex].minutes += item.duration_minutes || 10;
        weekData[dayIndex].sessions += 1;
      }
    });

    return weekData;
  };

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="progress-dashboard">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-serif">Progress <span className="italic text-primary">Dashboard</span></h1>
            <p className="text-sm text-muted-foreground">Your sacred journey visualized</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20"
          >
            <Flame className="w-8 h-8 text-orange-400 mb-3" />
            <p className="text-3xl font-serif text-orange-300">{stats?.current_streak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20"
          >
            <Clock className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-3xl font-serif text-purple-300">{stats?.total_minutes || 0}</p>
            <p className="text-sm text-muted-foreground">Total Minutes</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/20"
          >
            <Target className="w-8 h-8 text-emerald-400 mb-3" />
            <p className="text-3xl font-serif text-emerald-300">{stats?.total_sessions || 0}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20"
          >
            <Trophy className="w-8 h-8 text-amber-400 mb-3" />
            <p className="text-3xl font-serif text-amber-300">{stats?.achievements_unlocked || 0}</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </motion.div>
        </div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-serif">This Week's Practice</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary" />
                Minutes
              </span>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-primary/50 to-primary rounded-t-lg min-h-[4px] relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card px-2 py-1 rounded text-xs whitespace-nowrap">
                    {day.minutes} min • {day.sessions} sessions
                  </div>
                </motion.div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>

          {/* Weekly Goal */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Weekly Goal Progress</span>
              <span className="text-sm font-medium">{stats?.weekly_completed || 0} / {stats?.weekly_goal || 5} days</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((stats?.weekly_completed || 0) / (stats?.weekly_goal || 5)) * 100}%` }}
                transition={{ delay: 1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Element Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-serif mb-6">Elemental Balance</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats?.element_balance || {}).map(([element, count], index) => {
              const Icon = elementIcons[element] || Sparkles;
              const colors = elementColors[element] || elementColors.Spirit;
              const total = Object.values(stats?.element_balance || {}).reduce((a, b) => a + b, 0) || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <motion.div
                  key={element}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 mx-auto rounded-full ${colors.light} flex items-center justify-center mb-2`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  <p className="text-2xl font-serif">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">{element}</p>
                  
                  {/* Progress Ring */}
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                      className={`h-full ${colors.bg} rounded-full`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Practice Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-serif mb-6">Practice Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {practiceCategories.map((cat, index) => {
              const count = stats?.practice_counts?.[cat.id] || 0;
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`p-4 rounded-xl bg-${cat.color}-500/10 border border-${cat.color}-500/20 text-center`}
                >
                  <Icon className={`w-6 h-6 text-${cat.color}-400 mx-auto mb-2`} />
                  <p className="text-2xl font-serif">{count}</p>
                  <p className="text-xs text-muted-foreground">{cat.name}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-serif">Recent Achievements</h3>
            <button 
              onClick={() => navigate("/achievements")}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { name: "First Steps", desc: "Complete first practice", icon: Star },
              { name: "Week Warrior", desc: "7-day streak", icon: Flame },
              { name: "Element Explorer", desc: "Try all 5 elements", icon: Sparkles },
              { name: "Moon Child", desc: "Practice on full moon", icon: Moon }
            ].map((achievement, i) => (
              <div key={`${achievement.name}-${i}`} className="flex-shrink-0 w-24 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2">
                  <achievement.icon className="w-8 h-8 text-amber-400" />
                </div>
                <p className="text-xs font-medium">{achievement.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-lg font-serif mb-4">Journey Milestones</h3>
          <div className="space-y-4">
            {[
              { label: "100 Practice Sessions", current: stats?.total_sessions || 0, target: 100 },
              { label: "2000 Minutes of Practice", current: stats?.total_minutes || 0, target: 2000 },
              { label: "30-Day Streak", current: stats?.longest_streak || 0, target: 30 },
              { label: "All Elements Mastered", current: Object.keys(stats?.element_balance || {}).filter(e => (stats?.element_balance?.[e] || 0) >= 10).length, target: 5 }
            ].map((milestone, i) => {
              const progress = Math.min((milestone.current / milestone.target) * 100, 100);
              return (
                <div key={`${milestone.label}-${i}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{milestone.label}</span>
                    <span>{milestone.current} / {milestone.target}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProgressDashboard;
