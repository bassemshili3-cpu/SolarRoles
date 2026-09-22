# Common Crawl historical solar jobs POC — 2026-09-22

## Decision

**Do not start the 2015–2026 backfill yet.** The retrieval and parsing pipeline works, but the tested employer registry does not provide a comparable longitudinal panel.

## Current ATS panel

Three crawls were sampled in each test year: early, middle and late 2016, 2020 and 2024.

| Metric | Result |
| --- | ---: |
| Employers queried | 10 |
| CDX index queries | 117 |
| Unique indexed HTML captures | 3,703 |
| WARC records sampled | 97 |
| Strict US solar jobs retained | 5 |
| Retained jobs with complete descriptions | 5/5 |

Coverage by year:

| Year | Indexed captures | WARC sample | Retained jobs | Employer coverage |
| --- | ---: | ---: | ---: | --- |
| 2016 | 0 | 0 | 0 | No tested current ATS domain covered |
| 2020 | 671 | 20 | 0 | NextEra only in the index sample |
| 2024 | 3,032 | 77 | 5 | All retained jobs from Origis Energy |

The five retained 2024 jobs are:

- Director, PV Energy & Performance Engineering;
- Director or Manager, Business Development;
- Director, Performance Engineering;
- Director or Manager Project Engineering;
- Remote Operations Center Operator.

These records have complete archived descriptions. They demonstrate extraction quality, not market coverage.

## Historical-domain panel

The second pass tested Sunrun, First Solar, SunPower, SolarCity, Vivint Solar and Sungevity on candidate first-party and historical job domains.

| Metric | Result |
| --- | ---: |
| Employers queried | 6 |
| CDX index queries | 162 |
| Unique indexed HTML captures | 687 |
| WARC records sampled | 31 |
| Strict US solar jobs retained | 1 |

`jobs.sunpower.com` accounted for 686 captures in 2020 and one capture in 2016. The retained record was `Lead Installation Technician/Foreman - Ontario, CA` in 2020. The single 2016 capture did not contain a retained US solar job, and none of the tested historical domains supplied 2024 coverage.

## Quality findings

Two false-positive mechanisms were found and corrected during manual inspection:

- a wind technician was initially accepted because the employer boilerplate mentioned wind and solar;
- a DevOps role was initially accepted because the company introduction repeatedly mentioned solar.

The historical classifier now rejects explicit non-solar generation titles and software/DevOps titles unless the title itself carries a solar or storage signal. It also rejects terminal non-US country codes embedded in an otherwise incomplete location field.

## What the POC establishes

The following components are operational:

- sequential, rate-limited CDX queries;
- multiple crawls per year;
- persisted zero-result queries;
- WARC byte-range downloads;
- local WARC and HTML retention;
- JSON-LD-first extraction with HTML fallback;
- strict US and solar-role filtering;
- Solar Roles taxonomy flags;
- source-ID and content-hash deduplication;
- separate job and capture files;
- resumable `index` and `extract` phases;
- parser replay from local HTML;
- yearly and employer-level quality reports;
- a manual-review CSV.

## Blocking issue

The historical ATS/domain map is incomplete. Current ATS domains cannot be projected backward: the 2016 result is effectively empty, and the employers represented in 2020 do not match those represented in 2024.

The next run must identify the actual ATS or career domain used by each target employer in each period. A publishable panel requires multiple employers with usable descriptions in every comparison year. Until then, changes in job counts would measure source coverage rather than hiring activity.

## Evidence files

- Current ATS panel: `poc-2016-2020-2024/quality-report.json`
- Historical-domain panel: `poc-historical-domains/quality-report.json`
- Employer registry: `employers.json`
- Full index observations: each run’s `index-records.jsonl`
- Query ledger, including zero results: each run’s `index-queries.jsonl`
- Capture manifest: each run’s `captures.jsonl`
- Retained jobs: each run’s `historical-jobs.jsonl`
