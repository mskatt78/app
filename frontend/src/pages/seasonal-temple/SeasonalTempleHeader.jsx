import { ArrowLeft, Crown, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";

export const SeasonalTempleHeader = ({ hemisphere, onBack, onHemisphereChange, locked = false, onUnlock }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5" data-testid="seasonal-temple-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button data-testid="back-btn" onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Seasons</p>
            <h1 className="text-xl font-serif">Wheel of the <span className="italic text-amber-300">Year</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {locked && (
            <Button
              variant="outline"
              size="sm"
              className="border-amber-500/40 text-amber-200"
              onClick={onUnlock}
              data-testid="seasonal-temple-unlock-button"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Unlock <Crown className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10" data-testid="hemisphere-toggle">
          <button
            onClick={() => onHemisphereChange("south")}
            data-testid="hemi-south"
            className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "south" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            🌿 South
          </button>
          <button
            onClick={() => onHemisphereChange("north")}
            data-testid="hemi-north"
            className={`px-3 py-1 rounded-full text-xs transition-all ${hemisphere === "north" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            ☀️ North
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};
