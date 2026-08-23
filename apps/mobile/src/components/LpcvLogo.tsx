import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { colors } from "@/theme/colors";

interface LpcvLogoProps {
  size?: number;
}

// Meme geometrie que l'icone de l'APK (apps/mobile/assets/icon.png, genere
// via generate-icons.mjs) : maison + porte en creux + cle/tournevis croises.
// Rendue en SVG plutot qu'en image pour rester nette a n'importe quelle
// taille (badge d'en-tete, etc.) sans dupliquer un fichier PNG separe.
export default function LpcvLogo({ size = 36 }: LpcvLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Rect width="1024" height="1024" rx="220" fill={colors.accent400} />
      <Path d="M 512 150 L 884 424 L 800 424 L 800 872 L 224 872 L 224 424 L 140 424 Z" fill={colors.brand900} />
      <Path d="M 452 872 L 452 706 A 60 60 0 0 1 572 706 L 572 872 Z" fill={colors.accent400} />
      <G transform="translate(512 560)">
        <G transform="rotate(45)" fill={colors.white}>
          <Rect x="-24" y="-170" width="48" height="300" rx="24" />
          <Circle cx="0" cy="-170" r="46" />
          <Circle cx="0" cy="-170" r="24" fill={colors.brand900} />
        </G>
        <G transform="rotate(-45)" fill={colors.white}>
          <Rect x="-20" y="-150" width="40" height="280" rx="20" />
          <Rect x="-42" y="-176" width="84" height="56" rx="10" />
        </G>
      </G>
    </Svg>
  );
}
