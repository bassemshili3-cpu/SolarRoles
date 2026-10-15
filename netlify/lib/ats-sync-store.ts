import { connectLambda, getStore } from '@netlify/blobs';
import { ATS_MONITOR_STORE } from '../../lib/ats/sync-monitor';

export function atsSyncStore(event?: { blobs?: string; headers: Record<string, string | undefined> }) {
  if (event?.blobs) connectLambda({ blobs: event.blobs, headers: event.headers as Record<string, string> });
  return getStore({ name: ATS_MONITOR_STORE, consistency: 'strong' });
}
