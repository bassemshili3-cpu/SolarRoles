// lib/sendApplicationNotification.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApplicationNotification(params: {
  employerEmail: string
  jobTitle: string
  candidateName: string
  candidateEmail: string
  resumeUrl?: string | null
  message?: string | null
}) {
  const { employerEmail, jobTitle, candidateName, candidateEmail, resumeUrl, message } = params

  try {
    await resend.emails.send({
      from: 'Oh My Job <applications@oh-my-job.com>',
      to: employerEmail,
      subject: `New application: ${jobTitle}`,
      text: [
        `${candidateName} applied to "${jobTitle}" on Oh My Job.`,
        ``,
        `Email: ${candidateEmail}`,
        resumeUrl ? `Resume: ${resumeUrl}` : null,
        message ? `Message: ${message}` : null,
      ].filter(Boolean).join('\n'),
    })
  } catch (err) {
    console.error('Failed to send application notification:', err)
    // On ne bloque jamais la candidature si l'email échoue — elle reste en base.
  }
}