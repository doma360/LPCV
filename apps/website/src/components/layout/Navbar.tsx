import { useEffect, useState, type MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Que recherchez-vous", to: "/#metiers" },
  { label: "Fonctionnement", to: "/#fonctionnement" },
  { label: "FAQ", to: "/#faq" },
  { label: "Contact", to: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAccueilClick(event: MouseEvent<HTMLAnchorElement>) {
    if (location.pathname === "/" && !location.hash) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-cream-50/95 shadow-soft backdrop-blur-md" : "bg-cream-50/70 backdrop-blur-sm"
      }`}
    >
      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={link.label === "Accueil" ? handleAccueilClick : () => setOpen(false)}
              className="group relative text-sm font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
            <MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
            Côte d'Ivoire
          </span>
          <Link to="#" className="text-sm font-semibold text-ink-700 transition-colors hover:text-brand-700">
            Connexion
          </Link>
          <Button variant="primary">Inscription</Button>
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>
      {open && (
        <div className="border-t border-ink-100 bg-cream-50 px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={link.label === "Accueil" ? handleAccueilClick : () => setOpen(false)}
                className="text-sm font-medium text-ink-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-2">
              <Link to="#" onClick={() => setOpen(false)} className="text-sm font-semibold text-ink-700">
                Connexion
              </Link>
              <Button variant="primary" className="flex-1 justify-center">
                Inscription
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}