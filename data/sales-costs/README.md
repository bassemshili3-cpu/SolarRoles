# Solar sales expenses: selected cases

Report: `/data/solar-sales-jobs-business-expenses`. Publication date: September 7, 2026.

The frozen snapshot was extracted read-only at 2026-09-06T23:10:03.433Z (September 7 in Europe/Paris). It contains 403 title-screened records from 2,162 active, unexpired, nondeleted and nonpaused records. It is not a solar-sales-only, deduplicated analysis population.

## Editorial scope

Targeted searches found a clear advertising-budget requirement in Solar Tech Elec's description. Other cases establish prospecting, personal resources or differences in company support, not necessarily worker spending. The report deliberately presents six illustrative cases rather than an estimated prevalence. Do not turn the cases into a percentage or treat the title screen as a fully reviewed denominator.

`snapshot.json` preserves normalized source descriptions privately in the repository, not the public directory. `review.json` contains the selected record IDs, short excerpts and contextual interpretations. `report.json` and the public CSV are generated from those two inputs. The report distinguishes the recruiting advertiser SalesDraft from Powur, named in that description.

## Reproduction

Run `node scripts/build-sales-costs-report.mjs`. It verifies unique case IDs, source membership and exact excerpt matches, then generates the report data and `public/data/solar-sales-business-expenses-2026-09-07.csv`. SHA-256 hashes refer to normalized snapshot descriptions. This command does not access the database.

To collect a separate future snapshot, run `node --env-file=.env.local scripts/extract-sales-costs.mjs data/sales-costs-NEW-DATE`. The extractor refuses to replace an existing snapshot. New snapshots require a new contextual review; they must not silently overwrite this report's evidence.

Editorial construction follows employment research (Indeed Hiring Lab's concrete finding / evidence / methods structure). Reference read during preparation: https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/. No text copied. The primary employer page was also checked: https://solartechelec.com/careers/virtual-sales-agents/.
