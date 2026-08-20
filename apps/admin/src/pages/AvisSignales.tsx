import { useEffect, useState } from "react";
import { Star, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";

interface AvisSignale {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  client: { nom: string; prenom: string };
  professionnel: { nom: string; prenom: string };
}

export default function AvisSignales() {
  const [avis, setAvis] = useState<AvisSignale[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const res = await apiFetch<AvisSignale[]>("/api/v1/admin/avis-signales");
    setAvis(res.data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function decider(id: string, decision: "APPROUVE" | "MASQUE") {
    setEnCours(id);
    try {
      await apiFetch(`/api/v1/admin/avis-signales/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      });
      setAvis((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Avis signalés</h1>
      <p className="mt-1 text-sm text-ink-500">
        Un avis signalé est masqué du profil public en attendant votre décision.
      </p>

      <div className="mt-6 space-y-4">
        {avis?.length === 0 && (
          <p className="rounded-xl border border-ink-100 bg-white px-5 py-8 text-center text-sm text-ink-400">
            Aucun avis signalé.
          </p>
        )}

        {avis?.map((item) => (
          <div key={item.id} className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-semibold text-ink-900">
                    {item.client.prenom} {item.client.nom}
                  </p>
                  <span className="text-ink-300">→</span>
                  <p className="text-sm text-ink-600">
                    {item.professionnel.prenom} {item.professionnel.nom}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < item.note ? "fill-accent-400 text-accent-400" : "text-ink-200"}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-ink-400">Le {new Date(item.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={enCours === item.id}
                  onClick={() => decider(item.id, "APPROUVE")}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Rejeter le signalement
                </Button>
                <Button variant="danger" disabled={enCours === item.id} onClick={() => decider(item.id, "MASQUE")}>
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                  Masquer définitivement
                </Button>
              </div>
            </div>

            {item.commentaire && <p className="mt-4 text-sm text-ink-700">« {item.commentaire} »</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
