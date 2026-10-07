# SolarRoles : URLs canoniques et redirections HTTP

Corrections du 7 octobre 2026, appliquées au checkout local. Aucun déploiement, push, changement de configuration Netlify hors dépôt ou backfill de production n'a été exécuté. Les modifications déjà présentes dans le checkout sont conservées.

## Une seule URL publique pour chaque offre disponible

`https://solarroles.com/jobs/{id}/{canonicalSlug}` est construite par `lib/job-url.ts`. Le helper privilégie toujours le slug persisté ; il utilise le helper de slug existant seulement si la valeur manque. `lib/site-url.ts` fixe l'origine publique à `https://solarroles.com`.

Les cards, homepage, listes et recherches, offres associées, widget, dashboards, partage, API publiques, sitemap et soumissions aux moteurs utilisent ces helpers. Les URLs externes des ATS sont conservées : elles ne doivent pas être remplacées dans les champs servant à la candidature ou à la provenance.

| Requête | Avant, observé en production | Après, observé en production locale |
| --- | --- | --- |
| Offre disponible, slug canonique | 200 ; signaux SEO en `www` | 200 ; canonical, OpenGraph et JobPosting vers la même URL apex |
| `/jobs/{id}` | 200 + meta refresh | 308 ; Location directe vers le slug canonique |
| `/jobs/{id}/old-slug` | 200 + meta refresh | 308 ; Location directe vers le slug canonique |
| Ancienne URL avec `?from=` | URL générée par les cards | 308 sans paramètre ; les nouvelles cards n'émettent plus `from` |
| ID inexistant | Faux 200 avec noindex/NEXT_NOT_FOUND | 404 sur les routes courte et avec slug |
| Offre inactive ou expirée | Disponibilité insuffisamment contrôlée | 404 ; aucune conversion en 410 |
| `/jobs/{id}/go` disponible | 307 externe ; compteur sur chaque GET | 307 externe ; HEAD et préchargements explicites exclus du compteur |
| Sitemaps Blob Oh My Job | Contenu d'un autre site sous SolarRoles | 404 après suppression des rewrites |

Les Locations des redirections de jobs sont relatives. Elles mènent directement au chemin final sur le même hôte, sans saut Next.js intermédiaire. La normalisation HTTP/HTTPS et www/apex reste à Netlify : les contrôles de production avant changement ont confirmé le 301 www vers apex, et deux sauts pour HTTP + www. Cette configuration n'a pas été modifiée.

## Les décisions HTTP précèdent le streaming

`app/jobs/[id]/route.ts` remplace l'ancienne page courte par des handlers GET et HEAD. Ils lisent la disponibilité et le slug en base avant de renvoyer une réponse HTTP 308 ou 404 ; leurs réponses sont `no-store`.

Pour la page avec slug, `generateMetadata` résout l'offre, valide sa disponibilité et décide de la redirection avant de produire les métadonnées. Les boundaries `app/loading.tsx` et `app/jobs/[id]/loading.tsx`, qui permettaient une réponse anticipée en 200, ont été supprimées. Le chargement requis par les pages d'authentification est conservé dans `app/auth/loading.tsx`. Les blocs secondaires de la fiche gardent leurs Suspense.

Les tests GET et HEAD ont confirmé les statuts réels sur le serveur compilé, pas uniquement la navigation dans un navigateur. Une erreur de base remonte comme erreur serveur ; elle n'est pas présentée comme une offre inexistante.

## Le sitemap annonce directement les pages SolarRoles

Le sitemap principal utilise l'origine apex et le slug canonique. Il exclut les offres expirées et inactives. `robots.txt` annonce `https://solarroles.com/sitemap.xml`.

Les deux rewrites Blob dans `next.config.mjs` ont été retirés. `/sitemap-index.xml`, `/sitemap/1.xml` et `/sitemap/24.xml` retournent 404 localement. Le sitemap principal reste servi par Next.js.

Le contrôle exhaustif a aussi trouvé deux anciennes entrées sans page correspondante : `/data/solar-sales-jobs-business-expenses` est remplacée par `/data/solar-desk-job-illusion`, et `/data/solar-installer-salary-rent-report` est retirée. Le canonical du blog « first solar job » a été aligné sur sa véritable route.

## Les rapports gardent leurs données et changent leurs liens

Les 54 liens d'offres du rapport remote travel et de son CSV utilisent maintenant les slugs persistés en base. Les valeurs analytiques ont été conservées. `data/remote-travel/job-links.json` garde les données minimales nécessaires au générateur pour reconstruire ces URLs.

Une citation historique peut concerner une offre désormais expirée et retourner 404. Elle reste une citation de l'offre étudiée ; elle n'est pas redirigée artificiellement vers une autre page.

Les créations employeur stockent le slug et l'URL canonique complète. Une modification d'offre préserve le slug déjà persisté, ou fige le fallback antérieur si nécessaire. Les helpers de lecture normalisent les anciens liens internes sans altérer les URLs externes.

## Aucun backfill n'a été appliqué

`scripts/backfill-canonical-job-urls.ts` est idempotent, en lecture seule par défaut, et exige `--apply` pour écrire. Il limite son périmètre aux offres employeur et aux URLs internes historiques, puis utilise une mise à jour conditionnelle pour éviter d'écraser une édition concurrente.

Le dry-run sur la base configurée a retourné **0 enregistrement concerné, 0 modification**. Il n'y a donc pas de migration nécessaire sur cet état de la base. Commande de diagnostic :

```powershell
npx tsx -r dotenv/config scripts/backfill-canonical-job-urls.ts
```

## Apply conserve sa navigation externe

Le lien Apply reste en `target="_blank"`, avec `nofollow noopener noreferrer`. `/go` envoie `X-Robots-Tag: noindex, nofollow` et `Cache-Control: private, no-store`.

Le compteur ignore HEAD et les requêtes portant explicitement `purpose` ou `sec-purpose` prefetch/prerender. Les GET ordinaires restent comptés pour conserver les activations réelles, y compris clavier et nouvel onglet. Un crawler qui effectue un GET ordinaire peut encore augmenter le compteur : aucune détection fragile par User-Agent n'a été ajoutée. Ce compteur mesure les passages GET, pas des clics humains certifiés.

## Vérifications reproductibles

Six tests automatisés passent : persistance du slug, origine apex, conservation des URLs ATS, disponibilité, handlers réels 308/404 et comportement du compteur Apply. TypeScript passe sur le périmètre modifié. Le lint ciblé passe avec les avertissements existants sur les images et hooks. Le build de production isolé passe ; son typecheck utilise une configuration dédiée au périmètre modifié, pas une affirmation de nettoyage de tout le checkout.

`scripts/check-canonical-job-urls.mts` vérifie trois offres réelles, leurs canonical/OpenGraph/JobPosting et URLs JSON-LD, les anciennes variantes GET/HEAD, les 404, robots, les anciens sitemaps et le HTML SSR de la homepage, liste, recherche, landing PV, widget et rapport. Aucun lien interne court, `?from=` ou `www` n'a été trouvé dans ces pages.

Une offre expirée réelle a été testée sur les deux routes, en GET et HEAD. Aucun enregistrement inactif n'était disponible dans la base au contrôle ; ce cas est couvert par les tests des handlers avec une donnée contrôlée. La base comptait 1 153 offres actives dont la date d'expiration était dépassée ; elles sont désormais indisponibles et exclues des liens de listes et du sitemap.

Le contrôle exhaustif du build final a retourné **1 348/1 348 URLs en HTTP 200 direct**, dont 1 292 offres : **0 redirection, 0 erreur, 0 URL www, 0 HTTP, 0 job sans slug et 0 URL Oh My Job**. Les quatre 500 observés pendant les recompilations du serveur de développement n'ont pas été reproduits sur le build final.

Les captures et résultats sont dans `.temp/seo-url-fix-20261007/`, notamment `final-http-results.json`, `all-sitemap-heads.json`, `backfill-dry-run.json`, `db-snapshot.json` et les logs de build/lint. Ces fichiers restent locaux.

La production n'a pas reçu ces changements. Les nouveaux statuts doivent être confirmés sur Netlify après déploiement ; le script HTTP peut être exécuté avec `https://solarroles.com` comme origine. Les variables locales ont été normalisées ; les valeurs configurées dans le dashboard Netlify n'ont pas été éditées.

## 733 offres supplémentaires après retrait de la liste positive d'ATS

Le contrôle complémentaire du 7 octobre, vers 15 h 14 à Paris, a exécuté le vrai générateur après élargissement des sources. Il produit **2 081 URLs, dont 2 025 offres**, au lieu de 1 348 URLs et 1 292 offres lors du contrôle HTTP précédent.

`lib/job-indexing.ts` centralise l'exclusion de `adzuna`, `jooble`, `careerjet`, `lensa` et `whatjobs`. Le sitemap et les métadonnées des fiches partagent cette règle. Toutes les autres sources peuvent entrer dans le sitemap, y compris les futurs connecteurs, sous réserve des filtres inchangés : active, non expirée et publiée dans les 30 derniers jours, avec fallback sur fetchedAt seulement si postedAt manque.

La comparaison des entrées générées avec chaque offre en base ne trouve aucun écart d'inclusion. Les 733 offres ajoutées viennent de successfactors, jazzhr, paylocity, hrmdirect, breezy, qcells, rippling, ukg, icims, adp, first-party-careers, paycom et saashr. Le contrôle structurel ne trouve aucun www, HTTP, paramètre ou job sans slug. Résultats : `.temp/seo-url-fix-20261007/expanded-sitemap-results.json`.

Les 2 081 nouvelles entrées ont été validées par exécution du générateur ; le contrôle HTTP exhaustif de 1 348 URLs décrit plus haut reste celui de la sélection précédente. Aucun déploiement ni changement de données n'a été effectué.

## Fichiers du chantier

La liste ci-dessous distingue le chantier SEO des autres modifications présentes dans le checkout. Les fichiers de configuration d'environnement sont mentionnés sans exposer leur contenu.
- `.env`
- `.env.example`
- `.env.local`
- `app/admin/jobs/admin-jobs-dashboard.tsx`
- `app/admin/jobs/page.tsx`
- `app/api/cron/indexnow/route.ts`
- `app/api/cron/mark-expired-jobs/route.ts`
- `app/api/employer/jobs/[id]/route.ts`
- `app/api/employer/jobs/route.ts`
- `app/api/jobs/[id]/route.ts`
- `app/api/saved-jobs/route.ts`
- `app/auth/loading.tsx`
- `app/bess-technician-jobs/page.tsx`
- `app/blog/become-solar-installer-no-experience/page.tsx`
- `app/blog/how-to-land-first-solar-job/page.tsx`
- `app/blog/layout.tsx`
- `app/blog/what-does-a-solar-installer-do/page.tsx`
- `app/ccpa/page.tsx`
- `app/certifications/[slug]/page.tsx`
- `app/certifications/page.tsx`
- `app/contact/layout.tsx`
- `app/cookie-policy/page.tsx`
- `app/dashboard/employer/employer-dashboard.tsx`
- `app/dashboard/employer/page.tsx`
- `app/data/battery-storage-leads-segment-specific-solar-hiring/page.tsx`
- `app/data/page.tsx`
- `app/data/remote-solar-jobs-travel-requirements/page.tsx`
- `app/data/salaries/[title]/page.tsx`
- `app/data/solar-desk-job-illusion/page.tsx`
- `app/data/states/[state]/page.tsx`
- `app/jobs/[id]/[slug]/page.tsx`
- `app/jobs/[id]/loading.tsx`
- `app/jobs/[id]/page.tsx`
- `app/jobs/[id]/route.ts`
- `app/layout.tsx`
- `app/lead-solar-installer-jobs/page.tsx`
- `app/loading.tsx`
- `app/page.tsx`
- `app/paycheck-calculator/california/page.tsx`
- `app/paycheck-calculator/illinois/page.tsx`
- `app/paycheck-calculator/maryland/page.tsx`
- `app/paycheck-calculator/michigan/page.tsx`
- `app/paycheck-calculator/nevada/page.tsx`
- `app/paycheck-calculator/new-york/page.tsx`
- `app/paycheck-calculator/ohio/page.tsx`
- `app/paycheck-calculator/page.tsx`
- `app/paycheck-calculator/utah/page.tsx`
- `app/paycheck-calculator/virginia/page.tsx`
- `app/paycheck-calculator/washington/page.tsx`
- `app/privacy/layout.tsx`
- `app/privacy/page.tsx`
- `app/resources/do-you-need-to-be-an-electrician-for-bess/page.tsx`
- `app/resources/how-to-become-a-solar-installer/page.tsx`
- `app/resources/how-to-get-a-solar-apprenticeship/page.tsx`
- `app/resources/how-to-get-nabcep-certified/page.tsx`
- `app/resources/manufacturer-certifications-tesla-enphase-solaredge/page.tsx`
- `app/resources/nabcep-board-eligible-status/page.tsx`
- `app/resources/nabcep-project-credits-explained/page.tsx`
- `app/resources/nabcep-pvip-pass-rate/page.tsx`
- `app/resources/nabcep-pvis-vs-pvip/page.tsx`
- `app/resources/nabcep-training-providers-compared/page.tsx`
- `app/resources/nabcep-vs-eta-vs-state-licenses/page.tsx`
- `app/resources/osha-safety-guide-solar-installers/page.tsx`
- `app/resources/page.tsx`
- `app/resources/solar-certifications-by-job-role/page.tsx`
- `app/resources/solar-dc-safety-for-electricians/page.tsx`
- `app/resources/solar-engineer-jobs/page.tsx`
- `app/resources/solar-installer-apprenticeship-programs/page.tsx`
- `app/resources/solar-installer-certification/page.tsx`
- `app/resources/solar-installer-vs-electrician-texas/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/solar-electrician-jobs/page.tsx`
- `app/solar-engineer-jobs/page.tsx`
- `app/solar-jobs-no-experience/page.tsx`
- `app/solar-pv-installer-jobs/page.tsx`
- `app/solar-sales-jobs/page.tsx`
- `app/solar-technician-jobs/page.tsx`
- `app/terms/layout.tsx`
- `app/terms/page.tsx`
- `app/tools/solar-apprenticeship-hours-checker/EmbedCode.tsx`
- `app/tools/solar-apprenticeship-hours-checker/solar-hours-checker/page.tsx`
- `app/tools/solar-repowering-calculator/page.tsx`
- `app/workforce-resources/entry-level-solar-jobs/page.tsx`
- `app/workforce-resources/jobs-widget/WidgetConfigurator.tsx`
- `app/workforce-resources/jobs-widget/page.tsx`
- `app/workforce-resources/jobs-widget/privacy/page.tsx`
- `app/workforce-resources/page.tsx`
- `app/workforce-resources/solar-apprenticeship-licensing/page.tsx`
- `app/workforce-resources/solar-career-pathways/page.tsx`
- `app/workforce-resources/solar-employers-hiring/page.tsx`
- `app/workforce-resources/solar-job-market-by-state/page.tsx`
- `app/workforce-resources/solar-salary-explorer/page.tsx`
- `app/workforce-resources/solar-skills-certifications/page.tsx`
- `components/InfiniteJobList.tsx`
- `components/JobCard.tsx`
- `components/data/SolarMarketSegmentsReport.tsx`
- `data/remote-travel/job-links.json`
- `data/remote-travel/report.json`
- `lib/authRedirect.ts`
- `lib/buildBreadcrumbSchema.ts`
- `lib/careerjet.ts`
- `lib/greenhouse.ts`
- `lib/indexnow.ts`
- `lib/job-availability.ts`
- `lib/job-indexing.ts`
- `lib/job-db.ts`
- `lib/job-url.ts`
- `lib/jobDetail.ts`
- `lib/jobs.ts`
- `lib/jobsQuery.ts`
- `lib/merged-search.ts`
- `lib/similarJobs.ts`
- `lib/site-url.ts`
- `next.config.mjs`
- `public/data/remote-solar-travel-2026-09-06.csv`
- `scripts/backfill-canonical-job-urls.ts`
- `scripts/build-remote-travel-report.mjs`
- `scripts/check-canonical-job-urls.mts`
- `scripts/check-remote-travel-page.mjs`
- `scripts/submit-google-indexing.ts`
- `scripts/submit-indexnow.ts`
- `tests/canonical-job-urls.test.ts`
