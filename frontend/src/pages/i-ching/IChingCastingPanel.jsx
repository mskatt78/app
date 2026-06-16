import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { Button } from "../../components/ui/button";
import { COIN_SLOTS } from "./iChingConstants";

export const IChingCastingPanel = ({ casting, result, coinAnimation, onCastCoins }) => {
  return (
    <div className="p-8 rounded-2xl bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent border border-red-500/20" data-testid="i-ching-casting-panel">
      <div className="text-center">
        <h3 className="text-xl font-serif mb-4">Three Coin Method</h3>
        <p className="text-muted-foreground mb-6">Focus on your question, then cast the coins. The hexagram will reveal the answer.</p>

        {casting && (
          <div className="flex justify-center gap-4 mb-6" data-testid="i-ching-casting-coins-animation">
            {COIN_SLOTS.map((slot, index) => (
              <motion.div
                key={`casting-coin-${slot}`}
                animate={{ rotateY: [0, 360, 720, 1080], y: [0, -30, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.2 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl font-bold text-amber-900"
              >
                ☯
              </motion.div>
            ))}
          </div>
        )}

        {coinAnimation.length > 0 && !result && (
          <div className="mb-6" data-testid="i-ching-lines-being-cast">
            <p className="text-sm text-muted-foreground mb-3">Building hexagram...</p>
            <div className="flex flex-col-reverse items-center">
              {coinAnimation.map((animationItem) => (
                <motion.div
                  key={animationItem.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`h-3 my-1 rounded-full ${animationItem.type === "yang" ? "w-24 bg-white" : "w-10 bg-white mx-1 inline-block"}`}
                />
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={onCastCoins}
          disabled={casting}
          size="lg"
          className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
          data-testid="cast-coins-btn"
        >
          <Coins className="w-5 h-5 mr-2" />
          {casting ? "Casting..." : result ? "Cast Again" : "Cast the Coins"}
        </Button>
      </div>
    </div>
  );
};
