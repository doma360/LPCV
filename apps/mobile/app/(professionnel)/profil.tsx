import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, MessageSquareOff, Pencil, Settings, Star, X } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, ApiError, WEBSITE_URL } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import CarteMembreVisual from "@/components/CarteMembreVisual";

const PORTFOLIO_MAX = 12;

interface ProfilDetail {
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  noteMoyenne: string;
  nombreAvis: number;
  photoUrl: string | null;
  createdAt: string;
  profession: { nom: string };
  portfolioUrls: string[];
}

interface Abonnement {
  statut: "ACTIF" | "EXPIRE" | "ANNULE";
  palier: "MENSUEL" | "ANNUEL";
  dateDebut: string;
  dateFin: string;
}

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  client: { nom: string; prenom: string };
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function joursRestants(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export default function Profil() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<ProfilDetail | null>(null);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [erreurPortfolio, setErreurPortfolio] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<ProfilDetail>(`/api/v1/professionnels/${session.user.id}`).then((res) => setDetail(res.data));
    apiFetch<Avis[]>(`/api/v1/avis/professionnel/${session.user.id}`).then((res) => setAvis(res.data));
    apiFetch<Abonnement | null>("/api/v1/abonnements/moi").then((res) => setAbonnement(res.data));
  }, [session]);

  const verifie = detail?.statutVerification === "VERIFIE";
  const abonnementActif = abonnement?.statut === "ACTIF";
  const numeroMembre = session ? session.user.id.slice(0, 8).toUpperCase() : "—";

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
        <Pressable style={styles.actionIcone} onPress={() => router.push("/(professionnel)/modifier-profil")}>
          <Pencil size={18} color={colors.ink500} />
        </Pressable>
        <Pressable style={styles.actionIcone} onPress={() => router.push("/(professionnel)/parametres")}>
          <Settings size={20} color={colors.ink500} />
        </Pressable>
      </View>

      <View style={styles.zoneCarteMembre}>
        <CarteMembreVisual
          nom={session?.user.nom ?? ""}
          prenom={session?.user.prenom ?? ""}
          metier={detail?.profession.nom ?? "—"}
          telephone={session?.user.telephone}
          photoUrl={detail?.photoUrl}
          verifie={verifie}
          numeroMembre={numeroMembre}
          membreDepuis={detail ? formaterDate(detail.createdAt) : "—"}
          abonnement={{
            actif: abonnementActif,
            palier: abonnement?.palier,
            dateDebut: abonnement ? formaterDate(abonnement.dateDebut) : undefined,
            dateFin: abonnement ? formaterDate(abonnement.dateFin) : undefined,
            joursRestants: abonnement ? joursRestants(abonnement.dateFin) : undefined,
          }}
          qrValue={abonnementActif && session ? `${WEBSITE_URL}/verification/${session.user.id}` : null}
        />
      </View>

      {detail && (
        <View style={styles.statutsRow}>
          <View style={styles.noteBadge}>
            <Star size={13} color={colors.accent700} fill={colors.accent500} />
            <Text style={styles.noteBadgeTexte}>
              {detail.noteMoyenne}/5 · {detail.nombreAvis} avis
            </Text>
          </View>
        </View>
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
        {avis.length === 0 && (
          <View style={styles.videCard}>
            <View style={styles.videIcone}>
              <MessageSquareOff size={22} color={colors.ink400} />
            </View>
            <Text style={styles.vide}>Aucun avis pour l'instant.</Text>
          </View>
        )}
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
  actionsHaut: { position: "absolute", top: 56, right: 20, zIndex: 1, flexDirection: "row", gap: 8 },
  actionIcone: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
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
  zoneCarteMembre: { width: "100%", marginTop: 12 },
  statutsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14, width: "100%" },
  noteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  noteBadgeTexte: { fontSize: 12, fontWeight: "700", color: colors.ink700 },
  avisSection: { width: "100%", marginTop: 24, gap: 10 },
  avisTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  videCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  videIcone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.cream100,
    alignItems: "center",
    justifyContent: "center",
  },
  vide: { fontSize: 13, color: colors.ink400 },
  avisCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  avisHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avisNom: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  avisNote: { flexDirection: "row", alignItems: "center", gap: 3 },
  avisNoteText: { fontSize: 12, fontWeight: "700", color: colors.accent700 },
  avisCommentaire: { fontSize: 13, color: colors.ink700 },
  logout: { marginTop: 28, width: "100%" },
});
