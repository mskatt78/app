import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Flame, Sparkles, Timer, Trophy, ChevronRight } from "lucide-react";
import { MilestoneBlessing } from "./MilestoneBlessing";
import { appLogger } from "../../utils/logger";

const typeLabels = {
  meditation: "Meditations",
  breathwork: "Breathwork",
  yoga: "Yoga",
  mantra: "Mantras",
  mudra: "Mudras",
  grounding: "Grounding",
  ritual: "Rituals",
};

export const SacredJourneyWidget = ({ api, navigate }) => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/practice-history/stats"),
          api.get("/practice-history", { params: { limit: 4 } }),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setRecent(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch (error) {
        appLogger.warn("Sacred journey stats unavailable", error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [api]);

  if (!stats) return null;

  const topTypes = Object.entries(stats.by_type || {})
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-5"
      data-testid="sacred-journey-widget"
    >
      <MilestoneBlessing streak={stats.current_streak} />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" strokeWidth={1.5} />
          <h3 className="font-serif text-lg">
            Sacred <span className="italic text-primary">Journey</span>
          </h3>
        </div>
        <button
          onClick={() => navigate("/progress")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="journey-view-progress-btn"
        >
          Full progress <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center" data-testid="journey-streak-stat">
          <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-300 leading-none">{stats.current_streak}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Day streak</p>
        </div>
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-3 text-center" data-testid="journey-sessions-stat">
          <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-300 leading-none">{stats.total_sessions}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Practices</p>
        </div>
        <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-center" data-testid="journey-minutes-stat">
          <Timer className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-cyan-300 leading-none">{stats.total_minutes}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Minutes</p>
        </div>
      </div>

      {topTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" data-testid="journey-top-types">
          {topTypes.map(([type, data]) => (
            <span key={type} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
              {typeLabels[type] || type}: <span className="text-foreground">{data.count}</span>
            </span>
          ))}
        </div>
      )}

      {recent.length > 0 ? (
        <div className="space-y-2" data-testid="journey-recent-list">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recently completed</p>
          {recent.map((entry, index) => (
            <div key={`${entry.practice_id || entry.practice_type}-${index}`} className="flex items-center gap-2 text-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
              <span className="text-foreground/90 truncate flex-1">
                {entry.notes?.replace(/^Completed\s+/i, "") || typeLabels[entry.practice_type] || entry.practice_type}
              </span>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {entry.completed_at ? new Date(entry.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground" data-testid="journey-empty-hint">
          Complete any guided practice and it will appear on your journey here.
        </p>
      )}
    </motion.div>
  );
};
