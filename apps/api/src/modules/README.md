# Modules métier de l'API

Les modules listés dans `AppModule` définissent les frontières prévues du monolithe modulaire. Leur présence ne signifie pas que leurs fonctionnalités sont déjà implémentées.

Lorsqu'un module est développé, il peut contenir les couches nécessaires à son besoin :

```text
<module>/
  application/       # cas d'utilisation et orchestration
  domain/            # règles métier indépendantes des fournisseurs
  infrastructure/    # persistance et adaptateurs externes
  presentation/http/ # contrôleurs, DTO et validation HTTP
```

Ne créer une couche que lorsqu'elle sert une fonctionnalité réelle. Un module expose ses cas d'utilisation aux autres modules ; il ne partage pas directement ses repositories ou ses entités de persistance.

Les modules `database` et `health` sont des éléments techniques transversaux, pas des domaines métier. Les migrations TypeORM sont conservées dans `database/migrations`.
