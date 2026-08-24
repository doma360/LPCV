import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import {
  ArrowLeft,
  BellRing,
  ChevronRight,
  Home,
  Lock,
  Search,
  ShieldCheck,
  ThumbsUp,
  TrendingUp,
  Wrench,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";
import LpcvLogo from "@/components/LpcvLogo";

const PROFILS = [
  {
    role: "professionnel" as const,
    titre: "Professionnel",
    accroche: "Je propose mes services",
    description: "Plombier, électricien, coiffeuse, menuisier, mécanicien...",
    icone: Wrench,
    teinteFond: colors.accent400,
    teinteIcone: colors.brand900,
    teinteTexte: colors.accent700,
    variante: "pro" as const,
    benefices: [
      { label: "Gagnez en visibilité", icone: ShieldCheck },
      { label: "Recevez des demandes", icone: BellRing },
      { label: "Développez votre activité", icone: TrendingUp },
    ],
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
    variante: "client" as const,
    benefices: [
      { label: "Trouvez facilement", icone: Search },
      { label: "Artisans vérifiés", icone: ShieldCheck },
      { label: "Service de qualité", icone: ThumbsUp },
    ],
  },
];

export default function ChoisirRole() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.retour} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitre}>
          Choisir <Text style={{ color: colors.accent400 }}>un rôle</Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <View style={styles.glowOuter}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
            <View style={styles.glowInner}>
              <View style={styles.logoBadge}>
                <LpcvLogo size={36} />
              </View>
            </View>
          </View>
          <Text style={styles.title}>
            Je <Text style={{ color: colors.accent500 }}>suis...</Text>
          </Text>
          <Text style={styles.subtitle}>Choisissez votre profil pour commencer</Text>
          <View style={styles.subtitleUnderline} />
        </View>

        <View style={styles.cards}>
          {PROFILS.map((profil) => (
            <Pressable
              key={profil.role}
              style={[styles.card, profil.variante === "pro" ? styles.cardPro : styles.cardClient]}
              onPress={() => router.push({ pathname: "/(auth)/authentification", params: { role: profil.role } })}
            >
              <View style={styles.cardTop}>
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
              </View>

              <View style={styles.separateur} />

              <View style={styles.beneficesRow}>
                {profil.benefices.map((b) => (
                  <View style={styles.beneficeItem} key={b.label}>
                    <b.icone size={13} color={profil.teinteFond === colors.brand900 ? colors.brand900 : colors.accent700} />
                    <Text style={styles.beneficeLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.confiance}>
          <ShieldCheck size={26} color={colors.accent700} />
          <View style={{ flex: 1 }}>
            <Text style={styles.confianceTitre}>Sécurité & Confiance</Text>
            <Text style={styles.confianceTexte}>LPCV vérifie chaque professionnel pour vous garantir le meilleur service.</Text>
          </View>
          <Lock size={18} color={colors.accent700} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100 },
  header: {
    backgroundColor: colors.brand900,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 3,
    borderBottomColor: colors.accent400,
  },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitre: { fontFamily: polices.titre, fontSize: 20, color: colors.white },
  scroll: { padding: 24, paddingBottom: 40 },
  hero: { alignItems: "center", marginTop: 8, marginBottom: 32 },
  glowOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.accent300,
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  glowInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.accent400,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { position: "absolute", borderRadius: 999 },
  dot1: { width: 10, height: 10, backgroundColor: colors.accent500, top: 6, left: 2 },
  dot2: { width: 7, height: 7, backgroundColor: colors.brand900, top: 30, right: -6 },
  dot3: { width: 6, height: 6, backgroundColor: colors.accent500, bottom: 4, left: 20 },
  title: { fontFamily: polices.titre, fontSize: 28, color: colors.ink900, marginTop: 4 },
  subtitle: { fontSize: 14, color: colors.ink500, marginTop: 8 },
  subtitleUnderline: { width: 40, height: 3, borderRadius: 2, backgroundColor: colors.accent400, marginTop: 10 },
  cards: { gap: 16 },
  card: {
    borderRadius: 22,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPro: { backgroundColor: colors.accent300 + "55", borderWidth: 1.5, borderColor: colors.accent400 },
  cardClient: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.ink900 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconTile: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cardTexte: { flex: 1, gap: 2 },
  cardTitre: { fontFamily: polices.titre, fontSize: 19, color: colors.ink900 },
  cardAccroche: { fontSize: 13, fontWeight: "700" },
  cardDescription: { fontSize: 12, color: colors.ink500 },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  separateur: { height: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 14 },
  beneficesRow: { flexDirection: "row", justifyContent: "space-between" },
  beneficeItem: { alignItems: "center", gap: 5, flex: 1 },
  beneficeLabel: { fontSize: 10, fontWeight: "600", color: colors.ink700, textAlign: "center" },
  confiance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.accent300 + "40",
    borderWidth: 1,
    borderColor: colors.accent500,
    borderStyle: "dashed",
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
  },
  confianceTitre: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  confianceTexte: { fontSize: 12, color: colors.ink500, marginTop: 2 },
});
