import { MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { categories } from "@/data/categories";

export default function Footer() {
  return (
    <footer id="contact" className="bg-brand-900 text-brand-100">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="inverted" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-300">
            La plateforme qui connecte les foyers et entreprises ivoiriennes aux artisans
            vérifiés de leur quartier.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Catégories</h3>
          <ul className="mt-4 space-y-3">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <a
                  href={`/recherche?categorie=${category.slug}`}
                  className="text-sm text-brand-300 transition-colors hover:text-accent-400"
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">LPCV</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-300">
            <li>
              <a href="/#fonctionnement" className="transition-colors hover:text-accent-400">
                Comment ça marche
              </a>
            </li>
            <li>
              <a href="/#faq" className="transition-colors hover:text-accent-400">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-accent-400">
                Devenir professionnel
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-300">
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Abidjan, Côte d'Ivoire
            </li>
            <li>contact@lpcv.ci</li>
            <li>+225 07 00 00 00 00</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 text-xs text-brand-400 sm:flex-row">
          <p>© {new Date().getFullYear()} LPCV — Les Professionnels Chez Vous</p>
          <p className="inline-flex items-center gap-1.5 font-medium text-accent-400">
            Fabriqué en Côte d'Ivoire
          </p>
        </Container>
      </div>
    </footer>
  );
}