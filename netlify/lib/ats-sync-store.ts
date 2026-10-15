import { getStore } from '@netlify/blobs';
import { ATS_MONITOR_STORE } from '../../lib/ats/sync-monitor';

export function atsSyncStore() {
  return getStore({ name: ATS_MONITOR_STORE, consistency: 'strong' });
}
