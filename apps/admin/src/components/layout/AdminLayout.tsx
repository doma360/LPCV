import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, MessageSquareWarning, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/verifications", label: "Vérifications", icon: ShieldCheck },
  { to: "/avis-signales", label: "Avis signalés", icon: MessageSquareWarning },
  { to: "/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col bg-brand-900 text-white">
        <div className="flex h-16 items-center gap-2 px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-400 font-display text-sm font-bold text-brand-900">
            L
          </span>
          <span className="font-display text-base font-semibold">LPCV Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-accent-400" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <link.icon className="h-4.5 w-4.5" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">
            {admin?.prenom} {admin?.nom}
          </p>
          <p className="text-xs text-white/50">{admin?.role === "SUPERVISION" ? "Supervision" : "Modération"}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-xs font-medium text-white/60 hover:text-accent-400"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
