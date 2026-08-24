import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";

interface Reservation {
  id: string;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "PAYEE" | "TERMINEE" | "ANNULEE" | "REFUSEE";
  description: string;
  montant: string | null;
  profession: { nom: string };
  client: { nom: string; prenom: string };
}

const STATUT_LABEL: Record<Reservation["statut"], { label: string; color: string }> = {
  EN_ATTENTE: { label: "À traiter", color: colors.accent700 },
  CONFIRMEE: { label: "En attente de paiement", color: colors.brand700 },
  PAYEE: { label: "Payée", color: colors.success500 },
  TERMINEE: { label: "Terminée", color: colors.success500 },
  ANNULEE: { label: "Annulée", color: colors.danger500 },
  REFUSEE: { label: "Refusée", color: colors.danger500 },
};

export default function ReservationsPro() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Reservation[]>("/api/v1/reservations").then((res) => setReservations(res.data));
    }, []),
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>
      <Text style={styles.title}>Réservations</Text>

      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.vide}>Aucune réservation pour l'instant.</Text>}
        renderItem={({ item }) => {
          const statut = STATUT_LABEL[item.statut];
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/(professionnel)/reservation/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                <Text style={[styles.statut, { color: statut.color }]}>{statut.label}</Text>
              </View>
              <Text style={styles.client}>
                {item.client.prenom} {item.client.nom}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              {item.montant && <Text style={styles.prix}>{item.montant} FCFA</Text>}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "700", color: colors.ink900 },
  vide: { marginTop: 40, textAlign: "center", color: colors.ink500 },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.ink100, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMetier: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  statut: { fontSize: 12, fontWeight: "700" },
  client: { fontSize: 12, color: colors.ink500 },
  description: { fontSize: 13, color: colors.ink700 },
  prix: { fontSize: 13, fontWeight: "700", color: colors.brand700 },
});
