// app/api/cron/sync-greenhouse/route.ts
// ─── Cron : Sync Greenhouse Job Boards → DB ───────────────────────────────
// L'API Greenhouse est publique (GET sans clé).
// Chaque entreprise a son propre board token.
// Schedule: toutes les 6h via vercel.json

import { NextRequest, NextResponse } from 'next/server'
import { fetchGreenhouseJobs, normalizeGreenhouse } from '@/lib/greenhouse'
import { prisma } from '@/lib/prisma'

const BOARDS = [
  // Tech / SaaS
  { token: 'airbnb', name: 'Airbnb' },
  { token: 'lyft', name: 'Lyft' },
  { token: 'pinterest', name: 'Pinterest' },
  { token: 'coinbase', name: 'Coinbase' },
  { token: 'robinhood', name: 'Robinhood' },
  { token: 'brex', name: 'Brex' },
  { token: 'plaid', name: 'Plaid' },
  { token: 'figma', name: 'Figma' },
  { token: 'notion', name: 'Notion' },
  { token: 'airtable', name: 'Airtable' },
  { token: 'asana', name: 'Asana' },
  { token: 'cloudflare', name: 'Cloudflare' },
  { token: 'databricks', name: 'Databricks' },
  { token: 'discord', name: 'Discord' },
  { token: 'duolingo', name: 'Duolingo' },
  { token: 'gitlab', name: 'GitLab' },
  { token: 'instacart', name: 'Instacart' },
  { token: 'lattice', name: 'Lattice' },
  { token: 'mongodb', name: 'MongoDB' },
  { token: 'okta', name: 'Okta' },
  { token: 'reddit', name: 'Reddit' },
  { token: 'squarespace', name: 'Squarespace' },
  { token: 'twilio', name: 'Twilio' },
  { token: 'zapier', name: 'Zapier' },
  { token: 'nextdoor', name: 'Nextdoor' },
  { token: 'hubspot', name: 'HubSpot' },
  { token: 'zendesk', name: 'Zendesk' },
  { token: 'dropbox', name: 'Dropbox' },
  { token: 'ramp', name: 'Ramp' },
  { token: 'rippling', name: 'Rippling' },
  { token: 'gusto', name: 'Gusto' },
  { token: 'mixpanel', name: 'Mixpanel' },
  { token: 'segment', name: 'Segment' },
  { token: 'lever', name: 'Lever' },
  { token: 'clickup', name: 'ClickUp' },
  { token: 'loom', name: 'Loom' },
  { token: 'miro', name: 'Miro' },
  { token: 'carta', name: 'Carta' },
  { token: 'benchling', name: 'Benchling' },
  { token: 'verkada', name: 'Verkada' },
  { token: 'density', name: 'Density' },
  { token: 'gem', name: 'Gem' },
  { token: 'ironclad', name: 'Ironclad' },
  { token: 'scale', name: 'Scale AI' },
  { token: 'weights-and-biases', name: 'Weights & Biases' },
  // Finance / Fintech
  { token: 'chime', name: 'Chime' },
  { token: 'marqeta', name: 'Marqeta' },
  { token: 'affirm', name: 'Affirm' },
  { token: 'klarna', name: 'Klarna' },
  // Media / Entertainment
  { token: 'buzzfeed', name: 'BuzzFeed' },
  { token: 'vox', name: 'Vox Media' },
  // Healthcare / Biotech
  { token: 'tempus', name: 'Tempus' },
  { token: 'modernhealth', name: 'Modern Health' },
  { token: 'headspace', name: 'Headspace' },
  // Retail / E-commerce
  { token: 'poshmark', name: 'Poshmark' },
  { token: 'reverb', name: 'Reverb' },
]

const EXPIRY_DAYS = 30

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('🌱 === CRON SYNC-GREENHOUSE START ===')

  let totalSaved = 0
  let totalErrors = 0
  let totalSkipped = 0

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS)

  for (const board of BOARDS) {
    try {
      const data = await fetchGreenhouseJobs(board.token)

      if (!data?.jobs?.length) {
        totalSkipped++
        continue
      }

      console.log(`📥 Greenhouse [${board.name}]: ${data.jobs.length} jobs`)

      for (const rawJob of data.jobs) {
        const job = normalizeGreenhouse(rawJob, board.name)
        try {
          await prisma.job.upsert({
            where: { id: job.id },
            update: {
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              applyUrl: job.applyUrl,
              fetchedAt: new Date(),
              expiresAt,
              active: true,
            },
            create: {
              id: job.id,
              source: 'greenhouse',
              title: job.title,
              company: job.company,
              location: job.location,
              addressRegion: '',
              description: job.description,
              url: job.url,
              applyUrl: job.applyUrl,
              salaryMin: null,
              salaryMax: null,
              postedAt: job.postedAt,
              fetchedAt: new Date(),
              expiresAt,
              active: true,
            },
          })
          totalSaved++
        } catch {
          totalErrors++
        }
      }

      await new Promise((r) => setTimeout(r, 500))
    } catch (e: any) {
      console.warn(`⚠️ Greenhouse skip [${board.token}]: ${e.message}`)
      totalSkipped++
    }
  }

  console.log(`✅ CRON SYNC-GREENHOUSE END — saved: ${totalSaved}, errors: ${totalErrors}, skipped: ${totalSkipped}`)

  return NextResponse.json({
    success: true,
    saved: totalSaved,
    errors: totalErrors,
    skipped: totalSkipped,
    boards: BOARDS.length,
  })
}
