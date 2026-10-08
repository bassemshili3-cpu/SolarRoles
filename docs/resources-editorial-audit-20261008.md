# Audit éditorial Resources — 8 octobre 2026

Les 19 guides demandés ont été repris individuellement. Les corrections utilisent les paragraphes, listes et tableaux existants ; aucun composant éditorial partagé n’a été créé. Travail local, sans déploiement. Les modifications présentes dans le checkout avant cette passe ont été conservées.

## Pages modifiées

Chaque chemin ci-dessous se trouve sous `/resources/` ; son implémentation est `app/resources/<chemin>/page.tsx`.

| Chemin | Correction principale |
| --- | --- |
| `solar-engineer-jobs` | Diplômes, parcours technicien/électricien, PE/EIT et logiciels contextualisés par métier ; distinction entre préférence de recrutement et autorisation professionnelle. |
| `solar-certifications-by-job-role` | Moment utile pour obtenir le credential, formation employeur et conditions de programme ; aucune nouvelle colonne commerciale. |
| `how-to-become-a-solar-installer` | Embauche comme helper/trainee, formation au poste, apprentissage et financement workforce avant certification éventuelle. |
| `solar-installer-vs-electrician-texas` | Licence apprentice, supervision et contractor ; différence entre les 7 000 heures permettant de demander l’examen et les 8 000 heures de la licence journeyman. |
| `nabcep-training-providers-compared` | Comparaison neutre des formats, heures et frais inclus ; méthode explicitée ; retrait des tarifs non vérifiables et des classements implicites. |
| `nabcep-vs-eta-vs-state-licenses` | Premier emploi, travaux réglementés, progression et fabricant distingués ; exigences ETA PVI1/PV2 séparées. |
| `manufacturer-certifications-tesla-enphase-solaredge` | Apprentissage en ligne Enphase/SolarEdge, compte individuel, accès aux outils et agrément de l’entreprise distingués. |
| `osha-safety-guide-solar-installers` | Publics OSHA 10/30, Construction/General Industry, fournisseurs autorisés, formation propre aux tâches et risques du chantier. |
| `solar-dc-safety-for-electricians` | Risques DC et qualification pour les tâches ; NFPA 70E, cours, autorisation électrique et NABCEP ne sont pas interchangeables. |
| `solar-installer-apprenticeship-programs` | Recherche par métier et sponsor, progression salariale, dépenses annexes et preuve documentaire ; absence d’ouverture garantie. |
| `how-to-get-a-solar-apprenticeship` | Documents d’admission, recherche des offres, préparation gratuite algèbre/lecture ; critères locaux, sans seuil national inventé. |
| `nabcep-pvis-vs-pvip` | Choix fondé sur les responsabilités ; frais NABCEP séparés des cours ; aucune obligation d’acheter un bundle. |
| `nabcep-pvip-pass-rate` | Retrait du taux de réussite national non établi et du volume d’étude non étayé ; exercice gratuit et limites précisés. |
| `nabcep-board-eligible-status` | Statut temporaire, formulation exacte sur le CV, preuves et échéance ; assemblage de cours éligibles au lieu d’un bundle obligatoire. |
| `nabcep-project-credits-explained` | Dossier par projet, capacité, dates, responsabilités, permis/inspection et contact du vérificateur. |
| `solar-sales-1099-vs-w2-pay` | Commissions acquises/payables, jalons, annulations, reprises, leads et dépenses ; suppression de la supériorité automatique du 1099. |
| `solar-installer-certification` | Tableau révisé : carte OSHA, licence, credential, frais d’examen et formation distincts ; liens officiels à la place des achats. |
| `how-to-get-nabcep-certified` | Parcours d’éligibilité, frais, examen, éducation admissible et préparation facultative séparés. |
| `do-you-need-to-be-an-electrician-for-bess` | Formation électrique, sécurité, qualification pour les tâches, apprentissage fabricant et expérience ; ESIP présenté au stade approprié. |

Deux illustrations éditoriales ont été retirées de ces pages : la progression trop prescriptive des certifications d’installateur et l’opposition trop générale des rémunérations 1099/W2. Le composant d’illustration partagé reste inchangé.

## HeatSpring : inventaire complet après modification

Après la QA ciblée complémentaire, la recherche dans tout `app/resources` et le rendu des pages identifient cinq liens sortants HeatSpring : deux exercices gratuits, deux cours gratuits et une référence neutre dans le comparatif. Aucun CTA promotionnel vers une formation payante ne subsiste.

| Page | Ancre exacte | Destination exacte | Accès et tracking |
| --- | --- | --- | --- |
| `how-to-get-nabcep-certified` | free PV Associate practice exam | https://www.heatspring.com/courses/nabcep-pv-associate-pva-practice-exam?aff_id=9f_wlq | Gratuit, inscription à un compte ; aucune carte bancaire demandée pour le contenu. `AffiliateLink`, `offerName=nabcep_pva_free_practice`. |
| `nabcep-pvip-pass-rate` | free PV certification practice exam | https://www.heatspring.com/courses/free-nabcep-pv-certification-practice-exam?aff_id=9f_wlq | Gratuit, inscription à un compte ; aucune carte bancaire demandée pour le contenu. `AffiliateLink`, `offerName=nabcep_pv_certification_free_practice` : ressource destinée à PVIP, PVDS et PVIS. |
| `how-to-become-a-solar-installer` | Fundamentals: Solar PV | https://www.heatspring.com/courses/fundamentals-solar-pv?aff_id=9f_wlq | Cours gratuit, compte sans carte bancaire ; certificat de réalisation optionnel payant. `AffiliateLink`, `offerName=solar_pv_fundamentals_free`. |
| `solar-dc-safety-for-electricians` | free lesson on rapid-shutdown devices | https://www.heatspring.com/courses/rapid-shutdown-devices-and-safety-risks?aff_id=9f_wlq | Cours gratuit, compte sans carte bancaire ; certificat de réalisation optionnel payant. `AffiliateLink`, `offerName=rapid_shutdown_safety_free`. |
| `nabcep-training-providers-compared` | HeatSpring program information | https://www.heatspring.com | Référence au fournisseur, non affiliée. Le site vend aussi des formations : ce lien n’est pas présenté comme une ressource gratuite. Même présentation que les autres fournisseurs. |

Les deux exercices ne délivrent pas un credential NABCEP et ne remplacent pas l’éducation requise. Leur certificat de réalisation optionnel relève d’un abonnement payant ; cette limite figure dans le texte.

Vérification directe dans deux contextes navigateur isolés : HTTP 200, affichage FREE et « No credit card, just an account », création des cookies `aff_id`, `aff_date`, `aff_source`, valeur `aff_id=9f_wlq` et persistance après une requête au catalogue. Aucun compte créé, aucune inscription effectuée, aucun achat. Ces résultats vérifient le tracking navigateur, pas une commission ni une attribution dans le tableau de bord partenaire.

Le composant `components/click_affiliate_link.tsx` est conservé : événement GA `click_affiliate_link`, paramètres `offer_name`, `link_url`, `page_path`, ouverture dans un nouvel onglet et `rel="nofollow sponsored noopener noreferrer"`. Les **quatre gestionnaires de clic** ont été exécutés avec un collecteur de test, à partir des propriétés des composants réellement retournés par les quatre pages. Chaque clic produit exactement un événement avec les valeurs ci-dessous. La réception effective d’un événement par GA en production n’a pas été testée.

| `offer_name` | `link_url` | `page_path` |
| --- | --- | --- |
| `nabcep_pva_free_practice` | `https://www.heatspring.com/courses/nabcep-pv-associate-pva-practice-exam?aff_id=9f_wlq` | `/resources/how-to-get-nabcep-certified` |
| `nabcep_pv_certification_free_practice` | `https://www.heatspring.com/courses/free-nabcep-pv-certification-practice-exam?aff_id=9f_wlq` | `/resources/nabcep-pvip-pass-rate` |
| `solar_pv_fundamentals_free` | `https://www.heatspring.com/courses/fundamentals-solar-pv?aff_id=9f_wlq` | `/resources/how-to-become-a-solar-installer` |
| `rapid_shutdown_safety_free` | `https://www.heatspring.com/courses/rapid-shutdown-devices-and-safety-risks?aff_id=9f_wlq` | `/resources/solar-dc-safety-for-electricians` |

Preuve locale : `.temp/resources-editorial-20261008/final-verification/affiliate-click-results.json`. Le script `verify-clicks.cjs` du même dossier exécute le véritable `onClick` de `AffiliateLink` avec un collecteur `window.gtag`.

### Liens payants supprimés

13 occurrences affiliées présentes avant cette passe ont disparu :

| Page | Occurrences supprimées |
| --- | --- |
| `how-to-become-a-solar-installer` | 1 : préparation PVA |
| `how-to-get-nabcep-certified` | 3 : noms PVA/PVIP/PVIS liés à des cours commerciaux |
| `nabcep-pvip-pass-rate` | 1 : préparation PVIP |
| `nabcep-board-eligible-status` | 1 : bundle PVIP |
| `nabcep-project-credits-explained` | 1 : préparation PVIP |
| `nabcep-pvis-vs-pvip` | 2 : préparations PVIS/PVIP |
| `solar-installer-certification` | 4 : OSHA 10, OSHA 30, PVA, PVIP |

La plupart ne sont pas remplacées par un lien HeatSpring. Les noms de credentials renvoient aux pages internes ou aux organismes officiels.

## Ressources officielles intégrées

Les liens suivants permettent de consulter gratuitement les règles, annuaires ou supports. Leur consultation gratuite ne signifie pas que l’examen, la licence ou chaque formation répertoriée soit gratuit.

- NABCEP : [manuels et références d’examen](https://www.nabcep.org/resources/), [Certification Handbook](https://www.nabcep.org/resource/certification-handbook/), [frais officiels](https://www.nabcep.org/certifications/nabcep-fees/), [Associate](https://www.nabcep.org/certifications/associate-program/), [Board Eligible](https://www.nabcep.org/certifications/board-eligible-pv-installation-professional/) et [catalogue de cours](https://coursecatalog.nabcep.org/).
- OSHA : [Outreach](https://www.osha.gov/training/outreach), [fournisseurs autorisés en ligne](https://www.osha.gov/training/outreach/training-providers), [recherche de formateur](https://www.osha.gov/training/outreach/find-a-trainer), [risques électriques du solaire](https://www.osha.gov/green-jobs/solar/electrical), [chutes](https://www.osha.gov/green-jobs/solar/falls) et [formation électrique 1910.332](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.332).
- Texas TDLR : [Electrical Apprentice](https://www.tdlr.texas.gov/electricians/apply/individuals/apprentice-electrician.htm) et [Journeyman Electrician](https://www.tdlr.texas.gov/electricians/apply/individuals/journeyman-electrician.htm).
- Fabricants : [Enphase University](https://university.enphase.com/), [vidéos publiques Enphase](https://enphase.com/installers/training/videos), [SolarEdge training](https://www.solaredge.com/us/installers/training) et [conditions du réseau Tesla](https://www.tesla.com/partner-with-tesla). Les accès installateur et agréments d’entreprise restent distincts des cours.
- Apprentissage : [Apprenticeship Job Finder](https://www.apprenticeship.gov/apprenticeship-job-finder), [contacts des agences](https://www.apprenticeship.gov/contact-us), [annuaire electrical training ALLIANCE](https://www.electricaltrainingalliance.org/locateaTrainingCenter) et [exemples officiels de test](https://www.electricaltrainingalliance.org/SamplePage/PreparingfortheTest).
- Financement : [programmes WIOA](https://www.careeronestop.org/LocalHelp/EmploymentAndTraining/find-WIOA-training-programs.aspx), [American Job Centers](https://www.careeronestop.org/LocalHelp/AmericanJobCenters/american-job-centers.aspx) et [information financement SEI](https://www.solarenergy.org/support/tuition-payments/). Éligibilité individuelle à confirmer.
- Autres références : [ETA renewable energy](https://www.etai.org/renewable_energy.html), [NCEES licensure](https://ncees.org/licensure/), [IRS employee/contractor](https://www.irs.gov/taxtopics/tc762) et [IRS self-employed](https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center).
- Support pédagogique complémentaire : [algèbre Khan Academy](https://www.khanacademy.org/math/algebra), sans promesse de réussite au test d’apprentissage.

## Affirmations écartées ou limitées

- Aucun taux national de réussite PVIP retenu : le chiffre de 60–70 % n’avait pas de justification officielle suffisante. Un taux annoncé par un fournisseur ne devient pas un taux national.
- Pas de classement par prix des quatre fournisseurs : tarifs actuels et inclusions insuffisamment comparables. Les frais NABCEP vérifiés sont séparés de la scolarité.
- Retrait des promesses générales de hausse de salaire après certification, du volume universel de préparation et des durées/prix de formation fabricant non établis.
- Pas de frais de licence apprentice Texas ajoutés sur la base d’une présentation ambiguë du tarif ; lien TDLR conservé.
- Pas de seuil national de test JATC, de financement garanti, de poste d’apprenti garanti, ni d’accès individuel garanti à tous les outils installateur.
- Pas de généralisation d’une règle électrique d’un État à tout le pays. Les formations sécurité et fabricant ne sont pas présentées comme une autorisation juridique d’effectuer tous les travaux.

## Editorial QA

Benchmarks effectivement lus : [EnergySage, Choosing a Solar Installer](https://www.energysage.com/solar/choosing-solar-installer/) pour l’explication pratique des qualifications, et [Canary Media, Illinois’ workforce training](https://www.canarymedia.com/articles/solar/illinois-ceja-energy-workforce-hub-alton-equity) pour l’intégration des parcours de formation dans des faits concrets. Relecture des textes après modification, puis retour aux benchmarks. Aucune formulation copiée.

Trois réécritures illustrent la passe :

1. **Entrée dans le métier.** L’ouverture abstraite « Four routes lead into solar installation. Your background and the time you can spend before earning determine which one fits. » devient « Employers recruit entry-level installers as well as people who already have construction or electrical experience. A training program is one route in; a job that includes supervised training is another. » Le paragraphe suivant précise la supervision et les questions à poser avant la première prise de poste.
2. **Board Eligible.** L’argument commercial « One package covers the 58-hour advanced training requirement. » est supprimé. Le passage explique désormais : « The 58-hour requirement can be assembled from eligible courses rather than purchased as one bundle. » Le catalogue et les catégories d’heures donnent au lecteur un moyen de vérifier son dossier.
3. **Rémunération commerciale.** La promesse qu’un commercial 1099 gagnera presque toujours davantage est remplacée par « A higher commission percentage does not establish higher take-home pay. » La suite nomme les facteurs à comparer : affaires éligibles, annulations, coût des leads et frais supportés par le commercial.

Les ajouts n’utilisent pas un encadré ou une conclusion reproduits sur les 19 pages. Leurs longueurs et fonctions suivent le contenu local : documents de projet, conditions d’accès fabricant, tâches électriques, admission ou commissions.

## Vérifications techniques

- ESLint sur `app/resources` : réussi.
- TypeScript ciblé sur les ressources et leurs imports : réussi.
- `git diff --check` sur les 19 fichiers modifiés : réussi.
- Rendu des 19 composants : un H1 par page, identifiants uniques, ancres internes valides, JSON-LD lisible, nombre de scripts JSON-LD conservé, URLs canonical/Open Graph inchangées par rapport aux copies d’avant modification.
- 38 comparaisons navigateur avant/après à 375 et 1 280 px : aucun nouveau débordement horizontal ; captures de la page des certifications d’installateur.
- Recherche dans tout `app/resources` après la QA complémentaire : quatre liens affiliés gratuits, une référence fournisseur neutre, aucun ancien lien affilié payant restant.

Les rendus locaux utilisent les composants React et le CSS du site avec des polices de remplacement. Ils ne constituent pas un test du serveur Next.js en production ; aucun build global ni déploiement n’a été effectué. Les 18 dates de modification éditoriales existantes ont été actualisées au 8 octobre 2026. La vérification finale ajoute également `dateModified: '2026-10-08'` au schéma Article de `solar-sales-1099-vs-w2-pay`, dont la mise à jour éditoriale est substantielle.

Les copies avant modification, rendus, captures et résultats JSON sont dans `.temp/resources-editorial-20261008/` : `render-results.json`, `browser-results.json`, `heatspring-inventory.json` et `free-verification.json`.

## QA ciblée complémentaire

Cette seconde passe compare seulement les ajouts et réécritures de la première passe aux copies d’origine, sur les 19 pages. Les extraits comparés et les copies avant cette QA sont conservés dans `.temp/resources-editorial-20261008/targeted-qa/`.

### Benchmark élargi et retouches

Lectures supplémentaires : [Solar Power World, programmes d’apprentissage internes](https://www.solarpowerworldonline.com/2024/04/in-house-apprenticeship-programs-help-contractors-capitalize-ira-tax-credits/) (texte indexé consulté, ouverture directe indisponible), [pv magazine USA, préapprentissage à Chicago](https://pv-magazine-usa.com/2025/01/21/for-marginalized-communities-in-chicago-partnership-brings-solar-opportunity/), [Utility Dive, apprentissage dans la fabrication de batteries](https://www.utilitydive.com/news/energy-labor-department-apprenticeship-battery-manufacturing-workforce-development/712712/) et [Heatmap, mobilité des ouvriers entre chantiers énergétiques et data centers](https://heatmap.news/energy/data-centers-labor). Comparaison de l’enchaînement des faits, des exemples et de la longueur des phrases ; aucune formulation copiée, aucune actualisation réglementaire tirée de ces articles anciens.

Trois retouches de style seulement :

- `manufacturer-certifications-tesla-enphase-solaredge` : retrait de « without promising access to every installer tool », commentaire sur la rédaction plutôt qu’information sur l’utilisation des vidéos ; les conditions d’accès sont déjà expliquées juste avant.
- `solar-certifications-by-job-role` : retrait de la phrase décrivant ce que le tableau cherche à ne pas laisser entendre. Les explications concrètes sur la prise en charge et le moment de la formation restent présentes.
- `nabcep-training-providers-compared` : retrait de la formule circulaire « A paid prep course is an optional purchase unless its education is the route you choose to satisfy an unmet requirement. » Les catégories de cours et d’heures admissibles sont déjà expliquées.

Les 13 autres pages n’ont reçu aucune retouche durant cette QA. Trois pages ont reçu les ajustements de ressources détaillés ci-dessous : entrée dans le métier, sécurité DC et exercice PVIP.

### Périmètre de l’exercice présent sur PVIP Pass Rate

Le [descriptif public](https://www.heatspring.com/courses/free-nabcep-pv-certification-practice-exam) nomme expressément PVIP, PVDS et PVIS. Le plan annonce 70 questions de Sean White et un travail avec le NEC. Il s’agit d’une ressource de préparation aux certifications professionnelles PV, et non du questionnaire PVA, qui a sa propre page.

Le lien est conservé. SolarRoles indique maintenant les trois credentials visés et précise que l’exercice n’est ni un examen officiel NABCEP ni un questionnaire exclusivement PVIP. L’identifiant analytics devient `nabcep_pv_certification_free_practice`, à la place de `nabcep_pvip_free_practice` ; le nom de l’événement et ses autres paramètres restent inchangés.

Cette conclusion repose sur le descriptif et le plan publics, pas sur une inspection des 70 questions derrière inscription. Aucune validation officielle, couverture exhaustive du Job Task Analysis ou équivalence avec l’examen réel n’est affirmée. La phrase commerciale de HeatSpring sur le nombre de candidats qui échouent n’est pas reprise.

### Couverture des cours gratuits

Recherche dans le catalogue gratuit et les pages publiques, puis vérification navigateur de huit candidats supplémentaires et des deux exercices existants. Les dix pages répondent HTTP 200 et affichent un accès gratuit avec compte, sans carte bancaire. Aucun compte créé ni inscription effectuée. Pour les deux nouveaux liens affiliés retenus, le cookie `aff_id=9f_wlq` est créé et persiste après une requête au catalogue. Résultats : `targeted-qa/candidate-verification.json`.

| Candidat supplémentaire | Contenu observé dans le descriptif et le plan | Correspondance et décision |
| --- | --- | --- |
| [Fundamentals: Solar PV](https://www.heatspring.com/courses/fundamentals-solar-pv) | Grandeurs électriques, composants, types de systèmes, sécurité et pratiques d’installation. | **Retenu** dans le paragraphe sur les compétences d’entrée du guide installateur. Une introduction technique utile à un débutant même sans affiliation ; aucune présentation comme formation pratique ou credential. |
| [Rapid Shutdown Devices and Safety Risks](https://www.heatspring.com/courses/rapid-shutdown-devices-and-safety-risks) | Fonction des dispositifs, défaillances sur toitures commerciales, historique du code, exploitation et conception. | **Retenu** dans le passage du guide DC qui mentionne déjà cet équipement. Complément technique précis, sans remplacer les consignes fabricant et la formation de l’employeur. Aucune reprise de la statistique commerciale sur les incendies. |
| [Introduction to Solar PV Design, Installation and Code](https://www.heatspring.com/courses/introduction-to-solar-pv-design-installation-and-code) | Survol de l’électricité, du PV, de l’installation, de la sécurité et de la préparation NABCEP. | Non ajouté : recoupe l’introduction Fundamentals retenue ; pas besoin d’un second cours général sur le même passage. |
| [Free Onboarding Bundle for New Residential Solar Installers](https://www.heatspring.com/courses/free-onboarding-bundle-for-new-residential-solar-installers) | Quatre cours : introduction PV, silicium, montage IronRidge sur bardeaux et capacité des batteries. | Non ajouté : ensemble plus large et partiellement spécifique à un fabricant ; fait doublon avec la ressource d’entrée retenue. |
| [Intro to Safety for Electricians](https://www.heatspring.com/courses/intro-to-safety-for-electricians-preview-lesson-nccer-level-1-apprenticeship) | Présentation générale OSHA, NFPA 70E et NEC ; extrait d’un programme d’apprentissage. | Non ajouté aux guides OSHA/DC : les sources officielles traitent déjà les obligations ; le cours rapid shutdown apporte un complément PV plus précis. |
| [Understanding Residential and Commercial Energy Storage](https://www.heatspring.com/courses/understanding-residential-and-commercial-energy-storage) | Batteries, configurations, choix d’équipement et exercice de profil de charge client. | Non ajouté au guide BESS : utile pour découvrir les systèmes, mais ne traite pas directement les conditions d’entrée, la licence ou la qualification du technicien qui sont le sujet de cette page. |
| [Qualifying Commercial Solar Leads & Projects](https://www.heatspring.com/courses/qualifying-commercial-solar-leads-projects) | Qualification de prospects C&I, informations client, dimensionnement et rentabilité. | Non ajouté à 1099/W2 : ne répond pas à la comparaison des commissions, charges et statuts. |
| [Utility-Scale Solar Design Overview](https://www.heatspring.com/courses/utility-scale-solar-design-overview) | Implantation au sol, structures, conception électrique et étapes du projet jusqu’au raccordement. | Non ajouté au panorama des métiers d’ingénieur : formation sur une spécialité, sans réponse directe aux prérequis des différents postes présentés. |

Les deux exercices précédents restent retenus : PVA dans le guide NABCEP, et préparation PVIP/PVDS/PVIS dans le guide PVIP. Les nouveaux liens sont intégrés aux paragraphes existants, sans nouvelle section ni card. Les mentions d’affiliation utilisent la ligne de métadonnées existante.

### Dates

**Aucune date restaurée.** Les 18 pages comportant déjà `dateModified` conservent `2026-10-08`. Les corrections de fond justifient cette date, y compris sur le guide DC où les trois paragraphes réécrits distinguent désormais formation, qualification pour les tâches et autorisation juridique. Les autres motifs figurent dans le tableau page par page.

La page 1099/W2 utilise un schéma `Article` autonome depuis sa création dans le commit `eb493aa` du 8 août 2026. Ce schéma ne contenait aucune date ; la recherche dans l’historique (`git log --follow -S dateModified`) ne trouve ni ajout ni suppression de ce champ. L’historique ne documente pas la raison de cette omission. Le fait que l’objet Article soit autonome, plutôt qu’inclus dans un `@graph`, ne justifie pas l’absence de `dateModified`.

La vérification finale ajoute donc uniquement `dateModified: '2026-10-08'` à cet objet Article : la page a été substantiellement révisée à cette date. Les 19 guides ont désormais ce champ. Aucun texte éditorial, lien ou CTA n’est modifié pendant cette vérification finale.
