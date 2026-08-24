import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Bell, CalendarClock, ChevronRight, Search } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocalisation } from "@/hooks/useLocalisation";
import { zones } from "@/data/zones";
import { colors } from "@/theme/colors";
import PromoCarousel from "@/components/PromoCarousel";
import MiniCartePosition from "@/components/MiniCartePosition";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import LpcvLogo from "@/components/LpcvLogo";

interface Profession {
  id: string;
  nom: string;
  slug: string;
}

interface Demande {
  id: string;
  statut: string;
  profession: { nom: string };
  createdAt: string;
}

const DEMANDE_ACTIVE = new Set(["EN_ATTENTE", "ACCEPTEE", "EN_ROUTE", "EN_COURS"]);

export default function Accueil() {
  const { session } = useAuth();
  const { position, refuse, chargement, demanderPosition, choisirZone } = useLocalisation();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [texteMetier, setTexteMetier] = useState("");
  const [metierChoisi, setMetierChoisi] = useState<Profession | null>(null);

  useEffect(() => {
    apiFetch<Profession[]>("/api/v1/vitrine/metiers").then((res) => setProfessions(res.data));
  }, []);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Demande[]>("/api/v1/demandes").then((res) => setDemandes(res.data));
    }, []),
  );

  const enCours = demandes.filter((d) => DEMANDE_ACTIVE.has(d.statut));

  const suggestions =
    texteMetier.trim().length > 0 && !metierChoisi
      ? professions.filter((p) => p.nom.toLowerCase().includes(texteMetier.trim().toLowerCase()))
      : [];

  function choisirMetier(p: Profession) {
    setMetierChoisi(p);
    setTexteMetier(p.nom);
  }

  function lancerRecherche() {
    if (!metierChoisi) return;
    router.push({ pathname: "/(client)/rechercher", params: { metier: metierChoisi.slug } });
  }

  return (
    <View style={styles.flex}>
      <View style={styles.bandeau}>
        <LpcvLogo size={36} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.wordmark}>LPCV</Text>
          <Text style={styles.tagline}>Les Professionnels Chez Vous</Text>
        </View>
        <Pressable style={styles.cloche} onPress={() => router.push("/(client)/notifications")} hitSlop={10}>
          <Bell size={22} color={colors.brand900} />
        </Pressable>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        <Text style={styles.salutation}>Bonjour{session ? `, ${session.user.prenom}` : ""} 👋</Text>
        <Text style={styles.sousSalutation}>Trouvez un professionnel de confiance près de chez vous.</Text>

        <View style={styles.section}>
          <PromoCarousel />
        </View>

      <View style={styles.section}>
        <MiniCartePosition label={position?.label ?? null} chargement={chargement} onRecentrer={demanderPosition} />
        {!position && (
          <View style={styles.localisation}>
            <Button label="Utiliser ma position" onPress={demanderPosition} loading={chargement} />
            {refuse && (
              <>
                <Text style={styles.aide}>Position refusée — choisissez votre quartier :</Text>
                <View style={styles.chips}>
                  {zones.map((zone) => (
                    <Pressable key={zone.nom} onPress={() => choisirZone(zone)} style={styles.chip}>
                      <Text style={styles.chipLabel}>{zone.nom}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Pressable style={styles.champPosition} onPress={demanderPosition}>
          <View style={{ flex: 1 }}>
            <Text style={styles.champLabel}>Ma position</Text>
            <Text style={styles.champValeur} numberOfLines={1}>
              {position?.label ?? "Non renseignée"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.ink400} />
        </Pressable>

        <View style={{ marginTop: 10 }}>
          <TextField
            label="Métier recherché"
            icon={Search}
            value={texteMetier}
            onChangeText={(t) => {
              setTexteMetier(t);
              if (metierChoisi) setMetierChoisi(null);
            }}
            placeholder="Ex. Plomberie, Coiffure..."
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((p) => (
                <Pressable key={p.id} style={styles.suggestionItem} onPress={() => choisirMetier(p)}>
                  <Text style={styles.suggestionTexte}>{p.nom}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ marginTop: 14 }}>
          <Button label="Rechercher" showArrow onPress={lancerRecherche} disabled={!metierChoisi || !position} />
        </View>
      </View>

      {enCours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Vos demandes en cours</Text>
          <View style={{ gap: 10 }}>
            {enCours.map((item) => (
              <Pressable key={item.id} style={styles.carteEnCours} onPress={() => router.push("/(client)/demandes")}>
                <View style={styles.carteEnCoursIcone}>
                  <CalendarClock size={16} color={colors.brand700} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.carteEnCoursTitre}>{item.profession.nom}</Text>
                  <Text style={styles.carteEnCoursSousTitre}>Déplacement</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  bandeau: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accent400,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  wordmark: { fontSize: 20, fontWeight: "900", color: colors.brand900, letterSpacing: 0.5 },
  tagline: { fontSize: 10, fontWeight: "700", color: colors.brand700, marginTop: 1, letterSpacing: 0.3 },
  cloche: { padding: 4 },
  container: { padding: 20, paddingBottom: 40 },
  salutation: { fontSize: 18, fontWeight: "800", color: colors.ink900 },
  sousSalutation: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitre: { fontSize: 16, fontWeight: "700", color: colors.ink900, marginBottom: 12 },
  localisation: { marginTop: 12, gap: 10 },
  aide: { fontSize: 13, color: colors.ink500 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  champPosition: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  champLabel: { fontSize: 11, fontWeight: "700", color: colors.ink400, textTransform: "uppercase" },
  champValeur: { fontSize: 14, fontWeight: "600", color: colors.ink900, marginTop: 2 },
  suggestions: {
    marginTop: 6,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    overflow: "hidden",
  },
  suggestionItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.ink100 },
  suggestionTexte: { fontSize: 14, color: colors.ink900, fontWeight: "600" },
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
