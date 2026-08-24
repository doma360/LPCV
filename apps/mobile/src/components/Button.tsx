import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "outline" | "outlineLight";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  showArrow?: boolean;
  // Ombre marquee + leger effet de "levitation" au survol (web) / a l'appui
  // (tactile) - reserve aux boutons d'action principale isoles (ex. CTA de
  // Bienvenue), pas active par defaut pour ne pas changer tous les boutons
  // existants de l'app.
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
  const levitation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!floating) return;
    Animated.spring(levitation, { toValue: survole ? 1 : 0, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [survole, floating, levitation]);

  return (
    <Animated.View
      style={
        floating && {
          transform: [{ translateY: levitation.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
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
