import { ArrowLeft } from "lucide-react";

export const LightCodesHeader = ({ navigate, currentSymbolsCount, activeCategoryName }) => (
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/menu")}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          data-testid="light-codes-back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Symbols</p>
          <h1 className="text-xl font-serif" data-testid="light-codes-heading">Light Codes & <span className="italic text-primary">Light Linguistics</span></h1>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground" data-testid="light-codes-count-badge">
        <span>{currentSymbolsCount} symbols</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>{activeCategoryName}</span>
      </div>
    </div>
  </header>
);
