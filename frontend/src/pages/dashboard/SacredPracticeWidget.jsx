import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon } from "lucide-react";
import { appLogger } from "../../utils/logger";

const WIDGET_ANIMATION = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 },
};

export const SacredPracticeWidget = ({ api, navigate }) => {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);

  const logWarn = useCallback((message, error) => {
    appLogger.warn(message, error);
  }, []);

  const fetchDailyPractice = useCallback(async () => {
    try {
      const response = await api.get("/daily-practice");
      setPractice(response.data);
    } catch (error) {
      logWarn("Failed to fetch daily practice widget", error);
    } finally {
      setLoading(false);
    }
  }, [api, logWarn]);

  useEffect(() => {
    fetchDailyPractice();
  }, [fetchDailyPractice]);

  if (loading) {
    return (
      <motion.div
        {...WIDGET_ANIMATION}
        className="rounded-2xl border border-white/10 bg-card/50 p-5 animate-pulse"
      >
        <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-white/5 rounded-xl" />
          <div className="h-24 bg-white/5 rounded-xl" />
        </div>
      </motion.div>
    );
  }

  if (!practice) return null;

  return (
    <motion.div
      {...WIDGET_ANIMATION}
      className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-5"
      data-testid="sacred-practice-widget"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Today&apos;s Sacred Practice</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">{practice.moon_phase}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-amber-200" data-testid="daily-lens-title">{practice.daily_lens?.title || practice.day_theme}</span>
          </div>
          {practice.daily_lens?.guidance && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed" data-testid="daily-lens-guidance">{practice.daily_lens.guidance}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {practice.morning_practice && (
          <div
            onClick={() => navigate("/chakra-cleansing")}
            className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 cursor-pointer hover:bg-amber-500/10 transition-all group"
            data-testid="morning-practice-card"
          >
            <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Morning</p>
            <p className="text-sm font-medium text-amber-100 group-hover:text-amber-200 transition-colors leading-tight">{practice.morning_practice.name}</p>
            {practice.morning_practice.duration_minutes && (
              <p className="text-[10px] text-muted-foreground mt-1">{practice.morning_practice.duration_minutes} min</p>
            )}
          </div>
        )}

        {practice.evening_practice && (
          <div
            onClick={() => navigate("/yoga")}
            className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 cursor-pointer hover:bg-indigo-500/10 transition-all group"
            data-testid="evening-practice-card"
          >
            <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">Evening</p>
            <p className="text-sm font-medium text-indigo-100 group-hover:text-indigo-200 transition-colors leading-tight">{practice.evening_practice.name}</p>
            {practice.evening_practice.duration_minutes && (
              <p className="text-[10px] text-muted-foreground mt-1">{practice.evening_practice.duration_minutes} min</p>
            )}
          </div>
        )}
      </div>

      {practice.guidance && (
        <p className="text-xs text-muted-foreground/70 italic mt-3 leading-relaxed line-clamp-2">{practice.guidance}</p>
      )}
    </motion.div>
  );
};
