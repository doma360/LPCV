import type { ComponentType } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "@/theme/colors";

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: ComponentType<LucideProps>;
}

export default function TextField({ label, icon: Icon, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {Icon && (
          <View style={styles.iconBadge}>
            <Icon size={16} color={colors.brand700} />
          </View>
        )}
        <TextInput
          placeholderTextColor={colors.ink500}
          style={[styles.input, Icon ? styles.inputAvecIcone : undefined, style]}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.ink700,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  iconBadge: {
    position: "absolute",
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: colors.ink200,
    borderRadius: 999,
    paddingHorizontal: 18,
    fontSize: 15,
    color: colors.ink900,
    backgroundColor: colors.white,
  },
  inputAvecIcone: {
    paddingLeft: 50,
  },
});
