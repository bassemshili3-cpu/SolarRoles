import { PrismaClient } from '@prisma/client'
import { load } from 'cheerio'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'

const dir = process.argv[2] || 'data/sales-costs'
if (existsSync(`${dir}/snapshot.json`)) throw new Error('Use a new directory to preserve the frozen snapshot')
const db = new PrismaClient()
try {
  const extractedAt = new Date()
  const jobs = await db.job.findMany({ where: { active: true, deletedAt: null, pausedAt: null, expiresAt: { gt: extractedAt } }, select: { id: true, title: true, company: true, location: true, description: true, url: true, applyUrl: true, source: true, fetchedAt: true }, orderBy: { id: 'asc' } })
  const rows = jobs.filter(j => /sales|setter|closer|canvass|energy advisor|solar consultant/i.test(j.title)).map(j => {
    const $ = load(j.description)
    $('script,style,noscript').remove()
    return { ...j, description: undefined, text: $.text().replace(/\s+/g, ' ').trim() }
  })
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/snapshot.json`, JSON.stringify({ extractedAt, activeRecords: jobs.length, titleRule: 'sales|setter|closer|canvass|energy advisor|solar consultant', rows }, null, 2))
  console.log(JSON.stringify({ extractedAt, activeRecords: jobs.length, candidates: rows.length }))
} finally { await db.$disconnect() }
