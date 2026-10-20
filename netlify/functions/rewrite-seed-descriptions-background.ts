import { getSeedRewritePrisma } from '../../lib/seo/seed-rewrite-prisma';
import { runSeedRewrites } from '../../lib/seo/seed-rewrite-worker';
export const config = { background: true };
export default async function rewriteSeedDescriptions(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}` || request.method !== 'POST') throw new Error('Unauthorized seed rewrite');
  console.log(JSON.stringify(await runSeedRewrites(getSeedRewritePrisma())));
}
