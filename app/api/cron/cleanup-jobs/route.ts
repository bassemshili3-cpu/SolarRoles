import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deleted = await prisma.job.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { active: false },
        { fetchedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    },
  })

  return NextResponse.json({
    deleted: deleted.count,
    timestamp: new Date().toISOString(),
  })
}