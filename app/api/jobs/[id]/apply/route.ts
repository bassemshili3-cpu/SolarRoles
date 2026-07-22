// app/api/jobs/[id]/apply/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendApplicationNotification } from '@/lib/sendApplicationNotification'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, email, resumeUrl, message } = body

  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'A name is required.' }, { status: 400 })
  }
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (resumeUrl && (typeof resumeUrl !== 'string' || !/^https?:\/\//.test(resumeUrl))) {
    return NextResponse.json({ error: 'Invalid resume link.' }, { status: 400 })
  }

  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      source: true,
      active: true,
      deletedAt: true,
      title: true,
      postedByUserId: true,
      applyUrl: true,
    },
  })

  if (!job || !job.active || job.deletedAt) {
    return NextResponse.json({ error: 'This job is no longer accepting applications.' }, { status: 404 })
  }

  // Seuls les jobs postés directement sur Oh My Job acceptent des candidatures internes.
  // Les jobs agrégés (Jooble/Lensa/CareerJet/Adzuna) redirigent toujours en externe via /jobs/[id]/go.
  if (job.source !== 'employer') {
    return NextResponse.json({ error: 'This job does not accept applications on Oh My Job.' }, { status: 400 })
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: job.id,
      name: name.trim(),
      email: email.trim(),
      resumeUrl: resumeUrl?.trim() || null,
      message: message?.trim() || null,
    },
  })

  const employerEmail = job.applyUrl?.startsWith('mailto:')
    ? job.applyUrl.replace('mailto:', '')
    : null

  if (employerEmail) {
    await sendApplicationNotification({
      employerEmail,
      jobTitle: job.title,
      candidateName: name.trim(),
      candidateEmail: email.trim(),
      resumeUrl: resumeUrl?.trim() || null,
      message: message?.trim() || null,
    })
  }

  return NextResponse.json({ ok: true, id: application.id }, { status: 201 })
}