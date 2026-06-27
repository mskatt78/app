import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Globe } from "lucide-react";
import { toast } from "sonner";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";

// Icon mapping for element ids (React components can't be stored in MongoDB)
import { ELEMENT_ICONS, STATIC_ELEMENTS, stableElementKey } from "./elemental-temples/elementalTempleData";
import { ElementalTempleGridView } from "./elemental-temples/ElementalTempleGridView";
import { ElementalTempleDetailView } from "./elemental-temples/ElementalTempleDetailView";

const ElementalTemples = ({ user, api }) => {
  const navigate = useNavigate();
  const [activeTemple, setActiveTemple] = useState(null);
  const [activeSection, setActiveSection] = useState("why_it_heals");
  const [elements, setElements] = useState(STATIC_ELEMENTS);
  const [guidedPractice, setGuidedPractice] = useState(null);

  const startTempleGuidedPractice = (temple, sectionId = "embodiment") => {
    const section = sectionId === "rituals"
      ? temple.rituals?.[0]?.steps || []
      : sectionId === "ceremonies"
        ? temple.ceremonies?.[0]?.flow || []
        : sectionId === "practices"
          ? temple.practices?.map((practice) => practice.desc).filter(Boolean).slice(0, 8) || []
          : temple.embodiment
            ? [temple.embodiment]
            : [];

    const steps = section.length > 0
      ? section
      : [
          temple.description,
          temple.inner,
          temple.outer,
          `Close by speaking one ${temple.element} affirmation aloud with full breath and presence.`,
        ].filter(Boolean);

    setGuidedPractice({
      id: `temple-guided-${temple.id}-${sectionId}`,
      name: `${temple.name} · Guided ${sectionId.replace("_", " ")}`,
      category: "elemental_temple",
      element: temple.element || "Spirit",
      duration_minutes: 20,
      steps,
    });
  };

  const exitTempleGuidedPractice = () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "elemental_temple",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 20,
      element: completed.element || "Spirit",
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success("Elemental temple guided practice complete."))
      .catch(() => {
        // silent
      });
  };

  // Fetch fresh data from API (enriched content from MongoDB)
  useEffect(() => {
    if (!api) return;
    api.get("/elemental-temples")
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Merge: static data provides new deep fields; API provides updated practices/safety
          const merged = STATIC_ELEMENTS.map(staticEl => {
            const apiEl = res.data.find(el => el.id === staticEl.id);
            return apiEl
              ? {
                  ...staticEl,          // static data (includes why_it_heals, ancient_traditions, icon refs)
                  ...apiEl,             // API data overrides (practices, safety_precautions, etc.)
                  icon: ELEMENT_ICONS[apiEl.icon] || staticEl.icon || ELEMENT_ICONS.mountain,
                  // preserve static-only deep content fields
                  why_it_heals: staticEl.why_it_heals,
                  ancient_traditions: staticEl.ancient_traditions,
                  wisdom: staticEl.wisdom,
                  inner: staticEl.inner,
                  outer: staticEl.outer,
                  nature_connection: staticEl.nature_connection,
                  embodiment: staticEl.embodiment,
                  affirmations: staticEl.affirmations,
                  blessings: staticEl.blessings,
                  ceremonies: staticEl.ceremonies,
                  rituals: staticEl.rituals,
                }
              : staticEl;
          });
          setElements(merged);
        }
      })
      .catch(() => { /* silently use static data */ });
  }, [api]);

  const sections = [
    { id: "why_it_heals", label: "Why It Heals" },
    { id: "ancient_traditions", label: "Ancient Traditions" },
    { id: "embodiment", label: "Embodiment" },
    { id: "inner", label: "Within You" },
    { id: "outer", label: "In Nature" },
    { id: "practices", label: "Practices" },
    { id: "rituals", label: "Rituals" },
    { id: "ceremonies", label: "Ceremonies" },
    { id: "blessings", label: "Blessings" },
    { id: "affirmations", label: "Affirmations" },
    { id: "safety_precautions", label: "Safety" }
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="elemental-temples">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitTempleGuidedPractice}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              data-testid="back-btn"
              onClick={() => activeTemple ? setActiveTemple(null) : navigate(-1)}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Sacred Temples</p>
              <h1 className="text-xl font-serif">
                {activeTemple ? (
                  <><span className="italic" style={{ color: `var(--${activeTemple.color.accent})` }}>{activeTemple.name}</span></>
                ) : (
                  <>Elemental <span className="italic text-primary">Temples</span></>
                )}
              </h1>
            </div>
          </div>
          <Globe className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!activeTemple ? (
            <ElementalTempleGridView
              elements={elements}
              setActiveTemple={setActiveTemple}
              setActiveSection={setActiveSection}
            />
          ) : (
            <ElementalTempleDetailView
              activeTemple={activeTemple}
              sections={sections}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              stableElementKey={stableElementKey}
              onStartGuidedPractice={startTempleGuidedPractice}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ElementalTemples;
