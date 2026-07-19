// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

function buildDatabaseUrl(): string {
  const base = process.env.DATABASE_URL!
  const separator = base.includes('?') ? '&' : '?'
  // Ajoute connection_limit et pool_timeout par-dessus l'URL fournie par
  // l'intégration Vercel-Neon, sans avoir à éditer la variable d'env elle-même
  // (son UI ne permet pas d'ajouter des query params custom).
  return `${base}${separator}connection_limit=15&pool_timeout=30`
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: buildDatabaseUrl() },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma