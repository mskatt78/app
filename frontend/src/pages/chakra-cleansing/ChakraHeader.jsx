import { ArrowLeft, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";

export const ChakraHeader = ({ navigate, chakraStripItems }) => {
  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-violet-950/30 to-background" data-testid="chakra-page-header">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/menu")} className="mb-4 text-muted-foreground" data-testid="back-btn">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 via-green-500/20 to-violet-500/20">
            <Zap className="w-8 h-8 text-violet-400" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif">Chakra Cleansing</h1>
            <p className="text-muted-foreground mt-1">Self-healing guides for all 13 energy centers</p>
          </div>
        </div>

        <div className="flex gap-1.5 mt-6 justify-center flex-wrap" data-testid="chakra-strip">
          {chakraStripItems.map(([key, config], index) => (
            <div
              key={key}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${config.color} opacity-80 animate-pulse shadow-lg`}
              style={{ animationDelay: `${index * 0.08}s` }}
              title={`${config.sanskrit} - ${config.location}`}
            />
          ))}
        </div>
      </div>
    </header>
  );
};