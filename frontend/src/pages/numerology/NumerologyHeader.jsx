import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export const NumerologyHeader = ({ reading, resetReading, navigate, showHistory, setShowHistory }) => {
  const handleBackClick = () => {
    if (reading) {
      resetReading();
      return;
    }

    navigate("/dashboard");
  };

  const historyToggleLabel = showHistory ? "New Reading" : "Past Readings";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sacred Numbers</p>
            <h1 className="text-xl font-serif">Numerology <span className="italic text-primary">Reading</span></h1>
          </div>
        </div>

        {!reading && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="border-white/10"
            data-testid="numerology-history-toggle-button"
          >
            {historyToggleLabel}
          </Button>
        )}
      </div>
    </header>
  );
};
