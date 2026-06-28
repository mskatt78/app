import { Sparkles } from "lucide-react";

export const LightCodesSymbolRitualSection = ({ currentSymbols, activeCategoryInfo, openSymbol }) => {
  const symbolRows = currentSymbols.slice(0, 6);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6" data-testid="light-codes-symbol-ritual-section">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-white/40">Light-coded symbols</p>
          <h3 className="text-2xl font-serif">Ceremonial Symbol Keys · {activeCategoryInfo?.name}</h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {symbolRows.map((symbol) => (
          <button
            key={`${symbol.id}-symbol-key`}
            type="button"
            onClick={() => openSymbol(symbol)}
            className="text-left rounded-2xl border border-white/10 bg-black/25 p-4 hover:bg-black/35 transition-colors"
            data-testid={`light-code-symbol-key-${symbol.id}`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-2xl" data-testid={`light-code-symbol-key-glyph-${symbol.id}`}>
                {symbol.symbol || "✧"}
              </span>
              <span className={`text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-full ${symbol.is_premium ? "bg-fuchsia-500/20 text-fuchsia-100" : "bg-emerald-500/20 text-emerald-100"}`}>
                {symbol.is_premium ? "Premium" : "Free"}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-1">{symbol.name}</p>
            <p className="text-xs text-white/60 mt-1 line-clamp-2" data-testid={`light-code-symbol-key-ritual-${symbol.id}`}>
              {(symbol.embodiment_ritual && symbol.embodiment_ritual[0]) || (symbol.ceremony && symbol.ceremony[0]) || "Open with breath, trace the symbol, and integrate with grounded action."}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
