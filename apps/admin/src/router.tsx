import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Verifications from "@/pages/Verifications";
import AvisSignales from "@/pages/AvisSignales";
import Utilisateurs from "@/pages/Utilisateurs";
import Parametres from "@/pages/Parametres";

function Proteger(children: ReactNode) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/connexion" element={<Login />} />
          <Route path="/" element={Proteger(<Dashboard />)} />
          <Route path="/verifications" element={Proteger(<Verifications />)} />
          <Route path="/avis-signales" element={Proteger(<AvisSignales />)} />
          <Route path="/utilisateurs" element={Proteger(<Utilisateurs />)} />
          <Route path="/parametres" element={Proteger(<Parametres />)} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
