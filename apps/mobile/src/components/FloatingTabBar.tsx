import { useEffect, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

// Écrans enregistrés comme onglets mais volontairement absents de la barre
// (ex. Paramètres, atteint via le bouton réglages du Profil).
const ROUTES_MASQUEES = new Set(["parametres"]);

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const routesVisibles = state.routes.filter((route) => !ROUTES_MASQUEES.has(route.name));
  const routeActive = state.routes[state.index];

  const [layouts, setLayouts] = useState<Record<string, { x: number; largeur: number }>>({});
  const translateX = useRef(new Animated.Value(0)).current;
  const largeurCapsule = useRef(new Animated.Value(0)).current;
  const opacite = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const layout = layouts[routeActive.key];
    if (!layout) return;
    Animated.parallel([
      Animated.spring(translateX, { toValue: layout.x, useNativeDriver: false, speed: 16, bounciness: 6 }),
      Animated.spring(largeurCapsule, { toValue: layout.largeur, useNativeDriver: false, speed: 16, bounciness: 6 }),
      Animated.timing(opacite, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();
  }, [routeActive.key, layouts, translateX, largeurCapsule, opacite]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        <Animated.View
          pointerEvents="none"
          style={[styles.capsule, { transform: [{ translateX }], width: largeurCapsule, opacity: opacite }]}
        />
        {routesVisibles.map((route) => {
          const { options } = descriptors[route.key];
          const focused = route.key === routeActive.key;
          const label = typeof options.title === "string" ? options.title : route.name;
          const couleur = focused ? colors.brand900 : "rgba(255,255,255,0.75)";

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
              {options.tabBarIcon?.({ focused, color: couleur, size: 20 })}
              <Text style={[styles.label, { color: couleur }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: colors.cream100 },
  bar: {
    flexDirection: "row",
    backgroundColor: colors.brand900,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  capsule: {
    position: "absolute",
    top: 8,
    bottom: 8,
    backgroundColor: colors.accent400,
    borderRadius: 20,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 8, borderRadius: 20 },
  label: { fontSize: 11, fontWeight: "700" },
});
