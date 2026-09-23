# Historique des offres solaires US avec Common Crawl

## Objectif

Le premier livrable couvre trois années : **2016, 2020 et 2024**. Une extraction 2026 peut être ajoutée comme point de comparaison avec la base Solar Roles actuelle.

Le POC doit déterminer si Common Crawl permet de reconstruire un historique défendable des offres solaires américaines avant de lancer un backfill 2015–2026. Le résultat ne devra pas être présenté comme un recensement exhaustif du marché : la couverture des employeurs, des ATS et des pages archivées varie selon les années.

## Périmètre du POC

| Élément | Décision initiale |
| --- | --- |
| Années | 2016, 2020 et 2024 |
| Année de contrôle facultative | 2026 |
| Géographie | États-Unis |
| Sources | Career sites et ATS d’employeurs solaires identifiés |
| Unité d’analyse | Une annonce d’emploi distincte |
| Coût cible | Outils et données gratuits |
| Extension 2015–2026 | Uniquement après validation de la qualité du POC |

## 1. Découvrir d’abord l’univers d’employeurs

Le premier POC utilisait un registre fermé de 37 employeurs. Il a validé la mécanique Common Crawl, mais il ne constitue pas un vrai univers historique : le script `discover-sources.ts` ne pouvait retrouver que des domaines, ATS et routes liés à ces employeurs déjà connus.

La pipeline corrigée sépare désormais deux problèmes différents :

1. **Employer discovery** — découverte ouverte des tenants ATS et sources emploi visibles dans le crawl, sans filtre sur `employers.json`.
2. **Source discovery** — une fois un employeur identifié, reconstruction de ses anciens domaines, ATS et routes historiques.

Le premier passage de l'employer discovery balaie les écosystèmes ATS dont le tenant peut être déduit de l'URL ou du host : Workday, Greenhouse, Lever, Jobvite, SmartRecruiters, Ashby, iCIMS, Taleo, SuccessFactors générique, BambooHR, Dayforce, Oracle Cloud, UKG/UltiPro, Paylocity, ADP, Paycom et Jobs2Web. Une seconde voie dans le même scan capture aussi les URLs first-party qui combinent un chemin d'emploi/career avec un signal solaire explicite dans l'URL. Il extrait des **sources candidates**, pas des employeurs solaires déjà validés.

Aucun nom d'entreprise Solar Roles n'est nécessaire pour qu'une source ATS soit découverte. Le registre actuel sert ensuite de **booster de rappel et de mapping**, jamais de plafond.

Le URL Index ne contient toutefois pas le texte des annonces. Une source candidate ne devient donc un employeur solaire qu'après échantillonnage de records WARC et validation du contenu :

```text
Common Crawl URL Index
  -> inventaire ouvert des tenants ATS
  -> quelques captures WARC par source
  -> parsing JobPosting / HTML
  -> filtre US + solaire
  -> employeurs candidats validés
  -> source discovery historique pour ces employeurs
  -> index/fetch complet des sources validées
```

Les sources first-party ou les ATS derrière des hosts entièrement personnalisés ne sont pas toutes détectables à partir du seul suffixe ATS. Elles sont récupérées dans une seconde passe à partir de trois apports : employeurs Solar Roles actuels, employeurs historiques déjà identifiés, et nouveaux employeurs trouvés par l'employer discovery. Le résultat final est donc l'union de la découverte ouverte et de l'expansion ciblée, pas un panel fermé au départ.

Chaque employeur validé doit conserver au minimum :

```text
employer_id
employer_name
career_domain
ats_provider
known_url_patterns
active_from
active_to
discovery_evidence
notes
```

Les dates `active_from` et `active_to` peuvent rester nulles tant qu’elles ne sont pas vérifiées.

## Pipeline révisée du POC 2020

Le crawl `CC-MAIN-2020-29` déjà téléchargé localement sert maintenant de laboratoire pour la discovery ouverte. L'ordre retenu est :

1. `discover-employers.ts` scanne les 300 Parquet et construit l'inventaire des tenants ATS sans consulter `employers.json`.
2. Il produit un manifeste de captures échantillons et un registre provisoire par source.
3. `fetch-captures.ts`, `parse-jobs.ts` et `classify-jobs.ts` valident quelles sources contiennent effectivement des offres US solaires.
4. `summarize-employer-discovery.ts` sépare les sources positives, les sources solaires hors-US/inconnues et les négatifs qui nécessitent un échantillonnage plus profond. Une absence de hit sur quelques pages n'est jamais traitée comme une preuve d'absence de solaire chez un employeur diversifié.
5. Les sources positives sont consolidées en employeurs historiques candidats ; les sources négatives à forte activité ou possédant un signal solaire dans l'URL sont ré-échantillonnées afin de réduire les faux négatifs chez les employeurs diversifiés.
6. `discover-sources.ts` est ensuite exécuté sur l'univers élargi afin de retrouver anciens ATS, anciens domaines et routes supplémentaires.
7. Seulement après cette boucle de discovery, `query-common-crawl-url-index.ts` lance la collecte complète des offres des sources validées.
8. Le Historical Employer Panel est construit **après collecte**, en fonction de la continuité réellement observée, jamais imposé avant la discovery.

Le POC 2020 à 37 employeurs reste un benchmark technique. Ses 30 offres ou ses taux de couverture ne doivent pas être interprétés comme la taille ou la représentativité du corpus 2020 final.

## 2. Une requête Parquet remplace des centaines d’appels CDX

Chaque année doit être représentée par plusieurs crawls, pas par un snapshot unique. Le chemin principal interroge localement le **URL Index Parquet** avec DuckDB. Une requête charge tous les domaines et préfixes du registre, filtre une ou plusieurs partitions `crawl=.../subset=warc`, puis écrit un manifeste unique. Il n’y a donc plus un appel réseau à l’API CDX pour chaque combinaison `employeur × domaine × crawl`.

Le corpus d’un crawl approche 300 Go, mais il n’est pas téléchargé en bloc. Le runner télécharge d’abord le petit manifeste officiel `cc-index-table.paths.gz`, en conserve uniquement les fichiers `subset=warc`, puis donne leurs URLs HTTPS explicites à DuckDB. DuckDB lit les métadonnées Parquet et demande uniquement les plages nécessaires. Cette liste explicite est indispensable : le bucket public ne permet pas à DuckDB de résoudre directement un glob S3 anonyme. Le filtre exact sur `url_host_name`, suivi du préfixe `url_path`, est appliqué avant l’extraction WARC.

CDX reste disponible pour diagnostiquer ponctuellement un motif d’URL ou comparer un résultat. Il ne doit plus piloter un POC multi-employeurs ni le backfill.

Les métadonnées minimales à conserver sont :

```text
crawl_id
capture_timestamp
url
url_key
status
mime
digest
warc_filename
warc_offset
warc_length
```

Le journal de collecte doit aussi enregistrer les requêtes sans résultat. Une absence de capture n’est pas une preuve d’absence d’offres ; c’est une information sur la couverture de l’archive.

## 3. Télécharger les records WARC par plage d’octets

Les fichiers WARC complets ne doivent pas être téléchargés. Les champs `warc_filename`, `warc_offset` et `warc_length` permettent de demander uniquement la plage d’octets contenant la capture recherchée.

Le pipeline doit conserver séparément :

1. la réponse de l’index ;
2. le record WARC brut ou décompressé ;
3. le HTML extrait ;
4. l’annonce normalisée ;
5. les raisons de rejet éventuelles.

Cette séparation permettra de corriger un parseur sans interroger à nouveau Common Crawl.

## 4. Reconstruire une annonce normalisée

Le parseur doit privilégier les données structurées `JobPosting`, puis les métadonnées propres à l’ATS, puis le HTML visible. Aucun champ absent ne doit être inventé.

Schéma minimal :

```text
historical_job_id
source_url
canonical_url
source_job_id
employer_id
employer_name
title
location_raw
city
state
country
date_posted
valid_through
employment_type
salary_min
salary_max
salary_currency
salary_period
description_text
description_hash
crawl_id
capture_timestamp
parser_version
extraction_method
```

`capture_timestamp` doit toujours rester distinct de `date_posted`. La date du crawl indique quand la page a été observée, pas quand l’offre a été publiée.

## 5. Appliquer la taxonomie Solar Roles

La taxonomie doit être exécutée sur le titre et la description conservés, avec une version de règles enregistrée pour chaque résultat. Les dimensions prioritaires du POC sont :

- BESS et storage ;
- SCADA ;
- commissioning ;
- operations and maintenance ;
- travel ;
- années d’expérience ;
- expérience solaire explicitement exigée ;
- NABCEP ;
- OSHA ;
- diplôme ou niveau d’études ;
- paid training ;
- management ;
- métiers d’électricien.

Les champs dérivés doivent pouvoir être recalculés à partir du texte archivé. Une évolution de la taxonomie ne doit pas obliger à retélécharger les captures.

## 6. Dédupliquer en plusieurs passes

Une annonce peut apparaître dans plusieurs crawls et sous plusieurs URLs. La déduplication doit rester séparée de l’historique des observations afin de ne pas perdre la durée de visibilité d’une offre.

Ordre recommandé :

1. identifiant ATS ou identifiant source exact ;
2. URL canonique normalisée ;
3. signature `employer + title + location + description_hash` ;
4. rapprochement prudent des descriptions presque identiques.

Deux tables logiques sont nécessaires :

- `historical_jobs` pour l’annonce dédupliquée ;
- `historical_job_captures` pour chaque observation Common Crawl.

Le rapprochement approximatif ne doit jamais fusionner automatiquement deux offres dont les identifiants source diffèrent sans conserver une trace de la décision.

## 7. Mesurer la qualité avant le volume

Chaque année du POC doit produire les indicateurs suivants :

| Indicateur | Définition |
| --- | --- |
| Annonces solaires valides | Offres dédupliquées ayant passé le filtre solaire |
| Employeurs représentés | Employeurs avec au moins une offre valide |
| Descriptions complètes | Part des offres disposant d’un texte exploitable |
| Dates exploitables | Part avec une date publiée ou une fenêtre temporelle défendable |
| Faux positifs | Part des offres rejetées lors du contrôle manuel |
| Doublons | Captures fusionnées par annonce distincte |
| Couverture des domaines | Domaines recherchés ayant produit au moins une capture pertinente |

Un échantillon manuel doit couvrir chaque année, chaque ATS important et plusieurs catégories de métiers. Les décisions `valide`, `faux positif`, `description incomplète` et `doublon incorrect` doivent être enregistrées avec leur motif.

## 8. Construire un Historical Employer Panel

Les tendances principales doivent reposer sur un panel d’employeurs observables de manière suffisamment stable, et non sur le volume brut de toutes les captures disponibles.

Pour chaque employeur et chaque année, conserver :

```text
domain_searched
index_matches
warc_downloads
valid_jobs
complete_descriptions
coverage_status
```

Le statut de couverture doit distinguer au moins :

- `covered` : domaine recherché et captures exploitables ;
- `searched_no_capture` : domaine recherché sans capture pertinente ;
- `domain_unknown` : domaine historique non établi ;
- `parser_failed` : captures présentes mais extraction non résolue ;
- `not_operating_or_not_in_panel` : employeur hors périmètre pour cette année.

Une baisse du nombre d’offres ne doit être interprétée comme une tendance de marché que si la stabilité du panel et la qualité d’extraction restent comparables.

## 9. Critères de décision après le POC

Le backfill complet peut commencer si les trois années tests produisent :

- assez d’employeurs communs pour former un panel longitudinal ;
- des descriptions complètes en proportion suffisante pour exécuter la taxonomie ;
- un taux de faux positifs acceptable lors du contrôle manuel ;
- une couverture documentée par ATS et par année ;
- une déduplication qui conserve correctement les observations répétées ;
- des coûts de requête, de stockage et de traitement compatibles avec un traitement 2015–2026.

Si 2015 ou 2016 présente une couverture trop fragmentaire, la série publiée devra commencer en 2017 ou 2018. La disponibilité technique d’un crawl ne suffit pas à rendre une année statistiquement comparable.

## 10. Backfill 2015–2026

Le backfill utilisera tous les crawls disponibles de chaque année. Il reprendra les mêmes registres d’employeurs, formats de sortie, versions de parseur, règles de déduplication et contrôles qualité que le POC.

Ordre recommandé :

1. stabiliser les parseurs sur 2016, 2020 et 2024 ;
2. ajouter 2026 comme contrôle contre les données Solar Roles observées ;
3. traiter les années intermédiaires ;
4. tester 2015 séparément ;
5. figer le panel longitudinal et les règles de publication ;
6. produire les séries historiques avec leurs dénominateurs et limites de couverture.

## Livrables attendus

Le POC doit produire :

- un registre versionné des employeurs, domaines et motifs d’URL ;
- les réponses brutes des index Common Crawl ;
- un manifeste des records WARC téléchargés ;
- les annonces normalisées et leurs captures ;
- les résultats de taxonomie versionnés ;
- un rapport de déduplication ;
- un rapport qualité par année et par ATS ;
- le premier Historical Employer Panel ;
- une décision documentée sur le backfill 2015–2026 et l’année de départ publiable.

## Garde-fou de publication

Le nombre d’annonces retrouvées dans Common Crawl mesure d’abord la combinaison de trois phénomènes : activité de recrutement, présence des pages dans les crawls et capacité du pipeline à les reconnaître. Toute publication devra afficher la couverture du panel, le nombre d’employeurs, la proportion de descriptions complètes et les changements de méthode à côté des tendances calculées.

## Implémentation du POC

Le runner principal se trouve dans `scripts/query-common-crawl-url-index.ts`. Il transforme le registre `data/common-crawl-historical-jobs/employers.json` en table de cibles, produit une requête DuckDB et interroge toutes ces cibles en une seule passe par ensemble de crawls.

DuckDB est volontairement installé hors des dépendances de l’application, à l’emplacement local `.tools/duckdb/duckdb.exe`. Un autre exécutable peut être fourni avec `--duckdb`. Les fichiers Parquet Common Crawl restent distants ; seuls les blocs nécessaires à la requête sont transférés.

Pour des scans répétés, le mode local est retenu. Le crawl `CC-MAIN-2020-29` a été téléchargé avec `cc-downloader` : 300 fichiers Parquet `subset=warc`, environ 227,1 Go au total. Les scans de discovery réutilisent cette copie locale et ne doivent pas la retélécharger.

Commandes principales :

```bash
# VRAIE discovery ouverte : aucun filtre employers.json
npm run historical:discover -- --year 2020 --crawl CC-MAIN-2020-29 --threads 2 --memory-limit 3GB --files-per-batch 1

# Ancienne discovery : enrichir les sources d'employeurs déjà connus
npm run historical:discover-sources -- --year 2020 --crawl CC-MAIN-2020-29 --threads 2 --memory-limit 3GB --files-per-batch 1

# Après la discovery ouverte : télécharger les captures échantillons
npm run historical:fetch -- --input data/common-crawl-historical-jobs/employer-discovery-2020

# Parser avec le registre provisoire produit par la discovery
npm run historical:parse -- --input data/common-crawl-historical-jobs/employer-discovery-2020 --output data/common-crawl-historical-jobs/employer-discovery-2020 --registry data/common-crawl-historical-jobs/employer-discovery-2020/provisional-employers.json

# Classifier les échantillons US + solaire
npm run historical:classify -- --input data/common-crawl-historical-jobs/employer-discovery-2020 --output data/common-crawl-historical-jobs/employer-discovery-2020

# Résumer les sources validées et celles qui nécessitent un deep sample
npm run historical:discovery-summary -- --input data/common-crawl-historical-jobs/employer-discovery-2020


# Requête bulk sur un crawl explicite
npm run historical:common-crawl

# Générer et inspecter le SQL sans lancer DuckDB
npm run historical:common-crawl -- --crawls CC-MAIN-2024-30 --sql-only

# Un gros scan local pour trois crawls explicites
npm run historical:common-crawl -- --crawls CC-MAIN-2016-30,CC-MAIN-2020-29,CC-MAIN-2024-30

# Même requête sur des Parquet déjà téléchargés par cc-downloader
npm run historical:common-crawl -- --crawls CC-MAIN-2024-30 --parquet-dir D:/common-crawl

# Sélectionner automatiquement trois crawls répartis dans chaque année test
npm run historical:common-crawl -- --years 2016,2020,2024 --max-crawls-per-year 3

# Télécharger seulement les records WARC du manifeste produit
npm run historical:common-crawl-cdx -- --phase extract --output data/common-crawl-historical-jobs/url-index-poc --max-captures-per-employer-year 20

# Rejouer le parseur sans retélécharger les records WARC
npm run historical:common-crawl-cdx -- --phase extract --output data/common-crawl-historical-jobs/url-index-poc --reuse-html --max-captures-per-employer-year 20

# Diagnostic CDX ponctuel uniquement
npm run historical:common-crawl-cdx -- --phase index --employer-ids origis-energy --years 2024 --max-crawls-per-year 1

# Test ciblé
npm run test:historical-common-crawl
```

Chaque répertoire d’exécution contient d’abord :

- `url-index-plan.json`, le périmètre exact du scan ;
- `url-index-parquet-paths.txt`, les fichiers du manifeste officiel effectivement interrogés ;
- `url-index-query.sql`, la requête DuckDB reproductible ;
- `index-records.parquet`, le résultat analytique compact ;
- `index-records.jsonl`, le même manifeste au format attendu par l’extracteur WARC ;
- `index-queries.jsonl`, y compris les cibles sans capture.

Après l’extraction WARC, il contient aussi :

- `captures.jsonl`, une ligne par capture avec le résultat du parsing et les preuves de classification ;
- `parsed-job-observations.jsonl`, **toutes les observations de pages emploi parsées**, avec le texte normalisé et les métadonnées de capture ; ce fichier préserve les différentes versions d’une même offre ;
- `parsed-jobs.jsonl`, les offres parsées dédupliquées, sans dépendre du filtre solaire/US ni de la taxonomie analytique ;
- `job-classifications.jsonl`, la classification US / solaire et ses preuves, versionnée séparément ;
- `solar-us-jobs.jsonl`, le sous-ensemble courant des offres classées US + solaire ;
- `solar-us-job-features.jsonl`, les features analytiques dérivées (BESS, SCADA, travel, expérience, etc.), recalculables à tout moment depuis le corpus ;
- `historical-jobs.jsonl`, alias de compatibilité de `solar-us-jobs.jsonl` pour l’ancien POC ;
- `quality-report.json`, les résultats par année et employeur ;
- `manual-review.csv`, l’échantillon à contrôler manuellement ;
- `raw/` et `html/`, conservés localement mais exclus de Git.

### Architecture de conservation

Le crawl ne doit pas figer les statistiques de recherche. La chaîne est volontairement séparée :

```text
Common Crawl capture
  -> raw WARC / HTML
  -> parsed-job-observations.jsonl
  -> parsed-jobs.jsonl
  -> job-classifications.jsonl
  -> solar-us-jobs.jsonl
  -> solar-us-job-features.jsonl
  -> analyses / reports
```

Le parser, le classifieur solaire/US et la taxonomie possèdent des versions distinctes. Une nouvelle métrique ou une modification de taxonomie ne doit donc pas nécessiter un nouveau téléchargement Common Crawl.

## Résultat du premier passage — 22 septembre 2026

**3 703 captures HTML uniques ont été retrouvées dans 117 requêtes d’index** sur le panel ATS actuel, avec trois crawls répartis dans chacune des années 2016, 2020 et 2024.

La couverture n’est pas encore suffisante pour publier une tendance :

- 2016 : aucune capture sur les domaines ATS actuels ;
- 2020 : 671 captures, toutes concentrées chez NextEra Energy Resources dans ce registre ;
- 2024 : 3 032 captures, dominées par ENGIE et NextEra ;
- 97 records WARC ont été téléchargés par plage d’octets pour le contrôle initial ;
- cinq offres solaires US distinctes ont passé le filtre strict, toutes chez Origis Energy en 2024 ;
- les descriptions de ces cinq offres sont complètes.

Un second registre de domaines historiques a interrogé SolarCity, Vivint Solar, SunPower, First Solar, Sunrun et Sungevity. Il a retrouvé **687 captures**, dont 686 sur `jobs.sunpower.com` en 2020 et une seule en 2016. L’échantillon 2020 a produit une offre US clairement exploitable, `Lead Installation Technician/Foreman - Ontario, CA`.

Ce premier passage CDX validait la récupération par byte ranges WARC, l’extraction, la taxonomie, la déduplication et le rapport qualité. Il ne constitue plus l’architecture d’indexation retenue : le prochain passage doit mesurer le même registre avec la requête bulk Parquet. Le registre actuel reste insuffisant comme panel longitudinal tant que les domaines ou ATS réellement utilisés en 2016 et en 2020 ne sont pas mieux reconstruits. Aucun backfill 2015–2026 ni aucune série historique ne doit être publié avant ces deux validations.

## Validation du runner Parquet — 22 septembre 2026

**Une capture test produit bien le manifeste WARC attendu de bout en bout.** Un Parquet local conforme au schéma Common Crawl a été interrogé avec deux motifs Origis Energy : le motif historique `boards.greenhouse.io` a retourné une ligne et le motif `job-boards.greenhouse.io` a été enregistré comme `searched_no_capture`. La ligne produite conserve l’URL, le timestamp, le digest, le fichier WARC, l’offset et la longueur sous les noms déjà consommés par l’extracteur.

Le scan HTTPS des 300 fichiers du crawl `CC-MAIN-2024-30` a confirmé l’accès distant, mais il n’a pas été laissé tourner jusqu’au bout : sur cette connexion, un seul lot distant demandait plusieurs minutes malgré le filtre SURT. Ce n’est pas un résultat de couverture. Pour le POC complet, il faut soit laisser le scan distant s’exécuter longuement, soit monter un volume disposant d’au moins 300 Go libres et utiliser `--parquet-dir`.
