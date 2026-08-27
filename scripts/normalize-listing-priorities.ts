import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updates = await Promise.all([
    prisma.job.updateMany({
      where: { source: { in: ['adzuna'] } },
      data: { sourcePriority: 30 },
    }),
    prisma.job.updateMany({
      where: { source: { in: ['careerjet'] } },
      data: { sourcePriority: 20 },
    }),
    prisma.job.updateMany({
      where: { source: { in: ['lensa'] } },
      data: { sourcePriority: 21 },
    }),
    prisma.job.updateMany({
      where: { source: { in: ['jooble'] } },
      data: { sourcePriority: 22 },
    }),
    prisma.job.updateMany({
      where: {
        source: { notIn: ['adzuna', 'careerjet', 'lensa', 'jooble', 'whatjobs'] },
      },
      data: { sourcePriority: 0 },
    }),
  ])

  console.log(`Listing priorities normalized: ${updates.reduce((total, result) => total + result.count, 0)} job(s) updated.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
