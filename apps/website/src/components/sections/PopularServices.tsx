import { Link } from "react-router-dom";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Heading from "@/components/ui/Heading";
import FadeUp from "@/components/ui/FadeUp";
import { categories } from "@/data/categories";

export default function PopularServices() {
  return (
    <Section id="metiers" className="bg-white">
      <Container>
        <Heading eyebrow="Catégories" align="center">
          Que recherchez-vous ?
        </Heading>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <FadeUp key={category.slug} delay={(index % 3) * 0.07}>
                <Link
                  to={`/recherche?categorie=${category.slug}`}
                  className="group flex h-full items-center gap-4 rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-400 hover:shadow-lifted"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 transition-colors duration-300 group-hover:bg-brand-900">
                    <Icon className="h-7 w-7 text-brand-700 transition-colors duration-300 group-hover:text-accent-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-ink-900">{category.name}</h3>
                    <p className="mt-1 text-sm text-ink-500">{category.description}</p>
                  </div>
                </Link>
              </FadeUp>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}