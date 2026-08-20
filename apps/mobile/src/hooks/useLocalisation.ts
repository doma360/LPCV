import { useState } from "react";
import * as Location from "expo-location";

interface Position {
  lat: number;
  lng: number;
  source: "gps" | "manuel";
  label: string;
}

// Nominatim (OpenStreetMap) : géocodage inverse gratuit et sans clé, correct
// pour notre faible volume. À remplacer par Google/Mapbox si le volume grossit
// (voir docs/deploiement.md) — le reste du code ne change pas, seule cette fonction.
async function adresseLisible(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&accept-language=fr`,
      { headers: { "User-Agent": "LPCV/1.0 (Abidjan)" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const { suburb, neighbourhood, quarter, city_district, town, city } = data.address ?? {};
    const quartier = suburb ?? neighbourhood ?? quarter ?? city_district;
    return [quartier, town ?? city].filter(Boolean).join(", ") || data.display_name || null;
  } catch {
    return null;
  }
}

// Permission GPS avec repli manuel par quartier si refusée (pas encore de
// pin-sur-carte — voir docs/deploiement.md).
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
      const { latitude, longitude } = loc.coords;
      setPosition({ lat: latitude, lng: longitude, source: "gps", label: "Position actuelle" });
      setRefuse(false);

      const adresse = await adresseLisible(latitude, longitude);
      if (adresse) setPosition({ lat: latitude, lng: longitude, source: "gps", label: adresse });
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
