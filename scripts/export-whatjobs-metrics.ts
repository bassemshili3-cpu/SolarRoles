import { writeFile } from 'node:fs/promises'
import { prisma } from '../lib/prisma'

async function main() {
  const option = (name: string, fallback: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=') || fallback
  const days = Number(option('days', '7'))
  if (!Number.isInteger(days) || days < 1 || days > 90) throw new Error('--days must be between 1 and 90')
  const timezone = option('timezone', 'UTC')
  new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
  const since = new Date(Date.now() - days * 86400_000)
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`
    SELECT to_char("receivedAt" AT TIME ZONE ${timezone}, 'YYYY-MM-DD') AS "date",
      "surface", COALESCE("publisher", 'unknown') AS "publisher", "device",
      COUNT(*) FILTER (WHERE "type" = 'widget_impression')::int AS "widget_impressions",
      COUNT(*) FILTER (WHERE "type" = 'job_impression')::int AS "job_impressions",
      COUNT(*) FILTER (WHERE "type" = 'click')::int AS "clicks",
      COUNT(*) FILTER (WHERE "type" = 'search_submit')::int AS "search_submits",
      COUNT(DISTINCT "viewId")::int AS "observed_views",
      COUNT(*) FILTER (WHERE "type" = 'click' AND "pnpAvailable")::int AS "clicks_pnp_available",
      COUNT(*) FILTER (WHERE "type" = 'click' AND "tokenPresent")::int AS "clicks_token_present"
    FROM "WhatJobsMetric" WHERE "receivedAt" >= ${since} AND NOT "isTest"
    GROUP BY 1, 2, 3, 4 ORDER BY 1, 2, 3, 4
  `
  const columns = ['date', 'surface', 'publisher', 'device', 'widget_impressions', 'job_impressions', 'clicks', 'search_submits', 'observed_views', 'clicks_pnp_available', 'clicks_token_present']
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const csv = [columns.join(','), ...rows.map(row => columns.map(c => quote(row[c])).join(','))].join('\n') + '\n'
  const out = option('out', 'whatjobs-metrics.csv')
  await writeFile(out, csv, 'utf8')
  console.log(`${rows.length} daily rows exported to ${out}. Timezone: ${timezone}; since ${since.toISOString()} (first day may be partial). Test events excluded.`)
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Export failed'); process.exitCode = 1 }).finally(() => prisma.$disconnect())
