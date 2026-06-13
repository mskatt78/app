import { ArrowLeft } from "lucide-react";

export const SettingsHeader = ({ navigate }) => (
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          data-testid="back-btn"
          onClick={() => navigate("/dashboard")}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Customize</p>
          <h1 className="text-xl font-serif">Settings <span className="italic text-primary">& Profile</span></h1>
        </div>
      </div>
    </div>
  </header>
);
