import { Prisma, PrismaClient } from '@prisma/client'
import { buildJobSlug } from '../lib/slugify.ts'

const prisma = new PrismaClient()
const BATCH_SIZE = 500

type UnstableJob = {
  id: string
  title: string
  location: string
}

async function main() {
  let updated = 0

  while (true) {
    // Raw SQL intentionally keeps this backfill runnable while Prisma's local
    // generated client is temporarily locked by a running Node process.
    const jobs = await prisma.$queryRaw<UnstableJob[]>`
      SELECT id, title, location
      FROM "Job"
      WHERE "canonicalSlug" IS NULL
      ORDER BY id ASC
      LIMIT ${BATCH_SIZE}
    `

    if (jobs.length === 0) break

    const values = Prisma.join(
      jobs.map((job) => Prisma.sql`(${job.id}, ${buildJobSlug(job)})`),
    )

    await prisma.$executeRaw`
      UPDATE "Job" AS job
      SET "canonicalSlug" = updates.slug
      FROM (VALUES ${values}) AS updates(id, slug)
      WHERE job.id = updates.id AND job."canonicalSlug" IS NULL
    `
    updated += jobs.length

    console.log(`[canonical-slugs] ${updated} job(s) stabilised`)
  }

  console.log(`[canonical-slugs] Done: ${updated} job(s) stabilised`)
}

main()
  .catch((error) => {
    console.error('[canonical-slugs] Failed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
