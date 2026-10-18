import type { Prisma } from '@prisma/client';

/** Called inside the seed's insertion transaction: both writes commit together. */
export async function enqueueSeedRewrite(tx: Pick<Prisma.TransactionClient, '$executeRaw'>, jobId: string) {
  await tx.$executeRaw`
    INSERT INTO "SeoRewriteTask" ("jobId") VALUES (${jobId}) ON CONFLICT ("jobId") DO NOTHING
  `;
}
