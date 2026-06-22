import { motion } from "framer-motion";
import { ChevronRight, Clock, Feather, Loader2, Lock, Sparkles, Trophy } from "lucide-react";
import { categoryColors, categoryIcons, formatReviewedDate } from "./constants";

const CARD_INITIAL = { opacity: 0, y: 20 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const LOCKED_OVERLAY_INITIAL = { opacity: 0 };
const LOCKED_OVERLAY_ANIMATE = { opacity: 1 };
const UNLOCKED_BADGE_INITIAL = { scale: 0, rotate: -180 };
const UNLOCKED_BADGE_ANIMATE = { scale: 1, rotate: 0 };
const UNLOCKED_BADGE_TRANSITION = { type: "spring", stiffness: 200 };
const LOCK_ICON_INITIAL = { scale: 0 };
const LOCK_ICON_ANIMATE = { scale: 1 };
const LOCK_ICON_TRANSITION = { type: "spring", delay: 0.1 };

export const ShamanicPracticeGrid = ({
  loading,
  practices,
  isLocked,
  navigate,
  setSelectedPractice,
}) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="shamanic-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="shamanic-practice-grid">
        {practices.map((practice, index) => {
          const Icon = categoryIcons[practice.category] || Feather;
          const colors = categoryColors[practice.category] || categoryColors.journey;
          const locked = isLocked(practice);

          return (
            <motion.div
              key={practice.id}
              initial={CARD_INITIAL}
              animate={CARD_ANIMATE}
              transition={{ delay: index * 0.1 }}
              className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} transition-all duration-500 cursor-pointer relative`}
              onClick={() => (locked ? navigate("/achievements") : setSelectedPractice(practice))}
              data-testid={`practice-${practice.id}`}
            >
              {locked && (
                <motion.div
                  initial={LOCKED_OVERLAY_INITIAL}
                  animate={LOCKED_OVERLAY_ANIMATE}
                  className="absolute inset-0 z-10 backdrop-blur-[2px] bg-gradient-to-t from-black/70 via-black/40 to-black/20 flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <motion.div
                      initial={LOCK_ICON_INITIAL}
                      animate={LOCK_ICON_ANIMATE}
                      transition={LOCK_ICON_TRANSITION}
                      className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/40 flex items-center justify-center"
                    >
                      <Lock className="w-6 h-6 text-amber-400" />
                    </motion.div>
                    <p className="text-amber-400 font-medium text-sm mb-1">Sacred Practice</p>
                    <p className="text-xs text-amber-200/60 mb-3">Unlock through achievements</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-amber-400/80">
                      <Trophy className="w-3 h-3" />
                      <span>View progress</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {!locked && practice.requires_unlock && (
                <motion.div
                  initial={UNLOCKED_BADGE_INITIAL}
                  animate={UNLOCKED_BADGE_ANIMATE}
                  transition={UNLOCKED_BADGE_TRANSITION}
                  className="absolute top-3 left-3 z-10 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {practice.image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={practice.image_url}
                    alt={practice.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${locked ? "" : "group-hover:scale-105"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    <span className="text-xs font-medium capitalize">{practice.category?.replace("_", " ")}</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg group-hover:text-primary transition-colors">{practice.name}</h3>
                    <p className="text-xs text-muted-foreground">{practice.tradition}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>

                {practice.linked_practices?.length > 0 && (
                  <p className="text-[11px] text-cyan-300/90 mb-2" data-testid={`shamanic-linked-practices-${practice.id}`}>
                    Linked pathways: {practice.linked_practices.length}
                  </p>
                )}

              {practice.content_integrity?.verified && (
                <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`shamanic-integrity-${practice.id}`}>
                  Verified references ({practice.content_integrity.references_count || 0})
                </p>
              )}

                {formatReviewedDate(practice.content_integrity?.last_reviewed_at) && (
                  <p className="text-[11px] text-muted-foreground mb-2" data-testid={`shamanic-reviewed-at-${practice.id}`}>
                    Last reviewed: {formatReviewedDate(practice.content_integrity?.last_reviewed_at)}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {practice.duration_minutes || 30} min
                  </span>
                  <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {practices.length === 0 && (
        <div className="text-center py-12" data-testid="shamanic-empty-state">
          <Feather className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No shamanic practices found for this category.</p>
        </div>
      )}
    </>
  );
};