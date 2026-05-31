import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Heart, HeartHandshake, Sparkles, Users, Flower,
  ChevronRight, Star, Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { appLogger } from "../utils/logger";
import { HeartPracticeModal } from "./heart-practices/HeartPracticeModal";

const HeartPractices = ({ user, api }) => {
  const stableHeartKey = (prefix, value) => {
    const slug = String(value || "item")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return `${prefix}-${slug || "item"}`;
  };

  const navigate = useNavigate();
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isPracticing, setIsPracticing] = useState(false);

  const formatReviewedDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString();
  };

  const categoryIcons = {
    self_love: Heart,
    compassion: HeartHandshake,
    forgiveness: Flower,
    gratitude: Star,
    connection: Users,
    healing: Sparkles
  };

  const categoryColors = {
    self_love: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
    compassion: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    forgiveness: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    gratitude: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    connection: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    healing: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }
  };

  const fetchPractices = useCallback(async () => {
    try {
      const url = filter === "all" ? "/heart-practices" : `/heart-practices?category=${filter}`;
      const response = await api.get(url);
      setPractices(response.data);
    } catch (error) {
      appLogger.error("Failed to fetch heart practices", error);
      toast.error("Could not load heart practices");
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    fetchPractices();
  }, [fetchPractices]);

  useEffect(() => {
    if (!selectedPractice) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPractice(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedPractice]);

  const logPractice = async (practice) => {
    try {
      await api.post("/practice-history", {
        practice_type: "heart_practice",
        practice_id: practice.id,
        duration_minutes: practice.duration_minutes || 20,
        element: "Water"
      });
      toast.success("Heart practice logged!");
    } catch (error) {
      appLogger.error("Failed to log practice", error);
    }
  };

  const categories = ["all", "self_love", "compassion", "forgiveness", "gratitude", "connection", "healing"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="heart-practices">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} data-testid="back-btn">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-serif">Heart <span className="italic text-primary">Practices</span></h1>
            <p className="text-sm text-muted-foreground">Open your heart center</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Heart;
            const colors = categoryColors[cat] || { text: "text-gray-400", bg: "bg-gray-500/10" };
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                data-testid={`filter-${cat}`}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all
                  ${filter === cat 
                    ? `${colors.bg} ${colors.text} border ${colors.border || 'border-white/10'}` 
                    : 'bg-card/50 text-muted-foreground hover:bg-card'}`}
              >
                {cat !== "all" && <Icon className="w-4 h-4" />}
                <span className="text-sm capitalize">{cat.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Practice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {practices.map((practice, index) => {
            const Icon = categoryIcons[practice.category] || Heart;
            const colors = categoryColors[practice.category] || categoryColors.self_love;
            return (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`group rounded-2xl overflow-hidden bg-card/50 border ${colors.border} 
                           hover:border-opacity-50 transition-all duration-500 cursor-pointer`}
                onClick={() => setSelectedPractice(practice)}
                data-testid={`practice-${practice.id}`}
              >
                {practice.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={practice.image_url}
                      alt={practice.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className="text-xs font-medium capitalize">{practice.category?.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg group-hover:text-primary transition-colors">
                        {practice.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{practice.tradition}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {practice.description}
                  </p>
                  <p className="text-[11px] text-cyan-300/90 mb-1" data-testid={`heart-integrity-${practice.id}`}>
                    {practice.content_integrity?.verified
                      ? `Verified references (${practice.content_integrity.references_count || 0})`
                      : "Curated content"}
                  </p>
                  {formatReviewedDate(practice.content_integrity?.last_reviewed_at) && (
                    <p className="text-[11px] text-muted-foreground mb-2" data-testid={`heart-reviewed-at-${practice.id}`}>
                      Last reviewed: {formatReviewedDate(practice.content_integrity?.last_reviewed_at)}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {practice.duration_minutes || 20} min
                    </span>
                    <ChevronRight className={`w-4 h-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {practices.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No heart practices found for this category.</p>
          </div>
        )}
      </main>

      <HeartPracticeModal
        selectedPractice={selectedPractice}
        isPracticing={isPracticing}
        setIsPracticing={setIsPracticing}
        stableHeartKey={stableHeartKey}
        onClose={() => {
          setSelectedPractice(null);
          setIsPracticing(false);
        }}
        api={api}
      />
    </div>
  );
};

export default HeartPractices;
