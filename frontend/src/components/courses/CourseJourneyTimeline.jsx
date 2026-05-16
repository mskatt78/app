import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Lock } from "lucide-react";
import { getLocalItem, setLocalItem } from "../../utils/clientStorage";

const parseRange = (daysLabel) => {
  if (!daysLabel) return null;
  const normalized = String(daysLabel).replace(/–/g, "-");
  const match = normalized.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]) };
};

const buildPhaseMap = (phases = []) => {
  const map = new Map();
  phases.forEach((phase, idx) => {
    const range = parseRange(phase?.days);
    if (!range) return;
    for (let day = range.start; day <= range.end; day += 1) {
      map.set(day, {
        title: phase.title || `Phase ${idx + 1}`,
        days: phase.days,
      });
    }
  });
  return map;
};

const progressKey = (courseId) => `course_day_timeline_progress_${courseId}`;

// Helper to load progress from localStorage
const loadProgress = (courseId) => {
  if (!courseId) return { completed: {}, notes: {} };
  const stored = getLocalItem(progressKey(courseId));
  if (!stored) return { completed: {}, notes: {} };
  try {
    const parsed = JSON.parse(stored);
    return {
      completed: parsed?.completed || {},
      notes: parsed?.notes || {},
    };
  } catch {
    return { completed: {}, notes: {} };
  }
};

// Helper to save progress to localStorage
const saveProgress = (courseId, progress) => {
  if (!courseId) return;
  setLocalItem(progressKey(courseId), JSON.stringify(progress));
};

export const CourseJourneyTimeline = ({ selectedCourse, hasAccess }) => {
  const courseId = selectedCourse?.id;
  const phases = selectedCourse?.forty_day_integration?.phases || [];
  const phaseMap = useMemo(() => buildPhaseMap(phases), [phases]);

  const firstPhaseEnd = useMemo(() => {
    const firstRange = parseRange(phases?.[0]?.days);
    return firstRange?.end || 7;
  }, [phases]);

  // Initialize state - will be updated by useEffect when courseId is available
  const [progress, setProgress] = useState({ completed: {}, notes: {} });

  // Load progress from localStorage when courseId changes
  useEffect(() => {
    if (courseId) {
      setProgress(loadProgress(courseId));
    }
  }, [courseId]);

  const completedCount = Object.values(progress.completed || {}).filter(Boolean).length;

  const toggleDay = useCallback((day, checked) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        completed: { ...prev.completed, [day]: checked },
      };
      saveProgress(courseId, newProgress);
      return newProgress;
    });
  }, [courseId]);

  const updateNote = useCallback((day, value) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        notes: { ...prev.notes, [day]: value },
      };
      saveProgress(courseId, newProgress);
      return newProgress;
    });
  }, [courseId]);

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4" data-testid="journey-day-timeline-card">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-emerald-200 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Day-by-Day Timeline (1–40)
        </p>
        <span className="text-xs text-muted-foreground" data-testid="journey-day-timeline-progress-count">
          {completedCount}/40 complete
        </span>
      </div>

      <div className="h-2 rounded-full bg-black/30 overflow-hidden mb-4" data-testid="journey-day-timeline-progress-bar">
        <div
          className="h-full bg-emerald-400 transition-all duration-300"
          style={{ width: `${(completedCount / 40) * 100}%` }}
        />
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1" data-testid="journey-day-timeline-list">
        {Array.from({ length: 40 }, (_, i) => i + 1).map((day) => {
          const dayPhase = phaseMap.get(day);
          const locked = !hasAccess && day > firstPhaseEnd;
          return (
            <div key={`timeline-day-${day}`} className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`journey-day-row-${day}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(progress.completed?.[day])}
                    disabled={locked}
                    onChange={(e) => toggleDay(day, e.target.checked)}
                    data-testid={`journey-day-checkbox-${day}`}
                  />
                  <span className="text-sm text-foreground">Day {day}</span>
                </label>
                <div className="flex items-center gap-2">
                  {dayPhase?.days && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      {dayPhase.days}
                    </span>
                  )}
                  {locked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  {!locked && progress.completed?.[day] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>

              {dayPhase?.title && (
                <p className="text-[11px] text-muted-foreground mb-2">{dayPhase.title}</p>
              )}

              <textarea
                value={progress.notes?.[day] || ""}
                onChange={(e) => updateNote(day, e.target.value)}
                disabled={locked}
                rows={2}
                placeholder={locked ? "Unlock full course to journal this day" : "Journal note for this day..."}
                className="w-full text-xs rounded-md bg-black/30 border border-white/10 px-2 py-1.5 text-foreground disabled:opacity-50"
                data-testid={`journey-day-note-${day}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
