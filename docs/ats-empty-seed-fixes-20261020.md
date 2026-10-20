# Le seed dépasse les catalogues tronqués

Les corrections ciblent 30 sources associées à 115 des 389 exécutions vides du diagnostic du 20 octobre. Les autres zéros ne sont pas tous des anomalies : certains tableaux sont vides, certaines offres sont déjà connues et d’autres échouent aux critères de rôle, de date ou de pays. Aucune source n’est supprimée.

| Cause | Comportement corrigé |
| --- | --- |
| Workday annonce `total: 0` après sa première page | Une page non vide ne termine plus le parcours sur ce zéro. Le total positif initial est conservé dans le checkpoint et rafraîchi en tête de catalogue. Il permet de reconnaître la dernière page même si le serveur la répète. Les échéances restent respectées ; les autres répétitions sont signalées. |
| Workable affiche des instructions de recherche | Le connecteur passe à l’API publique complète et suit ses tokens de continuation, au lieu de conclure à zéro ou de se limiter aux 30 résultats d’une recherche Markdown. |
| Les identifiants Breezy comportent 14 caractères | Les deux formats observés, 12 et 14 caractères hexadécimaux, sont reconnus dans les listes et les détails. Les URLs étrangères ou mal formées restent exclues. |
| SmartRecruiters ne lit que 100 annonces | Les pages suivantes sont parcourues. Les grands catalogues reprennent à leur offset durable ; un détail momentanément indisponible conserve la reprise, une annonce supprimée en 404/410 ne bloque pas les suivantes. |
| Rippling filtre les titres avant de lire les descriptions | Le mode `solar_taxonomy` lit les descriptions avant sa décision finale. Les modes explicitement limités à certains rôles conservent leurs filtres. Les reprises et URLs déjà connues évitent du travail répété. |
| Le flux supposé RSS est une page HTML HTTP 200 | La réponse est signalée comme format invalide. Un vrai canal RSS vide reste accepté. |
| Paylocity redirige vers `JobNotFound` avec HTTP 200 | La source est signalée indisponible, plutôt que classée comme tableau valablement vide. |
| Un tableau Breezy a déménagé | Le site officiel pointe vers Ashby. La migration est configurée dans `config/ats/source-migrations-20261020.json`, sans changer l’index ni l’horaire de la tâche existante. |

## Des réponses figées retrouvent des offres absentes du premier parcours

La comparaison réutilise les mêmes réponses publiques enregistrées pour l’ancienne version de production `8c68ad8` et les connecteurs corrigés. Aucun appel de cette comparaison n’insère d’offre en base.

| Source | Correspondances avant | Après | Après, US et publication de moins de 14 jours |
| --- | ---: | ---: | ---: |
| Spark Power / Breezy | 0 | 11 | 3 |
| AECOM / SmartRecruiters | 0 | 43 | 11 |
| Terabase / Workable | 0 | 11 | 0 |
| Essel / Workable | 0 | 10 | 0 |
| BlueWave / Rippling | 0 | 2 | 0 |
| Stem / Rippling | 0 | 3 | 0 |

Ces 80 correspondances ne représentent pas 80 créations possibles. Quatorze passent les contrôles de date et de pays avant déduplication en base. La comparaison SmartRecruiters s’arrête dans sa limite de temps à l’offset 2 200 ; celle d’Essel conserve un token de reprise. Leurs totaux sont donc partiels. Les autres quatre parcours sont terminés. Aucun résultat de l’ancienne version n’est perdu sur ces six comparaisons.

La découverte du remplacement est appuyée par l’iframe Ashby présente sur [la page carrières officielle](https://www.plantedsolar.com/careers). Le site officiel de Good Faith Energy renvoie toujours à son ancien tableau Paylocity : aucun remplaçant n’a été inventé. La correction rend son indisponibilité visible.

Le filtre solaire, les critères US, les publications authentiques de moins de quatorze jours, les URLs déjà présentes et l’insertion sans modification des offres existantes restent les règles du seed. Les indicateurs `verified` ne sont pas réintroduits comme condition d’ingestion. Seules les nouvelles insertions alimentent la file de réécriture Groq.

Les 70 tests ciblés de la première livraison passent dans la copie isolée. Deux tests supplémentaires couvrent ensuite le total Workday durable et le rafraîchissement des anciens curseurs au-delà de la fin du catalogue, soit 72 tests au total. Ils couvrent les pages après les limites antérieures, les continuations, les reprises après erreur et après échéance, les annonces retirées, les IDs Breezy, les descriptions Rippling, les tableaux indisponibles, les publications et l’insertion idempotente. Le contrôle TypeScript des connecteurs et du script seed ne signale aucune erreur. Le protocole de comparaison V20 ne s’applique pas à cette livraison, conformément à la précision de l’utilisateur.

Les preuves locales sont conservées sous `.temp/ats-empty-fix-validation-20261020/` : `live-comparison.json`, les réponses enregistrées, `typecheck.json`, `target-sources.json` et les reçus de la passe ciblée après déploiement.
