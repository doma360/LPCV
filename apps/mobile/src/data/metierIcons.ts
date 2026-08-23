import {
  Baby,
  Building2,
  Hammer,
  Home,
  KeyRound,
  Laptop,
  type LucideIcon,
  Palette,
  Plug,
  Scissors,
  Shirt,
  Sparkles,
  Truck,
  Wind,
  Wrench,
  Zap,
} from "lucide-react-native";
import { colors } from "@/theme/colors";

interface MetierVisuel {
  icone: LucideIcon;
  fond: string;
  texte: string;
}

// Une tuile par metier (grille d'accueil, inspiree du principe Yango — pas
// une simple liste de pastilles). Couleurs qui tournent sur la palette de
// marque pour eviter un mur monochrome, pas une signification particuliere
// par metier. Le jaune (clair) a besoin d'un texte fonce, le reste d'un
// texte blanc pour rester lisible.
const PALETTE_TUILES: { fond: string; texte: string }[] = [
  { fond: colors.accent400, texte: colors.brand900 },
  { fond: colors.brand900, texte: colors.white },
  { fond: colors.bleuClair, texte: colors.white },
  { fond: colors.orange500, texte: colors.white },
  { fond: colors.success500, texte: colors.white },
];

const ICONES: Record<string, LucideIcon> = {
  "maison-batiment": Home,
  plomberie: Wrench,
  electricite: Zap,
  menage: Sparkles,
  informatique: Laptop,
  transport: Truck,
  serrurerie: KeyRound,
  menuiserie: Hammer,
  ferronnerie: Hammer,
  maconnerie: Building2,
  climatisation: Wind,
  electromenager: Plug,
  coiffure: Scissors,
  esthetique: Sparkles,
  maquillage: Palette,
  "garde-enfants": Baby,
  couture: Shirt,
};

const DEFAUT: LucideIcon = Wrench;

export function visuelMetier(slug: string, index: number): MetierVisuel {
  const { fond, texte } = PALETTE_TUILES[index % PALETTE_TUILES.length];
  return { icone: ICONES[slug] ?? DEFAUT, fond, texte };
}
