import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
  PlayfairDisplay_900Black,
} from "@expo-google-fonts/playfair-display";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAppLock } from "@/hooks/useAppLock";
import { colors } from "@/theme/colors";
import EcranVerrouille from "@/components/EcranVerrouille";

// Poppins par defaut sur tout le texte de l'app : gere par
// src/lib/react-native-shim.tsx + le resolveur Metro dans metro.config.js
// (Text.defaultProps ne fonctionne plus avec React 19, verifie
// empiriquement avant d'adopter cette approche - voir docs/decisions.md).
// Les grands titres passent explicitement en Playfair Display via
// `polices.titre` dans chaque ecran concerne.

function RootNavigator() {
  const { session, loading, onboardingPending } = useAuth();
  const { locked, deverrouiller } = useAppLock(!!session);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream100 }}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  if (locked) {
    return <EcranVerrouille onDeverrouiller={deverrouiller} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && onboardingPending}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !onboardingPending && session.role === "client"}>
        <Stack.Screen name="(client)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !onboardingPending && session.role === "professionnel"}>
        <Stack.Screen name="(professionnel)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [policesChargees] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    PlayfairDisplay_900Black,
  });

  if (!policesChargees) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream100 }}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
