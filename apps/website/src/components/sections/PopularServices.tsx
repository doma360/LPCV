import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";
import ServiceCard from "@/components/sections/ServiceCard";
import { services } from "@/data/services";

export default function PopularServices() {
  return (
    <Section id="metiers" className="bg-white">
      <Container>
        <Heading eyebrow="Métiers" align="center">
          Des professionnels pour chaque besoin
        </Heading>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <FadeUp key={service.slug} delay={(index % 4) * 0.06}>
              <ServiceCard service={service} />
            </FadeUp>
          ))}
        </div>
      </Container>
    </Section>
  );
}
