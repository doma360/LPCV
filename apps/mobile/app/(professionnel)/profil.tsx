import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, IdCard, Image as ImageIcon, Pencil, Settings, ShieldCheck, ShieldQuestion, Star, X } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, ApiError } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

const PORTFOLIO_MAX = 12;

interface ProfilDetail {
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  noteMoyenne: string;
  nombreAvis: number;
  profession: { nom: string };
  portfolioUrls: string[];
}

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  client: { nom: string; prenom: string };
}

export default function Profil() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<ProfilDetail | null>(null);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [erreurPortfolio, setErreurPortfolio] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<ProfilDetail>(`/api/v1/professionnels/${session.user.id}`).then((res) => setDetail(res.data));
    apiFetch<Avis[]>(`/api/v1/avis/professionnel/${session.user.id}`).then((res) => setAvis(res.data));
  }, [session]);

  const verifie = detail?.statutVerification === "VERIFIE";

  async function ajouterPhotoPortfolio(depuisCamera: boolean) {
    if (!detail || detail.portfolioUrls.length >= PORTFOLIO_MAX) return;
    setErreurPortfolio(null);
    const permission =
      depuisCamera && Platform.OS !== "web"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErreurPortfolio("Autorisation refusée pour accéder à la photo");
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
      const res = await apiFetch<{ portfolioUrls: string[] }>("/api/v1/professionnels/portfolio", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      setDetail((prev) => (prev ? { ...prev, portfolioUrls: res.data.portfolioUrls } : prev));
    } catch (err) {
      setErreurPortfolio(err instanceof ApiError ? err.message : "Envoi de la photo impossible");
    } finally {
      setEnvoiPhoto(false);
    }
  }

  async function retirerPhotoPortfolio(url: string) {
    try {
      const res = await apiFetch<{ portfolioUrls: string[] }>("/api/v1/professionnels/portfolio", {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
      setDetail((prev) => (prev ? { ...prev, portfolioUrls: res.data.portfolioUrls } : prev));
    } catch {
      setErreurPortfolio("Suppression impossible");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.actionsHaut}>
        <Pressable style={styles.actionIcone} onPress={() => router.push("/(professionnel)/carte-membre")}>
          <IdCard size={19} color={colors.ink500} />
        </Pressable>
        <Pressable style={styles.actionIcone} onPress={() => router.push("/(professionnel)/modifier-profil")}>
          <Pencil size={18} color={colors.ink500} />
        </Pressable>
        <Pressable style={styles.actionIcone} onPress={() => router.push("/(professionnel)/parametres")}>
          <Settings size={20} color={colors.ink500} />
        </Pressable>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {session?.user.prenom[0]}
          {session?.user.nom[0]}
        </Text>
      </View>
      <Text style={styles.nom}>
        {session?.user.prenom} {session?.user.nom}
      </Text>
      <Text style={styles.info}>{detail?.profession.nom}</Text>

      <View style={[styles.badge, verifie ? styles.badgeVerifie : styles.badgeAttente]}>
        {verifie ? <ShieldCheck size={14} color={colors.success500} /> : <ShieldQuestion size={14} color={colors.accent700} />}
        <Text style={[styles.badgeLabel, { color: verifie ? colors.success500 : colors.accent700 }]}>
          {verifie ? "Profil vérifié" : "Vérification en attente"}
        </Text>
      </View>

      {detail && (
        <Text style={styles.note}>
          {detail.noteMoyenne}/5 · {detail.nombreAvis} avis
        </Text>
      )}

      <View style={styles.avisSection}>
        <Text style={styles.avisTitle}>Portfolio de réalisations</Text>
        {erreurPortfolio && <Text style={styles.erreur}>{erreurPortfolio}</Text>}
        <View style={styles.photosRow}>
          {detail?.portfolioUrls.map((url) => (
            <View key={url} style={styles.thumbWrap}>
              <Image source={{ uri: url }} style={styles.thumb} />
              <Pressable style={styles.thumbRemove} onPress={() => retirerPhotoPortfolio(url)}>
                <X size={12} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {(detail?.portfolioUrls.length ?? 0) < PORTFOLIO_MAX && !envoiPhoto && (
            <>
              <Pressable style={styles.photoBtn} onPress={() => ajouterPhotoPortfolio(true)}>
                <Camera size={18} color={colors.ink500} />
              </Pressable>
              <Pressable style={styles.photoBtn} onPress={() => ajouterPhotoPortfolio(false)}>
                <ImageIcon size={18} color={colors.ink500} />
              </Pressable>
            </>
          )}
          {envoiPhoto && <ActivityIndicator color={colors.brand700} />}
        </View>
      </View>

      <View style={styles.avisSection}>
        <Text style={styles.avisTitle}>Avis reçus</Text>
        {avis.length === 0 && <Text style={styles.vide}>Aucun avis pour l'instant.</Text>}
        {avis.map((item) => (
          <View key={item.id} style={styles.avisCard}>
            <View style={styles.avisHeader}>
              <Text style={styles.avisNom}>
                {item.client.prenom} {item.client.nom}
              </Text>
              <View style={styles.avisNote}>
                <Star size={12} color={colors.accent700} fill={colors.accent500} />
                <Text style={styles.avisNoteText}>{item.note}</Text>
              </View>
            </View>
            {item.commentaire && <Text style={styles.avisCommentaire}>{item.commentaire}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.logout}>
        <Button label="Déconnexion" variant="outline" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, alignItems: "center" },
  actionsHaut: { position: "absolute", top: 56, right: 20, zIndex: 1, flexDirection: "row", gap: 12 },
  actionIcone: { padding: 6 },
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: colors.accent400, fontSize: 24, fontWeight: "800" },
  nom: { fontSize: 18, fontWeight: "700", color: colors.ink900 },
  info: { fontSize: 13, color: colors.ink500, marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeVerifie: { backgroundColor: colors.success500 + "1A" },
  badgeAttente: { backgroundColor: colors.accent400 + "33" },
  badgeLabel: { fontSize: 12, fontWeight: "700" },
  note: { fontSize: 13, color: colors.ink700, marginTop: 10 },
  avisSection: { width: "100%", marginTop: 28, gap: 10 },
  avisTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  vide: { fontSize: 13, color: colors.ink400 },
  avisCard: { backgroundColor: colors.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.ink100, gap: 4 },
  avisHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avisNom: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  avisNote: { flexDirection: "row", alignItems: "center", gap: 3 },
  avisNoteText: { fontSize: 12, fontWeight: "700", color: colors.accent700 },
  avisCommentaire: { fontSize: 13, color: colors.ink700 },
  logout: { marginTop: 28, width: "100%" },
});
