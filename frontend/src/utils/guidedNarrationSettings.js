import { getLocalItem, setLocalItem } from "./clientStorage";

export const GUIDED_NARRATION_MODE_STORAGE_KEY = "guided_narration_mode";
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

export const normalizeGuidedNarrationMode = (value) => (
  value === GUIDED_NARRATION_MODES.balanced.id
    ? GUIDED_NARRATION_MODES.balanced.id
    : DEFAULT_GUIDED_NARRATION_MODE
);

export const getGuidedNarrationMode = () => {
  const stored = getLocalItem(GUIDED_NARRATION_MODE_STORAGE_KEY);
  return normalizeGuidedNarrationMode(stored);
};

export const setGuidedNarrationMode = (value) => {
  const normalized = normalizeGuidedNarrationMode(value);
  setLocalItem(GUIDED_NARRATION_MODE_STORAGE_KEY, normalized);
  return normalized;
};