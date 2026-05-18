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

export const getGuidedToningIntensity = () => {
  try {
    return normalize(window.localStorage.getItem(TONING_INTENSITY_KEY));
  } catch (_) {
    return "subtle";
  }
};

export const setGuidedToningIntensity = (value) => {
  const next = normalize(value);
  try {
    window.localStorage.setItem(TONING_INTENSITY_KEY, next);
  } catch (_) {
    // ignore storage errors
  }
  return next;
};

export const getGuidedToningMultiplier = () => GUIDED_TONING_INTENSITIES[getGuidedToningIntensity()].multiplier;
