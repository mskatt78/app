import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export const RuneSpreadSelector = ({ spreads, onSelectSpread }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="rune-spread-selector">
      {spreads.map((spread) => {
        const Icon = spread.icon;
        return (
          <motion.div
            key={spread.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelectSpread(spread)}
            className="group cursor-pointer p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all"
            data-testid={`spread-${spread.id}`}
          >
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
              <Icon className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-xl font-serif mb-2">{spread.name}</h3>
            <p className="text-muted-foreground mb-4">{spread.description}</p>
            <div className="flex items-center gap-2 text-amber-300 text-sm">
              <span>{spread.runeCount} rune{spread.runeCount > 1 ? "s" : ""}</span>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
