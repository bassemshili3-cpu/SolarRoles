import { timingSafeEqual } from 'node:crypto';
import { readSyncStatus } from '../../lib/ats/sync-monitor';
import { atsSyncStore } from '../lib/ats-sync-store';

const headers = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' };
export default async function atsSyncStatus(request: Request) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const wanted = `Bearer ${expected}`;
  if (!expected || Buffer.byteLength(supplied) !== Buffer.byteLength(wanted) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(wanted))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  }
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { ...headers, allow: 'GET' } });
  const hours = Number(new URL(request.url).searchParams.get('hours') ?? 8);
  if (!Number.isInteger(hours) || hours < 1 || hours > 24) return Response.json({ error: 'hours must be an integer from 1 to 24' }, { status: 400, headers });
  try {
    return Response.json(await readSyncStatus(atsSyncStore(), hours), { headers });
  } catch {
    // A storage outage must never masquerade as an empty or healthy cron history.
    return Response.json({ health: 'unknown', error: 'ATS monitoring storage unavailable' }, { status: 503, headers });
  }
}
