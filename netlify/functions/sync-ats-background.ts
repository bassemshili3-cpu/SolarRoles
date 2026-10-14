import { runAtsSeed } from '../../scripts/seed-solar-jobs';

// The -background suffix enables Netlify's asynchronous execution (15 minutes).
export async function handler(event: { httpMethod: string; headers: Record<string, string | undefined>; body: string | null }) {
  const secret = process.env.CRON_SECRET;
  if (!secret || event.headers.authorization !== `Bearer ${secret}`) {
    throw new Error('Unauthorized ATS sync');
  }
  if (event.httpMethod !== 'POST') throw new Error('ATS sync requires POST');
  const task = JSON.parse(event.body || '{}') as { providerName?: unknown; companyIndex?: unknown };
  if (typeof task.providerName !== 'string' || task.providerName === 'custom-scrape' || typeof task.companyIndex !== 'number') {
    throw new Error('Invalid ATS sync task');
  }
  process.env.ATS_SERVERLESS_BROWSER = 'true';
  await runAtsSeed({ providerName: task.providerName, companyIndex: task.companyIndex, newOnly: true });
}
