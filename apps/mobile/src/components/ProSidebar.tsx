import { CalendarClock, IdCard, Pencil, Settings, Wallet } from "lucide-react-native";
import Sidebar, { type LienSidebar } from "@/components/Sidebar";

const LIENS: LienSidebar[] = [
  { href: "/(professionnel)/reservations", label: "Réservations", icone: CalendarClock },
  { href: "/(professionnel)/portefeuille", label: "Portefeuille", icone: Wallet },
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
