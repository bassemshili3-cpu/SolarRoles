import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  email: z.string().email(),
  frequency: z.enum(['weekly', 'twice']),
  what: z.string(),
  where: z.string(),
  salaryMin: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, frequency, what, where, salaryMin } = schema.parse(body)

    // Upsert = create or update if the user already has the exact same alert
    await prisma.jobAlert.upsert({
      where: { email_what_where: { email, what, where } },
      update: { frequency, salaryMin, active: true },
      create: {
        email,
        frequency: frequency === 'weekly' ? 'WEEKLY' : 'TWICE',
        what,
        where,
        salaryMin,
      },
    })

    // Confirmation email (professional touch)
    await resend.emails.send({
      from: 'alerts@oh-my-job.com', // ← change to your real domain
      to: email,
      subject: `✅ Alert activated for ${what} in ${where}!`,
      html: `
        <p>Hello,</p>
        <p>You are now subscribed to job alerts for <strong>${what}</strong> in <strong>${where}</strong>.</p>
        <p>You will receive new offers ${frequency === 'weekly' ? 'every Monday' : 'twice a week'}.</p>
        <p>Thank you for subscribing!</p>
        <p>Best regards,<br>The team</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }
}