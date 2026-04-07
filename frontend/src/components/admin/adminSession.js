const ADMIN_TOKEN_KEY = "admin_token";

const getSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getStoredAdminToken = () => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  const sessionToken = sessionStorage?.getItem(ADMIN_TOKEN_KEY);
  if (sessionToken) return sessionToken;

  // Backward-compatible migration from localStorage -> sessionStorage
  const legacyToken = localStorage?.getItem(ADMIN_TOKEN_KEY);
  if (legacyToken && sessionStorage) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, legacyToken);
    localStorage?.removeItem(ADMIN_TOKEN_KEY);
    return legacyToken;
  }
  return legacyToken || null;
};

export const setStoredAdminToken = (token) => {
  if (!token) return;
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  sessionStorage?.setItem(ADMIN_TOKEN_KEY, token);
  localStorage?.removeItem(ADMIN_TOKEN_KEY);
};

export const clearStoredAdminToken = () => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  sessionStorage?.removeItem(ADMIN_TOKEN_KEY);
  localStorage?.removeItem(ADMIN_TOKEN_KEY);
};

export async function ensureAdminToken(apiBase) {
  const existing = getStoredAdminToken();
  if (existing) return existing;

  const response = await fetch(`${apiBase}/api/admin/session-login`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("admin-session-login-failed");
  }

  const data = await response.json();
  setStoredAdminToken(data.token);
  return data.token;
}