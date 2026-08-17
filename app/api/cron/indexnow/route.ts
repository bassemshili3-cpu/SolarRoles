// app/api/cron/indexnow/route.ts
// Cron endpoint for IndexNow URL submission
// Triggered by Vercel Cron (auth via header Authorization: Bearer {CRON_SECRET},
// injecté automatiquement par Vercel — voir vercel.json, plus de secret en query string)

import { NextResponse } from 'next/server';
import { submitUrls, isIndexNowConfigured } from '@/lib/indexnow';
import { CERTIFICATIONS } from '@/app/certifications/[slug]/certifications-data';

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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.solarroles.com';
    const urlsToSubmit: string[] = [];

    // 1. Collect certification pages
    const certUrls = CERTIFICATIONS.map(cert => `${baseUrl}/certifications/${cert.slug}`);
    urlsToSubmit.push(...certUrls);
    console.log(`[IndexNow Cron] Added ${certUrls.length} certification URLs`);

    // 2. Collect resource pages (static list from sitemap)
    const resourcePages = [
      'how-to-become-a-solar-installer',
      'how-to-get-a-solar-apprenticeship',
      'manufacturer-certifications-tesla-enphase-solaredge',
      'nabcep-training-providers-compared',
      'nabcep-vs-eta-vs-state-licenses',
      'osha-safety-guide-solar-installers',
      'solar-dc-safety-for-electricians',
      'solar-certifications-by-job-role',
      'solar-installer-apprenticeship-programs',
      'solar-installer-certification',
      'how-to-get-nabcep-certified',
      'nabcep-board-eligible-status',
      'nabcep-project-credits-explained',
      'nabcep-pvip-pass-rate',
      'nabcep-pvis-vs-pvip',
      'solar-sales-1099-vs-w2-pay',
      'do-you-need-to-be-an-electrician-for-bess',
    ];
    const resourceUrls = resourcePages.map(slug => `${baseUrl}/resources/${slug}`);
    urlsToSubmit.push(...resourceUrls);
    console.log(`[IndexNow Cron] Added ${resourceUrls.length} resource URLs`);

    // 3. Collect blog pages
    const blogPages = [
      'how-to-land-first-solar-job',
      'become-solar-installer-no-experience',
      'what-does-a-solar-installer-do',
    ];
    const blogUrls = blogPages.map(slug => `${baseUrl}/blog/${slug}`);
    urlsToSubmit.push(...blogUrls);
    console.log(`[IndexNow Cron] Added ${blogUrls.length} blog URLs`);

    // 4. Collect ATS job pages (dynamic - from sitemap logic)
    // Note: This is a simplified version. In production, you'd want to
    // fetch the actual job URLs from your database or sitemap.
    // For now, we'll include the main job landing pages
    const jobLandingPages = [
      'solar-pv-installer-jobs',
      'solar-electrician-jobs',
      'solar-technician-jobs',
      'lead-solar-installer-jobs',
      'solar-jobs-no-experience',
      'solar-sales-jobs',
      'bess-technician-jobs',
    ];
    const jobUrls = jobLandingPages.map(slug => `${baseUrl}/${slug}`);
    urlsToSubmit.push(...jobUrls);
    console.log(`[IndexNow Cron] Added ${jobUrls.length} job landing URLs`);

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