import { motion } from "framer-motion";
import { Eye, Lock, Sparkles } from "lucide-react";
import { getEncodedFrequencyImage } from "../../utils/lightCodeVisualTheme";

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
          className={`group text-left rounded-[1.75rem] overflow-hidden border ${activeCategoryInfo?.border} ${activeCategoryInfo?.bg} hover:-translate-y-1 transition-all duration-300 shadow-[0_0_30px_rgba(234,194,99,0.1)]`}
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
              <div
                className="absolute inset-0 mix-blend-screen"
                style={{
                  backgroundImage: `url(${getEncodedFrequencyImage(`${symbol.id}-overlay`)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.22,
                }}
                data-testid={`light-code-image-overlay-${symbol.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <p className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full border border-yellow-300/30 bg-black/45 text-yellow-100/90" data-testid={`light-code-image-encoded-badge-${symbol.id}`}>
                Encoded Frequency
              </p>
              <div className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10">
                <span className="text-xl">{symbol.symbol || "✨"}</span>
              </div>
            </div>
          ) : (
            <div className={`aspect-[4/3] flex items-center justify-center ${activeCategoryInfo?.bg}`}>
              <img
                src={getEncodedFrequencyImage(symbol.id || symbol.name)}
                alt={symbol.name}
                className="w-full h-full object-cover"
                data-testid={`light-code-fallback-image-${symbol.id}`}
              />
            </div>
          )}

          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h3 className="text-xl font-serif group-hover:text-primary transition-colors" data-testid={`light-code-name-${symbol.id}`}>
                  {symbol.name}
                </h3>
                <div className={`flex items-center gap-1 text-sm ${activeCategoryInfo?.color}`} data-testid={`light-code-open-state-${symbol.id}`}>
                  {symbol.is_premium ? <Lock className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{symbol.is_premium ? "Premium" : "Open"}</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-3" data-testid={`light-code-description-${symbol.id}`}>
                {symbol.description || symbol.meaning}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.18em] ${symbol.is_premium ? "bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-400/40" : "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40"}`}
                data-testid={`light-code-tier-badge-${symbol.id}`}
              >
                {symbol.is_premium ? "Premium" : "Free"}
              </span>
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
