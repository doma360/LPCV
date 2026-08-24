import { Image, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Calendar, Check, MapPin, Phone, ShieldCheck, Star, Wrench } from "lucide-react-native";
import { colors } from "@/theme/colors";
import LpcvLogo from "@/components/LpcvLogo";
import DegradeFond from "@/components/DegradeFond";

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
  localisation?: string;
  photoUrl?: string | null;
  verifie?: boolean;
  membreDepuis: string;
  interventions: number;
  noteMoyenne?: string;
  abonnement: AbonnementInfo;
  qrValue?: string | null;
}

// Reproduit d'assez pres une maquette "carte pro" fournie par l'utilisateur
// (deja aux couleurs LPCV) : logo+wordmark, pastille "membre professionnel",
// grande photo ronde + badge verifie, puces localisation/telephone/date,
// liste certification/interventions/note, QR avec logo LPCV au centre,
// abonnement en bas. Colonnes desktop de la reference repliees en liste
// verticale (largeur mobile ~380px) ; "Specialites"/"Experience en annees"
// non repris faute de donnees en base (voir docs/decisions.md).
export default function CarteMembreVisual({
  nom,
  prenom,
  metier,
  telephone,
  localisation,
  photoUrl,
  verifie,
  membreDepuis,
  interventions,
  noteMoyenne,
  abonnement,
  qrValue,
}: CarteMembreVisualProps) {
  return (
    <View style={styles.carte}>
      <DegradeFond id="carteMembreDegrade" de={colors.brand900} vers={colors.brand700} />
      <View style={styles.accent1} />
      <View style={styles.accent2} />

      <View style={styles.headerRow}>
        <View style={styles.marqueBloc}>
          <LpcvLogo size={26} />
          <View>
            <Text style={styles.wordmark}>
              LPC<Text style={{ color: colors.accent400 }}>V</Text>
            </Text>
            <Text style={styles.tagline}>Les Professionnels Chez Vous</Text>
          </View>
        </View>
        <View style={styles.memberPill}>
          <ShieldCheck size={11} color={colors.brand900} />
          <Text style={styles.memberPillTexte}>MEMBRE PRO</Text>
        </View>
      </View>

      <View style={styles.identiteRow}>
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
              <Check size={12} color={colors.white} strokeWidth={3} />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.nom} numberOfLines={1}>
            {prenom} {nom}
          </Text>
          <View style={styles.metierRow}>
            <Text style={styles.metier} numberOfLines={1}>
              {metier}
            </Text>
            {verifie && <ShieldCheck size={13} color={colors.accent400} />}
          </View>

          <View style={styles.chipsRow}>
            {localisation && (
              <View style={styles.chip}>
                <MapPin size={10} color={colors.accent400} />
                <Text style={styles.chipTexte} numberOfLines={1}>
                  {localisation}
                </Text>
              </View>
            )}
            {telephone && (
              <View style={styles.chip}>
                <Phone size={10} color={colors.accent400} />
                <Text style={styles.chipTexte} numberOfLines={1}>
                  {telephone}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.chip}>
            <Calendar size={10} color={colors.accent400} />
            <Text style={styles.chipTexte}>Membre depuis {membreDepuis}</Text>
          </View>
        </View>
      </View>

      <View style={styles.separateur} />

      <View style={styles.infoQrRow}>
        <View style={styles.infoListe}>
          <View style={styles.infoLigne}>
            <ShieldCheck size={14} color={colors.accent400} />
            <View>
              <Text style={styles.infoLabel}>CERTIFICATION</Text>
              <Text style={styles.infoValeur}>{verifie ? "Certifié LPCV" : "En attente de vérification"}</Text>
            </View>
          </View>
          <View style={styles.infoLigne}>
            <Wrench size={14} color={colors.accent400} />
            <View>
              <Text style={styles.infoLabel}>INTERVENTIONS</Text>
              <Text style={styles.infoValeur}>{interventions} mission{interventions > 1 ? "s" : ""} réalisée{interventions > 1 ? "s" : ""}</Text>
            </View>
          </View>
          {noteMoyenne && (
            <View style={styles.infoLigne}>
              <Star size={14} color={colors.accent400} fill={colors.accent400} />
              <View>
                <Text style={styles.infoLabel}>NOTE MOYENNE</Text>
                <Text style={styles.infoValeur}>{noteMoyenne}/5</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.qrBloc}>
          <View style={styles.qrFond}>
            {qrValue ? (
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              <QRCode value={qrValue} size={84} logo={require("../../assets/icon.png")} logoSize={20} logoBorderRadius={6} logoBackgroundColor={colors.white} />
            ) : (
              <Text style={styles.qrVideTexte}>QR inactif</Text>
            )}
          </View>
          <Text style={styles.qrLegende}>Scannez pour voir mon profil</Text>
        </View>
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
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  accent1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.brand700,
    right: -90,
    top: -120,
    opacity: 0.55,
  },
  accent2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent400,
    right: -50,
    top: -40,
    opacity: 0.5,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  marqueBloc: { flexDirection: "row", alignItems: "center", gap: 8 },
  wordmark: { color: colors.white, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  tagline: { color: colors.brand100, fontSize: 8, fontWeight: "700", letterSpacing: 0.3 },
  memberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.accent400,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  memberPillTexte: { color: colors.brand900, fontSize: 9, fontWeight: "800", letterSpacing: 0.3 },
  identiteRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 16 },
  photoWrap: { width: 68, height: 68 },
  photo: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  photoPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: colors.brand700,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitiales: { color: colors.accent400, fontSize: 20, fontWeight: "800" },
  verifiePastille: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success500,
    borderWidth: 2,
    borderColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
  },
  nom: { color: colors.white, fontSize: 17, fontWeight: "800" },
  metierRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 },
  metier: { color: colors.accent400, fontSize: 12, fontWeight: "700" },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  chipTexte: { color: colors.white, fontSize: 10, fontWeight: "600" },
  separateur: { height: 1, backgroundColor: colors.brand700, marginVertical: 14 },
  infoQrRow: { flexDirection: "row", gap: 14 },
  infoListe: { flex: 1, gap: 10 },
  infoLigne: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoLabel: { color: colors.brand100, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  infoValeur: { color: colors.white, fontSize: 12, fontWeight: "700", marginTop: 1 },
  qrBloc: { alignItems: "center", gap: 6, width: 100 },
  qrFond: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  qrVideTexte: { fontSize: 9, color: colors.ink400, textAlign: "center" },
  qrLegende: { color: colors.brand100, fontSize: 9, fontWeight: "600", textAlign: "center" },
  abonnementRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statutPastille: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statutPastilleActif: { backgroundColor: colors.white },
  statutPastilleInactif: { backgroundColor: "rgba(255,255,255,0.14)" },
  statutPastilleTexte: { fontSize: 11, fontWeight: "800" },
  abonnementPalier: { color: colors.white, fontSize: 13, fontWeight: "700" },
  abonnementDates: { color: colors.brand100, fontSize: 11, marginTop: 2 },
});
