import { appLogger } from "./logger";
import {
  DEFAULT_GUIDED_NARRATION_DURATION_MINUTES,
  normalizeGuidedNarrationDurationMinutes,
} from "./guidedNarrationSettings";

export const GUIDED_VOICE_PROFILE_KEY = "guided_voice_profile";
export const GUIDED_SPEED_OPTION_KEY = "guided_speed_option";
export const GUIDED_PRACTICE_OVERRIDE_MODE_KEY = "guided_practice_override_mode";
export const GUIDED_PRACTICE_OVERRIDES_KEY = "guided_practice_overrides";

let runtimeVoiceProfile = "feminine";
let runtimeSpeedOption = "slow";
let runtimePracticeOverrideMode = "session";
const sessionPracticeOverrides = new Map();

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

const normalizeOverrideMode = (value) => {
  const candidate = String(value || "").toLowerCase();
  return candidate === "remember" ? "remember" : "session";
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

const readPracticeOverrides = () => {
  try {
    const raw = localStorage.getItem(GUIDED_PRACTICE_OVERRIDES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    appLogger.warn("Unable to read guided practice overrides", error);
    return {};
  }
};

const writePracticeOverrides = (value) => {
  try {
    localStorage.setItem(GUIDED_PRACTICE_OVERRIDES_KEY, JSON.stringify(value));
  } catch (error) {
    appLogger.warn("Unable to persist guided practice overrides", error);
  }
};

export const getGuidedPracticeOverrideMode = () => {
  return normalizeOverrideMode(readStoredValue(GUIDED_PRACTICE_OVERRIDE_MODE_KEY, runtimePracticeOverrideMode));
};

export const setGuidedPracticeOverrideMode = (value) => {
  const next = normalizeOverrideMode(value);
  writeStoredValue(GUIDED_PRACTICE_OVERRIDE_MODE_KEY, next, (v) => {
    runtimePracticeOverrideMode = v;
  });
  return next;
};

export const getGuidedPracticePreference = (practiceKey) => {
  const key = String(practiceKey || "").trim();
  if (!key) return null;

  if (sessionPracticeOverrides.has(key)) {
    return sessionPracticeOverrides.get(key);
  }

  const remembered = readPracticeOverrides()[key];
  if (!remembered || typeof remembered !== "object") return null;

  const voiceProfile = normalizeVoiceProfile(remembered.voiceProfile);
  const speedOption = normalizeSpeedOption(remembered.speedOption);
  const narrationDurationMinutes = normalizeGuidedNarrationDurationMinutes(
    remembered.narrationDurationMinutes ?? DEFAULT_GUIDED_NARRATION_DURATION_MINUTES,
  );
  return { voiceProfile, speedOption, narrationDurationMinutes };
};

export const setGuidedPracticePreference = (practiceKey, preference, mode = "session") => {
  const key = String(practiceKey || "").trim();
  if (!key) return null;

  const normalized = {
    voiceProfile: normalizeVoiceProfile(preference?.voiceProfile),
    speedOption: normalizeSpeedOption(preference?.speedOption),
    narrationDurationMinutes: normalizeGuidedNarrationDurationMinutes(
      preference?.narrationDurationMinutes ?? DEFAULT_GUIDED_NARRATION_DURATION_MINUTES,
    ),
  };

  const normalizedMode = normalizeOverrideMode(mode);
  if (normalizedMode === "remember") {
    const remembered = readPracticeOverrides();
    remembered[key] = normalized;
    writePracticeOverrides(remembered);
    sessionPracticeOverrides.delete(key);
  } else {
    sessionPracticeOverrides.set(key, normalized);
  }

  return normalized;
};

export const clearGuidedPracticePreference = (practiceKey) => {
  const key = String(practiceKey || "").trim();
  if (!key) return;

  sessionPracticeOverrides.delete(key);
  const remembered = readPracticeOverrides();
  if (remembered[key]) {
    delete remembered[key];
    writePracticeOverrides(remembered);
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
  if (explicitVoice) {
    const candidate = String(explicitVoice).toLowerCase();
    if (GUIDED_VOICE_PROFILES[candidate]) {
      return GUIDED_VOICE_PROFILES[candidate].voice;
    }

    const directVoiceMatch = Object.values(GUIDED_VOICE_PROFILES).find((profile) => profile.voice === candidate);
    if (directVoiceMatch) {
      return directVoiceMatch.voice;
    }

    return candidate;
  }
  const profile = getGuidedVoiceProfile();
  return GUIDED_VOICE_PROFILES[profile].voice;
};

export const resolveGuidedSpeedValue = (explicitOption) => {
  const option = explicitOption ? normalizeSpeedOption(explicitOption) : getGuidedSpeedOption();
  return GUIDED_SPEED_OPTIONS[option].speed;
};
