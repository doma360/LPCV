import { ClipboardList, Settings, User } from "lucide-react-native";
import Sidebar, { type LienSidebar } from "@/components/Sidebar";

const LIENS: LienSidebar[] = [
  { href: "/(client)/demandes", label: "Mes demandes", icone: ClipboardList },
  { href: "/(client)/profil", label: "Profil & avis laissés", icone: User },
  { href: "/(client)/parametres", label: "Paramètres", icone: Settings },
];

interface ClientSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function ClientSidebar({ visible, onClose }: ClientSidebarProps) {
  return <Sidebar visible={visible} onClose={onClose} sousTitre="Espace client" liens={LIENS} />;
}
