# Cloudflare déclenche les collectes et les réécritures

Deux horaires passent à Cloudflare : le seed ATS à la minute 17 de chaque heure UTC et la réécriture chaque minute. Le Worker `solarroles-crons` appelle les dispatchers authentifiés de SolarRoles. Les fonctions longues, Chromium, Prisma et les checkpoints restent hébergés sur Netlify. Cette livraison migre les déclenchements, pas leur runtime. Les fichiers locaux de purge et de courriels d’accueil ne sont pas inclus dans cette livraison ; ces fonctions ne figuraient pas dans la liste des fonctions publiées contrôlée le 20 octobre.

La réécriture utilise Groq, modèle `openai/gpt-oss-120b`, avec un effort de raisonnement faible. Ce modèle a été sélectionné dans la liste réellement accessible au compte le 20 octobre ; `llama-3.3-70b-versatile` répondait 404. La clé Groq reste dans Cloudflare Secrets Store. Netlify reçoit seulement l’URL de la passerelle, qui exige `CRON_SECRET` et impose le modèle, deux messages et 2 000 tokens de sortie au maximum. Aucun corps d’offre ni secret n’est journalisé par le Worker.

La file existante et son verrou `seed-mistral` sont conservés. Les descriptions originales ne changent pas. La version SEO reste 8 ; aucun retraitement historique n’est lancé. Le budget quotidien de 180 000 tokens réservés et l’intervalle de 65 secondes restent identiques, y compris les réservations Gemini déjà consommées aujourd’hui. Un quota quotidien atteint continue donc à suspendre les appels jusqu’au renouvellement UTC. Les deux anciens échecs ne sont pas remis en file automatiquement.

Le dispatcher seed refuse les requêtes sans authentification, les méthodes autres que POST et les horaires vieux de plus de cinq minutes. Un enregistrement conditionnel dans le stockage durable empêche de dispatcher deux fois le même créneau horaire. Les manifests, résultats de dispatch et tentatives restent visibles dans la surveillance existante. Un dispatch accepté ne prouve pas la fin de la collecte.

Le déploiement initial du Worker garde `CRONS_ENABLED=false`. Activer ce paramètre seulement après publication des dispatchers sans leurs anciens horaires Netlify et vérification de l’appel Groq. Pour revenir en arrière, désactiver d’abord les crons Cloudflare, puis restaurer les horaires et le fournisseur antérieurs par une livraison dédiée.

Un test réel via Cloudflare a produit 1 029 caractères HTML sur une offre fictive, avec salaire, certification, expérience, déplacements et assurance conservés. Les tests de file utilisent des tables temporaires et annulent les changements en base. L’observation d’une minute automatique Cloudflare et les compteurs de production doivent compléter ces vérifications après bascule.

Les corrections de sources ATS vides restent distinctes de cette migration ; elles ne sont pas incluses.

## Deux passages automatiques réussissent après bascule

La livraison applicative `69ddd9f` est publiée à 11 h 59 min 55 s UTC le 20 octobre 2026. L’API Netlify confirme ensuite `schedule: null` pour les deux dispatchers. Cloudflare est activé à 12 h 00 ; les passages automatiques de 12 h 01 et 12 h 02 se terminent sans exception avec `decision: dispatched` après correction du User-Agent. Le premier passage avait reçu un 403 sans User-Agent explicite. Les requêtes vers Netlify utilisent désormais `SolarRoles-Cron/1.0`.

Le contrôle de 12 h 03 UTC retrouve 54 tâches seed dispatchées, dont 52 terminées et 2 en cours, sans échec d’exécution ni dispatch manquant. Quinze retours vides et six avertissements restent visibles ; ils appartiennent au diagnostic ATS en attente. Un second déclenchement du même créneau renvoie `duplicate`. La réécriture publie `provider: groq`, avec 85 tâches en attente, 13 terminées et 2 anciens échecs Gemini. Les 172 254 tokens déjà réservés aujourd’hui restent comptabilisés.

Les 26 tests ciblés passent : quatre tests Cloudflare, onze tests de réécriture/HTML, huit scénarios de base avec rollback et trois tests CLI. Les preuves locales sont `.temp/groq-live-smoke-20261020.json`, `.temp/groq-migration-deploy.json`, `.temp/cloudflare-cron-observation-20261020.jsonl` et `.temp/cloudflare-migration-production-20261020.json`.

Pour publier une modification du Worker existant : `node scripts/cloudflare-deploy-crons.mjs --apply`. Sans `--apply`, cette commande affiche seulement la cible et les horaires. Elle utilise l’API officielle de publication puis l’API des horaires, et conserve le secret d’authentification existant. Ce chemin a été vérifié après un refus de l’endpoint de versions utilisé par Wrangler 4.151.2.

Références : [déclenchements Cloudflare](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [API Groq](https://console.groq.com/docs/api-reference).
