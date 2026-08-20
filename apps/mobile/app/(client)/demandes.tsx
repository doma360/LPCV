import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";

interface Demande {
  id: string;
  statut: string;
  description: string;
  prixEstime: number | null;
  createdAt: string;
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
  prix: { fontSize: 13, fontWeight: "700", color: colors.brand700 },
});
