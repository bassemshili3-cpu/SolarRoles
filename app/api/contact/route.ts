import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Oh My Job <noreply@oh-my-job.com>',
      to: 'contact@oh-my-job.com',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1A1A1A">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:24px;border-bottom:2px solid #1a2340;padding-bottom:12px">
            New contact message — Oh My Job
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:8px 0;font-size:13px;font-weight:600;color:#666;width:100px">From</td>
              <td style="padding:8px 0;font-size:15px">${name} &lt;${email}&gt;</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;font-weight:600;color:#666">Subject</td>
              <td style="padding:8px 0;font-size:15px">${subject}</td>
            </tr>
          </table>
          <div style="background:#f8f9fa;border-left:4px solid #2B4ACB;padding:20px;border-radius:4px">
            <p style="font-size:13px;font-weight:600;color:#2B4ACB;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">Message</p>
            <p style="font-size:15px;line-height:1.7;color:#333;white-space:pre-wrap">${message}</p>
          </div>
          <p style="font-size:12px;color:#aaa;margin-top:24px">
            Sent from the contact form at oh-my-job.com · Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact route]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
