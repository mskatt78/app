import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Filter, Clock,
  Mountain, Waves, Flame, Heart, Eye, Moon, Star,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

// Convert a meditation record into a multi-step practice object for GuidedPracticeOverlay
function buildMeditationPractice(meditation) {
  const steps = [];

  // Step 1 — Grounding & Intention
  steps.push(
    `Come into stillness. Find a comfortable position and close your eyes. Take three slow, deep breaths. Set your intention: ${meditation.description || "to journey within."}`
  );

  // Steps 2-N — Visualization body
  const viz = (meditation.visualization || "").trim();
  if (viz) {
    const paragraphs = viz.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 30);
    if (paragraphs.length >= 2) {
      steps.push(...paragraphs);
    } else {
      // Split by sentence boundaries and group into ~3 logical chunks
      const sentences = viz.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20);
      if (sentences.length >= 4) {
        const chunkSize = Math.ceil(sentences.length / 3);
        for (let i = 0; i < sentences.length; i += chunkSize) {
          const chunk = sentences.slice(i, i + chunkSize).join(" ").trim();
          if (chunk.length > 20) steps.push(chunk);
        }
      } else if (viz.length > 30) {
        steps.push(viz);
      }
    }
  }

  // Final step — Integration & Closing
  const benefitsStr = (meditation.benefits || []).join(", ");
  steps.push(
    `Gently return your awareness to the present moment. Feel the ground beneath you. Breathe naturally. Carry these gifts forward: ${benefitsStr || "peace, clarity, and renewal"}. When you are ready, slowly open your eyes.`
  );

  return {
    name: meditation.name,
    duration_minutes: meditation.duration_minutes,
    element: meditation.element,
    category: meditation.category,
    id: meditation.id,
    image_url: meditation.image_url,
    steps,
  };
}

const categories = [
  { value: "all", label: "All Meditations" },
  { value: "relaxation", label: "Relaxation" },
  { value: "grounding", label: "Grounding" },
  { value: "energy", label: "Energy" },
  { value: "nature", label: "Nature" },
  { value: "expansion", label: "Expansion" },
  { value: "healing", label: "Healing" },
  { value: "spiritual", label: "Spiritual" },
  { value: "heart", label: "Heart" },
  { value: "intuition", label: "Intuition" },
];

const categoryIcons = {
  relaxation: Waves,
  grounding: Mountain,
  energy: Flame,
  nature: Mountain,
  expansion: Star,
  healing: Heart,
  spiritual: Sparkles,
  heart: Heart,
  intuition: Eye,
};

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
};

const Meditations = ({ user, api }) => {
  const navigate = useNavigate();
  const [meditations, setMeditations] = useState([]);
  const [filteredMeditations, setFilteredMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [guidedPractice, setGuidedPractice] = useState(null);

  useEffect(() => {
    const fetchMeditations = async () => {
      try {
        const response = await api.get("/meditations");
        setMeditations(response.data);
        setFilteredMeditations(response.data);
      } catch (error) {
        console.error("Failed to fetch meditations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeditations();
  }, [api]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredMeditations(meditations);
    } else {
      setFilteredMeditations(meditations.filter((m) => m.category === selectedCategory));
    }
  }, [selectedCategory, meditations]);

  const handleStartMeditation = (meditation) => {
    const practice = buildMeditationPractice(meditation);
    setGuidedPractice(practice);
  };

  const handleExitPractice = () => {
    const practiceToLog = guidedPractice;
    setGuidedPractice(null);

    if (practiceToLog) {
      api.post("/practice-history", {
        practice_type: "meditation",
        practice_id: practiceToLog.id,
        duration_minutes: practiceToLog.duration_minutes,
        notes: `Completed ${practiceToLog.name}`,
      })
        .then(() => toast.success("Meditation complete. Namaste."))
        .catch(() => {
          // silent — don't block exit
        });
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="meditations-page">
      {/* Full-screen Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.steps}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Inner Journey</p>
              <h1 className="text-xl font-serif">
                Guided <span className="italic text-primary">Meditations</span>
              </h1>
            </div>
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="category-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Moon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif mb-2">
                Journey <span className="italic text-primary">Within</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Guided meditations to explore your inner landscape, heal, and transform.
              </p>
            </motion.div>

            {/* Meditations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMeditations.map((meditation, index) => {
                const colors = elementColors[meditation.element] || elementColors.Spirit;
                const Icon = categoryIcons[meditation.category] || Sparkles;

                return (
                  <motion.div
                    key={meditation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                               ${colors.border} hover:scale-[1.02] transition-all duration-300 group`}
                    onClick={() => handleStartMeditation(meditation)}
                    data-testid={`meditation-card-${meditation.id}`}
                  >
                    {/* Card Image */}
                    {meditation.image_url ? (
                      <div className="relative h-40 overflow-hidden bg-black/45">
                        <img
                          src={meditation.image_url}
                          alt={meditation.name}
                          className="w-full h-full object-contain object-center transition-transform duration-500"
                          loading="lazy"
                          data-testid={`meditation-image-${meditation.id}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 text-lg font-serif text-white drop-shadow-lg">
                          {meditation.name}
                        </span>
                        <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white">
                          <Clock className="w-3 h-3" />
                          {meditation.duration_minutes} min
                        </span>
                      </div>
                    ) : (
                      <div className={`p-4 ${colors.bg} flex items-center justify-between`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meditation.duration_minutes} min
                        </span>
                      </div>
                    )}

                    <div className={`p-4 ${colors.bg}`}>
                      {!meditation.image_url && (
                        <h3 className="text-xl font-serif mb-2">{meditation.name}</h3>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {meditation.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
                        >
                          {meditation.element}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-xs capitalize">
                          {meditation.category}
                        </span>
                      </div>
                      <p
                        className="mt-2 text-[11px] text-cyan-300/90"
                        data-testid={`meditation-integrity-${meditation.id}`}
                      >
                        {meditation.content_integrity?.verified
                          ? `Verified references (${meditation.content_integrity.references_count || 0})`
                          : "Curated content"}
                      </p>
                      {meditation.content_integrity?.last_reviewed_at && (
                        <p className="text-[11px] text-muted-foreground" data-testid={`meditation-reviewed-at-${meditation.id}`}>
                          Last reviewed: {new Date(meditation.content_integrity.last_reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Meditations;
