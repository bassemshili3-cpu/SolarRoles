# WhatJobs : comparer les impressions et les clics par jour

Trois emplacements ont des compteurs séparés : `job_box` (offres associées sur une fiche), `job_search` (formulaire desktop ou mobile vers WhatJobs), `feed` (offres dans la liste principale). Les événements sont enregistrés dans la table PostgreSQL `WhatJobsMetric`, via `/api/whatjobs/events`.

| Événement | Définition |
| --- | --- |
| `widget_impression` | Au moins un élément de cet emplacement visible à 50 % pendant une seconde continue, onglet actif ; une fois par emplacement et visite de route. Un job box vide/en chargement ne compte pas. |
| `job_impression` | Offre visible à 50 % pendant une seconde ; une fois par offre/publisher/emplacement et visite de route. Un chargement API ou un élément hors écran ne compte pas. |
| `click` | Activation du lien d'une offre : souris, Ctrl/Cmd+clic, molette, Enter ou tap. Comptée à l'activation, sans attendre ni bloquer WhatJobs. |
| `search_submit` | Soumission native du formulaire WhatJobs, au bouton ou au clavier. Distincte des clics sur les offres. |

Une visite correspond à la durée du tracker sur un pathname : une navigation vers une autre route ou un rechargement crée une nouvelle vue. Modifier les filtres sur la même route ne recompte pas les mêmes offres ni le widget ; les nouvelles offres visibles comptent. Les deux formulaires de recherche partagent `job_search` ; un formulaire masqué par CSS ne compte pas.

Le collecteur stocke l'heure de réception serveur, le chemin de page sans query, l'emplacement, l'identifiant d'offre/publisher, le mode d'activation, la catégorie desktop/mobile, la présence de `pnpClick` et d'un token, et un identifiant de vue aléatoire conservé seulement en mémoire. Aucune IP, aucun User-Agent, aucun texte de recherche, cookie visiteur ou token WhatJobs n'est stocké. L'IP est utilisée uniquement par le limiteur de requêtes en mémoire, comme pour d'autres routes du projet.

Les envois sont groupés pour les impressions et immédiats en `fetch(..., { keepalive: true })` pour une activation ; ils ne changent ni `href`, ni `pnpClick`, ni les paramètres envoyés à l'API WhatJobs. Chaque événement a un UUID : PostgreSQL ignore un renvoi du même événement. Les erreurs réseau/429/5xx sont retentées pendant la présence sur la page, avec une file bornée ; fermeture du navigateur, blocage réseau ou panne prolongée peuvent perdre des événements.

Les ouvertures par menu contextuel, copie/collage d'URL et actions hors de SolarRoles ne sont pas mesurables comme clics par ce tracker. `pnpAvailable` indique la disponibilité de la fonction, pas la réussite d'un appel. Les navigateurs automatisés détectés par `navigator.webdriver`, ainsi que les pages ouvertes avec `?whatjobs_tracking_test=1`, créent des événements `isTest=true`, exclus du CSV normal. Cela ne constitue pas un filtrage exhaustif des robots.

## L'export distingue les clics des recherches envoyées

Depuis le terminal PowerShell du projet, après activation en production :

```powershell
node --env-file=.env.local --import "data:text/javascript,if(!process.geteuid)process.geteuid=()=>0" --import tsx scripts/export-whatjobs-metrics.ts --days=7 --timezone=UTC --out=whatjobs-metrics.csv
```

Utiliser le même fuseau que le dashboard WhatJobs (`--timezone=Europe/Paris` si nécessaire). Chaque ligne regroupe date, emplacement, publisher et device, avec `widget_impressions`, `job_impressions`, `clicks`, `search_submits`, vues observées, clics avec fonction disponible et clics avec token. La fenêtre est glissante : le premier et le dernier jour peuvent être incomplets. Ne comparer que les jours complets et les mêmes publishers.

Comparer les clics sur les offres à la somme `clicks` de `feed` et `job_box`. Garder `search_submits` séparé : une recherche peut ensuite produire zéro, un ou plusieurs clics chez WhatJobs. Nos impressions mesurent la visibilité ; les compteurs WhatJobs peuvent utiliser une autre définition. Un clic interne est une intention de navigation, pas une confirmation de visite ni un clic facturable. Aucun taux de rejet ne peut être déduit du seul écart entre ces compteurs.

## La collecte commence après migration et publication

La migration `20261007143000_whatjobs_metrics` a été appliquée le 7 octobre 2026 à la base configurée dans `.env.local`, seule, en transaction avec son inscription dans l'historique Prisma. Vérification : 13 colonnes, clé primaire et index quotidien présents, zéro événement à ce stade. Aucun déploiement ni autre migration n'a été effectué. Le code du tracker reste dans le checkout et attend la publication prévue par l'utilisateur ; la collecte ne commence qu'après celle-ci.

La migration crée uniquement `WhatJobsMetric` et son index. Le collecteur utilise une requête SQL paramétrée et fonctionne sans accès public aux rapports ; l'export exige l'accès à la base. Après publication, vérifier une page avec `?whatjobs_tracking_test=1`, constater des POST 204 et des lignes `isTest=true`, puis ouvrir le site normalement pour démarrer les mesures réelles.

Validation locale : quatre tests de schéma/API, tests navigateur (visibilité, retry, dédoublonnage, clavier/molette/touch et formulaires), Prisma validate, ESLint et typecheck ciblés passent. Le typecheck global rencontre des erreurs hors périmètre dans `.next/types/app/jobs/[id]/page.ts` et `tests/canonical-job-urls.test.ts`.
