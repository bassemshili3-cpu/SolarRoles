import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { sendApplicationNotification } from '@/lib/sendApplicationNotification'
import { createServerSupabase } from '@/lib/supabase-server'
import { isOwnDashboardResume, RESUME_MAX_BYTES, validateResumeFile } from '@/lib/resume-storage'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  let uploadedPath: string | null = null
  let storage: ReturnType<Awaited<ReturnType<typeof createServerSupabase>>['storage']['from']> | null = null
  let applicationSaved = false
  try {
    const { id } = await params
    if (Number(request.headers.get('content-length') || 0) > RESUME_MAX_BYTES + 100_000) return NextResponse.json({ error: 'The resume must be 5 MB or smaller.' }, { status: 413 })
    const form = request.headers.get('content-type')?.includes('multipart/form-data') ? await request.formData() : null
    const body = form ? Object.fromEntries(form.entries()) : await request.json()
    const { name, email, message, resumePath, resumeFile } = body
    let resumeUrl = body.resumeUrl
    if (typeof name !== 'string' || !name.trim() || name.length > 120) return NextResponse.json({ error: 'A name is required (max 120 characters).' }, { status: 400 })
    if (typeof email !== 'string' || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email.trim())) return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    if (message && (typeof message !== 'string' || message.length > 10_000)) return NextResponse.json({ error: 'The message must be 10,000 characters or fewer.' }, { status: 400 })
    if (resumeUrl && (typeof resumeUrl !== 'string' || !/^https?:\/\//.test(resumeUrl))) return NextResponse.json({ error: 'Invalid resume link.' }, { status: 400 })
    if ([resumeUrl, resumePath, resumeFile].filter(Boolean).length > 1) return NextResponse.json({ error: 'Choose one resume only.' }, { status: 400 })
    const job = await prisma.job.findUnique({ where: { id }, select: { id: true, source: true, active: true, deletedAt: true, expiresAt: true, title: true, postedByUserId: true, applyUrl: true } })
    if (!job || !job.active || job.deletedAt || (job.expiresAt && job.expiresAt <= new Date())) return NextResponse.json({ error: 'This job is no longer accepting applications.' }, { status: 404 })
    if (job.source !== 'employer') return NextResponse.json({ error: 'This job does not accept applications on Solar Roles.' }, { status: 400 })

    let resumeAttachment: { filename: string; content: Buffer } | undefined
    if (resumePath || resumeFile) {
      const supabase = await createServerSupabase()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return NextResponse.json({ error: 'Sign in to attach your resume.' }, { status: 401 })
      storage = supabase.storage.from('resumes')
      let file: Blob
      let filename: string
      if (resumePath) {
        if (typeof resumePath !== 'string' || !isOwnDashboardResume(resumePath, user.id)) return NextResponse.json({ error: 'Choose a resume from your own dashboard.' }, { status: 403 })
        const { data, error } = await storage.download(resumePath)
        if (error || !data) return NextResponse.json({ error: 'Could not read your saved resume. Choose it again or attach a new file.' }, { status: 400 })
        file = data
        filename = resumePath.split('/').pop()!
        if (filename.startsWith(`${user.id}-`)) filename = filename.slice(user.id.length + 1)
        filename = filename.replace(/^\d+-/, '')
      } else {
        if (!(resumeFile instanceof File)) return NextResponse.json({ error: 'Invalid resume file.' }, { status: 400 })
        file = resumeFile
        filename = resumeFile.name
      }
      let contentType: string
      try { contentType = validateResumeFile({ name: filename, size: file.size }).contentType }
      catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid resume.' }, { status: 400 }) }
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-160)
      const path = `${user.id}/applications/${randomUUID()}-${safeName}`
      const { error: uploadError } = await storage.upload(path, file, { contentType, upsert: false })
      if (uploadError) throw new Error('Could not attach your resume. Please try again.')
      uploadedPath = path
      // Application copies are independent of the editable dashboard resume.
      const { data: signed, error: signError } = await storage.createSignedUrl(path, 365 * 24 * 3600)
      if (signError || !signed) throw new Error('Could not create the resume link. Please try again.')
      resumeUrl = signed.signedUrl
      resumeAttachment = { filename: safeName, content: Buffer.from(await file.arrayBuffer()) }
    }
    const application = await prisma.jobApplication.create({ data: { jobId: job.id, name: name.trim(), email: email.trim(), resumeUrl: resumeUrl?.trim() || null, message: message?.trim() || null } })
    applicationSaved = true
    const employerEmail = job.applyUrl?.startsWith('mailto:') ? job.applyUrl.replace('mailto:', '') : null
    if (employerEmail) await sendApplicationNotification({ employerEmail, jobTitle: job.title, candidateName: name.trim(), candidateEmail: email.trim(), resumeUrl: resumeUrl?.trim() || null, message: message?.trim() || null, resumeAttachment })
    return NextResponse.json({ ok: true, id: application.id }, { status: 201 })
  } catch (error) {
    if (uploadedPath && storage && !applicationSaved) await storage.remove([uploadedPath]).catch(() => {})
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid application.' }, { status: 400 })
    console.error('[job application]', { name: error instanceof Error ? error.name : 'unknown' })
    return NextResponse.json({ error: 'Could not submit your application. Please try again.' }, { status: 500 })
  }
}
