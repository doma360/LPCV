import { StyleSheet, View } from "react-native";
import Text from "@/components/Texte";
import { Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { Locate } from "lucide-react-native";
import { colors } from "@/theme/colors";

interface MiniCartePositionProps {
  label: string | null;
  lat?: number;
  lng?: number;
  chargement?: boolean;
  onRecentrer: () => void;
}

// Centre par defaut : Plateau, Abidjan - tant qu'aucune position n'est
// connue (avant la premiere localisation/choix de zone).
const ABIDJAN_LAT = 5.3599517;
const ABIDJAN_LNG = -4.0082563;

// Vraie carte OpenStreetMap (tuiles + marqueur) via Leaflet charge dans une
// WebView - gratuit, sans cle API, en attendant le choix definitif d'un
// fournisseur (Google Maps/Mapbox), voir docs/decisions.md. La cle React
// change avec les coordonnees pour forcer un rechargement propre de la
// WebView au recentrage plutot que de gerer un pont postMessage.
function fabriquerHtml(lat: number, lng: number) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #carte { height: 100%; margin: 0; padding: 0; background: ${colors.brand50}; }
    .leaflet-control-attribution { font-size: 8px; }
    .marqueur-lpcv {
      width: 34px; height: 34px; border-radius: 17px;
      background: ${colors.brand900}; border: 3px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
    }
    .marqueur-lpcv::after {
      content: ""; width: 10px; height: 10px; border-radius: 5px; background: ${colors.accent400};
    }
  </style>
</head>
<body>
  <div id="carte"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('carte', { zoomControl: false, attributionControl: true }).setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    var icone = L.divIcon({ className: '', html: '<div class="marqueur-lpcv"></div>', iconSize: [34, 34], iconAnchor: [17, 17] });
    L.marker([${lat}, ${lng}], { icon: icone }).addTo(map);
  </script>
</body>
</html>`;
}

export default function MiniCartePosition({ label, lat, lng, chargement, onRecentrer }: MiniCartePositionProps) {
  const centreLat = lat ?? ABIDJAN_LAT;
  const centreLng = lng ?? ABIDJAN_LNG;

  return (
    <View style={styles.carte}>
      <WebView
        key={`${centreLat.toFixed(5)}-${centreLng.toFixed(5)}`}
        style={styles.webview}
        originWhitelist={["*"]}
        source={{ html: fabriquerHtml(centreLat, centreLng) }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      {label && (
        <View style={styles.labelChip} pointerEvents="none">
          <Text style={styles.labelTexte} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}

      <Pressable style={styles.recentrerBtn} onPress={onRecentrer} disabled={chargement}>
        <Locate size={18} color={colors.brand900} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  carte: {
    height: 160,
    borderRadius: 20,
    backgroundColor: colors.brand50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.ink100,
  },
  webview: { flex: 1, backgroundColor: "transparent" },
  labelChip: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 56,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  labelTexte: { fontSize: 12, fontWeight: "700", color: colors.ink900 },
  recentrerBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
