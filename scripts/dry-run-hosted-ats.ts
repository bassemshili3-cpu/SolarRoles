import { JAZZHR_COMPANIES, BREEZY_COMPANIES } from '../lib/ats/company-seed';
import { fetchHostedJobs, type HostedBoard } from '../lib/ats/hosted-board';
import { isUSJob } from '../lib/ats/geo';

async function main() {
  const source = process.argv[2] as HostedBoard;
  if (!['jazzhr', 'breezy'].includes(source)) throw new Error('Usage: tsx scripts/dry-run-hosted-ats.ts jazzhr|breezy [company-slug]');
  const companies = (source === 'jazzhr' ? JAZZHR_COMPANIES : BREEZY_COMPANIES).filter((c) => !process.argv[3] || c.slug === process.argv[3]);
  if (!companies.length) throw new Error('Unknown company slug');
  for (const company of companies) {
    const jobs = await fetchHostedJobs(source, company);
    console.log(JSON.stringify({ company: company.name, count: jobs.length, jobs: jobs.map((job) => ({
      title: job.title, url: job.url, location: job.location, usEligible: isUSJob(job, { allowBareRemote: false }),
      postedAt: job.postedAt, salary: job.salary, descriptionLength: job.description.length,
    })) }, null, 2));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
