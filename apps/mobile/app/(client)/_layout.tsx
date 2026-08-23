import { Tabs } from "expo-router";
import { Home, ClipboardList, User } from "lucide-react-native";
import ClientTabBar from "@/components/ClientTabBar";
import { LocalisationProvider } from "@/hooks/useLocalisation";

export default function ClientLayout() {
  return (
    <LocalisationProvider>
      <Tabs tabBar={(props) => <ClientTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="demandes"
          options={{ title: "Demandes", tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="profil"
          options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
        />
        <Tabs.Screen name="parametres" options={{ href: null }} />
      </Tabs>
    </LocalisationProvider>
  );
}
