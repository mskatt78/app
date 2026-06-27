import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Shield, Sparkles, Star, Feather, X, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { appLogger } from "../utils/logger";
import GuidedPracticeOverlay from "../components/GuidedPracticeOverlay";
import { toast } from "sonner";

const ANGELIC_FALLBACK_DATA = [
  {
    id: "angel-metatron-cube-alchemy",
    name: "Metatron Alchemy · Metatron's Cube",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Metatron's Cube",
    element: "spirit",
    description: "Metatron alchemy uses sacred geometry for energetic clearing and coherent alignment.",
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0de529b0be19663cbdd777dec567ea6ee75a5095a0393c2c21613e9519f2fb60.png",
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
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ad522c612a029af953c2ab484613c9cd45eeb18b9b10c35ab6c4d58367a1349a.png",
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
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e3f5b33091712e74921ac9f6d1fe452e69d48d969f6229fb988ad35452d1e0bb.png",
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
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/da6c1db72712f17b387dc320ee104a0075e79c66f93cfd37d50fb7ac825ee0a4.png",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
  },
  {
    id: "angel-uriel-golden-wisdom",
    name: "Uriel Alchemy · Golden Wisdom Flame",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Solar Hexa-Radiant",
    element: "fire",
    description: "Uriel alchemy illuminates wise discernment, practical insight, and grounded revelation.",
    alchemy_teachings: [
      "Illumination must become practical application.",
      "Discernment protects sacred purpose.",
      "Wisdom is amplified by humility.",
    ],
    practical_rituals: [
      "Golden light contemplation at dawn.",
      "Decision clarity journaling with pros/values alignment.",
      "Three-breath pause before major choices.",
    ],
    journal_prompts: [
      "Where do I need clearer discernment?",
      "What insight wants practical embodiment?",
      "How can wisdom become service?",
    ],
    affirmations: [
      "I welcome clear, practical wisdom.",
      "Discernment guides my decisions.",
      "I act from illuminated truth.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/60066a885e368cb7c8c2b6daf32a4567ec4452c6539efe5b6017d30867b47439.png",
    diagram_image_url: "/diagrams/uriel-wisdom-diagram.svg",
  },
  {
    id: "angel-zadkiel-mercy-violet",
    name: "Zadkiel Alchemy · Mercy Violet Ray",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Mercy Spiral",
    element: "water",
    description: "Zadkiel alchemy supports forgiveness, compassionate release, and restorative transmutation.",
    alchemy_teachings: [
      "Mercy is strength guided by compassion.",
      "Forgiveness frees life-force for aligned action.",
      "Release is a recurring spiritual discipline.",
    ],
    practical_rituals: [
      "Violet mercy breath with hand-on-heart focus.",
      "Forgiveness letter ritual (not necessarily sent).",
      "Compassion prayer for self and others.",
    ],
    journal_prompts: [
      "What needs mercy in me right now?",
      "Where am I ready to release resentment?",
      "How can compassion restore my next step?",
    ],
    affirmations: [
      "Mercy restores my energy and heart.",
      "I release what no longer serves.",
      "Compassion is my strength.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/5a8b44e77572bc3b37f8cb02aa12d7196b35bc339e51660bcced13a3d90cab90.png",
    diagram_image_url: "/diagrams/zadkiel-mercy-diagram.svg",
  },
  {
    id: "angel-chamuel-heart-peace",
    name: "Chamuel Alchemy · Heart Peace Ray",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Heart Mandala",
    element: "air",
    description: "Chamuel alchemy supports relational peace, heart coherence, and compassionate reconnection.",
    alchemy_teachings: [
      "Peace is an active relational practice.",
      "Heart coherence improves communication quality.",
      "Repair is sacred in spiritual maturity.",
    ],
    practical_rituals: [
      "Heart coherence breathing before difficult conversations.",
      "Blessing practice for strained relationships.",
      "Peace invocation at day-end reflection.",
    ],
    journal_prompts: [
      "Where can I create more peace relationally?",
      "What conversation needs compassion and honesty?",
      "How does heart coherence feel in my body?",
    ],
    affirmations: [
      "Peace begins within my heart.",
      "I communicate with compassion and clarity.",
      "Repair and reconciliation are possible.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/547d74a395cd6aa412cdb5d4a203e1d944532856c3f6c04b673565f66b123907.png",
    diagram_image_url: "/diagrams/chamuel-heart-peace-diagram.svg",
  },
  {
    id: "angel-jophiel-illumination",
    name: "Jophiel Alchemy · Illumined Mind",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Light Prism",
    element: "air",
    description: "Jophiel alchemy clarifies perception, beautifies thought patterns, and supports elegant mental order.",
    alchemy_teachings: [
      "Beauty in thought creates beauty in action.",
      "Mental clarity is cultivated, not accidental.",
      "Grace can coexist with precision.",
    ],
    practical_rituals: [
      "Thought-clearing breath with light visualization.",
      "One-page reframing practice for cognitive clutter.",
      "Beauty walk with attentive noticing.",
    ],
    journal_prompts: [
      "Which thought patterns need refinement?",
      "How can elegance shape my actions today?",
      "What helps my mind become clear and kind?",
    ],
    affirmations: [
      "My mind is clear, kind, and luminous.",
      "I choose thoughts that support beauty and truth.",
      "Clarity and grace guide my path.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/218b88193cb16ead08e12abdc15d5e0c4c9cda5e61bb8482eda5a84c70f10f14.png",
    diagram_image_url: "/diagrams/jophiel-illumination-diagram.svg",
  },
  {
    id: "angel-haniel-lunar-grace",
    name: "Haniel Alchemy · Lunar Grace",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Lunar Spiral",
    element: "water",
    description: "Haniel alchemy restores moon intuition, feminine grace, and emotionally attuned wisdom.",
    alchemy_teachings: [
      "Sensitivity becomes strength when regulated and honored.",
      "Lunar cycles support timing and receptivity.",
      "Grace is embodied softness with clear discernment.",
    ],
    practical_rituals: [
      "Moonlight breath for 12 cycles with hand on lower belly.",
      "Lunar journaling before sleep for dream integration.",
      "Water blessing ritual with intention for emotional clarity.",
    ],
    journal_prompts: [
      "What emotional truth is surfacing now?",
      "Where does lunar timing ask me to pause?",
      "How can grace become a practical way of moving today?",
    ],
    affirmations: [
      "I trust my intuitive moon intelligence.",
      "Grace and discernment guide my path.",
      "I move in harmony with sacred timing.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e7228157cc39defd5b2971dad0b9adc537ec02ee1496eb39bc570c59a4ffa985.png",
    diagram_image_url: "/diagrams/gabriel-communication-diagram.svg",
  },
  {
    id: "angel-raziel-mystery-flame",
    name: "Raziel Alchemy · Mystery Flame",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Mystic Merkaba",
    element: "spirit",
    description: "Raziel alchemy opens divine mysteries, symbolic decoding, and advanced spiritual discernment.",
    alchemy_teachings: [
      "Mystery asks humility, patience, and disciplined inquiry.",
      "Symbol decoding reveals hidden guidance pathways.",
      "Higher knowledge must become grounded ethical action.",
    ],
    practical_rituals: [
      "Mystery book ritual: ask one question and journal three intuitive responses.",
      "Symbol contemplation with long exhale breathing.",
      "Night prayer for dream revelation and morning integration notes.",
    ],
    journal_prompts: [
      "What mystery am I being invited to study?",
      "Which symbols are repeating in my life now?",
      "How will I apply this insight practically?",
    ],
    affirmations: [
      "I welcome sacred mystery with humility.",
      "Divine intelligence reveals itself in right timing.",
      "I embody wisdom through practical integrity.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9ee90ae0ccb416c954265b0bb3b0d0d89d83178cdefb2a6fe64c6553b6bcc82f.png",
    diagram_image_url: "/diagrams/metatron-cube-diagram.svg",
  },
  {
    id: "angel-ariel-earth-guardian",
    name: "Ariel Alchemy · Earth Guardian Flame",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Gaia Spiral",
    element: "earth",
    description: "Ariel alchemy protects nature pathways, body vitality, and grounded stewardship.",
    alchemy_teachings: [
      "Earth protection is a spiritual responsibility.",
      "Body vitality and nature attunement are linked.",
      "Stewardship is devotion in action.",
    ],
    practical_rituals: [
      "Grounding ritual with feet on earth and long exhale cycles.",
      "Nature blessing prayer for local land and waters.",
      "One stewardship action weekly (cleanup, planting, protection).",
    ],
    journal_prompts: [
      "How can I protect life around me this week?",
      "What restores my body's natural vitality?",
      "Where does stewardship call me into action?",
    ],
    affirmations: [
      "I protect and serve the living Earth.",
      "My body is in harmony with nature.",
      "Stewardship is sacred practice.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6bb707c26757c1b1d639a9d0e0461d726bf8510707e86c250dff7fc845f695db.png",
    diagram_image_url: "/diagrams/oak-rootedness-diagram.svg",
  },
  {
    id: "angel-azrael-peace-transition",
    name: "Azrael Alchemy · Peaceful Transition",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Veil Mandala",
    element: "water",
    description: "Azrael alchemy supports grief integration, endings, and peaceful transitions with compassion.",
    alchemy_teachings: [
      "Endings are sacred thresholds, not failures.",
      "Grief honored becomes gentle wisdom.",
      "Compassion stabilizes transition processes.",
    ],
    practical_rituals: [
      "Candle-and-water grief ritual with spoken blessing.",
      "Compassion breath while naming what has ended.",
      "Transition journal: what is closing and what is opening.",
    ],
    journal_prompts: [
      "What ending am I still integrating?",
      "How can I meet grief with tenderness?",
      "What gentle next step supports transition?",
    ],
    affirmations: [
      "I move through endings with grace.",
      "Compassion steadies my transitions.",
      "Peace is available in change.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/660d77bc720cc8d1141cc33cc14dafb543b28e95dd65e1831bf6813c7ed59b44.png",
    diagram_image_url: "/diagrams/andromeda-perspective-diagram.svg",
  },
  {
    id: "angel-jeremiel-life-review",
    name: "Jeremiel Alchemy · Life Review Flame",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Review Spiral",
    element: "spirit",
    description: "Jeremiel alchemy supports life review, prophetic reflection, and course correction with wisdom.",
    alchemy_teachings: [
      "Review creates conscious redirection.",
      "Prophetic insight requires humility and truth.",
      "Course correction is a strength, not weakness.",
    ],
    practical_rituals: [
      "Annual reflection ritual: keep, release, and renew lists.",
      "Timeline journaling for pattern recognition.",
      "Course-correction vow spoken aloud with one immediate action.",
    ],
    journal_prompts: [
      "What pattern needs redirection now?",
      "Where am I being called to mature quickly?",
      "Which one action restores alignment today?",
    ],
    affirmations: [
      "I review my life with honesty and grace.",
      "Insight guides aligned redirection.",
      "I choose growth with clarity.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/15b99cadedda6b5f312e206abe912f1c6daf4df8df7f7536ede423e580145eea.png",
    diagram_image_url: "/diagrams/thoth-language-diagram.svg",
  },
  {
    id: "angel-sandalphon-prayer-song",
    name: "Sandalphon Alchemy · Prayer Song",
    angelic_order: "Archangel",
    category: "angelic",
    sacred_geometry: "Resonance Spiral",
    element: "air",
    description: "Sandalphon alchemy elevates prayers through sacred sound, resonance, and embodied devotion.",
    alchemy_teachings: [
      "Sound can carry prayer into coherent action.",
      "Resonance is a relational field practice.",
      "Devotion becomes stable through repetition.",
    ],
    practical_rituals: [
      "Toning practice for 7 minutes with heart focus.",
      "Prayer-writing and spoken resonance ritual.",
      "Evening gratitude chant to seal the day.",
    ],
    journal_prompts: [
      "What prayer is asking to be voiced now?",
      "How does sound change my inner state?",
      "What devotion rhythm can I sustain daily?",
    ],
    affirmations: [
      "My voice carries prayer and coherence.",
      "Sound aligns me with devotion.",
      "I live in resonant gratitude.",
    ],
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8790860ac21df32da33f17186b9f40ee60f28f6e485817271f8893704c99d2c0.png",
    diagram_image_url: "/diagrams/whale-songline-diagram.svg",
  },
];

const ANGELIC_VISUAL_OVERRIDES = {
  "angel-metatron-cube-alchemy": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/0de529b0be19663cbdd777dec567ea6ee75a5095a0393c2c21613e9519f2fb60.png",
  },
  "angel-michael-blue-flame": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/ad522c612a029af953c2ab484613c9cd45eeb18b9b10c35ab6c4d58367a1349a.png",
  },
  "angel-raphael-emerald-ray": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e3f5b33091712e74921ac9f6d1fe452e69d48d969f6229fb988ad35452d1e0bb.png",
  },
  "angel-gabriel-silver-stream": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/da6c1db72712f17b387dc320ee104a0075e79c66f93cfd37d50fb7ac825ee0a4.png",
  },
  "angel-uriel-golden-wisdom": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/60066a885e368cb7c8c2b6daf32a4567ec4452c6539efe5b6017d30867b47439.png",
  },
  "angel-zadkiel-mercy-violet": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/5a8b44e77572bc3b37f8cb02aa12d7196b35bc339e51660bcced13a3d90cab90.png",
  },
  "angel-chamuel-heart-peace": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/547d74a395cd6aa412cdb5d4a203e1d944532856c3f6c04b673565f66b123907.png",
  },
  "angel-jophiel-illumination": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/218b88193cb16ead08e12abdc15d5e0c4c9cda5e61bb8482eda5a84c70f10f14.png",
  },
  "angel-haniel-lunar-grace": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/e7228157cc39defd5b2971dad0b9adc537ec02ee1496eb39bc570c59a4ffa985.png",
  },
  "angel-raziel-mystery-flame": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/9ee90ae0ccb416c954265b0bb3b0d0d89d83178cdefb2a6fe64c6553b6bcc82f.png",
  },
  "angel-ariel-earth-guardian": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/6bb707c26757c1b1d639a9d0e0461d726bf8510707e86c250dff7fc845f695db.png",
  },
  "angel-azrael-peace-transition": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/660d77bc720cc8d1141cc33cc14dafb543b28e95dd65e1831bf6813c7ed59b44.png",
  },
  "angel-jeremiel-life-review": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/15b99cadedda6b5f312e206abe912f1c6daf4df8df7f7536ede423e580145eea.png",
  },
  "angel-sandalphon-prayer-song": {
    image_url: "https://static.prod-images.emergentagent.com/jobs/8d08d00f-8bb0-4b9c-85b6-c8a2d5f11a8a/images/8790860ac21df32da33f17186b9f40ee60f28f6e485817271f8893704c99d2c0.png",
  },
};

const mergeArchangels = (items) => {
  const incoming = Array.isArray(items) ? items : [];
  const byId = new Map(incoming.map((item) => [item?.id, item]));

  ANGELIC_FALLBACK_DATA.forEach((entry) => {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  });

  return Array.from(byId.values()).map((item) => ({
    ...item,
    ...(ANGELIC_VISUAL_OVERRIDES[item?.id] || {}),
  }));
};

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
      phase_id: "embodiment",
      title: "Phase 3 · Embodiment Practice",
      duration: "18-25 min",
      steps: buildArchangelEmbodimentPractices(item),
    },
    {
      phase_id: "integration",
      title: "Phase 4 · Integration & Service",
      duration: "24h",
      steps: [
        teachings[0] || "Apply one teaching to a real decision today.",
        prompts[0] || "Journal your clearest insight and one commitment.",
        ...buildArchangelEmbodimentTimeline(item),
      ],
    },
  ];
};

const buildArchangelEmbodimentPractices = (item) => {
  const angelName = String(item?.name || "this archangel").trim();
  return [
    `Posture invocation (4 min): lengthen spine, soften chest, and breathe into a steady stance while invoking ${angelName}.`,
    "Breath-tone cycle (8 min): 4-count inhale, 6-count exhale with one gentle vocal tone on each exhale to embody coherence.",
    "Relational rehearsal (6 min): practice one truthful sentence you need to speak today with calm and compassionate tone.",
    "Service anchor (3 min): choose one immediate act of service, repair, or integrity before ending the practice.",
  ];
};

const buildArchangelEmbodimentTimeline = () => [
  "24h embodiment check: complete one clear integrity action in communication or boundary.",
  "72h embodiment check: repeat breath-tone cycle and notice shifts in emotional regulation.",
  "7-day embodiment check: track one repeated behavior shift from your archangelic practice.",
];

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
  const [guidedPractice, setGuidedPractice] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/angelic-alchemy");
        const rows = mergeArchangels(data);
        setAngels(rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))));
      } catch (error) {
        appLogger.error("Failed loading Angelic Alchemy", error);
        setAngels(mergeArchangels(ANGELIC_FALLBACK_DATA));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [api]);

  const selectedProtocol = useMemo(() => buildArchangelMasterProtocol(selected), [selected]);

  const startAngelicGuidedPractice = (item) => {
    const protocol = buildArchangelMasterProtocol(item || {});
    const steps = protocol.flatMap((phase) => phase.steps || []).filter(Boolean);
    setGuidedPractice({
      id: `angelic-guided-${item?.id || "session"}`,
      name: `${item?.name || "Angelic Alchemy"} Guided Practice`,
      category: "angelic",
      element: item?.element || "Spirit",
      duration_minutes: 24,
      steps: steps.length > 0 ? steps : [
        item?.description || "Arrive with steady breath and open awareness.",
        "Receive one teaching and embody it physically through posture and breath.",
        "Close by speaking an affirmation and choosing one service action.",
      ],
    });
  };

  const exitAngelicGuidedPractice = () => {
    const completed = guidedPractice;
    setGuidedPractice(null);
    if (!completed) return;

    api.post("/practice-history", {
      practice_type: "angelic_alchemy",
      practice_id: completed.id,
      duration_minutes: completed.duration_minutes || 24,
      element: completed.element || "Spirit",
      notes: `Completed guided ${completed.name}`,
    })
      .then(() => toast.success("Angelic guided practice complete."))
      .catch(() => {
        // silent
      });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="angelic-alchemy-page">
      <GuidedPracticeOverlay
        practice={guidedPractice}
        stepsOverride={guidedPractice?.steps}
        onExit={exitAngelicGuidedPractice}
      />

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
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(item);
                  }
                }}
                role="button"
                tabIndex={0}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      startAngelicGuidedPractice(item);
                    }}
                    className="w-full border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/15 mt-2"
                    data-testid={`angelic-card-start-guided-${item.id}`}
                  >
                    Start Guided Practice
                  </Button>
                </div>
              </div>
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
                <SectionList title="Embodiment Practices" icon={Shield} items={buildArchangelEmbodimentPractices(selected)} testId="angelic-embodiment-practices" />
                <SectionList title="Embodiment Integration Timeline" icon={Star} items={buildArchangelEmbodimentTimeline(selected)} testId="angelic-embodiment-timeline" />
                <SectionList title="Journal Prompts" icon={Star} items={selected.journal_prompts} testId="angelic-journal-prompts" />
                <SectionList title="Affirmations" icon={Shield} items={selected.affirmations} testId="angelic-affirmations" />

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3" data-testid="angelic-guided-practice-card">
                  <p className="text-xs uppercase tracking-wider text-cyan-200 mb-2">Guided Practice</p>
                  <Button
                    onClick={() => startAngelicGuidedPractice(selected)}
                    className="w-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/30"
                    data-testid="angelic-modal-start-guided-practice-button"
                  >
                    Start Guided Practice (Voice + Timer + Ambient)
                  </Button>
                </div>

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
