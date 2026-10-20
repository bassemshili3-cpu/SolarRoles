// Scheduling is owned by Cloudflare.
export default async function dispatchSeedRewrites(request: Request) {
  if (request.method !== 'POST' || !process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  const secret = process.env.CRON_SECRET;
  const origin = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !origin) throw new Error('Seed rewrite cron configuration missing');
  const response = await fetch(new URL('/.netlify/functions/rewrite-seed-descriptions-background', origin), {
    method: 'POST', headers: { authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(20_000),
  });
  if (response.status !== 202) throw new Error(`Seed rewrite dispatch HTTP ${response.status}`);
  console.log(JSON.stringify({ decision: 'dispatched', at: new Date().toISOString() }));
  return Response.json({ decision: 'dispatched' });
}
