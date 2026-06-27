import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, RefreshCw, Sparkles, Target, X } from "lucide-react";
import { Button } from "../../components/ui/button";

const formatShift = (value) => {
  const numeric = Number(value || 0);
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(2)}`;
};

export const PracticeJournalWeeklyReflectionModal = ({
  show,
  onClose,
  onRegenerate,
  reflection,
  loading,
  error,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
        onClick={onClose}
        data-testid="practice-journal-weekly-reflection-overlay"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-2xl border border-emerald-500/20 bg-[#0f1722]"
          onClick={(event) => event.stopPropagation()}
          data-testid="practice-journal-weekly-reflection-modal"
        >
          <div className="sticky top-0 z-10 bg-[#0f1722]/95 backdrop-blur border-b border-white/10 px-5 py-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-300">Weekly Reflection</p>
              <h2 className="text-2xl font-serif" data-testid="practice-journal-weekly-reflection-title">Alchemy Plan Generator</h2>
              {reflection?.period_start && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1" data-testid="practice-journal-weekly-reflection-period">
                  <CalendarDays className="w-4 h-4" />
                  {reflection.period_start} → {reflection.period_end}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => onRegenerate({ force: true })}
                disabled={loading}
                data-testid="practice-journal-weekly-reflection-regenerate-button"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10"
                data-testid="practice-journal-weekly-reflection-close-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {error && (
              <p className="text-sm text-amber-300 border border-amber-500/20 rounded-xl p-3" data-testid="practice-journal-weekly-reflection-error">
                {error}
              </p>
            )}

            {loading && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center" data-testid="practice-journal-weekly-reflection-loading">
                <p className="text-sm text-muted-foreground">Synthesizing your weekly alchemy…</p>
              </div>
            )}

            {!loading && reflection && (
              <>
                <div className="grid sm:grid-cols-3 gap-3" data-testid="practice-journal-weekly-reflection-stats-grid">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-weekly-reflection-entries-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Entries</p>
                    <p className="text-2xl font-bold">{reflection.entries_analyzed || 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-weekly-reflection-minutes-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Minutes</p>
                    <p className="text-2xl font-bold">{reflection.total_minutes || 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-weekly-reflection-mood-shift-card">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Mood Shift</p>
                    <p className="text-2xl font-bold">{formatShift(reflection.average_mood_shift)}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4" data-testid="practice-journal-weekly-reflection-summary-card">
                  <h3 className="text-sm uppercase tracking-wider text-emerald-300 mb-1">Energetic Summary</h3>
                  <p className="text-sm text-emerald-50/90">{reflection.energetic_summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-weekly-reflection-themes-card">
                    <h4 className="text-sm uppercase tracking-wider text-cyan-300 mb-2">Key Themes</h4>
                    <div className="flex flex-wrap gap-2" data-testid="practice-journal-weekly-reflection-themes-list">
                      {(reflection.key_themes || []).map((theme) => (
                        <span
                          key={theme}
                          className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 border border-cyan-500/30"
                          data-testid={`practice-journal-weekly-reflection-theme-${theme.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4" data-testid="practice-journal-weekly-reflection-focus-card">
                    <h4 className="text-sm uppercase tracking-wider text-fuchsia-300 mb-2">Alchemy Focus</h4>
                    <p className="text-sm">{reflection.alchemy_focus}</p>
                    <p className="text-xs text-muted-foreground mt-3">{reflection.integration_vow}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4" data-testid="practice-journal-weekly-reflection-plan-card">
                  <h3 className="text-sm uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1">
                    <Target className="w-4 h-4" /> Weekly Alchemy Plan
                  </h3>
                  <div className="space-y-2" data-testid="practice-journal-weekly-reflection-plan-list">
                    {(reflection.weekly_alchemy_plan || []).map((item, index) => (
                      <div
                        key={`${item.day}-${index}`}
                        className="rounded-lg border border-white/10 bg-white/5 p-3"
                        data-testid={`practice-journal-weekly-reflection-plan-item-${index + 1}`}
                      >
                        <p className="text-sm font-medium flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-300" /> {item.day}: {item.focus}</p>
                        <p className="text-xs text-muted-foreground mt-1">Practice: {item.practice}</p>
                        <p className="text-xs text-emerald-200/80 mt-1">Prompt: {item.journal_prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);