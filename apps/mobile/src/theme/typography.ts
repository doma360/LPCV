// Poppins pour le texte courant, Playfair Display (serif) pour les grands
// titres - remplace les polices systeme par defaut sur toute l'app (voir
// docs/decisions.md). Polices reelles via Google Fonts (@expo-google-fonts),
// gratuites et legales a embarquer - pas les noms fantaisistes d'une image
// de "polices de luxe gratuites" fournie par l'utilisateur, non verifiables.
export const polices = {
  corps: "Poppins_400Regular",
  corpsMedium: "Poppins_500Medium",
  corpsSemiBold: "Poppins_600SemiBold",
  corpsBold: "Poppins_700Bold",
  titre: "PlayfairDisplay_800ExtraBold",
  titreNoir: "PlayfairDisplay_900Black",
} as const;
