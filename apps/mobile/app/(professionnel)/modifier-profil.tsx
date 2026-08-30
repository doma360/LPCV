import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Apparition from "@/components/Apparition";
import { polices } from "@/theme/typography";

interface Zone {
  id: string;
  nom: string;
  commune: string;
}

interface ProfessionnelDetail {
  presentation: string | null;
  tarifIndicatifMin: string | null;
  tarifIndicatifMax: string | null;
  zones: { zone: Zone }[];
}

export default function ModifierProfil() {
  const { session } = useAuth();

  const [zonesDisponibles, setZonesDisponibles] = useState<Zone[]>([]);
  const [zonesChoisies, setZonesChoisies] = useState<string[]>([]);
  const [presentation, setPresentation] = useState("");
  const [tarifMin, setTarifMin] = useState("");
  const [tarifMax, setTarifMax] = useState("");
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      apiFetch<Zone[]>("/api/v1/vitrine/zones"),
      apiFetch<ProfessionnelDetail>(`/api/v1/professionnels/${session.user.id}`),
    ])
      .then(([zonesRes, detailRes]) => {
        setZonesDisponibles(zonesRes.data);
        setPresentation(detailRes.data.presentation ?? "");
        setTarifMin(detailRes.data.tarifIndicatifMin ?? "");
        setTarifMax(detailRes.data.tarifIndicatifMax ?? "");
        setZonesChoisies(detailRes.data.zones.map((z) => z.zone.id));
      })
      .finally(() => setChargement(false));
  }, [session]);

  function toggleZone(id: string) {
    setZonesChoisies((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
  }

  async function enregistrer() {
    if (!session) return;
    setErreur(null);
    setSucces(false);
    setEnvoi(true);
    try {
      await apiFetch(`/api/v1/professionnels/${session.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          presentation: presentation || undefined,
          tarifIndicatifMin: tarifMin ? Number(tarifMin) : undefined,
          tarifIndicatifMax: tarifMax ? Number(tarifMax) : undefined,
          zoneIds: zonesChoisies,
        }),
      });
      setSucces(true);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Mise à jour impossible");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.retour} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.ink700} />
        </Pressable>

        <Text style={styles.title}>Mon profil professionnel</Text>
        <Text style={styles.subtitle}>
          Ces informations déterminent si vous apparaissez dans les recherches des clients.
        </Text>

        <Apparition style={styles.form}>
          <TextField
            label="Présentation"
            value={presentation}
            onChangeText={setPresentation}
            multiline
            numberOfLines={4}
            placeholder="Décrivez votre expérience, vos spécialités..."
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <TextField label="Tarif min (FCFA)" value={tarifMin} onChangeText={setTarifMin} keyboardType="number-pad" />
            </View>
            <View style={styles.flex}>
              <TextField label="Tarif max (FCFA)" value={tarifMax} onChangeText={setTarifMax} keyboardType="number-pad" />
            </View>
          </View>

          <Text style={styles.label}>Zones d'intervention</Text>
          <Text style={styles.aide}>Sans zone, vous n'apparaissez dans aucune recherche.</Text>
          <View style={styles.chips}>
            {zonesDisponibles.map((zone) => (
              <Pressable
                key={zone.id}
                onPress={() => toggleZone(zone.id)}
                style={[styles.chip, zonesChoisies.includes(zone.id) && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, zonesChoisies.includes(zone.id) && styles.chipLabelActive]}>
                  {zone.nom}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Toggle "J'ai un local" mis en cache avec la reservation (voir docs/decisions.md) :
              styles toggleRow/checkbox conserves pour reactivation. */}

          {erreur && <Text style={styles.erreur}>{erreur}</Text>}
          {succes && <Text style={styles.succesTexte}>Profil mis à jour.</Text>}

          <Button label={envoi ? "Enregistrement..." : "Enregistrer"} showArrow floating onPress={enregistrer} loading={envoi || chargement} />
        </Apparition>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: colors.cream100, padding: 24, paddingTop: 60, gap: 16 },
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
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "800", color: colors.ink900 },
  subtitle: { fontSize: 13, color: colors.ink500, marginTop: -8 },
  form: { gap: 14, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.ink100 },
  row: { flexDirection: "row", gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink700, marginTop: 4 },
  aide: { fontSize: 12, color: colors.ink400, marginTop: -8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: colors.ink700 },
  chipLabelActive: { color: colors.accent400 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ink200,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  erreur: { color: colors.danger500, fontSize: 13 },
  succesTexte: { color: colors.success500, fontSize: 13 },
});
