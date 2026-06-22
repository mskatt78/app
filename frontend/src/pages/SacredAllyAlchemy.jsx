import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, Flame, Waves, Wind, Shield, X, Feather, Star, ChevronRight, Loader2, PlayCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";
import GuidedAudioButton from "../components/GuidedAudioButton";

const ALLY_FALLBACK_DATA = [
  {
    id: "ally-dragon-sovereign-flame",
    name: "Dragon Alchemy · Sovereign Flame",
    category: "dragon",
    ally_type: "dragon",
    element: "fire",
    description: "Dragon medicine awakens sovereign leadership, sacred courage, and transmutation through conscious fire.",
    image_url: "https://images.pexels.com/photos/3608541/pexels-photo-3608541.jpeg",
    diagram_image_url: "/diagrams/dragon-alchemy-diagram.svg",
  },
  {
    id: "ally-fairy-aether-bloom",
    name: "Fairy Alchemy · Aether Bloom",
    category: "fairies",
    ally_type: "fairy",
    element: "air",
    description: "Fairy alchemy restores wonder, subtle listening, and relational harmony with land intelligence.",
    image_url: "https://images.pexels.com/photos/1028225/pexels-photo-1028225.jpeg",
    diagram_image_url: "/diagrams/fairy-alchemy-diagram.svg",
  },
  {
    id: "ally-wolf-lunar-path",
    name: "Wolf Alchemy · Lunar Path",
    category: "wolves",
    ally_type: "wolf",
    element: "moon",
    description: "Wolf alchemy refines instinct, discernment, and sacred pack dynamics.",
    image_url: "https://images.pexels.com/photos/346941/pexels-photo-346941.jpeg",
    diagram_image_url: "/diagrams/wolf-alchemy-diagram.svg",
  },
  {
    id: "ally-whale-oceanic-hymn",
    name: "Whale Alchemy · Oceanic Hymn",
    category: "whales",
    ally_type: "whale",
    element: "water",
    description: "Whale alchemy carries ancestral memory and deep coherence through sacred song lines.",
    image_url: "https://images.pexels.com/photos/2422915/pexels-photo-2422915.jpeg",
    diagram_image_url: "/diagrams/whale-songline-diagram.svg",
  },
  {
    id: "ally-dolphin-joy-current",
    name: "Dolphin Alchemy · Joy Current",
    category: "dolphins",
    ally_type: "dolphin",
    element: "water",
    description: "Dolphin alchemy harmonizes joy, play, communication, and social healing.",
    image_url: "https://images.pexels.com/photos/2258696/pexels-photo-2258696.jpeg",
    diagram_image_url: "/diagrams/dolphin-alchemy-diagram.svg",
  },
  {
    id: "ally-jaguar-shadow-gold",
    name: "Jaguar Alchemy · Shadow Gold",
    category: "sacred_allies",
    ally_type: "jaguar",
    element: "earth",
    description: "Jaguar alchemy guides fearless shadow integration and energetic boundary mastery.",
    image_url: "https://images.pexels.com/photos/792381/pexels-photo-792381.jpeg",
    diagram_image_url: "/diagrams/jaguar-alchemy-diagram.svg",
  },
  {
    id: "ally-raven-oracle-veil",
    name: "Raven Alchemy · Oracle Veil",
    category: "sacred_allies",
    ally_type: "raven",
    element: "air",
    description: "Raven alchemy activates pattern recognition and threshold wisdom.",
    image_url: "https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg",
    diagram_image_url: "/diagrams/raven-alchemy-diagram.svg",
  },
];

const ANGELIC_FALLBACK_DATA = [
  {
    id: "angel-metatron-cube-alchemy",
    name: "Metatron Alchemy · Metatron's Cube",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Metatron's Cube",
    element: "spirit",
    description: "Metatron alchemy uses sacred geometry for energetic clearing and coherent alignment.",
    image_url: "https://images.pexels.com/photos/312839/pexels-photo-312839.jpeg",
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
    image_url: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
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
    image_url: "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg",
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
    image_url: "https://images.pexels.com/photos/772826/pexels-photo-772826.jpeg",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
  },
];

const VISUAL_OVERRIDES_BY_ID = {
  "ally-dragon-sovereign-flame": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/b/bf/St_Catherine%2C_St_George_and_the_Dragon_%28M%C3%A4staren_fr%C3%A5n_Kappenberg%29_-_Nationalmuseum_-_18337_%28brightened%29%2C_draken.png",
    diagram_image_url: "/diagrams/dragon-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Dragon"],
  },
  "ally-fairy-aether-bloom": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Falero_Luis_Ricardo_Lily_Fairy_1888.jpg",
    diagram_image_url: "/diagrams/fairy-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Fairy"],
  },
  "ally-wolf-lunar-path": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/68/Eurasian_wolf_2.jpg",
    diagram_image_url: "/diagrams/wolf-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Wolf"],
  },
  "ally-whale-oceanic-hymn": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/6/61/Humpback_Whale_underwater_shot.jpg",
    diagram_image_url: "/diagrams/whale-songline-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Humpback_whale"],
  },
  "ally-dolphin-joy-current": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Tursiops_truncatus_01.jpg",
    diagram_image_url: "/diagrams/dolphin-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Dolphin"],
  },
  "ally-jaguar-shadow-gold": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Standing_jaguar.jpg",
    diagram_image_url: "/diagrams/jaguar-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Jaguar"],
  },
  "ally-raven-oracle-veil": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Corvus_corax.jpg",
    diagram_image_url: "/diagrams/raven-alchemy-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Common_raven"],
  },
  "angel-metatron-cube-alchemy": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/MetatronInIslamicArts.jpg",
    diagram_image_url: "/diagrams/metatron-cube-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Metatron"],
  },
  "angel-michael-blue-flame": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/GuidoReni_MichaelDefeatsSatan.jpg",
    diagram_image_url: "/diagrams/michael-shield-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Michael_(archangel)"],
  },
  "angel-raphael-emerald-ray": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Saint_Raphael.JPG",
    diagram_image_url: "/diagrams/raphael-healing-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Raphael_(archangel)"],
  },
  "angel-gabriel-silver-stream": {
    image_url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Ghent_Altarpiece_-_Angel_of_the_Annunciation.jpg",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
    source_references: ["https://en.wikipedia.org/wiki/Gabriel"],
  },
};

const withVisualOverrides = (items) =>
  (items || []).map((item) => ({
    ...item,
    ...((item && VISUAL_OVERRIDES_BY_ID[item.id]) || {}),
  }));

const TABS = [
  { id: "allies", label: "Sacred Ally Alchemy", icon: Flame },
  { id: "angelic", label: "Angelic Alchemy", icon: Shield },
];

const FILTERS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "dragon", label: "Dragon", icon: Flame },
  { id: "fairies", label: "Fairies", icon: Wind },
  { id: "wolves", label: "Wolves", icon: Feather },
  { id: "whales", label: "Whales", icon: Waves },
  { id: "dolphins", label: "Dolphins", icon: Star },
  { id: "sacred_allies", label: "Other Sacred Allies", icon: Sparkles },
];

const AngelicBadge = ({ value }) => (
  <span className="px-2 py-1 rounded-full text-[11px] border border-cyan-500/30 bg-cyan-500/10 text-cyan-200" data-testid="angelic-geometry-badge">
    {value}
  </span>
);

const SectionList = ({ title, icon: Icon, items, testId }) => (
  <div className="space-y-2" data-testid={testId}>
    <h4 className="text-sm font-medium flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" /> {title}
    </h4>
    <ul className="space-y-2">
      {items?.map((item, idx) => (
        <li key={`${title}-${idx}-${String(item).slice(0, 20)}`} className="flex items-start gap-2 text-sm text-muted-foreground">
          <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default function SacredAllyAlchemy({ api }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("allies");
  const [loading, setLoading] = useState(true);
  const [allyFilter, setAllyFilter] = useState("all");
  const [allies, setAllies] = useState([]);
  const [angelic, setAngelic] = useState([]);
  const [selected, setSelected] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [dailyRecommendation, setDailyRecommendation] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [recommendMood, setRecommendMood] = useState("balanced");
  const [recommendIntention, setRecommendIntention] = useState("clarity");
  const [recommendMoonPhase, setRecommendMoonPhase] = useState("full moon");
  const [showPracticeTools, setShowPracticeTools] = useState(false);
  const [roadmapExpanded, setRoadmapExpanded] = useState(false);

  const ROADMAP_PHASES = [
    {
      id: "p0",
      title: "P0 — Live Now",
      bullets: [
        "Sacred Ally + Angelic Alchemy full-depth entries",
        "Whale Song Lines module",
        "Admin editable collections",
      ],
    },
    {
      id: "p1",
      title: "P1 — Engagement Upgrade",
      bullets: [
        "Guided ally audio journeys",
        "21-day pathways",
        "Personalized daily ally recommendation",
      ],
    },
    {
      id: "p2",
      title: "P2 — Premium Expansion",
      bullets: [
        "Compare two ally pathways",
        "Facilitator session mode",
        "Paid advanced ceremony packs",
      ],
    },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [alliesRes, angelicRes] = await Promise.all([
          api.get("/sacred-ally-alchemy"),
          api.get("/angelic-alchemy"),
        ]);
        const [journeyRes, pathwayRes] = await Promise.all([
          api.get("/sacred-ally-audio-journeys"),
          api.get("/sacred-ally-pathways"),
        ]);
        const allyData = Array.isArray(alliesRes.data) && alliesRes.data.length > 0 ? alliesRes.data : ALLY_FALLBACK_DATA;
        const angelicData = Array.isArray(angelicRes.data) && angelicRes.data.length > 0 ? angelicRes.data : ANGELIC_FALLBACK_DATA;
        setAllies(withVisualOverrides(allyData));
        setAngelic(withVisualOverrides(angelicData));
        setJourneys(Array.isArray(journeyRes.data) ? journeyRes.data : []);
        setPathways(Array.isArray(pathwayRes.data) ? pathwayRes.data : []);
      } catch (error) {
        appLogger.error("Failed loading Sacred Ally Alchemy", error);
        setAllies(withVisualOverrides(ALLY_FALLBACK_DATA));
        setAngelic(withVisualOverrides(ANGELIC_FALLBACK_DATA));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  const filteredAllies = useMemo(() => {
    if (allyFilter === "all") return allies;
    return allies.filter((item) => String(item.category || "").toLowerCase() === allyFilter);
  }, [allies, allyFilter]);

  const cards = tab === "allies" ? filteredAllies : angelic;

  const requestDailyRecommendation = async () => {
    setDailyLoading(true);
    try {
      const recentIds = [selected?.id, dailyRecommendation?.recommended_ally?.id]
        .filter(Boolean);

      const response = await api.post("/sacred-ally/daily-recommendation", {
        mood: recommendMood,
        moon_phase: recommendMoonPhase,
        intention: recommendIntention,
        recent_ids: recentIds,
      });
      setDailyRecommendation(response.data || null);
    } catch (error) {
      appLogger.error("Daily ally recommendation failed", error);
    } finally {
      setDailyLoading(false);
    }
  };

  const selectedJourney = useMemo(
    () => journeys.find((entry) => entry.ally_id === selected?.id),
    [journeys, selected?.id]
  );

  const selectedPathway = useMemo(
    () => pathways.find((entry) => entry.ally_id === selected?.id),
    [pathways, selected?.id]
  );

  return (
    <div className="min-h-screen bg-background" data-testid="sacred-ally-alchemy-page">
      <header className="border-b border-white/10 bg-card/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/menu")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="sacred-ally-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Sacred Temple</p>
            <h1 className="text-xl sm:text-2xl font-serif">Sacred Ally & Angelic <span className="italic text-primary">Alchemy</span></h1>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 via-background to-amber-900/20 p-5" data-testid="sacred-ally-hero-copy">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Work deeply with Dragon Alchemy, Fairies, Wolves, Whales with Song Lines, Dolphins, and expanded Sacred Allies — plus Angelic Alchemy including Metatron’s Cube and practical ritual pathways.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="sacred-ally-tabs">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                data-testid={`sacred-ally-tab-${item.id}`}
                className={`px-4 py-2 rounded-full text-sm border transition-all flex items-center gap-2 ${
                  active
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {tab === "allies" && (
          <div className="flex flex-wrap gap-2" data-testid="sacred-ally-filters">
            {FILTERS.map((item) => {
              const Icon = item.icon;
              const active = allyFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAllyFilter(item.id)}
                  data-testid={`sacred-ally-filter-${item.id}`}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-amber-500/15 border-amber-500/35 text-amber-200"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {item.label}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="h-56 rounded-2xl border border-white/10 bg-card/40 animate-pulse" data-testid="sacred-ally-loading" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="sacred-ally-grid">
            {cards.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="text-left rounded-2xl border border-white/10 bg-card/50 hover:bg-card/70 transition-all overflow-hidden"
                data-testid={`sacred-ally-card-${item.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <p className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full border border-white/20 bg-black/40 text-white/85" data-testid={`sacred-ally-card-category-${item.id}`}>
                    {item.category || item.ally_type || item.angelic_order}
                  </p>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-serif" data-testid={`sacred-ally-card-title-${item.id}`}>{item.name}</h3>
                  {item.sacred_geometry && <AngelicBadge value={item.sacred_geometry} />}
                  <p className="text-xs text-muted-foreground line-clamp-3" data-testid={`sacred-ally-card-description-${item.id}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-card/40 p-4" data-testid="sacred-ally-tools-toggle-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Personalized Practice Tools</p>
              <p className="text-xs text-muted-foreground">Optional: recommendations, roadmap, and planning tools</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPracticeTools((prev) => !prev)}
              data-testid="sacred-ally-tools-toggle-button"
            >
              {showPracticeTools ? "Hide Tools" : "Show Tools"}
            </Button>
          </div>
        </div>

        {showPracticeTools && (
          <>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900/20 via-background to-cyan-900/20 p-5" data-testid="sacred-ally-daily-recommendation-card">
              <h2 className="text-base font-serif mb-3">What to Practice Today</h2>
              <div className="grid sm:grid-cols-4 gap-2 mb-3">
                <input
                  value={recommendMood}
                  onChange={(e) => setRecommendMood(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="mood (e.g. anxious)"
                  data-testid="sacred-ally-recommend-mood-input"
                />
                <input
                  value={recommendMoonPhase}
                  onChange={(e) => setRecommendMoonPhase(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="moon phase"
                  data-testid="sacred-ally-recommend-moon-input"
                />
                <input
                  value={recommendIntention}
                  onChange={(e) => setRecommendIntention(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  placeholder="intention"
                  data-testid="sacred-ally-recommend-intention-input"
                />
                <Button
                  onClick={requestDailyRecommendation}
                  disabled={dailyLoading}
                  data-testid="sacred-ally-recommend-button"
                >
                  {dailyLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding...</> : "Recommend"}
                </Button>
              </div>

              {dailyRecommendation?.recommended_ally && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-recommendation-result">
                  <p className="text-xs text-muted-foreground">Recommended Ally</p>
                  <p className="text-sm font-medium text-cyan-200">{dailyRecommendation.recommended_ally.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{dailyRecommendation.recommended_ally.description}</p>
                  {dailyRecommendation.recommended_journey?.title && (
                    <p className="text-xs mt-2 text-amber-200">Journey: {dailyRecommendation.recommended_journey.title}</p>
                  )}
                  {dailyRecommendation.recommended_pathway?.title && (
                    <p className="text-xs text-emerald-200">Pathway: {dailyRecommendation.recommended_pathway.title}</p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/50 p-5" data-testid="sacred-ally-roadmap-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-serif">Potential Improvements Roadmap</h2>
                <button
                  onClick={() => setRoadmapExpanded((v) => !v)}
                  className="text-xs text-primary hover:text-primary/80"
                  data-testid="sacred-ally-roadmap-toggle"
                >
                  {roadmapExpanded ? "Collapse" : "Expand"}
                </button>
              </div>
              {roadmapExpanded && (
                <div className="grid md:grid-cols-3 gap-3 mt-3" data-testid="sacred-ally-roadmap-phases">
                  {ROADMAP_PHASES.map((phase) => (
                    <div key={phase.id} className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid={`sacred-ally-roadmap-${phase.id}`}>
                      <p className="text-sm text-primary mb-2">{phase.title}</p>
                      <ul className="space-y-1">
                        {phase.bullets.map((bullet) => (
                          <li key={bullet} className="text-xs text-muted-foreground">• {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
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
              data-testid="sacred-ally-detail-modal"
            >
              <div className="relative aspect-[16/7]">
                <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70"
                  data-testid="sacred-ally-modal-close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-4 left-4 right-12">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/90">{selected.category || selected.ally_type || selected.angelic_order}</p>
                  <h2 className="text-2xl sm:text-3xl font-serif text-white" data-testid="sacred-ally-modal-title">{selected.name}</h2>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {selected.sacred_geometry && (
                  <div data-testid="sacred-ally-modal-geometry-wrap">
                    <AngelicBadge value={`Sacred Geometry: ${selected.sacred_geometry}`} />
                  </div>
                )}

                {(selected.image_url || selected.diagram_image_url) && (
                  <div className="grid sm:grid-cols-2 gap-3" data-testid="sacred-ally-reference-visuals">
                    {selected.image_url && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Reference Image</p>
                        <img src={selected.image_url} alt={`${selected.name} reference`} className="w-full aspect-[4/3] object-cover rounded-lg" />
                      </div>
                    )}
                    {selected.diagram_image_url && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                        <p className="text-[11px] text-muted-foreground mb-2">Diagram</p>
                        <img src={selected.diagram_image_url} alt={`${selected.name} diagram`} className="w-full aspect-[4/3] object-contain rounded-lg bg-black/20" />
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground" data-testid="sacred-ally-modal-description">{selected.description}</p>

                <SectionList title="Alchemy Teachings" icon={Sparkles} items={selected.alchemy_teachings} testId="sacred-ally-alchemy-teachings" />

                {selectedJourney && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-guided-journey-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Guided Audio Journey</p>
                    <p className="text-sm text-primary mb-2">{selectedJourney.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">{selectedJourney.duration_minutes} minutes · {selectedJourney.ambient} ambience</p>
                    <GuidedAudioButton
                      api={api}
                      script={selectedJourney.script}
                      label={`Play ${selectedJourney.title}`}
                      practiceName={selectedJourney.title}
                      durationMinutes={selectedJourney.duration_minutes}
                      sourceTexts={selectedJourney.focus_tags || []}
                      steps={selectedJourney.focus_tags || []}
                      className="w-full justify-center"
                    />
                  </div>
                )}

                {selectedPathway && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-pathway-card">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Pathway</p>
                    <p className="text-sm text-emerald-200 mt-1">{selectedPathway.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedPathway.days} days · {selectedPathway.level}</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedPathway.theme}</p>
                    <ul className="mt-2 space-y-1" data-testid="sacred-ally-pathway-modules">
                      {(selectedPathway.modules || []).map((module) => (
                        <li key={module} className="text-xs text-muted-foreground">• {module}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.song_lines?.length > 0 && (
                  <SectionList title="Whale Song Lines" icon={Waves} items={selected.song_lines} testId="sacred-ally-song-lines" />
                )}

                {selected.song_line_practices?.length > 0 && (
                  <SectionList title="Song Line Practices" icon={Waves} items={selected.song_line_practices} testId="sacred-ally-song-line-practices" />
                )}

                <SectionList title={selected.practical_rituals ? "Practical Alchemy Rituals" : "Rituals"} icon={Flame} items={selected.practical_rituals || selected.rituals} testId="sacred-ally-rituals" />
                <SectionList title="Journal Prompts" icon={Feather} items={selected.journal_prompts} testId="sacred-ally-journal-prompts" />
                <SectionList title="Affirmations" icon={Star} items={selected.affirmations} testId="sacred-ally-affirmations" />

                <div className="rounded-xl border border-white/10 bg-white/5 p-3" data-testid="sacred-ally-source-integrity">
                  <p className="text-xs text-muted-foreground mb-2">Source Integrity</p>
                  {selected.content_integrity?.verified && (
                    <p className="text-xs text-cyan-300/90">Verified references ({selected.content_integrity?.references_count || 0})</p>
                  )}
                  {selected.source_references?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {selected.source_references.slice(0, 3).map((ref) => (
                        <li key={ref}>
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-200 underline break-all" data-testid={`sacred-ally-source-ref-${selected.id}`}>
                            {ref}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Button onClick={() => setSelected(null)} className="w-full" data-testid="sacred-ally-modal-close-bottom">
                  Return to Alchemy Library
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
