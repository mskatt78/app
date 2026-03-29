export const getStoredAdminToken = () => localStorage.getItem("admin_token");

export const clearStoredAdminToken = () => localStorage.removeItem("admin_token");

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
  localStorage.setItem("admin_token", data.token);
  return data.token;
}