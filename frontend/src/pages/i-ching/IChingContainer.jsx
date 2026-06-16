import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { appLogger } from "../../utils/logger";
import { IChingHeader } from "./IChingHeader";
import { IChingCastingPanel } from "./IChingCastingPanel";
import { IChingResultCard } from "./IChingResultCard";
import { IChingHexagramModal } from "./IChingHexagramModal";
import { buildCoinAnimationFrames, sleep } from "./iChingConstants";

const IChing = ({ user, api }) => {
  const navigate = useNavigate();
  const [hexagrams, setHexagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState(false);
  const [result, setResult] = useState(null);
  const [showHexagramList, setShowHexagramList] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState([]);

  const fetchHexagrams = useCallback(async () => {
    try {
      const response = await api.get("/i-ching");
      setHexagrams(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch hexagrams:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchHexagrams();
  }, [fetchHexagrams]);

  const castCoins = async () => {
    setCasting(true);
    setResult(null);
    setCoinAnimation(buildCoinAnimationFrames());
    await sleep(400);

    try {
      const response = await api.get("/i-ching/cast/coins");
      await sleep(500);
      setResult(response.data);
      toast.success(`Hexagram ${response.data.number}: ${response.data.name}`);
    } catch (error) {
      appLogger.error("Failed to cast I Ching:", error);
      toast.error("Could not complete casting");
    } finally {
      setCasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="i-ching">
      <IChingHeader onBack={() => navigate("/menu")} onOpenHexagrams={() => setShowHexagramList(true)} />

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Intro */}
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center">
            <span className="text-3xl">☯</span>
          </div>
          <h2 className="text-3xl font-serif mb-4">The <span className="italic text-primary">Oracle</span> of Change</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The I Ching is one of the oldest divination systems, over 3,000 years old. 
            Using the three-coin method, cast your hexagram and receive ancient wisdom.
          </p>
        </div>

        <IChingCastingPanel casting={casting} result={result} coinAnimation={coinAnimation} onCastCoins={castCoins} />

        <IChingResultCard result={result} />

        {/* How It Works */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="font-serif text-xl mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            How the Three Coin Method Works
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="mb-2"><strong>The Casting:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Three coins are tossed six times</li>
                <li>Each toss creates one line of the hexagram</li>
                <li>Lines are built from bottom to top</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>The Lines:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Solid line (━━━) = Yang energy</li>
                <li>Broken line (━ ━) = Yin energy</li>
                <li>Changing lines show transformation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <IChingHexagramModal
        open={showHexagramList}
        hexagrams={hexagrams}
        onClose={() => setShowHexagramList(false)}
        onSelectHexagram={(hexagram) => {
          setResult(hexagram);
          setShowHexagramList(false);
        }}
      />
    </div>
  );
};

export default IChing;
