// app/api/seed/route.ts — TEMPORAIRE, supprimer après

import { NextResponse } from 'next/server'
import { syncAllJobs } from '@/lib/job-sync'

export async function GET() {
  const results = []

  for (let page = 1; page <= 10; page++) {
    try {
      const result = await syncAllJobs(page, 50)
      results.push({ page, adzuna: result.adzuna.saved, jooble: result.jooble.saved })
      console.log(`📥 Page ${page}: Adzuna +${result.adzuna.saved}, Jooble +${result.jooble.saved}`)
    } catch (e: any) {
      results.push({ page, error: e.message })
    }
    // Pause 2s entre les pages
    await new Promise((r) => setTimeout(r, 2000))
  }

  return NextResponse.json({ results })
}