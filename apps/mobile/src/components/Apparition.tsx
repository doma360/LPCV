import { useEffect, useRef } from "react";
import { Animated, Easing, type ViewStyle } from "react-native";

interface ApparitionProps {
  children: React.ReactNode;
  delai?: number;
  style?: ViewStyle | ViewStyle[];
}

// Entree fondu + leger glissement vers le haut au montage - vocabulaire de
// mouvement partage pour la passe "animations/transitions a revoir"
// (voir docs/decisions.md), applique au contenu principal des ecrans qui
// n'avaient jusqu'ici aucune animation, et aux items de listes (avec un
// `delai` par index pour un effet en cascade).
export default function Apparition({ children, delai = 0, style }: ApparitionProps) {
  const valeur = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(valeur, {
      toValue: 1,
      duration: 420,
      delay: delai,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [valeur, delai]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: valeur,
          transform: [{ translateY: valeur.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
