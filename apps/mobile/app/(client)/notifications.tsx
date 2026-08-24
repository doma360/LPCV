import { Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import { ArrowLeft, BellOff } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";

// Ecran reel mais volontairement vide : pas encore de systeme de
// notifications construit cote backend (voir docs/decisions.md) - mieux
// vaut un etat vide honnete qu'inventer de fausses notifications.
export default function Notifications() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>
      <Text style={styles.title}>Notifications</Text>

      <View style={styles.vide}>
        <BellOff size={32} color={colors.ink400} />
        <Text style={styles.videTexte}>Aucune notification pour l'instant.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "700", color: colors.ink900 },
  vide: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, marginTop: -40 },
  videTexte: { fontSize: 14, color: colors.ink500 },
});
