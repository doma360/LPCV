import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquareOff, Settings, Star } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
  professionnel: { nom: string; prenom: string };
}

export default function Profil() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [avis, setAvis] = useState<Avis[]>([]);

  useEffect(() => {
    apiFetch<Avis[]>("/api/v1/avis/mes-avis").then((res) => setAvis(res.data));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.parametres} onPress={() => router.push("/(client)/parametres")}>
        <Settings size={20} color={colors.ink700} />
      </Pressable>

      <View style={styles.carteProfil}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.user.prenom[0]}
            {session?.user.nom[0]}
          </Text>
        </View>
        <Text style={styles.nom}>
          {session?.user.prenom} {session?.user.nom}
        </Text>
        <Text style={styles.info}>{session?.user.email}</Text>
        <Text style={styles.info}>{session?.user.telephone}</Text>
      </View>

      <View style={styles.avisSection}>
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
      </View>

      <View style={styles.logout}>
        <Button label="Déconnexion" variant="outline" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, alignItems: "center" },
  parametres: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  carteProfil: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.ink100,
    marginTop: 12,
  },
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
