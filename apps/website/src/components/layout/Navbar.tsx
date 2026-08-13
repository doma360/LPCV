import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Métiers", to: "/#metiers" },
  { label: "Fonctionnement", to: "/#fonctionnement" },
  { label: "FAQ", to: "/#faq" },
  { label: "Contact", to: "/#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-cream-50/90 shadow-soft backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className="group relative text-sm font-medium text-ink-700 transition-colors hover:text-brand-700"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand-700 transition-all duration-300 group-hover:w-full" />
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Button variant="primary">Télécharger</Button>
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
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink-700"
              >
                {link.label}
              </Link>
            ))}
            <Button variant="primary" className="w-full justify-center">
              Télécharger
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
