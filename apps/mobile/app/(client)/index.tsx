import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MapPin, Star, ShieldCheck, Camera, Image as ImageIcon, X } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { useLocalisation } from "@/hooks/useLocalisation";
import { zones } from "@/data/zones";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";

interface Profession {
  id: string;
  nom: string;
  slug: string;
}

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  noteMoyenne: string;
  distanceKm: number;
  prixEstime: number;
}

export default function Rechercher() {
  const { position, refuse, chargement, demanderPosition, choisirZone } = useLocalisation();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [profession, setProfession] = useState<Profession | null>(null);
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [recherche, setRecherche] = useState(false);

  const [candidatChoisi, setCandidatChoisi] = useState<Candidat | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Profession[]>("/api/v1/vitrine/metiers").then((res) => setProfessions(res.data));
  }, []);

  useEffect(() => {
    if (!profession || !position) return;
    setRecherche(true);
    setCandidats(null);
    apiFetch<{ candidats: Candidat[] }>(
      `/api/v1/professionnels/matching?metier=${profession.slug}&lat=${position.lat}&lng=${position.lng}`,
    )
      .then((res) => setCandidats(res.data.candidats))
      .finally(() => setRecherche(false));
  }, [profession, position]);

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

  async function confirmerDemande() {
    if (!candidatChoisi || !profession || !position) return;
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
          professionId: profession.id,
          professionnelId: candidatChoisi.id,
          description,
          adresse: position.label,
          latitude: position.lat,
          longitude: position.lng,
          photosUrls: photos,
        }),
      });
      setSucces(`Demande envoyée à ${candidatChoisi.prenom} ${candidatChoisi.nom}.`);
      setCandidatChoisi(null);
      setDescription("");
      setPhotos([]);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rechercher</Text>

      {succes && <Text style={styles.succes}>{succes}</Text>}

      <View style={styles.chips}>
        {professions.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setProfession(p)}
            style={[styles.chip, profession?.id === p.id && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, profession?.id === p.id && styles.chipLabelActive]}>{p.nom}</Text>
          </Pressable>
        ))}
      </View>

      {!position && (
        <View style={styles.localisation}>
          <Button label="Utiliser ma position" onPress={demanderPosition} loading={chargement} />
          {refuse && (
            <>
              <Text style={styles.aide}>Position refusée — choisissez votre quartier :</Text>
              <View style={styles.chips}>
                {zones.map((zone) => (
                  <Pressable key={zone.nom} onPress={() => choisirZone(zone)} style={styles.chip}>
                    <Text style={styles.chipLabel}>{zone.nom}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {position && (
        <View style={styles.positionBadge}>
          <MapPin size={14} color={colors.brand700} />
          <Text style={styles.positionText}>{position.label}</Text>
        </View>
      )}

      {recherche && <ActivityIndicator style={{ marginTop: 20 }} color={colors.brand700} />}

      {candidatChoisi ? (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>
            {candidatChoisi.prenom} {candidatChoisi.nom}
          </Text>
          <Text style={styles.confirmPrix}>Estimation : {candidatChoisi.prixEstime} FCFA</Text>
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
          <Button label={envoi ? "Envoi..." : "Confirmer la demande"} onPress={confirmerDemande} loading={envoi} />
          <Button
            label="Annuler"
            variant="outline"
            onPress={() => {
              setCandidatChoisi(null);
              setPhotos([]);
              setErreur(null);
            }}
          />
        </View>
      ) : (
        <FlatList
          data={candidats ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingTop: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => setCandidatChoisi(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.prenom[0]}
                  {item.nom[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardNom}>
                  {item.prenom} {item.nom}
                </Text>
                <View style={styles.cardMeta}>
                  <MapPin size={12} color={colors.ink500} />
                  <Text style={styles.cardMetaText}>{item.distanceKm.toFixed(1)} km</Text>
                  <Star size={12} color={colors.accent700} />
                  <Text style={styles.cardMetaText}>{item.noteMoyenne}</Text>
                  <ShieldCheck size={12} color={colors.success500} />
                </View>
              </View>
              <Text style={styles.cardPrix}>{item.prixEstime} F</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900, marginBottom: 16 },
  succes: { color: colors.success500, fontWeight: "600", marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  chipLabelActive: { color: colors.accent400 },
  localisation: { marginTop: 16, gap: 10 },
  aide: { fontSize: 13, color: colors.ink500 },
  positionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  positionText: { fontSize: 12, fontWeight: "600", color: colors.ink700 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 13 },
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
  cardNom: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cardMetaText: { fontSize: 12, color: colors.ink500, marginRight: 6 },
  cardPrix: { fontSize: 14, fontWeight: "700", color: colors.brand900 },
  confirmCard: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: colors.ink900 },
  confirmPrix: { fontSize: 14, fontWeight: "700", color: colors.brand700 },
  erreur: { color: colors.danger500, fontSize: 13 },
});
