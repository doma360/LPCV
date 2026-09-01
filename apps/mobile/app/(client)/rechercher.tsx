import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MapPin, ShieldCheck, Star } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { useLocalisation } from "@/hooks/useLocalisation";
import { zones } from "@/data/zones";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import Apparition from "@/components/Apparition";
import { polices } from "@/theme/typography";

interface Profession {
  id: string;
  nom: string;
  slug: string;
}

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  noteMoyenne: string;
  distanceKm: number;
  prixEstime: number;
}

export default function Rechercher() {
  const { metier: metierParam, relance } = useLocalSearchParams<{ metier: string; relance?: string }>();
  const { position, refuse, chargement, demanderPosition, choisirZone } = useLocalisation();
  const [profession, setProfession] = useState<Profession | null>(null);
  const [candidats, setCandidats] = useState<Candidat[] | null>(null);
  const [recherche, setRecherche] = useState(false);
  const [erreurRecherche, setErreurRecherche] = useState(false);

  // Metier deja choisi sur l'accueil (champ + suggestions) ; on ne recupere
  // ici que sa fiche complete (id) pour lancer le matching. "relance=1" :
  // arrivee suite au refus d'un professionnel (voir demandes.tsx), affiche
  // un message plutot que de repartir d'un ecran silencieux.
  useEffect(() => {
    if (!metierParam) return;
    apiFetch<Profession[]>("/api/v1/vitrine/metiers")
      .then((res) => {
        const correspondance = res.data.find((p) => p.slug === metierParam);
        if (correspondance) setProfession(correspondance);
      })
      .catch(() => {});
  }, [metierParam]);

  const succes = relance === "1" ? "Ce professionnel a refusé votre demande — voici d'autres profils disponibles." : null;

  useEffect(() => {
    if (!profession || !position) return;
    setRecherche(true);
    setErreurRecherche(false);
    setCandidats(null);
    apiFetch<{ candidats: Candidat[] }>(
      `/api/v1/professionnels/matching?metier=${profession.slug}&lat=${position.lat}&lng=${position.lng}`,
    )
      .then((res) => setCandidats(res.data.candidats))
      .catch(() => {
        setCandidats([]);
        setErreurRecherche(true);
      })
      .finally(() => setRecherche(false));
  }, [profession, position]);

  function ouvrirFiche(candidat: Candidat) {
    if (!profession) return;
    router.push({
      pathname: "/(client)/pro/[id]",
      params: {
        id: candidat.id,
        professionId: profession.id,
        prixEstime: String(candidat.prixEstime),
        distanceKm: String(candidat.distanceKm),
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.retour} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.ink700} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{profession?.nom ?? "Recherche"}</Text>
          {candidats !== null && !recherche && (
            <Text style={styles.sousTitre}>
              {candidats.length > 0
                ? `${candidats.length} professionnel${candidats.length > 1 ? "s" : ""} près de vous`
                : "Aucun résultat pour l'instant"}
            </Text>
          )}
        </View>
      </View>

      {succes && <Text style={styles.succes}>{succes}</Text>}

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

      {position && (
        <View style={styles.positionBadge}>
          <MapPin size={14} color={colors.brand700} />
          <Text style={styles.positionText}>{position.label}</Text>
        </View>
      )}

      {recherche && (
        <View style={styles.chargement}>
          <ActivityIndicator color={colors.brand700} />
          <Text style={styles.chargementTexte}>Recherche des professionnels disponibles...</Text>
        </View>
      )}

      <FlatList
        data={candidats ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          !recherche && candidats !== null ? (
            <View style={styles.vide}>
              <View style={styles.videIcone}>
                <ShieldCheck size={26} color={colors.ink400} />
              </View>
              <Text style={styles.videTitre}>
                {erreurRecherche ? "Recherche impossible" : "Aucun professionnel disponible"}
              </Text>
              <Text style={styles.videTexte}>
                {erreurRecherche
                  ? "Vérifiez votre connexion et réessayez."
                  : `Personne n'est disponible pour "${profession?.nom ?? "ce métier"}" près de chez vous pour l'instant.`}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <Apparition delai={Math.min(index, 6) * 60}>
            <Pressable style={styles.card} onPress={() => ouvrirFiche(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.prenom[0]}
                  {item.nom[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardNom}>
                  {item.prenom} {item.nom}
                </Text>
                <View style={styles.badgesRow}>
                  <View style={styles.badge}>
                    <MapPin size={11} color={colors.brand700} />
                    <Text style={styles.badgeLabel}>{item.distanceKm.toFixed(1)} km</Text>
                  </View>
                  <View style={styles.badge}>
                    <Star size={11} color={colors.accent700} fill={colors.accent500} />
                    <Text style={styles.badgeLabel}>{item.noteMoyenne}</Text>
                  </View>
                  <View style={styles.badge}>
                    <ShieldCheck size={11} color={colors.success500} />
                    <Text style={styles.badgeLabel}>Vérifié</Text>
                  </View>
                </View>
              </View>
              <View style={styles.prixPill}>
                <Text style={styles.cardPrix}>{item.prixEstime} F</Text>
              </View>
            </Pressable>
          </Apparition>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
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
  title: { fontFamily: polices.titre, fontSize: 20, fontWeight: "800", color: colors.ink900 },
  sousTitre: { fontSize: 12, color: colors.ink500, marginTop: 2 },
  succes: { color: colors.success500, fontWeight: "600", marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  localisation: { marginTop: 4, gap: 10 },
  aide: { fontSize: 13, color: colors.ink500 },
  positionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  positionText: { fontSize: 12, fontWeight: "600", color: colors.ink700 },
  chargement: { alignItems: "center", gap: 8, marginTop: 24 },
  chargementTexte: { fontSize: 12, color: colors.ink500 },
  vide: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20, gap: 8 },
  videIcone: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  videTitre: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  videTexte: { fontSize: 13, color: colors.ink500, textAlign: "center", lineHeight: 18 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.ink100,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent400, fontWeight: "800", fontSize: 14 },
  cardNom: { fontSize: 14, fontWeight: "700", color: colors.ink900, marginBottom: 6 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.cream100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeLabel: { fontSize: 11, fontWeight: "600", color: colors.ink700 },
  prixPill: {
    backgroundColor: colors.accent400,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  cardPrix: { fontSize: 13, fontWeight: "800", color: colors.brand900 },
});
