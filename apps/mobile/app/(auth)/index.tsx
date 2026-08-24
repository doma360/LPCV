import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";
import LpcvLogo from "@/components/LpcvLogo";

// Copie fidele d'une reference envoyee par l'utilisateur ("cette fois tu
// peux copier totalement") : fond blanc avec un halo jaune rayonnant depuis
// le haut (degrade radial SVG), logo LPCV existant (garde tel quel plutot
// que redessiner un personnage detaille a part, pour rester coherent avec
// le reste de l'app), titre bicolore, filigrane du logo en arriere-plan,
// bouton pilule. Petite animation d'entree (fondu + zoom leger) ajoutee au
// passage suite au retour sur le manque de vie visuelle.
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

      <Animated.View style={[styles.hero, { opacity: opacite, transform: [{ scale: echelle }] }]}>
        <LpcvLogo size={110} />
        <Text style={styles.wordmark}>
          LPC<Text style={{ color: colors.accent500 }}>V</Text>
        </Text>
        <Text style={styles.tagline}>Les Professionnels Chez Vous</Text>

        <Text style={styles.headline}>
          Trouvez le pro{"\n"}
          <Text style={{ color: colors.accent500 }}>qu'il vous faut</Text>
        </Text>
        <Text style={styles.sousTexte}>
          Des professionnels vérifiés, près de chez vous à Abidjan, pour tous vos besoins.
        </Text>
      </Animated.View>

      <View style={styles.filigraneZone}>
        <View style={styles.filigrane}>
          <LpcvLogo size={220} />
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
  wordmark: { fontSize: 42, fontWeight: "900", color: colors.brand900, marginTop: 18, letterSpacing: 1 },
  tagline: { fontSize: 12, fontWeight: "700", color: colors.ink500, marginTop: 2, letterSpacing: 2 },
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
  filigraneZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  filigrane: { opacity: 0.06 },
  actions: { paddingBottom: 24 },
});
