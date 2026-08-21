import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { KeyRound, Lock, Mail } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function ReinitialiserMotDePasse() {
  const { identifiant: identifiantParam } = useLocalSearchParams<{ identifiant?: string }>();
  const [identifiant, setIdentifiant] = useState(identifiantParam ?? "");
  const [code, setCode] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function reinitialiser() {
    setErreur(null);
    setLoading(true);
    try {
      await apiFetch("/api/v1/auth/reinitialiser-mot-de-passe", {
        method: "POST",
        body: JSON.stringify({ identifiant, code, nouveauMotDePasse }),
      });
      router.replace({ pathname: "/(auth)/authentification", params: { onglet: "connexion" } });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Réinitialisation impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Nouveau mot de passe</Text>
        <Text style={styles.subtitle}>Entrez le code reçu et votre nouveau mot de passe.</Text>

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
            label="Code à 6 chiffres"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            icon={KeyRound}
          />
          <TextField
            label="Nouveau mot de passe"
            value={nouveauMotDePasse}
            onChangeText={setNouveauMotDePasse}
            secureTextEntry
            icon={Lock}
          />

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}

          <Button
            label={loading ? "Validation..." : "Réinitialiser"}
            showArrow
            onPress={reinitialiser}
            loading={loading}
            disabled={!identifiant || code.length !== 6 || !nouveauMotDePasse}
          />
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
});
