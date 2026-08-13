import { Search, UserCheck, CalendarCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Recherchez",
    description: "Indiquez le métier dont vous avez besoin et votre quartier à Abidjan.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Choisissez",
    description: "Comparez les profils vérifiés, les avis et les tarifs indicatifs.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Réservez",
    description: "Confirmez l'intervention et suivez son avancement en temps réel.",
  },
];

export default function HowItWorks() {
  return (
    <Section id="fonctionnement">
      <Container>
        <Heading eyebrow="Fonctionnement" align="center">
          Trois étapes, un artisan de confiance
        </Heading>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <FadeUp key={step.number} delay={index * 0.1}>
              <div className="relative h-full rounded-2xl border border-ink-100 bg-white p-8">
                <span className="font-display text-sm font-semibold text-brand-200">
                  {step.number}
                </span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                  <step.icon className="h-5 w-5 text-brand-700" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}
