import { useEffect, useState } from "react";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";

type Type = "client" | "professionnel";

interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "ACTIF" | "SUSPENDU";
  createdAt: string;
  derniereConnexionAt: string | null;
  profession?: { nom: string };
}

const LIMIT = 20;

export default function Utilisateurs() {
  const [type, setType] = useState<Type>("client");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[] | null>(null);
  const [total, setTotal] = useState(0);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const params = new URLSearchParams({ type, page: String(page), limit: String(LIMIT) });
    if (q.trim()) params.set("q", q.trim());
    const res = await apiFetch<Utilisateur[]>(`/api/v1/admin/utilisateurs?${params}`);
    setUtilisateurs(res.data);
    setTotal(res.pagination?.total ?? 0);
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page]);

  function rechercher(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    charger();
  }

  async function toggleStatut(u: Utilisateur) {
    setEnCours(u.id);
    const nouveauStatut = u.statut === "ACTIF" ? "SUSPENDU" : "ACTIF";
    try {
      await apiFetch(`/api/v1/admin/utilisateurs/${type}/${u.id}/statut`, {
        method: "PATCH",
        body: JSON.stringify({ statut: nouveauStatut }),
      });
      setUtilisateurs((prev) => prev?.map((item) => (item.id === u.id ? { ...item, statut: nouveauStatut } : item)) ?? null);
    } finally {
      setEnCours(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Utilisateurs</h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
          {(["client", "professionnel"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setPage(1);
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                type === t ? "bg-brand-900 text-accent-400" : "text-ink-600 hover:text-brand-700"
              }`}
            >
              {t === "client" ? "Clients" : "Professionnels"}
            </button>
          ))}
        </div>

        <form onSubmit={rechercher} className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nom, email, téléphone..."
              className="w-64 rounded-lg border border-ink-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-700"
            />
          </div>
          <Button type="submit" variant="outline">
            Rechercher
          </Button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">Nom</th>
              <th className="px-5 py-3">Contact</th>
              {type === "professionnel" && <th className="px-5 py-3">Métier</th>}
              <th className="px-5 py-3">Inscrit le</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {utilisateurs?.map((u) => (
              <tr key={u.id} className="border-t border-ink-100">
                <td className="px-5 py-3 font-medium text-ink-900">
                  {u.prenom} {u.nom}
                </td>
                <td className="px-5 py-3 text-ink-600">
                  <div>{u.email}</div>
                  <div className="text-xs text-ink-400">{u.telephone}</div>
                </td>
                {type === "professionnel" && <td className="px-5 py-3 text-ink-600">{u.profession?.nom}</td>}
                <td className="px-5 py-3 text-ink-500">{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      u.statut === "ACTIF" ? "bg-success-500/10 text-success-500" : "bg-danger-500/10 text-danger-500"
                    }`}
                  >
                    {u.statut === "ACTIF" ? "Actif" : "Suspendu"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    variant={u.statut === "ACTIF" ? "danger" : "outline"}
                    disabled={enCours === u.id}
                    onClick={() => toggleStatut(u)}
                  >
                    {u.statut === "ACTIF" ? (
                      <>
                        <ShieldBan className="h-4 w-4" aria-hidden="true" />
                        Suspendre
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Réactiver
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {utilisateurs?.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-ink-400" colSpan={type === "professionnel" ? 6 : 5}>
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > LIMIT && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
          <span>
            Page {page} / {totalPages} · {total} résultat(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Précédent
            </Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
