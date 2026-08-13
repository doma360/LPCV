import { Clock, MapPin, ArrowRight } from "lucide-react";
import type { Professional } from "@/data/professionals";
import Button from "@/components/ui/Button";

interface PriceEstimatorProps {
  professional: Professional | null;
}

export default function PriceEstimator({ professional }: PriceEstimatorProps) {
  if (!professional) {
    return (
      <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 p-8 text-center">
        <p className="text-sm font-medium text-ink-500">
          Sélectionnez un professionnel pour voir une estimation de prix.
        </p>
      </div>
    );
  }

  const eta = Math.max(8, Math.round(professional.distanceKm * 6));

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Estimation indicative
      </p>
      <p className="mt-3 font-display text-3xl font-semibold text-ink-900">
        {professional.priceFrom.toLocaleString("fr-FR")} – {professional.priceTo.toLocaleString("fr-FR")} FCFA
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />
          {professional.distanceKm} km
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />
          ~{eta} min d'arrivée
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-600">
        {professional.name} · {professional.profession}
      </p>
      <Button to={`/professionnel/${professional.id}`} variant="primary" className="mt-5 w-full justify-center">
        Voir le profil
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
