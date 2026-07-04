import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, Footprints, HeartPulse, Sparkles, TimerReset } from "lucide-react";

const ANATOMICAL_BODYMAP_IMAGE = "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6ed46ee0b34945fb844f1bc345a71268d9f69a8656ab6fced3cc0f4aa540165a.png";

const normalizeElement = (value) => String(value || "Spirit").trim();
const normalizeChakraKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z]+/g, "_");

const BODY_WISDOM_LIBRARY = {
  feet_legs: {
    key: "feet_legs",
    region: "Feet + Legs",
    anatomy: "Foundation chain: feet, calves, hamstrings, hips",
    function: "Stability, locomotion, and force transfer through fascia lines",
    emotion: "Safety, belonging, trust in life support",
    energy: "Root current · grounding and survival coherence",
    spiritual: "Teaches trust, right timing, and your relationship to being supported by life.",
    fascia: "Superficial back line + lateral lines store survival stress and movement confidence.",
    diagram: { front: { x: 50, y: 82 }, zone: { x: 50, y: 82, w: 26, h: 20 } },
    cue: "Slow exhale into your feet and ask: where do I need firmer boundaries or steadier support?",
  },
  pelvis_womb: {
    key: "pelvis_womb",
    region: "Pelvis + Lower Belly",
    anatomy: "Pelvic floor, psoas, iliacus, deep abdominal fascia",
    function: "Core support, breath-pressure regulation, sexual/creative vitality",
    emotion: "Permission, intimacy, creative life-force, stored fear/shame",
    energy: "Sacral current · creativity, intimacy, fluidity",
    spiritual: "Holds consent, creativity, and the sacred yes/no of your embodied truth.",
    fascia: "Deep front line + psoas web often carry fear-freeze patterns and relational guarding.",
    diagram: { front: { x: 50, y: 64 }, zone: { x: 50, y: 64, w: 20, h: 10 } },
    cue: "Soften jaw and lower belly; ask what your body is protecting and what it now feels safe to release.",
  },
  solar_core: {
    key: "solar_core",
    region: "Solar Core",
    anatomy: "Diaphragm, obliques, thoracolumbar fascia, digestive plexus",
    function: "Breath power, trunk rotation, vitality and metabolic rhythm",
    emotion: "Agency, confidence, frustration, unexpressed will",
    energy: "Solar current · personal power and direction",
    spiritual: "Refines will into integrity: power used in service rather than control.",
    fascia: "Diaphragm-thoracolumbar fascia can lock with over-efforting and chronic vigilance.",
    diagram: { front: { x: 50, y: 43 }, zone: { x: 50, y: 43, w: 11, h: 5 } },
    cue: "Breathe into the diaphragm and name one decision your body already knows.",
  },
  heart_chest: {
    key: "heart_chest",
    region: "Heart + Chest",
    anatomy: "Rib fascia, sternum, intercostals, upper thoracic spine",
    function: "Respiration capacity, arm freedom, relational openness",
    emotion: "Grief, tenderness, forgiveness, protection",
    energy: "Heart current · connection, compassion, coherence",
    spiritual: "Opens the path from wound-protection into compassionate discernment.",
    fascia: "Arm lines + chest fascia influence protective postures and relational armoring.",
    diagram: { front: { x: 50, y: 36 }, zone: { x: 50, y: 36, w: 20, h: 10 } },
    cue: "Lengthen exhale through the chest and ask what grief needs witnessing before love can move again.",
  },
  throat_jaw: {
    key: "throat_jaw",
    region: "Throat + Jaw",
    anatomy: "Deep front line through tongue, hyoid, SCM, cervical fascia",
    function: "Voice expression, swallowing, neck regulation",
    emotion: "Truth, suppression, fear of conflict, withheld voice",
    energy: "Throat current · expression, resonance, authenticity",
    spiritual: "Purifies expression so your voice becomes medicine, not performance.",
    fascia: "Tongue-jaw-neck fascia often tighten when truth is withheld or conflict is feared.",
    diagram: { front: { x: 50, y: 30 }, zone: { x: 50, y: 30, w: 12, h: 6 } },
    cue: "Release the jaw and hum softly; ask what truth wants a clean and kind expression.",
  },
  brow_crown: {
    key: "brow_crown",
    region: "Brow + Crown",
    anatomy: "Suboccipitals, scalp fascia, eye-muscle tension patterns",
    function: "Orientation, focus, sensory processing, nervous-system scanning",
    emotion: "Overthinking, vigilance, confusion, insight",
    energy: "Third-eye/crown current · perception and meaning",
    spiritual: "Restores clear seeing, surrender, and alignment with higher discernment.",
    fascia: "Scalp and suboccipital fascial tension mirror cognitive overload and hypervigilance.",
    diagram: { front: { x: 50, y: 11 }, zone: { x: 50, y: 11, w: 12, h: 6 } },
    cue: "Soften the eyes and back of head, then ask what becomes clear when urgency drops.",
  },
};

const REGION_VISUAL_STYLES = {
  feet_legs: {
    chakra: { fill: "bg-red-500/35", border: "border-red-100/90", glow: "shadow-[0_0_0_2px_rgba(239,68,68,0.42)]", chip: "bg-red-500/20 border-red-300/60 text-red-100" },
    fascia: { fill: "bg-red-500/35", border: "border-red-100/90", glow: "shadow-[0_0_0_2px_rgba(239,68,68,0.42)]", chip: "bg-red-500/20 border-red-300/60 text-red-100" },
  },
  pelvis_womb: {
    chakra: { fill: "bg-orange-500/35", border: "border-orange-100/90", glow: "shadow-[0_0_0_2px_rgba(249,115,22,0.42)]", chip: "bg-orange-500/20 border-orange-300/60 text-orange-100" },
    fascia: { fill: "bg-orange-500/35", border: "border-orange-100/90", glow: "shadow-[0_0_0_2px_rgba(249,115,22,0.42)]", chip: "bg-orange-500/20 border-orange-300/60 text-orange-100" },
  },
  solar_core: {
    chakra: { fill: "bg-yellow-300/55", border: "border-yellow-100", glow: "shadow-[0_0_0_2px_rgba(253,224,71,0.45)]", chip: "bg-yellow-500/20 border-yellow-300/60 text-yellow-100" },
    fascia: { fill: "bg-yellow-300/55", border: "border-yellow-100", glow: "shadow-[0_0_0_2px_rgba(253,224,71,0.45)]", chip: "bg-yellow-500/20 border-yellow-300/60 text-yellow-100" },
  },
  heart_chest: {
    chakra: { fill: "bg-green-500/35", border: "border-green-100/90", glow: "shadow-[0_0_0_2px_rgba(34,197,94,0.42)]", chip: "bg-green-500/20 border-green-300/60 text-green-100" },
    fascia: { fill: "bg-green-500/35", border: "border-green-100/90", glow: "shadow-[0_0_0_2px_rgba(34,197,94,0.42)]", chip: "bg-green-500/20 border-green-300/60 text-green-100" },
  },
  throat_jaw: {
    chakra: { fill: "bg-blue-500/35", border: "border-blue-100/90", glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.42)]", chip: "bg-blue-500/20 border-blue-300/60 text-blue-100" },
    fascia: { fill: "bg-blue-500/35", border: "border-blue-100/90", glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.42)]", chip: "bg-blue-500/20 border-blue-300/60 text-blue-100" },
  },
  brow_crown: {
    chakra: { fill: "bg-violet-500/30", border: "border-violet-100/80", glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.35)]", chip: "bg-violet-500/15 border-violet-400/40 text-violet-100" },
    fascia: { fill: "bg-fuchsia-500/25", border: "border-fuchsia-100/80", glow: "shadow-[0_0_0_2px_rgba(217,70,239,0.35)]", chip: "bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-100" },
  },
};

const CHAKRA_REGION_MAP = {
  earth_star: "feet_legs",
  root: "feet_legs",
  sacral: "pelvis_womb",
  solar: "solar_core",
  heart: "heart_chest",
  higher_heart: "heart_chest",
  throat: "throat_jaw",
  third_eye: "brow_crown",
  crown: "brow_crown",
  causal: "brow_crown",
  soul_star: "brow_crown",
  stellar: "brow_crown",
  universal: "brow_crown",
};

const THIRD_EYE_INDIGO_STYLE = {
  fill: "bg-indigo-500/35",
  border: "border-indigo-100/90",
  glow: "shadow-[0_0_0_2px_rgba(99,102,241,0.42)]",
  chip: "bg-indigo-500/20 border-indigo-300/60 text-indigo-100",
};

const getRegionVisualStyle = (key, fasciaMode, chakraKey = "") => {
  const defaultStyle = {
    fill: "bg-cyan-500/25",
    border: "border-cyan-100/70",
    glow: "shadow-[0_0_0_2px_rgba(34,211,238,0.35)]",
    chip: "bg-cyan-500/15 border-cyan-400/40 text-cyan-100",
  };

  if (key === "brow_crown" && chakraKey === "third_eye") {
    return THIRD_EYE_INDIGO_STYLE;
  }

  const source = REGION_VISUAL_STYLES[key];
  if (!source) return defaultStyle;
  return fasciaMode ? source.fascia : source.chakra;
};

const ELEMENT_REGION_MAP = {
  Earth: ["feet_legs", "pelvis_womb", "solar_core"],
  Water: ["pelvis_womb", "heart_chest", "throat_jaw"],
  Fire: ["solar_core", "heart_chest", "throat_jaw"],
  Air: ["heart_chest", "throat_jaw", "brow_crown"],
  Spirit: ["pelvis_womb", "heart_chest", "brow_crown"],
};

const PRACTICE_REGION_KEYWORDS = [
  { region: "solar_core", words: ["solar", "plexus", "core", "gut", "digest", "stomach", "diaphragm", "confidence", "power", "will", "agency"] },
  { region: "throat_jaw", words: ["throat", "jaw", "voice", "neck", "vagus", "larynx", "tongue"] },
  { region: "heart_chest", words: ["heart", "chest", "lung", "breast", "rib", "grief", "compassion"] },
  { region: "pelvis_womb", words: ["pelvis", "womb", "hip", "psoas", "sacral", "yoni", "root bowl"] },
  { region: "feet_legs", words: ["feet", "legs", "knee", "ankle", "ground", "root", "hamstring", "calf"] },
  { region: "brow_crown", words: ["crown", "brow", "third eye", "head", "skull", "pineal", "clarity"] },
];

const ELEMENT_PRIMARY_REGION = {
  Earth: "feet_legs",
  Water: "pelvis_womb",
  Fire: "solar_core",
  Air: "heart_chest",
  Spirit: "heart_chest",
};

const inferPracticeRegionKeys = (practiceName) => {
  const source = String(practiceName || "").toLowerCase();
  if (!source) return [];
  return PRACTICE_REGION_KEYWORDS
    .filter((entry) => entry.words.some((word) => source.includes(word)))
    .map((entry) => entry.region);
};

const getRegionCards = (element, practiceName) => {
  const priorityOrder = ["solar_core", "heart_chest", "throat_jaw", "pelvis_womb", "feet_legs", "brow_crown"];
  const sortByPriority = (a, b) => priorityOrder.indexOf(a.key) - priorityOrder.indexOf(b.key);
  const keys = ELEMENT_REGION_MAP[element] || ELEMENT_REGION_MAP.Spirit;
  const inferred = inferPracticeRegionKeys(practiceName);
  const mergedKeys = Array.from(new Set([...inferred, ...keys]));
  const chosen = mergedKeys.length > 0 ? mergedKeys.slice(0, 4) : keys;
  return chosen.map((key) => BODY_WISDOM_LIBRARY[key]).filter(Boolean).sort(sortByPriority);
};

const getPrimaryRegionKey = (element, practiceName) => {
  const inferred = inferPracticeRegionKeys(practiceName);
  if (inferred.length > 0) return inferred[0];
  return ELEMENT_PRIMARY_REGION[element] || ELEMENT_PRIMARY_REGION.Spirit;
};

const getPrimaryRegionKeyWithChakra = (element, practiceName, chakraName) => {
  const chakraKey = normalizeChakraKey(chakraName);
  if (chakraKey && CHAKRA_REGION_MAP[chakraKey]) {
    return CHAKRA_REGION_MAP[chakraKey];
  }
  return getPrimaryRegionKey(element, practiceName);
};

const getRegionCardsForMode = (element, fasciaMode, practiceName) => {
  const cards = getRegionCards(element, practiceName);
  if (!fasciaMode) {
    return cards.slice(0, 3);
  }
  return cards.filter((card) => card && card.fascia).slice(0, 3);
};

const BodyDiagram = ({ cards, selectedRegionKey, onSelectRegion, testIdPrefix, fasciaMode, chakraKey }) => {
  const selectedCard = cards.find((card) => card.key === selectedRegionKey) || cards[0];
  const visibleCards = selectedCard ? [selectedCard] : [];
  const focusZone = selectedCard?.diagram?.zone || { x: 50, y: 50, w: 24, h: 14 };
  const canvasWidth = 210;
  const canvasHeight = 420;
  const focusX = (focusZone.x / 100) * canvasWidth;
  const focusY = (focusZone.y / 100) * canvasHeight;
  const translateX = (canvasWidth / 2 - focusX) * 0.55;
  const translateY = (canvasHeight / 2 - focusY) * 0.55;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4" data-testid={`${testIdPrefix}-interactive-body-map`}>
      <h4 className="text-sm font-medium mb-3">Simple Body Focus Map · One selected area highlighted</h4>
      <div className="grid lg:grid-cols-[220px_1fr] gap-4 items-start">
        <div className="relative mx-auto w-[210px] h-[420px] rounded-3xl border border-white/10 bg-black/30 overflow-hidden" data-testid={`${testIdPrefix}-diagram-canvas`}>
          <div
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${translateX}px, ${translateY}px) scale(1.28)` }}
            data-testid={`${testIdPrefix}-diagram-focus-zoom`}
          >
            <img
              src={ANATOMICAL_BODYMAP_IMAGE}
              alt="Simple highlighted body map"
              className="absolute inset-0 w-full h-full object-contain opacity-85"
              data-testid={`${testIdPrefix}-diagram-anatomical-image`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />

            {visibleCards.map((card) => {
              const point = card?.diagram?.front;
              if (!point) return null;
              const zone = card?.diagram?.zone || { x: point.x, y: point.y, w: 14, h: 10 };
              const active = selectedRegionKey === card.key;
              const visual = getRegionVisualStyle(card.key, fasciaMode, chakraKey);
              return (
                <button
                  key={`${card.key}-point`}
                  type="button"
                  onClick={() => onSelectRegion(card.key)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 transition-all duration-300 ${
                    active
                      ? `${visual.fill} ${visual.border} ${visual.glow}`
                      : "bg-transparent border-white/20 hover:border-white/40"
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.w}%`,
                    height: `${zone.h}%`,
                  }}
                  data-testid={`${testIdPrefix}-diagram-point-${card.key}`}
                  aria-label={`Select ${card.region}`}
                  title={card.region}
                >
                  <span className="sr-only">{card.region}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-diagram-mode-copy`}>
            {fasciaMode
              ? "Fascia focus is active: only the primary fascia-relevant sections are highlighted for this practice."
              : "Chakra-color focus is active: only the main sections for this subject are highlighted."}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {cards.map((card) => {
              const active = selectedRegionKey === card.key;
              const visual = getRegionVisualStyle(card.key, fasciaMode, chakraKey);
              return (
                <li key={`${card.key}-legend`} data-testid={`${testIdPrefix}-diagram-legend-${card.key}`}>
                  <button
                    type="button"
                    onClick={() => onSelectRegion(card.key)}
                    className={`w-full text-left text-xs rounded-lg border px-2 py-1.5 transition ${
                      active
                        ? `${visual.chip} shadow-sm`
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/25"
                    }`}
                  >
                    {card.region}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const buildThreeStep = (practiceName, element) => [
  `Somatic Grounding (3-5 min): root both feet, soften jaw/shoulders, and track where ${practiceName} is felt in your ${element.toLowerCase()} body awareness.`,
  "Breath + Movement (5-8 min): inhale 4, exhale 6 with gentle sway/spinal wave; pause every 90 seconds to regulate before continuing.",
  "Action Anchor (2 min): speak one clear commitment aloud and complete one visible embodied action today (boundary, conversation, or task).",
];

const buildSevenDay = (practiceName) => [
  `Day 1-2: practice ${practiceName} with body tracking and journaling (what changed physically and emotionally).`,
  "Day 3-4: repeat with stronger embodiment—voice, posture, and breath congruence in one real-life interaction.",
  "Day 5-6: apply insights to one difficult situation using regulated breath + truthful action.",
  "Day 7: integration review—document one behavior shift, one relationship shift, and next weekly commitment.",
];

export const EmbodimentProtocolPanel = ({
  practiceName,
  element,
  chakraName,
  preferFasciaMode = false,
  testIdPrefix = "embodiment",
}) => {
  const safePractice = String(practiceName || "this practice").trim();
  const safeElement = normalizeElement(element);
  const safeChakraKey = normalizeChakraKey(chakraName);
  const fasciaMode = Boolean(preferFasciaMode);

  const threeStep = buildThreeStep(safePractice, safeElement);
  const sevenDay = buildSevenDay(safePractice);
  const regionCards = useMemo(() => getRegionCardsForMode(safeElement, fasciaMode, safePractice), [safeElement, fasciaMode, safePractice]);
  const primaryRegionKey = useMemo(
    () => getPrimaryRegionKeyWithChakra(safeElement, safePractice, safeChakraKey),
    [safeElement, safePractice, safeChakraKey]
  );
  const [selectedRegionKey, setSelectedRegionKey] = useState(regionCards[0]?.key || "feet_legs");

  useEffect(() => {
    if (!primaryRegionKey) return;
    if (regionCards.some((card) => card.key === primaryRegionKey)) {
      setSelectedRegionKey(primaryRegionKey);
      return;
    }
    setSelectedRegionKey(regionCards[0]?.key || "feet_legs");
  }, [primaryRegionKey, regionCards]);

  useEffect(() => {
    if (!regionCards.find((card) => card.key === selectedRegionKey)) {
      setSelectedRegionKey(regionCards[0]?.key || "feet_legs");
    }
  }, [regionCards, selectedRegionKey]);

  const selectedRegion = regionCards.find((card) => card.key === selectedRegionKey) || regionCards[0];
  const bodyScanProtocol = [
    "Orient (60 sec): feel feet, jaw, breath, and room safety before changing anything.",
    "Map (2-3 min): scan feet → pelvis → solar core → chest → throat → head; note tension, heat, numbness, or pulse.",
    "Name (60 sec): give each strong sensation one word (e.g., guarded, heavy, tender, energized).",
    "Regulate (2 min): inhale 4 / exhale 6 while softening 5% in the most activated zone.",
    "Integrate (60 sec): choose one practical action aligned with what your body revealed.",
  ];

  return (
    <section
      className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 space-y-4"
      data-testid={`${testIdPrefix}-panel`}
    >
      <h3 className="text-sm font-medium flex items-center gap-2">
        <Activity className="w-4 h-4 text-amber-300" />
        Embodiment Protocol (Practice + Integration)
      </h3>

      <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-body-map-simple-note`}>
        Interactive body map is simplified for clarity. Tap a region to explore the physical, emotional, energetic, and spiritual layers.
      </p>

      <div className="grid md:grid-cols-2 gap-3" data-testid={`${testIdPrefix}-options-grid`}>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`${testIdPrefix}-three-step`}>
          <p className="text-xs text-amber-200 flex items-center gap-1 mb-2">
            <Footprints className="w-3.5 h-3.5" />
            3-Step Embodiment Option
          </p>
          <ul className="space-y-1.5">
            {threeStep.map((step, index) => (
              <li key={`${testIdPrefix}-3-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-300">✦</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3" data-testid={`${testIdPrefix}-seven-day`}>
          <p className="text-xs text-amber-200 flex items-center gap-1 mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            7-Day Embodiment Option
          </p>
          <ul className="space-y-1.5">
            {sevenDay.map((step, index) => (
              <li key={`${testIdPrefix}-7-${index}`} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-300">✦</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4" data-testid={`${testIdPrefix}-body-wisdom-map`}>
        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
          <HeartPulse className="w-4 h-4 text-cyan-300" />
          Body Wisdom Focus · Tap to highlight
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          {regionCards.map((card) => (
            <button
              type="button"
              onClick={() => setSelectedRegionKey(card.key)}
              key={`${testIdPrefix}-${card.region}`}
              className={`text-left rounded-lg border p-3 space-y-2 transition ${
                selectedRegion?.key === card.key
                  ? "border-cyan-300/60 bg-cyan-500/15"
                  : "border-white/10 bg-black/20 hover:border-cyan-200/40"
              }`}
              data-testid={`${testIdPrefix}-region-card-${card.region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              <p className="text-xs uppercase tracking-wider text-cyan-200">{card.region}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Anatomy:</span> {card.anatomy}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Focus:</span> {card.energy}</p>
            </button>
          ))}
        </div>
      </div>

      <BodyDiagram
        cards={regionCards}
        selectedRegionKey={selectedRegion?.key}
        onSelectRegion={setSelectedRegionKey}
        testIdPrefix={testIdPrefix}
        fasciaMode={fasciaMode}
        chakraKey={safeChakraKey}
      />

      {selectedRegion && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 space-y-2" data-testid={`${testIdPrefix}-selected-region-panel`}>
          <h4 className="text-sm font-medium">Selected Region: {selectedRegion.region}</h4>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Physical Anatomy:</span> {selectedRegion.anatomy}</p>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Physical Function:</span> {selectedRegion.function}</p>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Emotional Layer:</span> {selectedRegion.emotion}</p>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Energetic Layer:</span> {selectedRegion.energy}</p>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Spiritual Layer:</span> {selectedRegion.spiritual}</p>
          <p className="text-xs text-muted-foreground"><span className="text-blue-100">Fascia Lens:</span> {selectedRegion.fascia}</p>
        </div>
      )}

      <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4" data-testid={`${testIdPrefix}-body-scan-protocol`}>
        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-fuchsia-300" />
          Guided Body Scan · What each area is signaling
        </h4>
        <ul className="space-y-2">
          {bodyScanProtocol.map((line, index) => (
            <li key={`${testIdPrefix}-scan-${index}`} className="text-xs text-muted-foreground flex items-start gap-2" data-testid={`${testIdPrefix}-body-scan-step-${index}`}>
              <span className="text-fuchsia-300">✦</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4" data-testid={`${testIdPrefix}-ceremonial-cues`}>
        <h4 className="text-sm font-medium mb-3">Ceremonial Integration Cues</h4>
        <ul className="space-y-2">
          {regionCards.map((card, index) => (
            <li key={`${testIdPrefix}-cue-${card.region}`} className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-ceremonial-cue-${index}`}>
              <span className="text-emerald-300 mr-1">•</span>
              <span className="text-emerald-100">{card.region}:</span> {card.cue}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1" data-testid={`${testIdPrefix}-integration-note`}>
        <TimerReset className="w-3.5 h-3.5 text-amber-300" />
        Tip: choose either the quick 3-step path or the full 7-day path each time you complete this practice.
      </p>
    </section>
  );
};
