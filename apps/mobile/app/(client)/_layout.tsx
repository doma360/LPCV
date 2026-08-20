import { Tabs } from "expo-router";
import { Search, ClipboardList, User } from "lucide-react-native";
import { colors } from "@/theme/colors";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand900,
        tabBarInactiveTintColor: colors.ink500,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Rechercher", tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="demandes"
        options={{ title: "Mes demandes", tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
