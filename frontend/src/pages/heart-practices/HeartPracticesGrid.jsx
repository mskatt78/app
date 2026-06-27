import { motion } from "framer-motion";
import { ChevronRight, Clock, Heart, Play } from "lucide-react";
import { resolveReviewedDate } from "./heartPracticeConfig";
import { formatDurationMinutesLabel } from "../../utils/durationUtils";

export const HeartPracticesGrid = ({ practices, categoryIcons, categoryColors, setSelectedPractice, onStartGuided }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="heart-practices-grid">
      {practices.map((practice, index) => {
        const Icon = categoryIcons[practice.category] || Heart;
        const colors = categoryColors[practice.category] || categoryColors.self_love;
        const reviewedDate = resolveReviewedDate(practice.content_integrity?.last_reviewed_at);

        return (
          <motion.div
            key={practice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
            onClick={() => setSelectedPractice(practice)}
            data-testid={`practice-${practice.id}`}
          >
            {practice.image_url && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={practice.image_url}
                  alt={practice.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
              {practice.content_integrity?.verified && (
                <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`heart-integrity-${practice.id}`}>
                  Verified references ({practice.content_integrity.references_count || 0})
                </p>
              )}
              {reviewedDate && (
                <p className="text-[11px] text-muted-foreground mb-2" data-testid={`heart-reviewed-at-${practice.id}`}>
                  Last reviewed: {reviewedDate}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDurationMinutesLabel(practice.duration_minutes, 20)}
                </span>
                <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onStartGuided?.(practice);
                }}
                className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs ${colors.bg} ${colors.text} border ${colors.border || "border-white/10"} hover:opacity-90 transition-opacity`}
                data-testid={`heart-card-start-guided-${practice.id}`}
              >
                <Play className="w-3.5 h-3.5" />
                Start Guided Practice
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>

    {practices.length === 0 && (
      <div className="text-center py-12" data-testid="heart-practices-empty-state">
        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No heart practices found for this category.</p>
      </div>
    )}
  </>
);
