// app/api/cron/indexnow/route.ts
// Cron endpoint for IndexNow URL submission
// Soumet les URLs des jobs ATS les plus récents (contenu principal indexable)
// + certifications + blog à IndexNow (Bing/Yandex/Cloud).
// Triggered by Vercel Cron (auth via header Authorization: Bearer {CRON_SECRET},
// injecté automatiquement par Vercel — voir vercel.json, plus de secret en query string)

import { NextResponse } from 'next/server';
import { submitUrls, isIndexNowConfigured } from '@/lib/indexnow';
import { getRecentCustomScrapeJobUrls } from '@/lib/job-db';

export async function GET(request: Request) {
  // Vérifie le secret via le header Authorization plutôt qu'un query param.
  // Vercel Cron envoie automatiquement `Authorization: Bearer {CRON_SECRET}`
  // sur ses propres appels — CRON_SECRET doit être défini dans les env vars
  // du projet (dashboard Vercel), jamais en dur dans le code ou vercel.json.
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[IndexNow Cron] CRON_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[IndexNow Cron] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if IndexNow is configured
  if (!isIndexNowConfigured()) {
    console.error('[IndexNow Cron] INDEXNOW_KEY not configured');
    return NextResponse.json({ error: 'IndexNow not configured' }, { status: 500 });
  }

  console.log('[IndexNow Cron] Starting IndexNow submission...');
  const startTime = Date.now();

  try {
    // Aligné sur le fallback utilisé partout ailleurs (script + lib/indexnow.ts)
    // pour éviter tout mismatch host/URL — www.solarroles.com est le domaine
    // canonique réel (solarroles.com fait un 308 vers www).
    const urlsToSubmit: string[] = [];

    // 2. Collect recent ATS job pages (contenu principal)
    // Les jobs ATS (greenhouse, lever, workday…) sont les seuls jobs indexables
    // du site. On soumet les plus récents pour basculer la fraîcheur de Bing
    // vers le contenu dynamique. Les pages statiques (/resources, landing)
    // sont déjà connues de Bing et n'ont pas besoin d'être re-soumises chaque jour.
    const MAX_ATS_JOBS = 1000; // IndexNow accepte jusqu'à 10 000 URLs/requête
    const customScrapeJobUrls = await getRecentCustomScrapeJobUrls(MAX_ATS_JOBS, 11);
    urlsToSubmit.push(...customScrapeJobUrls);
    console.log(`[IndexNow Cron] Added ${customScrapeJobUrls.length} recent custom-scrape job URLs`);

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(urlsToSubmit));
    console.log(`[IndexNow Cron] Submitting ${uniqueUrls.length} unique URLs to IndexNow`);

    // Submit to IndexNow
    const success = await submitUrls(uniqueUrls);

    const duration = Date.now() - startTime;

    if (success) {
      console.log(`[IndexNow Cron] Completed successfully in ${duration}ms`);
      return NextResponse.json({
        success: true,
        urlsSubmitted: uniqueUrls.length,
        duration: `${duration}ms`,
        message: 'Successfully submitted URLs to IndexNow',
      });
    } else {
      console.error(`[IndexNow Cron] Failed after ${duration}ms`);
      return NextResponse.json({
        success: false,
        urlsSubmitted: 0,
        duration: `${duration}ms`,
        error: 'IndexNow submission failed',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[IndexNow Cron] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Also allow POST for manual triggers.
// ATTENTION : sans le header Authorization Bearer correct, un POST manuel
// (ex: via curl ou Postman) sera aussi rejeté en 401 — c'est voulu.
// Pour tester manuellement, envoie le header toi-même :
//   curl -X POST https://www.solarroles.com/api/cron/indexnow \
//     -H "Authorization: Bearer TON_CRON_SECRET"
export async function POST(request: Request) {
  return GET(request);
}
