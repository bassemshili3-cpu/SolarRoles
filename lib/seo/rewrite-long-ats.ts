import { Prisma, PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'
import { ATS_JOB_SOURCES } from '../ats-sources'
import { rewriteJobDescriptionForSeo, SEO_REWRITE_VERSION } from './rewrite-description'

export function validateBoundedRewrite(html: string, maxCharacters = 3000) {
  const length = Array.from(html).length
  if (!html.trim() || length > maxCharacters) throw new Error(`Rewritten HTML has ${length} characters (maximum ${maxCharacters})`)
  const $ = load(html, null, false)
  if ($('*').toArray().some(element => !('tagName' in element) || !('attribs' in element) || !['p', 'h3', 'ul', 'li', 'strong', 'em', 'br'].includes(element.tagName) || Object.keys(element.attribs || {}).length)) throw new Error('Unsupported HTML tags or attributes')
  if (!$('p').length || !$('li').length) throw new Error('Missing introduction or factual bullet lists')
  if (/(?:more than (?:just )?a (?:job|role)|not just|isn.t just|rockstar|ninja|world.class)/i.test($.text())) throw new Error('Banned wording in output')
  for (const heading of $('h3').toArray()) {
    const label = $(heading).text().trim()
    if (!['Responsibilities', 'Requirements', 'Benefits'].includes(label)) throw new Error('Unexpected section heading')
    if (label !== 'Benefits' && $(heading).next().prop('tagName') !== 'UL') throw new Error(`${label} must use a bullet list`)
  }
  return length
}

type JobSnapshot = { id: string; title: string; company: string; location: string; source: string; description: string; seoDescription: string | null; seoDescriptionVersion: number }

export async function rewriteLongAtsDescriptions(prisma: PrismaClient, args: string[]) {
  const dryRun = args.includes('--dry-run')
  const resumeIndex = args.indexOf('--resume')
  const directory = path.resolve(resumeIndex >= 0 ? args[resumeIndex + 1] : `data/seo-rewrites/ats-over-3000-${new Date().toISOString().replace(/[:.]/g, '-')}`)
  fs.mkdirSync(directory, { recursive: true })
  const manifestPath = path.join(directory, 'originals.json')
  const ledgerPath = path.join(directory, 'results.jsonl')
  const lockPath = path.join(directory, 'run.lock')
  const lock = fs.openSync(lockPath, 'wx')
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }))
  try {
    const jobs: JobSnapshot[] = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : await prisma.$queryRaw`
      SELECT id, title, company, location, source, description, "seoDescription", "seoDescriptionVersion"
      FROM "Job" WHERE source IN (${Prisma.join([...ATS_JOB_SOURCES])}) AND char_length(description) > 3000 ORDER BY id
    `
    if (!fs.existsSync(manifestPath)) fs.writeFileSync(manifestPath, JSON.stringify(jobs, null, 2), { flag: 'wx' })
    console.log(JSON.stringify({ directory, selected: jobs.length, dryRun, maxCharacters: 3000, destination: 'seoDescription', originalsPreserved: true }))
    if (dryRun || !jobs.length) return
    const completed = new Set<string>()
    if (fs.existsSync(ledgerPath)) {
      for (const line of fs.readFileSync(ledgerPath, 'utf8').split('\n').filter(Boolean)) {
        const record = JSON.parse(line)
        if (record.status === 'updated' || record.status === 'already-valid') completed.add(record.id)
      }
    }
    let updated = 0, skipped = 0, failed = 0
    const append = (record: object) => fs.appendFileSync(ledgerPath, JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n')
    for (const job of jobs) {
      if (completed.has(job.id)) { skipped++; continue }
      const current = await prisma.job.findUnique({ where: { id: job.id }, select: { description: true, seoDescription: true, seoDescriptionVersion: true } })
      if (!current || current.description !== job.description) { append({ id: job.id, status: 'source-changed' }); skipped++; continue }
      if (current.seoDescriptionVersion >= SEO_REWRITE_VERSION && current.seoDescription) {
        try { validateBoundedRewrite(current.seoDescription); append({ id: job.id, status: 'already-valid' }); skipped++; continue } catch {}
      }
      let accepted = false
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          append({ id: job.id, status: 'call-start', attempt })
          const html = await rewriteJobDescriptionForSeo(job, { maxCharacters: 3000, attempt })
          // Save every response for review, including rejected responses.
          fs.writeFileSync(path.join(directory, `${encodeURIComponent(job.id)}-attempt-${attempt}.html`), html)
          const length = validateBoundedRewrite(html)
          const changed = await prisma.job.updateMany({ where: { id: job.id, description: job.description, seoDescription: current.seoDescription, seoDescriptionVersion: current.seoDescriptionVersion }, data: { seoDescription: html, seoDescriptionVersion: SEO_REWRITE_VERSION, lastGoogleIndexingSubmittedAt: null } })
          if (!changed.count) { append({ id: job.id, status: 'concurrent-change' }); skipped++ }
          else { append({ id: job.id, status: 'updated', length }); updated++ }
          accepted = true
          break
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown rewrite error'
          append({ id: job.id, status: 'attempt-failed', attempt, message })
          if (/credits|spending limit|unauthorized|forbidden|invalid api key/i.test(message) || (error as { statusCode?: number }).statusCode === 403 || (error as { statusCode?: number }).statusCode === 401) throw error
          if ((error as { statusCode?: number }).statusCode === 429) await new Promise(resolve => setTimeout(resolve, 30_000))
          else await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      if (!accepted) { failed++; append({ id: job.id, status: 'failed-no-update' }) }
      console.log(JSON.stringify({ progress: updated + skipped + failed, selected: jobs.length, updated, skipped, failed }))
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    const verification = await prisma.$queryRaw<{ oversized: number; rewritten: number }[]>`
      SELECT COUNT(*) FILTER (WHERE char_length("seoDescription") > 3000)::int AS oversized,
        COUNT(*) FILTER (WHERE "seoDescription" IS NOT NULL AND char_length("seoDescription") <= 3000)::int AS rewritten
      FROM "Job" WHERE id IN (${Prisma.join(jobs.map(job => job.id))})
    `
    console.log(JSON.stringify({ finished: true, selected: jobs.length, updated, skipped, failed, verification: verification[0], directory }))
    fs.writeFileSync(path.join(directory, 'summary.json'), JSON.stringify({ selected: jobs.length, updated, skipped, failed }, null, 2))
  } finally { fs.closeSync(lock); fs.unlinkSync(lockPath) }
}
