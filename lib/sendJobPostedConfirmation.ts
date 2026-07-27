// lib/sendJobPostedConfirmation.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendJobPostedConfirmation(params: {
  employerEmail: string
  jobTitle: string
  jobUrl: string
  expiresAt: Date
}) {
  const { employerEmail, jobTitle, jobUrl, expiresAt } = params

  const expiresLabel = expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  try {
    await resend.emails.send({
      from: 'Solar Roles <applications@solarroles.com>',
      to: employerEmail,
      subject: `Your job is live: ${jobTitle}`,
      text: [
        `Your listing "${jobTitle}" is now live on Solar Roles.`,
        ``,
        `View it here: ${jobUrl}`,
        ``,
        `It will stay active until ${expiresLabel}. Applications will be sent to this email as they come in.`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('Failed to send job posted confirmation:', err)
    // On ne bloque jamais la création du job si l'email échoue — le job reste en base.
  }
}