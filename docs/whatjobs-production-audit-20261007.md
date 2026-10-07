# WhatJobs : fonction absente, attribution des Invalid Click non démontrée

Audit du 7 octobre 2026, vers 13 h 54–14 h 00, heure de Paris. Aucun changement du code applicatif, du déploiement ou de `user_agent`. Les seuls fichiers créés sont ce rapport et les captures/scripts d'audit dans `.temp/whatjobs-audit-20261007/`.

| Contrôle | Résultat |
| --- | --- |
| `pnpClick présent en prod` | **NO** : `typeof window.pnpClick === "undefined"` sur la liste PV, une fiche SolarRoles et la liste en mobile émulé. |
| `script qui définit pnpClick trouvé` | **NO** : ni dans le code applicatif, ni parmi les scripts chargés sur les pages SolarRoles testées, ni dans les ressources officielles publiques examinées. |
| Fichier / URL du script officiel | Non identifié. Le dashboard Publisher demande une connexion dans la session de test. |
| Tracking fourni par l'API | URL publisher conservée ; aucun handler/token dans les 90 résultats bruts examinés, soit 34 offres distinctes. |
| Requête réseau déclenchée par `pnpClick` | Aucune sur les pages testées : fonction absente et aucun token fourni dans l'échantillon. |
| Données de tracking perdues par le mapping | Aucune observée sur cet échantillon. |
| Conclusion | **bug confirmed** pour l'absence de la fonction attendue selon le critère de cet audit ; **inconclusive** pour sa responsabilité dans `Invalid Click` / `Client Billable = 0`, et pour l'obligation actuelle de cette fonction sur les URLs `pub_api__cpl__`. |

## 34 offres distinctes, aucun token à extraire

Trois réponses HTTP 200 de l'API officielle ont été capturées pour `solar pv installer`, `solar` et `solar installer`, avec `publisher=7186`, `limit=30`, `page=1`, `user_agent` en query et l'IP réelle du navigateur de test. Cette IP a été obtenue auprès du domaine WhatJobs lui-même puis transmise uniquement à son API ; aucun service auxiliaire de découverte d'IP n'a été utilisé.

Les 30 URLs de la première réponse brute correspondent aux 30 URLs capturées via `/api/whatjobs` en production. Une réponse de la fiche SolarRoles (`solar installer`, `Sacramento`) a également été capturée, mais elle ne contenait aucune offre.

Exemples réels :

```json
[
  {
    "url": "https://www.whatjobs.com/pub_api__cpl__3097958301__7186?utm_campaign=publisher&utm_medium=api&utm_source=7186&geoID=1495",
    "handler_brut": "champ absent",
    "onmousedown_apres_mapping": null,
    "token_extrait": null
  },
  {
    "url": "https://www.whatjobs.com/pub_api__cpl__3100694301__7186?utm_campaign=publisher&utm_medium=api&utm_source=7186&geoID=10616",
    "handler_brut": "champ absent",
    "onmousedown_apres_mapping": null,
    "token_extrait": null
  },
  {
    "url": "https://www.whatjobs.com/pub_api__cpl__3100694323__7186?utm_campaign=publisher&utm_medium=api&utm_source=7186&geoID=22177",
    "handler_brut": "champ absent",
    "onmousedown_apres_mapping": null,
    "token_extrait": null
  }
]
```

Les libellés `handler_brut` et `token_extrait` ci-dessus sont des annotations d'audit, pas des champs WhatJobs. Aucun `pnpClick(this, 'TOKEN')` n'a été observé dans ces réponses. Cela ne prouve pas que d'autres publishers, types d'offres ou réponses n'en reçoivent jamais.

L'exécution de `normalizeWhatJobsResponse` sur les trois réponses brutes conserve 30/30 offres par réponse, toutes les propriétés brutes des offres et toutes les URLs exactes. Aucun champ `onclick`, `onmousedown`, click ID, token, impression ID, redirect URL ou tracking additionnel n'est fourni dans cet échantillon. Les paramètres `utm_campaign`, `utm_medium`, `utm_source` et `geoID` restent dans `url`.

Les seules propriétés supprimées sont au niveau de la réponse : `to`, `from`, `first_page_url`, `last_page_url`, `path`. Elles décrivent la pagination. Le mapping fonctionne par liste de champs : un futur champ additionnel serait supprimé s'il n'était pas ajouté à cette liste, mais aucune perte de tracking actuelle n'a été constatée.

## Un clic atteint WhatJobs sans appel à `pnpClick`

Un clic gauche réel a été suivi avec conservation des requêtes à travers la navigation :

1. `GET https://www.whatjobs.com/pub_api__cpl__3097958301__7186?utm_campaign=publisher&utm_medium=api&utm_source=7186&geoID=1495` : **HTTP 200**, requête de document, `Referer: https://solarroles.com/`.
2. Le document WhatJobs contient `window.location.replace("https://www.whatjobs.com/jobs/solar-installer?id=3097958301")`.
3. Le navigateur charge cette fiche WhatJobs. Ce passage est une redirection JavaScript, pas un HTTP 302 du lien publisher.

Aucune modification de `href`, erreur JavaScript ni requête de tracking WhatJobs distincte avant la navigation. Des préchargements Next.js et de l'analytique Clarity peuvent apparaître dans la même fenêtre réseau ; ils ne constituent pas un appel à `pnpClick`. Les scripts, XHR et pixels chargés après l'arrivée sur WhatJobs appartiennent à la page de destination.

Le bundle déployé confirme le garde conditionnel : `let t=window.pnpClick; a&&"function"==typeof t&&t(e.currentTarget,a)`. Aucun `preventDefault` : si la fonction manque, l'appel est ignoré et la navigation native continue. L'absence de tracking JavaScript ne signifie pas absence de toute attribution par l'URL publisher.

## Enter évite le handler ; le tap émulé produit un `mousedown`

| Activation | Événements observés sur le lien | Appel de `pnpClick` actuel |
| --- | --- | --- |
| Clic gauche | `pointerdown`, `mousedown`, `mouseup`, `click` | Aucun |
| Ctrl + clic | `mousedown`, `click`, ouverture d'onglet | Aucun |
| Meta/Cmd + clic | `mousedown`, `click` avec Meta ; testé sur Windows, pas sur macOS | Aucun |
| Molette | `mousedown` bouton 1, `auxclick`, ouverture d'onglet | Aucun |
| Enter | `keydown`, `click`, **aucun `mousedown`** | Aucun |
| Ouverture directe dans un nouvel onglet | Aucun événement sur le lien source ; navigation vers son URL | Aucun |
| Tap mobile, Chromium avec profil iPhone 13 | `pointerdown`, `touchstart`, `touchend`, `mousedown`, `click` | Aucun |

Après le seul clic réel, les navigations vers les URLs publisher ont été bloquées par le harnais de test pour éviter des dispatches répétés. Les échecs réseau `ERR_FAILED` de ces modes sont donc volontaires, pas des erreurs de l'application. L'ouverture directe simule l'effet d'« ouvrir dans un nouvel onglet » : le menu contextuel natif n'a pas été automatisé. Aucun Safari/iOS physique ni macOS n'a été testé.

Le parcours mobile peut donc atteindre `onMouseDown` via un événement de compatibilité souris dans Chromium. Enter et l'ouverture directe contournent ce handler. Impossible de comparer avec une fonction officielle présente : aucun script authentifié ni token réel n'était disponible. Aucune fonction maison ou substitution de `window.pnpClick` n'a été créée.

## WhatJobs mentionne un script, sans publier son URL dans l'article

La recherche Git sur les fichiers suivis et la recherche sur les sources/documents locaux trouvent `pnpClick` uniquement dans `components/WhatJobsFeed.tsx` et `components/WhatJobsJobBox.tsx`, plus leurs copies de checkout temporaire. Aucune définition de fonction, assignation ou import. Les recherches de `next/script`, balises de script, chargements dynamiques et GTM n'identifient aucun chargeur WhatJobs dans l'application. Le logo WhatJobs est un SVG, pas un script.

Les scripts constatés sur SolarRoles sont les bundles Next.js, Clarity, Vercel Insights et Netlify RUM. Le bundle de la liste PV contient l'appel conditionnel, aucune implémentation.

Un [article officiel WhatJobs, mis à jour le 26 avril 2024](https://www.whatjobs.com/news/whatjobs-com-tips-how-to-build-your-own-job-search-engine/) explique l'envoi de `user_ip` et `user_agent` dans la query et l'inclusion d'un script de tracking près des résultats. Il ne donne pas l'URL de ce script ni ne nomme `pnpClick`. Cette référence ancienne ne suffit pas à établir le contrat actuel des URLs CPL. Le [dashboard Publisher](https://publisher.whatjobs.com/publisher/login) reste non authentifié dans la session de test ; les scripts publics de sa page de connexion et de la page Affiliates ne définissent pas `pnpClick`.

Correction recommandée, non appliquée : récupérer le snippet FeedAPI/API tracking officiel du compte 7186 et vérifier s'il s'applique aux URLs `pub_api__cpl__`. Si c'est le cas, intégrer exactement le script prescrit et revoir les activations clavier/nouvel onglet selon ses instructions. Demander aussi les motifs de rejet des clics concernés pour tester la causalité. Conserver `user_agent` en query ; aucune preuve ne justifie son remplacement par un header.

Captures : `production-state.json`, `production-api.json`, `upstream-*.json`, `mapping-comparison.json`, `live-evidence.json`, `official-evidence.json`, `dispatch.html`, `initial.har`, `clicks.har`, `mobile.har` dans `.temp/whatjobs-audit-20261007/`. Les HAR contiennent les cookies du navigateur isolé de test et restent locaux.

## 12 liens contrôlés, aucun paramètre de suivi altéré

Des tests supplémentaires ont été exécutés le 7 octobre 2026 à partir de 14 h 18, heure de Paris, dans deux nouvelles sessions Chromium isolées, desktop et mobile émulé. Aucun changement applicatif ni nouveau dispatch vers une URL publisher : les navigations de test ont été interceptées avant envoi à WhatJobs.

| Test supplémentaire | Résultat |
| --- | --- |
| URL API → lien affiché | 6/6 liens desktop et 6/6 liens mobile identiques à la réponse API. |
| Attribution publisher | `utm_source=7186` sur tous les liens contrôlés. |
| Paramètres des réponses répétées | `utm_campaign`, `utm_medium`, `utm_source`, `geoID` conservés sur les 30 offres de chacune des quatre réponses contrôlées. |
| Préchargement de liens publisher | Aucune requête vers `whatjobs.com/pub_api` avant activation du lien. |
| Cache du flux | Quatre réponses HTTP 200 ; `Cache-Control: private,no-store` ; Netlify Durable `fwd=bypass` et Edge `fwd=miss`. Aucun cache partagé servi n'a été observé ; ce test ne démontre pas à lui seul l'absence de cache à tous les niveaux internes. |
| Activation desktop/mobile | Aucune erreur JavaScript ni mutation de `href` ; intention de navigation vers l'URL publisher exacte. |
| Fonction et tokens | `pnpClick` toujours absent ; aucun handler non vide dans les quatre réponses répétées. |

Cinq tests locaux exécutent la véritable route `app/api/whatjobs/route.ts`, avec interception du `fetch` amont uniquement dans le processus de test. Ils passent pour IPv4, chaîne `x-forwarded-for`, IPv6, fallback `x-real-ip` et rejet d'une IP absente. Ils vérifient aussi l'encodage exact du User-Agent en query, le publisher, la localisation, `cache: no-store`, la réponse `private, no-store` et la conservation des URLs. Les IP de documentation utilisées dans ces tests ne sont jamais transmises sur le réseau. Ces résultats vérifient le code du checkout ; ils ne capturent pas les headers réels injectés par l'infrastructure dans la fonction de production.

Trois contrôles directs de l'API WhatJobs complètent le test :

- IP réelle + `user_agent` en query : HTTP 200, six offres.
- Même requête sans le paramètre query `user_agent` : HTTP 200, six offres. Le header HTTP User-Agent du client de test existe toujours ; ce résultat ne prouve ni que le User-Agent est facultatif pour le tracking ni qu'il faut le déplacer dans un header.
- Même requête sans `user_ip` : HTTP 400, `{"user_ip":"Please fill in the required field."}`.

Les nouvelles vérifications ne montrent aucune altération des URLs, aucun préchargement générant des clics publisher et aucune erreur de navigation due au handler absent. Elles ne démontrent pas que les clics sont facturables. Les valeurs IP/UA effectivement enregistrées côté WhatJobs, les motifs `Invalid Click` et la signification du compteur `Client Billable` pour ce compte restent à vérifier avec leurs logs ou le dashboard authentifié. L'absence de `pnpClick` est une observation confirmée ; son impact sur ce flux dépourvu de tokens reste non démontré.

Nouvelles preuves locales : `.temp/whatjobs-audit-20261007/parameter-tests.json`, `deeper-live.json`, `deeper-desktop.json`, `deeper-mobile.json`, `control-*.json`. Reproduction locale des tests de paramètres :

```powershell
node --import "data:text/javascript,if(!process.geteuid)process.geteuid=()=>0" --import tsx .temp/whatjobs-audit-20261007/parameter-tests.mts
```
