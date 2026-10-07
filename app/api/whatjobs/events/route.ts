import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { throttleRequest } from '@/lib/requestThrottle'
import { whatJobsMetricBatchSchema } from '@/lib/whatjobsMetrics'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return new NextResponse(null, { status: 403 })
  if (!throttleRequest(request, 'whatjobs-events', 120, 60_000)) return new NextResponse(null, { status: 429 })
  if (Number(request.headers.get('content-length') || 0) > 32_000) return new NextResponse(null, { status: 413 })
  const text = await request.text()
  if (text.length > 32_000) return new NextResponse(null, { status: 413 })
  let parsed
  try { parsed = whatJobsMetricBatchSchema.safeParse(JSON.parse(text)) }
  catch { return new NextResponse(null, { status: 400 }) }
  if (!parsed.success) return new NextResponse(null, { status: 400 })
  try {
    await prisma.$executeRaw`
      INSERT INTO "WhatJobsMetric" ("id", "viewId", "surface", "type", "pagePath", "jobId", "publisher", "device", "activation", "pnpAvailable", "tokenPresent", "isTest")
      SELECT "id"::uuid, "viewId"::uuid, "surface", "type", "pagePath", "jobId", "publisher", "device", "activation", "pnpAvailable", "tokenPresent", "isTest"
      FROM jsonb_to_recordset(${JSON.stringify(parsed.data.events)}::jsonb) AS e(
        "id" text, "viewId" text, "surface" text, "type" text, "pagePath" text, "jobId" text, "publisher" text,
        "device" text, "activation" text, "pnpAvailable" boolean, "tokenPresent" boolean, "isTest" boolean
      ) ON CONFLICT ("id") DO NOTHING
    `
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    console.error('[whatjobs-events] persistence failed')
    return NextResponse.json({ error: 'Metrics unavailable.' }, { status: 503 })
  }
}
