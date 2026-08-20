import { Tabs } from "expo-router";
import { ClipboardList, User } from "lucide-react-native";
import { colors } from "@/theme/colors";

export default function ProfessionnelLayout() {
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
        options={{ title: "Demandes", tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
