import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";

interface DefinitionParametre {
  cle: string;
  label: string;
  description: string;
  type: "nombre" | "texte";
  groupe: "tarification" | "abonnements" | "legal";
  valeur: string;
}

const TITRES_GROUPE: Record<DefinitionParametre["groupe"], string> = {
  tarification: "Tarification & recherche",
  abonnements: "Abonnements professionnels",
  legal: "Textes légaux",
};

export default function Parametres() {
  const [parametres, setParametres] = useState<DefinitionParametre[] | null>(null);
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DefinitionParametre[]>("/api/v1/admin/parametres").then((res) => {
      setParametres(res.data);
      setValeurs(Object.fromEntries(res.data.map((p) => [p.cle, p.valeur])));
    });
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnregistrement(true);
    setMessage(null);
    try {
      const res = await apiFetch<DefinitionParametre[]>("/api/v1/admin/parametres", {
        method: "PATCH",
        body: JSON.stringify(valeurs),
      });
      setParametres(res.data);
      setMessage("Paramètres enregistrés.");
    } finally {
      setEnregistrement(false);
    }
  }

  const groupes = (["tarification", "abonnements", "legal"] as const).map((groupe) => ({
    groupe,
    items: parametres?.filter((p) => p.groupe === groupe) ?? [],
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Paramètres de la plateforme</h1>
      <p className="mt-1 text-sm text-ink-500">
        Ces valeurs pilotent directement l'app mobile et l'API, sans déploiement de code.
      </p>

      <form onSubmit={enregistrer} className="mt-6 flex flex-col gap-8">
        {groupes.map(
          ({ groupe, items }) =>
            items.length > 0 && (
              <section key={groupe} className="rounded-2xl border border-ink-100 bg-white p-6">
                <h2 className="font-display text-base font-semibold text-ink-900">{TITRES_GROUPE[groupe]}</h2>
                <div className="mt-4 flex flex-col gap-5">
                  {items.map((p) => (
                    <div key={p.cle}>
                      <label htmlFor={p.cle} className="text-sm font-medium text-ink-800">
                        {p.label}
                      </label>
                      <p className="mt-0.5 text-xs text-ink-500">{p.description}</p>
                      {p.type === "nombre" ? (
                        <input
                          id={p.cle}
                          type="number"
                          step="any"
                          value={valeurs[p.cle] ?? ""}
                          onChange={(e) => setValeurs((v) => ({ ...v, [p.cle]: e.target.value }))}
                          className="mt-2 w-48 rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-700"
                        />
                      ) : (
                        <textarea
                          id={p.cle}
                          value={valeurs[p.cle] ?? ""}
                          onChange={(e) => setValeurs((v) => ({ ...v, [p.cle]: e.target.value }))}
                          rows={4}
                          className="mt-2 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-700"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ),
        )}

        {parametres && (
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={enregistrement}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Enregistrer
            </Button>
            {message && <span className="text-sm text-success-600">{message}</span>}
          </div>
        )}
      </form>
    </div>
  );
}
