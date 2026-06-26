import { appLogger } from "./logger";

export const GUIDED_VOICE_PROFILE_KEY = "guided_voice_profile";
export const GUIDED_SPEED_OPTION_KEY = "guided_speed_option";

let runtimeVoiceProfile = "feminine";
let runtimeSpeedOption = "slow";

export const GUIDED_VOICE_PROFILES = {
  feminine: {
    id: "feminine",
    label: "Feminine (Soft)",
    description: "Gentle and soothing feminine tone.",
    voice: "shimmer",
  },
  masculine: {
    id: "masculine",
    label: "Masculine (Grounded)",
    description: "Deep grounded masculine tone.",
    voice: "onyx",
  },
  balanced: {
    id: "balanced",
    label: "Balanced (Neutral)",
    description: "Calm neutral tone.",
    voice: "nova",
  },
};

export const GUIDED_SPEED_OPTIONS = {
  slow: {
    id: "slow",
    label: "Slow",
    description: "Calmer pacing for deeper settling.",
    speed: 0.8,
  },
  normal: {
    id: "normal",
    label: "Normal",
    description: "Balanced pacing.",
    speed: 0.9,
  },
  fast: {
    id: "fast",
    label: "Fast",
    description: "Slightly quicker pacing.",
    speed: 1.0,
  },
};

const normalizeVoiceProfile = (value) => {
  const candidate = String(value || "").toLowerCase();
  return GUIDED_VOICE_PROFILES[candidate] ? candidate : "feminine";
};

const normalizeSpeedOption = (value) => {
  const candidate = String(value || "").toLowerCase();
  return GUIDED_SPEED_OPTIONS[candidate] ? candidate : "slow";
};

const readCookie = (key) => {
  try {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedKey}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch (error) {
    appLogger.warn("Unable to read guided voice preference cookie", error);
    return null;
  }
};

const writeCookie = (key, value) => {
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${key}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  } catch (error) {
    appLogger.warn("Unable to save guided voice preference cookie", error);
  }
};

const readStoredValue = (key, runtimeValue) => {
  const cookieValue = readCookie(key);
  if (cookieValue) return cookieValue;
  return runtimeValue;
};

const writeStoredValue = (key, value, runtimeSetter) => {
  runtimeSetter(value);
  writeCookie(key, value);
  try {
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: value }));
  } catch {
    // noop
  }
};

export const getGuidedVoiceProfile = () => {
  return normalizeVoiceProfile(readStoredValue(GUIDED_VOICE_PROFILE_KEY, runtimeVoiceProfile));
};

export const setGuidedVoiceProfile = (value) => {
  const next = normalizeVoiceProfile(value);
  writeStoredValue(GUIDED_VOICE_PROFILE_KEY, next, (v) => {
    runtimeVoiceProfile = v;
  });
  return next;
};

export const getGuidedSpeedOption = () => {
  return normalizeSpeedOption(readStoredValue(GUIDED_SPEED_OPTION_KEY, runtimeSpeedOption));
};

export const setGuidedSpeedOption = (value) => {
  const next = normalizeSpeedOption(value);
  writeStoredValue(GUIDED_SPEED_OPTION_KEY, next, (v) => {
    runtimeSpeedOption = v;
  });
  return next;
};

export const resolveGuidedVoiceId = (explicitVoice) => {
  if (explicitVoice) return String(explicitVoice);
  const profile = getGuidedVoiceProfile();
  return GUIDED_VOICE_PROFILES[profile].voice;
};

export const resolveGuidedSpeedValue = () => {
  const option = getGuidedSpeedOption();
  return GUIDED_SPEED_OPTIONS[option].speed;
};
