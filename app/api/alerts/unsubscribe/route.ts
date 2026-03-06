import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
  }

  await prisma.jobAlert.update({
    where: { id },
    data: { active: false },
  })

  return new Response(`
    <h1 style="text-align:center; margin-top:80px; font-family:sans-serif; color:#10b981;">
      ✅ You have been successfully unsubscribed.<br><br>
      <a href="${process.env.NEXT_PUBLIC_URL}" style="color:#000; text-decoration:underline;">Back to the website</a>
    </h1>
  `, {
    headers: { 'Content-Type': 'text/html' },
  })
}