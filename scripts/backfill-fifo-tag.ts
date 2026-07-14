// scripts/backfill-fifo-tag.ts
import { prisma } from '@/lib/prisma'
import { isFifoJob } from '@/lib/classifyJob'

const BATCH_SIZE = 500

async function main() {
  let cursor: string | undefined = undefined
  let processed = 0
  let flagged = 0

  while (true) {
    const jobs = await prisma.job.findMany({
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, title: true, description: true },
    })

    if (jobs.length === 0) break

    const updates = jobs
      .map((job) => ({ id: job.id, isFifo: isFifoJob(job.title, job.description) }))
      .filter((j) => j.isFifo) // pas besoin d'update les false, déjà la valeur par défaut

    if (updates.length > 0) {
      await prisma.$transaction(
        updates.map((u) => prisma.job.update({ where: { id: u.id }, data: { isFifo: true } })),
      )
      flagged += updates.length
    }

    processed += jobs.length
    cursor = jobs[jobs.length - 1].id
    console.log(`Processed ${processed}, flagged ${flagged} so far`)
  }

  console.log(`Done. Total flagged: ${flagged}`)
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })