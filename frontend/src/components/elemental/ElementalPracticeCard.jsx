import { motion } from "framer-motion";
import { ChevronRight, Clock, Star } from "lucide-react";
import { difficultyColors, elementColors, elementIcons } from "./elementalConfig";

export const ElementalPracticeCard = ({ practice, index, onSelect, formatReviewedDate }) => {
  const Icon = elementIcons[practice.element] || Star;
  const colors = elementColors[practice.element] || elementColors.Spirit;

  return (
    <motion.div
      key={practice.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
      onClick={() => onSelect(practice)}
      data-testid={`practice-${practice.id}`}
    >
      {practice.image_url && (
        <div className="relative h-48 overflow-hidden bg-black/45">
          <img
            src={practice.image_url}
            alt={practice.name}
            className="w-full h-full object-contain object-center transition-transform duration-500"
            data-testid={`elemental-practice-image-${practice.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
              <span className="text-xs font-medium">{practice.element}</span>
            </span>
            {practice.difficulty && (
              <span className={`px-3 py-1 rounded-full ${difficultyColors[practice.difficulty]}`}>
                <span className="text-xs font-medium">{practice.difficulty}</span>
              </span>
            )}
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
            <p className="text-xs text-muted-foreground capitalize">{practice.category}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{practice.description}</p>
        {practice.linked_practices?.length > 0 && (
          <p className="text-[11px] text-cyan-300/90 mb-2" data-testid={`elemental-linked-practices-${practice.id}`}>
            Linked pathways: {practice.linked_practices.length}
          </p>
        )}
        {practice.content_integrity?.verified && (
          <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`elemental-integrity-${practice.id}`}>
            Verified references ({practice.content_integrity.references_count || 0})
          </p>
        )}
        {formatReviewedDate(practice.content_integrity?.last_reviewed_at) && (
          <p className="text-[11px] text-muted-foreground mb-2" data-testid={`elemental-reviewed-at-${practice.id}`}>
            Last reviewed: {formatReviewedDate(practice.content_integrity?.last_reviewed_at)}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {practice.duration_minutes || 20} min
          </span>
          <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>
    </motion.div>
  );
};
