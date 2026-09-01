import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { polices } from "@/theme/typography";

interface Mouvement {
  id: string;
  type: "CREDIT_RESERVATION" | "RETRAIT";
  montant: string;
  createdAt: string;
}

interface Portefeuille {
  solde: string;
  mouvements: Mouvement[];
}

export default function PortefeuilleScreen() {
  const [portefeuille, setPortefeuille] = useState<Portefeuille | null>(null);
  const [montantRetrait, setMontantRetrait] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);

  const charger = useCallback(() => {
    apiFetch<Portefeuille>("/api/v1/portefeuille/moi").then((res) => setPortefeuille(res.data)).catch(() => {});
  }, []);

  useFocusEffect(charger);

  async function retirer() {
    const montant = Number(montantRetrait);
    if (!montant || montant <= 0) {
      setErreur("Indiquez un montant valide");
      return;
    }
    setErreur(null);
    setSucces(null);
    setEnvoi(true);
    try {
      await apiFetch("/api/v1/portefeuille/retrait", { method: "POST", body: JSON.stringify({ montant }) });
      setMontantRetrait("");
      setSucces("Retrait envoyé vers votre Mobile Money.");
      charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Retrait impossible");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>
      <Text style={styles.title}>Portefeuille</Text>

      <View style={styles.soldeCard}>
        <Text style={styles.soldeLabel}>Solde disponible</Text>
        <Text style={styles.soldeValeur}>{portefeuille?.solde ?? "0"} FCFA</Text>
      </View>

      <View style={styles.retraitForm}>
        <View style={styles.flex}>
          <TextField
            label="Montant à retirer"
            value={montantRetrait}
            onChangeText={setMontantRetrait}
            keyboardType="number-pad"
            placeholder="FCFA"
          />
        </View>
        <Pressable style={styles.retirerBtn} onPress={retirer} disabled={envoi}>
          <Text style={styles.retirerLabel}>Retirer</Text>
        </Pressable>
      </View>
      {erreur && <Text style={styles.erreur}>{erreur}</Text>}
      {succes && <Text style={styles.succes}>{succes}</Text>}
      <Text style={styles.aide}>Vers Mobile Money — fonctionnalité simulée en attendant l'intégration réelle.</Text>

      <Text style={styles.sectionTitle}>Mouvements récents</Text>
      <FlatList
        data={portefeuille?.mouvements ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.vide}>Aucun mouvement pour l'instant.</Text>}
        renderItem={({ item }) => (
          <View style={styles.mouvementCard}>
            <View style={styles.mouvementGauche}>
              {item.type === "CREDIT_RESERVATION" ? (
                <ArrowDownCircle size={18} color={colors.success500} />
              ) : (
                <ArrowUpCircle size={18} color={colors.danger500} />
              )}
              <View>
                <Text style={styles.mouvementLabel}>
                  {item.type === "CREDIT_RESERVATION" ? "Réservation payée" : "Retrait"}
                </Text>
                <Text style={styles.mouvementDate}>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Text>
              </View>
            </View>
            <Text style={[styles.mouvementMontant, { color: item.type === "CREDIT_RESERVATION" ? colors.success500 : colors.danger500 }]}>
              {item.type === "CREDIT_RESERVATION" ? "+" : "-"}
              {item.montant} F
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  flex: { flex: 1 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "700", color: colors.ink900, marginBottom: 16 },
  soldeCard: { backgroundColor: colors.brand900, borderRadius: 16, padding: 20 },
  soldeLabel: { fontSize: 12, color: colors.brand100, fontWeight: "600" },
  soldeValeur: { fontSize: 28, color: colors.white, fontWeight: "800", marginTop: 4 },
  retraitForm: { flexDirection: "row", gap: 8, alignItems: "flex-end", marginTop: 16 },
  retirerBtn: { height: 48, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colors.accent400, alignItems: "center", justifyContent: "center" },
  retirerLabel: { fontSize: 14, fontWeight: "700", color: colors.brand900 },
  erreur: { color: colors.danger500, fontSize: 13, marginTop: 6 },
  succes: { color: colors.success500, fontSize: 13, marginTop: 6 },
  aide: { fontSize: 11, color: colors.ink400, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900, marginTop: 24, marginBottom: 10 },
  vide: { textAlign: "center", color: colors.ink400, marginTop: 20 },
  mouvementCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  mouvementGauche: { flexDirection: "row", alignItems: "center", gap: 10 },
  mouvementLabel: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  mouvementDate: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  mouvementMontant: { fontSize: 14, fontWeight: "700" },
});
