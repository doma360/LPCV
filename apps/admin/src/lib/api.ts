const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: { page: number; limit: number; total: number };
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function getTokens() {
  return {
    accessToken: localStorage.getItem("lpcv_admin_access"),
    refreshToken: localStorage.getItem("lpcv_admin_refresh"),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("lpcv_admin_access", accessToken);
  localStorage.setItem("lpcv_admin_refresh", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("lpcv_admin_access");
  localStorage.removeItem("lpcv_admin_refresh");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
  setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

// Client HTTP centralisé (Volume 4 §4) : gère l'en-tête d'auth et rafraîchit
// le jeton une fois automatiquement sur un 401 avant d'abandonner.
export async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<ApiResponse<T>> {
  const { accessToken } = getTokens();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, options, false);
    clearTokens();
    throw new ApiError("Session expirée");
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(json.message ?? "Erreur inconnue");
  }
  return json;
}
