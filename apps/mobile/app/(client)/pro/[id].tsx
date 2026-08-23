import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Home, MapPin, ShieldCheck, Star, Store } from "lucide-react-native";
import { apiFetch } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

interface Disponibilite {
  jour: string;
  heureDebut: string;
  heureFin: string;
}

interface ProfessionnelDetail {
  nom: string;
  prenom: string;
  photoUrl: string | null;
  presentation: string | null;
  tarifIndicatifMin: string | null;
  tarifIndicatifMax: string | null;
  statutVerification: "EN_ATTENTE" | "VERIFIE" | "REFUSE";
  noteMoyenne: string;
  nombreAvis: number;
  portfolioUrls: string[];
  aLocal: boolean;
  adresseLocal: string | null;
  profession: { nom: string };
  disponibilites: Disponibilite[];
}

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  client: { nom: string; prenom: string };
}

const JOURS_LABEL: Record<string, string> = {
  LUNDI: "Lun", MARDI: "Mar", MERCREDI: "Mer", JEUDI: "Jeu", VENDREDI: "Ven", SAMEDI: "Sam", DIMANCHE: "Dim",
};

export default function FicheProfessionnel() {
  const { id, professionId, prixEstime, distanceKm } = useLocalSearchParams<{
    id: string;
    professionId: string;
    prixEstime?: string;
    distanceKm?: string;
  }>();
  const [pro, setPro] = useState<ProfessionnelDetail | null>(null);
  const [avis, setAvis] = useState<Avis[]>([]);

  useEffect(() => {
    if (!id) return;
    apiFetch<ProfessionnelDetail>(`/api/v1/professionnels/${id}`).then((res) => setPro(res.data));
    apiFetch<Avis[]>(`/api/v1/avis/professionnel/${id}`).then((res) => setAvis(res.data));
  }, [id]);

  if (!pro) {
    return (
      <View style={styles.chargement}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  const verifie = pro.statutVerification === "VERIFIE";
  const nomPro = `${pro.prenom} ${pro.nom}`;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Pressable style={styles.retour} onPress={() => router.back()}>
        <ArrowLeft size={20} color={colors.ink700} />
      </Pressable>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {pro.prenom[0]}
            {pro.nom[0]}
          </Text>
        </View>
        <Text style={styles.nom}>{nomPro}</Text>
        <Text style={styles.metier}>{pro.profession.nom}</Text>

        <View style={styles.badgesRow}>
          {verifie && (
            <View style={styles.badge}>
              <ShieldCheck size={13} color={colors.success500} />
              <Text style={styles.badgeLabel}>Vérifié</Text>
            </View>
          )}
          <View style={styles.badge}>
            <Star size={13} color={colors.accent700} fill={colors.accent500} />
            <Text style={styles.badgeLabel}>
              {pro.noteMoyenne} ({pro.nombreAvis})
            </Text>
          </View>
          {distanceKm && (
            <View style={styles.badge}>
              <MapPin size={13} color={colors.brand700} />
              <Text style={styles.badgeLabel}>{Number(distanceKm).toFixed(1)} km</Text>
            </View>
          )}
        </View>
      </View>

      {pro.presentation && <Text style={styles.presentation}>{pro.presentation}</Text>}

      {(pro.tarifIndicatifMin || pro.tarifIndicatifMax) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarif indicatif</Text>
          <Text style={styles.tarif}>
            {pro.tarifIndicatifMin ?? "—"} – {pro.tarifIndicatifMax ?? "—"} FCFA
          </Text>
        </View>
      )}

      {pro.portfolioUrls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réalisations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {pro.portfolioUrls.map((url) => (
              <Image key={url} source={{ uri: url }} style={styles.portfolioImg} />
            ))}
          </ScrollView>
        </View>
      )}

      {pro.disponibilites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilités habituelles</Text>
          <View style={styles.dispoChips}>
            {pro.disponibilites.map((d, i) => (
              <View key={i} style={styles.dispoChip}>
                <Text style={styles.dispoChipText}>
                  {JOURS_LABEL[d.jour] ?? d.jour} {d.heureDebut}-{d.heureFin}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {avis.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis</Text>
          {avis.slice(0, 5).map((item) => (
            <View key={item.id} style={styles.avisCard}>
              <View style={styles.avisHeader}>
                <Text style={styles.avisNom}>
                  {item.client.prenom} {item.client.nom}
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
      )}

      <View style={styles.actions}>
        <Button
          label="À domicile"
          showArrow
          onPress={() =>
            router.push({
              pathname: "/(client)/demander",
              params: { professionnelId: id, professionId, nomPro, prixEstime: prixEstime ?? "" },
            })
          }
        />
        {pro.aLocal && (
          <Pressable
            style={styles.boutonLocal}
            onPress={() =>
              router.push({
                pathname: "/(client)/reserver",
                params: { professionnelId: id, professionId, nomPro, adresseLocal: pro.adresseLocal ?? "" },
              })
            }
          >
            <Store size={18} color={colors.brand900} />
            <Text style={styles.boutonLocalLabel}>Chez le pro{pro.adresseLocal ? ` · ${pro.adresseLocal}` : ""}</Text>
          </Pressable>
        )}
        {!pro.aLocal && (
          <View style={styles.aideDomicile}>
            <Home size={14} color={colors.ink400} />
            <Text style={styles.aideDomicileText}>Ce professionnel se déplace uniquement.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream100 },
  chargement: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream100 },
  container: { padding: 20, paddingTop: 60, paddingBottom: 60, gap: 16 },
  retour: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { alignItems: "center", gap: 4 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: { color: colors.accent400, fontSize: 24, fontWeight: "800" },
  nom: { fontSize: 18, fontWeight: "700", color: colors.ink900 },
  metier: { fontSize: 13, color: colors.ink500 },
  badgesRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap", justifyContent: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  badgeLabel: { fontSize: 12, fontWeight: "600", color: colors.ink700 },
  presentation: { fontSize: 14, color: colors.ink700, textAlign: "center" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.ink900 },
  tarif: { fontSize: 15, fontWeight: "700", color: colors.brand700 },
  portfolioImg: { width: 96, height: 96, borderRadius: 12 },
  dispoChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dispoChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink100 },
  dispoChipText: { fontSize: 12, fontWeight: "600", color: colors.ink700 },
  avisCard: { backgroundColor: colors.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.ink100, gap: 4, marginBottom: 8 },
  avisHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  avisNom: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  avisNote: { flexDirection: "row", alignItems: "center", gap: 3 },
  avisNoteText: { fontSize: 12, fontWeight: "700", color: colors.accent700 },
  avisCommentaire: { fontSize: 13, color: colors.ink700 },
  actions: { gap: 10, marginTop: 8 },
  boutonLocal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.brand900,
  },
  boutonLocalLabel: { fontSize: 14, fontWeight: "700", color: colors.brand900 },
  aideDomicile: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  aideDomicileText: { fontSize: 12, color: colors.ink400 },
});
