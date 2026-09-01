import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useFocusEffect } from "expo-router";
import { CalendarClock, ChevronRight, Search } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocalisation } from "@/hooks/useLocalisation";
import { zones } from "@/data/zones";
import { colors } from "@/theme/colors";
import PromoCarousel from "@/components/PromoCarousel";
import MiniCartePosition from "@/components/MiniCartePosition";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import EnTeteMarque from "@/components/EnTeteMarque";
import Apparition from "@/components/Apparition";

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
    apiFetch<Profession[]>("/api/v1/vitrine/metiers")
      .then((res) => setProfessions(res.data))
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      apiFetch<Demande[]>("/api/v1/demandes")
        .then((res) => setDemandes(res.data))
        .catch(() => {});
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
      <EnTeteMarque onBellPress={() => router.push("/(client)/notifications")} />

      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        <Apparition>
          <Text style={styles.salutation}>Bonjour{session ? `, ${session.user.prenom}` : ""} 👋</Text>
          <Text style={styles.sousSalutation}>Trouvez un professionnel de confiance près de chez vous.</Text>
        </Apparition>

        <Apparition delai={60} style={styles.section}>
          <PromoCarousel />
        </Apparition>

      <Apparition delai={120} style={styles.section}>
        <MiniCartePosition
          label={position?.label ?? null}
          lat={position?.lat}
          lng={position?.lng}
          chargement={chargement}
          onRecentrer={demanderPosition}
        />
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
      </Apparition>

      <Apparition delai={180} style={styles.section}>
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
          <Button label="Rechercher" showArrow floating onPress={lancerRecherche} disabled={!metierChoisi || !position} />
        </View>
      </Apparition>

      {enCours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Vos demandes en cours</Text>
          <View style={{ gap: 10 }}>
            {enCours.map((item, i) => (
              <Apparition key={item.id} delai={240 + i * 60}>
                <Pressable style={styles.carteEnCours} onPress={() => router.push("/(client)/demandes")}>
                  <View style={styles.carteEnCoursIcone}>
                    <CalendarClock size={16} color={colors.brand700} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.carteEnCoursTitre}>{item.profession.nom}</Text>
                    <Text style={styles.carteEnCoursSousTitre}>Déplacement</Text>
                  </View>
                </Pressable>
              </Apparition>
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
