import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "outline" | "outlineLight";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  showArrow?: boolean;
}

const variantStyles = {
  primary: { button: "primary", label: "labelPrimary", spinner: colors.brand900 },
  outline: { button: "outline", label: "labelOutline", spinner: colors.brand700 },
  outlineLight: { button: "outlineLight", label: "labelOutlineLight", spinner: colors.white },
} as const;

export default function Button({ label, variant = "primary", loading, disabled, showArrow, ...props }: ButtonProps) {
  const v = variantStyles[variant];
  const couleurTexte = variant === "primary" ? colors.brand900 : variant === "outline" ? colors.ink700 : colors.white;

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[v.button],
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
