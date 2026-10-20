# Yalla

Plateforme de transport à la demande lancée à N'Djamena. Le monorepo sépare le site public client, le tableau d'administration et l'API partagée. L'application mobile Flutter viendra dans une phase ultérieure.

## Architecture actuelle

```text
apps/
  api/          API NestJS, monolithe modulaire, REST sous /api/v1
  client-web/   site public client Next.js (choix des points et aperçu de trajet)
  admin-web/    tableau de bord interne Next.js, séparé du site client
  mobile/       emplacement documenté, Flutter à initialiser plus tard
compose.yaml    PostgreSQL/PostGIS, API, sites web et moteur OSRM local optionnel
```

Les modules métier de l'API sont des frontières de code, pas des fonctionnalités terminées. Leur portée et les règles de contribution figurent dans [apps/api/src/modules/README.md](./apps/api/src/modules/README.md). Le cahier des charges et le document d'architecture détaillée restent des fichiers locaux ignorés par Git.

Les règles de réutilisation des composants et de commentaires pour **tout le projet** sont décrites dans [docs/CONVENTIONS_DE_CODE.md](./docs/CONVENTIONS_DE_CODE.md).

L'évaluation préliminaire du routage à N'Djamena et le protocole de validation terrain sont décrits dans [docs/VALIDATION_ITINERAIRES.md](./docs/VALIDATION_ITINERAIRES.md). Aucun fournisseur ni tarif n'y est déclaré validé.

Le calculateur de prix de l'API applique la formule de départ avec un minimum de 1 000 FCFA. Les taux de prise en charge, au kilomètre et à la minute restent à valider ; aucun devis client ne sera activé avant leur configuration et le choix d'un fournisseur d'itinéraires.

L'API expose `POST /api/v1/locations/route` pour obtenir la distance routière, la durée estimée et la géométrie depuis un serveur compatible OSRM (`ROUTING_BASE_URL`), ainsi que `POST /api/v1/locations/place-name` pour nommer un point via un service de géocodage inversé (`PLACE_NAME_BASE_URL`). Le site client permet de choisir les points sur une carte et d'afficher ce trajet. Les coordonnées choisies sont envoyées au fournisseur de noms de lieux. La réservation et le calcul d'un prix client ne sont pas encore disponibles ; voir [docs/VALIDATION_ITINERAIRES.md](./docs/VALIDATION_ITINERAIRES.md) avant toute utilisation.

## Démarrage local

1. Copier `.env.example` vers `.env` et ajuster les valeurs uniquement pour l'environnement local.
2. Lancer `docker compose up --build`.
3. Ouvrir le tableau d'administration sur `http://localhost:3001`.
4. Ouvrir le site client sur `http://localhost:3002`.
5. Consulter la documentation OpenAPI sur `http://localhost:3000/api/docs`.
6. Vérifier la santé de l'API et de la base sur `http://localhost:3000/api/v1/health`.

La base PostgreSQL est publiée uniquement sur l'interface locale, par défaut sur le port `18081`.

### Essayer le routage OpenStreetMap en local

OSRM est optionnel et n'est pas lancé par le démarrage standard. Pour préparer les données routières du Tchad avec Docker Desktop ouvert, exécuter depuis PowerShell à la racine :

```powershell
.\scripts\setup-osrm.ps1
```

Le script télécharge l'extrait OpenStreetMap de Geofabrik pour le Tchad et le prépare avec OSRM ; le téléchargement et le traitement peuvent prendre du temps et nécessiter plusieurs gigaoctets d'espace et de mémoire. Les fichiers cartographiques restent dans `routing/`, exclu de Git.

Après la préparation, ajouter `ROUTING_BASE_URL=http://osrm:5000` dans le `.env` local, puis lancer :

```powershell
docker compose --profile routing up --build
```

L'API et OSRM communiquent dans Docker. Pour vérifier un trajet, exécuter dans PowerShell :

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/locations/route -ContentType 'application/json' -Body '{"originLatitude":12.1,"originLongitude":15.03,"destinationLatitude":12.12,"destinationLongitude":15.05}'
```

Sans cette configuration et les données générées, aucun itinéraire n'est disponible. Cet essai local ne constitue pas une validation de la qualité des routes ni un déploiement de production. OSRM utilise ici le profil voiture OpenStreetMap standard et ne fournit pas une estimation du trafic en temps réel.

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
