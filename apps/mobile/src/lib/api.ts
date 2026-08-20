import Constants from "expo-constants";
import { deleteItem, getItem, setItem } from "@/lib/storage";

// EXPO_PUBLIC_API_URL prend le dessus si défini. Sinon, en dev, on déduit
// l'IP de la machine qui fait tourner `expo start` (utile sur un appareil
// physique via Expo Go, où "localhost" désignerait le téléphone lui-même).
function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host) return `http://${host}:4000`;

  return "http://localhost:4000";
}

const API_URL = resolveApiUrl();

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: { page: number; limit: number; total: number };
}

export class ApiError extends Error {}

async function getTokens() {
  const [accessToken, refreshToken] = await Promise.all([getItem("lpcv_access"), getItem("lpcv_refresh")]);
  return { accessToken, refreshToken };
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Promise.all([setItem("lpcv_access", accessToken), setItem("lpcv_refresh", refreshToken)]);
}

export async function clearTokens() {
  await Promise.all([deleteItem("lpcv_access"), deleteItem("lpcv_refresh"), deleteItem("lpcv_role")]);
}

// /me ne renvoie pas le rôle (client vs professionnel) : on le connaît déjà
// au moment de la connexion, donc on le garde à côté des jetons plutôt que
// de le redemander au serveur.
export async function setRole(role: string) {
  await setItem("lpcv_role", role);
}

export async function getRole() {
  return getItem("lpcv_role");
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = await getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const json: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
  await setTokens(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken;
}

// Client HTTP centralisé (Volume 4 §4) : jetons stockés dans SecureStore sur
// mobile (Volume 4 §8), rafraîchissement automatique une fois sur un 401.
export async function apiFetch<T>(path: string, options: RequestInit = {}, retry = true): Promise<ApiResponse<T>> {
  const { accessToken } = await getTokens();

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
    await clearTokens();
    throw new ApiError("Session expirée");
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(json.message ?? "Erreur inconnue");
  }
  return json;
}
