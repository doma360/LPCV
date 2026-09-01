import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, CalendarClock } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import Apparition from "@/components/Apparition";
import { polices } from "@/theme/typography";

interface Reservation {
  id: string;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "PAYEE" | "TERMINEE" | "ANNULEE" | "REFUSEE";
  description: string;
  montant: string | null;
  profession: { nom: string };
  client: { nom: string; prenom: string };
}

const STATUT_LABEL: Record<Reservation["statut"], { label: string; color: string; fond: string }> = {
  EN_ATTENTE: { label: "À traiter", color: colors.accent700, fond: colors.accent300 },
  CONFIRMEE: { label: "En attente de paiement", color: colors.brand700, fond: colors.brand50 },
  PAYEE: { label: "Payée", color: colors.success500, fond: "#E7F7EE" },
  TERMINEE: { label: "Terminée", color: colors.success500, fond: "#E7F7EE" },
  ANNULEE: { label: "Annulée", color: colors.danger500, fond: "#FDECEC" },
  REFUSEE: { label: "Refusée", color: colors.danger500, fond: "#FDECEC" },
};

export default function ReservationsPro() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Reservation[]>("/api/v1/reservations").then((res) => setReservations(res.data)).catch(() => {});
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
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <View style={styles.videIcone}>
              <CalendarClock size={26} color={colors.ink400} />
            </View>
            <Text style={styles.videTitre}>Aucune réservation pour l'instant</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const statut = STATUT_LABEL[item.statut];
          return (
            <Apparition delai={Math.min(index, 6) * 60}>
              <Pressable style={styles.card} onPress={() => router.push(`/(professionnel)/reservation/${item.id}`)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                  <View style={[styles.statutPill, { backgroundColor: statut.fond }]}>
                    <Text style={[styles.statutLabel, { color: statut.color }]}>{statut.label}</Text>
                  </View>
                </View>
                <Text style={styles.client}>
                  {item.client.prenom} {item.client.nom}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.montant && (
                  <View style={styles.prixPill}>
                    <Text style={styles.prixLabel}>{item.montant} FCFA</Text>
                  </View>
                )}
              </Pressable>
            </Apparition>
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
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "700", color: colors.ink900 },
  vide: { alignItems: "center", paddingTop: 60, paddingHorizontal: 20, gap: 8 },
  videIcone: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  videTitre: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.ink100,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMetier: { fontSize: 15, fontWeight: "700", color: colors.ink900 },
  statutPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statutLabel: { fontSize: 11, fontWeight: "700" },
  client: { fontSize: 13, fontWeight: "600", color: colors.ink900 },
  description: { fontSize: 13, color: colors.ink700 },
  prixPill: { backgroundColor: colors.accent400, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  prixLabel: { fontSize: 12, fontWeight: "800", color: colors.brand900 },
});
