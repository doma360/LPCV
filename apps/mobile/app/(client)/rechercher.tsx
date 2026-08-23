import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MapPin, ShieldCheck, Star } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { useLocalisation } from "@/hooks/useLocalisation";
import { zones } from "@/data/zones";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

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

  // Metier deja choisi sur l'accueil (champ + suggestions) ; on ne recupere
  // ici que sa fiche complete (id) pour lancer le matching. "relance=1" :
  // arrivee suite au refus d'un professionnel (voir demandes.tsx), affiche
  // un message plutot que de repartir d'un ecran silencieux.
  useEffect(() => {
    if (!metierParam) return;
    apiFetch<Profession[]>("/api/v1/vitrine/metiers").then((res) => {
      const correspondance = res.data.find((p) => p.slug === metierParam);
      if (correspondance) setProfession(correspondance);
    });
  }, [metierParam]);

  const succes = relance === "1" ? "Ce professionnel a refusé votre demande — voici d'autres profils disponibles." : null;

  useEffect(() => {
    if (!profession || !position) return;
    setRecherche(true);
    setCandidats(null);
    apiFetch<{ candidats: Candidat[] }>(
      `/api/v1/professionnels/matching?metier=${profession.slug}&lat=${position.lat}&lng=${position.lng}`,
    )
      .then((res) => setCandidats(res.data.candidats))
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
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>
      <Text style={styles.title}>{profession?.nom ?? "Recherche"}</Text>

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

      {recherche && <ActivityIndicator style={{ marginTop: 20 }} color={colors.brand700} />}

      <FlatList
        data={candidats ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingTop: 16 }}
        ListEmptyComponent={
          !recherche && candidats !== null ? (
            <Text style={styles.aide}>Aucun professionnel disponible pour l'instant.</Text>
          ) : null
        }
        renderItem={({ item }) => (
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
              <View style={styles.cardMeta}>
                <MapPin size={12} color={colors.ink500} />
                <Text style={styles.cardMetaText}>{item.distanceKm.toFixed(1)} km</Text>
                <Star size={12} color={colors.accent700} />
                <Text style={styles.cardMetaText}>{item.noteMoyenne}</Text>
                <ShieldCheck size={12} color={colors.success500} />
              </View>
            </View>
            <Text style={styles.cardPrix}>{item.prixEstime} F</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink900, marginBottom: 4 },
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  cardNom: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  cardMetaText: { fontSize: 12, color: colors.ink500, marginRight: 6 },
  cardPrix: { fontSize: 14, fontWeight: "700", color: colors.brand900 },
});
