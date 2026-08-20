import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAppLock } from "@/hooks/useAppLock";
import { colors } from "@/theme/colors";
import EcranVerrouille from "@/components/EcranVerrouille";

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
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
