import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, Share2, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { JOURNEY_MILESTONES, shareJourneyPostcard } from "../../utils/journeyPostcard";

const MILESTONES = [
  {
    ...JOURNEY_MILESTONES[2],
    color: "text-yellow-300",
    ring: "border-yellow-400/40",
    glow: "from-yellow-500/25",
  },
  {
    ...JOURNEY_MILESTONES[1],
    color: "text-amber-300",
    ring: "border-amber-400/40",
    glow: "from-amber-500/25",
  },
  {
    ...JOURNEY_MILESTONES[0],
    color: "text-emerald-300",
    ring: "border-emerald-400/40",
    glow: "from-emerald-500/25",
  },
];

export const MilestoneBlessing = ({ streak }) => {
  const [milestone, setMilestone] = useState(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!milestone) return;
    setSharing(true);
    try {
      await shareJourneyPostcard(milestone, streak);
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast.error("Could not create the postcard");
      }
    } finally {
      setSharing(false);
    }
  };

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

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={dismiss} className="rounded-full px-8" data-testid="milestone-blessing-dismiss">
                Receive the Blessing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                disabled={sharing}
                className="rounded-full px-8 border-white/20"
                data-testid="milestone-blessing-share"
              >
                {sharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                Share Postcard
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
