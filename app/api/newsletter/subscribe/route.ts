import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    })

    if (existing) {
      if (!existing.active) {
        await prisma.newsletterSubscriber.update({
          where: { email: normalized },
          data: { active: true },
        })
        return NextResponse.json({ ok: true })
      }
      return NextResponse.json({ ok: true, already: true }, { status: 409 })
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email: normalized,
        sentSlugs: [],
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Newsletter subscribe error:', err.message)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
