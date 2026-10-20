import { PrismaClient } from '@prisma/client';

export function seedRewriteDatabaseUrl(base: string): string {
  const url = new URL(base);
  // Queue transactions must not reuse prepared result types across pooled
  // sessions/schema changes. Keep this isolated from the site's Prisma pool.
  url.searchParams.set('statement_cache_size', '0');
  url.searchParams.set('connection_limit', '2');
  url.searchParams.set('pool_timeout', '30');
  return url.href;
}

const cache = globalThis as unknown as { seedRewritePrisma?: PrismaClient };
export function getSeedRewritePrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) throw Error('DATABASE_URL is required');
  return cache.seedRewritePrisma ??= new PrismaClient({
    datasources: { db: { url: seedRewriteDatabaseUrl(process.env.DATABASE_URL) } },
  });
}
