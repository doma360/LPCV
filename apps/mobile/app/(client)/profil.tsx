import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

export default function Profil() {
  const { session, logout } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable style={styles.parametres} onPress={() => router.push("/(client)/parametres")}>
        <Settings size={20} color={colors.ink500} />
      </Pressable>
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

      <View style={styles.spacer} />
      <Button label="Déconnexion" variant="outline" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60, alignItems: "center" },
  parametres: { position: "absolute", top: 56, right: 20, padding: 6 },
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
  spacer: { flex: 1 },
});
