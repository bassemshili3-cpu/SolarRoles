import { createReadStream, createWriteStream } from 'node:fs'
import { once } from 'node:events'
import readline from 'node:readline'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function csv(value: unknown) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

async function* streamJsonLines<T>(filename: string): AsyncGenerator<T> {
  const input = createReadStream(filename, { encoding: 'utf8' })
  const lines = readline.createInterface({ input, crlfDelay: Infinity })
  for await (const raw of lines) {
    const line = raw.trim()
    if (line) yield JSON.parse(line) as T
  }
}

async function writeLine(stream: ReturnType<typeof createWriteStream>, value: string) {
  if (!stream.write(value.endsWith('\n') ? value : `${value}\n`)) await once(stream, 'drain')
}

async function main() {
  const args = process.argv.slice(2)
  const root = path.resolve(arg(args, '--input', 'data/common-crawl-historical-jobs/employer-discovery-2020'))
  const input = path.join(root, 'solar-us-candidates.jsonl')
  const output = path.join(root, 'solar-detection-review.csv')
  const out = createWriteStream(output, { encoding: 'utf8' })

  const header = [
    'historical_job_id',
    'title',
    'hiring_organization',
    'provisional_employer',
    'location',
    'city',
    'state',
    'country',
    'date_posted',
    'strict_solar_us',
    'us_status',
    'solar_confidence',
    'us_evidence',
    'strict_solar_evidence',
    'candidate_evidence',
    'description_excerpt',
    'source_url',
    'manual_decision',
    'manual_notes',
  ]
  await writeLine(out, header.map(csv).join(','))

  const counts: Record<string, number> = {}
  let candidates = 0
  let strictSolarUs = 0
  let unknownLocation = 0

  for await (const row of streamJsonLines<Record<string, any>>(input)) {
    candidates += 1
    const classification = row.discoveryClassification ?? {}
    const strict = classification.strictSolarUs === true
    const usStatus = String(classification.usStatus ?? 'unknown')
    const confidence = String(classification.solarConfidence ?? 'none')
    if (strict) strictSolarUs += 1
    if (usStatus === 'unknown') unknownLocation += 1
    const bucket = strict ? 'strict_solar_us' : usStatus === 'unknown' ? 'candidate_us_unknown' : 'candidate_needs_review'
    counts[bucket] = (counts[bucket] ?? 0) + 1

    const excerpt = String(row.descriptionText ?? '').replace(/\s+/g, ' ').trim().slice(0, 500)
    const values = [
      row.historicalJobId,
      row.title,
      row.hiringOrganizationName,
      row.employerName,
      row.locationRaw,
      row.city,
      row.state,
      row.country,
      row.datePosted,
      strict,
      usStatus,
      confidence,
      Array.isArray(classification.usEvidence) ? classification.usEvidence.join(' | ') : '',
      Array.isArray(classification.solarEvidence) ? classification.solarEvidence.join(' | ') : '',
      Array.isArray(classification.solarCandidateEvidence) ? classification.solarCandidateEvidence.join(' | ') : '',
      excerpt,
      row.sourceUrl,
      '',
      '',
    ]
    await writeLine(out, values.map(csv).join(','))
  }

  out.end()
  await once(out, 'finish')

  const report = {
    generatedAt: new Date().toISOString(),
    candidates,
    strictSolarUs,
    unknownLocation,
    reviewBuckets: counts,
    csv: path.relative(process.cwd(), output),
    note: 'The candidate file is deliberately high recall. solar-us-jobs.jsonl remains the strict subset until candidate rules and location recovery are validated.',
  }
  await writeFile(path.join(root, 'solar-detection-review-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
