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

Complets et testés en vrai (bienvenue → choix du profil → inscription/connexion → slides → recherche → demande avec photo → acceptation → en route avec position live → appel, avec les deux rôles) :
- `(auth)` : Bienvenue (un seul bouton "Commencer", pas d'autre lien), Choisir un rôle (deux cartes Client/Professionnel en couleurs pleines, inspirées d'Artisanpro CI — voir `docs/decisions.md`), Authentification (un seul écran par rôle avec bascule Connexion/Inscription façon Artisanpro CI — badge "Espace Client"/"Espace Professionnel", 16 métiers au choix pour un professionnel côté Inscription, Volume 1 §7 du LPD), Mot de passe oublié + Réinitialisation (code à 6 chiffres, provider mocké — voir `docs/deploiement.md`, redirige vers Authentification en connexion après succès)
- `(onboarding)` : slides de présentation affichées une seule fois, juste après une inscription (pas après une connexion) — "Passer" ou parcourir jusqu'au bout mènent au même endroit
- Client : Rechercher (matching géolocalisé, position lisible via géocodage inverse, photos jointes à la demande, estimation de prix avant confirmation), Mes demandes (distance du professionnel affichée en temps réel pendant "en route" ; relance automatique de la recherche sur le même métier si le professionnel refuse, sans action du client ; avis à laisser une fois une demande "Terminée"), Profil (avis laissés), Paramètres (infos du compte, changement de mot de passe, notifications, déverrouillage rapide, désactivation du compte)
- Professionnel : Demandes reçues (devenu l'écran "dashboard" du pro — bande de chiffres clés en haut : demandes actives, total gagné, note moyenne ; bouton hamburger qui ouvre `ProSidebar`, un tiroir de navigation regroupant Carte membre/Modifier le profil/Paramètres), accepter/refuser, avancer le statut, appeler, envoi automatique de la position pendant "en route", Disponibilités (ajouter/supprimer des créneaux), Revenus (total gagné + historique), Profil (statut de vérification, note, avis reçus, portfolio de réalisations), Modifier mon profil (présentation, tarif indicatif, zones d'intervention — sans quoi le professionnel n'apparaît dans aucune recherche client), Carte membre (QR code qui ne s'active que si l'abonnement est actif — scan renvoie vers une page publique du site vitrine `/verification/:id`, voir `apps/api/src/modules/verification` et `apps/website/src/pages/Verification.tsx`), Paramètres (même écran que côté client)

Verrouillage rapide (biométrie/PIN, `expo-local-authentication`) : activable depuis Paramètres, verrouille l'appli au démarrage et au retour au premier plan. Reste toujours déverrouillé sur web (pas de capteur), c'est le comportement attendu — à tester en vrai sur un appareil/émulateur avec empreinte enregistrée.

Barre d'onglets flottante personnalisée (`src/components/FloatingTabBar.tsx`) sur les deux rôles : fond noir arrondi, icônes seules (pas de libellé), petit indicateur blanc qui glisse au-dessus de l'onglet actif (`Animated` natif de React Native, pas de dépendance supplémentaire). Remplace la barre par défaut d'Expo Router via la prop `tabBar` du composant `Tabs` (React Navigation en dessous). L'écran Paramètres reste volontairement absent de la barre (atteint depuis le bouton réglages du Profil).

Pas encore construit : widget de carte visuelle (pin sur carte, position affichée sur un plan) — `react-native-maps` n'a pas d'équivalent web fiable, donc pas testable dans cet environnement de dev ; nécessite aussi de choisir un fournisseur (voir `docs/deploiement.md`). Le suivi temps réel *fonctionne* déjà, juste sans widget de carte pour l'instant (affichage texte de la distance). Passe design entamée sur le parcours d'entrée (Bienvenue/Choisir un rôle/Connexion/Inscription) et la barre d'onglets flottante — voir `docs/decisions.md`. Le reste des écrans (recherche, demandes, profil, paramètres...) garde encore le style minimal d'origine, à reprendre dans les prochaines passes.

## Notes techniques

- **`expo-secure-store` ne fonctionne pas sur web** (API native Keychain/Keystore) — `src/lib/storage.ts` bascule sur `localStorage` uniquement pour la préview web de développement ; l'app cible réellement Android/iOS.
- **Metro plante avec `spawn EPERM`** dans cet environnement de dev sandboxé, qui refuse le spawn de processus enfants. `metro.config.js` force `maxWorkers = 1`.
- **`react` et `react-dom` doivent être strictement à la même version** pour le support web (`react-native-web`) — les deux sont épinglés à `19.1.0` dans `package.json`, ne pas les laisser dériver indépendamment.
- Si `expo start` plante immédiatement avec `TypeError: Body is unusable`, c'est un bug du "doctor" de la CLI Expo qui vérifie les versions en ligne — relancer avec `EXPO_OFFLINE=1` contourne le problème.
- **`<Modal animationType="fade">` de `react-native` ne se ferme jamais sur cet environnement de preview web** — confirmé en testant `ProSidebar` (tiroir de navigation pro) : `visible={false}` ne démonte pas le contenu tant que la transition CSS de fondu n'a pas fini, et cette transition ne se termine jamais ici car le panneau du navigateur ne compose pas d'images tant qu'il n'est pas affiché à l'écran (même cause que l'échec de `computer{action:"screenshot"}`). `animationType="none"` contourne le problème (le composant a de toute façon sa propre animation de glissement via `Animated`, redondante avec le fondu du `Modal`). Probablement sans impact réel sur appareil/simulateur natif (le compositeur y tourne toujours), mais à garder en tête pour tout futur `Modal` animé testé en preview web.
- **`Alert.alert` de `react-native` est un no-op silencieux sur web** (`react-native-web` ne l'implémente pas — confirmé dans son code source). Tout écran qui a besoin d'une confirmation testable en preview web (ex. désactivation de compte dans Paramètres) doit prévoir un repli `window.confirm` sur `Platform.OS === "web"`, le natif utilisant `Alert.alert` normalement.
