import { PrismaClient } from '@prisma/client'
import { load } from 'cheerio'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const db = new PrismaClient()
const date = new Date()
const output = process.argv[2] || 'data/remote-travel'
if (existsSync(`${output}/candidates.json`)) throw new Error('Snapshot exists. Supply a new output directory to preserve the reviewed evidence.')
try {
  const jobs = await db.job.findMany({
    where: { active: true, deletedAt: null, pausedAt: null, expiresAt: { gt: date } },
    select: { id: true, title: true, company: true, location: true, addressRegion: true, locationRegions: true, canonicalSlug: true, description: true, url: true, applyUrl: true, source: true, fetchedAt: true, postedAt: true },
    orderBy: { id: 'asc' },
  })
  const candidates = jobs.map(job => {
    const $ = load(job.description)
    $('script, style, noscript').remove()
    $('br, p, li, div, h2, h3').each((_, el) => { $(el).append('\n') })
    const text = $.text().replace(/[\t ]+/g, ' ').replace(/\n\s*\n/g, '\n').trim()
    return { ...job, description: undefined, text }
  }).filter(job => /\bremotely?\b|\bremote\b|work.from.home|work.at.home|home.based|telecommut|telework|\bwfh\b/i.test(`${job.title} ${job.location} ${job.text}`))
  mkdirSync(output, { recursive: true })
  writeFileSync(`${output}/candidates.json`, JSON.stringify({ extractedAt: date.toISOString(), activeJobs: jobs.length, candidates }, null, 2))
  console.log(JSON.stringify({ extractedAt: date.toISOString(), activeJobs: jobs.length, candidates: candidates.length }))
} finally { await db.$disconnect() }
