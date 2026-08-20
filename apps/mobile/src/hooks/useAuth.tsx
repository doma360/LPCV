import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, clearTokens, getRole, setRole, setTokens } from "@/lib/api";

export type Role = "client" | "professionnel";

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photoUrl: string | null;
  notificationsActives: boolean;
}

interface Session {
  user: Utilisateur;
  role: Role;
}

interface RegisterClientInput {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
}

interface RegisterProfessionnelInput extends RegisterClientInput {
  professionId: string;
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  // true juste après une inscription réussie, le temps de montrer les slides
  // de présentation avant d'entrer dans l'appli (Volume 2 : pas après une simple connexion).
  onboardingPending: boolean;
  completerOnboarding: () => void;
  login: (identifiant: string, motDePasse: string) => Promise<void>;
  registerClient: (input: RegisterClientInput) => Promise<void>;
  registerProfessionnel: (input: RegisterProfessionnelInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Utilisateur>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthResponse = { user: Utilisateur; role: Role; accessToken: string; refreshToken: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingPending, setOnboardingPending] = useState(false);

  useEffect(() => {
    (async () => {
      const role = await getRole();
      if (role !== "client" && role !== "professionnel") {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch<Utilisateur>("/api/v1/users/me");
        setSession({ user: res.data, role });
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(identifiant: string, motDePasse: string) {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifiant, motDePasse }),
    });
    if (res.data.role !== "client" && res.data.role !== "professionnel") {
      throw new Error("Ce compte n'est pas un compte client ou professionnel");
    }
    await setTokens(res.data.accessToken, res.data.refreshToken);
    await setRole(res.data.role);
    setSession({ user: res.data.user, role: res.data.role });
  }

  async function registerClient(input: RegisterClientInput) {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ role: "client", ...input }),
    });
    await setTokens(res.data.accessToken, res.data.refreshToken);
    await setRole("client");
    setOnboardingPending(true);
    setSession({ user: res.data.user, role: "client" });
  }

  async function registerProfessionnel(input: RegisterProfessionnelInput) {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ role: "professionnel", ...input }),
    });
    await setTokens(res.data.accessToken, res.data.refreshToken);
    await setRole("professionnel");
    setOnboardingPending(true);
    setSession({ user: res.data.user, role: "professionnel" });
  }

  function completerOnboarding() {
    setOnboardingPending(false);
  }

  async function logout() {
    await clearTokens();
    setSession(null);
    setOnboardingPending(false);
  }

  function updateUser(patch: Partial<Utilisateur>) {
    setSession((prev) => (prev ? { ...prev, user: { ...prev.user, ...patch } } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        onboardingPending,
        completerOnboarding,
        login,
        registerClient,
        registerProfessionnel,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
