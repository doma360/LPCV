import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";

const items = [
  {
    q: "Comment savoir si un professionnel est vérifié ?",
    a: "Chaque professionnel LPCV passe par une vérification d'identité et de compétences avant de pouvoir recevoir des demandes.",
  },
  {
    q: "Quels moyens de paiement sont acceptés ?",
    a: "Wave, Orange Money, MTN Money, Moov Money, ainsi que le paiement en espèces à l'intervention.",
  },
  {
    q: "LPCV est-il disponible dans tout Abidjan ?",
    a: "LPCV couvre progressivement l'ensemble des communes d'Abidjan, avec de nouveaux quartiers ajoutés chaque semaine.",
  },
  {
    q: "Que faire si je ne suis pas satisfait d'une intervention ?",
    a: "Chaque demande peut faire l'objet d'un avis, et notre équipe de modération traite tout signalement rapidement.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" className="bg-white">
      <Container className="max-w-3xl">
        <Heading eyebrow="Questions fréquentes" align="center">
          Tout ce qu'il faut savoir
        </Heading>
        <div className="mt-12 divide-y divide-ink-100 rounded-2xl border border-ink-100">
          {items.map((item, index) => (
            <FadeUp key={item.q} delay={index * 0.05}>
              <div>
                <button
                  type="button"
                  onClick={() => setOpen(open === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open === index}
                >
                  <span className="text-sm font-semibold text-ink-900">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${
                      open === index ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {open === index && (
                  <p className="px-6 pb-5 text-sm leading-relaxed text-ink-500">{item.a}</p>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}
