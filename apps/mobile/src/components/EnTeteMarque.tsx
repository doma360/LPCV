import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { colors } from "@/theme/colors";
import LpcvLogo from "@/components/LpcvLogo";

interface EnTeteMarqueProps {
  onBellPress?: () => void;
}

// Bandeau jaune plein (logo + wordmark + tagline + cloche) deja utilise sur
// l'Accueil client, repris ici tel quel pour l'Accueil et les deux Profil
// (voir docs/decisions.md) plutot que duplique trois fois.
export default function EnTeteMarque({ onBellPress }: EnTeteMarqueProps) {
  return (
    <View style={styles.bandeau}>
      <LpcvLogo size={36} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.wordmark}>LPCV</Text>
        <Text style={styles.tagline}>Les Professionnels Chez Vous</Text>
      </View>
      {onBellPress && (
        <Pressable style={styles.cloche} onPress={onBellPress} hitSlop={10}>
          <Bell size={22} color={colors.brand900} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bandeau: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent400,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  wordmark: { fontSize: 20, fontWeight: "900", color: colors.brand900, letterSpacing: 0.5 },
  tagline: { fontSize: 10, fontWeight: "700", color: colors.brand700, marginTop: 1, letterSpacing: 0.3 },
  cloche: { padding: 4 },
});
