import { getLocalItem, setLocalItem } from "./clientStorage";

export const GUIDED_NARRATION_MODE_STORAGE_KEY = "guided_narration_mode";
export const GUIDED_NARRATION_MANUAL_OVERRIDE_STORAGE_KEY = "guided_narration_manual_override";
export const GUIDED_NARRATION_MODES = {
  strict: {
    id: "strict",
    label: "Strict",
    description: "Maximum phrase variety, minimal repeated wording",
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    description: "Smoother flow with gentle phrase reuse",
  },
};

export const DEFAULT_GUIDED_NARRATION_MODE = GUIDED_NARRATION_MODES.strict.id;
const DEFAULT_CATEGORY = "general";

const CATEGORY_DEFAULTS = {
  sunrise_sunset: GUIDED_NARRATION_MODES.balanced.id,
  deep_healing: GUIDED_NARRATION_MODES.strict.id,
  general: GUIDED_NARRATION_MODES.strict.id,
};

const SUNRISE_SUNSET_KEYWORDS = [
  "sunrise",
  "sunset",
  "dawn",
  "dusk",
  "transitions",
  "golden hour",
];

const DEEP_HEALING_KEYWORDS = [
  "chakra",
  "somatic",
  "healing",
  "integration",
  "embodiment",
  "nervous system",
  "inner peace",
  "trauma",
  "regulation",
  "shadow",
];

export const normalizeGuidedNarrationMode = (value) => (
  value === GUIDED_NARRATION_MODES.balanced.id
    ? GUIDED_NARRATION_MODES.balanced.id
    : DEFAULT_GUIDED_NARRATION_MODE
);

export const getGuidedNarrationMode = () => {
  const stored = getLocalItem(GUIDED_NARRATION_MODE_STORAGE_KEY);
  return normalizeGuidedNarrationMode(stored);
};

export const setGuidedNarrationManualOverride = (enabled) => {
  setLocalItem(GUIDED_NARRATION_MANUAL_OVERRIDE_STORAGE_KEY, enabled ? "true" : "false");
};

export const isGuidedNarrationManualOverrideEnabled = () => (
  getLocalItem(GUIDED_NARRATION_MANUAL_OVERRIDE_STORAGE_KEY) === "true"
);

export const setGuidedNarrationMode = (value, options = {}) => {
  const { manual = true } = options;
  const normalized = normalizeGuidedNarrationMode(value);
  setLocalItem(GUIDED_NARRATION_MODE_STORAGE_KEY, normalized);
  setGuidedNarrationManualOverride(manual);
  return normalized;
};

export const inferGuidedNarrationCategory = ({ practiceName, practiceType, element, sourceTexts, steps } = {}) => {
  const content = [
    practiceName,
    practiceType,
    element,
    ...(Array.isArray(sourceTexts) ? sourceTexts : []),
    ...(Array.isArray(steps) ? steps : []),
  ]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");

  if (SUNRISE_SUNSET_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "sunrise_sunset";
  }
  if (DEEP_HEALING_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "deep_healing";
  }
  return DEFAULT_CATEGORY;
};

export const getCategoryDefaultNarrationMode = (category) => CATEGORY_DEFAULTS[category] || DEFAULT_GUIDED_NARRATION_MODE;

export const getEffectiveGuidedNarrationMode = (hints = {}) => {
  if (isGuidedNarrationManualOverrideEnabled()) {
    return getGuidedNarrationMode();
  }
  const category = inferGuidedNarrationCategory(hints);
  return getCategoryDefaultNarrationMode(category);
};