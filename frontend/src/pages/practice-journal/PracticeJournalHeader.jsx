import { ArrowLeft, BookOpen, Flame, Moon, Plus, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";

export const PracticeJournalHeader = ({
  navigate,
  setShowForm,
  onOpenWeeklyReflection,
  streak,
  milestone,
  totalEntries,
  thisWeek,
  moonPhase,
}) => {
  const streakDayLabel = streak === 1 ? "day" : "days";

  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-emerald-950/30 to-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/menu")}
          className="mb-4 text-muted-foreground"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <BookOpen className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif">Practice Journal</h1>
              <p className="text-muted-foreground mt-1">Track your sacred journey</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={onOpenWeeklyReflection}
              className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
              data-testid="practice-journal-open-weekly-reflection-button"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Weekly Reflection
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="new-entry-btn"
            >
              <Plus className="w-4 h-4 mr-2" /> New Entry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6" data-testid="practice-journal-stats-grid">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10" data-testid="practice-journal-streak-card">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-sm">Streak</span>
            </div>
            <p className="text-2xl font-bold">{streak} {streakDayLabel}</p>
            {milestone && (
              <p className={`text-xs mt-1 ${milestone.color} font-medium`} data-testid="practice-journal-streak-milestone-label">
                {milestone.icon} {milestone.label}
              </p>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10" data-testid="practice-journal-total-card">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold" data-testid="practice-journal-total-count">{totalEntries}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10" data-testid="practice-journal-this-week-card">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">This Week</span>
            </div>
            <p className="text-2xl font-bold" data-testid="practice-journal-this-week-count">{thisWeek}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" data-testid="practice-journal-current-moon-phase">
          <Moon className="w-4 h-4" />
          <span>Current Moon: {moonPhase.emoji} {moonPhase.phase} - {moonPhase.energy} energy</span>
        </div>
      </div>
    </header>
  );
};
