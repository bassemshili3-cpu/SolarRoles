# Remote solar jobs and travel requirements

Frozen extraction: 2026-09-06 15:05:49 UTC. Database access was read-only.

## Files and reproduction

- `candidates.json`: normalized original `Job.description`, title, location, source URLs and timestamps for 276 keyword candidates from 2,014 active records. Kept outside `public`.
- `review.json`: contextual review decisions, employer-role grouping, exact supporting excerpts, percentage qualifiers, and notes. These are reviewed decisions, not the output of an automatic travel classifier.
- `exclusions.json`: all 193 screened records outside the cohort and the exclusion scope.
- `report.json`: generated results, source record mappings and text SHA-256 fingerprints.
- `../../public/data/remote-solar-travel-2026-09-06.csv`: downloadable analytical groups and evidence.

Rebuild and validate the frozen results:

```powershell
node scripts/build-remote-travel-report.mjs
```

The builder checks exhaustive candidate accounting, disjoint groups/exclusions, exact quote matches, reviewed categories, numeric bounds, and the distinction between a ceiling and a lower bound. It performs no database writes or network requests.

For a future extraction, use a new output directory. Do not overwrite the reviewed snapshot or reuse these classifications without re-reviewing changed descriptions:

```powershell
node --env-file=.env.local scripts/audit-remote-travel.mjs data/remote-travel-next-snapshot
```

## Scope and decisions

Employer concentration check: SOLV Energy contributes 12/54 combinations (22.2%), including 10 mentioning travel or site visits. Excluding all 12 leaves 30/42 (71.4%), compared with 40/54 (74.1%) in the full sample. The difference is -2.6 percentage points, calculated from unrounded fractions. The builder computes advertiser concentration (using the same advertiser aliases as the headline count) and removes the largest contributor without changing the coding rules. This does not establish representativeness or equal employer weighting.

Keep the September 6 extraction frozen when new sales listings arrive. A future quarterly edition should use a separately dated extraction and fresh contextual review, retain these eligibility/grouping/coding rules, and report employer concentration and the exclusion check alongside any change in the aggregate. Changes in board coverage and role mix must accompany comparisons; the initial cohort is not sales-only.

Press pitch lead, based on the archived descriptions: "A remote QA/QC Solar Technician listing at Cypress Creek Renewables specified 90% travel. An ENGIE listing allowed up to 85%. Solar Roles reviewed the wording behind 54 remote-advertised solar and storage employer-role combinations, with source excerpts for each." Use the aggregate as supporting context and include the 71.4% exclusion result when citing 74.1%. Verify live source wording before outreach; percentages are advertised requirements, not observed travel.

Editorial rhythm check for this revision: Axios, https://www.axios.com/2024/08/16/indeed-job-listings-remote-decline (read September 6, 2026). No external statistics were added to the report.

83 retained listing records form 55 employer-role groups. One RNWBL record contains only a general company introduction and is excluded from analysis: 82 records, 54 groups, 30 advertisers remain. Recruiting companies are advertisers, not necessarily the end employers. Moss and Moss Construction are one advertiser for the advertiser count.

40/54 groups mention travel or site visits (74.1%). There are 14 consistent percentage disclosures, 25 without a percentage, one internally conflicting percentage, two field-work descriptions without a travel schedule, one ambiguous office-attendance statement and 11 with no identified requirement. Before grouping, 59/82 records mention travel (72.0%). Neither figure estimates national prevalence or counts verified vacancies.

Group by advertiser and role rather than counting repeated advertisements as independent evidence. Merge DEPCOM/Koch advertiser variants; Jobot Solar/EPC Project Manager title variants; Venture Solar inside-sales variants; SOLV HV Project Manager remote/office-or-remote versions. Retain different commissioning disciplines. Grouped regional commissioning manager versions require travel in different regions. Grouping can collapse genuinely separate vacancies; the article explicitly calls the units employer-role combinations.

Include role-specific remote options, including conditional offers and explicit remote tags, and remote titles/locations even if the body says hybrid. Exclude hybrid-only jobs with no remote offer/label, negative statements, remote monitoring/equipment/geography, generic company benefit language without a role-specific offer, and ambiguous references to supporting teams remotely. Exclude Canadian Ontario/Nova Scotia locations despite US references elsewhere in their descriptions. The US universe is the board's US-listed inventory after these checks, not an independently country-verified census.

Travel means required OR possible business trips/site visits; not every mention is a mandatory regular trip. Keep ceilings, ranges and approximations in their original form. Intertek's current stored PV Solar Engineer description says both over 80% and up to 80%: include as travel, exclude from consistent numeric comparisons. Do not use it as the user's separate 75% example. The Canadian Solar regional sales and traveling-surveyor examples supplied in conversation were not recovered in this active cohort and are not included as evidence.

Solar Roles labels may reflect source-platform classification or ingestion, not an employer's explicit promise. Do not call the employers deceptive or translate remote into zero travel. This review used agent-assisted contextual assessment, not independent double-coding. Missing travel language is unknown, never a confirmed zero.

## Angle check and editorial references

Search conducted September 6, 2026: remote job postings/travel requirements studies; solar remote job descriptions/travel reports; solar fake remote studies; the supplied employer examples. No equivalent quantified solar-specific report was located in the consulted results. This is not proof that no earlier report exists.

The broader idea is already covered:
- FlexJobs explains geographic restrictions and work travel: https://www.flexjobs.com/blog/post/why-do-some-remote-jobs-require-a-location
- Virtual Vocations explicitly separated remote roles from field travel in its 2022 policy: https://www.virtualvocations.com/blog/annual-statistical-remote-work-reports/2022-remote-job-reports-monthly-analysis-statistics/
- A generalist remote-listing report already includes travel requirements: https://remotestack.in/blog/remote-job-market-report-may-2026

Editorial structure references (outside solar): Indeed Hiring Lab's concrete finding headline, quantified opening, breakdowns and explicit methodology; FlexJobs' candidate-oriented distinction between remote work and travel. No source wording or external statistics were copied into the original findings.
- https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/
- https://www.flexjobs.com/blog/post/why-do-some-remote-jobs-require-a-location

Report route: `/data/remote-solar-jobs-travel-requirements`. Includes a static snapshot, accessible filtering, evidence excerpts, CSV, canonical, article metadata, social image and Report/Dataset JSON-LD. Hub and sitemap link to the detail route.
