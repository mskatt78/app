import { motion } from "framer-motion";
import { Heart, Music, Volume2 } from "lucide-react";

export const MantrasLibraryGrid = ({
  filteredMantras,
  favorites,
  elementColors,
  ensureElementNaturalDefault,
  setSelectedMantra,
  toggleFavorite,
  formatReviewedDate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="mantras-library-grid">
      {filteredMantras.map((mantra, index) => {
        const colors = elementColors[mantra.element] || elementColors.Spirit;
        const isFavorite = favorites.has(mantra.id);
        const hasAudio = !!mantra.audio_url;

        return (
          <motion.div
            key={mantra.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-6 rounded-2xl border backdrop-blur-xl cursor-pointer relative group
                      ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300`}
            onClick={() => {
              ensureElementNaturalDefault(mantra);
              setSelectedMantra(mantra);
            }}
            data-testid={`mantra-card-${mantra.id}`}
          >
            {hasAudio && (
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs">
                  <Volume2 className="w-3 h-3" />
                  Audio
                </span>
              </div>
            )}

            <button
              onClick={(e) => toggleFavorite(mantra.id, e)}
              className={`absolute top-4 right-4 p-2 rounded-full transition-all
                        ${isFavorite ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground opacity-0 group-hover:opacity-100"}`}
              data-testid={`mantra-favorite-${mantra.id}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>

            <div className="flex items-start justify-between mb-4 pr-10 pt-6">
              <div className={`p-3 rounded-xl ${colors.bg}`}>
                <Music className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                  {mantra.element}
                </span>
                {mantra.chakra && (
                  <p className="text-xs text-muted-foreground mt-1">{mantra.chakra} Chakra</p>
                )}
              </div>
            </div>

            <h3 className="text-xl font-serif mb-2">{mantra.name}</h3>
            {mantra.sanskrit && (
              <p className="text-2xl text-primary/80 mb-3 font-serif">{mantra.sanskrit}</p>
            )}
            <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">&ldquo;{mantra.translation}&rdquo;</p>

            {mantra.content_integrity?.verified && (
              <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`mantra-integrity-${mantra.id}`}>
                Verified references ({mantra.content_integrity.references_count || 0})
              </p>
            )}
            {formatReviewedDate(mantra.content_integrity?.last_reviewed_at) && (
              <p className="text-[11px] text-muted-foreground mb-2" data-testid={`mantra-reviewed-at-${mantra.id}`}>
                Last reviewed: {formatReviewedDate(mantra.content_integrity?.last_reviewed_at)}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{mantra.duration_seconds}s per rep</span>
              <span>{mantra.repetitions} repetitions</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
