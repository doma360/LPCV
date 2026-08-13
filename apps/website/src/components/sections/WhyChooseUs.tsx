import { ShieldCheck, MapPin, Zap, Lock } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";
import FeatureCard from "@/components/sections/FeatureCard";

const features = [
  {
    icon: ShieldCheck,
    title: "Professionnels vérifiés",
    description: "Identité et compétences contrôlées avant toute mise en relation.",
  },
  {
    icon: MapPin,
    title: "Proximité réelle",
    description: "Des artisans de votre quartier, disponibles rapidement.",
  },
  {
    icon: Zap,
    title: "Réponse rapide",
    description: "La plupart des demandes trouvent un professionnel en moins de 15 minutes.",
  },
  {
    icon: Lock,
    title: "Paiement sécurisé",
    description: "Wave, Orange Money, MTN Money et Moov Money, en toute confiance.",
  },
];

export default function WhyChooseUs() {
  return (
    <Section className="bg-brand-950">
      <Container>
        <Heading eyebrow="Pourquoi LPCV" align="center" tone="inverted">
          Une confiance construite pour le marché ivoirien
        </Heading>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeUp key={feature.title} delay={index * 0.08}>
              <FeatureCard {...feature} />
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}
