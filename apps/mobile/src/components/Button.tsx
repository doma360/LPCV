import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors } from "@/theme/colors";

type Variant = "primary" | "outline" | "outlineLight";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

const variantStyles = {
  primary: { button: "primary", label: "labelPrimary", spinner: colors.brand900 },
  outline: { button: "outline", label: "labelOutline", spinner: colors.brand700 },
  outlineLight: { button: "outlineLight", label: "labelOutlineLight", spinner: colors.white },
} as const;

export default function Button({ label, variant = "primary", loading, disabled, ...props }: ButtonProps) {
  const v = variantStyles[variant];

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
      {loading ? <ActivityIndicator color={v.spinner} /> : <Text style={[styles.label, styles[v.label]]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
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
    fontWeight: "600",
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
