import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

const MILESTONES = [
  {
    days: 40,
    title: "Sacred 40",
    color: "text-yellow-300",
    ring: "border-yellow-400/40",
    glow: "from-yellow-500/25",
    blessing: "Forty days of devotion. In every tradition this is the threshold of transformation — the practice now lives in your bones. You are no longer doing the work; the work is doing you.",
  },
  {
    days: 21,
    title: "21-Day Initiation",
    color: "text-amber-300",
    ring: "border-amber-400/40",
    glow: "from-amber-500/25",
    blessing: "Twenty-one days — a full initiation cycle. What began as discipline has become rhythm. Your nervous system now knows the way home. Honor how far you have travelled.",
  },
  {
    days: 7,
    title: "7-Day Guardian",
    color: "text-emerald-300",
    ring: "border-emerald-400/40",
    glow: "from-emerald-500/25",
    blessing: "Seven days of returning to yourself. One full cycle of the week held in presence. The flame you tend is growing steady — keep walking gently.",
  },
];

export const MilestoneBlessing = ({ streak }) => {
  const [milestone, setMilestone] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(streak) || streak < 7) return;
    const due = MILESTONES.find(
      (m) => streak >= m.days && !localStorage.getItem(`journeyMilestoneCelebrated_${m.days}`),
    );
    if (due) setMilestone(due);
  }, [streak]);

  const dismiss = () => {
    if (milestone) localStorage.setItem(`journeyMilestoneCelebrated_${milestone.days}`, "1");
    setMilestone(null);
  };

  return createPortal(
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
          data-testid="milestone-blessing-overlay"
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${milestone.glow} via-transparent to-transparent opacity-60`} />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
            className="relative max-w-lg w-full text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              {[0, 1, 2].map((ringIndex) => (
                <motion.div
                  key={ringIndex}
                  className={`absolute inset-0 rounded-full border ${milestone.ring}`}
                  animate={{ scale: [1, 1.5 + ringIndex * 0.35], opacity: [0.7, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, delay: ringIndex * 0.7, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                <Flame className={`w-14 h-14 ${milestone.color}`} strokeWidth={1.25} />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3"
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> Sacred milestone reached
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-4xl sm:text-5xl font-serif mb-2 ${milestone.color}`}
              data-testid="milestone-blessing-title"
            >
              {milestone.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-lg font-serif italic text-foreground/90 mb-2"
            >
              {streak} days of unbroken practice
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-base text-muted-foreground leading-relaxed mb-8"
              data-testid="milestone-blessing-text"
            >
              {milestone.blessing}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
              <Button size="lg" onClick={dismiss} className="rounded-full px-8" data-testid="milestone-blessing-dismiss">
                Receive the Blessing
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
