import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { ElementalPracticeCard } from "../components/elemental/ElementalPracticeCard";
import { ElementalPracticeModal } from "../components/elemental/ElementalPracticeModal";
import { elementColors, elementIcons, elementalFilters } from "../components/elemental/elementalConfig";
import { appLogger } from "../utils/logger";

const ElementalPractices = ({ api }) => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPracticing, setIsPracticing] = useState(false);
  const [showGuided, setShowGuided] = useState(false);

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  const fetchPractices = async () => {
    try {
      const url = filter === "all" ? "/elemental-practices" : `/elemental-practices?element=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch elemental practices", error);
      toast.error("Could not load elemental practices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, [filter]);

  useEffect(() => {
    if (!selectedPractice) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPractice(null);
        setIsPracticing(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedPractice]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" data-testid="elemental-practices-loading-state">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-practices">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Elemental <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Deep connection with the five elements</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-wrap gap-2">
          {elementalFilters.map((element) => {
            const Icon = elementIcons[element] || Star;
            const colors = elementColors[element] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={element}
                onClick={() => setFilter(element)}
                data-testid={`filter-${element.toLowerCase()}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  filter === element
                    ? `${colors.bg} ${colors.text} border ${colors.border || "border-white/10"}`
                    : "bg-card/50 text-muted-foreground hover:bg-card"
                }`}
              >
                {element !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{element === "all" ? "All Elements" : element}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((practice, index) => (
            <ElementalPracticeCard
              key={practice.id}
              practice={practice}
              index={index}
              onSelect={setSelectedPractice}
              formatReviewedDate={formatReviewedDate}
            />
          ))}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-12" data-testid="elemental-empty-state">
            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No elemental practices found.</p>
          </div>
        )}
      </main>

      <ElementalPracticeModal
        api={api}
        selectedPractice={selectedPractice}
        setSelectedPractice={setSelectedPractice}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
        showGuided={showGuided}
        setShowGuided={setShowGuided}
        onLogComplete={(practice) => api.post("/practice-history", {
          practice_type: "elemental",
          practice_id: practice.id,
          duration_minutes: practice.duration_minutes || 20,
          element: practice.element,
          notes: `Completed guided ${practice.name}`,
        })}
        onToastComplete={(practice) => toast.success(`${practice.element} practice complete! You are aligned.`)}
        onLogError={(error) => {
          appLogger.warn("Failed to log elemental practice", error);
          toast.success("Elemental practice complete!");
        }}
      />
    </div>
  );
};

export default ElementalPractices;
