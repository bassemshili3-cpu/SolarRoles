export const config = { schedule: '* * * * *' };
export default async function dispatchSeedRewrites() {
  const secret = process.env.CRON_SECRET;
  const origin = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !origin) throw new Error('Seed rewrite cron configuration missing');
  const response = await fetch(new URL('/.netlify/functions/rewrite-seed-descriptions-background', origin), {
    method: 'POST', headers: { authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(20_000),
  });
  if (response.status !== 202) throw new Error(`Seed rewrite dispatch HTTP ${response.status}`);
  console.log(JSON.stringify({ decision: 'dispatched', at: new Date().toISOString() }));
}
