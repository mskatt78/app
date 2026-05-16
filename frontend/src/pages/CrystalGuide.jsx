import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Filter, Gem
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { CrystalDetailDialog } from "./crystal-guide/CrystalDetailDialog";

const elementColors = {
  Earth: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  Water: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
  Fire: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "shadow-orange-500/20" },
  Air: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/20" },
  Spirit: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/20" },
};

const toSlug = (value) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1562162115-54cc44600875?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85";

const ELEMENT_FALLBACK_IMAGES = {
  Earth: "https://images.unsplash.com/photo-1755375478369-f0d865a7937d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwyfHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85",
  Water: "https://images.unsplash.com/photo-1591150584397-1b94f5b8a174?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85",
  Fire: "https://images.unsplash.com/photo-1679669693237-74d556d6b5ba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwzfHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85",
  Air: "https://images.unsplash.com/photo-1562162115-54cc44600875?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHw0fHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85",
  Spirit: "https://images.unsplash.com/photo-1679669693237-74d556d6b5ba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwzfHxoZWFsaW5nJTIwY3J5c3RhbCUyMHN0b25lcyUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NTcwNDUyOHww&ixlib=rb-4.1.0&q=85",
};

const isLikelyBrokenLegacyImage = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const isUnsplash = parsed.hostname.includes("images.unsplash.com");
    const onlyWidthParam = parsed.searchParams.has("w") && [...parsed.searchParams.keys()].length === 1;
    return isUnsplash && onlyWidthParam;
  } catch {
    return true;
  }
};

const CrystalGuide = ({ user, api }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [crystals, setCrystals] = useState([]);
  const [filteredCrystals, setFilteredCrystals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState("all");
  const [selectedCrystal, setSelectedCrystal] = useState(null);
  const [guidedPractice, setGuidedPractice] = useState(null);
  const [resolvedDeepLink, setResolvedDeepLink] = useState(false);
  const [brokenPrimaryImages, setBrokenPrimaryImages] = useState({});
  const [brokenFallbackImages, setBrokenFallbackImages] = useState({});

  const elements = ["all", "Earth", "Water", "Fire", "Air", "Spirit"];

  const fetchCrystals = useCallback(async () => {
    try {
      const response = await api.get("/crystals/deep");
      setCrystals(response.data);
      setFilteredCrystals(response.data);
    } catch (error) {
      console.error("Failed to fetch crystals:", error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchCrystals(); }, [fetchCrystals]);

  useEffect(() => {
    if (selectedElement === "all") setFilteredCrystals(crystals);
    else setFilteredCrystals(crystals.filter(c => c.element === selectedElement));
  }, [selectedElement, crystals]);

  useEffect(() => {
    if (!crystals.length || resolvedDeepLink) return;

    const params = new URLSearchParams(location.search);
    const highlight = params.get("highlight");

    if (!highlight) {
      setResolvedDeepLink(true);
      return;
    }

    const normalized = toSlug(highlight);
    const found = crystals.find((item) => toSlug(item.name) === normalized);
    if (found) {
      setSelectedCrystal(found);
    }

    setResolvedDeepLink(true);
  }, [crystals, location.search, resolvedDeepLink]);

  const buildCrystalPractice = (crystal) => {
    const steps = [];

    // Use practice_guide if available, otherwise build from meditation_guidance
    if (crystal.practice_guide) {
      // Split practice guide into paragraphs
      const paras = crystal.practice_guide.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 30);
      if (paras.length >= 2) {
        steps.push(...paras);
      } else {
        steps.push(crystal.practice_guide);
      }
    } else if (crystal.meditation_guidance?.steps) {
      steps.push(...crystal.meditation_guidance.steps);
    }

    if (steps.length === 0) {
      steps.push(
        `Find a comfortable position. Hold your ${crystal.name} in both hands or place it on the relevant chakra.`,
        `Take seven slow, deep breaths. With each inhale, visualize the crystal's light filling your body.`,
        `Stay present with the stone for the remainder of the practice, allowing its frequency to work gently.`,
        `To close, thank the crystal for its service. Ground yourself with three deep breaths.`
      );
    }

    return {
      name: `${crystal.name} Crystal Practice`,
      duration_minutes: crystal.meditation_guidance?.duration_minutes || 15,
      element: crystal.element,
      id: crystal.id,
      steps,
    };
  };

  const handleStartPractice = (crystal) => {
    const practice = buildCrystalPractice(crystal);
    setSelectedCrystal(null); // close dialog
    setGuidedPractice(practice);
  };

  const handleExitPractice = () => setGuidedPractice(null);

  const getImageConfig = (crystal) => {
    const id = crystal?.id;
    if (!id) return { src: null, sourceType: null };

    if (crystal.image_url && !brokenPrimaryImages[id] && !isLikelyBrokenLegacyImage(crystal.image_url)) {
      return { src: crystal.image_url, sourceType: "primary" };
    }

    const fallback = ELEMENT_FALLBACK_IMAGES[crystal.element] || DEFAULT_FALLBACK_IMAGE;
    if (fallback && !brokenFallbackImages[id]) {
      return { src: fallback, sourceType: "fallback" };
    }

    return { src: null, sourceType: null };
  };

  const handleImageError = (crystalId, sourceType) => {
    if (!crystalId) return;
    if (sourceType === "primary") {
      setBrokenPrimaryImages((prev) => ({ ...prev, [crystalId]: true }));
      return;
    }
    if (sourceType === "fallback") {
      setBrokenFallbackImages((prev) => ({ ...prev, [crystalId]: true }));
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="crystal-guide">
      {/* Guided Practice Overlay */}
      <AnimatePresence>
        {guidedPractice && (
          <GuidedPracticeOverlay
            practice={guidedPractice}
            stepsOverride={guidedPractice.steps}
            onExit={handleExitPractice}
          />
        )}
      </AnimatePresence>

      {/* Background */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=1200')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button data-testid="back-btn" onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full hover:bg-white/5 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Earth's Treasures</p>
              <h1 className="text-xl font-serif">Crystal <span className="italic text-primary">Wisdom</span></h1>
            </div>
          </div>
          <Select value={selectedElement} onValueChange={setSelectedElement}>
            <SelectTrigger data-testid="element-filter" className="w-40 bg-card border-white/10">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              {elements.map(el => (
                <SelectItem key={el} value={el}>{el === "all" ? "All Elements" : el}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <Gem className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif mb-2">Sacred <span className="italic text-primary">Crystal Library</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {filteredCrystals.length === crystals.length
                  ? `${crystals.length} crystals, each carrying deep wisdom, healing properties, and guided practices for transformation.`
                  : `Showing ${filteredCrystals.length} ${selectedElement} crystals.`}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrystals.map((crystal, index) => {
                const colors = elementColors[crystal.element] || elementColors.Spirit;
                const imageConfig = getImageConfig(crystal);
                return (
                  <motion.div
                    key={crystal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`rounded-2xl border backdrop-blur-xl cursor-pointer overflow-hidden
                               ${colors.bg} ${colors.border} hover:scale-[1.02] transition-all duration-300 hover:shadow-lg ${colors.glow}`}
                    onClick={() => setSelectedCrystal(crystal)}
                    data-testid={`crystal-card-${crystal.id}`}
                  >
                    {imageConfig.src && (
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={imageConfig.src}
                          alt={crystal.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={() => handleImageError(crystal.id, imageConfig.sourceType)}
                          data-testid={`crystal-image-${crystal.id}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text} backdrop-blur-sm`}>
                          {crystal.element}
                        </span>
                      </div>
                    )}
                    <div className="p-5">
                      {!imageConfig.src && (
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-xl ${colors.bg}`}>
                            <Sparkles className={`w-5 h-5 ${colors.text}`} />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>{crystal.element}</span>
                        </div>
                      )}
                      <p className={`text-xs ${colors.text} mb-1`}>{crystal.title}</p>
                      <h3 className="text-lg font-serif mb-2">{crystal.name}</h3>
                      {/* Chakra tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(crystal.chakra ? [crystal.chakra] : []).slice(0, 2).map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{c}</span>
                        ))}
                      </div>
                      {/* Quick properties */}
                      <div className="flex flex-wrap gap-1">
                        {(crystal.healing_properties?.spiritual || []).slice(0, 2).map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-muted-foreground line-clamp-1">
                            {p.length > 40 ? p.slice(0, 40) + "…" : p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <CrystalDetailDialog
        selectedCrystal={selectedCrystal}
        onClose={() => setSelectedCrystal(null)}
        onStartPractice={handleStartPractice}
        getImageConfig={getImageConfig}
        handleImageError={handleImageError}
        elementColors={elementColors}
      />
    </div>
  );
};

export default CrystalGuide;
