import { Platform } from "react-native";
import Constants from "expo-constants";
import { getItem } from "@/lib/storage";

function resolveApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:4000`;
  return "http://localhost:4000";
}

// À part de apiFetch car le multipart ne doit pas forcer Content-Type: json —
// fetch doit fixer lui-même la boundary du formulaire.
export async function uploadPhoto(uri: string): Promise<string> {
  const accessToken = await getItem("lpcv_access");
  const formData = new FormData();

  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    formData.append("fichier", blob, "photo.jpg");
  } else {
    // @ts-expect-error — forme attendue par React Native pour un upload multipart
    formData.append("fichier", { uri, name: "photo.jpg", type: "image/jpeg" });
  }

  const res = await fetch(`${resolveApiUrl()}/api/v1/uploads/photo`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? "Envoi de la photo impossible");
  return json.data.url;
}
