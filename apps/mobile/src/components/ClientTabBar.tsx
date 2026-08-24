import { useEffect, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme/colors";

// Barre d'onglets cote client uniquement (le pro garde FloatingTabBar pour
// l'instant, voir docs/decisions.md) : pastille blanche + faisceau lumineux
// qui glissent jusqu'a l'onglet actif, plutot qu'un simple indicateur fin -
// concept choisi parmi deux references envoyees par l'utilisateur (pastille+
// faisceau vs decoupe/bosse qui fait remonter l'icone active), la decoupe
// demandant un morphing de tracé SVG bien plus couteux a animer proprement.
// Toutes les routes du groupe (client) qui ne sont pas des onglets a
// proprement parler - avant, l'ancienne barre icones-seules les rendait
// invisibles "par accident" (pas d'icone = rien affiche) ; avec des
// libelles textuels, il faut les exclure explicitement.
const ROUTES_MASQUEES = new Set([
  "parametres",
  "demander",
  "reserver",
  "rechercher",
  "notifications",
  "pro/[id]",
  "reservation/[id]",
]);

const PASTILLE = 46;
const FAISCEAU_LARGEUR = 70;
const FAISCEAU_HAUTEUR = 34;

export default function ClientTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routesVisibles = state.routes.filter((route) => !ROUTES_MASQUEES.has(route.name));
  const routeActive = state.routes[state.index];

  const [layouts, setLayouts] = useState<Record<string, { x: number; largeur: number }>>({});
  const translateX = useRef(new Animated.Value(0)).current;
  const opacite = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const layout = layouts[routeActive.key];
    if (!layout) return;
    const centre = layout.x + layout.largeur / 2;
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: centre,
        useNativeDriver: false,
        speed: 16,
        bounciness: 6,
      }),
      Animated.timing(opacite, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  }, [routeActive.key, layouts, translateX, opacite]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.faisceau,
          { opacity: opacite, transform: [{ translateX: Animated.subtract(translateX, FAISCEAU_LARGEUR / 2) }] },
        ]}
      >
        <Svg width={FAISCEAU_LARGEUR} height={FAISCEAU_HAUTEUR}>
          <Defs>
            <LinearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent400} stopOpacity={0.35} />
              <Stop offset="1" stopColor={colors.accent400} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={FAISCEAU_LARGEUR} height={FAISCEAU_HAUTEUR} fill="url(#beam)" />
        </Svg>
      </Animated.View>

      <View style={styles.bar}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pastille,
            { opacity: opacite, transform: [{ translateX: Animated.subtract(translateX, PASTILLE / 2) }] },
          ]}
        />
        {routesVisibles.map((route) => {
          const { options } = descriptors[route.key];
          const focused = route.key === routeActive.key;
          const couleurIcone = focused ? colors.brand900 : "rgba(255,255,255,0.5)";
          const couleurLabel = focused ? colors.accent400 : "rgba(255,255,255,0.4)";
          const label = typeof options.title === "string" ? options.title : route.name;

          return (
            <Pressable
              key={route.key}
              onLayout={(e: LayoutChangeEvent) => {
                const { x, width } = e.nativeEvent.layout;
                setLayouts((prev) => ({ ...prev, [route.key]: { x, largeur: width } }));
              }}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={styles.tab}
            >
              {options.tabBarIcon?.({ focused, color: couleurIcone, size: 22 })}
              <Text style={[styles.label, { color: couleurLabel }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: colors.cream100 },
  faisceau: { position: "absolute", top: -FAISCEAU_HAUTEUR + 14, left: 16 },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.ink900,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pastille: {
    position: "absolute",
    top: 4,
    width: PASTILLE,
    height: PASTILLE,
    borderRadius: PASTILLE / 2,
    backgroundColor: colors.white,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 },
  label: { fontSize: 11, fontWeight: "700" },
});
