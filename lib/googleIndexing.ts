import { google } from 'googleapis';

// ─── Client JWT lazy ───────────────────────────────────────────────────────────
// On ne construit le client qu'au premier appel réel : ainsi l'import du module
// ne crash/ne consomme rien si les env vars ne sont pas encore configurées.
type JwtClient = InstanceType<typeof google.auth.JWT>;

let jwtClient: JwtClient | null = null;

function getJwtClient(): JwtClient {
  if (!jwtClient) {
    jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
      key: process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
  }
  return jwtClient;
}

let indexingClient: ReturnType<typeof google.indexing> | null = null;

function getIndexingClient() {
  if (!indexingClient) {
    indexingClient = google.indexing({ version: 'v3', auth: getJwtClient() });
  }
  return indexingClient;
}

export function isGoogleIndexingConfigured(): boolean {
  return (
    !!process.env.GOOGLE_INDEXING_CLIENT_EMAIL &&
    !!process.env.GOOGLE_INDEXING_PRIVATE_KEY
  );
}

export type IndexingAction = 'URL_UPDATED' | 'URL_DELETED';

export async function notifyGoogleIndexing(url: string, type: IndexingAction = 'URL_UPDATED') {
  try {
    const response = await getIndexingClient().urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    const status = error?.response?.status;
    const code = error?.response?.data?.error?.code;
    const quotaExceeded =
      status === 429 ||
      status === 403 ||
      code === 'RATE_LIMIT_EXCEEDED' ||
      code === 429;
    console.error('Google Indexing API error:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data || error.message, quotaExceeded };
  }
}