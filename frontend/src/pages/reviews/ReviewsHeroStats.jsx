import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StarRating } from "./StarRating";

export const ReviewsHeroStats = ({ stats }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
    <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
    <h2 className="text-3xl font-serif mb-2">Sacred Community <span className="italic text-primary">Voices</span></h2>
    <p className="text-muted-foreground max-w-xl mx-auto text-sm">
      Hear from seekers who have walked through these sacred temples. Their words carry the medicine of lived experience.
    </p>

    {stats && stats.total > 0 && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 inline-flex flex-col items-center gap-2 px-8 py-5 rounded-2xl bg-amber-500/10 border border-amber-500/20"
        data-testid="stats-block"
      >
        <div className="text-5xl font-bold text-amber-400">{stats.average}</div>
        <StarRating value={Math.round(stats.average)} size="w-5 h-5" readonly />
        <p className="text-sm text-muted-foreground">{stats.total} {stats.total === 1 ? "review" : "reviews"}</p>
      </motion.div>
    )}
  </motion.div>
);
