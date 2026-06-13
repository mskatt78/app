import { ArrowLeft, MessageCircle } from "lucide-react";

export const ReviewsHeader = ({ navigate }) => (
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Community</p>
          <h1 className="text-xl font-serif">Temple <span className="italic text-primary">Reviews</span></h1>
        </div>
      </div>
      <MessageCircle className="w-6 h-6 text-primary/40" />
    </div>
  </header>
);
