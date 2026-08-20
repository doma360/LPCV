import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ShieldCheck, ShieldQuestion } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

interface ProfilDetail {
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  noteMoyenne: string;
  nombreAvis: number;
  profession: { nom: string };
}

export default function Profil() {
  const { session, logout } = useAuth();
  const [detail, setDetail] = useState<ProfilDetail | null>(null);

  useEffect(() => {
    if (!session) return;
    apiFetch<ProfilDetail>(`/api/v1/professionnels/${session.user.id}`).then((res) => setDetail(res.data));
  }, [session]);

  const verifie = detail?.statutVerification === "VERIFIE";

  return (
    <View style={styles.container}>
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

      <View style={styles.spacer} />
      <Button label="Déconnexion" variant="outline" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, alignItems: "center" },
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
  spacer: { flex: 1 },
});
