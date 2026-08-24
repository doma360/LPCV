import { Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import { ArrowLeft, ChevronRight, Home, Wrench } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";

const PROFILS = [
  {
    role: "professionnel" as const,
    titre: "Professionnel",
    accroche: "Je propose mes services",
    description: "Plombier, électricien, coiffeuse, menuisier...",
    icone: Wrench,
    teinteFond: colors.accent400,
    teinteIcone: colors.brand900,
    teinteTexte: colors.accent700,
  },
  {
    role: "client" as const,
    titre: "Client",
    accroche: "Je cherche un professionnel",
    description: "Pour vos travaux ou besoins du quotidien",
    icone: Home,
    teinteFond: colors.brand900,
    teinteIcone: colors.accent400,
    teinteTexte: colors.brand700,
  },
];

export default function ChoisirRole() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>L</Text>
        </View>
        <Text style={styles.title}>Je suis...</Text>
        <Text style={styles.subtitle}>Choisissez votre profil pour commencer</Text>
      </View>

      <View style={styles.cards}>
        {PROFILS.map((profil) => (
          <Pressable
            key={profil.role}
            style={styles.card}
            onPress={() => router.push({ pathname: "/(auth)/authentification", params: { role: profil.role } })}
          >
            <View style={[styles.iconTile, { backgroundColor: profil.teinteFond }]}>
              <profil.icone size={24} color={profil.teinteIcone} />
            </View>
            <View style={styles.cardTexte}>
              <Text style={styles.cardTitre}>{profil.titre}</Text>
              <Text style={[styles.cardAccroche, { color: profil.teinteTexte }]}>{profil.accroche}</Text>
              <Text style={styles.cardDescription}>{profil.description}</Text>
            </View>
            <View style={styles.chevron}>
              <ChevronRight size={18} color={colors.ink500} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 24, paddingTop: 60 },
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
  hero: { alignItems: "center", marginTop: 24, marginBottom: 36 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgeText: { fontSize: 22, fontWeight: "800", color: colors.accent400 },
  title: { fontFamily: polices.titre, fontSize: 26, fontWeight: "800", color: colors.ink900 },
  subtitle: { fontSize: 14, color: colors.ink500, marginTop: 6 },
  cards: { gap: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconTile: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardTexte: { flex: 1, gap: 2 },
  cardTitre: { fontSize: 17, fontWeight: "700", color: colors.ink900 },
  cardAccroche: { fontSize: 13, fontWeight: "700" },
  cardDescription: { fontSize: 12, color: colors.ink500 },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink100,
  },
});
