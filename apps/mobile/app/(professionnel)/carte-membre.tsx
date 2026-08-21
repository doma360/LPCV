import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ChevronLeft, IdCard } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, WEBSITE_URL } from "@/lib/api";
import { colors } from "@/theme/colors";

interface Abonnement {
  statut: "ACTIF" | "EXPIRE" | "ANNULE";
  palier: "MENSUEL" | "ANNUEL";
  dateFin: string;
}

export default function CarteMembre() {
  const { session } = useAuth();
  const router = useRouter();
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    apiFetch<Abonnement | null>("/api/v1/abonnements/moi")
      .then((res) => setAbonnement(res.data))
      .finally(() => setChargement(false));
  }, []);

  const actif = abonnement?.statut === "ACTIF";

  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ChevronLeft size={22} color={colors.ink500} />
      </Pressable>

      <Text style={styles.titre}>Carte membre LPCV</Text>

      <View style={styles.carte}>
        <View style={styles.carteHaut}>
          <IdCard size={20} color={colors.accent400} />
          <Text style={styles.carteMarque}>LPCV</Text>
        </View>

        <Text style={styles.carteNom}>
          {session?.user.prenom} {session?.user.nom}
        </Text>

        <View style={styles.qrZone}>
          {chargement && <ActivityIndicator color={colors.white} />}
          {!chargement && actif && session && (
            <View style={styles.qrFond}>
              <QRCode value={`${WEBSITE_URL}/verification/${session.user.id}`} size={140} />
            </View>
          )}
          {!chargement && !actif && (
            <Text style={styles.qrVide}>
              Le QR de votre carte s'active avec un abonnement LPCV actif.
            </Text>
          )}
        </View>

        <Text style={styles.carteStatut}>
          {actif
            ? `Abonnement ${abonnement?.palier === "ANNUEL" ? "annuel" : "mensuel"} actif`
            : "Aucun abonnement actif"}
        </Text>
      </View>

      <Text style={styles.aide}>
        Scannez le QR pour vérifier en un instant qu'un professionnel LPCV est bien abonné.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, alignItems: "center" },
  retour: { position: "absolute", top: 56, left: 20, zIndex: 1, padding: 6 },
  titre: { fontSize: 18, fontWeight: "700", color: colors.ink900, marginBottom: 24 },
  carte: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: colors.brand900,
    padding: 24,
    alignItems: "center",
  },
  carteHaut: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
  carteMarque: { color: colors.white, fontWeight: "800", fontSize: 14, letterSpacing: 1 },
  carteNom: { color: colors.white, fontSize: 20, fontWeight: "700", marginTop: 20, alignSelf: "flex-start" },
  qrZone: {
    marginTop: 24,
    width: 172,
    height: 172,
    borderRadius: 12,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  qrFond: { backgroundColor: colors.white, padding: 8, borderRadius: 8 },
  qrVide: { color: colors.brand100, fontSize: 12, textAlign: "center" },
  carteStatut: { color: colors.accent400, fontSize: 13, fontWeight: "700", marginTop: 20 },
  aide: { color: colors.ink500, fontSize: 13, textAlign: "center", marginTop: 20, maxWidth: 300 },
});
