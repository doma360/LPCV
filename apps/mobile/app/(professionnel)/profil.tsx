import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Briefcase,
  Camera,
  ChevronRight,
  Image as ImageIcon,
  MapPin,
  MessageSquareOff,
  Pencil,
  Settings,
  ShieldCheck,
  Star,
  ThumbsUp,
  X,
} from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, ApiError, WEBSITE_URL } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import EnTeteMarque from "@/components/EnTeteMarque";
import CarteMembreVisual from "@/components/CarteMembreVisual";
import Apparition from "@/components/Apparition";

const PORTFOLIO_MAX = 12;

interface ProfilDetail {
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  noteMoyenne: string;
  nombreAvis: number;
  photoUrl: string | null;
  createdAt: string;
  profession: { nom: string };
  portfolioUrls: string[];
  zones: { zone: { nom: string } }[];
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

interface Demande {
  id: string;
  statut: string;
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function joursRestants(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export default function Profil() {
  const { session, logout, updateUser } = useAuth();
  const router = useRouter();
  const [detail, setDetail] = useState<ProfilDetail | null>(null);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [interventions, setInterventions] = useState(0);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [envoiPhotoProfil, setEnvoiPhotoProfil] = useState(false);
  const [erreurPortfolio, setErreurPortfolio] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<ProfilDetail>(`/api/v1/professionnels/${session.user.id}`).then((res) => setDetail(res.data)).catch(() => {});
    apiFetch<Avis[]>(`/api/v1/avis/professionnel/${session.user.id}`).then((res) => setAvis(res.data)).catch(() => {});
    apiFetch<Abonnement | null>("/api/v1/abonnements/moi").then((res) => setAbonnement(res.data)).catch(() => {});
    apiFetch<Demande[]>("/api/v1/demandes")
      .then((res) => setInterventions(res.data.filter((d) => d.statut === "TERMINEE").length))
      .catch(() => {});
  }, [session]);

  const verifie = detail?.statutVerification === "VERIFIE";
  const abonnementActif = abonnement?.statut === "ACTIF";
  const localisation = detail?.zones.map((z) => z.zone.nom).slice(0, 2).join(", ");
  const avisPositifs = avis.filter((a) => a.note >= 4).length;
  const tauxSatisfaction = avis.length > 0 ? Math.round((avisPositifs / avis.length) * 100) : null;

  async function changerPhotoProfil() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const resultat = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (resultat.canceled) return;

    setEnvoiPhotoProfil(true);
    try {
      const url = await uploadPhoto(resultat.assets[0].uri);
      const res = await apiFetch<{ photoUrl: string }>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ photoUrl: url }),
      });
      updateUser({ photoUrl: res.data.photoUrl });
      setDetail((prev) => (prev ? { ...prev, photoUrl: res.data.photoUrl } : prev));
    } catch {
      // erreur silencieuse ici, non bloquante pour le reste de l'ecran
    } finally {
      setEnvoiPhotoProfil(false);
    }
  }

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

  const tuiles = [
    { valeur: interventions, label: "Missions réalisées", icone: Briefcase, couleur: colors.accent500 },
    { valeur: tauxSatisfaction !== null ? `${tauxSatisfaction}%` : "—", label: "Satisfaction", icone: ThumbsUp, couleur: colors.success500 },
    { valeur: detail?.nombreAvis ?? 0, label: "Avis reçus", icone: Star, couleur: colors.bleuClair },
    { valeur: detail?.zones.length ?? 0, label: "Zones desservies", icone: MapPin, couleur: colors.orange500 },
  ];

  return (
    <View style={styles.flex}>
      <EnTeteMarque onBellPress={() => router.push("/(professionnel)/notifications")} />

      <ScrollView contentContainerStyle={styles.container}>
        <Apparition style={styles.identiteRow}>
          <View style={styles.photoWrap}>
            {detail?.photoUrl ? (
              <Image source={{ uri: detail.photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitiales}>
                  {session?.user.prenom[0]}
                  {session?.user.nom[0]}
                </Text>
              </View>
            )}
            <Pressable style={styles.editPastille} onPress={changerPhotoProfil} disabled={envoiPhotoProfil}>
              {envoiPhotoProfil ? <ActivityIndicator size="small" color={colors.brand900} /> : <Pencil size={13} color={colors.brand900} />}
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>
              {session?.user.prenom} {session?.user.nom}
            </Text>
            <View style={styles.roleRow}>
              <Text style={styles.role}>{detail?.profession.nom ?? "—"} Professionnel</Text>
              {verifie && <ShieldCheck size={13} color={colors.success500} />}
            </View>
          </View>
        </Apparition>

        <Apparition delai={80} style={styles.zoneCarteMembre}>
          <CarteMembreVisual
            nom={session?.user.nom ?? ""}
            prenom={session?.user.prenom ?? ""}
            metier={detail?.profession.nom ?? "—"}
            telephone={session?.user.telephone}
            localisation={localisation}
            photoUrl={detail?.photoUrl}
            verifie={verifie}
            membreDepuis={detail ? formaterDate(detail.createdAt) : "—"}
            interventions={interventions}
            noteMoyenne={detail?.noteMoyenne}
            abonnement={{
              actif: abonnementActif,
              palier: abonnement?.palier,
              dateDebut: abonnement ? formaterDate(abonnement.dateDebut) : undefined,
              dateFin: abonnement ? formaterDate(abonnement.dateFin) : undefined,
              joursRestants: abonnement ? joursRestants(abonnement.dateFin) : undefined,
            }}
            qrValue={abonnementActif && session ? `${WEBSITE_URL}/verification/${session.user.id}` : null}
          />
        </Apparition>

        <Apparition delai={140}>
          <Text style={styles.sectionTitre}>Mon activité</Text>
          <View style={styles.tuilesGrille}>
            {tuiles.map((t) => (
              <View key={t.label} style={styles.tuile}>
                <View style={[styles.tuileIcone, { backgroundColor: t.couleur + "26" }]}>
                  <t.icone size={16} color={t.couleur} />
                </View>
                <Text style={styles.tuileValeur}>{t.valeur}</Text>
                <Text style={styles.tuileLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </Apparition>

        <Apparition delai={200}>
          <Pressable style={styles.lienRow} onPress={() => router.push("/(professionnel)/modifier-profil")}>
            <Pencil size={16} color={colors.ink700} />
            <Text style={styles.lienTexte}>Modifier mes services</Text>
            <ChevronRight size={16} color={colors.ink400} style={{ marginLeft: "auto" }} />
          </Pressable>
          <Pressable style={styles.lienRow} onPress={() => router.push("/(professionnel)/parametres")}>
            <Settings size={16} color={colors.ink700} />
            <Text style={styles.lienTexte}>Paramètres et sécurité</Text>
            <ChevronRight size={16} color={colors.ink400} style={{ marginLeft: "auto" }} />
          </Pressable>
        </Apparition>

        <Apparition delai={260} style={styles.avisSection}>
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
        </Apparition>

        <Apparition delai={320} style={styles.avisSection}>
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
        </Apparition>

        <View style={styles.logout}>
          <Button label="Déconnexion" variant="outline" onPress={logout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  container: { padding: 20, paddingBottom: 40 },
  identiteRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 4 },
  photoWrap: { width: 84, height: 84 },
  photo: { width: 84, height: 84, borderRadius: 42 },
  photoPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitiales: { color: colors.accent400, fontSize: 24, fontWeight: "800" },
  editPastille: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent400,
    borderWidth: 2,
    borderColor: colors.cream100,
    alignItems: "center",
    justifyContent: "center",
  },
  nom: { fontSize: 19, fontWeight: "800", color: colors.ink900 },
  roleRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 },
  role: { fontSize: 12, fontWeight: "700", color: colors.brand700 },
  zoneCarteMembre: { width: "100%", marginTop: 14 },
  sectionTitre: { fontSize: 15, fontWeight: "800", color: colors.ink900, marginTop: 22, marginBottom: 12 },
  tuilesGrille: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tuile: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  tuileIcone: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tuileValeur: { fontSize: 20, fontWeight: "800", color: colors.ink900 },
  tuileLabel: { fontSize: 11, color: colors.ink500, marginTop: 2 },
  lienRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  lienTexte: { fontSize: 13, fontWeight: "600", color: colors.ink900 },
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
  logout: { marginTop: 24, width: "100%" },
});
