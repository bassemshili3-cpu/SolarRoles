# Stripe vers Netlify — audit du 8 octobre 2026

La migration conserve le compte Stripe, ses produits, ses clients et ses abonnements. Les appels Stripe avec la clé live locale réussissent hors de Vercel. Les routes Next.js utilisent le runtime Node.js et ne dépendent pas d'une API Vercel. La première partie décrit l'audit initial ; l'état de la bascule autorisée figure ci-dessous. Aucun paiement ni abonnement n'a été modifié.

## Bascule autorisée le 8 octobre

Les six variables de production sont enregistrées et relues avec succès dans Netlify : les cinq du tableau ci-dessous et `STRIPE_PORTAL_CONFIGURATION_ID`. Le forfait refuse les scopes sélectifs (HTTP 403, demande d'upgrade) : les variables utilisent les quatre scopes disponibles, uniquement pour le contexte production. `NEXT_PUBLIC_APP_URL` vaut désormais `https://solarroles.com`.

Le nouveau webhook `we_1UOIPsP27jstHA3Q8LCXfAAF` vise le domaine canonique, conserve `2026-08-26.dahlia` et comprend les neuf événements décrits ci-dessous. Son secret obtenu à la création est transféré à Netlify sans journalisation. Il reste désactivé jusqu'à validation du déploiement. L'ancien webhook reste inchangé à ce stade.

Le portail `bpc_1UOIPtP27jstHA3Qww4F1mGk` est actif : historique des factures, modification du moyen de paiement et annulation à la fin de la période, sans prorata. Le changement de plan est désactivé. La route portail utilise explicitement `STRIPE_PORTAL_CONFIGURATION_ID` pour ne pas dépendre d'une configuration par défaut.

La publication regroupe les changements des 7 et 8 octobre encore absents de `main`, avec leurs dépendances source. Les corpus et exports de `data/` et `public/data/`, les secrets et les fichiers temporaires sont exclus. Le manifeste local est `.temp/release-20261008-staged-paths.json`. Les scripts de collecte sont publiés comme code ; aucune flotte de collecte n'est relancée par cette opération.

## État observé

Le site Netlify nommé `solarroles-test` sert désormais **https://solarroles.com**. Son identifiant est `eba61e13-1230-4e24-9888-cfbb9c524ea0`. Le déploiement publié est `ready`, issu de `main`, commit `adc11711bf44483bbf88efd228c3f79433054ce1`, publié le 7 octobre 2026. Le domaine répond HTTP 200 avec les en-têtes Netlify.

| Contrôle | Résultat |
| --- | --- |
| Variables Stripe Netlify | Aucun des noms attendus par le code n'est présent dans les variables retournées pour ce site. |
| URL de l'application | `NEXT_PUBLIC_APP_URL` vaut `http://localhost:3000` en production. Elle sert aux retours Checkout, au portail et à certains parcours d'authentification. |
| Webhook sur le domaine canonique | POST sans signature sur `https://solarroles.com/api/stripe/webhook` : HTTP 500, `Webhook is not configured`. |
| Destination Stripe actuelle | `https://www.solarroles.com/api/stripe/webhook` : HTTP 308 vers le domaine sans `www`. Stripe considère les réponses 3xx comme des échecs de livraison. |
| Base Netlify | `DATABASE_URL` correspond à la configuration locale ; les tables `EmployerSubscription`, `StripeWebhookEvent` et les colonnes de paiement de `Job` existent. Aucune migration de schéma n'est nécessaire pour ces éléments. |
| Portail client live | L'API retourne zéro configuration de portail. La route du site demande la configuration par défaut : le parcours « Manage billing » reste donc à configurer. Aucune session de portail n'a été créée pour cet audit. |

La base contient une ligne `EmployerSubscription` et aucun événement enregistré dans `StripeWebhookEvent`. Ces décomptes ne prouvent ni la validité de l'abonnement Stripe correspondant ni l'absence de paiements passés ; aucun rapprochement individuel n'a été effectué.

## Variables à appliquer

Limiter les valeurs live au contexte **production** du site. Les variables serveur doivent être accessibles aux **Functions** ; les rendre aussi disponibles aux **builds** pour les usages Next.js. Préserver les autres contextes et les autres variables. Les changements exigent un nouveau déploiement.

| Nom Netlify | Valeur ou source |
| --- | --- |
| `STRIPE_SECRET_KEY` | Clé live actuellement disponible localement sous `solarroles_STRIPE_SECRET_KEY`. Le nom standard est déjà accepté par `lib/stripe.ts`. |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook live identifié ci-dessous. Une valeur locale existe, mais l'API de lecture Stripe ne permet pas de confirmer qu'elle correspond à ce webhook existant. Vérifier cette association dans Stripe Workbench avant transfert. |
| `STRIPE_PRICE_FEATURED` | `price_1UGlC1P27jstHA3Q6HRCCsvg` : actif, live, 39 USD, paiement unique. |
| `STRIPE_PRICE_PARTNER` | `price_1UGlE5P27jstHA3QEs7L9Sg1` : actif, live, 99 USD/mois. |
| `NEXT_PUBLIC_APP_URL` | `https://solarroles.com`, en remplacement de `http://localhost:3000`. Préserver les scopes existants de cette variable. |

Le site utilise Checkout hébergé par Stripe. Le code inspecté ne consomme pas la clé publique `NEXT_PUBLIC_solarroles_STRIPE_PUBLISHABLE_KEY`. Ni cette clé, ni la clé MCP en mode test, ni le jeton Vercel OIDC ne sont nécessaires à ces routes. Ne pas importer l'ensemble du fichier `.env.local` dans Netlify.

## Destination et événements Stripe

Modifier le webhook existant **`we_1UGlKYP27jstHA3QiAfrqAPK`** pour viser directement **`https://solarroles.com/api/stripe/webhook`**. Il est actuellement activé en mode live, avec la version API `2026-08-26.dahlia`. Conserver sa version et le format d'événement existant : le code traite `event.data.object`.

Le webhook est abonné à six événements : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated` et `charge.refunded`. Trois événements traités par le code ne sont pas abonnés :

- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.created`

Ajouter ces trois événements en conservant les six abonnements actuels. `charge.refunded` n'a pas de traitement métier dédié dans la route actuelle ; la gestion des remboursements dépasse cette migration de configuration.

Le webhook vérifie déjà la signature sur le corps brut de la requête et utilise `StripeWebhookEvent` pour l'idempotence. Les fichiers locaux `lib/stripe.ts`, la route webhook, la route portail et `netlify.toml` sont identiques à ceux du commit publié. La route Checkout comporte des modifications locales préexistantes : elles ne doivent pas être embarquées involontairement dans un redéploiement de configuration.

## Ordre de bascule et validation

1. Confirmer le secret du webhook live dans Workbench, puis appliquer les cinq variables de production ci-dessus.
2. Redéployer le code publié depuis Netlify, sans déployer le checkout local qui contient de nombreuses modifications indépendantes.
3. Vérifier que le webhook canonique rejette une requête sans signature par HTTP 400, plutôt que HTTP 500. Ce contrôle ne prouve pas encore l'acceptation d'une signature valide.
4. Corriger la destination du webhook existant et ajouter les trois abonnements manquants. Examiner les livraisons échouées dans Workbench avant de rejouer des événements : ce rejeu peut modifier la facturation et publier des annonces.
5. Vérifier une livraison Stripe signée et son traitement idempotent. Le secret local ne sera considéré comme confirmé qu'après cette vérification ou une comparaison avec Workbench.
6. Configurer le portail client Stripe pour les fonctions réellement proposées aux employeurs. Les options d'annulation et de changement d'abonnement constituent des choix produit à définir avant activation.

Un test Checkout complet doit utiliser un environnement séparé, avec des clés, tarifs et secrets **test**. Aucun achat live, aucune création de session et aucun événement métier signé n'ont été exécutés pendant cet audit. Ne pas retirer l'intégration Vercel avant d'avoir validé la bascule et l'origine des clés utilisées.

## Preuves et références

Les scripts et résultats sans secrets sont dans `.temp/stripe-netlify-audit/` : `report.json`, `portal.json`, `check-db.cjs` et `check-portal.cjs`. L'audit principal reproductible est `.temp/stripe-netlify-audit.cjs`. Les contrôles de base consultent seulement le schéma et des décomptes.

- [Netlify : variables d'environnement des Functions](https://docs.netlify.com/build/functions/environment-variables/) — les variables de `netlify.toml` ne sont pas disponibles dans les Functions.
- [Netlify : prise en charge de Next.js](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) — routes API et runtime serveur.
- [Netlify : API et variables](https://docs.netlify.com/api-and-cli-guides/api-guides/get-started-with-api/) — contextes, scopes et nécessité d'un nouveau déploiement.
- [Stripe : webhooks](https://docs.stripe.com/webhooks) — signature, corps brut et échec des redirections HTTP.
- [Stripe : sessions du portail](https://docs.stripe.com/api/customer_portal/sessions/create) — configuration par défaut en l'absence d'identifiant explicite.
