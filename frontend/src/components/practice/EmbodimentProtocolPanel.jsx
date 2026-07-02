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
    diagram: { front: { x: 50, y: 82 }, zone: { x: 50, y: 78, w: 40, h: 34 } },
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
    diagram: { front: { x: 50, y: 64 }, zone: { x: 50, y: 64, w: 34, h: 16 } },
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
    diagram: { front: { x: 50, y: 50 }, zone: { x: 50, y: 50, w: 32, h: 16 } },
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
    diagram: { front: { x: 50, y: 36 }, zone: { x: 50, y: 36, w: 36, h: 16 } },
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
    diagram: { front: { x: 50, y: 23 }, zone: { x: 50, y: 23, w: 24, h: 12 } },
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
    diagram: { front: { x: 50, y: 11 }, zone: { x: 50, y: 11, w: 22, h: 10 } },
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

const PRACTICE_REGION_KEYWORDS = [
  { region: "throat_jaw", words: ["throat", "jaw", "voice", "neck", "vagus", "larynx", "tongue"] },
  { region: "heart_chest", words: ["heart", "chest", "lung", "breast", "rib", "grief"] },
  { region: "solar_core", words: ["solar", "core", "gut", "digest", "stomach", "diaphragm"] },
  { region: "pelvis_womb", words: ["pelvis", "womb", "hip", "psoas", "sacral", "yoni", "root bowl"] },
  { region: "feet_legs", words: ["feet", "legs", "knee", "ankle", "ground", "root", "hamstring", "calf"] },
  { region: "brow_crown", words: ["crown", "brow", "third eye", "head", "skull", "pineal", "clarity"] },
];

const inferPracticeRegionKeys = (practiceName) => {
  const source = String(practiceName || "").toLowerCase();
  if (!source) return [];
  return PRACTICE_REGION_KEYWORDS
    .filter((entry) => entry.words.some((word) => source.includes(word)))
    .map((entry) => entry.region);
};

const getRegionCards = (element, practiceName) => {
  const keys = ELEMENT_REGION_MAP[element] || ELEMENT_REGION_MAP.Spirit;
  const inferred = inferPracticeRegionKeys(practiceName);
  const mergedKeys = Array.from(new Set([...inferred, ...keys]));
  const chosen = mergedKeys.length > 0 ? mergedKeys.slice(0, 4) : keys;
  return chosen.map((key) => BODY_WISDOM_LIBRARY[key]).filter(Boolean);
};

const getRegionCardsForMode = (element, fasciaMode, practiceName) => {
  const cards = getRegionCards(element, practiceName);
  if (!fasciaMode) {
    return cards;
  }
  return cards.filter((card) => card && card.fascia);
};

const BodyDiagram = ({ cards, selectedRegionKey, onSelectRegion, testIdPrefix, fasciaMode }) => (
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
          const point = card?.diagram?.front;
          if (!point) return null;
          const zone = card?.diagram?.zone || { x: point.x, y: point.y, w: 14, h: 10 };
          const active = selectedRegionKey === card.key;
          return (
            <button
              key={`${card.key}-point`}
              type="button"
              onClick={() => onSelectRegion(card.key)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition ${
                active
                  ? "bg-cyan-400/35 border-cyan-100/90 shadow-[0_0_0_2px_rgba(34,211,238,0.35)]"
                  : "bg-cyan-400/10 border-cyan-200/40 hover:bg-cyan-400/20 hover:border-cyan-100/70"
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
              <span
                className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-semibold border flex items-center justify-center ${
                  active
                    ? "bg-cyan-300 text-black border-cyan-100"
                    : "bg-black/70 text-cyan-100 border-cyan-300/50"
                }`}
              >
                {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-diagram-mode-copy`}>
          {fasciaMode
            ? "Fascia-focused support: highlighting connective tissue chains and stored stress patterns."
            : "Map is anatomy-calibrated and practice-aware. Tap highlighted zones to explore physical, emotional, energetic, and spiritual layers."}
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
  const fasciaMode = Boolean(preferFasciaMode);

  const threeStep = buildThreeStep(safePractice, safeElement);
  const sevenDay = buildSevenDay(safePractice);
  const regionCards = useMemo(() => getRegionCardsForMode(safeElement, fasciaMode, safePractice), [safeElement, fasciaMode, safePractice]);
  const [selectedRegionKey, setSelectedRegionKey] = useState(regionCards[0]?.key || "feet_legs");

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
