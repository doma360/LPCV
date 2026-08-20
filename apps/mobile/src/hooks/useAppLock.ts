import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { getItem } from "@/lib/storage";

const CLE_VERROUILLAGE = "lpcv_verrouillage_actif";

// Verrouille l'appli au démarrage et à chaque retour au premier plan si
// l'utilisateur a activé le déverrouillage rapide dans Paramètres. Sans
// équivalent matériel (web, émulateur sans empreinte enregistrée), reste
// toujours déverrouillé — voir apps/mobile/README.md.
export function useAppLock(sessionActive: boolean) {
  const [actif, setActif] = useState(false);
  const [locked, setLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!sessionActive) {
      setLocked(false);
      return;
    }
    if (Platform.OS === "web") return;

    let annule = false;
    (async () => {
      const flag = await getItem(CLE_VERROUILLAGE);
      if (annule) return;
      setActif(flag === "1");
      if (flag === "1") setLocked(true);
    })();
    return () => {
      annule = true;
    };
  }, [sessionActive]);

  useEffect(() => {
    if (!actif) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/active/) && next.match(/inactive|background/)) {
        setLocked(true);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [actif]);

  async function deverrouiller() {
    const resultat = await LocalAuthentication.authenticateAsync({ promptMessage: "Déverrouillez LPCV" });
    if (resultat.success) setLocked(false);
    return resultat.success;
  }

  return { locked: sessionActive && actif && locked, deverrouiller };
}
