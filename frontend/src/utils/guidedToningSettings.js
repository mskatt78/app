const TONING_INTENSITY_KEY = "guided_toning_intensity";

export const GUIDED_TONING_INTENSITIES = {
  off: {
    id: "off",
    label: "Off",
    description: "No drone layer. Only spoken guidance plays.",
    multiplier: 0,
  },
  subtle: {
    id: "subtle",
    label: "Subtle",
    description: "Soft resonance under the voice for gentle grounding.",
    multiplier: 1,
  },
  immersive: {
    id: "immersive",
    label: "Immersive",
    description: "Deeper resonance with stronger presence under narration.",
    multiplier: 1.75,
  },
};

const normalize = (value) => {
  const candidate = String(value || "").toLowerCase();
  return GUIDED_TONING_INTENSITIES[candidate] ? candidate : "subtle";
};

const storageKey = TONING_INTENSITY_KEY;

const readStoredValue = () => {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch (error) {
    console.warn("Unable to read guided toning preference from session storage:", error);
    return null;
  }
};

const writeStoredValue = (value) => {
  try {
    window.sessionStorage.setItem(storageKey, value);
  } catch (error) {
    console.warn("Unable to save guided toning preference to session storage:", error);
  }
};

export const getGuidedToningIntensity = () => {
  return normalize(readStoredValue());
};

export const setGuidedToningIntensity = (value) => {
  const next = normalize(value);
  writeStoredValue(next);
  return next;
};

export const getGuidedToningMultiplier = () => GUIDED_TONING_INTENSITIES[getGuidedToningIntensity()].multiplier;
