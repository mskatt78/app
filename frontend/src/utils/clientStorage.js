const safeSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const safeLocalStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getSessionItem = (key) => safeSessionStorage()?.getItem(key) || null;
export const setSessionItem = (key, value) => safeSessionStorage()?.setItem(key, value);
export const removeSessionItem = (key) => safeSessionStorage()?.removeItem(key);

export const getLocalItem = (key) => safeLocalStorage()?.getItem(key) || null;
export const setLocalItem = (key, value) => safeLocalStorage()?.setItem(key, value);
export const removeLocalItem = (key) => safeLocalStorage()?.removeItem(key);

export const migrateLocalToSession = (key) => {
  const existingSessionValue = getSessionItem(key);
  if (existingSessionValue) return existingSessionValue;

  const legacyValue = getLocalItem(key);
  if (legacyValue) {
    setSessionItem(key, legacyValue);
    removeLocalItem(key);
    return legacyValue;
  }
  return null;
};

export const getAuthToken = () => getSessionItem("auth_token") || migrateLocalToSession("auth_token");
export const isLoggedIn = () => Boolean(getAuthToken());
