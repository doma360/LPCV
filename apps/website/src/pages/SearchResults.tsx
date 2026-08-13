import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, ShieldCheck, MapPin, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { professionals } from "@/data/professionals";
import { services } from "@/data/services";

export default function SearchResults() {
  const [params] = useSearchParams();
  const metier = params.get("metier") ?? "";
  const lieu = params.get("lieu") ?? "";
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const activeService = useMemo(() => services.find((s) => s.slug === metier), [metier]);

  const results = useMemo(() => {
    return professionals.filter((pro) => {
      if (verifiedOnly && !pro.verified) return false;
      if (activeService) {
        const keyword = activeService.name.split(" ")[0].toLowerCase();
        if (!pro.profession.toLowerCase().includes(keyword)) return false;
      }
      return true;
    });
  }, [activeService, verifiedOnly]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-100 pb-20 pt-12">
        <Container>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Résultats de recherche
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            {results.length} professionnel{results.length > 1 ? "s" : ""} trouvé
            {results.length > 1 ? "s" : ""}
            {lieu && <span className="text-ink-500"> près de {lieu}</span>}
          </h1>
          {activeService && (
            <p className="mt-2 text-sm text-ink-500">
              Filtré sur : <span className="font-medium text-ink-700">{activeService.name}</span>
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setVerifiedOnly((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                verifiedOnly ? "border-brand-700 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Vérifiés uniquement
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-600">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Plus de filtres
            </span>
          </div>

          <div className="mt-8 grid gap-4">
            {results.map((pro) => (
              <div
                key={pro.id}
                className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 transition-colors hover:border-brand-200 sm:flex-row sm:items-center"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-base font-semibold text-white">
                  {pro.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{pro.name}</p>
                    {pro.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-[11px] font-semibold text-success-700">
                        <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Vérifié
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                    {pro.profession} · <MapPin className="h-3 w-3" aria-hidden="true" /> {pro.zone} ·{" "}
                    {pro.distanceKm} km
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700">
                    <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden="true" />
                    {pro.rating} <span className="text-ink-400">({pro.reviews})</span>
                  </span>
                  <span className="text-xs text-ink-500">
                    Dès {pro.priceFrom.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <Button to={`/professionnel/${pro.id}`} variant="outline" className="sm:ml-4">
                  Voir le profil
                </Button>
              </div>
            ))}
            {results.length === 0 && (
              <div className="rounded-2xl border border-dashed border-ink-200 p-12 text-center">
                <p className="text-sm font-medium text-ink-500">
                  Aucun professionnel ne correspond à votre recherche pour le moment.
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
