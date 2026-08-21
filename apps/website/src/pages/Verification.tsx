import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import { apiFetch, ApiError } from "@/lib/api";

interface CarteVerification {
  professionnelId: string;
  nomComplet: string;
  metier: string;
  photoUrl: string | null;
  verifie: boolean;
  membreDepuis: string;
  abonnementActif: boolean;
  palier: "MENSUEL" | "ANNUEL" | null;
  dateFin: string | null;
}

type Statut = "chargement" | "ok" | "erreur";

export default function Verification() {
  const { professionnelId } = useParams<{ professionnelId: string }>();
  const [carte, setCarte] = useState<CarteVerification | null>(null);
  const [statut, setStatut] = useState<Statut>("chargement");

  useEffect(() => {
    if (!professionnelId) return;
    setStatut("chargement");
    apiFetch<CarteVerification>(`/api/v1/verification/${professionnelId}`)
      .then((res) => {
        setCarte(res.data);
        setStatut("ok");
      })
      .catch((err) => {
        setStatut("erreur");
        if (!(err instanceof ApiError)) console.error(err);
      });
  }, [professionnelId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-100 py-16">
        <Container className="max-w-lg">
          {statut === "chargement" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden="true" />
              <p className="text-sm text-ink-500">Vérification de la carte…</p>
            </div>
          )}

          {statut === "erreur" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-12 text-center">
              <ShieldAlert className="h-10 w-10 text-ink-400" aria-hidden="true" />
              <p className="text-sm font-medium text-ink-700">
                Cette carte membre n'existe pas ou n'est plus valide.
              </p>
            </div>
          )}

          {statut === "ok" && carte && (
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
              <div
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold text-white ${
                  carte.abonnementActif ? "bg-success-600" : "bg-ink-500"
                }`}
              >
                {carte.abonnementActif ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                )}
                {carte.abonnementActif ? "Abonnement LPCV actif" : "Aucun abonnement actif"}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-base font-semibold text-white">
                    {carte.nomComplet
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink-900">{carte.nomComplet}</p>
                    <p className="text-sm text-ink-500">{carte.metier}</p>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-100 pt-6 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink-400">Statut</dt>
                    <dd className="mt-1 font-medium text-ink-900">
                      {carte.verifie ? "Profil vérifié" : "Profil non vérifié"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink-400">Membre depuis</dt>
                    <dd className="mt-1 font-medium text-ink-900">
                      {new Date(carte.membreDepuis).toLocaleDateString("fr-FR")}
                    </dd>
                  </div>
                  {carte.abonnementActif && (
                    <>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-ink-400">Formule</dt>
                        <dd className="mt-1 font-medium text-ink-900">
                          {carte.palier === "ANNUEL" ? "Annuel" : "Mensuel"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-ink-400">Valide jusqu'au</dt>
                        <dd className="mt-1 font-medium text-ink-900">
                          {carte.dateFin && new Date(carte.dateFin).toLocaleDateString("fr-FR")}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
