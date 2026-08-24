import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft, Phone, Send } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import { polices } from "@/theme/typography";

type Statut = "EN_ATTENTE" | "CONFIRMEE" | "PAYEE" | "TERMINEE" | "ANNULEE" | "REFUSEE";

interface Reservation {
  id: string;
  description: string;
  dateSouhaitee: string | null;
  dateConfirmee: string | null;
  montant: string | null;
  statut: Statut;
  client: { id: string; nom: string; prenom: string };
  professionnel: { id: string; nom: string; prenom: string };
  profession: { nom: string };
}

interface Message {
  id: string;
  contenu: string;
  clientId: string | null;
  professionnelId: string | null;
  createdAt: string;
}

const STATUT_LABEL: Record<Statut, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente de réponse du professionnel", color: colors.accent700 },
  CONFIRMEE: { label: "Confirmée — en attente de paiement", color: colors.brand700 },
  PAYEE: { label: "Payée — réservation active", color: colors.success500 },
  TERMINEE: { label: "Terminée", color: colors.success500 },
  ANNULEE: { label: "Annulée", color: colors.danger500 },
  REFUSEE: { label: "Refusée par le professionnel", color: colors.danger500 },
};

const DISCUSSION_OUVERTE: Statut[] = ["EN_ATTENTE", "CONFIRMEE"];

export default function ReservationDetailScreen({ id }: { id: string }) {
  const { session } = useAuth();
  const role = session?.role;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [texteMessage, setTexteMessage] = useState("");
  const [dateConfirmee, setDateConfirmee] = useState("");
  const [montant, setMontant] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    apiFetch<Reservation>(`/api/v1/reservations/${id}`).then((res) => setReservation(res.data));
    apiFetch<Message[]>(`/api/v1/reservations/${id}/messages`).then((res) => setMessages(res.data));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function envoyerMessage() {
    if (!texteMessage.trim()) return;
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/messages`, { method: "POST", body: JSON.stringify({ contenu: texteMessage }) });
      setTexteMessage("");
      charger();
    } finally {
      setEnvoi(false);
    }
  }

  async function lancerAppel() {
    try {
      await apiFetch(`/api/v1/reservations/${id}/appel`, { method: "POST" });
      const message = "Le correspondant va recevoir un appel dans quelques secondes.";
      if (Platform.OS === "web") window.alert(message);
      else Alert.alert("Appel lancé", message);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Appel impossible";
      if (Platform.OS === "web") window.alert(message);
      else Alert.alert("Erreur", message);
    }
  }

  async function confirmer() {
    if (!dateConfirmee || !montant) {
      setErreur("Renseignez la date et les honoraires convenus");
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/confirmer`, {
        method: "PATCH",
        body: JSON.stringify({ dateConfirmee: new Date(dateConfirmee).toISOString(), montant: Number(montant) }),
      });
      charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Confirmation impossible");
    } finally {
      setEnvoi(false);
    }
  }

  async function refuser() {
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/refuser`, { method: "PATCH" });
      charger();
    } finally {
      setEnvoi(false);
    }
  }

  async function annuler() {
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/annuler`, { method: "PATCH" });
      charger();
    } finally {
      setEnvoi(false);
    }
  }

  async function terminer() {
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/reservations/${id}/terminer`, { method: "PATCH" });
      charger();
    } finally {
      setEnvoi(false);
    }
  }

  async function payer() {
    setEnvoi(true);
    setErreur(null);
    try {
      await apiFetch(`/api/v1/reservations/${id}/payer`, { method: "POST", body: JSON.stringify({ methode: "ORANGE_MONEY" }) });
      charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Paiement impossible");
    } finally {
      setEnvoi(false);
    }
  }

  if (!reservation) {
    return (
      <View style={styles.chargement}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  const statutInfo = STATUT_LABEL[reservation.statut];
  const autrePersonne = role === "client" ? reservation.professionnel : reservation.client;

  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>

      <Text style={styles.title}>{reservation.profession.nom}</Text>
      <Text style={styles.avec}>
        Avec {autrePersonne.prenom} {autrePersonne.nom}
      </Text>
      <Text style={[styles.statut, { color: statutInfo.color }]}>{statutInfo.label}</Text>

      <Text style={styles.description}>{reservation.description}</Text>

      {reservation.montant && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Honoraires</Text>
          <Text style={styles.infoValeur}>{reservation.montant} FCFA</Text>
        </View>
      )}
      {reservation.dateConfirmee && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rendez-vous</Text>
          <Text style={styles.infoValeur}>{new Date(reservation.dateConfirmee).toLocaleString("fr-FR")}</Text>
        </View>
      )}

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      {role === "professionnel" && reservation.statut === "EN_ATTENTE" && (
        <View style={styles.formConfirmation}>
          <Text style={styles.label}>Fixer un horaire et vos honoraires</Text>
          <TextField label="Date et heure" value={dateConfirmee} onChangeText={setDateConfirmee} placeholder="2026-09-01T15:00" />
          <TextField label="Honoraires (FCFA)" value={montant} onChangeText={setMontant} keyboardType="number-pad" />
          <View style={styles.actionsLigne}>
            <View style={styles.flex}>
              <Button label="Confirmer" onPress={confirmer} loading={envoi} />
            </View>
            <Pressable style={styles.boutonRefuser} onPress={refuser} disabled={envoi}>
              <Text style={styles.boutonRefuserLabel}>Refuser</Text>
            </Pressable>
          </View>
        </View>
      )}

      {role === "client" && reservation.statut === "CONFIRMEE" && (
        <Button label={envoi ? "Paiement..." : "Payer et confirmer"} onPress={payer} loading={envoi} />
      )}

      {role === "client" && ["EN_ATTENTE", "CONFIRMEE"].includes(reservation.statut) && (
        <Pressable style={styles.boutonAnnuler} onPress={annuler} disabled={envoi}>
          <Text style={styles.boutonAnnulerLabel}>Annuler la demande</Text>
        </Pressable>
      )}

      {role === "professionnel" && reservation.statut === "PAYEE" && (
        <Button label="Marquer terminée" onPress={terminer} loading={envoi} />
      )}

      {DISCUSSION_OUVERTE.includes(reservation.statut) && (
        <View style={styles.discussion}>
          <View style={styles.discussionHeader}>
            <Text style={styles.label}>Discussion</Text>
            <Pressable style={styles.boutonAppel} onPress={lancerAppel}>
              <Phone size={16} color={colors.brand900} />
            </Pressable>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            style={styles.messagesListe}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => {
              const estMoi = role === "client" ? !!item.clientId : !!item.professionnelId;
              return (
                <View style={[styles.bulle, estMoi ? styles.bulleMoi : styles.bulleAutre]}>
                  <Text style={[styles.bulleTexte, estMoi && styles.bulleTexteMoi]}>{item.contenu}</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.vide}>Aucun message pour l'instant.</Text>}
          />

          <View style={styles.messageInputRow}>
            <View style={styles.flex}>
              <TextField label="" value={texteMessage} onChangeText={setTexteMessage} placeholder="Écrire un message..." />
            </View>
            <Pressable style={styles.envoyerBtn} onPress={envoyerMessage} disabled={envoi}>
              <Send size={18} color={colors.brand900} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, gap: 10 },
  chargement: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream100 },
  flex: { flex: 1 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontFamily: polices.titre, fontSize: 20, fontWeight: "700", color: colors.ink900 },
  avec: { fontSize: 13, color: colors.ink500 },
  statut: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  description: { fontSize: 14, color: colors.ink700, marginTop: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  infoLabel: { fontSize: 13, color: colors.ink500 },
  infoValeur: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  erreur: { color: colors.danger500, fontSize: 13 },
  label: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  formConfirmation: { gap: 10, marginTop: 8 },
  actionsLigne: { flexDirection: "row", gap: 10, alignItems: "center" },
  boutonRefuser: { paddingHorizontal: 18, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 1, borderColor: colors.danger500 },
  boutonRefuserLabel: { color: colors.danger500, fontWeight: "700", fontSize: 14 },
  boutonAnnuler: { alignSelf: "flex-start", marginTop: 4 },
  boutonAnnulerLabel: { color: colors.danger500, fontSize: 13, fontWeight: "600" },
  discussion: { flex: 1, marginTop: 12, gap: 8 },
  discussionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  boutonAppel: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" },
  messagesListe: { flex: 1 },
  vide: { color: colors.ink400, fontSize: 13, textAlign: "center", marginTop: 20 },
  bulle: { maxWidth: "80%", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  bulleMoi: { backgroundColor: colors.brand900, alignSelf: "flex-end" },
  bulleAutre: { backgroundColor: colors.white, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.ink100 },
  bulleTexte: { fontSize: 13, color: colors.ink900 },
  bulleTexteMoi: { color: colors.white },
  messageInputRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  envoyerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accent400, alignItems: "center", justifyContent: "center", marginBottom: 4 },
});
