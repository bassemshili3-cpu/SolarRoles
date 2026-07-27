import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const result = await p.job.groupBy({
    by: ['source'],
    _count: { source: true },
  });
  console.table(result);
  await p.$disconnect();
}

main();