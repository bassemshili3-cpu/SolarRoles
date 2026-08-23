# Custom scrape configuration

Add one `CustomScrapeSeed` per domain to `config.ts`. Keep `verified: false`
and `status: 'needs_review'` until the output of the dry-run has been manually
reviewed. Production sync skips unverified and non-active entries.

```ts
{
  provider: 'custom-scrape',
  companyName: 'Example Solar',
  careersUrl: 'https://careers.example.com/jobs',
  domain: 'careers.example.com',
  verified: false,
  status: 'needs_review',
  selectors: {
    listItem: '.job-card',
    title: 'h1',
    link: 'a.job-link',
    description: 'main .job-description',
    location: '.job-location',
    employmentType: '.employment-type',
    nextPage: 'a[rel="next"]', // HTML pagination
    // loadMore: 'button[data-testid="load-more"]', // JS pagination (Playwright)
  },
  maxListingPages: 10,
}
```

Omit `selectors` to use the repeated-block, heading, Readability, location, and
employment-type heuristics. Run `npm run dry-run:custom-scrape -- <domain>`
before changing either `verified` or `status`.

Use `nextPage` when the next listing page has an anchor URL. Use `loadMore`
only when cards are rendered dynamically after a click; it starts Playwright
and clicks sequentially, at most `maxListingPages - 1` times.
