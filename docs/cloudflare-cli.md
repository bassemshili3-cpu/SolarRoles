# Accéder aux Workers et crons Cloudflare

Le seed et la réécriture sont désormais déclenchés par le Worker `solarroles-crons`. Leur migration et les vérifications du 20 octobre sont décrites dans [le journal de migration](cloudflare-cron-migration-20261020.md). Les sections de préparation plus bas décrivent l’état avant cette bascule. Le code des traitements longs reste sur Netlify ; la clé Groq et sa passerelle sont sur Cloudflare.

```powershell
# Prévisualiser ou publier les horaires et le Worker existant
node scripts/cloudflare-deploy-crons.mjs
node scripts/cloudflare-deploy-crons.mjs --apply
```

Le CLI du dépôt utilise Wrangler 4.151.2, installé dans `tools/cloudflare`. Il fonctionne avec la connexion OAuth officielle : aucun mot de passe Cloudflare ni token n'est demandé dans le chat. Les identifiants restent gérés par Wrangler sur le PC. Les fichiers locaux `.wrangler` et les dépendances de cet outil sont ignorés par Git.

```powershell
# Installation sur un autre checkout
npm ci --prefix tools/cloudflare --no-audit --no-fund

# Connexion : autorisation dans le navigateur
node scripts/cloudflare.mjs login

# Identité et comptes accessibles
node scripts/cloudflare.mjs status
node scripts/cloudflare.mjs accounts

# Ressources du compte (ID requis si plusieurs comptes sont accessibles)
node scripts/cloudflare.mjs workers --account=ID
node scripts/cloudflare.mjs crons NOM_DU_WORKER --account=ID
node scripts/cloudflare.mjs deployments NOM_DU_WORKER --account=ID
node scripts/cloudflare.mjs tail NOM_DU_WORKER --account=ID
```

Les lectures API sont des requêtes GET ; `tail` ouvre une session de logs Wrangler. Le token utilisé pour ces lectures est capturé en mémoire et n'est jamais affiché par le CLI. Aucun token n'est passé en argument de commande. Le CLI lance les processus Windows avec `windowsHide: true`.

La connexion demande `account:read`, `user:read`, `workers:write`, `workers_tail:read` et `secrets_store:write`, afin de consulter les ressources, préparer la gestion des Workers et enregistrer leurs secrets. L'écran OAuth permet de vérifier ces droits avant autorisation. L'accès est celui des API Cloudflare autorisées ; ce n'est pas une prise de contrôle générale de l'interface du navigateur.

Le 20 octobre 2026, l'utilisateur a choisi Cloudflare pour les futurs crons à la place de Netlify. Cette étape installe l'accès au compte ; elle ne déploie pas de Worker et ne désactive aucun cron existant. Le transfert du seed et de la réécriture devra conserver leurs files, leurs reprises et leurs contraintes d'insertion, puis éviter une double planification lors de la bascule.

Les corrections des retours vides restent à intégrer après cette préparation. Le diagnostic est conservé dans [ats-empty-seed-audit-20261020.md](ats-empty-seed-audit-20261020.md), avec le relevé des 102 sources dans `.temp/ats-empty-389-source-diagnostics.csv`.

Documentation officielle : [Wrangler et connexion OAuth](https://developers.cloudflare.com/workers/wrangler/commands/general/), [liste des Workers](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/list/) et [horaires Cron Triggers](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/schedules/methods/get/).

## Groq est enregistré dans le coffre du compte

Le 20 octobre 2026 à 13 h 41, heure de Paris, `GROQ_API_KEY` a été envoyée depuis `.env.local` au coffre Cloudflare `solarroles`, avec la portée `workers`. La connexion OAuth a été autorisée avec le droit Secrets Store. L'existence du secret a été vérifiée par ses métadonnées ; la valeur n'a été ni affichée ni copiée dans le dépôt.

- Store ID : `38a0611f258e4f8999aa3acaa55e6492`.
- Secret ID : `739093daf6544e6591075dc3bc4902f9`.
- Reçu sans valeur secrète : `.temp/cloudflare-groq-secret-receipt.json`.

L'utilisateur choisit désormais Groq pour la réécriture des descriptions. Le secret sera lié au futur Worker lors de la migration. L'enregistrement ne change pas encore le fournisseur utilisé par le cron Netlify, ne déclenche aucun appel Groq et n'active aucun nouveau cron.

Le script dédié envoie uniquement cette clé ; il ne transfère pas les autres valeurs de `.env.local` :

```powershell
# Vérifie la présence sans afficher la valeur et sans envoi
node scripts/cloudflare-set-groq-secret.mjs

# Crée le secret ou remplace sa valeur dans le coffre existant
node scripts/cloudflare-set-groq-secret.mjs --apply
```
