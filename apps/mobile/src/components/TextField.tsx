import { useState, type ComponentType } from "react";
import { Pressable, StyleSheet, View, type TextInputProps } from "react-native";
import Text from "@/components/Texte";
import TextInput from "@/components/Saisie";
import { Eye, EyeOff } from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
import { colors } from "@/theme/colors";

interface TextFieldProps extends TextInputProps {
  label: string;
  icon?: ComponentType<LucideProps>;
}

// secureTextEntry gere ici plutot que par chaque appelant : autoCapitalize
// desactive par defaut (un mot de passe ne devrait jamais etre capitalise
// par le clavier - manquant sur le champ Connexion, source confirmee d'un
// vrai souci de connexion en usage reel le 2026-09-01) + bascule
// afficher/masquer, pour qu'on puisse verifier ce qu'on a tape.
export default function TextField({ label, icon: Icon, style, secureTextEntry, autoCapitalize, ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  const masque = secureTextEntry && !visible;

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
          style={[
            styles.input,
            Icon ? styles.inputAvecIcone : undefined,
            secureTextEntry ? styles.inputAvecOeil : undefined,
            style,
          ]}
          secureTextEntry={masque}
          autoCapitalize={autoCapitalize ?? (secureTextEntry ? "none" : undefined)}
          autoCorrect={secureTextEntry ? false : undefined}
          {...props}
        />
        {secureTextEntry && (
          <Pressable style={styles.oeilBtn} onPress={() => setVisible((v) => !v)} hitSlop={8}>
            {visible ? <EyeOff size={18} color={colors.ink500} /> : <Eye size={18} color={colors.ink500} />}
          </Pressable>
        )}
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
  inputAvecOeil: {
    paddingRight: 46,
  },
  oeilBtn: {
    position: "absolute",
    right: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
