import type { ComponentType } from "react";
import {
  IconMaison,
  IconPlomberie,
  IconElectricite,
  IconMenage,
  IconInformatique,
  IconTransport,
} from "@/components/icons/metier-icons";

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const categories: Category[] = [
  { slug: "maison-batiment", name: "Maison & Bâtiment", description: "Maçonnerie, menuiserie, peinture, rénovation", icon: IconMaison },
  { slug: "plomberie", name: "Plomberie", description: "Fuites, installations, dépannage sanitaire", icon: IconPlomberie },
  { slug: "electricite", name: "Électricité", description: "Installation, panne, mise aux normes", icon: IconElectricite },
  { slug: "menage", name: "Ménage", description: "Entretien et nettoyage à domicile", icon: IconMenage },
  { slug: "informatique", name: "Informatique", description: "Dépannage, réseau, installation", icon: IconInformatique },
  { slug: "transport", name: "Transport", description: "Déménagement et livraison", icon: IconTransport },
];