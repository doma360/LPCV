const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export class ApiError extends Error {}

// Client public minimal : le site vitrine n'a pas de session (pas de jetons,
// pas de rafraîchissement) — uniquement des endpoints publics comme /vitrine
// ou /verification.
export async function apiFetch<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(json.message ?? "Erreur inconnue");
  }
  return json;
}
