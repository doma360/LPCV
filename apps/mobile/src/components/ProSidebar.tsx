import { IdCard, Pencil, Settings } from "lucide-react-native";
import Sidebar, { type LienSidebar } from "@/components/Sidebar";

// Reservations/Portefeuille mis en cache pour l'instant (voir docs/decisions.md) :
// ecrans et backend intacts, juste retires de la navigation.
const LIENS: LienSidebar[] = [
  { href: "/(professionnel)/carte-membre", label: "Carte membre", icone: IdCard },
  { href: "/(professionnel)/modifier-profil", label: "Modifier le profil", icone: Pencil },
  { href: "/(professionnel)/parametres", label: "Paramètres", icone: Settings },
];

interface ProSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProSidebar({ visible, onClose }: ProSidebarProps) {
  return <Sidebar visible={visible} onClose={onClose} sousTitre="Espace professionnel" liens={LIENS} />;
}
