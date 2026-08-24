import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Home, MapPin } from "lucide-react-native";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

// Copie fidele d'une reference envoyee par l'utilisateur ("cette fois tu
// peux copier totalement") : fond blanc avec un halo jaune rayonnant depuis
// le haut (degrade radial SVG), vrai fichier logo fourni par l'utilisateur
// (apps/mobile/assets/logo-complet.png - icone + wordmark + tagline deja
// integres dans l'image, PNG transparent), titre bicolore, filigrane
// maison+pin en arriere-plan, bouton pilule. Petite animation d'entree
// (fondu + zoom leger) ajoutee au passage suite au retour sur le manque de
// vie visuelle.
export default function Bienvenue() {
  const opacite = useRef(new Animated.Value(0)).current;
  const echelle = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacite, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(echelle, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
    ]).start();
  }, [echelle, opacite]);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="rayonnement" cx="50%" cy="0%" r="80%">
            <Stop offset="0" stopColor={colors.accent400} stopOpacity="1" />
            <Stop offset="0.45" stopColor={colors.accent300} stopOpacity="0.4" />
            <Stop offset="1" stopColor={colors.cream100} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#rayonnement)" />
      </Svg>

      <View style={styles.quartier} pointerEvents="none">
        {[18, 28, 20, 34, 16, 24].map((h, i) => (
          <View key={i} style={[styles.immeuble, { height: h }]} />
        ))}
      </View>

      <Animated.View style={[styles.hero, { opacity: opacite, transform: [{ scale: echelle }] }]}>
        <Image
          source={require("../../assets/logo-complet.png")}
          style={styles.logoComplet}
          resizeMode="contain"
        />

        <Text style={styles.headline}>
          Trouvez le pro{"\n"}
          <Text style={{ color: colors.accent500 }}>qu'il vous faut</Text>
        </Text>
        <Text style={styles.sousTexte}>
          Des professionnels vérifiés, près de chez vous à Abidjan, pour tous vos besoins.
        </Text>
      </Animated.View>

      <View style={styles.filigraneZone} pointerEvents="none">
        <View style={styles.filigraneFond}>
          <Home size={130} color={colors.accent700} strokeWidth={1.2} />
          <View style={styles.filigranePin}>
            <MapPin size={44} color={colors.accent700} strokeWidth={1.2} fill={colors.accent300} />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Commencer" showArrow onPress={() => router.push("/(auth)/choisir-role")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100, paddingHorizontal: 24, paddingTop: 80 },
  hero: { alignItems: "center" },
  logoComplet: { width: 210, height: 212 },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.brand900,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 38,
  },
  sousTexte: {
    fontSize: 14,
    color: colors.ink500,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 300,
    lineHeight: 20,
  },
  quartier: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    opacity: 0.14,
  },
  immeuble: { width: 26, backgroundColor: colors.accent500, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  filigraneZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  filigraneFond: { alignItems: "center", justifyContent: "center", opacity: 0.16 },
  filigranePin: { position: "absolute", bottom: -10, right: -6 },
  actions: { paddingBottom: 24 },
});
