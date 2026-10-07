// Read-only by default. Explicit --apply is required for any database writes.
import { prisma } from '../lib/prisma'
import { getCanonicalJobUrl, isInternalJobUrl } from '../lib/job-url'
import { getCanonicalJobSlug } from '../lib/slugify'
import { writeFileSync } from 'node:fs'

async function main() {
  const apply = process.argv.includes('--apply')
  const rows = await prisma.job.findMany({
    where: { OR: [
      { source: 'employer' },
      ...['/jobs/', 'https://solarroles.com/jobs/', 'https://www.solarroles.com/jobs/', 'http://solarroles.com/jobs/', 'http://www.solarroles.com/jobs/']
        .map(prefix => ({ url: { startsWith: prefix } })),
    ] },
    select: { id: true, source: true, url: true, title: true, location: true, canonicalSlug: true },
  })
  const changes = rows.filter(job => job.source === 'employer' || isInternalJobUrl(job.url))
    .map(job => ({ job, url: getCanonicalJobUrl(job), slug: getCanonicalJobSlug(job) }))
    .filter(({ job, url, slug }) => job.url !== url || job.canonicalSlug !== slug)
  let updated = 0
  if (apply) for (const { job, url, slug } of changes) {
    // Compare-and-swap avoids overwriting an edit or slug change during the run.
    const result = await prisma.job.updateMany({
      where: { id: job.id, url: job.url, canonicalSlug: job.canonicalSlug, title: job.title, location: job.location },
      data: { url, canonicalSlug: slug },
    })
    updated += result.count
  }
  const result = { at: new Date().toISOString(), mode: apply ? 'apply' : 'dry-run', inspected: rows.length, affected: changes.length, updated, changes: changes.map(({ job, url, slug }) => ({ id: job.id, source: job.source, before: job.url, after: url, canonicalSlug: slug })) }
  const output = process.argv.find(arg => arg.startsWith('--report='))?.slice('--report='.length)
  if (output) writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ ...result, changes: undefined }, null, 2))
}

main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
