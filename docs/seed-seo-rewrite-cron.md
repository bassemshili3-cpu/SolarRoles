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

# Contrôle du 19 octobre : reprises du seed et budget Mistral

Les 429, 401 et 403 remboursent désormais les tokens réservés pour l'appel rejeté. Le nombre d'appels reste comptabilisé. Les timeouts, crashes et erreurs 5xx gardent leur réservation, car leur consommation réelle est inconnue. Un compteur durable de 429 successifs augmente le délai de cinq minutes à six heures ; `Retry-After` reste prioritaire s'il demande plus longtemps. Le statut expose ce compteur et la dernière erreur fournisseur. Une réponse validée remet ce compteur à zéro.

La migration `20261019120000_rewrite_rate_limit_recovery` ajoute deux colonnes de diagnostic à `SeoRewriteControl`. Le remboursement exceptionnel des anciennes réservations doit correspondre aux appels 429 prouvés par les logs, sous verrou et avec vérification du jour, du nombre d'appels et de la réserve. Aucun plafond fournisseur ou paramètre de facturation n'est relevé.

Le seed suit les remplacements reliés depuis les sites officiels : Generate Capital vers Ashby `generate`, Canadian Solar vers Workday `canadiansolar/CanadianSolar` et Dynamic Energy vers la recherche Pattern Energy iCIMS. Les identités des tâches planifiées sont conservées ; les dates, URLs et clés des offres proviennent du fournisseur réel.

Oracle lit en priorité le détail public `recruitingCEJobRequisitionDetails`, avec vérification de l'identifiant et conservation des responsabilités, qualifications et date de publication. Le rendu JSON-LD reste un secours. iCIMS distingue les catégories de métiers des filiales : un nom d'employeur absent des catégories déclenche une vérification du champ Company, ou d'une mention explicite dans la description si ce champ manque. Une autre filiale n'est pas acceptée par simple ressemblance. Les scripts sont exclus du texte extrait.

Jobvite utilise `/search` lorsque `/jobs` ne fournit que les filtres ou redirige. Les pages suivantes conservent le mode embarqué et restent bornées à vingt pages du même portail. Une redirection vers le support fournisseur est signalée comme source indisponible. Workday passe les entrées sans chemin de détail valide pour éviter qu'une entrée mal formée immobilise le curseur entier.

Les autres anciennes URLs 404 restent visibles dans le monitoring lorsqu'aucun remplacement officiel n'a été confirmé. Les drapeaux `verified` ne sont pas utilisés pour les supprimer du seed. Un compte Mistral qui refuse les appels minimaux en 429 demeure une limitation externe : le remboursement et le backoff corrigent la reprise, sans rendre son quota disponible.
