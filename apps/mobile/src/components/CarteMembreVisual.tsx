import { Image, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Check, Phone } from "lucide-react-native";
import { colors } from "@/theme/colors";
import LpcvLogo from "@/components/LpcvLogo";

interface AbonnementInfo {
  actif: boolean;
  palier?: "MENSUEL" | "ANNUEL";
  dateDebut?: string;
  dateFin?: string;
  joursRestants?: number;
}

interface CarteMembreVisualProps {
  nom: string;
  prenom: string;
  metier: string;
  telephone?: string;
  photoUrl?: string | null;
  verifie?: boolean;
  numeroMembre: string;
  membreDepuis: string;
  abonnement: AbonnementInfo;
  qrValue?: string | null;
}

// Modele "tableau de bord" demande par l'utilisateur (image de reference,
// app concurrente) : photo de profil ronde classique (pas une zone dediee
// qui mange l'espace des infos), puces metier/telephone, espace QR au
// centre, abonnement en bas de la carte. Palette LPCV conservee (pas le
// degrade orange/vert de la reference).
export default function CarteMembreVisual({
  nom,
  prenom,
  metier,
  telephone,
  photoUrl,
  verifie,
  numeroMembre,
  membreDepuis,
  abonnement,
  qrValue,
}: CarteMembreVisualProps) {
  return (
    <View style={styles.carte}>
      <View style={styles.accent1} />
      <View style={styles.accent2} />

      <View style={styles.enTete}>
        <View style={styles.photoWrap}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoInitiales}>
                {prenom[0]}
                {nom[0]}
              </Text>
            </View>
          )}
          {verifie && (
            <View style={styles.verifiePastille}>
              <Check size={11} color={colors.white} strokeWidth={3} />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.marqueRow}>
            <LpcvLogo size={14} />
            <Text style={styles.marque}>LPCV</Text>
          </View>
          <Text style={styles.nom} numberOfLines={1}>
            {prenom} {nom}
          </Text>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipTexte} numberOfLines={1}>
                {metier}
              </Text>
            </View>
            {telephone && (
              <View style={styles.chip}>
                <Phone size={10} color={colors.white} />
                <Text style={styles.chipTexte} numberOfLines={1}>
                  {telephone}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.numeroLigne}>
        N° {numeroMembre} · Membre depuis {membreDepuis}
      </Text>

      <View style={styles.separateur} />

      <View style={styles.qrZone}>
        <View style={styles.qrFond}>
          {qrValue ? <QRCode value={qrValue} size={92} /> : <Text style={styles.qrVideTexte}>QR inactif</Text>}
        </View>
        <Text style={styles.qrLegende}>
          {qrValue ? "Scannez pour vérifier ce professionnel" : "S'active avec un abonnement LPCV actif"}
        </Text>
      </View>

      <View style={styles.separateur} />

      <View style={styles.abonnementRow}>
        <View style={[styles.statutPastille, abonnement.actif ? styles.statutPastilleActif : styles.statutPastilleInactif]}>
          <Text style={[styles.statutPastilleTexte, { color: abonnement.actif ? colors.success500 : colors.brand100 }]}>
            {abonnement.actif ? "Actif" : "Inactif"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.abonnementPalier}>
            {abonnement.palier ? (abonnement.palier === "ANNUEL" ? "Abonnement annuel" : "Abonnement mensuel") : "Aucun abonnement"}
          </Text>
          {abonnement.dateDebut && abonnement.dateFin && (
            <Text style={styles.abonnementDates}>
              {abonnement.dateDebut} → {abonnement.dateFin}
              {abonnement.actif && abonnement.joursRestants !== undefined ? ` · expire dans ${abonnement.joursRestants} jours` : ""}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: colors.brand900,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  accent1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.brand700,
    right: -60,
    top: -90,
    opacity: 0.6,
  },
  accent2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent400,
    right: -30,
    top: -20,
    opacity: 0.7,
  },
  enTete: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  photoWrap: { width: 56, height: 56 },
  photo: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.white },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitiales: { color: colors.accent400, fontSize: 18, fontWeight: "800" },
  verifiePastille: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success500,
    borderWidth: 2,
    borderColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
  },
  marqueRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  marque: { color: colors.brand100, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  nom: { color: colors.white, fontSize: 16, fontWeight: "800", marginTop: 2 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: 150,
  },
  chipTexte: { color: colors.white, fontSize: 11, fontWeight: "600" },
  numeroLigne: { color: colors.brand100, fontSize: 11, fontWeight: "600", marginTop: 14 },
  separateur: { height: 1, backgroundColor: colors.brand700, marginVertical: 14 },
  qrZone: { alignItems: "center", gap: 8 },
  qrFond: {
    width: 108,
    height: 108,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  qrVideTexte: { fontSize: 10, color: colors.ink400, textAlign: "center" },
  qrLegende: { color: colors.brand100, fontSize: 11, fontWeight: "600", textAlign: "center" },
  abonnementRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statutPastille: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statutPastilleActif: { backgroundColor: colors.white },
  statutPastilleInactif: { backgroundColor: "rgba(255,255,255,0.14)" },
  statutPastilleTexte: { fontSize: 11, fontWeight: "800" },
  abonnementPalier: { color: colors.white, fontSize: 13, fontWeight: "700" },
  abonnementDates: { color: colors.brand100, fontSize: 11, marginTop: 2 },
});
