import { appLogger } from "./logger";

const TONING_INTENSITY_KEY = "guided_toning_intensity";
let runtimeToningIntensity = "off";

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
    multiplier: 0.55,
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
  return GUIDED_TONING_INTENSITIES[candidate] ? candidate : "off";
};

const storageKey = TONING_INTENSITY_KEY;

const readCookie = (key) => {
  try {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedKey}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    appLogger.warn("Unable to read guided toning preference cookie", error);
    return null;
  }
};

const writeCookie = (key, value) => {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  } catch (error) {
    appLogger.warn("Unable to save guided toning preference cookie", error);
  }
};

const readStoredValue = () => {
  const cookieValue = readCookie(storageKey);
  if (cookieValue) return cookieValue;
  return runtimeToningIntensity;
};

const writeStoredValue = (value) => {
  runtimeToningIntensity = value;
  writeCookie(storageKey, value);
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
