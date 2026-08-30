import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { useFocusEffect } from "expo-router";
import { CalendarClock, Clock, Trash2 } from "lucide-react-native";
import { apiFetch, ApiError } from "@/lib/api";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import Apparition from "@/components/Apparition";
import { polices } from "@/theme/typography";

interface Disponibilite {
  id: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

const jours = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];
const joursLabels: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

export default function Disponibilites() {
  const [dispos, setDispos] = useState<Disponibilite[]>([]);
  const [jour, setJour] = useState("LUNDI");
  const [heureDebut, setHeureDebut] = useState("08:00");
  const [heureFin, setHeureFin] = useState("18:00");
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajout, setAjout] = useState(false);

  const charger = useCallback(async () => {
    const res = await apiFetch<Disponibilite[]>("/api/v1/professionnels/disponibilites");
    setDispos(res.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      charger();
    }, [charger]),
  );

  async function ajouterCreneau() {
    setErreur(null);
    setAjout(true);
    try {
      await apiFetch("/api/v1/professionnels/disponibilites", {
        method: "POST",
        body: JSON.stringify({ jour, heureDebut, heureFin }),
      });
      await charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Ajout impossible");
    } finally {
      setAjout(false);
    }
  }

  async function supprimerCreneau(id: string) {
    await apiFetch(`/api/v1/professionnels/disponibilites/${id}`, { method: "DELETE" });
    setDispos((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Disponibilités</Text>
      <Text style={styles.subtitle}>Utilisées pour vous proposer aux clients au bon moment.</Text>

      <Apparition style={styles.form}>
        <View style={styles.chips}>
          {jours.map((j) => (
            <Pressable key={j} onPress={() => setJour(j)} style={[styles.chip, jour === j && styles.chipActive]}>
              <Text style={[styles.chipLabel, jour === j && styles.chipLabelActive]}>{joursLabels[j]}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField label="Début (HH:mm)" value={heureDebut} onChangeText={setHeureDebut} placeholder="08:00" />
          </View>
          <View style={styles.flex}>
            <TextField label="Fin (HH:mm)" value={heureFin} onChangeText={setHeureFin} placeholder="18:00" />
          </View>
        </View>
        {erreur && <Text style={styles.erreur}>{erreur}</Text>}
        <Button label={ajout ? "Ajout..." : "Ajouter le créneau"} showArrow floating onPress={ajouterCreneau} loading={ajout} />
      </Apparition>

      <FlatList
        data={dispos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingTop: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.vide}>
            <View style={styles.videIcone}>
              <CalendarClock size={22} color={colors.ink400} />
            </View>
            <Text style={styles.videTexte}>Aucun créneau enregistré.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Apparition delai={Math.min(index, 6) * 60} style={styles.creneauCard}>
            <View style={styles.creneauIcone}>
              <Clock size={16} color={colors.brand700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.creneauJour}>{joursLabels[item.jour]}</Text>
              <Text style={styles.creneauHeure}>
                {item.heureDebut} – {item.heureFin}
              </Text>
            </View>
            <Pressable style={styles.supprimer} onPress={() => supprimerCreneau(item.id)} hitSlop={8}>
              <Trash2 size={16} color={colors.danger500} />
            </Pressable>
          </Apparition>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, padding: 20, paddingTop: 60 },
  title: { fontFamily: polices.titre, fontSize: 22, fontWeight: "800", color: colors.ink900 },
  subtitle: { fontSize: 13, color: colors.ink500, marginTop: 4, marginBottom: 16 },
  form: { gap: 12, backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.ink100 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.ink200 },
  chipActive: { backgroundColor: colors.brand900, borderColor: colors.brand900 },
  chipLabel: { fontSize: 12, fontWeight: "600", color: colors.ink700 },
  chipLabelActive: { color: colors.accent400 },
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  erreur: { color: colors.danger500, fontSize: 13 },
  vide: { alignItems: "center", gap: 8, marginTop: 24 },
  videIcone: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  videTexte: { fontSize: 13, color: colors.ink400 },
  creneauCard: {
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
  creneauIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  creneauJour: { fontSize: 13, fontWeight: "700", color: colors.ink900 },
  creneauHeure: { fontSize: 12, color: colors.ink500, marginTop: 1 },
  supprimer: { padding: 4 },
});
