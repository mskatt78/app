const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(/\n|•|\.|;/)
    .map((item) => item.trim())
    .filter((item) => item.length > 8);
};

export const composeDeepGuidedNarration = ({
  title,
  element = "Spirit",
  description,
  teachings = [],
  rituals = [],
  ceremonies = [],
  embodiment = [],
  integration = [],
  invocation,
  closing,
}) => {
  const teachingLines = toList(teachings);
  const ritualLines = toList(rituals);
  const ceremonyLines = toList(ceremonies);
  const embodimentLines = toList(embodiment);
  const integrationLines = toList(integration);

  return [
    `Welcome to ${title}. This is a guided ${element} ritual transmission.`,
    invocation || "Place one hand on your heart and one hand on your lower belly. Let your breath lengthen naturally.",
    description,
    "Now we move into the teaching transmission. Listen as if the ritual is being offered directly to your body.",
    ...teachingLines,
    "Begin the ceremonial sequence. Go slowly. Feel each instruction in sensation, breath, and posture.",
    ...ritualLines,
    ...ceremonyLines,
    "Anchor the medicine through embodied integration.",
    ...embodimentLines,
    ...integrationLines,
    closing || "Close with gratitude. Name one concrete action you will carry into daily life, and seal this ritual with three conscious breaths.",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const ritualDeliveryPillars = [
  "Somatic orientation: track breath, jaw, chest, belly, and feet through each phase.",
  "Energetic containment: pause between steps so the body can receive and integrate.",
  "Vocal enactment: speak invocations and affirmations aloud to encode embodiment.",
  "Integration seal: end with one grounded action in ordinary life within 24 hours.",
];
