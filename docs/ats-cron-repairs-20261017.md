# Les 321 sources restent dans le planning ATS

Le contrôle local du 17 octobre conserve les 321 tâches ATS et leurs index. À la demande de l'utilisateur, `verified: true` et `verified: false` ne décident plus de l'accès aux connecteurs. Aucune source n'est supprimée pour absence d'offre solaire. Les pauses explicites du scraping personnalisé restent distinctes de cet ancien indicateur ; ce scraping reste hors du cron ATS par défaut.

Workday rend désormais des lots bornés avant le délai maximal de la fonction. Les requêtes du navigateur ont un délai de vingt secondes ; le scan réserve une marge pour les reprises réseau, le traitement et les journaux. Un curseur conserve la page et les identifiants déjà examinés. Le seed ne le sauvegarde dans Netlify Blobs qu'après traitement des résultats ; un échec d'insertion ou un dry-run ne l'avance pas. Les offres déjà connues ne sont pas redemandées. La première page est revue pendant la continuation d'un grand catalogue. Les erreurs de détail gardent le point de reprise ; les fiches disparues en HTTP 404/410 ne bloquent pas cette reprise. Le contrôle d'origine du navigateur reste actif.

Paylocity conserve les résultats obtenus avant une erreur. Les détails utilisent la session du tableau, un délai de vingt secondes, trois essais au maximum et `Retry-After` pour les HTTP 429. Un blocage de cadence conserve l'URL à reprendre. Le lecteur accepte aussi les fiches HTML sans JSON-LD, après contrôle de leur identité. Une date absente reste absente.

Oracle lit le titre visible associé aux liens superposés vides. Un tableau non reconnu ne se fait plus passer silencieusement pour un tableau vide confirmé. Jobvite ne produit plus l'avertissement générique de parsing lorsque le texte indique explicitement qu'aucune offre n'est ouverte. Quanta Power Solutions utilise la recherche et le champ d'entreprise iCIMS, avec contrôle du nom sur chaque ligne, au lieu d'une catégorie de métier inexistante. iCIMS accepte aussi les dates absolues précédées d'un texte relatif.

Les essais sur les pages publiques, sans insertion en base, ont donné les résultats suivants. Ce sont des correspondances avec le filtre existant, avant le filtre de publication de quatorze jours ; elles ne représentent pas des créations.

| Source | Résultat observé |
| --- | --- |
| MN8 / Oracle | 54 offres découvertes ; 27 correspondances, toutes datées, en 66,959 s. Essai avec `verified: false`. |
| Quanta Power Solutions / iCIMS | 71 offres du bon employeur ; 26 correspondances, toutes datées, en 45,800 s. Essai avec `verified: false`. |
| GE Vernova / Workday | Essai volontairement court de 26,034 s : 17 détails examinés, aucune correspondance et curseur rendu dans la première page. Ce contrôle ne mesure pas le catalogue complet. |
| LCR EPC / Paylocity | 15 offres découvertes ; 9 correspondances en 21,093 s après réparation du lecteur HTML. Aucune date publiée exploitable sur ces neuf résultats : le seed incrémental les écarte encore. Essai avec `verified: false`. |

Les 39 tests ciblés passent, ainsi que le contrôle TypeScript ciblé et `git diff --check` sur les fichiers concernés. Les tests couvrent notamment les reprises Workday, la première page, le refus d'une autre origine, les délais Paylocity, les identités des fiches, les dates manquantes, les sources `verified: false` et l'absence d'avancement du curseur après échec d'insertion.

Les anciens tableaux en HTTP 404, les catégories partagées encore introuvables et les indisponibilités fournisseur restent visibles. Les indicateurs `verified` ne sont pas utilisés pour les masquer. Leur maintien dans le planning ne certifie ni leur adresse ni leur identité ; les sources accessibles sans résultat solaire pourront être évaluées sur plusieurs jours.

Les modifications sont locales : aucun déploiement Netlify ni relancement de seed de production n'a été effectué. Preuves locales : `.temp/ats-repairs-live.json`, `.temp/paylocity-repair-live.json`, `.temp/oracle-mn8.html`, `.temp/oracle-firstsolar.html` et `.temp/paylocity-request.html`.
