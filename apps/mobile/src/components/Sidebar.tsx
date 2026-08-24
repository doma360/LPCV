import { useEffect, useRef, type ComponentType } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { useRouter, type Href } from "expo-router";
import { X, type LucideProps } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { useAuth } from "@/hooks/useAuth";

const LARGEUR = 280;

export interface LienSidebar {
  href: Href;
  label: string;
  icone: ComponentType<LucideProps>;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  sousTitre: string;
  liens: LienSidebar[];
}

// Tiroir de navigation partage entre les deux roles (le contenu differe,
// pas la mecanique) — construit a la main comme FloatingTabBar plutot que
// d'ajouter une dependance de navigation par tiroir.
export default function Sidebar({ visible, onClose, sousTitre, liens }: SidebarProps) {
  const { session } = useAuth();
  const router = useRouter();
  const translateX = useRef(new Animated.Value(-LARGEUR)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -LARGEUR,
      duration: 220,
      // false : le driver natif ne gere pas correctement ce transform sur
      // react-native-web (confirme en preview — le panneau restait hors-champ
      // malgre visible=true), le fallback JS fonctionne partout.
      useNativeDriver: false,
    }).start();
  }, [visible, translateX]);

  function allerA(href: Href) {
    // Naviguer avant de fermer : l'ecran hote peut etre gele par
    // react-native-screens des qu'il perd le focus, ce qui empechait le
    // Modal (en portail) de se demonter si onClose() passait apres le push.
    router.push(href);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.fond} onPress={onClose} />
      <Animated.View style={[styles.panneau, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {session?.user.prenom[0]}
              {session?.user.nom[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>
              {session?.user.prenom} {session?.user.nom}
            </Text>
            <Text style={styles.sousTitre}>{sousTitre}</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={20} color={colors.brand100} />
          </Pressable>
        </View>

        <View style={styles.liste}>
          {liens.map(({ href, label, icone: Icone }) => (
            <Pressable key={label} style={styles.item} onPress={() => allerA(href)}>
              <Icone size={19} color={colors.ink700} />
              <Text style={styles.itemLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1, backgroundColor: "rgba(17, 23, 33, 0.5)" },
  panneau: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: LARGEUR,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.brand900,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent400, fontSize: 16, fontWeight: "800" },
  nom: { color: colors.white, fontSize: 15, fontWeight: "700" },
  sousTitre: { color: colors.brand100, fontSize: 12, marginTop: 2 },
  liste: { paddingVertical: 12 },
  item: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 14 },
  itemLabel: { fontSize: 14, fontWeight: "600", color: colors.ink900 },
});
