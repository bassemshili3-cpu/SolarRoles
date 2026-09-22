import { createHash } from 'node:crypto'
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib'
import * as cheerio from 'cheerio'
import { getSolarRoleFamily, isSolarInstallerRole } from '../ats/solar-taxonomy'
import { STATE_CODE_TO_NAME } from '../usStates'

export interface HistoricalEmployer {
  employerId: string
  employerName: string
  atsProvider: string
  patterns: string[]
  notes?: string
}

export interface CommonCrawlRecord {
  urlkey: string
  timestamp: string
  url: string
  mime?: string
  'mime-detected'?: string
  status?: string
  digest: string
  length: string
  offset: string
  filename: string
  languages?: string
  encoding?: string
}

export interface ParsedHistoricalJob {
  historicalJobId: string
  sourceUrl: string
  canonicalUrl: string
  sourceJobId: string | null
  employerId: string
  employerName: string
  atsProvider: string
  title: string
  locationRaw: string
  city: string | null
  state: string | null
  country: string | null
  datePosted: string | null
  validThrough: string | null
  employmentType: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  salaryPeriod: string | null
  descriptionText: string
  descriptionHash: string
  roleFamily: string
  taxonomy: ReturnType<typeof extractHistoricalTaxonomy>
  extractionMethod: 'json_ld' | 'html_fallback'
  parserVersion: string
}

export const HISTORICAL_PARSER_VERSION = 'common-crawl-poc-v1'
const US_STATE_CODES = new Set(Object.keys(STATE_CODE_TO_NAME))

export function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex')
}

function headerMap(raw: string) {
  const entries = raw.split(/\r?\n/).slice(1).flatMap((line): Array<[string, string]> => {
    const separator = line.indexOf(':')
    return separator > 0 ? [[line.slice(0, separator).toLowerCase(), line.slice(separator + 1).trim()]] : []
  })
  return new Map(entries)
}

export function extractHttpPayloadFromWarc(compressedRecord: Buffer) {
  const warc = gunzipSync(compressedRecord)
  const warcHeaderEnd = warc.indexOf('\r\n\r\n')
  const fallbackWarcHeaderEnd = warcHeaderEnd < 0 ? warc.indexOf('\n\n') : warcHeaderEnd
  if (fallbackWarcHeaderEnd < 0) throw new Error('WARC header separator not found')
  const warcSeparatorLength = warcHeaderEnd >= 0 ? 4 : 2
  const httpStart = fallbackWarcHeaderEnd + warcSeparatorLength
  const httpHeaderEnd = warc.indexOf('\r\n\r\n', httpStart)
  const fallbackHttpHeaderEnd = httpHeaderEnd < 0 ? warc.indexOf('\n\n', httpStart) : httpHeaderEnd
  if (fallbackHttpHeaderEnd < 0) throw new Error('HTTP header separator not found')
  const httpSeparatorLength = httpHeaderEnd >= 0 ? 4 : 2
  const rawHeaders = warc.subarray(httpStart, fallbackHttpHeaderEnd).toString('latin1')
  const headers = headerMap(rawHeaders)
  let body = warc.subarray(fallbackHttpHeaderEnd + httpSeparatorLength)
  const encoding = headers.get('content-encoding')?.toLowerCase()
  try {
    if (encoding === 'gzip') body = gunzipSync(body)
    else if (encoding === 'br') body = brotliDecompressSync(body)
    else if (encoding === 'deflate') body = inflateSync(body)
  } catch {
    // Some captures retain a stale Content-Encoding header after decoding.
  }
  return { body, headers, statusLine: rawHeaders.split(/\r?\n/, 1)[0] ?? '' }
}

function flattenJsonLd(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd)
  if (!value || typeof value !== 'object') return []
  const object = value as Record<string, unknown>
  return [object, ...flattenJsonLd(object['@graph'])]
}

function isJobPosting(value: Record<string, unknown>) {
  const type = value['@type']
  return type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))
}

function textValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return repairCommonMojibake(String(value)).trim()
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>
    return textValue(object.name ?? object.value ?? object.addressLocality ?? '')
  }
  return ''
}

function stripHtml(value: string) {
  return repairCommonMojibake(cheerio.load(value).text()).replace(/\s+/g, ' ').trim()
}

function repairCommonMojibake(value: string) {
  return value
    .replaceAll('â€™', '\u2019')
    .replaceAll('â€œ', '\u201c')
    .replaceAll('â€\u009d', '\u201d')
    .replaceAll('â€“', '\u2013')
    .replaceAll('â€”', '\u2014')
    .replaceAll('Â©', '\u00a9')
    .replaceAll('Â®', '\u00ae')
    .replaceAll('Â ', ' ')
}

function addressFromJsonLd(job: Record<string, unknown>) {
  const locations = Array.isArray(job.jobLocation) ? job.jobLocation : [job.jobLocation]
  for (const location of locations) {
    if (!location || typeof location !== 'object') continue
    const addressValue = (location as Record<string, unknown>).address
    if (!addressValue || typeof addressValue !== 'object') continue
    const address = addressValue as Record<string, unknown>
    const city = textValue(address.addressLocality) || null
    const state = textValue(address.addressRegion) || null
    const country = textValue(address.addressCountry) || null
    const raw = [city, state, country].filter(Boolean).join(', ')
    return { raw, city, state, country }
  }
  return { raw: '', city: null, state: null, country: null }
}

function salaryFromJsonLd(job: Record<string, unknown>) {
  const baseSalary = job.baseSalary
  if (!baseSalary || typeof baseSalary !== 'object') return { min: null, max: null, currency: null, period: null }
  const salary = baseSalary as Record<string, unknown>
  const value = salary.value && typeof salary.value === 'object' ? salary.value as Record<string, unknown> : salary
  const numeric = (input: unknown) => {
    const parsed = Number(input)
    return Number.isFinite(parsed) ? parsed : null
  }
  return {
    min: numeric(value.minValue ?? value.value),
    max: numeric(value.maxValue ?? value.value),
    currency: textValue(salary.currency) || null,
    period: textValue(value.unitText) || null,
  }
}

export function canonicalizeHistoricalUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|source$|gh_src$|lever-source$)/i.test(key)) url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return value
  }
}

function sourceId(job: Record<string, unknown> | null, url: string) {
  const identifier = job?.identifier
  const fromIdentifier = textValue(identifier)
  if (fromIdentifier) return fromIdentifier
  const match = url.match(/(?:jobs?|requisitions?|postings?)[\/-]([a-z0-9_-]{4,})(?:[/?#]|$)/i)
  return match?.[1] ?? null
}

function normalizeCountry(value: string | null) {
  if (!value) return null
  if (/^(us|usa|united states(?: of america)?)$/i.test(value.trim())) return 'US'
  return value.trim()
}

export function extractHistoricalTaxonomy(title: string, description: string) {
  const text = `${title}\n${description}`
  const test = (pattern: RegExp) => pattern.test(text)
  const numericExperienceYears = [...text.matchAll(/(?:minimum\s+(?:of\s+)?)?(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\+?\s+years?\s+(?:of\s+)?experience/gi)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite)
  const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
  const writtenExperienceYears = [...text.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+years?\s+(?:of\s+)?experience\b/gi)]
    .map((match) => numberWords[match[1].toLowerCase()])
  const experienceYears = [...numericExperienceYears, ...writtenExperienceYears]
  return {
    bessStorage: test(/\b(?:bess|battery energy storage|battery storage|energy storage)\b|\b(?:solar|renewable|clean energy).{0,30}\bstorage\b|\bstorage\b.{0,30}\b(?:solar|renewable|clean energy)\b/i),
    scada: test(/\bscada\b/i),
    commissioning: test(/\bcommission(?:ing|ed)?\b/i),
    operationsMaintenance: test(/\b(?:o\s*&\s*m|operations?\s+(?:and|&)\s+maintenance|maintenance technician)\b/i),
    travel: test(/\b(?:travel|required travel|travel up to|overnight travel|on the road)\b/i),
    minimumExperienceYears: experienceYears.length ? Math.min(...experienceYears) : null,
    solarExperienceRequired: test(/(?:solar|photovoltaic|\bpv\b).{0,45}(?:experience|required)|(?:experience|required).{0,45}(?:solar|photovoltaic|\bpv\b)/i),
    nabcep: test(/\bnabcep\b/i),
    osha: test(/\bosha(?:\s*[- ]?(?:10|30))?\b/i),
    degreeRequirement: test(/\b(?:bachelor'?s?|master'?s?|associate'?s?)\s+(?:degree|required)|\bdegree\s+(?:in|required)/i),
    paidTraining: test(/\b(?:paid training|training provided|on[- ]the[- ]job training)\b/i),
    management: test(/\b(?:manager|management|supervisor|superintendent|director)\b/i),
    electrician: test(/\b(?:electrician|journeyman|wireman|electrical apprentice)\b/i),
  }
}

export function isHistoricalSolarRole(title: string, description: string) {
  const normalizedTitle = title.toLowerCase()
  const normalizedDescription = description.toLowerCase()
  const titleHasEnergy = /\b(?:solar|photovoltaic|pv|bess|battery storage|energy storage)\b/i.test(normalizedTitle)
  if (!titleHasEnergy && /\b(?:wind|nuclear|fossil|coal|natural gas|gas turbine|hydroelectric)\b/i.test(normalizedTitle)) return false
  if (!titleHasEnergy && /\b(?:software|dev\s*ops|devops|cloud|cyber|information technology|it systems?|data engineer)\b/i.test(normalizedTitle)) return false
  if (isSolarInstallerRole(title, description)) return true
  const titleHasOccupation = /\b(?:engineer(?:ing)?|technician|installer|electrician|operator|operations|maintenance|commissioning|manager|director|analyst|developer|development|designer|estimator|sales|trainer|supervisor|superintendent|construction|project|quality|scada)\b/i.test(normalizedTitle)
  if (titleHasEnergy && titleHasOccupation) return true

  const genericRelevantTitle = /\b(?:engineer(?:ing)?|technician|installer|electrician|operator|operations|maintenance|commissioning|project manager|construction manager|asset manager|designer|estimator|superintendent|foreman|field service|scada)\b/i.test(normalizedTitle)
  const descriptionEnergySignals = normalizedDescription.match(/\b(?:solar|photovoltaic|pv system|pv plant|solar farm|solar project|bess|battery energy storage)\b/gi)?.length ?? 0
  return genericRelevantTitle && descriptionEnergySignals >= 2
}

export function parseHistoricalJobHtml(html: string, sourceUrl: string, employer: HistoricalEmployer): ParsedHistoricalJob | null {
  const $ = cheerio.load(html)
  const candidates: Record<string, unknown>[] = []
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim()
    if (!raw) return
    try {
      candidates.push(...flattenJsonLd(JSON.parse(raw)).filter(isJobPosting))
    } catch {
      // Invalid JSON-LD is common in historical captures; HTML fallback remains available.
    }
  })
  const job = candidates[0] ?? null
  const title = textValue(job?.title) || $('h1').first().text().trim() || $('title').text().split('|')[0].trim()
  const descriptionHtml = textValue(job?.description)
    || $('[itemprop="description"], .job-description, .jobDescription, #job-description, #jobDescription').first().html()
    || ''
  const descriptionText = stripHtml(descriptionHtml)
  if (!title || descriptionText.length < 80) return null

  const structuredAddress = job ? addressFromJsonLd(job) : { raw: '', city: null, state: null, country: null }
  const locationRaw = structuredAddress.raw
    || $('[itemprop="jobLocation"], .job-location, .location').first().text().replace(/\s+/g, ' ').trim()
  const country = normalizeCountry(structuredAddress.country)
  if (country && !/^(US|United States)$/i.test(country)) return null
  const terminalCountryCode = locationRaw.match(/,\s*([A-Z]{2})\s*$/)?.[1]
  if (terminalCountryCode && terminalCountryCode !== 'US' && !US_STATE_CODES.has(terminalCountryCode)) return null
  if (!isHistoricalSolarRole(title, descriptionText)) return null

  const salary = job ? salaryFromJsonLd(job) : { min: null, max: null, currency: null, period: null }
  const canonicalUrl = canonicalizeHistoricalUrl(sourceUrl)
  const sourceJobId = sourceId(job, canonicalUrl)
  const descriptionHash = sha256(descriptionText.toLowerCase().replace(/\s+/g, ' '))
  const historicalJobId = sha256(sourceJobId
    ? `${employer.employerId}|${sourceJobId}`
    : `${employer.employerId}|${title.toLowerCase()}|${locationRaw.toLowerCase()}|${descriptionHash}`)

  return {
    historicalJobId,
    sourceUrl,
    canonicalUrl,
    sourceJobId,
    employerId: employer.employerId,
    employerName: employer.employerName,
    atsProvider: employer.atsProvider,
    title,
    locationRaw,
    city: structuredAddress.city,
    state: structuredAddress.state,
    country,
    datePosted: textValue(job?.datePosted) || null,
    validThrough: textValue(job?.validThrough) || null,
    employmentType: textValue(job?.employmentType) || null,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    salaryPeriod: salary.period,
    descriptionText,
    descriptionHash,
    roleFamily: getSolarRoleFamily(title, descriptionText),
    taxonomy: extractHistoricalTaxonomy(title, descriptionText),
    extractionMethod: job ? 'json_ld' : 'html_fallback',
    parserVersion: HISTORICAL_PARSER_VERSION,
  }
}

export function spreadSample<T>(values: T[], limit: number) {
  if (limit <= 0 || values.length <= limit) return values
  if (limit === 1) return [values[Math.floor(values.length / 2)]]
  const indexes = new Set(Array.from({ length: limit }, (_, index) => Math.round(index * (values.length - 1) / (limit - 1))))
  return [...indexes].map((index) => values[index])
}
