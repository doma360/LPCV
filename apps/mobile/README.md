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

Complets et testés en vrai (bienvenue → inscription/connexion → slides → recherche → demande → acceptation → appel, avec les deux rôles) :
- `(auth)` : Bienvenue (branding + choix connexion/inscription), Connexion, Inscription (16 métiers au choix pour un professionnel, Volume 1 §7 du LPD)
- `(onboarding)` : slides de présentation affichées une seule fois, juste après une inscription (pas après une connexion) — "Passer" ou parcourir jusqu'au bout mènent au même endroit
- Client : Rechercher (matching géolocalisé avec estimation de prix avant confirmation), Mes demandes, Profil
- Professionnel : Demandes reçues (accepter/refuser, avancer le statut, appeler), Profil (statut de vérification, note)

Pas encore construits : calendrier de disponibilités, revenus, avis reçus (professionnel) ; upload de photos sur une demande ; carte + suivi temps réel de l'intervention ; pin-sur-carte et géolocalisation inverse (le repli GPS refusé se limite pour l'instant à une liste de quartiers, voir `src/hooks/useLocalisation.ts`). Design volontairement minimal partout — à retravailler dans une passe dédiée plus tard.

## Notes techniques

- **`expo-secure-store` ne fonctionne pas sur web** (API native Keychain/Keystore) — `src/lib/storage.ts` bascule sur `localStorage` uniquement pour la préview web de développement ; l'app cible réellement Android/iOS.
- **Metro plante avec `spawn EPERM`** dans cet environnement de dev sandboxé, qui refuse le spawn de processus enfants. `metro.config.js` force `maxWorkers = 1`.
- **`react` et `react-dom` doivent être strictement à la même version** pour le support web (`react-native-web`) — les deux sont épinglés à `19.1.0` dans `package.json`, ne pas les laisser dériver indépendamment.
- Si `expo start` plante immédiatement avec `TypeError: Body is unusable`, c'est un bug du "doctor" de la CLI Expo qui vérifie les versions en ligne — relancer avec `EXPO_OFFLINE=1` contourne le problème.
