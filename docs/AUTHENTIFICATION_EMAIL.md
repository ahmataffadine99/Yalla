# Inscription et confirmation par e-mail

L'inscription demande une adresse e-mail, un numéro au format international (E.164, par exemple `+33612345678`) et un mot de passe d'au moins 12 caractères. Le numéro est enregistré, mais n'est pas vérifié par SMS. Le client doit confirmer son adresse e-mail avant de pouvoir se connecter.

Le modèle TypeORM `UserEntity` est défini dans `apps/api/src/modules/users/user.entity.ts`. La migration `apps/api/src/modules/database/migrations/1710000000000-CreateUsers.ts` crée la table PostgreSQL `users` ; les migrations sont explicites et `synchronize` est désactivé. `UsersModule` enregistre le modèle auprès de TypeORM et l'exporte pour `AuthModule`. Les routes HTTP sont bien définies dans `AuthController` (`apps/api/src/modules/auth/auth.controller.ts`), et `AuthService` porte la logique d'inscription, de confirmation et de connexion.

L'API expose :

- `POST /api/v1/auth/register` pour créer un compte en attente et envoyer un lien ;
- `POST /api/v1/auth/email/verification/check` pour confirmer le lien ;
- `POST /api/v1/auth/email/verification/resend` pour renvoyer un lien ;
- `POST /api/v1/auth/login` pour se connecter après confirmation ;
- `GET /api/v1/auth/me` pour consulter le compte avec un jeton `Bearer`.

Les mots de passe sont hachés côté serveur avec scrypt. Les liens contiennent un jeton aléatoire à usage unique, dont seul le hash et l'expiration (24 heures) sont enregistrés. La confirmation est consommée par l'application après ouverture du lien pour éviter que les robots d'analyse d'e-mails activent automatiquement les comptes.

## Configuration e-mail locale

L'API utilise un serveur SMTP générique ; aucun fournisseur n'est imposé. Récupérer les paramètres SMTP auprès du service e-mail choisi et les ajouter uniquement au fichier `.env` local à la racine du dépôt (à côté de `compose.yaml`) :

```dotenv
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
AUTH_TOKEN_SECRET=
```

`SMTP_USER` et `SMTP_PASSWORD` doivent être tous deux renseignés ou tous deux laissés vides. `SMTP_FROM` est l'adresse expéditrice autorisée par le fournisseur. `AUTH_TOKEN_SECRET` doit être remplacé par une valeur aléatoire d'au moins 32 caractères avant tout déploiement ; la valeur d'exemple est réservée au développement local.

### Exemple avec Gmail

Pour un test personnel, un compte Gmail peut envoyer les messages par SMTP avec un mot de passe d'application. Active d'abord la validation en deux étapes du compte Google, puis crée un mot de passe d'application sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords). Google peut ne pas proposer cette option pour certains types de comptes ou réglages de sécurité ; consulte son [guide officiel](https://support.google.com/accounts/answer/185833) si elle n'apparaît pas.

Remplace `ton-adresse@gmail.com` par ton adresse, et utilise le mot de passe d'application généré (pas le mot de passe normal du compte) :

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ton-adresse@gmail.com
SMTP_PASSWORD=mot-de-passe-application
SMTP_FROM=ton-adresse@gmail.com
```

Garde ce mot de passe dans le fichier `.env` local et ne le partage pas. Si tu utilises un autre fournisseur, demande-lui son adresse SMTP, son port et ses identifiants : les valeurs Gmail ci-dessus ne s'appliquent pas aux autres services.

Redémarrer ensuite l'API :

```powershell
docker compose up -d api
```

Créer les tables d'inscription une seule fois sur la base configurée :

```powershell
npm run migration:run --workspace=@yalla/api
```

## Tester l'inscription

Ouvrir `http://localhost:3002/inscription`, saisir un numéro en format international, l'adresse e-mail et un mot de passe, puis ouvrir le lien reçu. Pour vérifier l'adresse manuellement via l'API, le flux est également décrit dans Swagger à `http://localhost:3000/api/docs`.

Sans configuration SMTP, l'API renvoie une erreur explicite et ne prétend pas avoir envoyé l'e-mail. Une inscription en attente peut recevoir un nouveau lien via le formulaire ou l'endpoint de renvoi.

Les endpoints publics d'inscription, connexion, renvoi de lien et confirmation ont une limite de requêtes par adresse IP en mémoire. Cette protection est adaptée aux essais locaux ; en production, utiliser un stockage partagé de limitation de débit derrière le proxy de confiance avant de rendre l'inscription publique.

Cette première version n'inclut pas encore la réinitialisation de mot de passe, la vérification du numéro, les connexions Google/Apple ni les réservations.
