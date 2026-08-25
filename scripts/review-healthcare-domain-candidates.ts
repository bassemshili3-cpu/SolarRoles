import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Row = Record<string, string>

const DEFAULT_INPUT = path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'healthcare-domain-discovery-linkup.csv')
const DEFAULT_OUTPUT = path.join(process.cwd(), 'data', 'healthcare-provider-targets', 'healthcare-domain-candidates-reviewed.csv')

// Directories, data brokers, public registries and lead-generation sites cannot
// establish an employer's official website. This list supplements the domains
// already excluded in the Linkup request, using evidence from the saved output.
const NON_EMPLOYER_DOMAINS = new Set([
  '1800homehealth.com', 'agingcare.com', 'agingchoices.com', 'allnurses.com',
  'aplaceformom.com', 'assistedlivingcenter.com', 'assistedlivingmagazine.com',
  'assistedlivingnearme.net', 'boomershub.com', 'careavailability.com',
  'carechanges.com', 'careinhomes.com', 'dnb.com', 'elderlifefinancial.com',
  'familyassets.com', 'findhelp.org', 'getfileflo.com', 'healthcare4ppl.com',
  'healthcare6.com', 'healthcarecomps.com', 'hospice.io', 'hospitalcaredata.com',
  'local-home-health.com', 'ltcnews.com', 'memorycareassistedliving.org',
  'memorycarefacilities.net', 'miradorliving.com', 'myseniorcarefinder.com',
  'nationalhealthratings.com', 'newlifestyles.com', 'nextdoor.com', 'npidb.org',
  'npino.com', 'npiprofile.com', 'nursinghomedatabase.com', 'nursinghomesite.com',
  'opencaregiving.com', 'opennpi.com', 'openplacement.com', 'rocketreach.co',
  'senior65care.com', 'seniorcare.com', 'seniorcareauthority.com',
  'seniorcarefinder.com', 'seniorcarehomes.com', 'seniorcenter.us',
  'seniorlivingfacilities.net', 'seniorresource.com', 'seniorsguide.com',
  'specialneeds.com', 'ultimateseniorresource.com', 'vitadox.com', 'wellness.com',
  'whereyoulivematters.org', 'wikipedia.org', 'yahoo.com', 'zoominfo.com',
])

const GENERIC_NAME_TOKENS = new Set([
  'and', 'care', 'center', 'centre', 'company', 'group', 'health', 'home',
  'hospital', 'inc', 'llc', 'ltd', 'nursing', 'of', 'rehab', 'services', 'the',
])

function parseArgs() {
  const args = process.argv.slice(2)
  const valueAfter = (flag: string) => {
    const index = args.indexOf(flag)
    return index >= 0 ? args[index + 1] : args.find((argument) => argument.startsWith(`${flag}=`))?.slice(flag.length + 1)
  }
  return {
    input: valueAfter('--input') ?? DEFAULT_INPUT,
    output: valueAfter('--out') ?? DEFAULT_OUTPUT,
    maxDomainReuse: Number(valueAfter('--max-domain-reuse') ?? 3),
  }
}

function parseCsv(source: string): Row[] {
  const records: string[][] = []
  let record: string[] = []
  let value = ''
  let quoted = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]
    if (character === '"') {
      if (quoted && next === '"') { value += '"'; index += 1 } else quoted = !quoted
    } else if (character === ',' && !quoted) {
      record.push(value); value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      record.push(value)
      if (record.some(Boolean)) records.push(record)
      record = []; value = ''
    } else value += character
  }
  if (value || record.length) records.push([...record, value])
  const [headers = [], ...rows] = records
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])))
}

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

async function writeCsv(filePath: string, rows: Row[]) {
  const headers = rows.length ? Object.keys(rows[0]) : []
  await writeFile(filePath, `${[headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n')}\n`, 'utf8')
}

function rootDomain(domain: string) {
  const parts = domain.toLowerCase().replace(/^www\./, '').split('.')
  return parts.length >= 2 ? parts.slice(-2).join('.') : domain
}

function providerTokens(name: string) {
  return name.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((token) => !GENERIC_NAME_TOKENS.has(token)) ?? []
}

async function main() {
  const options = parseArgs()
  const rows = parseCsv(await readFile(options.input, 'utf8'))
  const domainUse = new Map<string, number>()
  for (const row of rows) {
    const domain = rootDomain(row.candidateDomain)
    if (domain) domainUse.set(domain, (domainUse.get(domain) ?? 0) + 1)
  }

  const reviewed = rows.map((row) => {
    const domain = rootDomain(row.candidateDomain)
    const uses = domainUse.get(domain) ?? 0
    const tokenMatches = providerTokens(row.providerName).filter((token) => domain.includes(token))
    let localReviewStatus = 'needs_manual_domain_research'
    let localReviewReason = 'The saved result is not sufficient to prove ownership of this domain.'

    if (!domain) {
      localReviewStatus = 'rejected_no_domain'
      localReviewReason = 'No candidate domain was returned.'
    } else if (NON_EMPLOYER_DOMAINS.has(domain) || domain.endsWith('.gov')) {
      localReviewStatus = 'rejected_directory_or_registry'
      localReviewReason = 'Directory, registry, broker, review site, or public listing.'
    } else if (uses > options.maxDomainReuse) {
      localReviewStatus = 'rejected_reused_domain'
      localReviewReason = `The same domain was returned for ${uses} providers; it is not a provider-specific SME domain.`
    } else if (tokenMatches.length > 0) {
      localReviewStatus = 'plausible_official_domain'
      localReviewReason = `Domain contains provider-specific token(s): ${tokenMatches.join(', ')}. Ownership still requires a page-level check.`
    }

    return {
      ...row,
      reviewedDomain: domain,
      domainResultReuseCount: String(uses),
      providerTokenMatchesInDomain: tokenMatches.join('|'),
      localReviewStatus,
      localReviewReason,
      nextStep: localReviewStatus === 'plausible_official_domain'
        ? 'Fetch this domain and audit careers pages: >=5 detailed job URLs with IDs, no ATS, no JobPosting.'
        : 'Do not create a custom scrape from this result; find an official domain manually or from a future source.',
    }
  })

  await writeCsv(options.output, reviewed)
  const counts = reviewed.reduce<Record<string, number>>((result, row) => {
    result[row.localReviewStatus] = (result[row.localReviewStatus] ?? 0) + 1
    return result
  }, {})
  console.log(`Reviewed ${reviewed.length} saved candidates without API calls.`)
  for (const [status, count] of Object.entries(counts).sort((left, right) => right[1] - left[1])) console.log(`${status}: ${count}`)
  console.log(`Output: ${options.output}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
