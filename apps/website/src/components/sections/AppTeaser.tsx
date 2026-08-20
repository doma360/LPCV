import { Download, Smartphone } from "lucide-react";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import Button from "@/components/ui/Button";
import Float from "@/components/ui/Float";
import DeviceFrame from "@/components/ui/DeviceFrame";

export default function AppTeaser() {
  return (
    <Section id="app" className="relative overflow-hidden bg-gradient-to-b from-brand-900 to-brand-950">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 78% 45%, rgba(255,212,0,0.10) 0%, rgba(9,14,26,0) 70%)",
        }}
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Heading eyebrow="Bientôt disponible" tone="inverted">
            LPCV arrive sur votre téléphone
          </Heading>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-brand-200 sm:text-base">
            L'application mobile LPCV rassemble la recherche, la messagerie, le paiement et le
            suivi en temps réel — pensée pour Android et iOS.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="secondary">
              <Download className="h-4 w-4" aria-hidden="true" />
              Google Play
            </Button>
            <Button
              variant="outline"
              className="border-white/25 text-white hover:border-white hover:text-white"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              App Store
            </Button>
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center gap-6 py-4 sm:flex-row sm:gap-0 sm:py-8">
          <Float duration={6} distance={10} className="relative z-0 sm:mt-10">
            <DeviceFrame platform="android" />
          </Float>
          <Float
            duration={7.5}
            delay={0.4}
            distance={14}
            className="relative z-10 sm:-ml-10"
          >
            <DeviceFrame platform="ios" />
          </Float>
        </div>
      </Container>
    </Section>
  );
}