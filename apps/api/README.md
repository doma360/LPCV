# LPCV API

Backend commun aux trois surfaces (app mobile, site vitrine, back-office), conforme au Volume 4 et Volume 8 du LPD.

## Démarrage local

```bash
# 1. Depuis la racine du monorepo : lance Postgres
docker compose up -d postgres

# 2. Depuis apps/api : configure l'environnement
cp .env.example .env

# 3. Applique le schéma et charge les données de base (métiers, zones, admin de test)
pnpm prisma:migrate
pnpm prisma:seed

# 4. Lance l'API en watch mode
pnpm dev
```

L'API écoute sur `http://localhost:4000`. `GET /health` ne touche pas la base et permet de vérifier que le serveur tourne.

> Postgres tourne sur le port **5433** en local (`postgresql://lpcv:lpcv@localhost:5433/lpcv_dev`), pas 5432 : si une installation PostgreSQL native tourne déjà sur ta machine (service Windows, autre projet...), elle occupe 5432 et intercepte silencieusement les connexions destinées au conteneur — aucune erreur claire, juste des échecs d'authentification qui n'ont rien à voir avec les identifiants. Vérifie avec `Get-NetTCPConnection -LocalPort 5432` côté Windows si tu changes ce port.

## Prisma 7 et l'adaptateur `pg`

Le client Prisma (v7) n'ouvre plus de connexion lui-même : il faut lui passer un *driver adapter*. On utilise `@prisma/adapter-pg` partout où `PrismaClient` est instancié (`src/lib/prisma.ts`, `prisma/seed.ts`) — `prisma migrate`/`prisma generate` restent pilotés par `prisma.config.ts` à la racine d'`apps/api`, qui porte l'URL de connexion pour ces commandes CLI uniquement.

## Structure

```
prisma/schema.prisma   Modèle de données (Volume 9)
src/modules/*          Un dossier par domaine : routes -> controller -> service (Volume 7 §3)
src/middleware/        Auth JWT, RBAC, validation zod, gestion d'erreurs centralisée
src/lib/                Prisma client, JWT
```

## État des modules

Complets : `auth` (inscription, connexion, rafraîchissement de jeton, mot de passe oublié/réinitialisation par code), `users` (profil, changement de mot de passe, désactivation de compte), `vitrine` (métiers + blog), `devices` (tokens push), `professionnels` (recherche géolocalisée, matching avec rayon progressif + estimation de prix, disponibilités CRUD, revenus, portfolio de réalisations), `demandes` (création + machine à états + appel masqué + position temps réel pendant "en route"), `avis` (publication après intervention terminée + note moyenne recalculée + signalement), `paiements` (mobile money via provider mocké, espèces avec confirmation par le professionnel, commission calculée et prélevée automatiquement), `admin` (stats, liste des professionnels en attente, décision de vérification avec journal d'action), `uploads` (photos, provider local en dev).

`messages` a été retiré du plan (remplacé par l'appel, voir `docs/decisions.md`) — la route reste en `501` en attendant d'être supprimée ou réaffectée. Modération des avis signalés et gestion des utilisateurs pas encore exposées côté admin (l'écran existe dans `apps/admin` mais reste en attente).

Quatre modules tournent avec un provider mocké/local par défaut, aucun compte externe requis pour développer/tester : l'appel (`TELEPHONIE_PROVIDER=mock`), le paiement (`PAIEMENT_PROVIDER=mock`), le stockage de fichiers (`STORAGE_PROVIDER=local`, écrit dans `apps/api/uploads/`, gitignoré) et l'envoi de code de réinitialisation de mot de passe (`NOTIFICATION_PROVIDER=mock`, code affiché dans les logs du serveur). Voir `docs/deploiement.md` pour la liste complète de ce qui nécessite un vrai compte/paiement avant la mise en production.
