# LPCV Admin

Back-office web, application indépendante du site vitrine et de l'app mobile (Volume 2/4 du LPD). React + Vite + Tailwind, même identité visuelle que le site vitrine.

## Démarrage local

```bash
# L'API doit tourner (voir apps/api/README.md), avec un admin de test seedé
cp .env.example .env
pnpm dev
```

Tourne sur `http://localhost:5174`. Connexion avec le compte admin créé par `pnpm prisma:seed` côté API (`admin@lpcv.local` / `changeme123` — à changer).

## État des écrans

Complets et testés : connexion, tableau de bord (statistiques), vérifications (liste des professionnels en attente + décision approuver/refuser).

Pas encore construits (l'écran existe, affiche juste "pas encore construit") : modération des avis signalés, gestion des utilisateurs, paramètres de la plateforme (zones, métiers, taux de commission).

## Icônes

`lucide-react`, comme le site vitrine, pour rester cohérent et ne dépendre d'aucun compte externe. Flaticon a été évoqué comme piste pour des icônes plus spécifiques (métiers, illustrations) — à piocher ponctuellement au cas par cas, en vérifiant la licence (attribution requise sur l'offre gratuite).
