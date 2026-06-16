import { ArrowLeft, Eye } from "lucide-react";

export const RuneReadingsHeader = ({ onBack, onOpenLibrary }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5" data-testid="rune-readings-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="rune-readings-back-btn">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Elder Futhark</p>
            <h1 className="text-xl font-serif">Rune <span className="italic text-primary">Readings</span></h1>
          </div>
        </div>
        <button onClick={onOpenLibrary} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center gap-2" data-testid="rune-readings-open-library-btn">
          <Eye className="w-4 h-4" />
          View All Runes
        </button>
      </div>
    </header>
  );
};
