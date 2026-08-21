import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

export default function Bienvenue() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>L</Text>
        </View>
        <Text style={styles.title}>LPCV</Text>
        <Text style={styles.subtitle}>Les Professionnels Chez Vous</Text>
        <Text style={styles.tagline}>
          Trouvez un artisan vérifié près de chez vous, à Abidjan — plomberie, électricité, ménage et bien plus.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Commencer" showArrow onPress={() => router.push("/(auth)/choisir-role")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand900, padding: 24, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.accent400,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgeText: { fontSize: 26, fontWeight: "800", color: colors.brand900 },
  title: { fontSize: 30, fontWeight: "800", color: colors.white },
  subtitle: { fontSize: 14, fontWeight: "600", color: colors.accent400, marginTop: 4 },
  tagline: {
    fontSize: 14,
    color: colors.brand100,
    textAlign: "center",
    marginTop: 20,
    maxWidth: 280,
    lineHeight: 20,
  },
  actions: { gap: 16, paddingBottom: 20 },
});
