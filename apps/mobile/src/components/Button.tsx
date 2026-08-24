import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "outline" | "outlineLight";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  showArrow?: boolean;
  // Ombre marquee + leger mouvement de flottement continu (boucle infinie,
  // pas juste au survol - un mobile n'a pas de curseur) - reserve aux
  // boutons d'action principale isoles (ex. CTA de Bienvenue), pas active
  // par defaut pour ne pas changer tous les boutons existants de l'app.
  floating?: boolean;
}

const variantStyles = {
  primary: { button: "primary", label: "labelPrimary", spinner: colors.brand900 },
  outline: { button: "outline", label: "labelOutline", spinner: colors.brand700 },
  outlineLight: { button: "outlineLight", label: "labelOutlineLight", spinner: colors.white },
} as const;

export default function Button({ label, variant = "primary", loading, disabled, showArrow, floating, ...props }: ButtonProps) {
  const v = variantStyles[variant];
  const couleurTexte = variant === "primary" ? colors.brand900 : variant === "outline" ? colors.ink700 : colors.white;

  const [survole, setSurvole] = useState(false);
  const flottement = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!floating) return;
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(flottement, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flottement, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [floating, flottement]);

  return (
    <Animated.View
      style={
        floating && {
          transform: [{ translateY: flottement.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] }) }],
        }
      }
    >
      <Pressable
        disabled={disabled || loading}
        onHoverIn={() => setSurvole(true)}
        onHoverOut={() => setSurvole(false)}
        style={({ pressed }) => [
          styles.base,
          styles[v.button],
          floating && styles.floating,
          floating && survole && styles.floatingSurvole,
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={v.spinner} />
        ) : (
          <View style={styles.content}>
            <Text style={[styles.label, styles[v.label]]}>{label}</Text>
            {showArrow && <ArrowRight size={18} color={couleurTexte} />}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primary: {
    backgroundColor: colors.accent400,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.ink200,
  },
  outlineLight: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  floating: {
    shadowColor: colors.accent700,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  floatingSurvole: {
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  labelPrimary: {
    color: colors.brand900,
  },
  labelOutline: {
    color: colors.ink700,
  },
  labelOutlineLight: {
    color: colors.white,
  },
});
