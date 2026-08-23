import { CUSTOM_SCRAPE_COMPANIES } from '../lib/ats/custom-scrape/config';
import { dryRunCustomScrape } from '../lib/ats/custom-scrape';

const requestedDomain = process.argv[2]?.replace(/^https?:\/\//, '').replace(/\/$/, '');

async function main() {
  if (!requestedDomain) {
    console.error('Usage: npx tsx scripts/dry-run-custom-scrape.ts <domain>');
    process.exitCode = 1;
    return;
  }
  const seed = CUSTOM_SCRAPE_COMPANIES.find((entry) => entry.domain === requestedDomain);
  if (!seed) {
    console.error(`No custom-scrape seed configured for ${requestedDomain}. Add it to lib/ats/custom-scrape/config.ts first.`);
    process.exitCode = 1;
    return;
  }
  const result = await dryRunCustomScrape(seed);
  console.log(JSON.stringify({ domain: seed.domain, jobs: result.jobs, googleJobPosting: result.googleJobs, outcomes: result.outcomes, diagnostics: result.diagnostics }, null, 2));
}

main().catch((error) => {
  console.error('[custom-scrape] dry-run failed', error);
  process.exitCode = 1;
});
