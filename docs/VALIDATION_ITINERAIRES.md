# Validation des trajets et des tarifs à N'Djamena

**État : recherche préliminaire, aucun fournisseur sélectionné, aucun tarif activé.**

L'API contient maintenant une première intégration de routage compatible avec le protocole OSRM. Un profil Docker Compose et un script PowerShell permettent de préparer localement l'extrait OpenStreetMap du Tchad avec OSRM. Aucun service public n'est utilisé par défaut. Cette étape technique ne valide pas encore la précision des routes à N'Djamena.

## Ce qu'il faut calculer

Pour un devis, le téléphone fournit ou laisse choisir les coordonnées GPS du départ et de l'arrivée. Le serveur demande ensuite un itinéraire routier en mode voiture. Le moteur renvoie notamment la distance routière, la durée estimée et la géométrie du parcours. Le serveur calcule alors le tarif ; le navigateur ou le téléphone ne décide jamais du prix.

La règle de calcul initiale retenue est :

`prix estimé = max(1 000 FCFA, prise en charge + distance routière × tarif/km + durée × tarif/minute + suppléments)`

Le minimum de 1 000 FCFA est confirmé comme règle de départ et pourra être modifié. Les montants de prise en charge, au kilomètre et à la minute, ainsi que les suppléments applicables, restent à fixer avec des données locales. Ils ne doivent pas être inventés ni activés avant validation.

L'estimation doit être datée et temporaire. Le serveur conserve les points choisis, la distance calculée, le fournisseur/version de carte, la règle tarifaire utilisée et l'expiration du devis. Une fois la demande confirmée, le prix doit suivre une règle explicite. Pour le pilote, la recommandation est de verrouiller le prix accepté pour le trajet confirmé ; tout changement important de destination ou demande de détour doit déclencher une nouvelle confirmation du prix.

## Géolocalisation, recherche et itinéraire sont des besoins distincts

- **Position GPS** : latitude/longitude du téléphone ; le GPS ne fournit pas à lui seul un nom de rue fiable.
- **Choix des points** : l'utilisateur place un repère sur la carte, choisit un lieu connu ou ajoute une consigne de rendez-vous. Ne pas exiger une adresse postale précise partout.
- **Carte** : affiche les routes et les repères ; elle ne garantit pas que les routes soient correctement calculables.
- **Géocodage/recherche** : transforme une adresse ou un nom de lieu en coordonnées. Vérifier les quartiers et lieux connus localement ; une couverture d'itinéraire ne prouve pas une bonne recherche d'adresse.
- **Routage voiture** : accroche les points aux routes et calcule un chemin praticable. Il doit tenir compte du sens de circulation et des accès lorsqu'ils sont connus.
- **Tarification** : transforme la distance fournie par le routage en estimation XAF selon une règle configurée et versionnée.

Pour les lieux difficiles à trouver, garder le placement manuel du point et la consigne textuelle comme solutions de repli. La position précise du client ne doit être partagée qu'avec les acteurs autorisés, au moment nécessaire à la course.

## Résultats de recherche au 20 octobre 2026

### HERE

La documentation HERE liste le Tchad comme pays à couverture intermédiaire **I1**. HERE décrit I1 comme du « urban routing or point-to-point routing ». C'est un motif de tester HERE à N'Djamena, pas une garantie que chaque route, piste, sens de circulation, nom de rue ou point de rendez-vous soit complet ou correct. La documentation précise que la couverture intermédiaire peut varier et peut reposer sur des sources tierces.

**Décision : candidat à une comparaison terrain, pas encore choisi.** Obtenir une clé d'essai, vérifier les coûts/conditions actuels et tester le produit exact (itinéraire voiture, géocodage, carte) avant de l'intégrer.

Pour le pilote, HERE est le premier candidat à qualifier : c'est le fournisseur consulté qui nomme explicitement le Tchad et documente un niveau de routage urbain/point à point. Son prix commercial n'est pas déterminable à partir de la page publique consultée ; il faut demander un devis ou vérifier les conditions de l'offre de démarrage avant tout engagement.

### OpenStreetMap et OSRM

OpenStreetMap fournit des données cartographiques ouvertes, sous ODbL et avec obligations d'attribution. Les serveurs publics de tuiles et de géocodage sont des services communautaires à capacité limitée, sans garantie d'exploitation commerciale à l'échelle d'une plateforme. Leur politique demande attribution visible, cache et respect des limites ; le service public Nominatim ne doit pas être utilisé pour l'auto-complétion d'adresse et limite les requêtes.

Une requête isolée au démonstrateur public OSRM a accepté deux coordonnées de test proches du centre de N'Djamena et renvoyé un itinéraire voiture de **4,69 km** et **343 secondes**. Les coordonnées ont été ajustées de 20,7 m et 3,7 m vers des points du réseau routier. Il s'agit seulement d'une vérification que ce démonstrateur sait calculer un chemin à ces deux endroits. Les points n'ont pas été vérifiés sur le terrain ; cette réponse ne valide ni la route réellement empruntée, ni la couverture de la ville, ni une dépendance de production.

**Décision : données OSM + moteur auto-hébergé ou fournisseur fondé sur OSM restent des options à examiner.** Le démonstrateur public OSRM ne doit pas être l'infrastructure de production.

Auto-héberger OSRM évite une facturation par requête à un service de routage tiers, mais ne rend pas l'exploitation gratuite : il faut héberger et surveiller le moteur, importer et actualiser les données, et tester la qualité du réseau routier. Les données OpenStreetMap restent soumises à l'ODbL et aux obligations d'attribution.

### Google Maps Platform

Google publie une page officielle de couverture Routes API organisée par pays ; les éléments consultés ne permettent pas de confirmer une couverture voiture suffisamment fiable à N'Djamena. La facturation est à l'usage et dépend des SKU et du volume. Il faut vérifier le SKU réellement déclenché par le parcours Yalla et le coût à l'échelle prévue, plutôt que de se baser sur le crédit d'essai ou les prix d'une autre API Google.

**Décision : ne pas conclure à partir de la seule disponibilité générale de Google Maps.** Tester des trajets locaux avec un accès API de développement et comparer les routes calculées aux trajets réels avant d'en faire un candidat retenu.

### Mapbox

La Directions API documente le calcul d'itinéraires voiture. En revanche, la page tarifaire Mapbox consultée exige une licence commerciale spécifique pour les usages liés aux véhicules, y compris les applications destinées à leur utilisation ; les conditions affichées prévoient un abonnement annuel et peuvent inclure un coût par utilisateur. Le coût exact doit donc être demandé et vérifié pour le cas Yalla. La documentation récupérée ne suffit pas à valider la qualité de couverture à N'Djamena.

**Décision : ne pas retenir Mapbox pour le pilote sans confirmation écrite de la licence commerciale et de son coût, puis sans test terrain.**

### Conclusion provisoire

Pour le premier essai, Yalla utilise OSRM en local avec les données OpenStreetMap du Tchad : aucun compte fournisseur ni frais par requête ne sont nécessaires. Il reste à vérifier la qualité des routes à N'Djamena sur le terrain. HERE pourra être réévalué si ces essais révèlent des problèmes de couverture et si son coût est acceptable. Google et Mapbox restent des candidats non qualifiés ; aucun n'est retenu sur la seule base de sa couverture mondiale ou de son prix affiché.

### Repère de prix public

Numbeo publie des valeurs estimées de tarifs de taxi à N'Djamena (tarif initial et prix au kilomètre), mais les données affichées sont déclaratives, agrégées et signalées comme pouvant différer du prix réel. Ce n'est pas une source assez robuste pour fixer les tarifs Yalla. Les données nationales de prix de carburant ne suffisent pas non plus à calculer le coût réel d'un chauffeur ou le prix acceptable pour les clients.

**Décision : ne pas reprendre directement ces montants.** Les chiffres devront être confrontés à des chauffeurs, clients potentiels, coûts de véhicules et règles commerciales locales, puis validés par le propriétaire du produit.

## Protocole terrain recommandé

### Ce que cette étape veut dire concrètement

Le moteur local sait déjà répondre à une demande de trajet, mais un résultat technique ne prouve pas que le chemin proposé correspond à la réalité de N'Djamena. Il faut choisir quelques trajets courants, demander à un conducteur de les parcourir réellement, puis comparer le chemin et la distance observés à ceux calculés par OSRM. La durée réelle sert de contexte seulement : OSRM n'intègre pas les embouteillages en temps réel.

Pour chaque essai, noter les coordonnées ou lieux publics de départ et d'arrivée, la distance donnée par OSRM, puis le trajet et la distance réellement parcourus par le conducteur. Enregistrer un parcours GPS uniquement avec son accord. Une personne qui n'est pas sur place ne peut pas fournir honnêtement ces mesures terrain ; elles ne doivent pas être remplacées par des valeurs inventées ou une deuxième réponse du même moteur.

Fiche à remplir avec un conducteur à N'Djamena :

| Essai | Départ et arrivée (lieux/coordonnées) | Distance OSRM | Distance réellement parcourue | Le chemin OSRM est-il praticable ? | Écart ou remarque |
|---|---|---:|---:|---|---|
| 1 |  |  |  |  |  |
| 2 |  |  |  |  |  |
| 3 |  |  |  |  |  |
| 4 |  |  |  |  |  |
| 5 |  |  |  |  |  |

Commencer par trois à cinq trajets variés : court, plus long, axe fréquenté et rue secondaire. Si OSRM propose une route impraticable, manque le bon accès ou échoue, le noter même si les distances semblent proches. Ce premier petit échantillon sert à repérer les problèmes ; il ne suffit pas à déclarer toute la ville validée.

Avant d'afficher un prix comme fiable :

1. Préparer avec des chauffeurs locaux un jeu de trajets représentatif : courtes et longues distances, axes connus, lieux de prise en charge fréquents, rues secondaires et zones où les repères sont difficiles.
2. Pour chaque paire de points, demander un itinéraire voiture à chaque fournisseur candidat et enregistrer distance, durée, route affichée, échec éventuel et point d'accrochage (snap).
3. Parcourir réellement les mêmes trajets avec un chauffeur et enregistrer le parcours GPS avec son accord. Noter les routes impraticables, barrières, sens uniques ou détours manquants sans collecter de données personnelles inutiles.
4. Comparer les chemins et distances à l'expérience du chauffeur. Faire examiner les écarts importants et les routes inventées, impossibles ou inaccessibles avant de considérer le fournisseur utilisable.
5. Tester les cas d'échec : point hors réseau, départ sur une route non carrossable, itinéraire absent, réseau coupé et changement de destination.
6. Demander les tarifs locaux de carburant, entretien, frais et revenus visés aux personnes concernées. Fixer ensuite la prise en charge, le prix/km, le minimum, l'arrondi en XAF et les règles de modification/annulation.
7. Faire valider les montants et suppléments avec les chauffeurs et des clients potentiels, puis présenter clairement l'estimation avant confirmation, comme le parcours de réservation de référence Uber/Bolt. Leurs prix et règles d'autres pays ne sont pas transposables automatiquement au Tchad.

Chaque mesure de terrain doit noter la date, le profil du véhicule, la période et le contexte. Les blocages routiers et la qualité du réseau peuvent faire varier un trajet. Ne pas déclarer l'itinéraire fiable sur la seule base d'une carte affichée ou d'un unique appel API.

## Suite technique après validation

1. Choisir un fournisseur d'itinéraire et de carte dont les coûts, les conditions d'utilisation et la couverture ont été vérifiés.
2. Isoler ce fournisseur derrière une interface d'itinéraire dans le module de localisation ; ne pas diffuser son SDK, ses clés serveur ou sa logique dans toute l'application.
3. Écrire des tests avec des réponses contrôlées : chemin valide, échec de calcul, coordonnées ajustées excessivement, route trop longue, délai dépassé et tarif arrondi.
4. Faire calculer le devis côté API avec une règle tarifaire versionnée. Le calculateur initial applique déjà le minimum de 1 000 FCFA et prend les autres taux comme paramètres obligatoires ; il ne choisit pas lui-même des tarifs. Refuser explicitement le devis si l'itinéraire est absent ou invalide ; ne pas inventer de distance ou de prix de secours.
5. Exposer le devis au client seulement après tests fonctionnels et validation terrain. Le fournisseur choisi restera remplaçable si les essais réels révèlent une couverture insuffisante.

### Intégration API préparée

L'endpoint `POST /api/v1/locations/route` reçoit les coordonnées GPS du départ et de l'arrivée et retourne la distance routière en mètres/kilomètres ainsi que la durée en secondes/minutes. `ROUTING_BASE_URL` doit désigner la racine d'un serveur compatible avec l'API OSRM ; la variable est vide dans `.env.example`, donc l'endpoint répond explicitement « service indisponible » tant qu'aucun moteur n'est configuré. Pour le profil Docker local, utiliser `http://osrm:5000` dans `.env`. Un délai maximal de cinq secondes est appliqué et les réponses absentes ou invalides ne sont pas remplacées par une distance estimée.

Pour préparer un moteur local avec les données du Tchad : lancer `.\scripts\setup-osrm.ps1` dans PowerShell à la racine du dépôt avec Docker Desktop démarré. Le script télécharge l'extrait Geofabrik et exécute les étapes OSRM extract, partition et customize. Les données téléchargées sont volumineuses, ne sont pas suivies par Git et doivent être actualisées séparément. Après préparation, démarrer les services avec `docker compose --profile routing up --build`. Le profil voiture standard OSRM ne fournit pas de trafic en temps réel. Respecter l'attribution OpenStreetMap et les conditions de l'ODbL pour l'utilisation et la distribution des données.

**Essai local du 20 octobre 2026 :** OSRM a répondu avec un itinéraire pour `(12.1, 15.03)` → `(12.12, 15.05)` : 20 212,9 mètres et 1 305,6 secondes estimées. L'API Yalla a retourné les mêmes valeurs. Ce test prouve que la chaîne technique fonctionne sur ces deux points ; il ne confirme pas que la route proposée soit la meilleure ou la route réellement empruntée.

**Contrôle de plausibilité le 20 octobre 2026 :** une personne connaissant bien N'Djamena a jugé plausibles les distances OSRM suivantes, calculées depuis des repères OpenStreetMap :

| Départ → arrivée | Distance OSRM | Durée OSRM |
|---|---:|---:|
| Aéroport international → Place de la Nation | 7,65 km | 11 min 43 s |
| Aéroport international → Marché Central | 8,82 km | 13 min 01 s |
| Grande Mosquée → Place de la Nation | 1,93 km | 1 min 58 s |
| Stade Idriss Mahamat Ouya → Université Roi Fayçal | 3,99 km | 4 min 43 s |
| Place de la Nation → Marché Central | 1,82 km | 2 min 10 s |

Cet avis est un premier contrôle de cohérence des distances, pas une mesure GPS de trajets parcourus ni une validation des chemins, des points exacts de prise en charge ou des durées en conditions réelles. Les durées OSRM n'incluent pas le trafic.

Exemple de corps JSON :

```json
{
  "originLatitude": 12.1,
  "originLongitude": 15.03,
  "destinationLatitude": 12.12,
  "destinationLongitude": 15.05
}
```

Cette intégration ne calcule pas encore un prix ni ne choisit le moteur cartographique. Avant de l'utiliser pour des clients, il faut configurer un serveur autorisé, vérifier les licences, puis comparer ses résultats aux trajets réels et décider comment traiter les points éloignés des routes.

## Sources

- [HERE — pays à couverture intermédiaire](https://docs.here.com/routing/docs/routing-v8-intermediate-countries)
- [HERE — niveaux de couverture, dont I1](https://docs.here.com/routing/docs/routing-v8-coverage-levels)
- [HERE — couverture du routage voiture](https://docs.here.com/routing/docs/routing-v8-car-routing-coverage)
- [HERE — documentation du routage voiture](https://docs.here.com/routing/docs/routing-v8-car-routing)
- [HERE — demander une offre tarifaire](https://www.here.com/get-started/pricing)
- [Google Maps Platform — couverture Routes API](https://developers.google.com/maps/documentation/routes/coverage)
- [Google Maps Platform — tarifs et facturation](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Mapbox — Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [Mapbox — tarifs et licence pour usage véhicule](https://www.mapbox.com/pricing/)
- [OSRM — API de routage](https://project-osrm.org/docs/v5.24.0/api/)
- [OSRM — dépôt et licence du moteur](https://github.com/Project-OSRM/osrm-backend)
- [Geofabrik — extrait OpenStreetMap du Tchad](https://download.geofabrik.de/africa/chad.html)
- [OpenStreetMap — licence et attribution](https://www.openstreetmap.org/copyright)
- [OpenStreetMap — politique des tuiles](https://operations.osmfoundation.org/policies/tiles/)
- [Nominatim public — politique de géocodage](https://operations.osmfoundation.org/policies/nominatim/)
- [Uber — exemple de prix affiché à l'avance, avec avertissement de variation selon la région](https://www.uber.com/us/en/ride/how-it-works/upfront-pricing/)
- [Numbeo — tarifs taxi déclaratifs à N'Djamena](https://www.numbeo.com/taxi-fare/in/N%27djamena-Chad)
