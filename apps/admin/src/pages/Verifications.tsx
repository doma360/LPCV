import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";

interface Professionnel {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  presentation: string | null;
  documentsUrls: string[];
  createdAt: string;
  profession: { nom: string };
}

export default function Verifications() {
  const [professionnels, setProfessionnels] = useState<Professionnel[] | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  async function charger() {
    const res = await apiFetch<Professionnel[]>("/api/v1/admin/professionnels/en-attente");
    setProfessionnels(res.data);
  }

  useEffect(() => {
    charger();
  }, []);

  async function decider(id: string, decision: "VERIFIE" | "REFUSE") {
    setEnCours(id);
    try {
      await apiFetch(`/api/v1/admin/verifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision }),
      });
      setProfessionnels((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Vérifications</h1>
      <p className="mt-1 text-sm text-ink-500">
        Un professionnel n'apparaît dans la recherche de l'application qu'après validation ici.
      </p>

      <div className="mt-6 space-y-4">
        {professionnels?.length === 0 && (
          <p className="rounded-xl border border-ink-100 bg-white px-5 py-8 text-center text-sm text-ink-400">
            Aucun professionnel en attente.
          </p>
        )}

        {professionnels?.map((pro) => (
          <div key={pro.id} className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-base font-semibold text-ink-900">
                  {pro.prenom} {pro.nom}
                </p>
                <p className="text-sm text-ink-500">{pro.profession.nom}</p>
                <p className="mt-2 text-xs text-ink-500">
                  {pro.email} · {pro.telephone}
                </p>
                <p className="text-xs text-ink-400">
                  Inscrit le {new Date(pro.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={enCours === pro.id}
                  onClick={() => decider(pro.id, "REFUSE")}
                  className="border-danger-500 text-danger-500 hover:bg-danger-100"
                >
                  <ShieldX className="h-4 w-4" aria-hidden="true" />
                  Refuser
                </Button>
                <Button variant="primary" disabled={enCours === pro.id} onClick={() => decider(pro.id, "VERIFIE")}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Vérifier
                </Button>
              </div>
            </div>

            {pro.presentation && <p className="mt-4 text-sm text-ink-700">{pro.presentation}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {pro.documentsUrls.length === 0 && (
                <span className="text-xs italic text-ink-400">Aucun document de vérification fourni.</span>
              )}
              {pro.documentsUrls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-700 hover:text-brand-700"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Document
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
