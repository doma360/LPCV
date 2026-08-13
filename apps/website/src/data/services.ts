import {
  Wrench,
  Zap,
  BrickWall,
  Hammer,
  Paintbrush,
  Snowflake,
  KeyRound,
  Scissors,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  priceFrom: number;
}

export const services: Service[] = [
  {
    slug: "plombier",
    name: "Plombier",
    description: "Fuites, installations et dépannage sanitaire.",
    icon: Wrench,
    priceFrom: 5000,
  },
  {
    slug: "electricien",
    name: "Électricien",
    description: "Installation, panne et mise aux normes.",
    icon: Zap,
    priceFrom: 6000,
  },
  {
    slug: "macon",
    name: "Maçon",
    description: "Construction, rénovation et finitions.",
    icon: BrickWall,
    priceFrom: 10000,
  },
  {
    slug: "menuisier",
    name: "Menuisier",
    description: "Meubles, portes et agencement bois.",
    icon: Hammer,
    priceFrom: 8000,
  },
  {
    slug: "peintre",
    name: "Peintre",
    description: "Peinture intérieure et extérieure.",
    icon: Paintbrush,
    priceFrom: 7000,
  },
  {
    slug: "climaticien",
    name: "Climaticien",
    description: "Installation et entretien de climatisation.",
    icon: Snowflake,
    priceFrom: 9000,
  },
  {
    slug: "serrurier",
    name: "Serrurier",
    description: "Ouverture et remplacement de serrures.",
    icon: KeyRound,
    priceFrom: 5000,
  },
  {
    slug: "coiffeur",
    name: "Coiffeur / Coiffeuse",
    description: "Coiffure à domicile pour toute la famille.",
    icon: Scissors,
    priceFrom: 4000,
  },
];
