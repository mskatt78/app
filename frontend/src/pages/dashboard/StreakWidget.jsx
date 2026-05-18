import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, BookOpen } from "lucide-react";
import { Button } from "../../components/ui/button";

export const StreakWidget = ({ onJournalClick }) => {
  const { streak, milestone, thisWeek, weekDots } = useMemo(() => {
    const raw = localStorage.getItem("practiceJournalEntries");
    const entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) return { streak: 0, milestone: null, thisWeek: 0, weekDots: Array(7).fill(false) };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayMs = 86400000;

    const datesWithEntry = new Set(
      entries.map((entry) => {
        const entryDate = new Date(entry.date || entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime();
      }),
    );

    let streak = 0;
    let check = new Date(today);
    while (datesWithEntry.has(check.getTime())) {
      streak += 1;
      check = new Date(check.getTime() - dayMs);
    }

    const weekDots = Array(7).fill(false);
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(monday.getTime() + offset * dayMs);
      weekDots[offset] = datesWithEntry.has(day.getTime());
    }

    const milestones = [
      { days: 40, label: "Sacred 40 ✦", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
      { days: 21, label: "21-Day Initiation ✦", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
      { days: 14, label: "Fortnight Keeper ✦", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
      { days: 7, label: "7-Day Guardian ✦", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
      { days: 3, label: "3-Day Seeker ✦", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" },
    ];

    return {
      streak,
      milestone: milestones.find((item) => streak >= item.days) || null,
      thisWeek: weekDots.filter(Boolean).length,
      weekDots,
    };
  }, []);

  const days = [
    { id: "mon", label: "M", offset: 0 },
    { id: "tue", label: "T", offset: 1 },
    { id: "wed", label: "W", offset: 2 },
    { id: "thu", label: "T", offset: 3 },
    { id: "fri", label: "F", offset: 4 },
    { id: "sat", label: "S", offset: 5 },
    { id: "sun", label: "S", offset: 6 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-white/10 bg-card/50 backdrop-blur-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      data-testid="streak-widget"
    >
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
          <Flame className="w-6 h-6 text-amber-400" />
          <span className="text-lg font-bold text-amber-300 leading-none">{streak}</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Practice Streak</p>
          <p className="font-serif text-xl">{streak === 1 ? "1 day" : `${streak} days`}</p>
          {milestone && (
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${milestone.bg} ${milestone.color}`}>
              {milestone.label}
            </span>
          )}
          {streak === 0 && <p className="text-xs text-muted-foreground mt-0.5">Begin your practice today</p>}
        </div>
      </div>

      <div className="flex-1 sm:text-center">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">This Week — {thisWeek}/7</p>
        <div className="flex gap-2">
          {days.map((day) => (
            <div key={day.id} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full border transition-all ${weekDots[day.offset] ? "bg-amber-500/30 border-amber-500/60" : "bg-white/5 border-white/10"}`}>
                {weekDots[day.offset] && <Flame className="w-full h-full p-1.5 text-amber-400" />}
              </div>
              <span className="text-[9px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Button size="sm" variant="outline" onClick={onJournalClick} className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 flex-shrink-0" data-testid="streak-journal-btn">
        <BookOpen className="w-3 h-3 mr-1" /> Journal
      </Button>
    </motion.div>
  );
};
