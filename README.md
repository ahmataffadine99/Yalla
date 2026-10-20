# Yalla

Plateforme de transport à la demande lancée à N'Djamena. Le monorepo sépare le site public client, le tableau d'administration et l'API partagée. L'application mobile Flutter viendra dans une phase ultérieure.

## Architecture actuelle

```text
apps/
  api/          API NestJS, monolithe modulaire, REST sous /api/v1
  client-web/   site public client Next.js (socle visuel, réservation non connectée)
  admin-web/    tableau de bord interne Next.js, séparé du site client
  mobile/       emplacement documenté, Flutter à initialiser plus tard
compose.yaml    PostgreSQL/PostGIS, API, site client et administration web
```

Les modules métier de l'API sont des frontières de code, pas des fonctionnalités terminées. Leur portée et les règles de contribution figurent dans [apps/api/src/modules/README.md](./apps/api/src/modules/README.md). Le cahier des charges et le document d'architecture détaillée restent des fichiers locaux ignorés par Git.

Les règles de réutilisation des composants et de commentaires pour **tout le projet** sont décrites dans [docs/CONVENTIONS_DE_CODE.md](./docs/CONVENTIONS_DE_CODE.md).

L'évaluation préliminaire du routage à N'Djamena et le protocole de validation terrain sont décrits dans [docs/VALIDATION_ITINERAIRES.md](./docs/VALIDATION_ITINERAIRES.md). Aucun fournisseur ni tarif n'y est déclaré validé.

## Démarrage local

1. Copier `.env.example` vers `.env` et ajuster les valeurs uniquement pour l'environnement local.
2. Lancer `docker compose up --build`.
3. Ouvrir le tableau d'administration sur `http://localhost:3001`.
4. Ouvrir le site client sur `http://localhost:3002`.
5. Consulter la documentation OpenAPI sur `http://localhost:3000/api/docs`.
6. Vérifier la santé de l'API et de la base sur `http://localhost:3000/api/v1/health`.

La base PostgreSQL est publiée uniquement sur l'interface locale, par défaut sur le port `18081`.

## Commandes utiles

Depuis la racine :

```text
npm run api:build
npm run api:test
npm run web:build
npm run client-web:build
```

Pour générer une migration depuis la racine :

```text
npm run migration:generate --workspace=@yalla/api -- src/modules/database/migrations/NomDeMigration
npm run migration:run --workspace=@yalla/api
```

Les migrations sont explicites ; la synchronisation automatique du schéma TypeORM reste désactivée.
