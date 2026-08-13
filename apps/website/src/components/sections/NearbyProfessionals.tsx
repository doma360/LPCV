import { useState } from "react";
import { Star, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";
import NearbyMap from "@/components/sections/NearbyMap";
import PriceEstimator from "@/components/sections/PriceEstimator";
import { professionals, type Professional } from "@/data/professionals";

export default function NearbyProfessionals() {
  const [selected, setSelected] = useState<Professional | null>(null);

  return (
    <Section className="bg-white">
      <Container>
        <Heading eyebrow="Près de chez vous" align="center">
          Des artisans déjà disponibles dans votre quartier
        </Heading>
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <FadeUp className="space-y-3">
            {professionals.map((pro) => {
              const active = selected?.id === pro.id;
              return (
                <button
                  key={pro.id}
                  type="button"
                  onClick={() => setSelected(pro)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    active ? "border-brand-600 bg-brand-50" : "border-ink-100 bg-white hover:border-brand-200"
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-sm font-semibold text-white">
                    {pro.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-ink-900">{pro.name}</p>
                      {pro.verified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success-600" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {pro.profession} · {pro.zone} · {pro.distanceKm} km
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent-700">
                    <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden="true" />
                    {pro.rating}
                  </div>
                </button>
              );
            })}
          </FadeUp>
          <FadeUp delay={0.1} className="space-y-5">
            <NearbyMap selectedId={selected?.id ?? null} />
            <PriceEstimator professional={selected} />
          </FadeUp>
        </div>
      </Container>
    </Section>
  );
}
