# Conventions de code Yalla

Ces conventions s'appliquent à toutes les applications et à l'API. Elles complètent les décisions d'architecture ; elles ne signifient pas que toutes les fonctions sont déjà implémentées.

## Réutiliser au bon niveau

- Un composant réutilisable est un élément d'interface autonome, avec une responsabilité claire, qui peut être assemblé dans plusieurs pages : bouton, champ de formulaire, carte de course, état vide, en-tête ou indicateur de statut.
- Dans `client-web` et `admin-web`, commencer par un composant local à l'application. Le partager seulement quand les deux interfaces ont réellement le même comportement et le même rendu.
- Quand plusieurs applications web ont un besoin réellement commun, placer le composant dans un paquet partagé de `packages/` plutôt que d'importer le code privé d'une application dans l'autre.
- Pour Flutter, appliquer le même principe avec des widgets et composants Dart réutilisables ; ne pas essayer de partager directement du code d'interface React.
- Dans l'API, les éléments réutilisables sont plutôt des services applicatifs, des règles métier, des validateurs ou des adaptateurs. Les contrôleurs HTTP restent minces et les règles ne sont pas recopiées dans les clients.
- Éviter les composants « universels » avec de nombreuses options ou des abstractions créées avant d'avoir un deuxième usage réel.

## Organisation suggérée

```text
apps/
  client-web/
    src/components/       # composants propres au site client
    src/features/         # écrans et parcours client
  admin-web/
    src/components/       # composants propres à l'administration
    src/features/         # écrans d'exploitation
  api/
    src/modules/<domaine>/ # cas d'usage et règles par domaine
  mobile/
    lib/widgets/          # widgets réutilisables Flutter, à créer avec l'application
packages/
  ui-web/                 # composants effectivement partagés par les deux sites
```

Ne créer `packages/ui-web` qu'au premier composant web dont le partage entre client et admin est justifié. Les composants locaux restent dans leur application jusqu'à ce moment.

## Lisibilité et commentaires

- Choisir des noms qui décrivent le rôle d'un composant, d'un service et d'une fonction.
- Commenter les décisions non évidentes, contraintes métier, intégrations et cas limites ; ne pas paraphraser le code ligne par ligne.
- Garder les commentaires courts. Déplacer les explications d'architecture durables dans cette documentation plutôt que dans de longs commentaires inline.
- Ne jamais commenter une interface comme fonctionnelle si elle n'est qu'une maquette ou un socle.
