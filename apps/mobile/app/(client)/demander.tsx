import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Camera, Image as ImageIcon, X } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { useLocalisation } from "@/hooks/useLocalisation";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";

export default function Demander() {
  const { professionnelId, professionId, nomPro, prixEstime } = useLocalSearchParams<{
    professionnelId: string;
    professionId: string;
    nomPro: string;
    prixEstime?: string;
  }>();
  const { position } = useLocalisation();

  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function ajouterPhoto(depuisCamera: boolean) {
    if (photos.length >= 5) return;
    const permission =
      depuisCamera && Platform.OS !== "web"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErreur("Autorisation refusée pour accéder à la photo");
      return;
    }

    const resultat =
      depuisCamera && Platform.OS !== "web"
        ? await ImagePicker.launchCameraAsync({ quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (resultat.canceled) return;

    setEnvoiPhoto(true);
    try {
      const url = await uploadPhoto(resultat.assets[0].uri);
      setPhotos((prev) => [...prev, url]);
    } catch {
      setErreur("Envoi de la photo impossible");
    } finally {
      setEnvoiPhoto(false);
    }
  }

  async function confirmer() {
    if (!position) {
      setErreur("Position introuvable, revenez à l'accueil pour la renseigner");
      return;
    }
    if (description.trim().length < 10) {
      setErreur("Décrivez votre besoin en quelques mots (10 caractères minimum)");
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await apiFetch("/api/v1/demandes", {
        method: "POST",
        body: JSON.stringify({
          professionId,
          professionnelId,
          description,
          adresse: position.label,
          latitude: position.lat,
          longitude: position.lng,
          photosUrls: photos,
        }),
      });
      router.replace("/(client)/demandes");
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

        <Text style={styles.title}>Demander une intervention</Text>

        <View style={styles.recapCard}>
          <View style={styles.recapAvatar}>
            <Text style={styles.recapAvatarText}>{nomPro?.[0] ?? "?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recapNom}>{nomPro}</Text>
            <Text style={styles.recapSousTitre}>À domicile</Text>
          </View>
          {prixEstime && (
            <View style={styles.prixPill}>
              <Text style={styles.prixPillLabel}>{prixEstime} FCFA</Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <TextField
            label="Décrivez votre besoin"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <View>
            <Text style={styles.label}>Photos (facultatif)</Text>
            <View style={styles.photosRow}>
              {photos.map((url) => (
                <View key={url} style={styles.thumbWrap}>
                  <Image source={{ uri: url }} style={styles.thumb} />
                  <Pressable style={styles.thumbRemove} onPress={() => setPhotos((p) => p.filter((u) => u !== url))}>
                    <X size={12} color={colors.white} />
                  </Pressable>
                </View>
              ))}
              {photos.length < 5 && !envoiPhoto && (
                <>
                  <Pressable style={styles.photoBtn} onPress={() => ajouterPhoto(true)}>
                    <Camera size={18} color={colors.ink500} />
                  </Pressable>
                  <Pressable style={styles.photoBtn} onPress={() => ajouterPhoto(false)}>
                    <ImageIcon size={18} color={colors.ink500} />
                  </Pressable>
                </>
              )}
              {envoiPhoto && <ActivityIndicator color={colors.brand700} />}
            </View>
          </View>

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          <Button label={envoi ? "Envoi..." : "Confirmer la demande"} onPress={confirmer} loading={envoi} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 24, paddingTop: 60, gap: 12 },
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
  recapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  recapAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
  },
  recapAvatarText: { color: colors.accent400, fontWeight: "800", fontSize: 14 },
  recapNom: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  recapSousTitre: { fontSize: 12, color: colors.ink500, marginTop: 1 },
  prixPill: { backgroundColor: colors.accent400, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  prixPillLabel: { fontSize: 12, fontWeight: "800", color: colors.brand900 },
  form: { gap: 14, marginTop: 8 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink700, marginBottom: 6 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { width: 56, height: 56 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  thumbRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger500,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBtn: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ink200,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  erreur: { color: colors.danger500, fontSize: 13 },
});
