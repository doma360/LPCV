import Container from "@/components/ui/Container";
import FadeUp from "@/components/ui/FadeUp";

const stats = [
  { value: "800+", label: "Professionnels vérifiés" },
  { value: "12 000+", label: "Interventions réalisées" },
  { value: "4.8/5", label: "Note moyenne client" },
  { value: "< 15 min", label: "Temps de réponse moyen" },
];

export default function Stats() {
  return (
    <section className="bg-brand-900 py-16">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <FadeUp key={stat.label} delay={index * 0.08} className="text-center">
              <p className="font-display text-3xl font-semibold text-white sm:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm text-brand-200">{stat.label}</p>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}