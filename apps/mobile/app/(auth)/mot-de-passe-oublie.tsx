import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

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
        body: JSON.stringify({ identifiant }),
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>Recevez un code de réinitialisation par email ou SMS.</Text>

        <View style={styles.form}>
          <TextField
            label="Email ou téléphone"
            value={identifiant}
            onChangeText={setIdentifiant}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          {envoye && <Text style={styles.succes}>Un code a été envoyé si ce compte existe.</Text>}

          <Button
            label={loading ? "Envoi..." : "Recevoir le code"}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 24, justifyContent: "center", gap: 8 },
  title: { fontSize: 26, fontWeight: "700", color: colors.ink900 },
  subtitle: { fontSize: 14, color: colors.ink500, marginBottom: 16 },
  form: { gap: 14 },
  erreur: { color: colors.danger500, fontSize: 13 },
  succes: { color: colors.success500, fontSize: 13 },
});
