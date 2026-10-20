import { getSeedRewritePrisma } from '../../lib/seo/seed-rewrite-prisma';
import { seedRewriteStatus } from '../../lib/seo/seed-rewrite-worker';
export default async function rewriteStatus(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  return Response.json(await seedRewriteStatus(getSeedRewritePrisma()), { headers: { 'cache-control': 'no-store' } });
}
