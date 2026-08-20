import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Navigation } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { distanceKm } from "@/lib/distance";
import { colors } from "@/theme/colors";

interface Demande {
  id: string;
  statut: string;
  description: string;
  prixEstime: number | null;
  createdAt: string;
  latitude: string;
  longitude: string;
  professionnelLat: string | null;
  professionnelLng: string | null;
  profession: { nom: string };
  professionnel: { nom: string; prenom: string } | null;
}

const statutLabels: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: colors.accent700 },
  ACCEPTEE: { label: "Acceptée", color: colors.brand700 },
  EN_ROUTE: { label: "En route", color: colors.brand700 },
  EN_COURS: { label: "En cours", color: colors.brand700 },
  TERMINEE: { label: "Terminée", color: colors.success500 },
  ANNULEE: { label: "Annulée", color: colors.danger500 },
  REFUSEE: { label: "Refusée", color: colors.danger500 },
};

export default function MesDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const charger = useCallback(async () => {
    const res = await apiFetch<Demande[]>("/api/v1/demandes");
    setDemandes(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  // Une demande "en route" a sa position mise à jour côté pro toutes les
  // ~15s : on rafraîchit à la même cadence pour suivre en quasi temps réel.
  useEffect(() => {
    const enRoute = demandes.some((d) => d.statut === "EN_ROUTE");
    if (!enRoute) return;
    const id = setInterval(charger, 15000);
    return () => clearInterval(id);
  }, [demandes, charger]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>
      <FlatList
        data={demandes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await charger();
              setRefreshing(false);
            }}
          />
        }
        contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.vide}>Aucune demande pour l'instant.</Text>}
        renderItem={({ item }) => {
          const statut = statutLabels[item.statut] ?? { label: item.statut, color: colors.ink500 };
          const suivi =
            item.statut === "EN_ROUTE" && item.professionnelLat && item.professionnelLng
              ? distanceKm(Number(item.latitude), Number(item.longitude), Number(item.professionnelLat), Number(item.professionnelLng))
              : null;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                <Text style={[styles.statut, { color: statut.color }]}>{statut.label}</Text>
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              {item.professionnel && (
                <Text style={styles.pro}>
                  {item.professionnel.prenom} {item.professionnel.nom}
                </Text>
              )}
              {suivi !== null && (
                <View style={styles.suivi}>
                  <Navigation size={12} color={colors.brand700} />
                  <Text style={styles.suiviText}>{suivi.toFixed(1)} km de chez vous</Text>
                </View>
              )}
              {item.prixEstime && <Text style={styles.prix}>{item.prixEstime} FCFA</Text>}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900 },
  vide: { marginTop: 40, textAlign: "center", color: colors.ink500 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    gap: 6,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardMetier: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  statut: { fontSize: 12, fontWeight: "700" },
  description: { fontSize: 13, color: colors.ink700 },
  pro: { fontSize: 12, color: colors.ink500 },
  suivi: { flexDirection: "row", alignItems: "center", gap: 5 },
  suiviText: { fontSize: 12, fontWeight: "600", color: colors.brand700 },
  prix: { fontSize: 13, fontWeight: "700", color: colors.brand700 },
});
