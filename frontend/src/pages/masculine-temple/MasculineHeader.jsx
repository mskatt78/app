import { ArrowLeft, Shield } from "lucide-react";
import { pageEyebrow, pageTitle } from "./constants";

export const MasculineHeader = ({ navigate }) => {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5" data-testid="masculine-header">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-amber-300/60 uppercase tracking-widest">{pageEyebrow}</p>
            <h1 className="text-xl font-serif">
              {pageTitle.split(" ")[0]} <span className="italic text-amber-300">{pageTitle.split(" ")[1]}</span>
            </h1>
          </div>
        </div>
        <Shield className="w-6 h-6 text-amber-300/30" />
      </div>
    </header>
  );
};