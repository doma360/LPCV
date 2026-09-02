import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { ArrowLeft, Mail } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { polices } from "@/theme/typography";

// Meme structure hero (halo + logo) + panneau que authentification.tsx,
// pour rester cohérent visuellement sur tout le parcours (auth).
export default function MotDePasseOublie() {
  const [identifiant, setIdentifiant] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  async function envoyerCode() {
    setErreur(null);
    setLoading(true);
    try {
      await apiFetch("/api/v1/auth/mot-de-passe-oublie", {
        method: "POST",
        body: JSON.stringify({ identifiant: identifiant.trim() }),
      });
      setEnvoye(true);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Envoi impossible");
    } finally {
      setLoading(false);
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
              <RadialGradient id="mdpRayon" cx="50%" cy="0%" r="80%">
                <Stop offset="0" stopColor={colors.accent400} stopOpacity="0.9" />
                <Stop offset="0.5" stopColor={colors.accent300} stopOpacity="0.3" />
                <Stop offset="1" stopColor={colors.cream100} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#mdpRayon)" />
          </Svg>
          <Image source={require("../../assets/logo-complet.png")} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.panneau}>
          <Text style={styles.title}>Mot de passe oublié</Text>
          <Text style={styles.subtitle}>Recevez un code de réinitialisation par email ou SMS.</Text>

          <View style={styles.form}>
            <TextField
              label="Email ou téléphone"
              value={identifiant}
              onChangeText={setIdentifiant}
              autoCapitalize="none"
              keyboardType="email-address"
              icon={Mail}
            />

            {erreur && <Text style={styles.erreur}>{erreur}</Text>}
            {envoye && <Text style={styles.succes}>Un code a été envoyé si ce compte existe.</Text>}

            <Button
              label={loading ? "Envoi..." : "Recevoir le code"}
              showArrow
              floating
              onPress={envoyerCode}
              loading={loading}
              disabled={!identifiant}
            />

            {envoye && (
              <Button
                label="J'ai un code"
                variant="outline"
                onPress={() => router.push({ pathname: "/(auth)/reinitialiser-mot-de-passe", params: { identifiant } })}
              />
            )}
          </View>
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
  logo: { width: 140, height: 142 },
  panneau: {
    backgroundColor: colors.white,
    borderRadius: 28,
    marginHorizontal: 20,
    padding: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.ink100,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: { fontFamily: polices.titre, fontSize: 24, color: colors.ink900 },
  subtitle: { fontSize: 13, color: colors.ink500 },
  form: { gap: 14, marginTop: 12 },
  erreur: { color: colors.danger500, fontSize: 13 },
  succes: { color: colors.success500, fontSize: 13 },
});
