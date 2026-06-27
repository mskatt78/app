import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export const ShamanicHeader = ({ navigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4" data-testid="shamanic-header">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-serif">
            Shamanic <span className="italic text-primary">Practices</span>
          </h1>
          <p className="text-sm text-muted-foreground">Deep journeys and ceremonial work</p>
          <p className="text-xs text-amber-200/70" data-testid="shamanic-devotional-note">Enter every journey with reverence, safety pacing, and grounded reintegration before returning to daily life.</p>
        </div>
      </div>
    </header>
  );
};