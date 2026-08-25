import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Row = Record<string, string>
type FirecrawlLink = { url?: string; title?: string; description?: string }
type FirecrawlScrape = { markdown?: string; rawHtml?: string; links?: string[]; metadata?: { title?: string; sourceURL?: string } }

const DEFAULT_INPUT = path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'healthcare-domain-candidates-reviewed.csv')
const DEFAULT_OUTPUT = path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'healthcare-career-audit-firecrawl-v6.csv')
// 447 map calls plus 40 audits of up to ten pages stays within the current
// 1,025-credit balance while leaving a safety margin for retries.
const DEFAULT_AUDIT_LIMIT = 40
const MIN_VALID_JOB_OFFERS = 3
// The current Firecrawl plan allows roughly ten requests per minute. Keep a
// little below that threshold, including during detailed page verification.
const MIN_REQUEST_INTERVAL_MS = 6_500
let lastFirecrawlRequestAt = 0
const KNOWN_ATS_DOMAINS = [
  'adp.com', 'applicantpro.com', 'applytojob.com', 'bamboohr.com', 'careerplug.com',
  'dayforcehcm.com', 'eightfold.ai', 'employeenavigator.com', 'greenhouse.io',
  'icims.com', 'jobvite.com', 'lever.co', 'myworkdayjobs.com', 'paycomonline.net',
  'paylocity.com', 'payrollnetwork.com', 'smartrecruiters.com', 'talentreef.com',
  'ukg.net', 'ultipro.com', 'workable.com', 'workforcenow.adp.com',
]

function parseArgs() {
  const args = process.argv.slice(2)
  const valueAfter = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1)
  }
  const number = (flag: string, fallback: number) => {
    const value = Number(valueAfter(flag))
    return Number.isInteger(value) && value > 0 ? value : fallback
  }
  return { input: valueAfter('--input') ?? DEFAULT_INPUT, output: valueAfter('--out') ?? DEFAULT_OUTPUT, auditLimit: number('--audit-limit', DEFAULT_AUDIT_LIMIT) }
}

function parseCsv(source: string): Row[] {
  const records: string[][] = []
  let record: string[] = []; let value = ''; let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]; const next = source[index + 1]
    if (character === '"') {
      if (quoted && next === '"') { value += '"'; index += 1 } else quoted = !quoted
    } else if (character === ',' && !quoted) { record.push(value); value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      record.push(value); if (record.some(Boolean)) records.push(record); record = []; value = ''
    } else value += character
  }
  if (value || record.length) records.push([...record, value])
  const [headers = [], ...rows] = records
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
}

function csvEscape(value: unknown) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function writeCsv(filePath: string, rows: Row[]) {
  const headers = rows.length ? Object.keys(rows[0]) : []
  await writeFile(filePath, `${[headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')}\n`, 'utf8')
}

function hostname(value: string) {
  try { return new URL(value).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' }
}

function isKnownAts(value: string) {
  const domain = hostname(value)
  return KNOWN_ATS_DOMAINS.some((ats) => domain === ats || domain.endsWith(`.${ats}`))
}

function hasJobLikePath(url: string) {
  const pathname = new URL(url).pathname.toLowerCase()
  if (!/(job|career|employment|position|opening|opportunit|vacanc|hiring|role)/.test(pathname)) return false
  if (/(application|apply|referral|student)/.test(pathname)) return false
  const tail = pathname.split('/').filter(Boolean).at(-1) ?? ''
  // These are landing/listing pages, not an individual opening. A real detail
  // page can still live below them, e.g. /career-opportunities/registered-nurse.
  if (/^(job|jobs|career|careers|employment|position|positions|opening|openings|opportunities|vacancies|hiring)$/.test(tail)) return false
  if (/^(career|employment|job|jobs|open)[-_]?(opportunit(?:y|ies)|positions?|openings?|vacancies|listings?)$/.test(tail)) return false
  return true
}

function isPotentialJobDetail(url: string, root: string) {
  const domain = hostname(url)
  return Boolean(domain) && (domain === root || domain.endsWith(`.${root}`)) && hasJobLikePath(url)
}

function careersOrJobsUrls(urls: string[], root: string) {
  return urls
    .filter((url) => hostname(url) === root || hostname(url).endsWith(`.${root}`))
    // Require an actual path segment, not a word embedded in a blog slug such
    // as /jessica-boardman-noble-career/. This still accepts varied listing
    // endings like /about/career-opportunities/ and /career/tucson/.
    .filter((url) => /(^|\/)(?:careers?|jobs?|employment|openings?|positions?)(?:[\/_-]|$)|(^|\/)(?:career|employment)[-_]?(?:opportunit(?:y|ies)|openings?|positions?|vacancies)(?:\/|$)|(^|\/)(?:join-us|joinus|work-with-us)(?:\/|$)/i.test(new URL(url).pathname))
}

function careerLandingUrls(urls: string[], root: string) {
  // Any internal URL mentioning careers/jobs is enough to establish that the
  // employer exposes a careers entry point. Do not infer this from a fragile
  // URL suffix such as /career-opportunities/ or /career/tucson/.
  return careersOrJobsUrls(urls, root)
    .sort((left, right) => {
      const leftLooksLikeListing = /\/(career|careers|jobs?|employment|openings?|positions?)(?:\/|$)/i.test(new URL(left).pathname)
      const rightLooksLikeListing = /\/(career|careers|jobs?|employment|openings?|positions?)(?:\/|$)/i.test(new URL(right).pathname)
      if (leftLooksLikeListing !== rightLooksLikeListing) return leftLooksLikeListing ? -1 : 1
      return new URL(left).pathname.length - new URL(right).pathname.length
    })
}

async function firecrawl(endpoint: string, apiKey: string, body?: unknown) {
  const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))
  const elapsed = Date.now() - lastFirecrawlRequestAt
  if (elapsed < MIN_REQUEST_INTERVAL_MS) await wait(MIN_REQUEST_INTERVAL_MS - elapsed)

  for (let attempt = 0; attempt < 3; attempt += 1) {
    lastFirecrawlRequestAt = Date.now()
    const response = await fetch(`https://api.firecrawl.dev/v2/${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${apiKey}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await response.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (response.status === 429 && attempt < 2) {
      const retrySeconds = /retry after (\d+)s/i.exec(text)?.[1]
      await wait((Number(retrySeconds ?? 10) + 2) * 1_000)
      continue
    }
    if (!response.ok) throw new Error(`Firecrawl ${response.status}: ${JSON.stringify(data)}`)
    return data as Record<string, unknown>
  }
  throw new Error('Firecrawl rate limit retry exhausted.')
}

async function mapDomain(domain: string, apiKey: string) {
  const response = await firecrawl('map', apiKey, {
    url: `https://${domain}`,
    search: 'jobs careers employment open positions',
    sitemap: 'include',
    includeSubdomains: true,
    ignoreQueryParameters: false,
    limit: 250,
    timeout: 30_000,
  })
  return Array.isArray(response.links) ? response.links as FirecrawlLink[] : []
}

async function scrape(url: string, apiKey: string) {
  const response = await firecrawl('scrape', apiKey, {
    url,
    formats: ['markdown', 'rawHtml', 'links'],
    onlyMainContent: false,
    blockAds: true,
    timeout: 30_000,
  })
  return (response.data ?? {}) as FirecrawlScrape
}

function hasJobPostingSchema(page: FirecrawlScrape) {
  return /["']@type["']\s*:\s*["']JobPosting["']/i.test(page.rawHtml ?? '')
}

function countWords(text: string) {
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0
}

function hasLocation(text: string, provider: Row) {
  const state = provider.state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const city = provider.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return /\b(location|remote|hybrid|on[- ]site|based in)\b/i.test(text)
    || new RegExp(`\\b${city}\\b`, 'i').test(text)
    || new RegExp(`\\b${state}\\b`).test(text)
}

function hasEmploymentType(text: string) {
  return /\b(full[- ]?time|part[- ]?time|per[- ]?diem|PRN|contract(?:or)?|temporary|seasonal|intern(?:ship)?|1099|regular)\b/i.test(text)
}

function assessJobPage(page: FirecrawlScrape, provider: Row) {
  const description = page.markdown ?? ''
  const text = `${page.metadata?.title ?? ''}\n${description}`
  const wordCount = countWords(description)
  const hasDescriptionStructure = /\b(responsibilit(?:y|ies)|duties|requirements|qualifications|job description|what you(?:'|’)ll do|about (?:the )?role)\b/i.test(text)
  return {
    wordCount,
    hasLocation: hasLocation(text, provider),
    hasEmploymentType: hasEmploymentType(text),
    isDetailed: wordCount >= 300 && hasDescriptionStructure,
  }
}

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) throw new Error('Missing FIRECRAWL_API_KEY in .env')
  const options = parseArgs()
  const input = parseCsv(await readFile(options.input, 'utf8')).filter((row) => row.localReviewStatus === 'plausible_official_domain')
  let completed: Row[] = []
  try { completed = parseCsv(await readFile(options.output, 'utf8')) } catch { /* first run */ }
  // Retry transient Firecrawl errors on the next run; terminal outcomes stay
  // skipped so the script can safely resume after an interruption.
  const done = new Set(completed.filter((row) => row.auditStatus !== 'audit_error').map((row) => `${row.providerType}:${row.ccn}`))
  const pending = input.filter((row) => !done.has(`${row.providerType}:${row.ccn}`))
  let auditsStarted = completed.filter((row) => row.auditStage === 'detailed_audit').length
  console.log(`Candidates: ${input.length}; already saved: ${completed.length}; detailed-audit budget: ${options.auditLimit}`)

  for (const provider of pending) {
    const root = provider.reviewedDomain
    let links: FirecrawlLink[] = []
    let error = ''
    try { links = await mapDomain(root, apiKey) } catch (caught) { error = caught instanceof Error ? caught.message : String(caught) }

    const mappedUrls = [...new Set(links.map((link) => link.url ?? ''))]
    const landingUrls = careerLandingUrls(mappedUrls, root)
    let auditStage = 'map_only'
    let auditStatus = 'rejected_no_careers_page'
    let auditReason = error || 'No provider-hosted careers/jobs/employment landing page was found.'
    let atsDetected = false
    let jobPostingDetected = false
    let verifiedDetailPages = 0
    let pagesWithLocation = 0
    let pagesWithEmploymentType = 0
    let maxDescriptionWords = 0
    let jobUrls: string[] = []
    let careerUrls: string[] = landingUrls.slice(0, 3)

    // A career landing page is the inexpensive gate. It also reveals links
    // that a sitemap/map can miss when the job list is rendered in the page.
    if (!error && landingUrls.length > 0) {
      auditStage = 'career_page_audit'
      try {
        const careerPage = await scrape(landingUrls[0], apiKey)
        const careerPageUrls = careerPage.links ?? []
        atsDetected = [...careerPageUrls, landingUrls[0]].some(isKnownAts) || KNOWN_ATS_DOMAINS.some((domain) => (careerPage.rawHtml ?? '').includes(domain))
        jobPostingDetected = hasJobPostingSchema(careerPage)
        jobUrls = [...new Set([...mappedUrls, ...careerPageUrls])].filter((url) => isPotentialJobDetail(url, root))
        careerUrls = [...new Set([...landingUrls, ...careerLandingUrls(careerPageUrls, root)])].slice(0, 10)

        if (atsDetected) { auditStatus = 'rejected_ats_detected'; auditReason = 'Known ATS domain or embed detected on the career page.' }
        else if (jobPostingDetected) { auditStatus = 'rejected_jobposting_detected'; auditReason = 'JSON-LD JobPosting detected on the career page.' }
        else if (jobUrls.length < MIN_VALID_JOB_OFFERS) { auditStatus = 'rejected_insufficient_detailed_job_urls'; auditReason = `Career page exposed ${jobUrls.length} distinct provider-hosted job URLs; requires at least ${MIN_VALID_JOB_OFFERS}.` }
        else if (auditsStarted >= options.auditLimit) { auditStatus = 'pending_detailed_audit_budget'; auditReason = `Career page passed the ${MIN_VALID_JOB_OFFERS}-URL threshold; detailed audit deferred to preserve the configured Firecrawl budget.` }
        else {
          auditsStarted += 1
          auditStage = 'detailed_audit'
          // Stop as soon as the required number of usable offers are proven. This is much
          // cheaper than scraping every opening or a fixed ten-page sample.
          for (const jobUrl of jobUrls.slice(0, 10)) {
            const page = await scrape(jobUrl, apiKey)
            const assessment = assessJobPage(page, provider)
            maxDescriptionWords = Math.max(maxDescriptionWords, assessment.wordCount)
            if (assessment.hasLocation) pagesWithLocation += 1
            if (assessment.hasEmploymentType) pagesWithEmploymentType += 1
            if ([...(page.links ?? [])].some(isKnownAts) || KNOWN_ATS_DOMAINS.some((domain) => (page.rawHtml ?? '').includes(domain))) { atsDetected = true; break }
            if (hasJobPostingSchema(page)) { jobPostingDetected = true; break }
            if (assessment.isDetailed && assessment.hasLocation && assessment.hasEmploymentType) verifiedDetailPages += 1
            if (verifiedDetailPages >= MIN_VALID_JOB_OFFERS) break
          }
          if (atsDetected) { auditStatus = 'rejected_ats_detected'; auditReason = 'Known ATS domain or embed detected on a job page.' }
          else if (jobPostingDetected) { auditStatus = 'rejected_jobposting_detected'; auditReason = 'JSON-LD JobPosting detected on a job page.' }
          else if (verifiedDetailPages < MIN_VALID_JOB_OFFERS) { auditStatus = 'rejected_incomplete_job_pages'; auditReason = `Only ${verifiedDetailPages} sampled offers met the >=300 words + location + employment type requirements; requires ${MIN_VALID_JOB_OFFERS}.` }
          else { auditStatus = 'validated_custom_scrape_candidate'; auditReason = `${MIN_VALID_JOB_OFFERS} provider-hosted offers meet the description, location, and employment-type requirements; no known ATS or JobPosting schema was detected.` }
        }
      } catch (caught) {
        auditStatus = 'audit_error'
        auditReason = caught instanceof Error ? caught.message : String(caught)
      }
    }

    completed = completed.filter((row) => `${row.providerType}:${row.ccn}` !== `${provider.providerType}:${provider.ccn}`)
    completed.push({
      providerType: provider.providerType, ccn: provider.ccn, providerName: provider.providerName, city: provider.city, state: provider.state,
      reviewedDomain: root, candidateUrl: provider.candidateUrl, mapLinkCount: String(mappedUrls.length), careerUrlsFound: careerUrls.join('|'),
      detailedJobUrlsFound: jobUrls.slice(0, 25).join('|'), detailedJobUrlCount: String(jobUrls.length), verifiedDetailPages: String(verifiedDetailPages),
      pagesWithLocation: String(pagesWithLocation), pagesWithEmploymentType: String(pagesWithEmploymentType), maxDescriptionWords: String(maxDescriptionWords),
      atsDetected: String(atsDetected), jobPostingDetected: String(jobPostingDetected), auditStage, auditStatus, auditReason,
    })
    await writeCsv(options.output, completed)
    console.log(`[${completed.length}/${input.length}] ${provider.providerName} — ${auditStatus}`)
  }

  const valid = completed.filter((row) => row.auditStatus === 'validated_custom_scrape_candidate').length
  console.log(`Finished. Validated custom-scrape candidates: ${valid}/${completed.length}`)
  console.log(`Output: ${options.output}`)
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
