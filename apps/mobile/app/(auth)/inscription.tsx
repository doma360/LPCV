import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Lock, Mail, Phone, User } from "lucide-react-native";
import { useAuth, type Role } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

interface Profession {
  id: string;
  nom: string;
}

export default function Inscription() {
  const { registerClient, registerProfessionnel } = useAuth();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: Role = roleParam === "professionnel" ? "professionnel" : "client";

  const [professions, setProfessions] = useState<Profession[]>([]);
  const [professionId, setProfessionId] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Profession[]>("/api/v1/vitrine/metiers")
      .then((res) => setProfessions(res.data))
      .catch(() => setProfessions([]));
  }, []);

  async function handleSubmit() {
    setErreur(null);

    if (role === "professionnel" && !professionId) {
      setErreur("Choisissez votre métier");
      return;
    }

    setLoading(true);
    try {
      const input = { nom, prenom, email, telephone, motDePasse };
      if (role === "client") {
        await registerClient(input);
      } else {
        await registerProfessionnel({ ...input, professionId: professionId! });
      }
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.roleBadgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {role === "client" ? "Espace Client" : "Espace Professionnel"}
            </Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.changerRole}>Changer</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Prénom" value={prenom} onChangeText={setPrenom} icon={User} />
            </View>
            <View style={styles.flex}>
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
            </View>
          )}

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}

          <Button label={loading ? "Création..." : "Créer mon compte"} showArrow onPress={handleSubmit} loading={loading} />
        </View>
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
    gap: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink900,
  },
  roleBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -8,
  },
  roleBadge: {
    backgroundColor: colors.brand100,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand700,
  },
  changerRole: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink500,
  },
  form: {
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink700,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  chipActive: {
    backgroundColor: colors.brand900,
    borderColor: colors.brand900,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink700,
  },
  chipLabelActive: {
    color: colors.accent400,
  },
  erreur: {
    color: colors.danger500,
    fontSize: 13,
  },
});
