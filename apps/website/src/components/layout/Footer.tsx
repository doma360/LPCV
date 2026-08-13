import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import { services } from "@/data/services";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-ink-100 bg-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
            La plateforme qui connecte les foyers et entreprises ivoiriennes aux artisans
            vérifiés de leur quartier.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Métiers</h3>
          <ul className="mt-4 space-y-3">
            {services.slice(0, 5).map((service) => (
              <li key={service.slug}>
                <a
                  href={`/recherche?metier=${service.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-700"
                >
                  {service.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">LPCV</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-500">
            <li>
              <a href="/#fonctionnement" className="transition-colors hover:text-brand-700">
                Comment ça marche
              </a>
            </li>
            <li>
              <a href="/#faq" className="transition-colors hover:text-brand-700">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-brand-700">
                Devenir professionnel
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-500">
            <li>Abidjan, Côte d'Ivoire</li>
            <li>contact@lpcv.ci</li>
            <li>+225 07 00 00 00 00</li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-ink-100 py-6">
        <Container className="flex flex-col items-center justify-between gap-4 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} LPCV — Les Professionnels Chez Vous</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-brand-700">
              Conditions
            </a>
            <a href="#" className="transition-colors hover:text-brand-700">
              Confidentialité
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}
