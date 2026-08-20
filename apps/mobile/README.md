# LPCV Mobile

App React Native (Expo Router), une seule appli mais deux jeux d'écrans selon le rôle (Volume 4/7 du LPD) : `app/(client)` et `app/(professionnel)`, séparés par `app/_layout.tsx` via `Stack.Protected`.

## Démarrage local

```bash
# L'API doit tourner (voir apps/api/README.md)
pnpm dev        # web, le plus rapide pour itérer
pnpm android    # émulateur/appareil Android
pnpm ios        # simulateur iOS
```

L'URL de l'API est déduite automatiquement de la machine qui fait tourner `expo start` (utile sur un appareil physique via Expo Go). `EXPO_PUBLIC_API_URL` dans `.env` peut la forcer — voir `.env.example`.

## État des écrans

Complets et testés en vrai (bienvenue → inscription/connexion → slides → recherche → demande avec photo → acceptation → en route avec position live → appel, avec les deux rôles) :
- `(auth)` : Bienvenue (branding + choix connexion/inscription), Connexion, Inscription (16 métiers au choix pour un professionnel, Volume 1 §7 du LPD), Mot de passe oublié + Réinitialisation (code à 6 chiffres, provider mocké — voir `docs/deploiement.md`)
- `(onboarding)` : slides de présentation affichées une seule fois, juste après une inscription (pas après une connexion) — "Passer" ou parcourir jusqu'au bout mènent au même endroit
- Client : Rechercher (matching géolocalisé, position lisible via géocodage inverse, photos jointes à la demande, estimation de prix avant confirmation), Mes demandes (distance du professionnel affichée en temps réel pendant "en route"), Profil, Paramètres (infos du compte, changement de mot de passe, notifications, déverrouillage rapide, désactivation du compte)
- Professionnel : Demandes reçues (accepter/refuser, avancer le statut, appeler, envoi automatique de la position pendant "en route"), Disponibilités (ajouter/supprimer des créneaux), Revenus (total gagné + historique), Profil (statut de vérification, note, avis reçus, portfolio de réalisations), Paramètres (même écran que côté client)

Verrouillage rapide (biométrie/PIN, `expo-local-authentication`) : activable depuis Paramètres, verrouille l'appli au démarrage et au retour au premier plan. Reste toujours déverrouillé sur web (pas de capteur), c'est le comportement attendu — à tester en vrai sur un appareil/émulateur avec empreinte enregistrée.

Pas encore construit : widget de carte visuelle (pin sur carte, position affichée sur un plan) — `react-native-maps` n'a pas d'équivalent web fiable, donc pas testable dans cet environnement de dev ; nécessite aussi de choisir un fournisseur (voir `docs/deploiement.md`). Le suivi temps réel *fonctionne* déjà, juste sans widget de carte pour l'instant (affichage texte de la distance). Design volontairement minimal partout — à retravailler dans une passe dédiée plus tard.

## Notes techniques

- **`expo-secure-store` ne fonctionne pas sur web** (API native Keychain/Keystore) — `src/lib/storage.ts` bascule sur `localStorage` uniquement pour la préview web de développement ; l'app cible réellement Android/iOS.
- **Metro plante avec `spawn EPERM`** dans cet environnement de dev sandboxé, qui refuse le spawn de processus enfants. `metro.config.js` force `maxWorkers = 1`.
- **`react` et `react-dom` doivent être strictement à la même version** pour le support web (`react-native-web`) — les deux sont épinglés à `19.1.0` dans `package.json`, ne pas les laisser dériver indépendamment.
- Si `expo start` plante immédiatement avec `TypeError: Body is unusable`, c'est un bug du "doctor" de la CLI Expo qui vérifie les versions en ligne — relancer avec `EXPO_OFFLINE=1` contourne le problème.
- **`Alert.alert` de `react-native` est un no-op silencieux sur web** (`react-native-web` ne l'implémente pas — confirmé dans son code source). Tout écran qui a besoin d'une confirmation testable en preview web (ex. désactivation de compte dans Paramètres) doit prévoir un repli `window.confirm` sur `Platform.OS === "web"`, le natif utilisant `Alert.alert` normalement.
