// lib/indexnow.ts
// IndexNow protocol implementation for Bing/Yandex/Cloud search engines
// https://www.bing.com/indexnow

export interface IndexNowPayload {
  host: string;
  key: string;
  urlList: string[];
}

export const INDEXNOW_ENDPOINT = 'https://www.bing.com/indexnow';

/**
 * Get IndexNow API key from environment
 */
export function getIndexNowKey(): string {
  const key = process.env.INDEXNOW_KEY || process.env.INDEXNOW_API_KEY;
  if (!key) {
    throw new Error('INDEXNOW_KEY or INDEXNOW_API_KEY environment variable is not set');
  }
  return key;
}

/**
 * Get site host from environment or default
 */
export function getSiteHost(): string {
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host 
    : 'solarroles.com';
  return host;
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrl(url: string, apiKey?: string): Promise<boolean> {
  const key = apiKey || getIndexNowKey();
  const host = getSiteHost();
  
  const payload: IndexNowPayload = {
    host,
    key,
    urlList: [url],
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Successfully submitted: ${url}`);
      return true;
    } else {
      console.error(`[IndexNow] Failed to submit ${url}: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`[IndexNow] Error submitting ${url}:`, error);
    return false;
  }
}

/**
 * Submit multiple URLs to IndexNow (batch)
 * IndexNow allows up to 10,000 URLs per request
 */
export async function submitUrls(urls: string[], apiKey?: string): Promise<boolean> {
  if (urls.length === 0) return true;

  const key = apiKey || getIndexNowKey();
  const host = getSiteHost();

  const payload: IndexNowPayload = {
    host,
    key,
    urlList: urls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] Successfully submitted ${urls.length} URLs`);
      return true;
    } else {
      console.error(`[IndexNow] Failed to submit batch: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error(`[IndexNow] Error submitting batch:`, error);
    return false;
  }
}

/**
 * Submit URLs via GET request (alternative method)
 * Useful for simple cases or when POST is not available
 */
export function getIndexNowSubmitUrl(url: string, apiKey?: string): string {
  const key = apiKey || getIndexNowKey();
  const host = getSiteHost();
  
  const params = new URLSearchParams({
    url,
    host,
    key,
  });

  return `${INDEXNOW_ENDPOINT}?${params.toString()}`;
}

/**
 * Verify IndexNow key is configured
 */
export function isIndexNowConfigured(): boolean {
  return !!process.env.INDEXNOW_KEY || !!process.env.INDEXNOW_API_KEY;
}
