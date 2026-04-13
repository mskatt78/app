export const getStoredAdminToken = () => null;

export const setStoredAdminToken = () => {};

export const clearStoredAdminToken = () => {};

export async function ensureAdminToken(apiBase) {
  const existingSession = await fetch(`${apiBase}/api/admin/collections`, {
    method: "GET",
    credentials: "include",
  });

  if (existingSession.ok) {
    return "cookie-admin-session";
  }

  const response = await fetch(`${apiBase}/api/admin/session-login`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("admin-session-login-failed");
  }

  return "cookie-admin-session";
}

export async function logoutAdminSession(apiBase) {
  await fetch(`${apiBase}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}
