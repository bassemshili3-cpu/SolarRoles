// cleanup-jobs.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MIN_LENGTH = 60;

async function main() {
  const jobs = await prisma.job.findMany({
    select: { id: true, title: true, company: true, description: true },
  });

  const toDelete = jobs.filter(
    (job) => !job.description || job.description.trim().length < MIN_LENGTH
  );

  console.log(`Total jobs: ${jobs.length}`);
  console.log(`Jobs à supprimer (description < ${MIN_LENGTH} caractères): ${toDelete.length}`);

  // Aperçu avant suppression
  toDelete.slice(0, 15).forEach((j) =>
    console.log(`- [${j.id}] "${j.title}" (${j.company}) -> "${j.description}"`)
  );

  if (toDelete.length === 0) {
    console.log('Rien à supprimer.');
    return;
  }

  const result = await prisma.job.deleteMany({
    where: { id: { in: toDelete.map((j) => j.id) } },
  });

  console.log(`Supprimés: ${result.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });