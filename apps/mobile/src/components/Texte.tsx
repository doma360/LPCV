import { forwardRef } from "react";
import { Text as RNText, type Text as RNTextInstance, type TextProps } from "react-native";
import { polices } from "@/theme/typography";

// Remplace `Text` de react-native partout dans l'app (import renomme, voir
// docs/decisions.md) pour appliquer Poppins par defaut sans toucher chaque
// StyleSheet existant. Text.defaultProps ne fonctionne plus avec React 19,
// et le detour par un resolveur Metro personnalise ne s'est pas declenche
// dans ce projet (verifie avec un canari ecrivant directement sur disque) -
// ce wrapper est la solution fiable qui reste.
const Texte = forwardRef<RNTextInstance, TextProps>((props, ref) => (
  <RNText ref={ref} {...props} style={[{ fontFamily: polices.corps }, props.style]} />
));
Texte.displayName = "Texte";

export default Texte;
