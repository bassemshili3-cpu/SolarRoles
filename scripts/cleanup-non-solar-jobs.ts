// scripts/cleanup-non-solar-jobs.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_SOURCES = ['lever', 'pinpoint', 'workable']; // ajuste selon tes vraies sources SolarRoles

async function main() {
  // Dry run d'abord — compte sans supprimer
  const toDelete = await prisma.job.count({
    where: { source: { notIn: VALID_SOURCES } },
  });
  console.log(`${toDelete} job(s) à supprimer (sources hors ${VALID_SOURCES.join(', ')})`);

  // Décommente les 2 lignes suivantes une fois que le chiffre ci-dessus te semble correct
  // const result = await prisma.job.deleteMany({ where: { source: { notIn: VALID_SOURCES } } });
  // console.log(`Supprimé : ${result.count}`);

  await prisma.$disconnect();
}
main();