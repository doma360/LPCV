import { Pressable, StyleSheet, Text, View } from "react-native";
import { Locate, MapPin } from "lucide-react-native";
import { colors } from "@/theme/colors";

interface MiniCartePositionProps {
  label: string | null;
  chargement?: boolean;
  onRecentrer: () => void;
}

// Simulation visuelle (pas de vraies tuiles) en attendant le choix d'un
// fournisseur reel (Google Maps / Mapbox) - decision qui attend la
// validation de l'employeur, voir docs/decisions.md. Sert juste a valider
// la composition/interaction (bouton de recentrage) avant d'y brancher une
// vraie carte plus tard, meme composant reutilisable pour le suivi en
// temps reel du professionnel "en route".
export default function MiniCartePosition({ label, chargement, onRecentrer }: MiniCartePositionProps) {
  return (
    <View style={styles.carte}>
      <View style={styles.trameFond}>
        {[0, 1, 2, 3].map((i) => (
          <View key={`h${i}`} style={[styles.ligneHorizontale, { top: `${20 + i * 20}%` }]} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <View key={`v${i}`} style={[styles.ligneVerticale, { left: `${15 + i * 25}%` }]} />
        ))}
      </View>

      <View style={styles.pinConteneur}>
        <View style={styles.pinHalo} />
        <View style={styles.pin}>
          <MapPin size={18} color={colors.white} fill={colors.brand900} />
        </View>
      </View>

      {label && (
        <View style={styles.labelChip}>
          <Text style={styles.labelTexte} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}

      <Pressable style={styles.recentrerBtn} onPress={onRecentrer} disabled={chargement}>
        <Locate size={18} color={colors.brand900} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.brand50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  trameFond: { ...StyleSheet.absoluteFillObject },
  ligneHorizontale: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: colors.brand100 },
  ligneVerticale: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: colors.brand100 },
  pinConteneur: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -34,
    alignItems: "center",
  },
  pinHalo: {
    position: "absolute",
    bottom: 0,
    width: 28,
    height: 10,
    borderRadius: 14,
    backgroundColor: "rgba(23, 34, 66, 0.15)",
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  labelChip: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 56,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  labelTexte: { fontSize: 12, fontWeight: "700", color: colors.ink900 },
  recentrerBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
