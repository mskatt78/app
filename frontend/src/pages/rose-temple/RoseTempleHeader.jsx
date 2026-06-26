import { ArrowLeft, Heart } from "lucide-react";

export const RoseTempleHeader = ({ onBack, unlocked }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-rose-500/10" data-testid="rose-temple-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-serif">Rose Temple</h1>
            <p className="text-sm text-rose-300/80">The Sacred Body Temple</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20" data-testid="rose-temple-header-badge">
          <Heart className="w-4 h-4 text-rose-300" />
          <span className="text-xs text-rose-300">{unlocked ? "Divine Feminine Wisdom" : "Premium Section"}</span>
        </div>
      </div>
    </header>
  );
};
