import { Tabs } from "expo-router";
import { Search, ClipboardList, User } from "lucide-react-native";
import FloatingTabBar from "@/components/FloatingTabBar";

export default function ClientLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: "Rechercher", tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
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
  );
}
