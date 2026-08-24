import { forwardRef } from "react";
import { TextInput as RNTextInput, type TextInput as RNTextInputInstance, type TextInputProps } from "react-native";
import { polices } from "@/theme/typography";

// Meme principe que Texte.tsx : remplace `TextInput` de react-native
// partout dans l'app pour appliquer Poppins par defaut.
const Saisie = forwardRef<RNTextInputInstance, TextInputProps>((props, ref) => (
  <RNTextInput ref={ref} {...props} style={[{ fontFamily: polices.corps }, props.style]} />
));
Saisie.displayName = "Saisie";

export default Saisie;
