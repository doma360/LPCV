import { useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import Text from "@/components/Texte";
import { ShieldCheck, MapPin, Wallet, Headphones } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/theme/colors";
import Button from "@/components/Button";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: ShieldCheck,
    titre: "Bienvenue sur LPCV",
    texte: "Trouvez un professionnel vérifié près de chez vous, en quelques minutes.",
  },
  {
    icon: ShieldCheck,
    titre: "Professionnels vérifiés",
    texte: "Chaque profil est contrôlé par notre équipe avant de pouvoir intervenir chez vous.",
  },
  {
    icon: MapPin,
    titre: "Suivi en temps réel",
    texte: "Suivez votre professionnel jusqu'à son arrivée, et appelez-le directement si besoin.",
  },
  {
    icon: Wallet,
    titre: "Paiement sécurisé",
    texte: "Wave, Orange Money, MTN Money, Moov Money ou espèces — comme vous préférez.",
  },
];

export default function Onboarding() {
  const { completerOnboarding } = useAuth();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
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

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(item) => item.titre}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <item.icon size={40} color={colors.brand900} />
            </View>
            <Text style={styles.titre}>{item.titre}</Text>
            <Text style={styles.texte}>{item.texte}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={index === slides.length - 1 ? "Commencer" : "Suivant"} onPress={suivant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream100 },
  passer: { position: "absolute", top: 56, right: 20, zIndex: 10 },
  passerLabel: { fontSize: 14, fontWeight: "600", color: colors.ink500 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.accent400,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  titre: { fontSize: 22, fontWeight: "700", color: colors.ink900, textAlign: "center" },
  texte: { fontSize: 14, color: colors.ink500, textAlign: "center", marginTop: 10, lineHeight: 20 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 16 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ink200 },
  dotActive: { backgroundColor: colors.brand900, width: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 40 },
});
