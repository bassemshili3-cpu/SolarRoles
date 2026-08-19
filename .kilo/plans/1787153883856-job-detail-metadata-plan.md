# Plan: Individual job pages show the layout title (no per-job metadata / no canonical)

## Confirmed symptom (from crawl)
Individual job pages (`/jobs/{id}/{slug}`) render in SSR with:
- `<title>` = **"Search Solar Roles Jobs in The US | Filter by Salary, Type & Experience | Solar Roles"**
- no `<meta name="description">`
- no `<link rel="canonical">`

That string is verbatim the static `metadata` exported by `app/jobs/layout.tsx:3-7`. So the page-level
`generateMetadata` in `app/jobs/[id]/[slug]/page.tsx` is **not being applied** — the pages inherit the
intermediate layout's metadata. This explains "same title everywhere + no canonical" exactly.
`app/jobs/page.tsx` (listing) correctly inherits that same title (expected there).

## Root cause (two branches; fix covers both)
- **(A) Structural:** `jobs/layout.tsx` exports a **static `metadata` object** while the nested detail
  page exports `generateMetadata`. Pillar pages work because they sit directly under the root layout
  (no intermediate metadata layer). Here the intermediate static-layout metadata wins/shadows the
  nested `generateMetadata` for the detail segment.
- **(B) Anti-pattern:** `generateMetadata` (page.tsx:456) calls `notFound()` when `getJobDetail` returns
  null (inactive/expired jobs, or a transient DB error — `getJobDetail` swallows DB errors and returns
  null). `notFound()` inside `generateMetadata` renders the not-found UI, which inherits
  `jobs/layout.tsx` metadata → identical title + no canonical on every such URL.

## Fixes

### 1. Stop the layout from forcing a title onto detail pages
- `app/jobs/layout.tsx`: **remove the static `metadata` export** (so it no longer imposes
  "Search Solar Roles Jobs…" on `/jobs/{id}/{slug}`).
- `app/jobs/page.tsx` (listing): **add its own `metadata`** (move the former layout title/description
  there) so the listing page keeps its correct, unique title.

### 2. Never call `notFound()` inside `generateMetadata`
- In `app/jobs/[id]/[slug]/page.tsx` `generateMetadata`: if `getJobDetail(id)` returns null, **return a
  best-effort metadata** (e.g. `title: 'Job not found | Solar Roles'`, `robots: { index:false }`)
  instead of `notFound()`. Let the **page component** (not metadata) own the 404 via `notFound()`.
  This guarantees the SSR `<head>` is never the shared layout default.

### 3. Make the `<title>` unique per URL (original concern)
- `buildPageTitle()` (page.tsx:138-177): include location so templated multi-location ATS postings
  don't collapse to one string. Format (keep ≤60 chars + existing truncation):
  - location present → `"{title} - {city}, {state} | Solar Roles"`
  - else → `"{title} at {company} | Solar Roles"`
- Keep `description` (already includes `job.location`); ensure it stays unique when location missing.

### 4. Fix the `.com` typo
- `app/jobs/[id]/[slug]/page.tsx:647` builds `canonicalUrl` as `https://www.solarroles/jobs/...`
  (missing `.com`). Remove the dead var or correct to `solarroles.com`; keep the single canonical
  source `https://www.solarroles.com/jobs/{id}/{slug}` for `generateMetadata` canonical, JobPosting
  `url` (line 331), and ShareBar (line 1074).

## Affected files
- `app/jobs/layout.tsx` — remove static `metadata`.
- `app/jobs/page.tsx` — add `metadata` (listing title/description).
- `app/jobs/[id]/[slug]/page.tsx` — `generateMetadata` (no `notFound`, unique fallback), `buildPageTitle`
  (add location), line 647 canonical typo.

## Validation
- Re-crawl the same individual job URLs; confirm each returns **HTTP 200** with a **unique** `<title>`,
  a `<meta name="description">`, and a self-referencing `<link rel="canonical">` in the raw SSR HTML
  (not the layout title).
- Confirm `/jobs` listing still shows its own correct title.
- GSC: resubmit a few ATS URLs; confirm titles now include city/state and remain unique.
- Sanity: truncated titles stay ≤60 chars and retain role + location.

## Open question / secondary
- If many crawled job URLs are actually **404** (expired/inactive), the deeper fix is to handle
  expired job URLs (redirect to the relevant category/search, or return 410) so crawlers stop hitting
  stale URLs. Out of scope here unless the re-crawl shows it's the dominant case.
