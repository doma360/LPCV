import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Mail,
  MessageSquareOff,
  Pencil,
  Phone,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { uploadPhoto } from "@/lib/upload";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import EnTeteMarque from "@/components/EnTeteMarque";
import Apparition from "@/components/Apparition";

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  professionnel: { nom: string; prenom: string };
}

interface Demande {
  id: string;
  statut: string;
  professionnelId: string | null;
}

interface CompteDetail {
  createdAt: string;
}

const STATUTS_ACTIFS = new Set(["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS"]);

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Profil() {
  const { session, logout, updateUser } = useAuth();
  const router = useRouter();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [compte, setCompte] = useState<CompteDetail | null>(null);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Avis[]>("/api/v1/avis/mes-avis").then((res) => setAvis(res.data));
    apiFetch<Demande[]>("/api/v1/demandes").then((res) => setDemandes(res.data));
    apiFetch<CompteDetail>("/api/v1/users/me").then((res) => setCompte(res.data));
  }, []);

  async function changerPhoto() {
    setErreurPhoto(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErreurPhoto("Autorisation refusée pour accéder à la photo");
      return;
    }
    const resultat = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (resultat.canceled) return;

    setEnvoiPhoto(true);
    try {
      const url = await uploadPhoto(resultat.assets[0].uri);
      const res = await apiFetch<{ photoUrl: string }>("/api/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify({ photoUrl: url }),
      });
      updateUser({ photoUrl: res.data.photoUrl });
    } catch {
      setErreurPhoto("Envoi de la photo impossible");
    } finally {
      setEnvoiPhoto(false);
    }
  }

  const demandesEnCours = demandes.filter((d) => STATUTS_ACTIFS.has(d.statut)).length;
  const professionnelsContactes = new Set(demandes.filter((d) => d.professionnelId).map((d) => d.professionnelId)).size;

  const tuiles = [
    { valeur: demandes.length, label: "Demandes", icone: Calendar, couleur: colors.accent500 },
    { valeur: demandesEnCours, label: "En cours", icone: Briefcase, couleur: colors.orange500 },
    { valeur: professionnelsContactes, label: "Pros contactés", icone: Users, couleur: colors.bleuClair },
    { valeur: avis.length, label: "Avis laissés", icone: Star, couleur: colors.success500 },
  ];

  return (
    <View style={styles.flex}>
      <EnTeteMarque onBellPress={() => router.push("/(client)/notifications")} />

      <ScrollView contentContainerStyle={styles.container}>
        <Apparition style={styles.identiteRow}>
          <View style={styles.photoWrap}>
            {session?.user.photoUrl ? (
              <Image source={{ uri: session.user.photoUrl }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitiales}>
                  {session?.user.prenom[0]}
                  {session?.user.nom[0]}
                </Text>
              </View>
            )}
            <Pressable style={styles.editPastille} onPress={changerPhoto} disabled={envoiPhoto}>
              {envoiPhoto ? <ActivityIndicator size="small" color={colors.brand900} /> : <Pencil size={13} color={colors.brand900} />}
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nom}>
              {session?.user.prenom} {session?.user.nom}
            </Text>
            <Text style={styles.role}>Client</Text>
            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Phone size={11} color={colors.brand700} />
                <Text style={styles.chipTexte} numberOfLines={1}>
                  {session?.user.telephone}
                </Text>
              </View>
              <View style={styles.chip}>
                <Mail size={11} color={colors.brand700} />
                <Text style={styles.chipTexte} numberOfLines={1}>
                  {session?.user.email}
                </Text>
              </View>
            </View>
          </View>
        </Apparition>
        {erreurPhoto && <Text style={styles.erreur}>{erreurPhoto}</Text>}

        <Apparition delai={80}>
          <Pressable style={styles.infoCard} onPress={() => router.push("/(client)/parametres")}>
            <View style={styles.infoCardHeader}>
              <User size={15} color={colors.brand700} />
              <Text style={styles.infoCardTitre}>Informations personnelles</Text>
              <ChevronRight size={16} color={colors.ink400} style={{ marginLeft: "auto" }} />
            </View>
            <View style={styles.grilleInfo}>
              <View style={styles.champInfo}>
                <Text style={styles.champLabel}>Nom complet</Text>
                <Text style={styles.champValeur}>
                  {session?.user.prenom} {session?.user.nom}
                </Text>
              </View>
              <View style={styles.champInfo}>
                <Text style={styles.champLabel}>Date d'inscription</Text>
                <Text style={styles.champValeur}>{compte ? formaterDate(compte.createdAt) : "—"}</Text>
              </View>
              <View style={styles.champInfo}>
                <Text style={styles.champLabel}>Email</Text>
                <Text style={styles.champValeur} numberOfLines={1}>
                  {session?.user.email}
                </Text>
              </View>
              <View style={styles.champInfo}>
                <Text style={styles.champLabel}>Téléphone</Text>
                <Text style={styles.champValeur}>{session?.user.telephone}</Text>
              </View>
            </View>
          </Pressable>
        </Apparition>

        <Apparition delai={140}>
          <Text style={styles.sectionTitre}>Mes activités</Text>
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
          <Pressable style={styles.lienRow} onPress={() => router.push("/(client)/parametres")}>
            <Settings size={16} color={colors.ink700} />
            <Text style={styles.lienTexte}>Paramètres et sécurité</Text>
            <ChevronRight size={16} color={colors.ink400} style={{ marginLeft: "auto" }} />
          </Pressable>
        </Apparition>

        <Apparition delai={260} style={styles.avisSection}>
          <Text style={styles.avisTitle}>Mes avis laissés</Text>
          {avis.length === 0 && (
            <View style={styles.videCard}>
              <View style={styles.videIcone}>
                <MessageSquareOff size={22} color={colors.ink400} />
              </View>
              <Text style={styles.vide}>Aucun avis laissé pour l'instant.</Text>
            </View>
          )}
          {avis.map((item) => (
            <View key={item.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <Text style={styles.avisNom}>
                  {item.professionnel.prenom} {item.professionnel.nom}
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
  erreur: { color: colors.danger500, fontSize: 12, marginTop: 6 },
  nom: { fontSize: 19, fontWeight: "800", color: colors.ink900 },
  role: { fontSize: 12, fontWeight: "700", color: colors.brand700, marginTop: 1 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink100,
    maxWidth: 190,
  },
  chipTexte: { fontSize: 11, fontWeight: "600", color: colors.ink700 },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  infoCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  infoCardTitre: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  grilleInfo: { flexDirection: "row", flexWrap: "wrap" },
  champInfo: { width: "50%", marginBottom: 12 },
  champLabel: { fontSize: 10, fontWeight: "700", color: colors.ink400, textTransform: "uppercase" },
  champValeur: { fontSize: 13, fontWeight: "700", color: colors.ink900, marginTop: 2 },
  sectionTitre: { fontSize: 15, fontWeight: "800", color: colors.ink900, marginTop: 24, marginBottom: 12 },
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
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  lienTexte: { fontSize: 13, fontWeight: "600", color: colors.ink900 },
  avisSection: { marginTop: 24, gap: 10 },
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
  logout: { marginTop: 24 },
});
