import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { Phone } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";

interface Demande {
  id: string;
  statut: string;
  description: string;
  adresse: string;
  prixEstime: number | null;
  profession: { nom: string };
  client: { nom: string; prenom: string };
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

const prochaineEtape: Record<string, { statut: string; label: string }> = {
  ACCEPTEE: { statut: "EN_ROUTE", label: "Je suis en route" },
  EN_ROUTE: { statut: "EN_COURS", label: "Intervention démarrée" },
  EN_COURS: { statut: "TERMINEE", label: "Marquer terminée" },
};

const APPEL_AUTORISE = ["ACCEPTEE", "EN_ROUTE", "EN_COURS"];

export default function DemandesRecues() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const res = await apiFetch<Demande[]>("/api/v1/demandes");
    setDemandes(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  // Pendant "en route" : envoie la position toutes les ~15s pour le suivi
  // temps réel côté client (Volume 2 §5). S'arrête dès que ce n'est plus le cas.
  useEffect(() => {
    const enRoute = demandes.find((d) => d.statut === "EN_ROUTE");
    if (!enRoute) return;

    async function envoyerPosition() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      await apiFetch(`/api/v1/demandes/${enRoute!.id}/position`, {
        method: "PATCH",
        body: JSON.stringify({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }),
      }).catch(() => {});
    }

    envoyerPosition();
    const id = setInterval(envoyerPosition, 15000);
    return () => clearInterval(id);
  }, [demandes]);

  async function changerStatut(id: string, statut: string) {
    setEnCours(id);
    try {
      await apiFetch(`/api/v1/demandes/${id}/statut`, { method: "PATCH", body: JSON.stringify({ statut }) });
      await charger();
    } catch (err) {
      Alert.alert("Erreur", err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setEnCours(null);
    }
  }

  async function appeler(id: string) {
    setEnCours(id);
    try {
      await apiFetch(`/api/v1/demandes/${id}/appel`, { method: "POST" });
      Alert.alert("Appel lancé", "Le client va recevoir un appel dans quelques secondes.");
    } catch (err) {
      Alert.alert("Erreur", err instanceof ApiError ? err.message : "Appel impossible");
    } finally {
      setEnCours(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demandes reçues</Text>
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
          const etape = prochaineEtape[item.statut];
          const chargement = enCours === item.id;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                <Text style={[styles.statut, { color: statut.color }]}>{statut.label}</Text>
              </View>
              <Text style={styles.client}>
                {item.client.prenom} {item.client.nom} · {item.adresse}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              {item.prixEstime && <Text style={styles.prix}>{item.prixEstime} FCFA</Text>}

              {item.statut === "EN_ATTENTE" && (
                <View style={styles.actions}>
                  <Pressable
                    disabled={chargement}
                    onPress={() => changerStatut(item.id, "ACCEPTEE")}
                    style={[styles.actionPrimary, chargement && styles.disabled]}
                  >
                    <Text style={styles.actionPrimaryLabel}>Accepter</Text>
                  </Pressable>
                  <Pressable
                    disabled={chargement}
                    onPress={() => changerStatut(item.id, "REFUSEE")}
                    style={[styles.actionOutline, chargement && styles.disabled]}
                  >
                    <Text style={styles.actionOutlineLabel}>Refuser</Text>
                  </Pressable>
                </View>
              )}

              {etape && (
                <View style={styles.actions}>
                  <Pressable
                    disabled={chargement}
                    onPress={() => changerStatut(item.id, etape.statut)}
                    style={[styles.actionPrimary, chargement && styles.disabled]}
                  >
                    <Text style={styles.actionPrimaryLabel}>{etape.label}</Text>
                  </Pressable>
                  {APPEL_AUTORISE.includes(item.statut) && (
                    <Pressable disabled={chargement} onPress={() => appeler(item.id)} style={styles.actionCall}>
                      <Phone size={16} color={colors.brand900} />
                    </Pressable>
                  )}
                </View>
              )}
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
  client: { fontSize: 12, color: colors.ink500 },
  description: { fontSize: 13, color: colors.ink700 },
  prix: { fontSize: 13, fontWeight: "700", color: colors.brand700 },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionPrimary: { flex: 1, backgroundColor: colors.accent400, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  actionPrimaryLabel: { fontSize: 13, fontWeight: "700", color: colors.brand900 },
  actionOutline: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: colors.danger500 },
  actionOutlineLabel: { fontSize: 13, fontWeight: "700", color: colors.danger500 },
  actionCall: {
    width: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.brand50,
  },
  disabled: { opacity: 0.5 },
});
