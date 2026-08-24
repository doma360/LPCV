import { Image } from "react-native";

interface LpcvLogoProps {
  size?: number;
}

// Vrai fichier logo fourni par l'utilisateur (apps/mobile/assets/logo-icon.png,
// recadre sur la seule icone - maison/ouvrier/pin, sans le wordmark "LPCV" qui
// est gere separement par les ecrans consommateurs). Remplace l'ancienne
// version SVG simplifiee dessinee a la main (voir docs/decisions.md).
const RATIO = 520 / 419; // largeur / hauteur du fichier source

export default function LpcvLogo({ size = 36 }: LpcvLogoProps) {
  return (
    <Image
      source={require("../../assets/logo-icon.png")}
      style={{ height: size, width: size * RATIO }}
      resizeMode="contain"
    />
  );
}
