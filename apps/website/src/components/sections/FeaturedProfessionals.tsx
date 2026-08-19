import { Star, ShieldCheck, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import FadeUp from "@/components/ui/FadeUp";
import { professionals } from "@/data/professionals";

export default function FeaturedProfessionals() {
  return (
    <Section className="bg-cream-100">
      <Container>
        <Heading eyebrow="Sélection LPCV" align="center">
          Professionnels en vedette
        </Heading>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.slice(0, 6).map((pro, index) => (
            <FadeUp key={pro.id} delay={(index % 3) * 0.08} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-lg font-semibold text-white">
                    {pro.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                    {pro.verified && (
                      <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-success-500 text-white">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{pro.name}</p>
                    <p className="text-xs text-ink-500">{pro.profession}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {pro.zone}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-accent-700">
                    <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" aria-hidden="true" /> {pro.rating}
                  </span>
                </div>
                <Button to={`/professionnel/${pro.id}`} variant="outline" className="mt-5 w-full justify-center">
                  Voir le profil
                </Button>
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}