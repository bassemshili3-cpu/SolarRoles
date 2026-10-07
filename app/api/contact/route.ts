import { NextResponse } from 'next/server'
import { throttleRequest } from '@/lib/requestThrottle'

const CONTACT_EMAIL = 'contact@solarroles.com'
const MAX_NAME_LENGTH = 120
const MAX_SUBJECT_LENGTH = 120
const MAX_MESSAGE_LENGTH = 10_000

function readRequiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required.`)
  }

  const normalized = value.trim()
  if (normalized.length > maxLength) {
    throw new Error(`${field} is too long.`)
  }

  return normalized
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}

export async function POST(req: Request) {
  try {
    if (!throttleRequest(req, 'contact')) return NextResponse.json({ error: 'Please wait before sending another message.' }, { status: 429, headers: { 'Retry-After': '600' } })
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('[contact route] RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Contact email is temporarily unavailable.' }, { status: 503 })
    }

    if (Number(req.headers.get('content-length') || 0) > 50_000) return NextResponse.json({ error: 'Message is too large.' }, { status: 413 })
    const body = await req.json()
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    if (body.website) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    const name = readRequiredString(body.name, 'Name', MAX_NAME_LENGTH)
    const email = readRequiredString(body.email, 'Email', 254)
    const subject = readRequiredString(body.subject, 'Subject', MAX_SUBJECT_LENGTH)
    const message = readRequiredString(body.message, 'Message', MAX_MESSAGE_LENGTH)

    if (!/^\S+@\S+\.\S+$/.test(email) || /[\r\n]/.test(email + subject)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(10_000), headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'SolarRoles <noreply@solarroles.com>',
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: `[Contact] ${subject}`,
      text: `New contact message — Solar Roles\n\nFrom: ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\nSent from the contact form at solarroles.com.`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1A1A1A">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:24px;border-bottom:2px solid #1a2340;padding-bottom:12px">
            New contact message — Solar Roles
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:8px 0;font-size:13px;font-weight:600;color:#666;width:100px">From</td>
              <td style="padding:8px 0;font-size:15px">${safeName} &lt;${safeEmail}&gt;</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;font-weight:600;color:#666">Subject</td>
              <td style="padding:8px 0;font-size:15px">${safeSubject}</td>
            </tr>
          </table>
          <div style="background:#f8f9fa;border-left:4px solid #2B4ACB;padding:20px;border-radius:4px">
            <p style="font-size:13px;font-weight:600;color:#2B4ACB;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Message</p>
            <p style="font-size:15px;line-height:1.7;color:#333;white-space:pre-wrap">${safeMessage}</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px">
            Sent from the contact form at solarroles.com · Reply directly to this email to respond to ${safeName}.
          </p>
        </div>
      `,
    }) })
    const delivery = await response.json().catch(() => null)
    if (!response.ok || !delivery?.id) {
      console.error('[contact route] Resend rejected the message', { status: response.status, code: delivery?.name })
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 })
    }

    console.info('[contact route] Message accepted', { id: delivery?.id })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    if (err instanceof Error && /is required|is too long/.test(err.message)) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    console.error('[contact route]', { name: err instanceof Error ? err.name : 'unknown' })
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
