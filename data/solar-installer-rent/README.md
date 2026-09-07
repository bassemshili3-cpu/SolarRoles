# Solar installer pay and rent, September 5, 2026

Report route: `/data/solar-installer-salary-rent-report`.

## Inputs and provenance

- `bls-extract.json`: cross-industry rows for occupations 47-2231, 47-2111 and 47-2181, extracted without altering values from `MSA_M2025_dl.xlsx`, inside https://www.bls.gov/oes/special-requests/oesm25ma.zip . Retrieved September 5, 2026. Main report uses 47-2231 only; the comparison occupations are included in the downloadable data.
- `bls-areas.json`: county definitions for metros with a solar installer row, extracted from https://www.bls.gov/oes/area_definitions_m2025.xlsx . Retrieved September 5, 2026.
- `hud-matched-rents.json`: manually transcribed one-bedroom rents and full county membership from https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY2026_FMR_Schedule.pdf . `pages` uses printed, one-based page numbers. The browser-readable official PDF was used because the HUD XLSX endpoint returned empty HTTP 202 responses to both direct and browser downloads.
- San Luis Obispo uses the revised one-bedroom rent of $2,036 effective May 21, 2026, from https://www.federalregister.gov/documents/2026/04/21/2026-07741/fair-market-rents-for-the-housing-choice-voucher-program-moderate-rehabilitation-single-room . The original PDF's $1,914 is superseded. The other six revised areas are outside the included sample.

Raw BLS downloads are retained locally under `raw/` and ignored by Git. Compact extracts, source checksums, the manual HUD input and generated report are versioned so calculations can be reproduced without network access. `source-manifest.json` records the original BLS file hashes.

## Geography and calculations

Start with all 48 non-Puerto-Rico metropolitan rows for solar photovoltaic installers in the May 2025 file. Keep the 28 whose complete BLS county membership matches one HUD FMR area. For Philadelphia and Portland, combine the state-specific PDF lines for the same HUD area. Do not substitute a central city's rent for a wider metro. The other 20 metros are listed in the exclusions CSV. This selection is not nationally representative.

The build script asserts equality of the independently transcribed HUD county names with the BLS county names and records BLS county FIPS in the export. This audit is limited to the selected areas; county names should not be used as general national join keys.

- Rent hours = one-bedroom monthly FMR / BLS median hourly wage.
- Rent share = one-bedroom monthly FMR * 12 / BLS median annual wage * 100.
- Rank using unrounded hours; display one decimal. CSV calculations retain four decimal places.
- Use full gross pay and one worker paying all rent. The 30% threshold is an explicit comparison convention, not a claim about actual household burden or an official eligibility determination.
- FY 2026 rents and May 2025 wages have different reference periods. No wage inflation, taxes, overtime or other living costs are modeled. FMR is a 40th-percentile gross rent benchmark, not a median asking rent.
- BLS medians are estimates. Small occupational samples and unavailable sampling errors for medians limit the meaning of close rank differences; no statistical significance is claimed. The separate published hourly and annual medians have independent rounding.

Rebuild with `node scripts/build-solar-rent-report.mjs`. Outputs: `report.json`, `public/data/solar-installer-rent-2026.csv` and the exclusions CSV.

## Editorial construction references

Read before drafting and checked again during review:

- Indeed Hiring Lab, “Cities Where Salaries Go Furthest in the U.S.: 2017”: https://hiringlab.indeed.com/2017/08/24/salary-comparison-by-us-city-2017/
- Monster, “Best Cities to Start a Career in 2026”: https://www.monster.com/career-advice/research/best-cities-to-start-a-career

Use the employment-research construction: reader-facing pay/location headline, named places and measured findings at the start, short comparisons before the full table, then reproducible methodology. These are syntax/structure references only. No source prose, proprietary data, rankings, affiliation or endorsement is reproduced. Metadata uses the same concrete pay/location/result construction as the article.
