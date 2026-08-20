import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div className="grid h-screen place-items-center text-sm text-ink-500">Chargement...</div>;
  }
  if (!admin) return <Navigate to="/connexion" replace />;

  return <>{children}</>;
}
