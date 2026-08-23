import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { CalendarClock, ClipboardList, Search, Star, User } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import PromoCarousel from "@/components/PromoCarousel";

interface Demande {
  id: string;
  statut: string;
  profession: { nom: string };
  createdAt: string;
}

interface Reservation {
  id: string;
  statut: string;
  dateConfirmee: string | null;
  profession: { nom: string };
  professionnel: { nom: string; prenom: string };
}

const DEMANDE_ACTIVE = new Set(["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS"]);
const RESERVATION_ACTIVE = new Set(["EN_ATTENTE", "CONFIRMEE", "PAYEE"]);

const ACCES_RAPIDE = [
  { label: "Rechercher", description: "Un pro pour vous", icone: Search, fond: colors.accent400, texte: colors.brand900, route: "/(client)/rechercher" as const },
  { label: "Mes demandes", description: "Déplacements & réservations", icone: ClipboardList, fond: colors.brand900, texte: colors.white, route: "/(client)/demandes" as const },
  { label: "Avis laissés", description: "Vos évaluations", icone: Star, fond: colors.bleuClair, texte: colors.white, route: "/(client)/profil" as const },
  { label: "Profil", description: "Infos & paramètres", icone: User, fond: colors.orange500, texte: colors.white, route: "/(client)/profil" as const },
];

export default function Accueil() {
  const { session } = useAuth();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Demande[]>("/api/v1/demandes").then((res) => setDemandes(res.data));
      apiFetch<Reservation[]>("/api/v1/reservations").then((res) => setReservations(res.data));
    }, []),
  );

  const demandesActives = demandes.filter((d) => DEMANDE_ACTIVE.has(d.statut));
  const reservationsActives = reservations.filter((r) => RESERVATION_ACTIVE.has(r.statut));
  const enCours = [
    ...demandesActives.map((d) => ({ id: d.id, type: "demande" as const, profession: d.profession.nom, sousTitre: "Déplacement" })),
    ...reservationsActives.map((r) => ({
      id: r.id,
      type: "reservation" as const,
      profession: r.profession.nom,
      sousTitre: `Chez ${r.professionnel.prenom} ${r.professionnel.nom}`,
    })),
  ];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.salutation}>Bonjour{session ? `, ${session.user.prenom}` : ""} 👋</Text>
      <Text style={styles.sousSalutation}>Trouvez un professionnel de confiance près de chez vous.</Text>

      <Pressable style={styles.rechercheBarre} onPress={() => router.push("/(client)/rechercher")}>
        <Search size={18} color={colors.ink400} />
        <Text style={styles.rechercheTexte}>Rechercher un métier...</Text>
      </Pressable>

      <View style={styles.section}>
        <PromoCarousel />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitre}>Accès rapide</Text>
        <View style={styles.grille}>
          {ACCES_RAPIDE.map((item) => {
            const Icone = item.icone;
            return (
              <Pressable key={item.label} style={styles.tuile} onPress={() => router.push(item.route)}>
                <View style={[styles.tuileIcone, { backgroundColor: item.fond }]}>
                  <Icone size={20} color={item.texte} />
                </View>
                <Text style={styles.tuileLabel}>{item.label}</Text>
                <Text style={styles.tuileDescription}>{item.description}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {enCours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Vos demandes en cours</Text>
          <View style={{ gap: 10 }}>
            {enCours.map((item) => (
              <Pressable
                key={`${item.type}-${item.id}`}
                style={styles.carteEnCours}
                onPress={() =>
                  router.push(
                    item.type === "demande" ? "/(client)/demandes" : `/(client)/reservation/${item.id}`,
                  )
                }
              >
                <View style={styles.carteEnCoursIcone}>
                  <CalendarClock size={16} color={colors.brand700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.carteEnCoursTitre}>{item.profession}</Text>
                  <Text style={styles.carteEnCoursSousTitre}>{item.sousTitre}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  container: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  salutation: { fontSize: 22, fontWeight: "800", color: colors.ink900 },
  sousSalutation: { fontSize: 13, color: colors.ink500, marginTop: 2 },
  rechercheBarre: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    height: 52,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.ink100,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rechercheTexte: { fontSize: 14, color: colors.ink400 },
  section: { marginTop: 24 },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: colors.ink900, marginBottom: 12 },
  grille: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tuile: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  tuileIcone: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  tuileLabel: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  tuileDescription: { fontSize: 11, color: colors.ink500, marginTop: 2 },
  carteEnCours: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  carteEnCoursIcone: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.brand50, alignItems: "center", justifyContent: "center" },
  carteEnCoursTitre: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  carteEnCoursSousTitre: { fontSize: 12, color: colors.ink500, marginTop: 2 },
});
