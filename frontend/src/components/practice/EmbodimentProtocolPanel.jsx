import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, Footprints, HeartPulse, Sparkles, TimerReset } from "lucide-react";

const normalizeElement = (value) => String(value || "Spirit").trim();

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
    diagram: { front: { x: 52, y: 85 }, back: { x: 50, y: 86 } },
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
    diagram: { front: { x: 50, y: 67 }, back: { x: 50, y: 69 } },
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
    diagram: { front: { x: 50, y: 52 }, back: { x: 50, y: 55 } },
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
    diagram: { front: { x: 50, y: 38 }, back: { x: 50, y: 41 } },
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
    diagram: { front: { x: 50, y: 24 }, back: { x: 50, y: 25 } },
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
    diagram: { front: { x: 50, y: 13 }, back: { x: 50, y: 13 } },
    cue: "Soften the eyes and back of head, then ask what becomes clear when urgency drops.",
  },
};

const ELEMENT_REGION_MAP = {
  Earth: ["feet_legs", "pelvis_womb", "solar_core"],
  Water: ["pelvis_womb", "heart_chest", "throat_jaw"],
  Fire: ["solar_core", "heart_chest", "throat_jaw"],
  Air: ["heart_chest", "throat_jaw", "brow_crown"],
  Spirit: ["pelvis_womb", "heart_chest", "brow_crown"],
};

const getRegionCards = (element) => {
  const keys = ELEMENT_REGION_MAP[element] || ELEMENT_REGION_MAP.Spirit;
  return keys.map((key) => BODY_WISDOM_LIBRARY[key]).filter(Boolean);
};

const getRegionCardsForMode = (element, fasciaMode) => {
  const keys = ELEMENT_REGION_MAP[element] || ELEMENT_REGION_MAP.Spirit;
  if (!fasciaMode) {
    return keys.map((key) => BODY_WISDOM_LIBRARY[key]).filter(Boolean);
  }
  return keys
    .map((key) => BODY_WISDOM_LIBRARY[key])
    .filter((card) => card && card.fascia);
};

const BodyDiagram = ({ cards, selectedRegionKey, onSelectRegion, diagramView, testIdPrefix, fasciaMode }) => (
  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4" data-testid={`${testIdPrefix}-interactive-body-map`}>
    <h4 className="text-sm font-medium mb-3">Interactive Body Map Diagram</h4>
    <div className="grid lg:grid-cols-[220px_1fr] gap-4 items-start">
      <div className="relative mx-auto w-[210px] h-[420px] rounded-3xl border border-white/10 bg-black/30" data-testid={`${testIdPrefix}-diagram-canvas`}>
        <svg viewBox="0 0 210 420" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="bodySilhouette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff22" />
              <stop offset="100%" stopColor="#ffffff0c" />
            </linearGradient>
          </defs>
          <circle cx="105" cy="42" r="24" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="78" y="66" width="54" height="128" rx="28" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="54" y="86" width="22" height="102" rx="11" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="134" y="86" width="22" height="102" rx="11" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="84" y="194" width="18" height="150" rx="9" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="108" y="194" width="18" height="150" rx="9" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="80" y="344" width="24" height="48" rx="8" fill="url(#bodySilhouette)" stroke="#ffffff22" />
          <rect x="106" y="344" width="24" height="48" rx="8" fill="url(#bodySilhouette)" stroke="#ffffff22" />
        </svg>

        {cards.map((card, index) => {
          const point = card?.diagram?.[diagramView];
          if (!point) return null;
          const active = selectedRegionKey === card.key;
          return (
            <button
              key={`${card.key}-point`}
              type="button"
              onClick={() => onSelectRegion(card.key)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[10px] font-semibold border transition ${active ? "bg-cyan-400/80 text-black border-cyan-100" : "bg-black/55 text-cyan-100 border-cyan-300/40 hover:bg-cyan-500/30"}`}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              data-testid={`${testIdPrefix}-diagram-point-${card.key}`}
              aria-label={`Select ${card.region}`}
              title={card.region}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-diagram-mode-copy`}>
          {fasciaMode
            ? "Fascia Love Mode: focusing on connective tissue chains and stored stress patterns."
            : "Tap points on the diagram to explore physical, emotional, energetic, and spiritual layers."}
        </p>
        <ul className="grid sm:grid-cols-2 gap-2">
          {cards.map((card, index) => (
            <li key={`${card.key}-legend`} className="text-xs text-muted-foreground rounded-lg border border-white/10 bg-black/20 px-2 py-1" data-testid={`${testIdPrefix}-diagram-legend-${card.key}`}>
              <span className="text-cyan-200 mr-1">{index + 1}.</span>
              {card.region}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

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
  preferFasciaMode = false,
  testIdPrefix = "embodiment",
}) => {
  const safePractice = String(practiceName || "this practice").trim();
  const safeElement = normalizeElement(element);
  const [diagramView, setDiagramView] = useState("front");
  const [fasciaMode, setFasciaMode] = useState(preferFasciaMode);

  const threeStep = buildThreeStep(safePractice, safeElement);
  const sevenDay = buildSevenDay(safePractice);
  const regionCards = useMemo(() => getRegionCardsForMode(safeElement, fasciaMode), [safeElement, fasciaMode]);
  const [selectedRegionKey, setSelectedRegionKey] = useState(regionCards[0]?.key || "feet_legs");

  useEffect(() => {
    if (!regionCards.find((card) => card.key === selectedRegionKey)) {
      setSelectedRegionKey(regionCards[0]?.key || "feet_legs");
    }
  }, [regionCards, selectedRegionKey]);

  useEffect(() => {
    if (preferFasciaMode) {
      setFasciaMode(true);
    }
  }, [preferFasciaMode]);

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

      <div className="flex flex-wrap gap-2" data-testid={`${testIdPrefix}-body-map-controls`}>
        <button
          type="button"
          className={`px-3 py-1 rounded-full text-xs border ${diagramView === "front" ? "bg-cyan-500/30 border-cyan-300/60 text-cyan-100" : "bg-black/30 border-white/10 text-muted-foreground"}`}
          onClick={() => setDiagramView("front")}
          data-testid={`${testIdPrefix}-diagram-view-front`}
        >
          Front View
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-full text-xs border ${diagramView === "back" ? "bg-cyan-500/30 border-cyan-300/60 text-cyan-100" : "bg-black/30 border-white/10 text-muted-foreground"}`}
          onClick={() => setDiagramView("back")}
          data-testid={`${testIdPrefix}-diagram-view-back`}
        >
          Back View
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-full text-xs border ${fasciaMode ? "bg-fuchsia-500/30 border-fuchsia-300/60 text-fuchsia-100" : "bg-black/30 border-white/10 text-muted-foreground"}`}
          onClick={() => setFasciaMode((prev) => !prev)}
          data-testid={`${testIdPrefix}-fascia-mode-toggle`}
        >
          Fascia Love Mode {fasciaMode ? "ON" : "OFF"}
        </button>
      </div>

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
          Body Wisdom Map · Beginner Anatomy + Energy Translation
        </h4>
        <div className="grid md:grid-cols-3 gap-3">
          {regionCards.map((card) => (
            <article
              key={`${testIdPrefix}-${card.region}`}
              className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2"
              data-testid={`${testIdPrefix}-region-card-${card.region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              <p className="text-xs uppercase tracking-wider text-cyan-200">{card.region}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Anatomy:</span> {card.anatomy}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Function:</span> {card.function}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Emotion:</span> {card.emotion}</p>
              <p className="text-xs text-muted-foreground"><span className="text-cyan-100">Energy:</span> {card.energy}</p>
            </article>
          ))}
        </div>
      </div>

      <BodyDiagram
        cards={regionCards}
        selectedRegionKey={selectedRegion?.key}
        onSelectRegion={setSelectedRegionKey}
        diagramView={diagramView}
        testIdPrefix={testIdPrefix}
        fasciaMode={fasciaMode}
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
