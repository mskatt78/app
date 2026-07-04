import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, Footprints, HeartPulse, Sparkles, TimerReset } from "lucide-react";

const ANATOMICAL_BODYMAP_IMAGE = "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6ed46ee0b34945fb844f1bc345a71268d9f69a8656ab6fced3cc0f4aa540165a.png";

const ANATOMY_MODE_BASE_IMAGES = {
  chakra: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c1c0d2d88901446aa1fa6dbd159d461b3370fec78dc5a6392aa961a2f403c01e.png",
  fascia: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/fb718661a5c6ae14e37d015a70b7d010ada537ada9c88e39932053c87876e11b.png",
  muscle: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/86b7d8b24966f579bca2a232f1136218841ddf797fb939fc90b740617a486951.png",
  organ: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/1b2fef635d9743f4db4ac453141377bbf9c468fa67e43e404c30f29a09f38d07.png",
  meridian: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9d02c5eb65c75ca03313a7059724c784a75d38c655b8eb2ea01bcc3b4d78ecb8.png",
  emotional: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/f0016e490c3740e7b03ba6090c46e202927bb5a1bf26b3cb2f25a9a751f3a16d.png",
  balance: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/2f119999561afa0d2342c8a8de7931366bafdf29fca5d94727fe37684b45296f.png",
  healing: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/c6ad4e7774ec38340bb32da1038f9e09388b81e1f36a207951b7f337b263c4cf.png",
};

const normalizeElement = (value) => String(value || "Spirit").trim();
const normalizeChakraKey = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z]+/g, "_");
const normalizeAnatomyMode = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z]+/g, "_");

const SUPPORTED_ANATOMY_MODES = new Set([
  "chakra",
  "fascia",
  "muscle",
  "organ",
  "meridian",
  "emotional",
  "balance",
  "healing",
]);

const ANATOMY_MODE_THEME = {
  chakra: {
    title: "Chakra Focus Map",
    subtitle: "Chakra-specific highlights with strict color alignment.",
  },
  fascia: {
    title: "Fascia Web Map",
    subtitle: "Spider-web fascial chains with connective tissue emphasis.",
  },
  muscle: {
    title: "Muscle Focus Map",
    subtitle: "Primary muscle groups and movement chains.",
  },
  organ: {
    title: "Organ Focus Map",
    subtitle: "Core organ regions linked to the selected practice.",
  },
  meridian: {
    title: "Meridian Flow Map",
    subtitle: "Energetic channel lines and pathway orientation.",
  },
  emotional: {
    title: "Emotional Body Map",
    subtitle: "Where emotional patterns tend to localize in the body.",
  },
  balance: {
    title: "Balance Alignment Map",
    subtitle: "Centerline, stability axis, and bilateral balance zones.",
  },
  healing: {
    title: "Healing Integration Map",
    subtitle: "Recovery-oriented highlights for restoration and regulation.",
  },
};

const inferAnatomyModeFromContext = (practiceName, element, chakraKey, preferFasciaMode) => {
  if (preferFasciaMode) return "fascia";
  if (chakraKey) return "chakra";

  const source = `${practiceName || ""} ${element || ""}`.toLowerCase();
  if (/(fascia|myofascial|connective tissue|psoas)/.test(source)) return "fascia";
  if (/(meridian|qi|chi|acupressure|channel)/.test(source)) return "meridian";
  if (/(organ|liver|kidney|stomach|digestive|womb|heart space)/.test(source)) return "organ";
  if (/(emotion|trauma|grief|heart|feelings|nervous system)/.test(source)) return "emotional";
  if (/(balance|alignment|stability|equilibrium)/.test(source)) return "balance";
  if (/(heal|healing|restore|recovery|regulation)/.test(source)) return "healing";
  if (/(yoga|somatic|movement|muscle|mobility|stretch)/.test(source)) return "muscle";
  return "healing";
};

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
    diagram: { front: { x: 50, y: 57 }, zone: { x: 50, y: 57, w: 16, h: 8 } },
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

const MODE_VISUAL_OVERRIDES = {
  fascia: {
    feet_legs: { fill: "bg-amber-400/30", border: "border-amber-100/90", glow: "shadow-[0_0_0_2px_rgba(251,191,36,0.4)]", chip: "bg-amber-500/20 border-amber-300/60 text-amber-100" },
    pelvis_womb: { fill: "bg-rose-400/30", border: "border-rose-100/90", glow: "shadow-[0_0_0_2px_rgba(251,113,133,0.4)]", chip: "bg-rose-500/20 border-rose-300/60 text-rose-100" },
    solar_core: { fill: "bg-yellow-300/55", border: "border-yellow-100", glow: "shadow-[0_0_0_2px_rgba(253,224,71,0.45)]", chip: "bg-yellow-500/20 border-yellow-300/60 text-yellow-100" },
    heart_chest: { fill: "bg-emerald-400/30", border: "border-emerald-100/90", glow: "shadow-[0_0_0_2px_rgba(52,211,153,0.4)]", chip: "bg-emerald-500/20 border-emerald-300/60 text-emerald-100" },
    throat_jaw: { fill: "bg-sky-400/30", border: "border-sky-100/90", glow: "shadow-[0_0_0_2px_rgba(56,189,248,0.4)]", chip: "bg-sky-500/20 border-sky-300/60 text-sky-100" },
    brow_crown: { fill: "bg-indigo-400/30", border: "border-indigo-100/90", glow: "shadow-[0_0_0_2px_rgba(129,140,248,0.4)]", chip: "bg-indigo-500/20 border-indigo-300/60 text-indigo-100" },
  },
  muscle: {
    feet_legs: { fill: "bg-red-500/35", border: "border-red-100/90", glow: "shadow-[0_0_0_2px_rgba(239,68,68,0.42)]", chip: "bg-red-500/20 border-red-300/60 text-red-100" },
    pelvis_womb: { fill: "bg-orange-500/35", border: "border-orange-100/90", glow: "shadow-[0_0_0_2px_rgba(249,115,22,0.42)]", chip: "bg-orange-500/20 border-orange-300/60 text-orange-100" },
    solar_core: { fill: "bg-amber-500/40", border: "border-amber-100/90", glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.42)]", chip: "bg-amber-500/20 border-amber-300/60 text-amber-100" },
    heart_chest: { fill: "bg-rose-500/35", border: "border-rose-100/90", glow: "shadow-[0_0_0_2px_rgba(244,63,94,0.42)]", chip: "bg-rose-500/20 border-rose-300/60 text-rose-100" },
    throat_jaw: { fill: "bg-blue-500/35", border: "border-blue-100/90", glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.42)]", chip: "bg-blue-500/20 border-blue-300/60 text-blue-100" },
    brow_crown: { fill: "bg-violet-500/35", border: "border-violet-100/90", glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.42)]", chip: "bg-violet-500/20 border-violet-300/60 text-violet-100" },
  },
  organ: {
    feet_legs: { fill: "bg-stone-500/30", border: "border-stone-100/80", glow: "shadow-[0_0_0_2px_rgba(168,162,158,0.38)]", chip: "bg-stone-500/20 border-stone-300/60 text-stone-100" },
    pelvis_womb: { fill: "bg-pink-500/32", border: "border-pink-100/85", glow: "shadow-[0_0_0_2px_rgba(236,72,153,0.38)]", chip: "bg-pink-500/20 border-pink-300/60 text-pink-100" },
    solar_core: { fill: "bg-yellow-400/42", border: "border-yellow-100/90", glow: "shadow-[0_0_0_2px_rgba(250,204,21,0.4)]", chip: "bg-yellow-500/20 border-yellow-300/60 text-yellow-100" },
    heart_chest: { fill: "bg-lime-500/35", border: "border-lime-100/85", glow: "shadow-[0_0_0_2px_rgba(132,204,22,0.38)]", chip: "bg-lime-500/20 border-lime-300/60 text-lime-100" },
    throat_jaw: { fill: "bg-cyan-500/35", border: "border-cyan-100/85", glow: "shadow-[0_0_0_2px_rgba(6,182,212,0.38)]", chip: "bg-cyan-500/20 border-cyan-300/60 text-cyan-100" },
    brow_crown: { fill: "bg-purple-500/35", border: "border-purple-100/85", glow: "shadow-[0_0_0_2px_rgba(168,85,247,0.38)]", chip: "bg-purple-500/20 border-purple-300/60 text-purple-100" },
  },
  meridian: {
    feet_legs: { fill: "bg-teal-500/30", border: "border-teal-100/85", glow: "shadow-[0_0_0_2px_rgba(20,184,166,0.38)]", chip: "bg-teal-500/20 border-teal-300/60 text-teal-100" },
    pelvis_womb: { fill: "bg-cyan-500/30", border: "border-cyan-100/85", glow: "shadow-[0_0_0_2px_rgba(6,182,212,0.38)]", chip: "bg-cyan-500/20 border-cyan-300/60 text-cyan-100" },
    solar_core: { fill: "bg-emerald-500/35", border: "border-emerald-100/85", glow: "shadow-[0_0_0_2px_rgba(16,185,129,0.38)]", chip: "bg-emerald-500/20 border-emerald-300/60 text-emerald-100" },
    heart_chest: { fill: "bg-blue-500/32", border: "border-blue-100/85", glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.38)]", chip: "bg-blue-500/20 border-blue-300/60 text-blue-100" },
    throat_jaw: { fill: "bg-indigo-500/32", border: "border-indigo-100/85", glow: "shadow-[0_0_0_2px_rgba(99,102,241,0.38)]", chip: "bg-indigo-500/20 border-indigo-300/60 text-indigo-100" },
    brow_crown: { fill: "bg-violet-500/32", border: "border-violet-100/85", glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.38)]", chip: "bg-violet-500/20 border-violet-300/60 text-violet-100" },
  },
  emotional: {
    feet_legs: { fill: "bg-red-400/32", border: "border-red-100/85", glow: "shadow-[0_0_0_2px_rgba(248,113,113,0.38)]", chip: "bg-red-500/20 border-red-300/60 text-red-100" },
    pelvis_womb: { fill: "bg-orange-400/32", border: "border-orange-100/85", glow: "shadow-[0_0_0_2px_rgba(251,146,60,0.38)]", chip: "bg-orange-500/20 border-orange-300/60 text-orange-100" },
    solar_core: { fill: "bg-yellow-300/50", border: "border-yellow-100/90", glow: "shadow-[0_0_0_2px_rgba(253,224,71,0.4)]", chip: "bg-yellow-500/20 border-yellow-300/60 text-yellow-100" },
    heart_chest: { fill: "bg-emerald-400/35", border: "border-emerald-100/90", glow: "shadow-[0_0_0_2px_rgba(52,211,153,0.4)]", chip: "bg-emerald-500/20 border-emerald-300/60 text-emerald-100" },
    throat_jaw: { fill: "bg-sky-400/32", border: "border-sky-100/85", glow: "shadow-[0_0_0_2px_rgba(56,189,248,0.38)]", chip: "bg-sky-500/20 border-sky-300/60 text-sky-100" },
    brow_crown: { fill: "bg-indigo-500/32", border: "border-indigo-100/85", glow: "shadow-[0_0_0_2px_rgba(99,102,241,0.38)]", chip: "bg-indigo-500/20 border-indigo-300/60 text-indigo-100" },
  },
  balance: {
    feet_legs: { fill: "bg-slate-500/30", border: "border-slate-100/85", glow: "shadow-[0_0_0_2px_rgba(100,116,139,0.38)]", chip: "bg-slate-500/20 border-slate-300/60 text-slate-100" },
    pelvis_womb: { fill: "bg-zinc-500/30", border: "border-zinc-100/85", glow: "shadow-[0_0_0_2px_rgba(113,113,122,0.38)]", chip: "bg-zinc-500/20 border-zinc-300/60 text-zinc-100" },
    solar_core: { fill: "bg-amber-500/38", border: "border-amber-100/90", glow: "shadow-[0_0_0_2px_rgba(245,158,11,0.4)]", chip: "bg-amber-500/20 border-amber-300/60 text-amber-100" },
    heart_chest: { fill: "bg-emerald-500/32", border: "border-emerald-100/85", glow: "shadow-[0_0_0_2px_rgba(16,185,129,0.38)]", chip: "bg-emerald-500/20 border-emerald-300/60 text-emerald-100" },
    throat_jaw: { fill: "bg-blue-500/30", border: "border-blue-100/85", glow: "shadow-[0_0_0_2px_rgba(59,130,246,0.38)]", chip: "bg-blue-500/20 border-blue-300/60 text-blue-100" },
    brow_crown: { fill: "bg-violet-500/30", border: "border-violet-100/85", glow: "shadow-[0_0_0_2px_rgba(139,92,246,0.38)]", chip: "bg-violet-500/20 border-violet-300/60 text-violet-100" },
  },
  healing: {
    feet_legs: { fill: "bg-emerald-500/30", border: "border-emerald-100/85", glow: "shadow-[0_0_0_2px_rgba(16,185,129,0.38)]", chip: "bg-emerald-500/20 border-emerald-300/60 text-emerald-100" },
    pelvis_womb: { fill: "bg-teal-500/30", border: "border-teal-100/85", glow: "shadow-[0_0_0_2px_rgba(20,184,166,0.38)]", chip: "bg-teal-500/20 border-teal-300/60 text-teal-100" },
    solar_core: { fill: "bg-lime-500/35", border: "border-lime-100/85", glow: "shadow-[0_0_0_2px_rgba(132,204,22,0.38)]", chip: "bg-lime-500/20 border-lime-300/60 text-lime-100" },
    heart_chest: { fill: "bg-green-500/35", border: "border-green-100/85", glow: "shadow-[0_0_0_2px_rgba(34,197,94,0.38)]", chip: "bg-green-500/20 border-green-300/60 text-green-100" },
    throat_jaw: { fill: "bg-cyan-500/30", border: "border-cyan-100/85", glow: "shadow-[0_0_0_2px_rgba(6,182,212,0.38)]", chip: "bg-cyan-500/20 border-cyan-300/60 text-cyan-100" },
    brow_crown: { fill: "bg-indigo-500/30", border: "border-indigo-100/85", glow: "shadow-[0_0_0_2px_rgba(99,102,241,0.38)]", chip: "bg-indigo-500/20 border-indigo-300/60 text-indigo-100" },
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

const getRegionVisualStyle = (key, anatomyMode, chakraKey = "") => {
  const defaultStyle = {
    fill: "bg-cyan-500/25",
    border: "border-cyan-100/70",
    glow: "shadow-[0_0_0_2px_rgba(34,211,238,0.35)]",
    chip: "bg-cyan-500/15 border-cyan-400/40 text-cyan-100",
  };

  if (key === "brow_crown" && chakraKey === "third_eye") {
    return THIRD_EYE_INDIGO_STYLE;
  }

  const modeOverrides = MODE_VISUAL_OVERRIDES[anatomyMode];
  if (modeOverrides?.[key]) {
    return modeOverrides[key];
  }

  const source = REGION_VISUAL_STYLES[key];
  if (!source) return defaultStyle;
  return anatomyMode === "fascia" ? source.fascia : source.chakra;
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

const BodyDiagram = ({ cards, selectedRegionKey, onSelectRegion, testIdPrefix, anatomyMode, chakraKey }) => {
  const selectedCard = cards.find((card) => card.key === selectedRegionKey) || cards[0];
  const visibleCards = selectedCard ? [selectedCard] : [];
  const focusZone = selectedCard?.diagram?.zone || { x: 50, y: 50, w: 24, h: 14 };
  const canvasWidth = 210;
  const canvasHeight = 420;
  const focusX = (focusZone.x / 100) * canvasWidth;
  const focusY = (focusZone.y / 100) * canvasHeight;
  const translateX = (canvasWidth / 2 - focusX) * 0.55;
  const translateY = (canvasHeight / 2 - focusY) * 0.55;
  const modeBaseImage = ANATOMY_MODE_BASE_IMAGES[anatomyMode] || ANATOMICAL_BODYMAP_IMAGE;

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
              src={modeBaseImage}
              alt={`${anatomyMode} anatomical map`}
              className="absolute inset-0 w-full h-full object-contain opacity-85"
              data-testid={`${testIdPrefix}-diagram-anatomical-image`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />

            {visibleCards.map((card) => {
              const point = card?.diagram?.front;
              if (!point) return null;
              const zone = card?.diagram?.zone || { x: point.x, y: point.y, w: 14, h: 10 };
              const active = selectedRegionKey === card.key;
              const visual = getRegionVisualStyle(card.key, anatomyMode, chakraKey);
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
                  data-mode={anatomyMode}
                  data-testid={`${testIdPrefix}-diagram-point-${card.key}`}
                  aria-label={`Select ${card.region}`}
                  title={card.region}
                >
                  <span className="sr-only">{card.region}</span>
                </button>
              );
            })}
            {anatomyMode === "fascia" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-fascia-web-overlay`}>
                <g stroke="rgba(245, 158, 11, 0.55)" strokeWidth="0.8" fill="none">
                  <path d="M50 8 C39 19, 36 33, 50 48 C64 33, 61 19, 50 8 Z" />
                  <path d="M50 12 C44 20, 43 28, 50 36 C57 28, 56 20, 50 12 Z" />
                  <path d="M50 48 C36 55, 33 67, 38 82" />
                  <path d="M50 48 C64 55, 67 67, 62 82" />
                  <path d="M50 48 C45 56, 44 66, 44 77" />
                  <path d="M50 48 C55 56, 56 66, 56 77" />
                  <path d="M50 48 C49 58, 49 70, 50 82" />
                  <path d="M38 82 C34 88, 33 93, 34 98" />
                  <path d="M62 82 C66 88, 67 93, 66 98" />
                  <path d="M44 77 C42 84, 41 90, 42 96" />
                  <path d="M56 77 C58 84, 59 90, 58 96" />
                  <path d="M34 33 C28 40, 26 49, 27 59" />
                  <path d="M66 33 C72 40, 74 49, 73 59" />
                  <path d="M50 24 C42 28, 38 35, 34 44" />
                  <path d="M50 24 C58 28, 62 35, 66 44" />
                  <path d="M30 50 C36 52, 42 53, 50 53 C58 53, 64 52, 70 50" />
                  <path d="M32 62 C38 63, 44 64, 50 64 C56 64, 62 63, 68 62" />
                  <path d="M35 74 C40 75, 45 76, 50 76 C55 76, 60 75, 65 74" />
                  <path d="M38 86 C42 87, 46 88, 50 88 C54 88, 58 87, 62 86" />
                </g>
              </svg>
            )}

            {anatomyMode === "muscle" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-muscle-overlay`}>
                <g stroke="rgba(239, 68, 68, 0.58)" strokeWidth="0.95" fill="none">
                  <path d="M45 17 C43 24, 42 31, 43 39" />
                  <path d="M55 17 C57 24, 58 31, 57 39" />
                  <path d="M43 39 C40 46, 40 56, 43 66" />
                  <path d="M57 39 C60 46, 60 56, 57 66" />
                  <path d="M43 66 C40 74, 40 84, 43 95" />
                  <path d="M57 66 C60 74, 60 84, 57 95" />
                  <path d="M36 33 C30 42, 30 54, 35 66" />
                  <path d="M64 33 C70 42, 70 54, 65 66" />
                  <path d="M37 45 C34 52, 34 59, 37 66" />
                  <path d="M63 45 C66 52, 66 59, 63 66" />
                  <path d="M47 53 C46 58, 46 63, 47 68" />
                  <path d="M53 53 C54 58, 54 63, 53 68" />
                </g>
                <g fill="rgba(239, 68, 68, 0.16)">
                  <ellipse cx="43" cy="54" rx="3.2" ry="7.4" />
                  <ellipse cx="57" cy="54" rx="3.2" ry="7.4" />
                  <ellipse cx="43" cy="78" rx="3" ry="8" />
                  <ellipse cx="57" cy="78" rx="3" ry="8" />
                </g>
              </svg>
            )}

            {anatomyMode === "organ" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-organ-overlay`}>
                <g stroke="rgba(236, 72, 153, 0.55)" strokeWidth="0.9" fill="rgba(236, 72, 153, 0.14)">
                  <ellipse cx="50" cy="34" rx="10" ry="7" />
                  <ellipse cx="44" cy="44" rx="6" ry="5" />
                  <ellipse cx="56" cy="44" rx="6" ry="5" />
                  <ellipse cx="50" cy="55" rx="9" ry="6" />
                  <ellipse cx="46" cy="64" rx="5" ry="4" />
                  <ellipse cx="54" cy="64" rx="5" ry="4" />
                </g>
                <g stroke="rgba(236, 72, 153, 0.45)" strokeWidth="0.7" fill="none">
                  <path d="M50 27 C50 30, 50 33, 50 36" />
                  <path d="M44 44 C46 47, 48 50, 50 52" />
                  <path d="M56 44 C54 47, 52 50, 50 52" />
                  <path d="M50 52 C50 56, 50 60, 50 64" />
                </g>
              </svg>
            )}

            {anatomyMode === "meridian" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-meridian-overlay`}>
                <g stroke="rgba(56, 189, 248, 0.55)" strokeWidth="0.8" fill="none" strokeDasharray="2 2">
                  <path d="M50 8 C48 20, 48 35, 50 50 C52 65, 52 80, 50 98" />
                  <path d="M42 14 C40 28, 40 44, 42 62 C43 72, 43 84, 42 96" />
                  <path d="M58 14 C60 28, 60 44, 58 62 C57 72, 57 84, 58 96" />
                  <path d="M34 22 C30 35, 30 52, 34 70 C35 79, 35 88, 34 97" />
                  <path d="M66 22 C70 35, 70 52, 66 70 C65 79, 65 88, 66 97" />
                  <path d="M26 34 C22 45, 22 58, 26 72" />
                  <path d="M74 34 C78 45, 78 58, 74 72" />
                </g>
                <g fill="rgba(56, 189, 248, 0.35)">
                  <circle cx="50" cy="22" r="1.1" />
                  <circle cx="50" cy="38" r="1.1" />
                  <circle cx="50" cy="54" r="1.1" />
                  <circle cx="50" cy="70" r="1.1" />
                  <circle cx="50" cy="86" r="1.1" />
                </g>
              </svg>
            )}

            {anatomyMode === "emotional" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-emotional-overlay`}>
                <g fill="rgba(16, 185, 129, 0.18)" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="0.8">
                  <circle cx="50" cy="36" r="9" />
                  <circle cx="50" cy="48" r="7" />
                  <circle cx="50" cy="62" r="8" />
                  <circle cx="44" cy="62" r="4" />
                  <circle cx="56" cy="62" r="4" />
                </g>
                <g stroke="rgba(16, 185, 129, 0.35)" strokeWidth="0.7" fill="none">
                  <path d="M50 27 C46 32, 46 40, 50 45 C54 40, 54 32, 50 27 Z" />
                  <path d="M50 48 C46 53, 46 60, 50 65 C54 60, 54 53, 50 48 Z" />
                </g>
              </svg>
            )}

            {anatomyMode === "balance" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-balance-overlay`}>
                <g stroke="rgba(148, 163, 184, 0.55)" strokeWidth="0.9" fill="none">
                  <path d="M50 6 L50 98" />
                  <path d="M28 36 L72 36" />
                  <path d="M30 62 L70 62" />
                  <path d="M34 82 L66 82" />
                  <path d="M40 20 L60 20" />
                  <path d="M38 36 L42 62" />
                  <path d="M62 36 L58 62" />
                </g>
                <g fill="rgba(148, 163, 184, 0.25)">
                  <circle cx="50" cy="20" r="1.4" />
                  <circle cx="50" cy="36" r="1.4" />
                  <circle cx="50" cy="62" r="1.4" />
                  <circle cx="50" cy="82" r="1.4" />
                </g>
              </svg>
            )}

            {anatomyMode === "healing" && (
              <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" data-testid={`${testIdPrefix}-healing-overlay`}>
                <g stroke="rgba(34, 197, 94, 0.5)" strokeWidth="0.9" fill="none">
                  <path d="M50 14 C42 22, 42 34, 50 42 C58 34, 58 22, 50 14 Z" />
                  <path d="M50 44 C40 52, 40 64, 50 72 C60 64, 60 52, 50 44 Z" />
                  <path d="M50 74 C44 80, 44 89, 50 95 C56 89, 56 80, 50 74 Z" />
                  <path d="M50 14 L50 95" />
                  <path d="M42 30 C46 32, 54 32, 58 30" />
                  <path d="M41 58 C45 60, 55 60, 59 58" />
                  <path d="M44 85 C47 86, 53 86, 56 85" />
                </g>
                <g fill="rgba(34, 197, 94, 0.25)">
                  <circle cx="50" cy="28" r="1.2" />
                  <circle cx="50" cy="58" r="1.2" />
                  <circle cx="50" cy="86" r="1.2" />
                </g>
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-diagram-mode-copy`}>
            {ANATOMY_MODE_THEME[anatomyMode]?.subtitle || "Focused body-region highlighting is active."}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {cards.map((card) => {
              const active = selectedRegionKey === card.key;
              const visual = getRegionVisualStyle(card.key, anatomyMode, chakraKey);
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
  anatomyMode,
  preferFasciaMode = false,
  testIdPrefix = "embodiment",
}) => {
  const safePractice = String(practiceName || "this practice").trim();
  const safeElement = normalizeElement(element);
  const safeChakraKey = normalizeChakraKey(chakraName);
  const fasciaMode = Boolean(preferFasciaMode);
  const safeRequestedMode = normalizeAnatomyMode(anatomyMode);
  const resolvedAnatomyMode = useMemo(() => {
    if (SUPPORTED_ANATOMY_MODES.has(safeRequestedMode)) return safeRequestedMode;
    return inferAnatomyModeFromContext(safePractice, safeElement, safeChakraKey, fasciaMode);
  }, [safeRequestedMode, safePractice, safeElement, safeChakraKey, fasciaMode]);

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
          {ANATOMY_MODE_THEME[resolvedAnatomyMode]?.title || "Body Wisdom Focus"} · Tap to highlight
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
        anatomyMode={resolvedAnatomyMode}
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
