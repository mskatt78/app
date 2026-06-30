import { getLocalItem, setLocalItem } from "./clientStorage";

export const GUIDED_NARRATION_MODE_STORAGE_KEY = "guided_narration_mode";
export const GUIDED_NARRATION_MANUAL_OVERRIDE_STORAGE_KEY = "guided_narration_manual_override";
export const GUIDED_NARRATION_DURATION_BY_MODALITY_STORAGE_KEY = "guided_narration_duration_by_modality";
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
export const GUIDED_NARRATION_MIN_MINUTES = 7;
export const GUIDED_NARRATION_MAX_MINUTES = 20;
export const DEFAULT_GUIDED_NARRATION_DURATION_MINUTES = 15;

export const GUIDED_NARRATION_MODALITY_CONFIG = {
  general: {
    id: "general",
    label: "General Guided",
    description: "Default profile for most guided practices.",
  },
  sunrise_sunset: {
    id: "sunrise_sunset",
    label: "Sunrise & Sunset",
    description: "Morning/evening transitions and circadian ritual flows.",
  },
  deep_healing: {
    id: "deep_healing",
    label: "Deep Healing",
    description: "Trauma-aware, somatic, and therapeutic healing journeys.",
  },
  movement_breathwork: {
    id: "movement_breathwork",
    label: "Movement & Breathwork",
    description: "Breath-led movement, yoga, and regulation flows.",
  },
  ceremonial_journey: {
    id: "ceremonial_journey",
    label: "Ceremonial Journey",
    description: "Shamanic, mystery, and initiatory ceremonial pathways.",
  },
};

const GUIDED_NARRATION_DURATION_PRESETS = [7, 10, 12, 15, 18, 20];
export const GUIDED_NARRATION_DURATION_PRESET_OPTIONS = GUIDED_NARRATION_DURATION_PRESETS.map((minutes) => ({
  id: `duration-${minutes}`,
  minutes,
  value: String(minutes),
  label: `${minutes} min`,
  description: `${minutes}-minute narration target`,
}));

const CATEGORY_DEFAULTS = {
  sunrise_sunset: GUIDED_NARRATION_MODES.balanced.id,
  deep_healing: GUIDED_NARRATION_MODES.strict.id,
  movement_breathwork: GUIDED_NARRATION_MODES.balanced.id,
  ceremonial_journey: GUIDED_NARRATION_MODES.strict.id,
  general: GUIDED_NARRATION_MODES.strict.id,
};

const DURATION_MODALITY_DEFAULTS = {
  sunrise_sunset: 10,
  deep_healing: 18,
  movement_breathwork: 12,
  ceremonial_journey: 20,
  general: DEFAULT_GUIDED_NARRATION_DURATION_MINUTES,
};

const SUNRISE_SUNSET_KEYWORDS = [
  "sunrise",
  "sunset",
  "dawn",
  "dusk",
  "transitions",
  "golden hour",
];

const MOVEMENT_BREATHWORK_KEYWORDS = [
  "breathwork",
  "breath",
  "somatic",
  "movement",
  "fascia",
  "yoga",
  "mudra",
  "mantra",
  "flow",
  "pose",
  "stretch",
];

const CEREMONIAL_JOURNEY_KEYWORDS = [
  "shamanic",
  "ceremony",
  "mystery",
  "ritual",
  "initiation",
  "lineage",
  "altar",
  "oracle",
  "ancestor",
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
  if (CEREMONIAL_JOURNEY_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "ceremonial_journey";
  }
  if (DEEP_HEALING_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "deep_healing";
  }
  if (MOVEMENT_BREATHWORK_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "movement_breathwork";
  }
  return DEFAULT_CATEGORY;
};

export const getCategoryDefaultNarrationMode = (category) => CATEGORY_DEFAULTS[category] || DEFAULT_GUIDED_NARRATION_MODE;

const clampNarrationMinutes = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_GUIDED_NARRATION_DURATION_MINUTES;
  const rounded = Math.round(numeric);
  return Math.max(GUIDED_NARRATION_MIN_MINUTES, Math.min(GUIDED_NARRATION_MAX_MINUTES, rounded));
};

export const normalizeGuidedNarrationDurationMinutes = (value) => {
  const clamped = clampNarrationMinutes(value);
  return GUIDED_NARRATION_DURATION_PRESETS.reduce((closest, candidate) => {
    if (Math.abs(candidate - clamped) < Math.abs(closest - clamped)) return candidate;
    return closest;
  }, DEFAULT_GUIDED_NARRATION_DURATION_MINUTES);
};

export const getGuidedNarrationDurationPresetOptions = ({ minMinutes = GUIDED_NARRATION_MIN_MINUTES, maxMinutes = GUIDED_NARRATION_MAX_MINUTES } = {}) => {
  return GUIDED_NARRATION_DURATION_PRESET_OPTIONS.filter((option) => option.minutes >= minMinutes && option.minutes <= maxMinutes);
};

const normalizeNarrationDurationMap = (value) => {
  const candidate = value && typeof value === "object" ? value : {};
  return Object.fromEntries(
    Object.keys(GUIDED_NARRATION_MODALITY_CONFIG).map((modalityId) => {
      const fallback = DURATION_MODALITY_DEFAULTS[modalityId] || DEFAULT_GUIDED_NARRATION_DURATION_MINUTES;
      return [modalityId, normalizeGuidedNarrationDurationMinutes(candidate[modalityId] ?? fallback)];
    }),
  );
};

export const getGuidedNarrationDurationByModality = () => {
  try {
    const raw = getLocalItem(GUIDED_NARRATION_DURATION_BY_MODALITY_STORAGE_KEY);
    if (!raw) {
      return normalizeNarrationDurationMap({});
    }
    return normalizeNarrationDurationMap(JSON.parse(raw));
  } catch {
    return normalizeNarrationDurationMap({});
  }
};

export const setGuidedNarrationDurationForModality = (modality, minutes) => {
  const normalizedModality = GUIDED_NARRATION_MODALITY_CONFIG[modality] ? modality : DEFAULT_CATEGORY;
  const normalizedMinutes = normalizeGuidedNarrationDurationMinutes(minutes);
  const nextMap = {
    ...getGuidedNarrationDurationByModality(),
    [normalizedModality]: normalizedMinutes,
  };
  setLocalItem(GUIDED_NARRATION_DURATION_BY_MODALITY_STORAGE_KEY, JSON.stringify(nextMap));
  return nextMap;
};

export const getGuidedNarrationDurationForModality = (modality) => {
  const normalizedModality = GUIDED_NARRATION_MODALITY_CONFIG[modality] ? modality : DEFAULT_CATEGORY;
  const map = getGuidedNarrationDurationByModality();
  return normalizeGuidedNarrationDurationMinutes(map[normalizedModality]);
};

export const getEffectiveGuidedNarrationDurationMinutes = (hints = {}) => {
  const category = inferGuidedNarrationCategory(hints);
  return getGuidedNarrationDurationForModality(category);
};

export const getEffectiveGuidedNarrationMode = (hints = {}) => {
  if (isGuidedNarrationManualOverrideEnabled()) {
    return getGuidedNarrationMode();
  }
  const category = inferGuidedNarrationCategory(hints);
  return getCategoryDefaultNarrationMode(category);
};