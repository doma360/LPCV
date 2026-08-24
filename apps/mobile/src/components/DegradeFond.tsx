import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { StyleSheet } from "react-native";

interface DegradeFondProps {
  id: string;
  de: string;
  vers: string;
  angle?: "diagonal" | "horizontal" | "vertical";
}

// Fond degrade reutilisable (react-native-svg, deja une dependance du
// projet via PromoCarousel/ClientTabBar - pas de nouvelle lib ajoutee) pour
// remplacer les aplats de couleur unis sur les surfaces "hero" (cartes,
// bandeaux de stats) et donner plus de vie visuelle, voir docs/decisions.md.
export default function DegradeFond({ id, de, vers, angle = "diagonal" }: DegradeFondProps) {
  const coords =
    angle === "horizontal"
      ? { x1: "0", y1: "0", x2: "1", y2: "0" }
      : angle === "vertical"
        ? { x1: "0", y1: "0", x2: "0", y2: "1" }
        : { x1: "0", y1: "0", x2: "1", y2: "1" };

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
      <Defs>
        <LinearGradient id={id} {...coords}>
          <Stop offset="0" stopColor={de} />
          <Stop offset="1" stopColor={vers} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
