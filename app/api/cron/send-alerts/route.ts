import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const secret = authHeader?.replace('Bearer ', '')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alerts = await prisma.jobAlert.findMany({
    where: { active: true },
  })

  for (const alert of alerts) {
    // Fetch new jobs since lastSentAt
    const params = new URLSearchParams({
      what: alert.what,
      where: alert.where,
      page: '1',
      results_per_page: '10',
    })
    if (alert.salaryMin) params.set('salary_min', alert.salaryMin)

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/jobs?${params}`)
    const { results: newJobs } = await res.json()

    if (newJobs.length === 0) continue

    const subject = `🆕 ${newJobs.length} new ${alert.what} job${newJobs.length > 1 ? 's' : ''} in ${alert.where}`

    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL}/api/alerts/unsubscribe?id=${alert.id}`

    await resend.emails.send({
      from: 'alerts@yourdomain.com', // ← change to your domain
      to: alert.email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="margin:0; padding:0; background:#f4f4f4; font-family: system-ui, -apple-system, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            
            <!-- HEADER -->
            <tr>
              <td style="background: #000; padding: 30px 40px; text-align: center;">
                <h1 style="color: #fff; margin: 0; font-size: 28px;">${alert.what} jobs in ${alert.where}</h1>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="color: #000; font-size: 24px; margin: 0 0 8px;">Hello 👋</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Here are <strong>${newJobs.length}</strong> new job${newJobs.length > 1 ? 's' : ''} matching your search <strong>${alert.what} in ${alert.where}</strong>.
                </p>

                <!-- JOB LIST -->
                ${newJobs.map((job: any) => `
                  <div style="margin: 24px 0; padding: 24px; background: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                    <h3 style="margin: 0 0 8px; color: #000; font-size: 18px;">${job.title}</h3>
                    <p style="margin: 0 0 12px; color: #666; font-size: 15px;">
                      ${job.company} • ${job.location}
                      ${job.salary ? ` • ${job.salary}` : ''}
                    </p>
                    <a href="${job.url}" 
                       style="background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                      View the offer →
                    </a>
                  </div>
                `).join('')}

                <div style="text-align: center; margin: 40px 0;">
                  <a href="${process.env.NEXT_PUBLIC_URL}/?what=${encodeURIComponent(alert.what)}&where=${encodeURIComponent(alert.where)}"
                     style="background: #000; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    See all offers on the website
                  </a>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background: #f9f9f9; padding: 30px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee;">
                You received this email because you subscribed to alerts on our site.<br>
                <a href="${unsubscribeUrl}" style="color: #888; text-decoration: underline;">Unsubscribe from these alerts</a>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    // Update last sent date
    await prisma.jobAlert.update({
      where: { id: alert.id },
      data: { lastSentAt: new Date() },
    })
  }

  return NextResponse.json({ success: true, alertsProcessed: alerts.length })
}