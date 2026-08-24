import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { TrendingUp, Wallet } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import DegradeFond from "@/components/DegradeFond";

interface PaiementRecent {
  id: string;
  montantNet: string;
  dateConfirmation: string;
  demande: { profession: { nom: string } };
}

interface Revenus {
  totalGagne: string;
  nombrePaiements: number;
  paiementsRecents: PaiementRecent[];
}

export default function RevenusScreen() {
  const [revenus, setRevenus] = useState<Revenus | null>(null);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Revenus>("/api/v1/professionnels/revenus").then((res) => setRevenus(res.data));
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenus</Text>

      <View style={styles.totalCard}>
        <DegradeFond id="revenusDegrade" de={colors.brand900} vers={colors.brand700} />
        <View style={styles.accentRevenus} />
        <View style={styles.totalIcone}>
          <Wallet size={18} color={colors.accent400} />
        </View>
        <Text style={styles.totalLabel}>Total gagné</Text>
        <Text style={styles.totalValue}>{revenus?.totalGagne ?? 0} FCFA</Text>
        <Text style={styles.totalSous}>{revenus?.nombrePaiements ?? 0} paiement(s) confirmé(s)</Text>
      </View>

      <Text style={styles.sectionTitle}>Paiements récents</Text>
      <FlatList
        data={revenus?.paiementsRecents ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <View style={styles.videIcone}>
              <TrendingUp size={22} color={colors.ink400} />
            </View>
            <Text style={styles.videTexte}>Aucun paiement pour l'instant.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcone}>
              <TrendingUp size={16} color={colors.success500} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardMetier}>{item.demande.profession.nom}</Text>
              <Text style={styles.cardDate}>{new Date(item.dateConfirmation).toLocaleDateString("fr-FR")}</Text>
            </View>
            <Text style={styles.cardMontant}>+{item.montantNet} F</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink900, marginBottom: 16 },
  totalCard: { borderRadius: 20, padding: 20, marginBottom: 20, overflow: "hidden" },
  accentRevenus: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent400,
    right: -50,
    top: -60,
    opacity: 0.4,
  },
  totalIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  totalLabel: { fontSize: 12, color: colors.brand100, fontWeight: "600" },
  totalValue: { fontSize: 28, color: colors.white, fontWeight: "800", marginTop: 4 },
  totalSous: { fontSize: 12, color: colors.brand100, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900, marginBottom: 10 },
  vide: { alignItems: "center", gap: 8, marginTop: 20 },
  videIcone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  videTexte: { fontSize: 13, color: colors.ink400 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E7F7EE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardMetier: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  cardDate: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  cardMontant: { fontSize: 14, fontWeight: "700", color: colors.success500 },
});
