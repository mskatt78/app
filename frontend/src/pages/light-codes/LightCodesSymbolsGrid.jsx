import { motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";

export const LightCodesSymbolsGrid = ({ loading, currentSymbols, activeCategoryInfo, openSymbol }) => {
  if (loading) {
    return (
      <div className="text-center py-20" data-testid="light-codes-loading">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="light-codes-grid">
      {currentSymbols.map((symbol, index) => (
        <motion.button
          type="button"
          key={symbol.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          onClick={() => openSymbol(symbol)}
          className={`group text-left rounded-[1.75rem] overflow-hidden border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} hover:-translate-y-1 transition-all duration-300`}
          data-testid={`light-code-card-${symbol.id}`}
        >
          {symbol.image_url ? (
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={symbol.image_url}
                alt={symbol.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                data-testid={`light-code-image-${symbol.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10">
                <span className="text-xl">{symbol.symbol || "✨"}</span>
              </div>
            </div>
          ) : (
            <div className={`aspect-[4/3] flex items-center justify-center ${activeCategoryInfo?.bg}`}>
              <span className="text-7xl">{symbol.symbol || "✨"}</span>
            </div>
          )}

          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="text-xl font-serif group-hover:text-primary transition-colors" data-testid={`light-code-name-${symbol.id}`}>
                  {symbol.name}
                </h3>
                <div className={`flex items-center gap-1 text-sm ${activeCategoryInfo?.color}`}>
                  <Eye className="w-4 h-4" />
                  <span>Open</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-3" data-testid={`light-code-description-${symbol.id}`}>
                {symbol.description || symbol.meaning}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {symbol.healing_lens && (
                <span className="px-3 py-1 rounded-full bg-white/8 text-[11px] uppercase tracking-[0.18em] text-white/55" data-testid={`light-code-lens-${symbol.id}`}>
                  {symbol.healing_lens}
                </span>
              )}
              {symbol.lineage && (
                <span className="px-3 py-1 rounded-full bg-white/8 text-[11px] text-white/60" data-testid={`light-code-lineage-${symbol.id}`}>
                  {symbol.lineage.split("·")[0].trim()}
                </span>
              )}
            </div>

            <p className={`text-sm ${activeCategoryInfo?.color}`} data-testid={`light-code-purpose-${symbol.id}`}>
              {symbol.purpose || symbol.meaning}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
