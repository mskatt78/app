import { motion } from "framer-motion";
import { Crown, Lock } from "lucide-react";

export const SeasonalTempleCardsSection = ({ sabbats, currentSabbat, hemisphere, onSelectSabbat, isLocked, onUnlock }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16" data-testid="seasonal-temple-cards-section">
      {sabbats.map((sabbat, index) => {
        const Icon = sabbat.icon;
        const isCurrent = sabbat.id === currentSabbat;
        return (
          <motion.div
            key={sabbat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => (isLocked ? onUnlock?.() : onSelectSabbat(sabbat))}
            data-testid={`sabbat-card-${sabbat.id}`}
            className={`cursor-pointer rounded-xl border transition-all hover:scale-[1.02] overflow-hidden ${sabbat.color.bg} ${sabbat.color.border} ${isCurrent ? "ring-1 ring-primary" : ""}`}
          >
            {sabbat.image && (
              <div className="relative h-28 overflow-hidden">
                <img src={sabbat.image} alt={sabbat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/30 to-transparent" />
                {isCurrent && <span className="absolute top-2 right-2 text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
              </div>
            )}
            <div className="p-4">
              <div className={`flex items-center justify-between mb-3 ${sabbat.image ? "hidden" : ""}`}>
                <Icon className={`w-6 h-6 ${sabbat.color.text}`} />
                {isCurrent && !sabbat.image && <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">Now</span>}
              </div>
              <h3 className="font-serif text-base mb-0.5">{sabbat.name}</h3>
              <p className={`text-xs ${sabbat.color.text} mb-2`}>{sabbat.dates[hemisphere]}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{sabbat.theme}</p>
              {isLocked && (
                <div className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-100" data-testid={`sabbat-card-lock-${sabbat.id}`}>
                  <Lock className="w-3 h-3" />
                  Premium <Crown className="w-3 h-3" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
