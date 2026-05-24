import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { BLOG_ARTICLES, getNextArticleForSubscriber } from '@/lib/blog-articles'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = 'https://www.oh-my-job.com'
const FROM = 'Oh My Job <newsletter@oh-my-job.com>'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  })

  let sent = 0
  let skipped = 0

  for (const subscriber of subscribers) {
    const article = getNextArticleForSubscriber(subscriber.sentSlugs)

    if (!article) {
      skipped++
      continue
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: subscriber.email,
        subject: `This week on Oh My Job: ${article.title}`,
        html: buildEmailHtml(article),
      })

      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          sentSlugs: [...subscriber.sentSlugs, article.slug],
          lastSentAt: new Date(),
        },
      })

      sent++
    } catch (err: any) {
      console.error(`Newsletter send failed for ${subscriber.email}:`, err.message)
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: subscribers.length,
  })
}

function buildEmailHtml(article: (typeof BLOG_ARTICLES)[0]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.title}</title>
</head>
<body style="margin:0;padding:0;background:#f8f9fc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background:#1a2340;padding:28px 40px;">
              <a href="${SITE_URL}" style="text-decoration:none;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Oh My <span style="color:#6b8cff;">Job</span>
              </a>
            </td>
          </tr>

          <!-- Category label -->
          <tr>
            <td style="padding:32px 40px 0;">
              <span style="display:inline-block;padding:4px 12px;border-radius:6px;background:#eef2ff;color:#2b4acb;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;">${article.category}</span>
            </td>
          </tr>

          <!-- Article title -->
          <tr>
            <td style="padding:16px 40px 0;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#1a2340;line-height:1.3;letter-spacing:-0.5px;">${article.title}</h1>
            </td>
          </tr>

          <!-- Excerpt -->
          <tr>
            <td style="padding:16px 40px 0;">
              <p style="margin:0;font-size:16px;color:#4b5563;line-height:1.7;">${article.excerpt}</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 40px;">
              <a
                href="${SITE_URL}${article.url}"
                style="display:inline-block;padding:14px 28px;background:#2b4acb;color:#ffffff;font-size:14px;font-weight:700;border-radius:10px;text-decoration:none;letter-spacing:0.2px;"
              >
                Read the article
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">
                You're receiving this because you subscribed to the Oh My Job weekly newsletter.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="${SITE_URL}" style="color:#2b4acb;text-decoration:none;">Visit Oh My Job</a>
                &nbsp;&middot;&nbsp;
                <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
