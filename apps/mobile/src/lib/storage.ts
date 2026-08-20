import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// SecureStore est une API native (Keychain/Keystore) : indisponible sur web.
// L'app cible Android/iOS (Volume 4 du LPD) — le web ne sert qu'à prévisualiser
// en dev, donc localStorage suffit largement pour cet usage-là.
const isWeb = Platform.OS === "web";

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
