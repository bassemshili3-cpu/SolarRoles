// app/api/cron/google-indexing/route.ts
// ─── Cron : Google Indexing API — jobs sourcés ATS uniquement ───────────────
// Soumet les URLs canoniques des jobs ATS actifs (greenhouse, lever, workday,
// ashby, smartrecruiters, jobvite, pinpoint, workable) via l'API Google
// Indexing (type URL_UPDATED).
//
// Seuls les jobs ATS sont indexables dans ce projet (les autres sources —
// jooble/lensa/careerjet/adzuna — sont en noindex dans la page job).
//
// ⚠️ Quota : 200 URLs/jour (google-200) pour toute la propriété Search
// Console. On s'arrête dès qu'une erreur de quota est détectée pour ne pas
// brûler inutilement le reste de la journée.
//
// Schedule: quotidien via vercel.json (décalé du cron indexnow pour ne pas
// saturer les crawl queues en même temps).

import { NextResponse } from 'next/server';
import { getGoogleIndexingCandidates, markGoogleIndexingSubmitted } from '@/lib/job-db';
import { isGoogleIndexingConfigured, notifyGoogleIndexing } from '@/lib/googleIndexing';

// = quota quotidien google-200. On ne dépasse jamais ça par run.
// 8 URLs x 24 executions = 192, under Google's daily quota of 200.
const MAX_URLS_PER_RUN = 8;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[Google Indexing Cron] CRON_SECRET is not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Google Indexing Cron] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isGoogleIndexingConfigured()) {
    console.error(
      '[Google Indexing Cron] GOOGLE_INDEXING_CLIENT_EMAIL / GOOGLE_INDEXING_PRIVATE_KEY not configured'
    );
    return NextResponse.json({ error: 'Google Indexing not configured' }, { status: 500 });
  }

  console.log('[Google Indexing Cron] Starting Google Indexing submission...');
  const startTime = Date.now();

  try {
    const candidates = await getGoogleIndexingCandidates(MAX_URLS_PER_RUN, 15);
    console.log(`[Google Indexing Cron] ${candidates.length} prioritized custom-scrape/ATS job URL(s) to submit`);

    let submitted = 0;
    let failed = 0;
    let quotaHit = false;
    const errors: string[] = [];

    for (const candidate of candidates) {
      const result = await notifyGoogleIndexing(candidate.url, 'URL_UPDATED');

      if (result.success) {
        submitted++;
        await markGoogleIndexingSubmitted(candidate.id);
        // Keep the exact submitted URLs in Vercel logs for production audits.
        console.log(`[Google Indexing Cron] ✔ ${candidate.url}`);
      } else {
        failed++;
        const message =
          typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        errors.push(message);
        console.error(`[Google Indexing Cron] ✘ ${candidate.url}: ${message}`);

        // Quota épuisé → arrêt anticipé, on préserve le reste de la journée.
        if (result.quotaExceeded) {
          quotaHit = true;
          console.error('[Google Indexing Cron] Daily quota reached — stopping early');
          break;
        }
      }

      // Petite pause pour rester sous le rate limit de l'API.
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const duration = Date.now() - startTime;
    console.log(
      `[Google Indexing Cron] Done in ${duration}ms — submitted: ${submitted}, failed: ${failed}${quotaHit ? ' (quota reached)' : ''}`
    );

    return NextResponse.json({
      success: true,
      submitted,
      failed,
      quotaHit,
      totalCandidates: candidates.length,
      errors: errors.slice(0, 5),
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Google Indexing Cron] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST autorisé pour un déclenchement manuel (mêmes règles d'auth).
export async function POST(request: Request) {
  return GET(request);
}
