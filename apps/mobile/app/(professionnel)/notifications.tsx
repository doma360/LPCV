import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, BellOff } from "lucide-react-native";
import { colors } from "@/theme/colors";

// Ecran reel mais volontairement vide, symetrique de (client)/notifications.tsx :
// pas encore de systeme de notifications construit cote backend (voir docs/decisions.md).
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
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900 },
  vide: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, marginTop: -40 },
  videTexte: { fontSize: 14, color: colors.ink500 },
});
