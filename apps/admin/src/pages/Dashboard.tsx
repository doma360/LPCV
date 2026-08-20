import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, Activity, MessageSquareWarning } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Stats {
  totalClients: number;
  totalProfessionnels: number;
  enAttenteVerification: number;
  demandesActives: number;
  avisSignales: number;
  activiteRecente: { id: string; statut: string; createdAt: string; profession: { nom: string } }[];
}

const statutLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  EN_ROUTE: "En route",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
  REFUSEE: "Refusée",
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/v1/admin/stats").then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        { label: "Clients", value: stats.totalClients, icon: Users },
        { label: "Professionnels", value: stats.totalProfessionnels, icon: Users },
        { label: "En attente de vérification", value: stats.enAttenteVerification, icon: ShieldCheck, alert: stats.enAttenteVerification > 0 },
        { label: "Demandes actives", value: stats.demandesActives, icon: Activity },
        { label: "Avis signalés", value: stats.avisSignales, icon: MessageSquareWarning, alert: stats.avisSignales > 0 },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Tableau de bord</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-ink-100 bg-white p-5">
            <card.icon className={`h-5 w-5 ${card.alert ? "text-danger-500" : "text-brand-700"}`} aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{card.value}</p>
            <p className="mt-1 text-xs text-ink-500">{card.label}</p>
          </div>
        ))}
      </div>

      {stats && stats.enAttenteVerification > 0 && (
        <Link
          to="/verifications"
          className="mt-6 flex items-center justify-between rounded-xl border border-accent-300 bg-accent-50 px-5 py-4 text-sm font-medium text-brand-900 hover:bg-accent-100"
        >
          {stats.enAttenteVerification} professionnel(s) en attente de vérification
          <span aria-hidden="true">→</span>
        </Link>
      )}

      <h2 className="mt-10 font-display text-lg font-semibold text-ink-900">Activité récente</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Métier</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Créée le</th>
            </tr>
          </thead>
          <tbody>
            {stats?.activiteRecente.map((demande) => (
              <tr key={demande.id} className="border-t border-ink-100">
                <td className="px-5 py-3 text-ink-900">{demande.profession.nom}</td>
                <td className="px-5 py-3 text-ink-600">{statutLabels[demande.statut] ?? demande.statut}</td>
                <td className="px-5 py-3 text-ink-500">{new Date(demande.createdAt).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
            {stats?.activiteRecente.length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-ink-400" colSpan={3}>
                  Aucune demande pour l'instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
