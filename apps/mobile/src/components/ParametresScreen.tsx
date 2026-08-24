import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import Text from "@/components/Texte";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { ArrowLeft, Bell, Fingerprint, KeyRound, TriangleAlert, UserRound } from "lucide-react-native";
import { useAuth, type Utilisateur } from "@/hooks/useAuth";
import { apiFetch, ApiError } from "@/lib/api";
import { getItem, setItem, deleteItem } from "@/lib/storage";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { polices } from "@/theme/typography";

const CLE_VERROUILLAGE = "lpcv_verrouillage_actif";

export default function ParametresScreen() {
  const { session, updateUser, logout } = useAuth();
  const router = useRouter();

  const [nom, setNom] = useState(session?.user.nom ?? "");
  const [prenom, setPrenom] = useState(session?.user.prenom ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [telephone, setTelephone] = useState(session?.user.telephone ?? "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoErreur, setInfoErreur] = useState<string | null>(null);
  const [infoSucces, setInfoSucces] = useState(false);

  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [mdpLoading, setMdpLoading] = useState(false);
  const [mdpErreur, setMdpErreur] = useState<string | null>(null);
  const [mdpSucces, setMdpSucces] = useState(false);

  const [notificationsActives, setNotificationsActives] = useState(session?.user.notificationsActives ?? true);

  const [verrouillageDisponible, setVerrouillageDisponible] = useState(false);
  const [verrouillageActif, setVerrouillageActif] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;
      const [materiel, enrole] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      setVerrouillageDisponible(materiel && enrole);
      const flag = await getItem(CLE_VERROUILLAGE);
      setVerrouillageActif(flag === "1");
    })();
  }, []);

  async function enregistrerInfos() {
    setInfoErreur(null);
    setInfoSucces(false);
    setInfoLoading(true);
    try {
      const res = await apiFetch<Utilisateur>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ nom, prenom, email, telephone }),
      });
      updateUser(res.data);
      setInfoSucces(true);
    } catch (err) {
      setInfoErreur(err instanceof ApiError ? err.message : "Mise à jour impossible");
    } finally {
      setInfoLoading(false);
    }
  }

  async function changerMotDePasse() {
    setMdpErreur(null);
    setMdpSucces(false);
    setMdpLoading(true);
    try {
      await apiFetch("/api/v1/users/me/mot-de-passe", {
        method: "PATCH",
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse }),
      });
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setMdpSucces(true);
    } catch (err) {
      setMdpErreur(err instanceof ApiError ? err.message : "Changement impossible");
    } finally {
      setMdpLoading(false);
    }
  }

  async function toggleNotifications(value: boolean) {
    setNotificationsActives(value);
    try {
      const res = await apiFetch<{ notificationsActives: boolean }>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ notificationsActives: value }),
      });
      updateUser({ notificationsActives: res.data.notificationsActives });
    } catch {
      setNotificationsActives(!value);
    }
  }

  async function toggleVerrouillage(value: boolean) {
    if (value) {
      const resultat = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirmez votre identité pour activer le déverrouillage rapide",
      });
      if (!resultat.success) return;
      await setItem(CLE_VERROUILLAGE, "1");
    } else {
      await deleteItem(CLE_VERROUILLAGE);
    }
    setVerrouillageActif(value);
  }

  async function desactiverCompte() {
    try {
      await apiFetch("/api/v1/users/me", { method: "DELETE" });
    } catch {
      // même en cas d'erreur réseau tardive, on déconnecte localement
    }
    await logout();
  }

  // Alert.alert n'a pas d'implémentation sur react-native-web (no-op silencieux) —
  // uniquement testable via web preview grâce à ce repli, le natif utilise Alert.
  function confirmerDesactivation() {
    if (Platform.OS === "web") {
      if (window.confirm("Désactiver le compte ? Vous serez déconnecté. Contactez le support pour le réactiver.")) {
        desactiverCompte();
      }
      return;
    }
    Alert.alert(
      "Désactiver le compte",
      "Votre compte sera désactivé et vous serez déconnecté. Contactez le support pour le réactiver.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Désactiver", style: "destructive", onPress: desactiverCompte },
      ],
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable style={styles.retour} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.ink700} />
          </Pressable>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <UserRound size={15} color={colors.brand700} />
            <Text style={styles.sectionTitle}>Informations du compte</Text>
          </View>
          <TextField label="Nom" value={nom} onChangeText={setNom} />
          <TextField label="Prénom" value={prenom} onChangeText={setPrenom} />
          <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
          {infoErreur && <Text style={styles.erreur}>{infoErreur}</Text>}
          {infoSucces && <Text style={styles.succes}>Informations mises à jour.</Text>}
          <Button label={infoLoading ? "Enregistrement..." : "Enregistrer"} onPress={enregistrerInfos} loading={infoLoading} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <KeyRound size={15} color={colors.brand700} />
            <Text style={styles.sectionTitle}>Sécurité</Text>
          </View>
          <TextField label="Mot de passe actuel" value={motDePasseActuel} onChangeText={setMotDePasseActuel} secureTextEntry />
          <TextField label="Nouveau mot de passe" value={nouveauMotDePasse} onChangeText={setNouveauMotDePasse} secureTextEntry />
          {mdpErreur && <Text style={styles.erreur}>{mdpErreur}</Text>}
          {mdpSucces && <Text style={styles.succes}>Mot de passe changé.</Text>}
          <Button
            label={mdpLoading ? "Changement..." : "Changer le mot de passe"}
            variant="outline"
            onPress={changerMotDePasse}
            loading={mdpLoading}
            disabled={!motDePasseActuel || !nouveauMotDePasse}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Bell size={15} color={colors.brand700} />
            <Text style={styles.sectionTitle}>Préférences</Text>
          </View>
          <View style={styles.ligne}>
            <Text style={styles.ligneLabel}>Notifications</Text>
            <Switch
              value={notificationsActives}
              onValueChange={toggleNotifications}
              trackColor={{ true: colors.accent400 }}
            />
          </View>
          {verrouillageDisponible && (
            <View style={styles.ligne}>
              <View style={styles.ligneLabelRow}>
                <Fingerprint size={14} color={colors.ink500} />
                <Text style={styles.ligneLabel}>Déverrouillage rapide (biométrie/PIN)</Text>
              </View>
              <Switch value={verrouillageActif} onValueChange={toggleVerrouillage} trackColor={{ true: colors.accent400 }} />
            </View>
          )}
        </View>

        <View style={[styles.section, styles.sectionDanger]}>
          <View style={styles.sectionTitleRow}>
            <TriangleAlert size={15} color={colors.danger500} />
            <Text style={[styles.sectionTitle, { color: colors.danger500 }]}>Zone de danger</Text>
          </View>
          <Button label="Désactiver mon compte" variant="outline" onPress={confirmerDesactivation} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  container: { padding: 20, paddingTop: 60, gap: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  retour: {
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
  section: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ink100,
    padding: 16,
    gap: 12,
  },
  sectionDanger: { borderColor: "#FBD5D5" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  ligne: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ligneLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginRight: 12 },
  ligneLabel: { fontSize: 14, color: colors.ink700, flex: 1, marginRight: 12 },
  erreur: { color: colors.danger500, fontSize: 13 },
  succes: { color: colors.success500, fontSize: 13 },
});
