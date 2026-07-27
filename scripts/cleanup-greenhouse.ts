import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Dry run d'abord — juste un comptage, rien n'est supprimé
  const toDelete = await p.job.count({ where: { source: 'greenhouse' } });
  console.log(`${toDelete} job(s) avec source="greenhouse" seront supprimés.`);

  // Décommente les 2 lignes suivantes une fois le chiffre ci-dessus vérifié
  const result = await p.job.deleteMany({ where: { source: 'greenhouse' } });
  console.log(`Supprimé : ${result.count}`);

  await p.$disconnect();
}

main();