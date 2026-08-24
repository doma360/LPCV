import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { ArrowLeft, Lock, Mail, Phone, User } from "lucide-react-native";
import { useAuth, type Role } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { polices } from "@/theme/typography";

interface Profession {
  id: string;
  nom: string;
}

type Onglet = "connexion" | "inscription";

// Structure reprise d'une reference envoyee par l'utilisateur (fond mur +
// lampe eclairant le logo, panneau formulaire en dessous) mais dans le
// theme clair deja etabli sur le reste de l'app, pas le fond sombre de la
// reference ("le theme ne change pas") : le halo lumineux au-dessus du logo
// reprend la meme technique degrade radial que l'ecran Bienvenue plutot
// qu'un mur de briques litteral. Cases "Se souvenir de moi" et "J'accepte
// les conditions" de la reference non reprises : aucune des deux
// fonctionnalites n'existe cote backend (voir docs/decisions.md).
export default function Authentification() {
  const { login, registerClient, registerProfessionnel } = useAuth();
  const { role: roleParam, onglet: ongletParam } = useLocalSearchParams<{ role?: string; onglet?: string }>();
  const role: Role = roleParam === "professionnel" ? "professionnel" : "client";
  const [onglet, setOnglet] = useState<Onglet>(ongletParam === "connexion" ? "connexion" : "inscription");

  // --- connexion ---
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasseConnexion, setMotDePasseConnexion] = useState("");
  const [erreurConnexion, setErreurConnexion] = useState<string | null>(null);
  const [loadingConnexion, setLoadingConnexion] = useState(false);

  // --- inscription ---
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [professionsStatut, setProfessionsStatut] = useState<"chargement" | "ok" | "erreur">("chargement");
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurInscription, setErreurInscription] = useState<string | null>(null);
  const [loadingInscription, setLoadingInscription] = useState(false);

  const chargerProfessions = useCallback(() => {
    if (role !== "professionnel") return;
    setProfessionsStatut("chargement");
    apiFetch<Profession[]>("/api/v1/vitrine/metiers")
      .then((res) => {
        setProfessions(res.data);
        setProfessionsStatut("ok");
      })
      .catch(() => setProfessionsStatut("erreur"));
  }, [role]);

  useEffect(() => {
    chargerProfessions();
  }, [chargerProfessions]);

  async function handleConnexion() {
    setErreurConnexion(null);
    setLoadingConnexion(true);
    try {
      await login(identifiant, motDePasseConnexion);
    } catch (err) {
      setErreurConnexion(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoadingConnexion(false);
    }
  }

  async function handleInscription() {
    setErreurInscription(null);

    if (role === "professionnel" && !professionId) {
      setErreurInscription("Choisissez votre métier");
      return;
    }

    setLoadingInscription(true);
    try {
      const input = { nom, prenom, email, telephone, motDePasse };
      if (role === "client") {
        await registerClient(input);
      } else {
        await registerProfessionnel({ ...input, professionId: professionId! });
      }
    } catch (err) {
      setErreurInscription(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoadingInscription(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <RadialGradient id="loginRayon" cx="50%" cy="0%" r="80%">
                <Stop offset="0" stopColor={colors.accent400} stopOpacity="0.9" />
                <Stop offset="0.5" stopColor={colors.accent300} stopOpacity="0.3" />
                <Stop offset="1" stopColor={colors.cream100} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#loginRayon)" />
          </Svg>
          <Image source={require("../../assets/logo-complet.png")} style={styles.logo} resizeMode="contain" />
          <View style={[styles.roleBadge, { backgroundColor: role === "client" ? colors.brand900 : colors.accent400 }]}>
            <Text style={[styles.roleBadgeText, { color: role === "client" ? colors.accent400 : colors.brand900 }]}>
              {role === "client" ? "Espace Client" : "Espace Professionnel"}
            </Text>
          </View>
        </View>

        <View style={styles.panneau}>
          <View style={styles.segmented}>
            <Pressable
              onPress={() => setOnglet("connexion")}
              style={[styles.segment, onglet === "connexion" && styles.segmentActive]}
            >
              <Text style={[styles.segmentLabel, onglet === "connexion" && styles.segmentLabelActive]}>Connexion</Text>
            </Pressable>
            <Pressable
              onPress={() => setOnglet("inscription")}
              style={[styles.segment, onglet === "inscription" && styles.segmentActive]}
            >
              <Text style={[styles.segmentLabel, onglet === "inscription" && styles.segmentLabelActive]}>Inscription</Text>
            </Pressable>
          </View>

          <Text style={styles.panneauTitre}>{onglet === "connexion" ? "Connexion" : "Créer un compte"}</Text>
          <Text style={styles.panneauSousTitre}>
            {onglet === "connexion"
              ? "Bienvenue ! Connectez-vous pour continuer"
              : "Rejoignez LPCV et trouvez les meilleurs professionnels"}
          </Text>

          {onglet === "connexion" ? (
            <View style={styles.form}>
              <TextField
                label="Email ou téléphone"
                value={identifiant}
                onChangeText={setIdentifiant}
                autoCapitalize="none"
                keyboardType="email-address"
                icon={Mail}
              />
              <TextField
                label="Mot de passe"
                value={motDePasseConnexion}
                onChangeText={setMotDePasseConnexion}
                secureTextEntry
                icon={Lock}
              />

              {erreurConnexion && <Text style={styles.erreur}>{erreurConnexion}</Text>}

              <Pressable onPress={() => router.push("/(auth)/mot-de-passe-oublie")}>
                <Text style={styles.lienMdp}>Mot de passe oublié ?</Text>
              </Pressable>

              <Button
                label={loadingConnexion ? "Connexion..." : "Se connecter"}
                showArrow
                floating
                onPress={handleConnexion}
                loading={loadingConnexion}
              />

              <Text style={styles.bascule}>
                Vous n'avez pas de compte ?{" "}
                <Text style={styles.basculeLien} onPress={() => setOnglet("inscription")}>
                  Créer un compte
                </Text>
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.colonne}>
                  <TextField label="Prénom" value={prenom} onChangeText={setPrenom} icon={User} />
                </View>
                <View style={styles.colonne}>
                  <TextField label="Nom" value={nom} onChangeText={setNom} icon={User} />
                </View>
              </View>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                icon={Mail}
              />
              <TextField label="Téléphone" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" icon={Phone} />
              <TextField label="Mot de passe" value={motDePasse} onChangeText={setMotDePasse} secureTextEntry icon={Lock} />

              {role === "professionnel" && (
                <View style={styles.form}>
                  <Text style={styles.label}>Métier</Text>
                  {professionsStatut === "chargement" && <ActivityIndicator color={colors.brand700} />}
                  {professionsStatut === "erreur" && (
                    <View style={styles.metierErreur}>
                      <Text style={styles.erreur}>Impossible de charger la liste des métiers. Vérifiez votre connexion.</Text>
                      <Pressable onPress={chargerProfessions}>
                        <Text style={styles.reessayer}>Réessayer</Text>
                      </Pressable>
                    </View>
                  )}
                  {professionsStatut === "ok" && (
                    <View style={styles.chips}>
                      {professions.map((profession) => (
                        <Pressable
                          key={profession.id}
                          onPress={() => setProfessionId(profession.id)}
                          style={[styles.chip, professionId === profession.id && styles.chipActive]}
                        >
                          <Text style={[styles.chipLabel, professionId === profession.id && styles.chipLabelActive]}>
                            {profession.nom}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {erreurInscription && <Text style={styles.erreur}>{erreurInscription}</Text>}

              <Button
                label={loadingInscription ? "Création..." : "Créer mon compte"}
                showArrow
                floating
                onPress={handleInscription}
                loading={loadingInscription}
              />

              <Text style={styles.bascule}>
                Vous avez déjà un compte ?{" "}
                <Text style={styles.basculeLien} onPress={() => setOnglet("connexion")}>
                  Se connecter
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  container: { flexGrow: 1, paddingBottom: 40 },
  retour: {
    position: "absolute",
    top: 56,
    left: 24,
    zIndex: 1,
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
  hero: { alignItems: "center", paddingTop: 100, paddingBottom: 24, overflow: "hidden" },
  logo: { width: 150, height: 152 },
  roleBadge: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7, marginTop: 8 },
  roleBadgeText: { fontSize: 13, fontWeight: "700" },
  panneau: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginHorizontal: 20,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.ink100,
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 999 },
  segmentActive: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentLabel: { fontSize: 14, fontWeight: "700", color: colors.ink500 },
  segmentLabelActive: { color: colors.brand900 },
  panneauTitre: { fontFamily: polices.titre, fontSize: 24, color: colors.ink900, marginTop: 4 },
  panneauSousTitre: { fontSize: 13, color: colors.ink500, marginTop: -8 },
  form: { gap: 14, marginTop: 4 },
  row: { flexDirection: "row", gap: 12 },
  colonne: { flex: 1 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  chipLabelActive: { color: colors.accent400 },
  erreur: { color: colors.danger500, fontSize: 13 },
  lienMdp: { textAlign: "right", color: colors.ink500, fontSize: 13, fontWeight: "600" },
  metierErreur: { gap: 8 },
  reessayer: { color: colors.brand700, fontSize: 13, fontWeight: "700" },
  bascule: { textAlign: "center", fontSize: 13, color: colors.ink500, marginTop: 4 },
  basculeLien: { color: colors.accent700, fontWeight: "700" },
});
