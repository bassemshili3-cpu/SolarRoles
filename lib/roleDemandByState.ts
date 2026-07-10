// lib/roleDemandByState.ts
// Lecture simple depuis la table pré-calculée par le cron (voir
// app/api/cron/role-demand/route.ts) — plus aucune query ILIKE coûteuse
// exécutée au moment du render de la page job.

import { prisma } from '@/lib/prisma'

export type StateDemand = { state: string; count: number }

export async function getRoleDemandByState(roleSlug: string): Promise<StateDemand[]> {
  try {
    const rows = await prisma.roleStateDemand.findMany({
      where: { roleSlug },
      select: { state: true, count: true },
    })
    return rows
  } catch (err: any) {
    console.error('getRoleDemandByState error:', err.message)
    return []
  }
}