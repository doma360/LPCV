# Ce qui reste à payer/configurer avant le déploiement réel

Liste de tout ce qui, dans LPCV, dépend d'un service externe avec compte et
souvent facturation. Tant que ce n'est pas coché, le projet tourne avec une
version gratuite, un mock, ou une valeur par défaut — rien ne bloque le
développement ni les tests locaux. À reprendre un par un au moment du
déploiement.

## Téléphonie (appel masqué client ↔ professionnel)

- **Statut actuel** : `MockTelephonieProvider` (aucun compte, aucun appel réel, juste un log).
- **À faire** : choisir Twilio, Africa's Talking ou un agrégateur local, vérifier la couverture réelle Orange CI / MTN CI / Moov CI, créer le compte, brancher les clés dans `TELEPHONIE_PROVIDER` + les clés du provider (`apps/api/.env`).
- **Code concerné** : `apps/api/src/lib/telephonie/` — un seul endroit à modifier (ajouter un fichier `twilio.ts` qui implémente `TelephonieProvider`).

## SMS (OTP à l'inscription, réinitialisation de mot de passe)

- **Statut actuel** : non implémenté (Volume 5 §2 le liste comme "recommandé", pas bloquant pour le MVP).
- **À faire** : souvent le même prestataire que la téléphonie (Africa's Talking et Twilio font aussi du SMS) — un seul compte peut couvrir les deux.

## Paiement mobile money (Wave, Orange Money, MTN Money, Moov Money)

- **Statut actuel** : module `paiements` en stub, rien de branché.
- **À faire** : ouvrir un compte chez un agrégateur (CinetPay ou PayDunya, cités au Volume 4 §3), contrat marchand, clés API de production après validation KYC. **Le plus gros morceau, à traiter en dernier avec soin — argent réel, cf. `decisions.md`.**

## Stockage de fichiers (photos de profil, documents de vérification, photos de demande)

- **Statut actuel** : les champs existent en base (`photoUrl`, `documentsUrls`, `photosUrls`) mais rien n'est encore uploadé nulle part — le cahier interdit tout média codé en dur (Volume 4 §10).
- **À faire** : compte stockage objet compatible S3 (AWS S3, Cloudflare R2, OVH Object Storage...). Cloudflare R2 a un tier gratuit généreux (pas de frais de sortie), bon candidat pour démarrer.

## Notifications push

- **Statut actuel** : le module `devices` enregistre déjà les tokens, mais rien n'envoie encore de notification.
- **À faire** : projet Firebase (Cloud Messaging) ou Expo Push Notifications. Gratuit dans les grandes largeurs pour notre volume, mais un compte/projet est requis.

## Cartes, géolocalisation, suivi temps réel

- **Statut actuel** : recherche de proximité en Haversine (aucune dépendance externe). Rien côté carte/app mobile.
- **À faire** : compte Google Maps Platform ou Mapbox pour l'affichage carte + le suivi temps réel du professionnel dans l'app. Free tier mensuel chez les deux, à surveiller si le volume grossit.

## Connexion via Google (option secondaire, Volume 5 §2)

- **Statut actuel** : non implémenté.
- **À faire** : projet Google Cloud + identifiants OAuth. Gratuit pour ce type d'usage, mais compte à créer et à configurer (écran de consentement, domaines autorisés).

## Rapport de plantage mobile (Volume 4 §14)

- **Statut actuel** : non implémenté (l'app mobile n'existe pas encore).
- **À faire** : Sentry ou Firebase Crashlytics. Tier gratuit correct pour démarrer, payant au-delà d'un certain volume d'événements.

## Infrastructure (hébergement, pas des clés API mais des dépenses récurrentes)

- **Base de données Postgres en production** : décision non tranchée (Neon/Supabase/managé vs VPS). Voir `decisions.md`.
- **Hébergement du backend Node** : idem, non tranché.
- **Nom de domaine** (`.ci` ou `.com`) + HTTPS (Cloudflare gratuit couvre le SSL/CDN dans la plupart des cas).

## Publication sur les stores

- **Google Play Console** : frais unique ~25 $.
- **Apple Developer Program** : ~99 $/an, obligatoire pour publier sur l'App Store et pour TestFlight.
- **Expo EAS Build** : tier gratuit limité en nombre de builds/mois, payant au-delà.

---

Rien dans cette liste n'empêche d'avancer maintenant : chaque point a un
équivalent gratuit/mock/stub en place pour le développement local. C'est la
checklist à reprendre juste avant la mise en production.
