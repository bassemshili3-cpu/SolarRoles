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

Le sitemap conserve les pages statiques et les exclusions de sources existantes.
Ses offres doivent être actives, non expirées et avoir un `postedAt` compris
entre maintenant moins sept jours et maintenant, bornes incluses. Une date
absente ou estimée ne devient pas une date de publication grâce à la collecte.
Le sitemap est déjà configuré avec une revalidation de 60 secondes.

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
pour consulter et classifier sans écrire en base. Le seed conserve les filtres
US, métiers et rétention de deux mois ; la limite de sept jours concerne le
sitemap, pas l'ensemble des insertions.

Références :
- https://docs.netlify.com/build/functions/scheduled-functions/
- https://docs.netlify.com/build/functions/background-functions/
- https://docs.netlify.com/build/functions/configuration/
