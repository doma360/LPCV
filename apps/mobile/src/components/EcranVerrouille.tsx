import { StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { Lock } from "lucide-react-native";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import { polices } from "@/theme/typography";

export default function EcranVerrouille({ onDeverrouiller }: { onDeverrouiller: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Lock size={28} color={colors.brand900} />
      </View>
      <Text style={styles.title}>LPCV verrouillé</Text>
      <Text style={styles.subtitle}>Déverrouillez avec votre biométrie ou votre code PIN.</Text>
      <Button label="Déverrouiller" onPress={onDeverrouiller} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.accent400,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontFamily: polices.titre, fontSize: 20, fontWeight: "700", color: colors.ink900 },
  subtitle: { fontSize: 14, color: colors.ink500, textAlign: "center", marginBottom: 16 },
});
