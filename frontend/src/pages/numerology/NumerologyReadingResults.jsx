import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { getNumerologyElementColors } from "./numerologyConfig";

export const NumerologyReadingResults = ({ reading, resetReading }) => {
  const lifePath = reading?.life_path || {};
  const personalYear = reading?.personal_year || {};
  const expression = reading?.expression || null;
  const soulUrge = reading?.soul_urge || null;
  const lifePathColors = getNumerologyElementColors(lifePath.element);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8" data-testid="numerology-reading-results-view">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-2xl border backdrop-blur-xl ${lifePathColors.bg} ${lifePathColors.border}`}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${lifePathColors.bg}`} data-testid="numerology-life-path-number-badge">
            <span className={`text-4xl font-serif ${lifePathColors.text}`}>{lifePath.number}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Life Path Number</p>
            <h2 className="text-3xl font-serif" data-testid="numerology-life-path-name">{lifePath.name}</h2>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed mb-6">{lifePath.description}</p>

        <div className="flex flex-wrap gap-2 mb-6" data-testid="numerology-life-path-traits">
          {lifePath.traits?.map((trait) => (
            <span key={trait} className="px-3 py-1 rounded-full bg-white/10 text-sm">{trait}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3">
            <Sparkles className={`w-5 h-5 ${lifePathColors.text}`} />
            <div>
              <p className="text-xs text-muted-foreground">Crystal</p>
              <p className="font-medium" data-testid="numerology-life-path-crystal">{lifePath.crystal}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Flame className={`w-5 h-5 ${lifePathColors.text}`} />
            <div>
              <p className="text-xs text-muted-foreground">Element</p>
              <p className="font-medium" data-testid="numerology-life-path-element">{lifePath.element}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-primary">Your Mantra:</strong> &quot;{lifePath.mantra}&quot;
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card/50 border border-white/5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
            <span className="text-2xl font-serif text-orange-400">{personalYear.number}</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Personal Year</p>
            <h3 className="text-xl font-serif" data-testid="numerology-personal-year-theme">{personalYear.theme}</h3>
          </div>
        </div>
        <p className="text-muted-foreground">{personalYear.description}</p>
      </motion.div>

      {(expression || soulUrge) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expression && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-xl font-serif text-cyan-400">{expression.number}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Expression Number</p>
                  <h3 className="text-lg font-serif">Your Talents</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{expression.description}</p>
            </motion.div>
          )}

          {soulUrge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-2xl bg-card/50 border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <span className="text-xl font-serif text-pink-400">{soulUrge.number}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Soul Urge Number</p>
                  <h3 className="text-lg font-serif">Your Desires</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{soulUrge.description}</p>
            </motion.div>
          )}
        </div>
      )}

      <div className="text-center pt-4">
        <Button
          variant="outline"
          onClick={resetReading}
          className="border-white/10"
          data-testid="numerology-calculate-new-reading-button"
        >
          Calculate New Reading
        </Button>
      </div>
    </motion.div>
  );
};
