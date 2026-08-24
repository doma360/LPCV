import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { ClipboardList, Navigation, Star } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { distanceKm } from "@/lib/distance";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { polices } from "@/theme/typography";

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
  profession: { nom: string; slug: string };
  professionnel: { nom: string; prenom: string } | null;
  avis: { id: string } | null;
}

const statutLabels: Record<string, { label: string; color: string; fond: string }> = {
  EN_ATTENTE: { label: "En attente de réponse...", color: colors.accent700, fond: colors.accent300 },
  ACCEPTEE: { label: "Acceptée", color: colors.brand700, fond: colors.brand50 },
  EN_ROUTE: { label: "En route", color: colors.brand700, fond: colors.brand50 },
  EN_COURS: { label: "En cours", color: colors.brand700, fond: colors.brand50 },
  TERMINEE: { label: "Terminée", color: colors.success500, fond: "#E7F7EE" },
  ANNULEE: { label: "Annulée", color: colors.danger500, fond: "#FDECEC" },
  REFUSEE: { label: "Refusée", color: colors.danger500, fond: "#FDECEC" },
};

function CarteDemande({ demande, onAvisEnvoye }: { demande: Demande; onAvisEnvoye: (demandeId: string) => void }) {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const statut = statutLabels[demande.statut] ?? { label: demande.statut, color: colors.ink500, fond: colors.cream100 };
  const suivi =
    demande.statut === "EN_ROUTE" && demande.professionnelLat && demande.professionnelLng
      ? distanceKm(
          Number(demande.latitude),
          Number(demande.longitude),
          Number(demande.professionnelLat),
          Number(demande.professionnelLng),
        )
      : null;

  async function envoyerAvis() {
    if (note === 0) {
      setErreur("Choisissez une note");
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await apiFetch("/api/v1/avis", {
        method: "POST",
        body: JSON.stringify({ demandeId: demande.id, note, commentaire: commentaire || undefined }),
      });
      onAvisEnvoye(demande.id);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Envoi de l'avis impossible");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardMetier}>{demande.profession.nom}</Text>
        <View style={[styles.statutPill, { backgroundColor: statut.fond }]}>
          <Text style={[styles.statutLabel, { color: statut.color }]}>{statut.label}</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {demande.description}
      </Text>
      {demande.professionnel && (
        <Text style={styles.pro}>
          {demande.professionnel.prenom} {demande.professionnel.nom}
        </Text>
      )}

      {(suivi !== null || demande.prixEstime) && (
        <View style={styles.badgesRow}>
          {suivi !== null && (
            <View style={styles.badge}>
              <Navigation size={11} color={colors.brand700} />
              <Text style={styles.badgeLabel}>{suivi.toFixed(1)} km de chez vous</Text>
            </View>
          )}
          {demande.prixEstime && (
            <View style={styles.prixPill}>
              <Text style={styles.prixLabel}>{demande.prixEstime} FCFA</Text>
            </View>
          )}
        </View>
      )}

      {demande.statut === "REFUSEE" && (
        <Button
          label="Relancer la recherche"
          variant="outline"
          onPress={() =>
            router.push({ pathname: "/(client)/rechercher", params: { metier: demande.profession.slug, relance: "1" } })
          }
        />
      )}

      {demande.statut === "TERMINEE" && demande.avis && <Text style={styles.avisEnvoye}>Avis envoyé, merci !</Text>}

      {demande.statut === "TERMINEE" && !demande.avis && !formulaireOuvert && (
        <Button label="Laisser un avis" variant="outline" onPress={() => setFormulaireOuvert(true)} />
      )}

      {demande.statut === "TERMINEE" && !demande.avis && formulaireOuvert && (
        <View style={styles.formulaireAvis}>
          <View style={styles.etoiles}>
            {[1, 2, 3, 4, 5].map((valeur) => (
              <Pressable key={valeur} onPress={() => setNote(valeur)}>
                <Star size={26} color={colors.accent700} fill={valeur <= note ? colors.accent400 : "transparent"} />
              </Pressable>
            ))}
          </View>
          <TextField label="Commentaire (facultatif)" value={commentaire} onChangeText={setCommentaire} multiline />
          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          <Button label={envoi ? "Envoi..." : "Envoyer l'avis"} onPress={envoyerAvis} loading={envoi} />
        </View>
      )}
    </View>
  );
}

export default function MesDemandes() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // Statuts connus au tour précédent, pour détecter une transition
  // EN_ATTENTE -> REFUSEE (plutôt que de relancer à chaque poll).
  const statutsConnus = useRef<Record<string, string>>({});

  const charger = useCallback(async () => {
    const res = await apiFetch<Demande[]>("/api/v1/demandes");

    for (const demande of res.data) {
      const precedent = statutsConnus.current[demande.id];
      if (precedent === "EN_ATTENTE" && demande.statut === "REFUSEE") {
        router.push({ pathname: "/(client)/rechercher", params: { metier: demande.profession.slug, relance: "1" } });
        break;
      }
    }
    statutsConnus.current = Object.fromEntries(res.data.map((d) => [d.id, d.statut]));

    setDemandes(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  // Une demande "en route" a sa position mise à jour côté pro toutes les
  // ~15s, et une demande "en attente" peut être acceptée/refusée à tout
  // moment : on rafraîchit au même rythme pour réagir sans action du client.
  useEffect(() => {
    const aSuivre = demandes.some((d) => d.statut === "EN_ROUTE" || d.statut === "EN_ATTENTE");
    if (!aSuivre) return;
    const id = setInterval(charger, 15000);
    return () => clearInterval(id);
  }, [demandes, charger]);

  function marquerAvisEnvoye(demandeId: string) {
    setDemandes((prev) => prev.map((d) => (d.id === demandeId ? { ...d, avis: { id: "local" } } : d)));
  }

  const actives = demandes.filter((d) => d.statut === "EN_ATTENTE" || d.statut === "ACCEPTEE" || d.statut === "EN_ROUTE" || d.statut === "EN_COURS").length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>
      {demandes.length > 0 && (
        <Text style={styles.sousTitre}>
          {actives > 0 ? `${actives} en cours · ${demandes.length} au total` : `${demandes.length} demande${demandes.length > 1 ? "s" : ""}`}
        </Text>
      )}

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
            <Text style={styles.videTexte}>Vos demandes de déplacement apparaîtront ici une fois envoyées.</Text>
          </View>
        }
        renderItem={({ item }) => <CarteDemande demande={item} onAvisEnvoye={marquerAvisEnvoye} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "800", color: colors.ink900 },
  sousTitre: { fontSize: 12, color: colors.ink500, marginTop: 2 },
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
    gap: 8,
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
  description: { fontSize: 13, color: colors.ink700 },
  pro: { fontSize: 12, color: colors.ink500 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cream100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeLabel: { fontSize: 11, fontWeight: "600", color: colors.ink700 },
  prixPill: { backgroundColor: colors.accent400, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  prixLabel: { fontSize: 11, fontWeight: "800", color: colors.brand900 },
  avisEnvoye: { fontSize: 13, fontWeight: "600", color: colors.success500 },
  formulaireAvis: { gap: 10, marginTop: 4 },
  etoiles: { flexDirection: "row", gap: 8 },
  erreur: { color: colors.danger500, fontSize: 13 },
});
