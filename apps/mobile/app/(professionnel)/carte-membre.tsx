import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ChevronLeft, Mail, Phone, ShieldCheck } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, WEBSITE_URL } from "@/lib/api";
import { colors } from "@/theme/colors";
import CarteMembreVisual from "@/components/CarteMembreVisual";

interface Abonnement {
  statut: "ACTIF" | "EXPIRE" | "ANNULE";
  palier: "MENSUEL" | "ANNUEL";
  dateFin: string;
}

interface ProfessionnelDetail {
  photoUrl: string | null;
  createdAt: string;
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  profession: { nom: string };
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CarteMembre() {
  const { session } = useAuth();
  const router = useRouter();
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [detail, setDetail] = useState<ProfessionnelDetail | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiFetch<Abonnement | null>("/api/v1/abonnements/moi"),
      apiFetch<ProfessionnelDetail>(`/api/v1/professionnels/${session.user.id}`),
    ])
      .then(([abonnementRes, detailRes]) => {
        setAbonnement(abonnementRes.data);
        setDetail(detailRes.data);
      })
      .finally(() => setChargement(false));
  }, [session]);

  const actif = abonnement?.statut === "ACTIF";
  const numeroMembre = session ? session.user.id.slice(0, 8).toUpperCase() : "—";

  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ChevronLeft size={22} color={colors.ink500} />
      </Pressable>

      <Text style={styles.titre}>Carte membre LPCV</Text>

      <View style={styles.zoneCarte}>
        <CarteMembreVisual
          nom={session?.user.nom ?? ""}
          prenom={session?.user.prenom ?? ""}
          metier={detail?.profession.nom ?? "—"}
          photoUrl={detail?.photoUrl}
          verifie={detail?.statutVerification === "VERIFIE"}
        />
      </View>

      <View style={styles.corps}>
        <View style={styles.grille}>
          <View style={styles.champ}>
            <Text style={styles.champLabel}>N° membre</Text>
            <Text style={styles.champValeur}>{numeroMembre}</Text>
          </View>
          <View style={styles.champ}>
            <Text style={styles.champLabel}>Membre depuis</Text>
            <Text style={styles.champValeur}>{detail ? formaterDate(detail.createdAt) : "—"}</Text>
          </View>
          <View style={styles.champ}>
            <Text style={styles.champLabel}>Abonnement</Text>
            <Text style={styles.champValeur}>
              {actif ? (abonnement?.palier === "ANNUEL" ? "Annuel" : "Mensuel") : "Aucun"}
            </Text>
          </View>
          <View style={styles.champ}>
            <Text style={styles.champLabel}>Expire le</Text>
            <Text style={styles.champValeur}>{actif && abonnement ? formaterDate(abonnement.dateFin) : "—"}</Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Mail size={12} color={colors.ink500} />
            <Text style={styles.contactTexte} numberOfLines={1}>
              {session?.user.email}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={12} color={colors.ink500} />
            <Text style={styles.contactTexte}>{session?.user.telephone}</Text>
          </View>
        </View>

        <View style={styles.bas}>
          <View style={styles.qrZone}>
            {chargement && <ActivityIndicator color={colors.brand700} />}
            {!chargement && actif && session && (
              <QRCode value={`${WEBSITE_URL}/verification/${session.user.id}`} size={72} />
            )}
            {!chargement && !actif && <Text style={styles.qrVide}>QR inactif</Text>}
          </View>
          <View style={styles.basTexte}>
            {actif ? (
              <View style={styles.statutRow}>
                <ShieldCheck size={13} color={colors.success500} />
                <Text style={styles.statutTexte}>Abonnement actif</Text>
              </View>
            ) : (
              <Text style={styles.statutTexteInactif}>Aucun abonnement actif</Text>
            )}
            <Text style={styles.basAide}>Scannez pour vérifier ce professionnel</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  retour: {
    position: "absolute",
    top: 56,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titre: { fontSize: 18, fontWeight: "800", color: colors.ink900, marginBottom: 24, textAlign: "center" },
  zoneCarte: { width: "100%", maxWidth: 380, alignSelf: "center" },
  corps: {
    width: "100%",
    maxWidth: 380,
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  grille: { flexDirection: "row", flexWrap: "wrap" },
  champ: { width: "50%", marginBottom: 10 },
  champLabel: { fontSize: 10, fontWeight: "700", color: colors.ink400, textTransform: "uppercase" },
  champValeur: { fontSize: 13, fontWeight: "700", color: colors.ink900, marginTop: 2 },
  contactRow: { gap: 6, borderTopWidth: 1, borderTopColor: colors.ink100, paddingTop: 12 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactTexte: { fontSize: 12, color: colors.ink700, flexShrink: 1 },
  bas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.ink100,
    paddingTop: 14,
  },
  qrZone: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: colors.cream100,
    borderWidth: 1,
    borderColor: colors.ink100,
    alignItems: "center",
    justifyContent: "center",
  },
  qrVide: { fontSize: 10, color: colors.ink400, textAlign: "center" },
  basTexte: { flex: 1, gap: 4 },
  statutRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statutTexte: { fontSize: 13, fontWeight: "700", color: colors.success500 },
  statutTexteInactif: { fontSize: 13, fontWeight: "700", color: colors.ink400 },
  basAide: { fontSize: 11, color: colors.ink400 },
});
