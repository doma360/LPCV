import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

interface TextFieldProps extends TextInputProps {
  label: string;
}

export default function TextField({ label, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.ink500} style={styles.input} {...props} />
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
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.ink200,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink900,
    backgroundColor: colors.white,
  },
});
