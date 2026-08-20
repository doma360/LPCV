import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function Connexion() {
  const { login } = useAuth();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErreur(null);
    setLoading(true);
    try {
      await login(identifiant, motDePasse);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.badge}>
          <Text style={styles.badgeText}>L</Text>
        </View>
        <Text style={styles.title}>Connexion</Text>
        <Text style={styles.subtitle}>Content de vous revoir.</Text>

        <View style={styles.form}>
          <TextField
            label="Email ou téléphone"
            value={identifiant}
            onChangeText={setIdentifiant}
            autoCapitalize="none"
            keyboardType="email-address"
            icon={Mail}
          />
          <TextField label="Mot de passe" value={motDePasse} onChangeText={setMotDePasse} secureTextEntry icon={Lock} />

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}

          <Button label={loading ? "Connexion..." : "Se connecter"} showArrow onPress={handleSubmit} loading={loading} />

          <Link href="/(auth)/mot-de-passe-oublie" style={styles.lienMdp}>
            Mot de passe oublié ?
          </Link>
        </View>

        <Link href="/(auth)/choisir-role" style={styles.lien}>
          Pas encore de compte ? Créer un compte
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: colors.cream100,
    padding: 24,
    justifyContent: "center",
    gap: 8,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent400,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.brand900,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.ink900,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink500,
    marginBottom: 16,
  },
  form: {
    gap: 14,
  },
  erreur: {
    color: colors.danger500,
    fontSize: 13,
  },
  lien: {
    marginTop: 24,
    textAlign: "center",
    color: colors.brand700,
    fontSize: 14,
    fontWeight: "600",
  },
  lienMdp: {
    textAlign: "center",
    color: colors.ink500,
    fontSize: 13,
    marginTop: 4,
  },
});
