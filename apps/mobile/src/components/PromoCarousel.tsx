import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import Text from "@/components/Texte";
import { ShieldCheck, Sparkles, Wallet } from "lucide-react-native";
import { colors } from "@/theme/colors";
import DegradeFond from "@/components/DegradeFond";

const LARGEUR_ECRAN = Dimensions.get("window").width;
const LARGEUR_CARTE = LARGEUR_ECRAN - 40;

const SLIDES = [
  {
    titre: "Trouvez le pro qu'il vous faut",
    texte: "Des professionnels vérifiés, près de chez vous à Abidjan.",
    icone: ShieldCheck,
    fond: colors.brand900,
    fondVers: colors.brand700,
    accent: colors.accent400,
  },
  {
    titre: "Un pro se déplace chez vous",
    texte: "Décrivez votre besoin, un professionnel vérifié arrive à votre domicile.",
    icone: Sparkles,
    fond: colors.bleuClair,
    fondVers: colors.brand900,
    accent: colors.brand900,
  },
  {
    titre: "Paiement simple et sécurisé",
    texte: "Réglez en Mobile Money, en toute confiance.",
    icone: Wallet,
    fond: colors.accent400,
    fondVers: colors.accent500,
    accent: colors.brand900,
  },
] as const;

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);
  const listeRef = useRef<FlatList>(null);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / LARGEUR_CARTE);
    if (i !== index) setIndex(i);
  }

  // Defilement automatique : un accueil statique se sentait "dormant" (retour
  // utilisateur), le swipe manuel reste possible et remet le minuteur a zero.
  useEffect(() => {
    const id = setInterval(() => {
      const suivant = (index + 1) % SLIDES.length;
      listeRef.current?.scrollToOffset({ offset: suivant * LARGEUR_CARTE, animated: true });
      setIndex(suivant);
    }, 4000);
    return () => clearInterval(id);
  }, [index]);

  return (
    <View>
      <FlatList
        ref={listeRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={LARGEUR_CARTE}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.titre}
        renderItem={({ item, index: i }) => {
          const Icone = item.icone;
          return (
            <View style={[styles.slide, { width: LARGEUR_CARTE }]}>
              <DegradeFond id={`promoDegrade${i}`} de={item.fond} vers={item.fondVers} />
              <View style={[styles.iconeRond, { backgroundColor: item.accent }]}>
                <Icone size={22} color={item.fond} />
              </View>
              <Text style={[styles.titre, { color: item.accent === colors.brand900 ? colors.brand900 : colors.white }]}>
                {item.titre}
              </Text>
              <Text style={[styles.texte, { color: item.accent === colors.brand900 ? colors.ink700 : colors.brand100 }]}>
                {item.texte}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.puces}>
        {SLIDES.map((s, i) => (
          <View key={s.titre} style={[styles.puce, i === index && styles.puceActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { borderRadius: 20, padding: 20, minHeight: 140, justifyContent: "center", marginRight: 0, overflow: "hidden" },
  iconeRond: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  titre: { fontSize: 16, fontWeight: "800" },
  texte: { fontSize: 12.5, marginTop: 4, lineHeight: 18 },
  puces: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
  puce: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ink200 },
  puceActive: { backgroundColor: colors.brand900, width: 18 },
});
