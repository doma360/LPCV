import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function Reserver() {
  const { professionnelId, professionId, nomPro, adresseLocal } = useLocalSearchParams<{
    professionnelId: string;
    professionId: string;
    nomPro: string;
    adresseLocal?: string;
  }>();

  const [description, setDescription] = useState("");
  const [dateSouhaitee, setDateSouhaitee] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer() {
    if (description.trim().length < 10) {
      setErreur("Décrivez votre besoin en quelques mots (10 caractères minimum)");
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      const res = await apiFetch<{ id: string }>("/api/v1/reservations", {
        method: "POST",
        body: JSON.stringify({
          professionnelId,
          professionId,
          description,
          dateSouhaitee: dateSouhaitee ? new Date(dateSouhaitee).toISOString() : undefined,
        }),
      });
      router.replace(`/(client)/reservation/${res.data.id}`);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.retour} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.ink700} />
        </Pressable>

        <Text style={styles.title}>Demander une réservation</Text>
        <Text style={styles.subtitle}>
          Avec {nomPro}
          {adresseLocal ? ` · ${adresseLocal}` : ""}
        </Text>

        <View style={styles.form}>
          <TextField
            label="Décrivez votre besoin"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Ex. Coupe + coloration pour un mariage..."
          />
          <TextField
            label="Date souhaitée (facultatif)"
            value={dateSouhaitee}
            onChangeText={setDateSouhaitee}
            placeholder="2026-09-01T15:00"
          />
          <Text style={styles.aide}>
            Le professionnel vous répondra avec un horaire et ses honoraires. Vous pourrez discuter ou l'appeler avant
            de payer.
          </Text>

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          <Button label={envoi ? "Envoi..." : "Envoyer la demande"} onPress={envoyer} loading={envoi} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 24, paddingTop: 60, gap: 16 },
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
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900 },
  subtitle: { fontSize: 13, color: colors.ink500, marginTop: -8 },
  form: { gap: 14 },
  aide: { fontSize: 12, color: colors.ink400 },
  erreur: { color: colors.danger500, fontSize: 13 },
});
