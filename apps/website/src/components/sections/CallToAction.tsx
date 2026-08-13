import { Download, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import FadeUp from "@/components/ui/FadeUp";

export default function CallToAction() {
  return (
    <section className="py-20">
      <Container>
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-brand-800 px-8 py-14 text-center sm:px-16">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl"
              aria-hidden="true"
            />
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Téléchargez l'application LPCV
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-brand-100 sm:text-base">
              Recherchez, comparez et réservez un professionnel vérifié en quelques minutes,
              où que vous soyez à Abidjan.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button variant="secondary">
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger l'app
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:border-white hover:text-white"
              >
                Devenir professionnel
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
