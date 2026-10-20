# Tester la vérification par téléphone avec Twilio

Le module d'authentification expose deux endpoints pour vérifier un numéro avec Twilio Verify :

- `POST /api/v1/auth/phone/verification` démarre l'envoi d'un code SMS.
- `POST /api/v1/auth/phone/verification/check` vérifie le code reçu.

Le numéro doit être au format international E.164, par exemple `+33612345678` pour un mobile français. Le code doit contenir six chiffres, conformément au réglage initial du service Verify.

## Configuration locale

1. Créer un compte Twilio et un service Verify SMS. Un compte d'essai ne peut envoyer des codes qu'aux destinataires préalablement vérifiés dans la console Twilio. Enregistrer le numéro français de test comme destinataire vérifié.
2. Dans la console Twilio, récupérer l'Account SID, l'Auth Token et le Service SID du service Verify.
3. Inscrire ces valeurs uniquement dans le fichier `.env` local, sans les envoyer dans le chat ni les ajouter à Git :

```dotenv
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
```

4. Redémarrer l'API :

```powershell
docker compose up -d --build api
```

## Essai du parcours

Ouvrir `http://localhost:3000/api/docs`, appeler `POST /api/v1/auth/phone/verification` avec le numéro E.164, puis saisir le code reçu dans `POST /api/v1/auth/phone/verification/check` :

```json
{
  "phoneNumber": "+33612345678"
}
```

```json
{
  "phoneNumber": "+33612345678",
  "code": "123456"
}
```

La vérification d'un numéro français valide l'intégration de l'API et la livraison vers ce numéro, mais ne prouve pas la livraison au Tchad. Avant d'annoncer le service disponible au Tchad, activer la destination `+235` dans les autorisations géographiques Twilio, vérifier les règles et tarifs d'envoi en vigueur, puis faire un essai réel avec un numéro tchadien et son opérateur.

Pour une utilisation publique, configurer aussi des limites de fréquence et la protection anti-fraude dans Twilio Verify et ajouter une limitation côté API. Ne jamais exposer les identifiants Twilio dans le navigateur.

Cette première intégration vérifie le numéro uniquement. Elle ne crée pas encore de compte Yalla, de session de connexion, ni de réservation.

Documentation Twilio : [essayer Verify](https://www.twilio.com/docs/usage/trials/try-out-verify), [disponibilité par pays et autorisations géographiques](https://www.twilio.com/docs/verify/verify-countries-and-regions-deliverability), [tarification Verify](https://www.twilio.com/en-us/verify/pricing).
