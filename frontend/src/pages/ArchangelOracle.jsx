import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ArchangelBrowseSection } from "../components/oracle/ArchangelBrowseSection";
import { ArchangelReadingSection } from "../components/oracle/ArchangelReadingSection";
import { appLogger } from "../utils/logger";

const ArchangelOracle = ({ user, api }) => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [spreadType, setSpreadType] = useState("single");
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [allArchangels, setAllArchangels] = useState([]);
  const [selectedArchangel, setSelectedArchangel] = useState(null);
  const [showBrowse, setShowBrowse] = useState(false);

  const spreadTypes = useMemo(() => [
    { value: "single", label: "Single Archangel", cards: 1, description: "One archangel brings you a focused message" },
    { value: "three_card", label: "Trinity Guidance", cards: 3, description: "Three archangels reveal past, present, future" },
  ], []);

  const elementColors = useMemo(() => ({
    Fire: "from-orange-500/20 to-red-500/20 border-orange-500/30",
    Water: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    Air: "from-sky-500/20 to-indigo-500/20 border-sky-500/30",
    Earth: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    Spirit: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  }), []);

  const elementTextColors = useMemo(() => ({
    Fire: "text-orange-400",
    Water: "text-blue-400",
    Air: "text-sky-400",
    Earth: "text-emerald-400",
    Spirit: "text-purple-400",
  }), []);

  const fetchArchangels = useCallback(async () => {
    try {
      const response = await api.get("/oracle/archangels");
      setAllArchangels(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch archangels:", error);
    }
  }, [api]);

  const performReading = useCallback(async () => {
    setLoading(true);
    setReading(null);
    setShowCards(false);
    setShowBrowse(false);

    try {
      const endpoint = user ? "/oracle/archangels/reading" : "/oracle/archangels/reading/guest";
      const response = await api.post(endpoint, {
        question: question || null,
        spread_type: spreadType,
      });

      setReading(response.data);
      setTimeout(() => setShowCards(true), 500);
      toast.success("The Archangels have come forward with love");
    } catch (error) {
      appLogger.error("Reading failed:", error);
      toast.error("Please try again, beloved one");
    } finally {
      setLoading(false);
    }
  }, [api, question, spreadType, user]);

  const resetReading = useCallback(() => {
    setReading(null);
    setShowCards(false);
    setQuestion("");
    setSelectedArchangel(null);
  }, []);

  useEffect(() => {
    fetchArchangels();
  }, [fetchArchangels]);

  return (
    <div className="min-h-screen bg-background" data-testid="archangel-oracle">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/menu")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Divine Guidance</p>
              <h1 className="text-xl font-serif">Archangel <span className="italic text-primary">Oracle</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowBrowse(!showBrowse); setSelectedArchangel(null); }}
              className="text-muted-foreground hover:text-primary"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Browse All
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <ArchangelBrowseSection
          showBrowse={showBrowse}
          setShowBrowse={setShowBrowse}
          allArchangels={allArchangels}
          selectedArchangel={selectedArchangel}
          setSelectedArchangel={setSelectedArchangel}
          elementColors={elementColors}
          elementTextColors={elementTextColors}
        />

        {!showBrowse && !selectedArchangel && (
          <ArchangelReadingSection
            reading={reading}
            loading={loading}
            question={question}
            setQuestion={setQuestion}
            spreadType={spreadType}
            setSpreadType={setSpreadType}
            performReading={performReading}
            resetReading={resetReading}
            showCards={showCards}
            setSelectedArchangel={setSelectedArchangel}
            setShowBrowse={setShowBrowse}
            spreadTypes={spreadTypes}
            elementColors={elementColors}
          />
        )}
      </main>
    </div>
  );
};

export default ArchangelOracle;
