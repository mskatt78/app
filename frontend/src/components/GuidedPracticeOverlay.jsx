import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import PracticeTimer from "./PracticeTimer";

// Parse varied step formats into a clean string array
export function parseStepsFromPractice(input) {
  if (Array.isArray(input)) return input.map(String).filter(s => s.trim().length > 5);
  const text = String(input || "").trim();
  if (!text) return [];

  // Numbered list separated by double newlines: "1. step\n\n2. step"
  const dblNewline = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 8);
  if (dblNewline.length >= 2) {
    return dblNewline.map(p => p.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
  }

  // Numbered single-line: "1. step\n2. step"
  const numbered = text.split(/\n/).map(l => l.replace(/^\d+\.\s*/, "").trim()).filter(l => l.length > 8);
  if (numbered.length >= 2) return numbered;

  // Bullet points
  const bullets = text.split(/\n/).map(l => l.replace(/^[•\-\*]\s*/, "").trim()).filter(l => l.length > 8);
  if (bullets.length >= 2) return bullets;

  return [text];
}

const ELEMENT_BG = {
  fire:   "from-orange-950/90 to-black",
  water:  "from-blue-950/90 to-black",
  earth:  "from-emerald-950/90 to-black",
  air:    "from-sky-950/90 to-black",
  spirit: "from-violet-950/90 to-black",
};

const ELEMENT_AUDIO = {
  fire: "fire", water: "ocean", earth: "nature", air: "wind", spirit: "bowls",
};

/**
 * GuidedPracticeOverlay — Full-screen guided practice player.
 *
 * Props:
 *   practice      object  — { name, duration_minutes, element, steps?, cleansing_guide?, instructions? }
 *   stepsOverride string[]— optional pre-parsed steps (takes priority over practice fields)
 *   onExit        fn      — called when user exits
 */
export default function GuidedPracticeOverlay({ practice, stepsOverride, onExit }) {
  const [isComplete, setIsComplete] = useState(false);

  if (!practice) return null;

  const rawSteps = stepsOverride
    || practice.steps
    || practice.cleansing_guide
    || practice.instructions
    || [];

  const steps = parseStepsFromPractice(rawSteps);
  if (steps.length === 0) return null;

  const element = (practice.element || "Spirit").toLowerCase();
  const durationSecs = (practice.duration_minutes || 20) * 60;
  const secsPerStep = Math.max(30, Math.floor(durationSecs / steps.length));

  const segments = steps.map((step, i) => ({
    name: `Step ${i + 1}`,
    description: step,
    duration_seconds: secsPerStep,
  }));

  const bgGradient = ELEMENT_BG[element] || ELEMENT_BG.spirit;
  const backgroundAudio = ELEMENT_AUDIO[element] || "nature";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[70] bg-gradient-to-b ${bgGradient} flex flex-col overflow-hidden`}
      data-testid="guided-practice-overlay"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Guided Practice</p>
          <h2 className="text-base font-serif truncate">{practice.name}</h2>
        </div>
        <button
          onClick={onExit}
          className="ml-3 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
          data-testid="guided-close-top"
          aria-label="Exit practice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Timer */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-6 text-center py-12"
              data-testid="practice-complete-screen"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
              <div>
                <h3 className="text-2xl font-serif mb-2">Practice Complete</h3>
                <p className="text-sm text-muted-foreground">
                  You completed {segments.length} steps<br />of {practice.name}
                </p>
              </div>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                data-testid="guided-exit-complete"
              >
                Return to Practice
              </button>
            </motion.div>
          ) : (
            <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PracticeTimer
                segments={segments}
                totalDuration={segments.reduce((s, seg) => s + seg.duration_seconds, 0)}
                onComplete={() => setIsComplete(true)}
                backgroundAudio={backgroundAudio}
                practiceType="guided"
                element={practice.element || "Spirit"}
                allowSpeedControl={true}
                autoNarrate={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit button */}
      {!isComplete && (
        <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
          <button
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm text-muted-foreground"
            data-testid="guided-exit-btn"
          >
            <X className="w-4 h-4" /> Exit Practice
          </button>
        </div>
      )}
    </motion.div>
  );
}
