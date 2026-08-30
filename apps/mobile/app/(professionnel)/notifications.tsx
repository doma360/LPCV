import { Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import { ArrowLeft, BellOff } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";

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
        <View style={styles.glowOuter}>
          <View style={styles.glowInner}>
            <BellOff size={34} color={colors.ink400} />
          </View>
        </View>
        <Text style={styles.videTitre}>Aucune notification pour l'instant</Text>
        <Text style={styles.videTexte}>Vous serez averti ici dès qu'il y a du nouveau.</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontFamily: polices.titre, fontSize: 22, color: colors.ink900 },
  vide: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, marginTop: -40, paddingHorizontal: 32 },
  glowOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.accent300,
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  glowInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  videTitre: { fontFamily: polices.titre, fontSize: 17, color: colors.ink900, textAlign: "center" },
  videTexte: { fontSize: 13, color: colors.ink500, textAlign: "center" },
});
