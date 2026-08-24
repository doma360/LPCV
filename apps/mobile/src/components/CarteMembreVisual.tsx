import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { colors } from "@/theme/colors";
import LpcvLogo from "@/components/LpcvLogo";

interface CarteMembreVisualProps {
  nom: string;
  prenom: string;
  metier: string;
  photoUrl?: string | null;
  verifie?: boolean;
  onPress?: () => void;
}

// Format "carte Visa" (plus large que longue) demande par l'utilisateur, sur
// la base d'une image de reference (badge d'app generique) : la zone qui y
// contenait juste le logo/nom de marque devient ici la photo du pro, mise en avant.
export default function CarteMembreVisual({ nom, prenom, metier, photoUrl, verifie, onPress }: CarteMembreVisualProps) {
  return (
    <Pressable style={styles.carte} onPress={onPress} disabled={!onPress}>
      <View style={styles.accent1} />
      <View style={styles.accent2} />

      <View style={styles.photoZone}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitiales}>
              {prenom[0]}
              {nom[0]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.infos}>
        <View style={styles.marqueRow}>
          <LpcvLogo size={16} />
          <Text style={styles.marque}>LPCV</Text>
          {verifie && (
            <View style={styles.verifiePill}>
              <ShieldCheck size={10} color={colors.brand900} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.nom} numberOfLines={1}>
            {prenom} {nom}
          </Text>
          <Text style={styles.metier} numberOfLines={1}>
            {metier}
          </Text>
        </View>

        <Text style={styles.carteLabel}>CARTE MEMBRE</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  carte: {
    width: "100%",
    aspectRatio: 1.586,
    borderRadius: 18,
    backgroundColor: colors.brand900,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  accent1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.brand700,
    right: -50,
    top: -70,
    opacity: 0.7,
  },
  accent2: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accent400,
    right: -30,
    top: -10,
    opacity: 0.85,
  },
  photoZone: { width: "36%", height: "100%" },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: { width: "100%", height: "100%", backgroundColor: colors.brand700, alignItems: "center", justifyContent: "center" },
  photoInitiales: { color: colors.accent400, fontSize: 28, fontWeight: "800" },
  infos: { flex: 1, padding: 14, justifyContent: "space-between" },
  marqueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  marque: { color: colors.white, fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  verifiePill: {
    marginLeft: "auto",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  nom: { color: colors.white, fontSize: 16, fontWeight: "800" },
  metier: { color: colors.brand100, fontSize: 12, fontWeight: "600", marginTop: 2 },
  carteLabel: { color: colors.brand100, fontSize: 9, fontWeight: "700", letterSpacing: 1.5 },
});
