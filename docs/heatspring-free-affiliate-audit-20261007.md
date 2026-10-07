# HeatSpring : quatre cours gratuits conservent le cookie affilié, commission non vérifiée

Quatre cours gratuits ont reçu `aff_id=9f_wlq` le 7 octobre 2026. Les quatre réponses HTTP créent un cookie portant cet ID. Après deux clics réels, vers le catalogue puis vers un cours payant, le navigateur envoie encore `aff_id=9f_wlq` à HeatSpring. **Le suivi navigateur est confirmé ; l'attribution commerciale reste INCONCLUSIVE.** Aucun CTA SolarRoles n'a été modifié.

| Course | Free status | URL with aff_id accepted | Affiliate cookie/tracking detected | Affiliate ID detected | Attribution persists to paid course | Dashboard click visible | Conclusion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Introduction to Solar PV Design, Installation and Code — PV / NABCEP | FREE affiché | YES | YES | YES | YES — cookie transmis* | NOT TESTABLE | INCONCLUSIVE pour la commission |
| Battery Capacity - The Basis of Storage — Energy Storage | FREE affiché | YES | YES | YES | YES — cookie transmis* | NOT TESTABLE | INCONCLUSIVE pour la commission |
| Qualifying Commercial Solar Leads & Projects — Solar Sales | FREE affiché | YES | YES | YES | YES — cookie transmis* | NOT TESTABLE | INCONCLUSIVE pour la commission |
| Rapid Shutdown Devices and Safety Risks — Solar Safety | FREE affiché | YES | YES | YES | YES — cookie transmis* | NOT TESTABLE | INCONCLUSIVE pour la commission |

\* `YES` désigne ici la persistance de l'identifiant dans les cookies et son envoi dans la requête HTTP du cours payant. L'association serveur à un compte, la validation du clic et l'attribution d'un achat sont **UNKNOWN**. Aucun achat, inscription ou connexion n'a été effectué.

## Quatre liens gratuits répondent HTTP 200 sans redirection

Chaque lien conserve exactement `?aff_id=9f_wlq` dans l'adresse finale. Aucune redirection de la page d'arrivée n'a été observée.

- PV / NABCEP : https://www.heatspring.com/courses/introduction-to-solar-pv-design-installation-and-code?aff_id=9f_wlq
- Energy Storage : https://www.heatspring.com/courses/battery-capacity-the-basis-of-storage?aff_id=9f_wlq
- Solar Sales : https://www.heatspring.com/courses/qualifying-commercial-solar-leads-projects?aff_id=9f_wlq
- Solar Safety : https://www.heatspring.com/courses/rapid-shutdown-devices-and-safety-risks?aff_id=9f_wlq

Les quatre pages affichent `FREE` et un bouton d'accès au cours. L'audit vérifie la gratuité affichée de l'offre, pas le parcours d'inscription ni les éventuelles conditions d'obtention d'un certificat. Le cours PV d'introduction ne constitue pas à lui seul une préparation complète à une certification NABCEP.

## Trois cookies affiliés sont créés dès la réponse serveur

Les headers `Set-Cookie` des quatre documents gratuits contiennent :

```http
aff_id=9f_wlq; path=/; expires=Thu, 07 Oct 2027 … GMT; SameSite=Lax
aff_date=2026-10-07; path=/; expires=Thu, 07 Oct 2027 … GMT; SameSite=Lax
aff_source=; path=/; expires=Thu, 07 Oct 2027 … GMT; SameSite=Lax
```

La date d'expiration est à un an de l'arrivée. Les cookies sont associés à `www.heatspring.com`, avec `Path=/`, et sont accessibles au JavaScript (`HttpOnly=false`). L'ID n'est donc pas seulement présent dans l'URL : HeatSpring le stocke effectivement dans le navigateur.

Un cinquième contexte vierge sert de témoin sur la même page PV sans `aff_id`. Il reçoit `uvid`, `_heatspring_session`, `browser_time_zone` et des cookies Stripe, mais **aucun cookie `aff_*`**. `uvid` seul ne prouve donc pas une affiliation.

Aucun stockage local ou de session affilié n'a été observé. PV et batteries ont un `localStorage` vide à l'arrivée. Sales et Safety stockent des données vidéo Wistia, sans `9f_wlq`. Les `sessionStorage` sont vides ; sur les pages payantes, les clés locales observées concernent également Wistia.

La requête initiale `GET` contient l'ID ; sa réponse installe les cookies. Les requêtes suivantes vers le catalogue et le cours payant transportent ces cookies. Aucun endpoint navigateur distinct explicitement consacré à l'affiliation n'a été identifié dans les captures. Des appels Google Analytics / Google Ads transportent aussi l'URL contenant `aff_id`, notamment dans `dl` : ce sont des mesures de page, pas une preuve autonome de commission.

## Quatre pages payantes reçoivent encore `aff_id=9f_wlq`

Les quatre parcours utilisent les liens existants du site : page gratuite → clic sur Courses → clic sur une offre payante du catalogue. Aucun paramètre affilié n'a été ajouté aux liens intermédiaires ou payants.

| Page gratuite | Cours payant atteint | Prix affiché du cours seul | HTTP | Cookie dans la requête payante |
| --- | --- | --- | --- | --- |
| Introduction to Solar PV Design, Installation and Code | [6-Hour NFPA 70E Electrical Safety Training](https://www.heatspring.com/courses/6-hour-nfpa-70e-electrical-safety-training) | $395 | 200 | `aff_id=9f_wlq` |
| Battery Capacity - The Basis of Storage | [Solar PV Boot Camp + NABCEP PV Associate Exam Prep](https://www.heatspring.com/courses/solar-pv-boot-camp-nabcep-pv-associate-exam-prep) | $895 | 200 | `aff_id=9f_wlq` |
| Qualifying Commercial Solar Leads & Projects | [Solar PV Boot Camp + NABCEP PV Associate Exam Prep](https://www.heatspring.com/courses/solar-pv-boot-camp-nabcep-pv-associate-exam-prep) | $895 | 200 | `aff_id=9f_wlq` |
| Rapid Shutdown Devices and Safety Risks | [Energy Storage Finance](https://www.heatspring.com/courses/energy-storage-finance) | $395 | 200 | `aff_id=9f_wlq` |

Les URLs payantes ne contiennent plus `aff_id`, car les liens du catalogue ne le reprennent pas. Le cookie conserve la valeur et la date d'expiration initiales. Le header `Cookie` de chacune des quatre requêtes de document payant contient :

```http
aff_id=9f_wlq; aff_date=2026-10-07; aff_source=
```

Ces destinations testent la persistance entre pages ; elles ne constituent pas une sélection éditoriale des meilleurs cours payants pour chaque métier. Deux erreurs de contrôleur modal apparaissent par parcours, également présentes dans le témoin. Elles n'empêchent ni les clics ni l'envoi du cookie.

## Le dashboard demande une connexion

`https://www.heatspring.com/my_account`, lié depuis le site, répond HTTP 302 vers `/users/sign_in`, puis HTTP 200 avec une demande de connexion. Aucun compte affilié authentifié n'est accessible dans les contextes de test. **Dashboard click visible : NOT TESTABLE**, et non NO. L'ancienne URL `/account`, encore citée dans la documentation, répond 404.

La [documentation des liens affiliés](https://www.heatspring.com/articles/getting-started-with-tracking-links) prévoit un lien pour toute page HeatSpring. Le [programme officiel](https://www.heatspring.com/partner) prévoit l'attribution d'un achat ultérieur d'un autre cours. Le [guide des rapports](https://www.heatspring.com/articles/running-reports-understanding-the-affiliate-analytics-report) distingue un visiteur identifié par navigateur d'une personne reliée à un compte HeatSpring. Ces règles sont cohérentes avec les cookies observés ; elles ne valident pas à elles seules le statut du compte `9f_wlq` ni une conversion de nos tests.

## Cinq contextes vierges isolent les parcours

Chromium headless via Playwright utilise un contexte non persistant distinct pour chaque cours, plus le témoin. Chaque contexte démarre avec `cookies=[]`, sans import de session ou de stockage. Une autre session vierge vérifie l'accès au compte. Les tests utilisent l'état initial du consentement, sans sélection explicite d'Allow/Deny ; les variantes de consentement, Safari, les appareils physiques et la persistance après fermeture du navigateur n'ont pas été testés.

Le premier passage d'audit a été interrompu parce qu'une capture réseau ne terminait pas. Le passage complet a ensuite été exécuté avec une attente de capture bornée et de nouveaux contextes vierges. Les résultats présentés proviennent de ce passage complet. Ce protocole automatisé ne démontre pas que HeatSpring considère ces visites comme des visiteurs humains valides.

Preuves locales : `.temp/heatspring-audit-20261007/analysis.json`, JSON de chaque cours, `control.json`, HAR, captures HTML et PNG ; `dashboard-current.json` contient la redirection vers le login. Les HAR et JSON bruts comprennent les cookies des sessions isolées et restent locaux. Scripts : `discover.cjs`, `audit.cjs`, `analyze.cjs`, `dashboard-probe.cjs`. Relancer l'audit génère de nouvelles visites affiliées réelles.

**Les pages gratuites peuvent servir de points d'entrée du suivi navigateur pour cet ID dans les conditions testées. La validation commerciale exige encore le rapport du compte affilié et une conversion attribuée. Aucun résultat ne justifie d'annoncer une commission confirmée.**
