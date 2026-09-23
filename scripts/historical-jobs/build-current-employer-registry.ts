import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  ADP_COMPANIES,
  ASHBY_COMPANIES,
  BREEZY_COMPANIES,
  GREENHOUSE_COMPANIES,
  HRMDIRECT_COMPANIES,
  ICIMS_COMPANIES,
  JAZZHR_COMPANIES,
  JOBVITE_COMPANIES,
  LEVER_COMPANIES,
  ORACLE_CLOUD_COMPANIES,
  PAYCOM_COMPANIES,
  PAYLOCITY_COMPANIES,
  PINPOINT_COMPANIES,
  RIPPLING_COMPANIES,
  SAASHR_COMPANIES,
  SMARTRECRUITERS_COMPANIES,
  SUCCESSFACTORS_COMPANIES,
  UKG_COMPANIES,
  WORKABLE_COMPANIES,
  WORKDAY_COMPANIES,
} from '../../lib/ats/company-seed'
import type { HistoricalEmployer } from '../../lib/historical-jobs/commonCrawl'

type Seed = Record<string, unknown>

const SHARED_UNSAFE_HOSTS = new Set([
  'jobs.kochcareers.com',
  'workforcenow.adp.com',
  'recruiting.paylocity.com',
  'www.paycomonline.net',
])

function arg(args: string[], flag: string, fallback = '') {
  const index = args.indexOf(flag)
  return index < 0 ? fallback : args[index + 1]
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function stringField(seed: Seed, key: string) {
  const value = seed[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function verified(seed: Seed) {
  return seed.verified !== false
}

function hostAndPath(raw: string) {
  const url = new URL(raw)
  const host = url.hostname.toLowerCase()
  const pathname = url.pathname.replace(/\/+$/, '')
  return { host, pathname }
}

function urlPattern(raw: string, suffix = '/*') {
  const { host, pathname } = hostAndPath(raw)
  return `${host}${pathname}${suffix}`
}

function patternsFor(provider: string, seed: Seed): { patterns: string[]; queryScopedReason?: string } {
  const slug = stringField(seed, 'slug')
  if (provider === 'jazzhr' && slug) return { patterns: [`${slug}.applytojob.com/apply/*`] }
  if (provider === 'breezy' && slug) return { patterns: [`${slug}.breezy.hr/p/*`] }
  if (provider === 'rippling' && slug) return { patterns: [`ats.rippling.com/${slug}/jobs/*`] }
  if (provider === 'ashby' && slug) return { patterns: [`jobs.ashbyhq.com/${slug}/*`] }
  if (provider === 'smartrecruiters' && slug) return { patterns: [`jobs.smartrecruiters.com/${slug}/*`] }
  if (provider === 'lever' && slug) return { patterns: [`jobs.lever.co/${slug}/*`] }
  if (provider === 'workable' && slug) return { patterns: [`apply.workable.com/${slug}/*`] }
  if (provider === 'pinpoint' && slug) return { patterns: [`${slug}.pinpointhq.com/postings/*`] }
  if (provider === 'jobvite' && slug) return { patterns: [`jobs.jobvite.com/${slug}/*`] }
  if (provider === 'greenhouse' && slug) {
    return { patterns: [`boards.greenhouse.io/${slug}/*`, `job-boards.greenhouse.io/${slug}/*`] }
  }

  if (provider === 'workday') {
    const tenant = stringField(seed, 'tenant')
    const host = stringField(seed, 'host')
    if (tenant && host) return { patterns: [`${tenant}.${host}.myworkdayjobs.com/*`] }
  }

  if (provider === 'hrmdirect') {
    const subdomain = stringField(seed, 'subdomain')
    if (subdomain) return { patterns: [`${subdomain}.hrmdirect.com/employment/*`] }
  }

  if (provider === 'successfactors') {
    const baseUrl = stringField(seed, 'baseUrl')
    if (!baseUrl) return { patterns: [] }
    const { host } = hostAndPath(baseUrl)
    if (SHARED_UNSAFE_HOSTS.has(host)) {
      return { patterns: [], queryScopedReason: `shared host ${host}; use employer aliases/content instead of a broad path` }
    }
    return { patterns: [`${host}/job/*`] }
  }

  if (provider === 'oraclecloud') {
    const baseUrl = stringField(seed, 'baseUrl')
    if (baseUrl) return { patterns: [urlPattern(baseUrl, '/job/*')] }
  }

  if (provider === 'ukg') {
    const baseUrl = stringField(seed, 'baseUrl')
    if (baseUrl) return { patterns: [urlPattern(baseUrl)] }
  }

  if (provider === 'icims') {
    const baseUrl = stringField(seed, 'baseUrl')
    if (baseUrl) {
      const { host } = hostAndPath(baseUrl)
      return { patterns: [`${host}/jobs/*`] }
    }
  }

  if (provider === 'saashr') {
    const careersUrl = stringField(seed, 'careersUrl')
    if (careersUrl) return { patterns: [urlPattern(careersUrl)] }
  }

  if (provider === 'adp') {
    const cid = stringField(seed, 'cid')
    return { patterns: [], queryScopedReason: `ADP source is scoped by cid=${cid || 'unknown'} query parameter` }
  }

  if (provider === 'paycom') {
    const clientKey = stringField(seed, 'clientKey')
    return { patterns: [], queryScopedReason: `Paycom source is scoped by clientKey=${clientKey || 'unknown'} rather than a safe host/path prefix` }
  }

  if (provider === 'paylocity') {
    const boardUrl = stringField(seed, 'boardUrl')
    return { patterns: [], queryScopedReason: `Paylocity source requires board identity from ${boardUrl || 'the configured board URL'}` }
  }

  return { patterns: [] }
}

async function main() {
  const args = process.argv.slice(2)
  const outputDir = path.resolve(arg(args, '--output', 'data/common-crawl-historical-jobs'))
  await mkdir(outputDir, { recursive: true })

  const groups: Array<[string, readonly Seed[]]> = [
    ['jazzhr', JAZZHR_COMPANIES as readonly Seed[]],
    ['breezy', BREEZY_COMPANIES as readonly Seed[]],
    ['rippling', RIPPLING_COMPANIES as readonly Seed[]],
    ['successfactors', SUCCESSFACTORS_COMPANIES as readonly Seed[]],
    ['ashby', ASHBY_COMPANIES as readonly Seed[]],
    ['smartrecruiters', SMARTRECRUITERS_COMPANIES as readonly Seed[]],
    ['lever', LEVER_COMPANIES as readonly Seed[]],
    ['workable', WORKABLE_COMPANIES as readonly Seed[]],
    ['pinpoint', PINPOINT_COMPANIES as readonly Seed[]],
    ['jobvite', JOBVITE_COMPANIES as readonly Seed[]],
    ['oraclecloud', ORACLE_CLOUD_COMPANIES as readonly Seed[]],
    ['adp', ADP_COMPANIES as readonly Seed[]],
    ['paylocity', PAYLOCITY_COMPANIES as readonly Seed[]],
    ['paycom', PAYCOM_COMPANIES as readonly Seed[]],
    ['ukg', UKG_COMPANIES as readonly Seed[]],
    ['icims', ICIMS_COMPANIES as readonly Seed[]],
    ['workday', WORKDAY_COMPANIES as readonly Seed[]],
    ['greenhouse', GREENHOUSE_COMPANIES as readonly Seed[]],
    ['hrmdirect', HRMDIRECT_COMPANIES as readonly Seed[]],
    ['saashr', SAASHR_COMPANIES as readonly Seed[]],
  ]

  const registry: HistoricalEmployer[] = []
  const queryScoped: Array<Record<string, unknown>> = []

  for (const [provider, companies] of groups) {
    for (const seed of companies) {
      if (!verified(seed)) continue
      const name = stringField(seed, 'name')
      if (!name) continue
      const { patterns, queryScopedReason } = patternsFor(provider, seed)
      if (patterns.length) {
        registry.push({
          employerId: `current-${slugify(name)}`,
          employerName: name,
          atsProvider: provider,
          patterns: [...new Set(patterns)],
          notes: 'Generated from the current verified SolarRoles ATS seed. This is a recall booster for historical source discovery, not evidence that the same source existed in the historical year.',
        })
      } else {
        queryScoped.push({
          employerId: `current-${slugify(name)}`,
          employerName: name,
          atsProvider: provider,
          reason: queryScopedReason ?? 'No safe historical host/path pattern can be generated from the current seed.',
          seed,
        })
      }
    }
  }

  registry.sort((a, b) => a.employerName.localeCompare(b.employerName))
  queryScoped.sort((a, b) => String(a.employerName).localeCompare(String(b.employerName)))

  await writeFile(path.join(outputDir, 'current-employer-source-discovery-registry.json'), `${JSON.stringify(registry, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outputDir, 'current-employer-query-scoped-hints.json'), `${JSON.stringify(queryScoped, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outputDir, 'current-employer-registry-report.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    safeSourceDiscoveryEmployers: registry.length,
    queryScopedOrUnsafeEmployers: queryScoped.length,
    totalVerifiedCurrentSeeds: registry.length + queryScoped.length,
    note: 'Current SolarRoles seeds expand recall but do not define the historical universe. Open employer discovery remains independent and can find employers absent from the current seed.',
  }, null, 2)}\n`, 'utf8')

  console.log(JSON.stringify({
    safeSourceDiscoveryEmployers: registry.length,
    queryScopedOrUnsafeEmployers: queryScoped.length,
    totalVerifiedCurrentSeeds: registry.length + queryScoped.length,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
