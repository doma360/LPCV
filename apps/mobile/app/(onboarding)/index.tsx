import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import Text from "@/components/Texte";
import { BadgeCheck, Home, MapPin, Wallet } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import { polices } from "@/theme/typography";
import Button from "@/components/Button";

const { width } = Dimensions.get("window");

const slides = [
  {
    icone: Home,
    titre: "Bienvenue sur LPCV",
    texte: "Trouvez un professionnel vérifié près de chez vous, en quelques minutes.",
    teinteFond: colors.accent400,
    teinteIcone: colors.brand900,
  },
  {
    icone: BadgeCheck,
    titre: "Professionnels vérifiés",
    texte: "Chaque profil est contrôlé par notre équipe avant de pouvoir intervenir chez vous.",
    teinteFond: colors.brand900,
    teinteIcone: colors.accent400,
  },
  {
    icone: MapPin,
    titre: "Suivi en temps réel",
    texte: "Suivez votre professionnel jusqu'à son arrivée, et appelez-le directement si besoin.",
    teinteFond: colors.bleuClair,
    teinteIcone: colors.brand900,
  },
  {
    icone: Wallet,
    titre: "Paiement sécurisé",
    texte: "Wave, Orange Money, MTN Money, Moov Money ou espèces — comme vous préférez.",
    teinteFond: colors.accent300,
    teinteIcone: colors.accent700,
  },
];

// Transition type "diapo" (fondu + zoom + leger glissement vertical) pilotee
// par la position de scroll, plutot qu'un simple defilement plat - chaque
// slide apparait en fondu/zoom depuis sa voisine, comme un enchainement de
// diapositives.
export default function Onboarding() {
  const { completerOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const listRef = useRef<Animated.FlatList<(typeof slides)[number]>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(i);
  }

  function suivant() {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      completerOnboarding();
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.passer} onPress={completerOnboarding}>
        <Text style={styles.passerLabel}>Passer</Text>
      </Pressable>

      <Animated.FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onScrollEnd}
        keyExtractor={(item) => item.titre}
        renderItem={({ item, index: i }) => {
          const entree = [(i - 1) * width, i * width, (i + 1) * width];
          const opacity = scrollX.interpolate({ inputRange: entree, outputRange: [0.25, 1, 0.25], extrapolate: "clamp" });
          const scale = scrollX.interpolate({ inputRange: entree, outputRange: [0.82, 1, 0.82], extrapolate: "clamp" });
          const translateY = scrollX.interpolate({ inputRange: entree, outputRange: [26, 0, 26], extrapolate: "clamp" });

          return (
            <View style={[styles.slide, { width }]}>
              <Animated.View style={{ opacity, transform: [{ scale }, { translateY }] }}>
                <View style={styles.glowOuter}>
                  <View style={styles.glowInner}>
                    <View style={[styles.iconTile, { backgroundColor: item.teinteFond }]}>
                      <item.icone size={40} color={item.teinteIcone} />
                    </View>
                  </View>
                </View>
                <Text style={styles.titre}>{item.titre}</Text>
                <Text style={styles.texte}>{item.texte}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={index === slides.length - 1 ? "Commencer" : "Suivant"} showArrow floating onPress={suivant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100 },
  passer: { position: "absolute", top: 56, right: 20, zIndex: 10 },
  passerLabel: { fontSize: 14, fontWeight: "600", color: colors.ink500 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  glowOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent300,
    opacity: 0.5,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 28,
  },
  glowInner: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  iconTile: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titre: { fontFamily: polices.titre, fontSize: 24, color: colors.ink900, textAlign: "center" },
  texte: { fontSize: 14, color: colors.ink500, textAlign: "center", marginTop: 12, lineHeight: 20 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ink200 },
  dotActive: { backgroundColor: colors.brand900, width: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
});
