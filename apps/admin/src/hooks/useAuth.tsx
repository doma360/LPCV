import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, clearTokens, setTokens } from "@/lib/api";

interface Administrateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "SUPERVISION" | "MODERATION";
}

interface AuthContextValue {
  admin: Administrateur | null;
  loading: boolean;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Administrateur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Administrateur>("/api/v1/users/me")
      .then((res) => setAdmin(res.data))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(identifiant: string, motDePasse: string) {
    const res = await apiFetch<{
      user: Administrateur;
      role: string;
      accessToken: string;
      refreshToken: string;
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifiant, motDePasse }),
    });

    if (res.data.role !== "administrateur") {
      throw new Error("Ce compte n'est pas un compte administrateur");
    }

    setTokens(res.data.accessToken, res.data.refreshToken);
    setAdmin(res.data.user);
  }

  function logout() {
    clearTokens();
    setAdmin(null);
  }

  return <AuthContext.Provider value={{ admin, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
