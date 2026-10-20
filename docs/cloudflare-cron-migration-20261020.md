# Cloudflare déclenche les collectes et les réécritures

Deux horaires passent à Cloudflare : le seed ATS à la minute 17 de chaque heure UTC et la réécriture chaque minute. Le Worker `solarroles-crons` appelle les dispatchers authentifiés de SolarRoles. Les fonctions longues, Chromium, Prisma et les checkpoints restent hébergés sur Netlify. Cette livraison migre les déclenchements, pas leur runtime. Les tâches de purge et de courriels d’accueil restent sur leurs horaires Netlify.

La réécriture utilise Groq, modèle `openai/gpt-oss-120b`, avec un effort de raisonnement faible. Ce modèle a été sélectionné dans la liste réellement accessible au compte le 20 octobre ; `llama-3.3-70b-versatile` répondait 404. La clé Groq reste dans Cloudflare Secrets Store. Netlify reçoit seulement l’URL de la passerelle, qui exige `CRON_SECRET` et impose le modèle, deux messages et 2 000 tokens de sortie au maximum. Aucun corps d’offre ni secret n’est journalisé par le Worker.

La file existante et son verrou `seed-mistral` sont conservés. Les descriptions originales ne changent pas. La version SEO reste 8 ; aucun retraitement historique n’est lancé. Le budget quotidien de 180 000 tokens réservés et l’intervalle de 65 secondes restent identiques, y compris les réservations Gemini déjà consommées aujourd’hui. Un quota quotidien atteint continue donc à suspendre les appels jusqu’au renouvellement UTC. Les deux anciens échecs ne sont pas remis en file automatiquement.

Le dispatcher seed refuse les requêtes sans authentification, les méthodes autres que POST et les horaires vieux de plus de cinq minutes. Un enregistrement conditionnel dans le stockage durable empêche de dispatcher deux fois le même créneau horaire. Les manifests, résultats de dispatch et tentatives restent visibles dans la surveillance existante. Un dispatch accepté ne prouve pas la fin de la collecte.

Le déploiement initial du Worker garde `CRONS_ENABLED=false`. Activer ce paramètre seulement après publication des dispatchers sans leurs anciens horaires Netlify et vérification de l’appel Groq. Pour revenir en arrière, désactiver d’abord les crons Cloudflare, puis restaurer les horaires et le fournisseur antérieurs par une livraison dédiée.

Un test réel via Cloudflare a produit 1 029 caractères HTML sur une offre fictive, avec salaire, certification, expérience, déplacements et assurance conservés. Les tests de file utilisent des tables temporaires et annulent les changements en base. L’observation d’une minute automatique Cloudflare et les compteurs de production doivent compléter ces vérifications après bascule.

Les corrections de sources ATS vides restent distinctes de cette migration ; elles ne sont pas incluses.

Références : [déclenchements Cloudflare](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [API Groq](https://console.groq.com/docs/api-reference).
