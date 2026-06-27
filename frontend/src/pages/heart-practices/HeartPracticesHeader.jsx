import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export const HeartPracticesHeader = ({ navigate }) => (
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
    <div className="max-w-6xl mx-auto flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div>
        <h1 className="text-2xl font-serif">Heart <span className="italic text-primary">Practices</span></h1>
        <p className="text-sm text-muted-foreground">Open your heart center</p>
        <p className="text-xs text-pink-200/70" data-testid="heart-practices-devotional-note">Practice tenderness with boundaries, and anchor each session into one loving real-world action.</p>
      </div>
    </div>
  </header>
);
