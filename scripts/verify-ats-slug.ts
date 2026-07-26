/**
 * Quick sanity check before adding a company to lib/ats/company-seeds.ts.
 *
 * Usage:
 *   npx tsx scripts/verify-ats-slug.ts ashby vanta
 *   npx tsx scripts/verify-ats-slug.ts pinpoint some-company
 */

async function main() {
  const [, , ats, slug] = process.argv;

  if (!ats || !slug || !['ashby', 'pinpoint'].includes(ats)) {
    console.error('Usage: npx tsx scripts/verify-ats-slug.ts <ashby|pinpoint> <slug>');
    process.exit(1);
  }

  const endpoint =
    ats === 'ashby'
      ? `https://api.ashbyhq.com/posting-api/job-board/${slug}`
      : `https://${slug}.pinpointhq.com/postings.json`;

  const res = await fetch(endpoint);

  if (!res.ok) {
    console.log(`❌ "${slug}" — HTTP ${res.status} on ${ats}. Wrong slug or company doesn't use ${ats}.`);
    return;
  }

  const data: any = await res.json();
  const jobs = ats === 'ashby' ? data.jobs : data.data ?? data.postings;

  console.log(`✅ "${slug}" resolves on ${ats} — ${jobs?.length ?? 0} open job(s)`);
  if (jobs?.length) {
    console.log(jobs.slice(0, 8).map((j: any) => `  - ${j.title}`).join('\n'));
  }
}

main();