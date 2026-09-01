import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { ClipboardList, MapPin, Menu, Phone, Star } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import { useAuth } from "@/hooks/useAuth";
import ProSidebar from "@/components/ProSidebar";
import DegradeFond from "@/components/DegradeFond";
import Apparition from "@/components/Apparition";
import { polices } from "@/theme/typography";

interface ProfilResume {
  noteMoyenne: string;
}

interface Revenus {
  totalGagne: string;
}

interface Demande {
  id: string;
  statut: string;
  description: string;
  adresse: string;
  prixEstime: number | null;
  profession: { nom: string };
  client: { nom: string; prenom: string };
}

const statutLabels: Record<string, { label: string; color: string; fond: string }> = {
  EN_ATTENTE: { label: "En attente", color: colors.accent700, fond: colors.accent300 },
  ACCEPTEE: { label: "Acceptée", color: colors.brand700, fond: colors.brand50 },
  EN_ROUTE: { label: "En route", color: colors.brand700, fond: colors.brand50 },
  EN_COURS: { label: "En cours", color: colors.brand700, fond: colors.brand50 },
  TERMINEE: { label: "Terminée", color: colors.success500, fond: "#E7F7EE" },
  ANNULEE: { label: "Annulée", color: colors.danger500, fond: "#FDECEC" },
  REFUSEE: { label: "Refusée", color: colors.danger500, fond: "#FDECEC" },
};

const prochaineEtape: Record<string, { statut: string; label: string }> = {
  ACCEPTEE: { statut: "EN_ROUTE", label: "Je suis en route" },
  EN_ROUTE: { statut: "EN_COURS", label: "Intervention démarrée" },
  EN_COURS: { statut: "TERMINEE", label: "Marquer terminée" },
};

const APPEL_AUTORISE = ["ACCEPTEE", "EN_ROUTE", "EN_COURS"];
const STATUTS_INACTIFS = new Set(["TERMINEE", "ANNULEE", "REFUSEE"]);

export default function DemandesRecues() {
  const { session } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [sidebarOuvert, setSidebarOuvert] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [totalGagne, setTotalGagne] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      const res = await apiFetch<Demande[]>("/api/v1/demandes");
      setDemandes(res.data);
    } catch {
      // echec silencieux : la liste garde son dernier etat connu
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
      if (session) {
        apiFetch<ProfilResume>(`/api/v1/professionnels/${session.user.id}`)
          .then((res) => setNote(res.data.noteMoyenne))
          .catch(() => {});
      }
      apiFetch<Revenus>("/api/v1/professionnels/revenus")
        .then((res) => setTotalGagne(res.data.totalGagne))
        .catch(() => {});
    }, [charger, session]),
  );

  const demandesActives = demandes.filter((d) => !STATUTS_INACTIFS.has(d.statut)).length;

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
      <View style={styles.headerRow}>
        <Pressable style={styles.hamburger} onPress={() => setSidebarOuvert(true)} hitSlop={10}>
          <Menu size={22} color={colors.ink900} />
        </Pressable>
        <Text style={styles.title}>Demandes reçues</Text>
      </View>

      <Apparition style={styles.stats}>
        <DegradeFond id="statsDegrade" de={colors.brand900} vers={colors.brand700} />
        <View style={styles.statItem}>
          <Text style={styles.statValeur}>{demandesActives}</Text>
          <Text style={styles.statLabel}>Actives</Text>
        </View>
        <View style={styles.statSeparateur} />
        <View style={styles.statItem}>
          <Text style={styles.statValeur}>{totalGagne ?? "—"}</Text>
          <Text style={styles.statLabel}>FCFA gagnés</Text>
        </View>
        <View style={styles.statSeparateur} />
        <View style={styles.statItem}>
          <View style={styles.statNoteRow}>
            <Star size={13} color={colors.accent700} fill={colors.accent500} />
            <Text style={styles.statValeur}>{note ?? "—"}</Text>
          </View>
          <Text style={styles.statLabel}>Note</Text>
        </View>
      </Apparition>

      <ProSidebar visible={sidebarOuvert} onClose={() => setSidebarOuvert(false)} />

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
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <View style={styles.videIcone}>
              <ClipboardList size={26} color={colors.ink400} />
            </View>
            <Text style={styles.videTitre}>Aucune demande pour l'instant</Text>
            <Text style={styles.videTexte}>Les nouvelles demandes de clients apparaîtront ici.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const statut = statutLabels[item.statut] ?? { label: item.statut, color: colors.ink500, fond: colors.cream100 };
          const etape = prochaineEtape[item.statut];
          const chargement = enCours === item.id;

          return (
            <Apparition delai={Math.min(index, 6) * 60} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                <View style={[styles.statutPill, { backgroundColor: statut.fond }]}>
                  <Text style={[styles.statutLabel, { color: statut.color }]}>{statut.label}</Text>
                </View>
              </View>
              <Text style={styles.client}>
                {item.client.prenom} {item.client.nom}
              </Text>
              <View style={styles.badge}>
                <MapPin size={11} color={colors.brand700} />
                <Text style={styles.badgeLabel}>{item.adresse}</Text>
              </View>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
              {item.prixEstime && (
                <View style={styles.prixPill}>
                  <Text style={styles.prixLabel}>{item.prixEstime} FCFA</Text>
                </View>
              )}

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
            </Apparition>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  hamburger: {
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
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "800", color: colors.ink900 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    overflow: "hidden",
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statSeparateur: { width: 1, height: 28, backgroundColor: colors.brand700 },
  statValeur: { fontSize: 16, fontWeight: "800", color: colors.white },
  statLabel: { fontSize: 11, color: colors.brand100 },
  statNoteRow: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  videTexte: { fontSize: 13, color: colors.ink500, textAlign: "center", lineHeight: 18 },
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cream100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeLabel: { fontSize: 11, fontWeight: "600", color: colors.ink700 },
  description: { fontSize: 13, color: colors.ink700 },
  prixPill: { backgroundColor: colors.accent400, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  prixLabel: { fontSize: 12, fontWeight: "800", color: colors.brand900 },
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
