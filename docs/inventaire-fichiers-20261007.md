# Inventaire des fichiers du 7 octobre 2026

210 fichiers de code, configuration, documentation ou données figurent dans cet inventaire SolarRoles. Périmètre : checkout local, journée de Paris.

La liste croise les changements Git actuels avec les dates de modification et le manifeste du chantier SEO de cette conversation. Une date de modification ne prouve pas l’auteur ni le moment de la première édition. Les fichiers signalés « modification du jour » peuvent contenir des changements plus anciens ; les chantiers sont regroupés par leur fonction principale, avec des recouvrements possibles.

Les archives, logs, builds et captures dans `.tools/` et `.temp/`, ainsi que les corpus Wayback automatiques, ne sont pas détaillés ici. Les secrets des fichiers d’environnement ne sont pas reproduits. 523 autres entrées locales antérieures ou non datables sont exclues du périmètre du jour.

Commits trouvés sur la branche courante aujourd’hui : aucun.

| Chantier principal | Fichiers |
| --- | ---: |
| Autres changements locaux | 9 |
| Certifications et affiliation | 4 |
| Comptes, navigation et formulaires | 42 |
| Offres : salaires, données et filtres | 9 |
| SEO : URLs, redirections, sitemap et liens | 124 |
| Wayback : collecteurs et supervision | 8 |
| WhatJobs : suivi interne, flux et audits | 14 |

## Autres changements locaux

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `app/embed/solar-jobs/page.tsx` | Modifié | Modification du jour |
| `app/jobs/[id]/go/route.ts` | Modifié | Modification du jour |
| `components/SavedJobCards.tsx` | Nouveau, non suivi | Modification du jour |
| `components/VerificationFlash.tsx` | Nouveau, non suivi | Modification du jour |
| `lib/ats/types.ts` | Modifié | Modification du jour |
| `lib/requestThrottle.ts` | Nouveau, non suivi | Modification du jour |
| `prisma/schema.prisma` | Modifié | Modification du jour |
| `scripts/seed-solar-jobs.ts` | Modifié | Modification du jour |
| `tsconfig.json` | Modifié | Modification du jour |

## Certifications et affiliation

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `app/certifications/[slug]/certifications-data.ts` | Modifié | Modification du jour |
| `components/CertificationBanner.tsx` | Modifié | Modification du jour |
| `docs/certifications-editorial-audit-20261007.md` | Nouveau, non suivi | Modification du jour |
| `docs/heatspring-free-affiliate-audit-20261007.md` | Nouveau, non suivi | Modification du jour |

## Comptes, navigation et formulaires

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `app/api/account-consent/route.ts` | Nouveau, non suivi | Modification du jour |
| `app/api/auth/forgot-password/route.ts` | Nouveau, non suivi | Modification du jour |
| `app/api/auth/redirect/route.ts` | Modifié | Modification du jour |
| `app/api/auth/reset-password/route.ts` | Nouveau, non suivi | Modification du jour |
| `app/api/auth/signup/route.ts` | Nouveau, non suivi | Modification du jour |
| `app/api/auth/verification-flash/route.ts` | Nouveau, non suivi | Modification du jour |
| `app/api/contact/route.ts` | Modifié | Modification du jour |
| `app/api/stripe/checkout/route.ts` | Modifié | Modification du jour |
| `app/auth/callback/route.ts` | Modifié | Modification du jour |
| `app/auth/consent/AccountConsentForm.tsx` | Nouveau, non suivi | Modification du jour |
| `app/auth/consent/page.tsx` | Nouveau, non suivi | Modification du jour |
| `app/auth/forgot-password/page.tsx` | Nouveau, non suivi | Modification du jour |
| `app/auth/login/page.tsx` | Modifié | Modification du jour |
| `app/auth/reset-password/page.tsx` | Nouveau, non suivi | Modification du jour |
| `app/auth/reset-password/reset-password-form.tsx` | Nouveau, non suivi | Modification du jour |
| `app/auth/signup/page.tsx` | Modifié | Modification du jour |
| `app/contact/page.tsx` | Modifié | Modification du jour |
| `app/dashboard/candidate/layout.tsx` | Nouveau, non suivi | Modification du jour |
| `app/dashboard/candidate/page.tsx` | Modifié | Modification du jour |
| `app/dashboard/employer/[id]/edit/page.tsx` | Modifié | Modification du jour |
| `app/dashboard/employer/job-form.tsx` | Modifié | Modification du jour |
| `app/dashboard/employer/layout.tsx` | Nouveau, non suivi | Modification du jour |
| `app/dashboard/layout.tsx` | Nouveau, non suivi | Modification du jour |
| `app/dashboard/page.tsx` | Modifié | Modification du jour |
| `app/dashboard/post-a-job/page.tsx` | Modifié | Modification du jour |
| `components/AccountConsentFields.tsx` | Nouveau, non suivi | Modification du jour |
| `components/Navbar.tsx` | Modifié | Modification du jour |
| `components/SaveJobButton.tsx` | Modifié | Modification du jour |
| `components/SiteChrome.tsx` | Modifié | Modification du jour |
| `lib/accountPermission.ts` | Nouveau, non suivi | Modification du jour |
| `lib/accountRole.ts` | Nouveau, non suivi | Modification du jour |
| `lib/employerJobValidation.ts` | Nouveau, non suivi | Modification du jour |
| `lib/recoveryGrant.ts` | Nouveau, non suivi | Modification du jour |
| `lib/requireAccount.ts` | Nouveau, non suivi | Modification du jour |
| `lib/supabase-server.ts` | Modifié | Modification du jour |
| `middleware.ts` | Nouveau, non suivi | Modification du jour |
| `supabase/.temp/cli-latest` | Nouveau, non suivi | Modification du jour |
| `supabase/migrations/20261007090000_account_roles.sql` | Nouveau, non suivi | Modification du jour |
| `supabase/migrations/20261007100000_enforce_signup_requirements.sql` | Nouveau, non suivi | Modification du jour |
| `supabase/templates/confirmation.html` | Nouveau, non suivi | Modification du jour |
| `supabase/templates/recovery.html` | Nouveau, non suivi | Modification du jour |
| `tests/account-ux-permissions.test.ts` | Nouveau, non suivi | Modification du jour |

## Offres : salaires, données et filtres

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `components/JobFilters.tsx` | Modifié | Modification du jour |
| `lib/job-filters.ts` | Modifié | Modification du jour |
| `lib/job-where.ts` | Modifié | Modification du jour |
| `lib/jobCompensation.ts` | Nouveau, non suivi | Modification du jour |
| `lib/jobTaxonomy.ts` | Modifié | Modification du jour |
| `lib/popular-job-filters.ts` | Modifié | Modification du jour |
| `lib/resolveJobSalary.ts` | Nouveau, non suivi | Modification du jour |
| `lib/workSetting.ts` | Nouveau, non suivi | Modification du jour |
| `prisma/migrations/20261007090000_job_compensation/migration.sql` | Nouveau, non suivi | Modification du jour |

## SEO : URLs, redirections, sitemap et liens

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `.env` | Local / ignoré | Chantier SEO confirmé |
| `.env.example` | Modifié | Chantier SEO confirmé |
| `.env.local` | Local / ignoré | Chantier SEO confirmé |
| `app/admin/jobs/admin-jobs-dashboard.tsx` | Modifié | Chantier SEO confirmé |
| `app/admin/jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/api/cron/indexnow/route.ts` | Modifié | Chantier SEO confirmé |
| `app/api/cron/mark-expired-jobs/route.ts` | Modifié | Chantier SEO confirmé |
| `app/api/employer/jobs/[id]/route.ts` | Modifié | Chantier SEO confirmé |
| `app/api/employer/jobs/route.ts` | Modifié | Chantier SEO confirmé |
| `app/api/jobs/[id]/route.ts` | Modifié | Chantier SEO confirmé |
| `app/api/saved-jobs/route.ts` | Modifié | Chantier SEO confirmé |
| `app/auth/loading.tsx` | Nouveau, non suivi | Chantier SEO confirmé |
| `app/bess-technician-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/blog/become-solar-installer-no-experience/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/blog/how-to-land-first-solar-job/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/blog/layout.tsx` | Modifié | Chantier SEO confirmé |
| `app/blog/what-does-a-solar-installer-do/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/ccpa/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/certifications/[slug]/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/certifications/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/contact/layout.tsx` | Modifié | Chantier SEO confirmé |
| `app/cookie-policy/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/dashboard/employer/employer-dashboard.tsx` | Modifié | Chantier SEO confirmé |
| `app/dashboard/employer/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/battery-storage-leads-segment-specific-solar-hiring/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/remote-solar-jobs-travel-requirements/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/salaries/[title]/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/solar-desk-job-illusion/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/data/states/[state]/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/jobs/[id]/[slug]/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/jobs/[id]/loading.tsx` | Supprimé | Chantier SEO confirmé |
| `app/jobs/[id]/page.tsx` | Supprimé | Chantier SEO confirmé |
| `app/jobs/[id]/route.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `app/layout.tsx` | Modifié | Chantier SEO confirmé |
| `app/lead-solar-installer-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/loading.tsx` | Supprimé | Chantier SEO confirmé |
| `app/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/california/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/illinois/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/maryland/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/michigan/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/nevada/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/new-york/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/ohio/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/utah/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/virginia/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/paycheck-calculator/washington/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/privacy/layout.tsx` | Modifié | Chantier SEO confirmé |
| `app/privacy/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/do-you-need-to-be-an-electrician-for-bess/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/how-to-become-a-solar-installer/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/how-to-get-a-solar-apprenticeship/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/how-to-get-nabcep-certified/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/manufacturer-certifications-tesla-enphase-solaredge/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-board-eligible-status/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-project-credits-explained/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-pvip-pass-rate/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-pvis-vs-pvip/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-training-providers-compared/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/nabcep-vs-eta-vs-state-licenses/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/osha-safety-guide-solar-installers/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-certifications-by-job-role/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-dc-safety-for-electricians/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-engineer-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-installer-apprenticeship-programs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-installer-certification/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/resources/solar-installer-vs-electrician-texas/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/robots.ts` | Modifié | Chantier SEO confirmé |
| `app/sitemap.ts` | Modifié | Chantier SEO confirmé |
| `app/solar-electrician-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/solar-engineer-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/solar-jobs-no-experience/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/solar-pv-installer-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/solar-sales-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/solar-technician-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/terms/layout.tsx` | Modifié | Chantier SEO confirmé |
| `app/terms/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/tools/solar-apprenticeship-hours-checker/EmbedCode.tsx` | Modifié | Chantier SEO confirmé |
| `app/tools/solar-apprenticeship-hours-checker/solar-hours-checker/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/tools/solar-repowering-calculator/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/entry-level-solar-jobs/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/jobs-widget/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/jobs-widget/privacy/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/jobs-widget/WidgetConfigurator.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-apprenticeship-licensing/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-career-pathways/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-employers-hiring/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-job-market-by-state/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-salary-explorer/page.tsx` | Modifié | Chantier SEO confirmé |
| `app/workforce-resources/solar-skills-certifications/page.tsx` | Modifié | Chantier SEO confirmé |
| `components/data/SolarMarketSegmentsReport.tsx` | Modifié | Chantier SEO confirmé |
| `components/InfiniteJobList.tsx` | Modifié | Chantier SEO confirmé |
| `components/JobCard.tsx` | Modifié | Chantier SEO confirmé |
| `data/remote-travel/job-links.json` | Nouveau, non suivi | Chantier SEO confirmé |
| `data/remote-travel/report.json` | Modifié | Chantier SEO confirmé |
| `docs/seo-url-corrections-20261007.md` | Nouveau, non suivi | Chantier SEO confirmé |
| `lib/authRedirect.ts` | Modifié | Chantier SEO confirmé |
| `lib/buildBreadcrumbSchema.ts` | Modifié | Chantier SEO confirmé |
| `lib/careerjet.ts` | Modifié | Chantier SEO confirmé |
| `lib/greenhouse.ts` | Modifié | Chantier SEO confirmé |
| `lib/indexnow.ts` | Modifié | Chantier SEO confirmé |
| `lib/job-availability.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `lib/job-db.ts` | Modifié | Chantier SEO confirmé |
| `lib/job-indexing.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `lib/job-url.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `lib/jobDetail.ts` | Modifié | Chantier SEO confirmé |
| `lib/jobs.ts` | Modifié | Chantier SEO confirmé |
| `lib/jobsQuery.ts` | Modifié | Chantier SEO confirmé |
| `lib/merged-search.ts` | Modifié | Chantier SEO confirmé |
| `lib/similarJobs.ts` | Modifié | Chantier SEO confirmé |
| `lib/site-url.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `next.config.mjs` | Modifié | Chantier SEO confirmé |
| `public/data/remote-solar-travel-2026-09-06.csv` | Modifié | Chantier SEO confirmé |
| `scripts/backfill-canonical-job-urls.ts` | Nouveau, non suivi | Chantier SEO confirmé |
| `scripts/build-remote-travel-report.mjs` | Modifié | Chantier SEO confirmé |
| `scripts/check-canonical-job-urls.mts` | Nouveau, non suivi | Chantier SEO confirmé |
| `scripts/check-remote-travel-page.mjs` | Modifié | Chantier SEO confirmé |
| `scripts/submit-google-indexing.ts` | Modifié | Chantier SEO confirmé |
| `scripts/submit-indexnow.ts` | Modifié | Chantier SEO confirmé |
| `tests/canonical-job-urls.test.ts` | Nouveau, non suivi | Chantier SEO confirmé |

## Wayback : collecteurs et supervision

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `docs/wayback-collector-scheduler-fix-20261007.md` | Nouveau, non suivi | Modification du jour |
| `lib/wayback/collectorScheduling.mjs` | Nouveau, non suivi | Modification du jour |
| `lib/wayback/diskRecovery.mjs` | Nouveau, non suivi | Modification du jour |
| `scripts/wayback/remote-triage-bridge.mjs` | Nouveau, non suivi | Modification du jour |
| `scripts/wayback/run-cloud-parallel-fleet.mjs` | Nouveau, non suivi | Modification du jour |
| `scripts/wayback/run-raw-archive-lot.mjs` | Nouveau, non suivi | Modification du jour |
| `tests/wayback-collector-scheduling.test.mjs` | Nouveau, non suivi | Modification du jour |
| `tests/wayback-disk-recovery.test.mjs` | Nouveau, non suivi | Modification du jour |

## WhatJobs : suivi interne, flux et audits

| Fichier | État Git | Attribution |
| --- | --- | --- |
| `app/api/whatjobs/events/route.ts` | Nouveau, non suivi | Modification du jour |
| `components/WhatJobsFeed.tsx` | Modifié | Modification du jour |
| `components/WhatJobsJobBox.tsx` | Modifié | Modification du jour |
| `components/WhatJobsMobileSearch.tsx` | Modifié | Modification du jour |
| `components/WhatJobsTracking.tsx` | Nouveau, non suivi | Modification du jour |
| `docs/whatjobs-internal-tracking.md` | Nouveau, non suivi | Modification du jour |
| `docs/whatjobs-production-audit-20261007.md` | Nouveau, non suivi | Modification du jour |
| `lib/whatjobsDestination.ts` | Nouveau, non suivi | Modification du jour |
| `lib/whatjobsMetrics.ts` | Nouveau, non suivi | Modification du jour |
| `lib/whatjobsTrackingClient.ts` | Nouveau, non suivi | Modification du jour |
| `prisma/migrations/20261007143000_whatjobs_metrics/migration.sql` | Nouveau, non suivi | Modification du jour |
| `scripts/export-whatjobs-metrics.ts` | Nouveau, non suivi | Modification du jour |
| `tests/whatjobs-metrics.test.ts` | Nouveau, non suivi | Modification du jour |
| `tests/whatjobs-tracking.browser.cjs` | Nouveau, non suivi | Modification du jour |

Le présent inventaire est lui-même ajouté dans `docs/inventaire-fichiers-20261007.md` après le relevé ; il n’est pas compté dans les totaux ci-dessus.
