import { ShieldCheck, MessageCircle, Lock, Headphones } from "lucide-react";
import Container from "@/components/ui/Container";
import SearchBar from "@/components/ui/SearchBar";
import Float from "@/components/ui/Float";
import FadeUp from "@/components/ui/FadeUp";

const trustPoints = [
  { icon: ShieldCheck, label: "Professionnels vérifiés" },
  { icon: MessageCircle, label: "Avis authentiques" },
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: Headphones, label: "Support réactif" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-100 pb-20 pt-14 sm:pt-20">
      <Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-1.5 text-xs font-semibold text-ink-600 shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
              Côte d'Ivoire · Abidjan
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] text-ink-900 sm:text-5xl lg:text-[3.4rem]">
              Trouvez le bon professionnel,
              <span className="relative ml-2 inline-block">
                <span className="relative z-10">près de chez vous.</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3.5 bg-accent-400/70" aria-hidden="true" />
              </span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              LPCV connecte particuliers et entreprises à des artisans vérifiés, partout à
              Abidjan — plomberie, électricité, ménage, informatique et bien plus.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="mt-8">
              <SearchBar />
            </div>
          </FadeUp>
          <FadeUp delay={0.32}>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
              {trustPoints.map((point) => (
                <div key={point.label} className="flex items-center gap-2 text-sm text-ink-600">
                  <point.icon className="h-4 w-4 text-brand-700" aria-hidden="true" />
                  {point.label}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <Float
            duration={7}
            distance={14}
            className="absolute -right-4 -top-8 -z-0 h-40 w-40 rounded-[2.5rem] bg-accent-400 sm:-right-8 sm:h-52 sm:w-52"
          />
          <div className="absolute -bottom-6 -left-6 -z-0 h-24 w-24 rounded-full bg-brand-700/10" aria-hidden="true" />

          <div className="relative z-10 overflow-hidden rounded-[2rem] border-4 border-white bg-brand-100 shadow-lifted">
            {/* Remplacer par une vraie photographie : /public/images/hero-professional.jpg */}
            <img
              src="/images/hero-professional.jpg"
              alt="Professionnel ivoirien LPCV au travail"
              className="aspect-[4/5] w-full bg-brand-200 object-cover"
            />
          </div>

          <div className="absolute -bottom-5 right-4 z-20 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 shadow-lifted sm:right-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-100 text-success-700">
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-900">Identité vérifiée</p>
              <p className="text-[11px] text-ink-500">Contrôle systématique</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}