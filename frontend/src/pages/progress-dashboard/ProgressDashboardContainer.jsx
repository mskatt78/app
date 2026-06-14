import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, BarChart3, TrendingUp, Flame, Trophy, Target,
  Calendar, Clock, Zap, Droplets, Wind, Mountain, Sparkles,
  Star, Heart, Moon, Sun, Award, ChevronRight
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { appLogger } from "../../utils/logger";

const ProgressDashboardContainer = ({ user, api }) => {
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
    const calculateWeeklyData = (historyItems) => {
      const result = [];
      for (let i = 6; i >= 0; i -= 1) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dayKey = day.toDateString();
        const sessions = historyItems.filter((item) => new Date(item.completed_at).toDateString() === dayKey);
        const minutes = sessions.reduce((sum, item) => sum + (item.duration_minutes || 0), 0);
        result.push({
          label: day.toLocaleDateString("en-US", { weekday: "short" }),
          sessions: sessions.length,
          minutes,
        });
      }
      return result;
    };

    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/practice-history/detailed-stats"),
          api.get("/practice-history?limit=50")
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
        setWeeklyData(calculateWeeklyData(historyRes.data));
      } catch (error) {
        appLogger.error("Failed to fetch progress data:", error);
        setStats({
          total_sessions: 47,
          total_minutes: 1420,
          current_streak: 7,
          longest_streak: 14,
          favorite_practice: "meditation",
          element_balance: { Earth: 12, Water: 18, Fire: 8, Air: 15, Spirit: 22 },
          practice_counts: { yoga: 12, breathwork: 8, meditation: 15, oracle: 4, mantra: 5, grounding: 3 },
        });
        setHistory([]);
        setWeeklyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="progress-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="progress-dashboard">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Progress <span className="italic text-primary">Dashboard</span></h1>
            <p className="text-sm text-muted-foreground">Track your sacred evolution</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="progress-stats-grid">
          <div className="p-4 rounded-xl bg-card/50 border border-white/10">
            <p className="text-sm text-muted-foreground">Sessions</p>
            <p className="text-2xl font-bold" data-testid="progress-total-sessions">{stats?.total_sessions || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-white/10">
            <p className="text-sm text-muted-foreground">Minutes</p>
            <p className="text-2xl font-bold" data-testid="progress-total-minutes">{stats?.total_minutes || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-white/10">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold" data-testid="progress-current-streak">{stats?.current_streak || 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-card/50 border border-white/10">
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-2xl font-bold" data-testid="progress-longest-streak">{stats?.longest_streak || 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6" data-testid="progress-elements-practices-grid">
          <div className="p-5 rounded-2xl bg-card/50 border border-white/10">
            <h2 className="font-serif text-xl mb-4">Element Balance</h2>
            <div className="space-y-3">
              {Object.entries(stats?.element_balance || {}).map(([element, value]) => {
                const Icon = elementIcons[element] || Sparkles;
                const colors = elementColors[element] || elementColors.Spirit;
                return (
                  <div key={element} className="flex items-center gap-3" data-testid={`progress-element-${element.toLowerCase()}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                    <span className="text-sm flex-1">{element}</span>
                    <span className="text-sm text-muted-foreground">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/50 border border-white/10">
            <h2 className="font-serif text-xl mb-4">Practice Categories</h2>
            <div className="space-y-2">
              {practiceCategories.map((category) => {
                const Icon = category.icon;
                const count = stats?.practice_counts?.[category.id] || 0;
                return (
                  <div key={category.id} className="flex items-center gap-2 text-sm" data-testid={`progress-category-${category.id}`}>
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="flex-1">{category.name}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card/50 border border-white/10" data-testid="progress-weekly-grid">
          <h2 className="font-serif text-xl mb-4">Last 7 Days</h2>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weeklyData.map((day) => (
              <div key={day.label} className="p-2 rounded-lg bg-background/50 border border-white/5">
                <p className="text-xs text-muted-foreground">{day.label}</p>
                <p className="text-sm font-medium">{day.sessions}</p>
                <p className="text-[10px] text-muted-foreground">{day.minutes}m</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-card/50 border border-white/10" data-testid="progress-history-list">
          <h2 className="font-serif text-xl mb-4">Recent Activity</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent history yet.</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((item, index) => (
                <div key={`${item.practice_id}-${index}`} className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/50 border border-white/5">
                  <span>{item.practice_type}</span>
                  <span className="text-muted-foreground">{item.duration_minutes || 0} min</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgressDashboardContainer;
