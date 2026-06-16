import { ArrowLeft } from "lucide-react";

export const RitualBuilderHeader = ({ onBack }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5" data-testid="ritual-builder-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors" data-testid="ritual-builder-back-btn">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div data-testid="ritual-builder-header-title-block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Sequence Builder</p>
            <h1 className="text-xl font-serif">Ritual <span className="italic text-primary">Builder</span></h1>
          </div>
        </div>
      </div>
    </header>
  );
};
