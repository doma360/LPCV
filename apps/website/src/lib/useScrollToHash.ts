import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router ne fait pas défiler la page vers un #ancre automatiquement
 * (contrairement à un lien <a> natif). Ce hook s'en charge : à appeler
 * une fois dans chaque page qui contient des sections ciblées par la Navbar.
 */
export function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const timeout = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timeout);
  }, [hash]);
}