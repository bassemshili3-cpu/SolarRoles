# Synchronisation ATS sur Netlify

`sync-ats` est planifié à la minute 17 de chaque heure (UTC). Les employeurs du
`company-seed` sont répartis dans six créneaux ; chaque employeur est consulté
une fois toutes les six heures. Chaque tâche `sync-ats-background` traite un
seul employeur, avec la limite Netlify de 15 minutes. Adzuna et le custom scrape
ne font pas partie de cette synchronisation.

Les offres connues sont identifiées par `(source, url)`, y compris les offres
inactives. Elles ne sont pas modifiées : aucune remise à zéro de `postedAt`,
de `fetchedAt`, de l'expiration ou du statut d'indexation. Un verrou transactionnel
PostgreSQL protège les nouvelles insertions contre les tâches ATS incrémentales
concurrentes et les reprises Netlify. Le seed manuel traditionnel conserve son
mode de mise à jour ; ne pas le lancer simultanément avec le cron.

Le cron insère uniquement les offres absentes de la base dont le `postedAt`
réel est strictement postérieur à maintenant moins 14 jours et inférieur ou égal
à maintenant. Les dates absentes, estimées ou futures sont exclues de cette
collecte incrémentale. `skippedPublicationWindow` compte ces exclusions dans
le résumé du worker.

Le sitemap inclut les offres actives, non expirées et issues de sources indexables
sur cette même fenêtre de 14 jours, quelle que soit leur méthode d'insertion
(seed manuel ou cron). Les URL d'offres apparaissent en premier, par `postedAt`
décroissant : moins de 7 jours, puis de 7 jours inclus à moins de 14 jours.
Les pages statiques suivent. Une date de collecte ne remplace pas `postedAt`.
La revalidation du sitemap est de 60 secondes ; aucune écriture XML par le cron
n'est nécessaire. Sortir du sitemap ne supprime pas l'offre de la base.

## Activation

Déployer ces changements sur le site Netlify publié. `DATABASE_URL` et
`CRON_SECRET` doivent être disponibles dans le scope Functions. Le site doit
permettre les Background Functions. Les fonctions planifiées ne se déclenchent
pas automatiquement sur les Deploy Previews.

Les connecteurs Workday, Oracle Cloud, Paycom, Paylocity et SaaSHR utilisent
`@sparticuz/chromium` sur Netlify (le worker définit `ATS_SERVERLESS_BROWSER=true`). Le navigateur est inclus
dans les fonctions ; le comportement Playwright local est conservé. Le build
doit conserver les dépendances Playwright. Vérifier le lancement du navigateur
sur un premier déploiement Netlify : le binaire Linux ne se teste pas sur Windows.
La version de Chromium installée requiert Node 22.17 ou ultérieur (ou Node 24).
Configurer un runtime Netlify Node 22 à jour ou Node 24 avant activation.

Vérifier le badge Scheduled de `sync-ats` puis ses logs et ceux de
`sync-ats-background`. Un HTTP 202 prouve le lancement de la tâche ; seul le log
`Done` du worker confirme la fin du traitement. Une erreur ou une interruption
peut produire une collecte partielle. La prochaine rotation retente l'employeur ;
les fetchers qui renvoient un tableau vide lors d'une erreur HTTP gardent leur
comportement actuel et leurs avertissements.

Commande locale équivalente : `npm run seed:ats-new`. Ajouter `-- --dry-run`
pour consulter et classifier sans écrire en base. Ce mode applique la même
fenêtre de 14 jours que le cron et conserve les filtres US et métiers. Le seed
manuel sans `--new-only` conserve sa politique de rétention de deux mois.

## Journal persistant et vérification du cron

Le suivi utilise le store Netlify Blobs `ats-sync-monitor`, partagé entre
déploiements et lu avec une cohérence forte. La documentation Netlify décrit
[ce stockage pour les traitements background](https://docs.netlify.com/build/data-and-storage/netlify-blobs/).
Il n'ajoute aucune table à la base des offres. Les données collectées avant
son activation ne peuvent pas être reconstituées.

Avant tout envoi, le dispatcher enregistre un manifeste avec l'identifiant
du passage, le créneau UTC et les employeurs attendus. Les accusés d'envoi
sont enregistrés séparément. Chaque tentative de worker possède son propre
identifiant : elle enregistre son démarrage, un signal de vie toutes les
60 secondes et son bilan final. Les reprises Netlify restent visibles et
ne peuvent pas écraser le bilan d'une autre tentative.

Le bilan contient les offres renvoyées par le connecteur, les créations,
les offres déjà connues, les dates absentes ou hors fenêtre, les exclusions
géographiques et les échecs. Les avertissements et erreurs émis par les
connecteurs sont capturés dans le contexte du worker, avec au plus 20 extraits
tronqués et expurgés des secrets connus. Une réponse HTTP en erreur suivie
d'un retour `[]` ne peut donc pas être présentée comme une collecte propre
si le connecteur a signalé le problème. Un retour vide sans diagnostic reste
`empty`, à examiner : il ne prouve pas que l'employeur n'a aucune offre.

La commande suivante consulte les huit dernières heures, sans lancer de seed :

```powershell
node --env-file=.env.local scripts/check-ats-sync.mjs
```

Pour une journée complète et tous les détails :

```powershell
node --env-file=.env.local scripts/check-ats-sync.mjs --hours=24 --json
```

`CRON_SECRET` dans `.env.local` doit correspondre à celui des Functions Netlify.
La commande utilise `GET /.netlify/functions/ats-sync-status`, protégé par ce
secret dans l'en-tête Authorization. Elle affiche les totaux, un tableau par
source et les problèmes par employeur ; le rapport complet est enregistré dans
`.temp/ats-sync-status-<date>.json`. Les réponses ne sont ni mises en cache ni
indexables. Les lectures du statut ne déclenchent aucune collecte.

| Statut de tâche | Signification |
| --- | --- |
| `accepted` | Envoi accepté, aucun démarrage enregistré pour le moment |
| `dispatch_unknown` | Manifeste présent, résultat d'envoi non enregistré |
| `dispatch_error` | Échec d'envoi signalé ; vérifier les tentatives si un worker a malgré tout démarré |
| `not_started` | Aucun démarrage plus de dix minutes après le début du passage |
| `running` | Worker démarré avec un signal de vie récent |
| `stalled` | Signal de vie absent depuis plus de trois minutes, ou tentative dépassant dix-sept minutes ; résultat incertain |
| `completed` | Worker terminé, offres renvoyées, aucun avertissement ni erreur capturé |
| `completed_with_warnings` | Worker terminé avec avertissements, dont accès refusés ou récupération partielle |
| `completed_with_errors` | Worker terminé mais un connecteur a émis une erreur |
| `empty` | Worker terminé sans offre renvoyée ; revue nécessaire |
| `failed` | Exception conservée avec les compteurs disponibles avant l'échec |

Le rapport distingue `ok`, `in_progress`, `attention`, `error` et `unknown`.
Un passage horaire manquant depuis plus de dix minutes déclenche `error`, à
partir du premier passage suivi. Une installation sans passage planifié suivi
reste `unknown` ; un essai manuel ne suffit pas à confirmer le cron. Une panne
du stockage renvoie HTTP 503 et ne devient jamais un bilan vide rassurant.

Les compteurs globaux additionnent les compteurs enregistrés de chaque
tentative. Les reprises peuvent donc recompter les offres lues ou ignorées.
Les créations correspondent aux écritures confirmées par les workers ; un
arrêt brutal peut laisser des écritures non comptabilisées depuis le dernier
signal de vie. Le statut `stalled` conserve cette incertitude. Les tâches ne
démarrent pas la collecte si leur démarrage ne peut pas être journalisé.

Codes de sortie de la commande : 0 pour `ok` ou `in_progress`, 2 pour les
anomalies à examiner, 3 pour `unknown`, 1 pour un échec de consultation.
Ces changements doivent être déployés ensemble : dispatcher, worker, endpoint
de statut, modules de suivi et nouvelle valeur de retour de `runAtsSeed`.

Les trois fonctions de suivi utilisent le format natif Functions v2. Le worker
conserve `config.background: true` et le suffixe `-background`. Le pont Lambda
`connectLambda` supprime les informations d'endpoint non mis en cache nécessaires
aux lectures fortes avec cette version du SDK : il ne doit pas être réintroduit.
