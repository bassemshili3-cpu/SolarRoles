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
  extractionMethod: 'json_ld' | 'html_fallback'
  parserVersion: string
}

export interface HistoricalJobFeatures {
  historicalJobId: string
  roleFamily: string
  taxonomy: ReturnType<typeof extractHistoricalTaxonomy>
  taxonomyVersion: string
}

export interface HistoricalParseResult {
  job: ParsedHistoricalJob | null
  isJobPage: boolean
  isUsJob: boolean
  isSolarRelated: boolean
  usEvidence: string[]
  solarEvidence: string[]
  rejectionReason: 'missing_job_content' | 'not_us_or_unknown' | 'not_solar_related' | null
  extractionMethod: 'json_ld' | 'html_fallback' | null
}

export const HISTORICAL_PARSER_VERSION = 'common-crawl-parser-v3'
export const HISTORICAL_CLASSIFIER_VERSION = 'common-crawl-classifier-v2'
export const HISTORICAL_TAXONOMY_VERSION = 'common-crawl-taxonomy-v1'
const US_STATE_CODES = new Set(Object.keys(STATE_CODE_TO_NAME))
const US_STATE_NAMES = new Set(Object.values(STATE_CODE_TO_NAME).map((value) => value.toLowerCase()))

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

export function repairCommonMojibake(value: string) {
  return value
    .replaceAll('â€™', '\u2019')
    .replaceAll('â€˜', '\u2018')
    .replaceAll('â€œ', '\u201c')
    .replaceAll('â€\u009d', '\u201d')
    .replaceAll('â€“', '\u2013')
    .replaceAll('â€”', '\u2014')
    .replaceAll('â€¦', '\u2026')
    .replaceAll('â€¢', '\u2022')
    .replaceAll('Â©', '\u00a9')
    .replaceAll('Â®', '\u00ae')
    .replaceAll('Â·', '\u00b7')
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
  const titleTest = (pattern: RegExp) => pattern.test(title)
  const experienceSuffix = String.raw`years?(?:\s*['’])?\s+(?:of\s+)?experience`
  const numericExperiencePattern = new RegExp(
    String.raw`(?:minimum\s+(?:of\s+)?)?(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\+?\s+${experienceSuffix}`,
    'gi',
  )
  const numericExperienceYears = [...text.matchAll(numericExperiencePattern)]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite)
  const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
  const writtenExperienceYears = [...text.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+years?(?:\s*['’])?\s+(?:of\s+)?experience\b/gi)]
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
    management: titleTest(/\b(?:manager|management|supervisor|superintendent|director)\b/i),
    electrician: titleTest(/\b(?:electrician|journeyman|wireman|electrical apprentice)\b/i),
  }
}

function roleSpecificDescription(description: string) {
  const startMarkers = [
    'the experience we would expect the ideal person to deliver is:',
    'position specific description',
    'summary of role',
  ]
  const lower = description.toLowerCase()
  let focused = description
  for (const marker of startMarkers) {
    const index = lower.indexOf(marker)
    if (index >= 0) {
      focused = description.slice(index + marker.length).trim()
      break
    }
  }

  const footerMarkers = [
    'employee group:',
    'job category:',
    'at pine gate renewables, we are committed to developing solar farms',
  ]
  const focusedLower = focused.toLowerCase()
  const footerIndexes = footerMarkers
    .map((marker) => focusedLower.indexOf(marker))
    .filter((index) => index >= 0)
  if (footerIndexes.length) focused = focused.slice(0, Math.min(...footerIndexes)).trim()
  return focused
}

export function evaluateHistoricalSolarRole(title: string, description: string) {
  const normalizedTitle = title.toLowerCase()
  const focusedDescription = roleSpecificDescription(description)
  const normalizedDescription = focusedDescription.toLowerCase()
  const evidence: string[] = []
  const titleHasEnergy = /\b(?:solar|photovoltaic|pv|bess|battery storage|energy storage)\b/i.test(normalizedTitle)

  if (!titleHasEnergy && /\b(?:wind|nuclear|fossil|coal|natural gas|gas turbine|hydroelectric)\b/i.test(normalizedTitle)) {
    return { isSolarRelated: false, evidence: ['explicit_non_solar_generation_title'] }
  }
  if (!titleHasEnergy && /\b(?:software|dev\s*ops|devops|cloud|cyber|information technology|it systems?|data engineer)\b/i.test(normalizedTitle)) {
    return { isSolarRelated: false, evidence: ['software_or_it_title_without_solar_signal'] }
  }
  if (isSolarInstallerRole(title, focusedDescription)) {
    evidence.push('solar_installer_taxonomy')
    return { isSolarRelated: true, evidence }
  }

  const titleHasOccupation = /\b(?:engineer(?:ing)?|technician|installer|electrician|operator|operations|maintenance|commissioning|manager|director|analyst|developer|development|designer|estimator|sales|trainer|supervisor|superintendent|construction|project|quality|scada)\b/i.test(normalizedTitle)
  if (titleHasEnergy && titleHasOccupation) {
    evidence.push('solar_or_storage_signal_in_title')
    return { isSolarRelated: true, evidence }
  }

  const genericRelevantTitle = /\b(?:engineer(?:ing)?|technician|tech\b|installer|install tech|electrician|operator|operations|maintenance|commissioning|manager|director|analyst|associate|controller|coordinator|consultant|project|construction|asset|designer|estimator|superintendent|foreman|field service|sales|finance|survey|permitting|permit|scada)\b/i.test(normalizedTitle)
  const solarWorkNouns = String.raw`project|projects|system|systems|plant|plants|farm|farms|panel|panels|array|arrays|installation|installations|install|installed|epc|construction|development|portfolio|asset|assets|design|interconnection|financing|finance|permit|permitting|product|products|business`
  const strongSolarDescriptionSignal =
    new RegExp(String.raw`\b(?:solar|photovoltaic|pv)\b.{0,90}\b(?:${solarWorkNouns})\b`, 'i').test(normalizedDescription)
    || new RegExp(String.raw`\b(?:${solarWorkNouns})\b.{0,90}\b(?:solar|photovoltaic|pv)\b`, 'i').test(normalizedDescription)
    || /\b(?:bess|battery energy storage|battery storage)\b.{0,90}\b(?:project|projects|system|systems|plant|plants|development|portfolio|asset|assets|design|interconnection|construction)\b/i.test(normalizedDescription)

  if (genericRelevantTitle && strongSolarDescriptionSignal) {
    evidence.push('solar_project_or_system_signal_in_description')
    return { isSolarRelated: true, evidence }
  }

  return { isSolarRelated: false, evidence }
}

export function isHistoricalSolarRole(title: string, description: string) {
  return evaluateHistoricalSolarRole(title, description).isSolarRelated
}

function evaluateUsLocation(locationRaw: string, state: string | null, country: string | null, sourceUrl = '') {
  const evidence: string[] = []
  if (country === 'US') evidence.push('structured_country_us')
  else if (country) return { isUsJob: false, evidence: [`structured_country_${country.toLowerCase()}`] }

  const normalizedState = state?.trim() ?? ''
  if (normalizedState && (US_STATE_CODES.has(normalizedState.toUpperCase()) || US_STATE_NAMES.has(normalizedState.toLowerCase()))) {
    evidence.push('structured_us_state')
  }

  const explicitCountryCode = locationRaw.match(/,\s*([A-Z]{2})\s*,\s*[A-Z0-9 -]{2,10}\s*$/)?.[1]
    ?? locationRaw.match(/,\s*([A-Z]{2})\s*,\s*\d{4,6}(?:-\d{3,4})?\s*$/)?.[1]
  if (explicitCountryCode && explicitCountryCode !== 'US' && !US_STATE_CODES.has(explicitCountryCode)) {
    return { isUsJob: false, evidence: [`location_country_code_${explicitCountryCode.toLowerCase()}`] }
  }

  if (/\b(?:US|USA|United States(?: of America)?)\b/i.test(locationRaw)) evidence.push('location_text_us')
  const stateCodeMatches = [...locationRaw.matchAll(/(?:^|[,\s])([A-Z]{2})(?=\s*(?:,|\d{5}(?:-\d{4})?|$))/g)]
  if (stateCodeMatches.some((match) => US_STATE_CODES.has(match[1]))) evidence.push('location_text_state')

  const urlStateZip = sourceUrl.match(/(?:^|[-/])([A-Z]{2})-(\d{5})(?:[-/]|$)/)
  if (urlStateZip && US_STATE_CODES.has(urlStateZip[1])) evidence.push('source_url_state_zip')

  return { isUsJob: evidence.length > 0, evidence }
}

export function buildHistoricalJobFeatures(job: ParsedHistoricalJob): HistoricalJobFeatures {
  return {
    historicalJobId: job.historicalJobId,
    roleFamily: getSolarRoleFamily(job.title, job.descriptionText),
    taxonomy: extractHistoricalTaxonomy(job.title, job.descriptionText),
    taxonomyVersion: HISTORICAL_TAXONOMY_VERSION,
  }
}

export function parseHistoricalJobHtmlDetailed(html: string, sourceUrl: string, employer: HistoricalEmployer): HistoricalParseResult {
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

  const structuredJob = candidates[0] ?? null
  const extractionMethod: HistoricalParseResult['extractionMethod'] = structuredJob ? 'json_ld' : 'html_fallback'
  const title = textValue(structuredJob?.title)
    || repairCommonMojibake($('[itemprop="title"], h1').first().text()).trim()
    || repairCommonMojibake($('title').text().split('|')[0]).trim()
  const descriptionHtml = textValue(structuredJob?.description)
    || $('[itemprop="description"], .job-description, .jobDescription, #job-description, #jobDescription').first().html()
    || ''
  const descriptionText = stripHtml(descriptionHtml)
  const isJobPage = Boolean(title && descriptionText.length >= 80)

  if (!isJobPage) {
    return {
      job: null,
      isJobPage: false,
      isUsJob: false,
      isSolarRelated: false,
      usEvidence: [],
      solarEvidence: [],
      rejectionReason: 'missing_job_content',
      extractionMethod,
    }
  }

  const structuredAddress = structuredJob ? addressFromJsonLd(structuredJob) : { raw: '', city: null, state: null, country: null }
  const locationRaw = repairCommonMojibake(
    structuredAddress.raw
      || $('[itemprop="jobLocation"], .job-location, .location').first().text(),
  ).replace(/\s+/g, ' ').trim()
  const country = normalizeCountry(structuredAddress.country)
  const salary = structuredJob ? salaryFromJsonLd(structuredJob) : { min: null, max: null, currency: null, period: null }
  const canonicalUrl = canonicalizeHistoricalUrl(sourceUrl)
  const sourceJobId = sourceId(structuredJob, canonicalUrl)
  const descriptionHash = sha256(descriptionText.toLowerCase().replace(/\s+/g, ' '))
  const historicalJobId = sha256(sourceJobId
    ? `${employer.employerId}|${sourceJobId}`
    : `${employer.employerId}|${title.toLowerCase()}|${locationRaw.toLowerCase()}|${descriptionHash}`)

  const parsedJob: ParsedHistoricalJob = {
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
    datePosted: textValue(structuredJob?.datePosted) || null,
    validThrough: textValue(structuredJob?.validThrough) || null,
    employmentType: textValue(structuredJob?.employmentType) || null,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    salaryPeriod: salary.period,
    descriptionText,
    descriptionHash,
    extractionMethod,
    parserVersion: HISTORICAL_PARSER_VERSION,
  }

  const us = evaluateUsLocation(locationRaw, structuredAddress.state, country, sourceUrl)
  const solar = evaluateHistoricalSolarRole(title, descriptionText)
  const rejectionReason = !us.isUsJob
    ? 'not_us_or_unknown'
    : !solar.isSolarRelated
      ? 'not_solar_related'
      : null

  return {
    job: parsedJob,
    isJobPage: true,
    isUsJob: us.isUsJob,
    isSolarRelated: solar.isSolarRelated,
    usEvidence: us.evidence,
    solarEvidence: solar.evidence,
    rejectionReason,
    extractionMethod,
  }
}

export function parseHistoricalJobHtml(html: string, sourceUrl: string, employer: HistoricalEmployer): ParsedHistoricalJob | null {
  const parsed = parseHistoricalJobHtmlDetailed(html, sourceUrl, employer)
  return parsed.job && parsed.isUsJob && parsed.isSolarRelated ? parsed.job : null
}

export function spreadSample<T>(values: T[], limit: number) {
  if (limit <= 0 || values.length <= limit) return values
  if (limit === 1) return [values[Math.floor(values.length / 2)]]
  const indexes = new Set(Array.from({ length: limit }, (_, index) => Math.round(index * (values.length - 1) / (limit - 1))))
  return [...indexes].map((index) => values[index])
}
