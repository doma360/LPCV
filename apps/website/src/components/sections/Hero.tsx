import { ShieldCheck, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import PhoneMockup from "@/components/ui/PhoneMockup";
import FadeUp from "@/components/ui/FadeUp";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-brand-100 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-[-10%] h-[360px] w-[360px] rounded-full bg-accent-100 blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-1.5 text-xs font-semibold text-ink-600 shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
              Nouveau à Abidjan
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] text-ink-900 sm:text-5xl lg:text-6xl">
              Tous les artisans qualifiés,
              <span className="text-brand-700"> dans une seule application.</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-500 sm:text-lg">
              LPCV met en relation particuliers et entreprises avec des professionnels
              vérifiés près de chez eux — plombiers, électriciens, maçons et bien d'autres,
              disponibles en quelques minutes.
            </p>
          </FadeUp>
          <FadeUp delay={0.24}>
            <div className="mt-8">
              <SearchBar />
            </div>
          </FadeUp>
          <FadeUp delay={0.32}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary">Télécharger l'application</Button>
              <Button variant="ghost" to="/#fonctionnement">
                Découvrir comment ça marche
              </Button>
            </div>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="mt-10 flex items-center gap-2 text-sm text-ink-500">
              <ShieldCheck className="h-4 w-4 text-success-600" aria-hidden="true" />
              Professionnels vérifiés · Note moyenne 4.8/5 sur plus de 2 000 avis
            </div>
          </FadeUp>
        </div>
        <PhoneMockup className="hidden lg:block" />
      </Container>
    </section>
  );
}
