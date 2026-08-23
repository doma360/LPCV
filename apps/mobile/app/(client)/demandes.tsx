import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Navigation, Star } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { distanceKm } from "@/lib/distance";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";

interface Reservation {
  id: string;
  statut: "EN_ATTENTE" | "CONFIRMEE" | "PAYEE" | "TERMINEE" | "ANNULEE" | "REFUSEE";
  description: string;
  montant: string | null;
  profession: { nom: string };
  professionnel: { nom: string; prenom: string };
}

const statutReservationLabels: Record<Reservation["statut"], { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente de réponse...", color: colors.accent700 },
  CONFIRMEE: { label: "À payer", color: colors.brand700 },
  PAYEE: { label: "Confirmée", color: colors.success500 },
  TERMINEE: { label: "Terminée", color: colors.success500 },
  ANNULEE: { label: "Annulée", color: colors.danger500 },
  REFUSEE: { label: "Refusée", color: colors.danger500 },
};

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

const statutLabels: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente de réponse...", color: colors.accent700 },
  ACCEPTEE: { label: "Acceptée", color: colors.brand700 },
  EN_ROUTE: { label: "En route", color: colors.brand700 },
  EN_COURS: { label: "En cours", color: colors.brand700 },
  TERMINEE: { label: "Terminée", color: colors.success500 },
  ANNULEE: { label: "Annulée", color: colors.danger500 },
  REFUSEE: { label: "Refusée", color: colors.danger500 },
};

function CarteDemande({ demande, onAvisEnvoye }: { demande: Demande; onAvisEnvoye: (demandeId: string) => void }) {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const statut = statutLabels[demande.statut] ?? { label: demande.statut, color: colors.ink500 };
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
        <Text style={[styles.statut, { color: statut.color }]}>{statut.label}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {demande.description}
      </Text>
      {demande.professionnel && (
        <Text style={styles.pro}>
          {demande.professionnel.prenom} {demande.professionnel.nom}
        </Text>
      )}
      {suivi !== null && (
        <View style={styles.suivi}>
          <Navigation size={12} color={colors.brand700} />
          <Text style={styles.suiviText}>{suivi.toFixed(1)} km de chez vous</Text>
        </View>
      )}
      {demande.prixEstime && <Text style={styles.prix}>{demande.prixEstime} FCFA</Text>}
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
  const [onglet, setOnglet] = useState<"demandes" | "reservations">("demandes");
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
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

  const chargerReservations = useCallback(async () => {
    const res = await apiFetch<Reservation[]>("/api/v1/reservations");
    setReservations(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
      chargerReservations();
    }, [charger, chargerReservations]),
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes demandes</Text>

      <View style={styles.onglets}>
        <Pressable onPress={() => setOnglet("demandes")} style={[styles.onglet, onglet === "demandes" && styles.ongletActif]}>
          <Text style={[styles.ongletLabel, onglet === "demandes" && styles.ongletLabelActif]}>Déplacement</Text>
        </Pressable>
        <Pressable
          onPress={() => setOnglet("reservations")}
          style={[styles.onglet, onglet === "reservations" && styles.ongletActif]}
        >
          <Text style={[styles.ongletLabel, onglet === "reservations" && styles.ongletLabelActif]}>Réservations</Text>
        </Pressable>
      </View>

      {onglet === "demandes" ? (
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
          renderItem={({ item }) => <CarteDemande demande={item} onAvisEnvoye={marquerAvisEnvoye} />}
        />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingTop: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={styles.vide}>Aucune réservation pour l'instant.</Text>}
          renderItem={({ item }) => {
            const statut = statutReservationLabels[item.statut];
            return (
              <Pressable style={styles.card} onPress={() => router.push(`/(client)/reservation/${item.id}`)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardMetier}>{item.profession.nom}</Text>
                  <Text style={[styles.statut, { color: statut.color }]}>{statut.label}</Text>
                </View>
                <Text style={styles.pro}>
                  {item.professionnel.prenom} {item.professionnel.nom}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.montant && <Text style={styles.prix}>{item.montant} FCFA</Text>}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900 },
  onglets: { flexDirection: "row", gap: 6, backgroundColor: colors.white, borderRadius: 999, padding: 4, marginTop: 14, borderWidth: 1, borderColor: colors.ink100 },
  onglet: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  ongletActif: { backgroundColor: colors.brand900 },
  ongletLabel: { fontSize: 13, fontWeight: "700", color: colors.ink700 },
  ongletLabelActif: { color: colors.accent400 },
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
  avisEnvoye: { fontSize: 13, fontWeight: "600", color: colors.success500 },
  formulaireAvis: { gap: 10, marginTop: 4 },
  etoiles: { flexDirection: "row", gap: 8 },
  erreur: { color: colors.danger500, fontSize: 13 },
});
