import { useState } from "react";
import * as Location from "expo-location";

interface Position {
  lat: number;
  lng: number;
  source: "gps" | "manuel";
  label: string;
}

// Permission GPS avec repli manuel si refusée (le client choisit une zone
// dans une liste plutôt qu'un pin sur carte, pour cette première version —
// voir docs/deploiement.md pour la géolocalisation inverse complète).
export function useLocalisation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [refuse, setRefuse] = useState(false);
  const [chargement, setChargement] = useState(false);

  async function demanderPosition() {
    setChargement(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setRefuse(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude, source: "gps", label: "Position actuelle" });
      setRefuse(false);
    } finally {
      setChargement(false);
    }
  }

  function choisirZone(zone: { nom: string; latitude: number; longitude: number }) {
    setPosition({ lat: zone.latitude, lng: zone.longitude, source: "manuel", label: zone.nom });
    setRefuse(false);
  }

  return { position, refuse, chargement, demanderPosition, choisirZone };
}
