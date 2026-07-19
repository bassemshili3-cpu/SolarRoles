// scripts/enrich-header-images.ts
import { prisma } from '../lib/prisma'
import { getJobHeaderImage } from '../lib/jobHeaderImage'

async function enrich() {
  const pending = await prisma.job.findMany({
    where: { needsHeaderImage: true, headerImage: null },
    take: 50,
  })

  for (const job of pending) {
    try {
      const url = await getJobHeaderImage(job.title)
      if (url) {
        await prisma.job.update({
          where: { id: job.id },
          data: { headerImage: url, needsHeaderImage: false },
        })
      } else {
        // Pas trouvé d'image, on flag false pour pas retry en boucle
        await prisma.job.update({
          where: { id: job.id },
          data: { needsHeaderImage: false },
        })
      }
      // Rate limit côté API externe
      await new Promise((r) => setTimeout(r, 200))
    } catch (e: any) {
      console.error(`Failed for ${job.id}:`, e.message)
    }
  }

  console.log(`Done. Processed ${pending.length} jobs.`)
}

enrich()