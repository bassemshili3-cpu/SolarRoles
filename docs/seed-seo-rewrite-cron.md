# Les nouvelles offres du seed alimentent une file de réécriture

Le seed Netlify ajoute une tâche `SeoRewriteTask` dans la transaction qui crée chaque nouvelle offre. Une offre connue, un dry-run ou une insertion annulée ne produit aucune tâche. La migration crée deux tables et ne reprend pas les anciennes offres.

`rewrite-seed-descriptions` s'exécute chaque minute et déclenche le worker background authentifié. Celui-ci traite au plus une offre par invocation avec `mistral-small-latest`. `MISTRAL_API_KEY` doit être configurée dans Netlify, contexte Production, portée Functions. `SEO_REWRITE_MISTRAL_MODEL` permet de changer le modèle sans réutiliser l'ancien paramètre xAI.

Le résultat doit respecter la limite de 3 000 caractères HTML compris, les balises autorisées et les listes demandées. Le worker écrit uniquement `seoDescription`, sa version et la remise en attente d'indexation Google. Il conserve `description`. Les offres inactives, expirées, supprimées et Adzuna sont exclues. Aucun catalogue historique n'est automatiquement retraité au changement de version.

Un verrou de cinq minutes empêche les appels simultanés. Le résultat exige le même propriétaire et un verrou encore valide. Une modification de l'offre pendant l'appel empêche l'écrasement de son résultat. La réservation du budget et de la tentative précède l'appel ; un crash ne les efface pas.

La cadence minimale vaut 65 secondes (`SEO_REWRITE_INTERVAL_MS`). Le budget journalier UTC vaut 180 000 tokens réservés (`SEO_REWRITE_DAILY_TOKEN_BUDGET`). Il utilise une estimation conservatrice en octets UTF-8, incluant la sortie et une marge. Ce budget interne ne remplace pas les quotas ou plafonds de facturation du compte Mistral et peut réduire le débit avant le quota fournisseur.

Les réponses 429 remettent la tâche en attente sans consommer sa tentative, pendant au moins cinq minutes et jusqu'à `Retry-After` si plus long. Les erreurs 401/403 suspendent les appels pendant une heure. Les autres erreurs ont quatre tentatives au maximum et restent visibles en échec. Une tâche en échec nécessite une intervention ; elle n'est pas déclarée terminée. Aucun fallback payant ni retry HTTP caché n'est utilisé.

Le statut authentifié se consulte par `GET /.netlify/functions/seed-rewrite-status` avec `Authorization: Bearer <CRON_SECRET>`. Il expose les totaux pending/done/skipped/failed, le cooldown, le budget et les dix derniers échecs sans exposer de description ni de clé. Un HTTP 202 du worker prouve seulement son déclenchement ; la validation se contrôle dans cette file.

Le script `scripts/rewrite-descriptions.ts` traite la même file ; `--status` affiche les compteurs. Le mode historique explicite `--ats-over-3000` reste distinct du cron et s'arrête sur 401/403/429 ; son option `--resume` conserve la progression.

Les tests ciblés couvrent la limite HTML, les réponses vides et tronquées, le remboursement des 429 et l'insertion réservée aux nouvelles offres. Les tests PostgreSQL `tests/seed-seo-rewrite-db.test.ts` s'activent avec `TEST_SEED_REWRITE_DB=1` : ils utilisent des tables temporaires et annulent toutes les modifications d'offres à la fin de chaque scénario.
