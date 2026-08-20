import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";

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
        <Text style={styles.totalLabel}>Total gagné</Text>
        <Text style={styles.totalValue}>{revenus?.totalGagne ?? 0} FCFA</Text>
        <Text style={styles.totalSous}>{revenus?.nombrePaiements ?? 0} paiement(s) confirmé(s)</Text>
      </View>

      <Text style={styles.sectionTitle}>Paiements récents</Text>
      <FlatList
        data={revenus?.paiementsRecents ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 8, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.vide}>Aucun paiement pour l'instant.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
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
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900, marginBottom: 16 },
  totalCard: { backgroundColor: colors.brand900, borderRadius: 16, padding: 20, marginBottom: 20 },
  totalLabel: { fontSize: 12, color: colors.brand100, fontWeight: "600" },
  totalValue: { fontSize: 28, color: colors.white, fontWeight: "800", marginTop: 4 },
  totalSous: { fontSize: 12, color: colors.brand100, marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900, marginBottom: 10 },
  vide: { textAlign: "center", color: colors.ink400, marginTop: 20 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  cardMetier: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  cardDate: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  cardMontant: { fontSize: 14, fontWeight: "700", color: colors.success500 },
});
