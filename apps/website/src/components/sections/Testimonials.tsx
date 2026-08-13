import { Star, Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";

const testimonials = [
  {
    name: "Aïcha Koné",
    role: "Cocody",
    quote: "J'ai trouvé un plombier vérifié en moins de 20 minutes. Rapide et sérieux.",
    rating: 5,
  },
  {
    name: "Serge Yao",
    role: "Marcory",
    quote: "Enfin une plateforme fiable pour trouver des artisans à Abidjan.",
    rating: 5,
  },
  {
    name: "Fatou Bamba",
    role: "Angré",
    quote: "Le suivi en temps réel change vraiment l'expérience.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <Section>
      <Container>
        <Heading eyebrow="Avis clients" align="center">
          Ils font confiance à LPCV
        </Heading>
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeUp key={testimonial.name} delay={index * 0.08}>
              <div className="relative h-full rounded-2xl border border-ink-100 bg-white p-7">
                <Quote className="h-6 w-6 text-brand-100" aria-hidden="true" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-3.5 w-3.5 fill-accent-500 text-accent-500"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink-700">"{testimonial.quote}"</p>
                <p className="mt-5 text-sm font-semibold text-ink-900">{testimonial.name}</p>
                <p className="text-xs text-ink-500">{testimonial.role}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}
