import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, Star, Feather, X, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";

const ANGELIC_FALLBACK_DATA = [
  {
    id: "angel-metatron-cube-alchemy",
    name: "Metatron Alchemy · Metatron's Cube",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Metatron's Cube",
    element: "spirit",
    description: "Metatron alchemy uses sacred geometry for energetic clearing and coherent alignment.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/MetatronInIslamicArts.jpg",
    diagram_image_url: "/diagrams/metatron-cube-diagram.svg",
  },
  {
    id: "angel-michael-blue-flame",
    name: "Michael Alchemy · Blue Flame Shield",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Hexagram Shield",
    element: "fire",
    description: "Michael alchemy strengthens boundaries, truth action, and spiritual protection.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/GuidoReni_MichaelDefeatsSatan.jpg",
    diagram_image_url: "/diagrams/michael-shield-diagram.svg",
  },
  {
    id: "angel-raphael-emerald-ray",
    name: "Raphael Alchemy · Emerald Ray",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Vesica Piscis",
    element: "air",
    description: "Raphael alchemy supports restoration, compassion, and body-mind integration.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Saint_Raphael.JPG",
    diagram_image_url: "/diagrams/raphael-healing-diagram.svg",
  },
  {
    id: "angel-gabriel-silver-stream",
    name: "Gabriel Alchemy · Silver Stream",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Moon Mandorla",
    element: "water",
    description: "Gabriel alchemy opens inspired communication and creative receptivity.",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Ghent_Altarpiece_-_Angel_of_the_Annunciation.jpg",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
  },
];

const safeItem = (value) => String(value || "").trim();

const deepArchangelLine = (sectionTitle, baseText, index) => {
  const text = safeItem(baseText);
  if (!text) return "";

  if (sectionTitle.toLowerCase().includes("ritual")) {
    return `Sacred execution ${index + 1}: perform this in silence, breathe slowly, and end by naming one practical act of integrity today.`;
  }
  if (sectionTitle.toLowerCase().includes("journal")) {
    return `Reflection depth ${index + 1}: write for 9 minutes without editing, then choose one concrete relational or spiritual action.`;
  }
  if (sectionTitle.toLowerCase().includes("affirmation")) {
    return `Embodiment loop ${index + 1}: speak on long exhales and anchor with hand on heart until the statement feels somatically true.`;
  }
  return `Archangelic integration ${index + 1}: apply this teaching to one real decision today so insight becomes lived transformation.`;
};

const buildArchangelMasterProtocol = (item) => {
  const teachings = Array.isArray(item?.alchemy_teachings) ? item.alchemy_teachings : [];
  const rituals = Array.isArray(item?.practical_rituals) ? item.practical_rituals : [];
  const prompts = Array.isArray(item?.journal_prompts) ? item.journal_prompts : [];

  return [
    {
      phase_id: "attunement",
      title: "Phase 1 · Attunement",
      duration: "8-10 min",
      steps: [
        `Invocation: ${item?.description || "I open to clear archangelic guidance."}`,
        "Regulate breath (inhale 4 / exhale 6) for 12 rounds.",
        "Name one life area needing divine clarity today.",
      ],
    },
    {
      phase_id: "alignment",
      title: "Phase 2 · Alignment Ritual",
      duration: "15-20 min",
      steps: [
        rituals[0] || "Complete one archangelic ritual in focused silence.",
        rituals[1] || "Pause and track body resonance at midpoint.",
        rituals[2] || "Seal with gratitude and one service intention.",
      ],
    },
    {
      phase_id: "integration",
      title: "Phase 3 · Integration & Service",
      duration: "24h",
      steps: [
        teachings[0] || "Apply one teaching to a real decision today.",
        prompts[0] || "Journal your clearest insight and one commitment.",
        "Complete one compassionate action that proves alignment.",
      ],
    },
  ];
};

const SectionList = ({ title, icon: Icon, items, testId }) => {
  if (!items?.length) return null;

  return (
    <div className="space-y-2" data-testid={testId}>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Icon className="w-4 h-4 text-cyan-300" /> {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={`${testId}-${idx}`} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-300 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </div>
            <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed" data-testid={`${testId}-deep-line-${idx}`}>
              {deepArchangelLine(title, item, idx)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AngelicAlchemy = ({ api }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [angels, setAngels] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/angelic-alchemy");
        const rows = Array.isArray(data) && data.length > 0 ? data : ANGELIC_FALLBACK_DATA;
        setAngels(rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))));
      } catch (error) {
        appLogger.error("Failed loading Angelic Alchemy", error);
        setAngels(ANGELIC_FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api]);

  const selectedProtocol = useMemo(() => buildArchangelMasterProtocol(selected), [selected]);

  return (
    <div className="min-h-screen bg-background" data-testid="angelic-alchemy-page">
      <header className="border-b border-white/10 bg-card/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="angelic-alchemy-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Archangel Section</p>
            <h1 className="text-xl sm:text-2xl font-serif">Angelic <span className="italic text-cyan-300">Alchemy</span></h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/sacred-ally-alchemy")}
            className="text-primary"
            data-testid="angelic-open-sacred-allies-section"
          >
            Open Sacred Allies
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-950/30 via-background to-indigo-950/20 p-5" data-testid="angelic-hero-copy">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dedicated Archangel section with deep ritual pathways, sacred geometry, and master-level transformational integration.
          </p>
        </div>

        {loading ? (
          <div className="h-56 rounded-2xl border border-white/10 bg-card/40 animate-pulse" data-testid="angelic-loading" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="angelic-grid">
            {angels.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="text-left rounded-2xl border border-white/10 bg-card/50 hover:bg-card/70 transition-all overflow-hidden"
                data-testid={`angelic-card-${item.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" data-testid={`angelic-card-image-${item.id}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full border border-white/20 bg-black/40 text-white/85" data-testid={`angelic-card-category-${item.id}`}>
                    {item.angelic_order || "Archangel"}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-serif" data-testid={`angelic-card-title-${item.id}`}>{item.name}</h3>
                  {item.sacred_geometry ? (
                    <span className="px-2 py-1 rounded-full text-[11px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200" data-testid={`angelic-card-geometry-${item.id}`}>
                      {item.sacred_geometry}
                    </span>
                  ) : null}
                  <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`angelic-card-description-${item.id}`}>{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-6 flex items-end sm:items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-background"
              data-testid="angelic-detail-modal"
            >
              <div className="relative aspect-[16/7]">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70"
                  data-testid="angelic-modal-close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-12">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">{selected.angelic_order || "Archangel"}</p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white" data-testid="angelic-modal-title">{selected.name}</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {selected.sacred_geometry ? (
                  <div>
                    <span className="px-2 py-1 rounded-full text-[11px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200" data-testid="angelic-modal-geometry">
                      Sacred Geometry: {selected.sacred_geometry}
                    </span>
                  </div>
                ) : null}

                {(selected.image_url || selected.diagram_image_url) ? (
                  <div className="grid sm:grid-cols-2 gap-3" data-testid="angelic-reference-visuals">
                    {selected.image_url ? (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Reference Image</p>
                        <img src={selected.image_url} alt={`${selected.name} reference`} className="w-full aspect-[4/3] object-cover rounded-lg" />
                      </div>
                    ) : null}
                    {selected.diagram_image_url ? (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Diagram</p>
                        <img src={selected.diagram_image_url} alt={`${selected.name} diagram`} className="w-full aspect-[4/3] object-contain rounded-lg bg-black/20" />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <p className="text-sm text-muted-foreground" data-testid="angelic-modal-description">{selected.description}</p>

                <SectionList title="Alchemy Teachings" icon={Sparkles} items={selected.alchemy_teachings} testId="angelic-alchemy-teachings" />
                <SectionList title="Practical Rituals" icon={Feather} items={selected.practical_rituals} testId="angelic-practical-rituals" />
                <SectionList title="Journal Prompts" icon={Star} items={selected.journal_prompts} testId="angelic-journal-prompts" />
                <SectionList title="Affirmations" icon={Shield} items={selected.affirmations} testId="angelic-affirmations" />

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 space-y-3" data-testid="angelic-master-protocol">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-300" /> Archangelic Master Protocol
                  </h3>
                  {selectedProtocol.map((phase) => (
                    <div key={phase.phase_id} className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`angelic-master-phase-${phase.phase_id}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm text-cyan-100">{phase.title}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200">{phase.duration}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.steps.map((step, idx) => (
                          <li key={`${phase.phase_id}-${idx}`} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-cyan-300">✦</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {selected.source_references?.length > 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="angelic-source-integrity">
                    <p className="text-xs text-muted-foreground mb-2">Source Integrity</p>
                    <ul className="space-y-1">
                      {selected.source_references.slice(0, 4).map((ref) => (
                        <li key={ref}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline break-all" data-testid={`angelic-source-ref-${selected.id}`}>
                            {ref}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Button onClick={() => setSelected(null)} className="w-full" data-testid="angelic-modal-close-bottom">
                  Return to Archangel Library
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AngelicAlchemy;
