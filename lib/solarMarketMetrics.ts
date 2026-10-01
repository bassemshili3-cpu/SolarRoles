import { prisma } from '@/lib/prisma'
import { STATES, STATE_CODE_TO_NAME, resolveStateName } from '@/lib/usStates'

export type MetricValue = {
  value: number | null
  unit: 'count' | 'rate' | 'currency' | 'days'
  numerator?: number
  denominator?: number
}

type ActiveJob = Awaited<ReturnType<typeof loadActiveJobs>>[number]

const DAY_MS = 86_400_000
const SALARY_MIN = 20_000
const SALARY_MAX = 600_000

const ROLE_LABELS = [
  'Installation & construction',
  'Electrical',
  'Engineering & design',
  'Operations & maintenance',
  'Sales & business development',
  'Project & program management',
  'Other solar roles',
] as const

function loadActiveJobs() {
  return prisma.job.findMany({
    where: { active: true },
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      addressRegion: true,
      salaryPeriod: true,
      salaryMin: true,
      salaryMax: true,
      description: true,
      specialty: true,
      occupationalCategory: true,
      experienceLevel: true,
      contractType: true,
      postedAt: true,
      fetchedAt: true,
    },
  })
}

function text(job: ActiveJob) {
  return [
    job.title,
    job.location,
    job.description,
    job.specialty,
    job.occupationalCategory,
    job.experienceLevel,
    job.contractType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function titleText(job: ActiveJob) {
  return `${job.title} ${job.specialty ?? ''} ${job.occupationalCategory ?? ''}`.toLowerCase()
}

function has(value: string, pattern: RegExp) {
  return pattern.test(value)
}

type SolarStorageProfileInput = Pick<ActiveJob, 'title' | 'description'>

const SOLAR_PROFILE_SIGNAL = /\b(?:solar|photovoltaic|pv)\b/i
const STORAGE_PROFILE_SIGNAL = /\b(?:bess|battery(?: energy)? storage|energy storage|storage systems?)\b/i
const ROLE_SECTION_SIGNAL = /\b(?:about the role|position overview|job description|responsibilities|what you(?:'|’)ll do|essential duties|qualifications|requirements|position summary|job functions|key responsibilities)\b/i
const PROFILE_REQUIREMENT_SIGNAL = /\b(?:experience|knowledge|familiarity|proficien\w*|skills?|required|responsibilit\w*|install\w*|maintain\w*|service|repair\w*|troubleshoot\w*|commission\w*|operat\w*|design\w*|engineer\w*|construct\w*|manage\w*|inspect\w*|test\w*|support\w*)\b/i

function normalizedPostingText(value: string | null | undefined) {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Conservative signal that a posting asks for a combined solar + storage
 * profile. Company-boilerplate mentions before the role section do not count.
 */
export function requiresSolarStorageProfile(job: SolarStorageProfileInput) {
  const structured = normalizedPostingText(job.title)

  if (
    SOLAR_PROFILE_SIGNAL.test(structured) &&
    STORAGE_PROFILE_SIGNAL.test(structured)
  ) {
    return true
  }

  const description = normalizedPostingText(job.description)
  const sectionStart = description.search(ROLE_SECTION_SIGNAL)
  if (sectionStart < 0) return false

  const roleText = description.slice(sectionStart)
  const storagePattern = new RegExp(STORAGE_PROFILE_SIGNAL.source, 'gi')

  for (const match of roleText.matchAll(storagePattern)) {
    const index = match.index ?? 0
    const context = roleText.slice(
      Math.max(0, index - 280),
      Math.min(roleText.length, index + match[0].length + 280)
    )
    const profileContext = `${structured} ${context}`

    if (
      SOLAR_PROFILE_SIGNAL.test(profileContext) &&
      PROFILE_REQUIREMENT_SIGNAL.test(profileContext)
    ) {
      return true
    }
  }

  return false
}

function percentile(values: number[], position: number): number | null {
  if (!values.length) return null
  const ordered = [...values].sort((a, b) => a - b)
  const index = (ordered.length - 1) * position
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return ordered[lower]
  return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower)
}

function annualMultiplier(period: string | null) {
  const normalized = (period ?? '').trim().toLowerCase()
  if (/hour|hr/.test(normalized)) return 2_080
  if (/week|wk/.test(normalized)) return 52
  if (/month|mo/.test(normalized)) return 12
  if (/day|daily/.test(normalized)) return 260
  return 1
}

function annualizedSalary(job: ActiveJob): number | null {
  const multiplier = annualMultiplier(job.salaryPeriod)
  const values = [job.salaryMin, job.salaryMax]
    .filter((value): value is number => value != null && Number.isFinite(value))
    .map((value) => value * multiplier)
    .filter((value) => value >= SALARY_MIN && value <= SALARY_MAX)

  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function annualizedSalaryRangeWidth(job: ActiveJob): number | null {
  if (job.salaryMin == null || job.salaryMax == null) return null

  const multiplier = annualMultiplier(job.salaryPeriod)
  const minimum = job.salaryMin * multiplier
  const maximum = job.salaryMax * multiplier

  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    minimum < SALARY_MIN ||
    maximum > SALARY_MAX ||
    maximum < minimum
  ) {
    return null
  }

  return maximum - minimum
}

function postingAgeDays(job: ActiveJob, now: Date): number | null {
  if (!job.postedAt) return null
  const days = (now.getTime() - job.postedAt.getTime()) / DAY_MS
  return days >= 0 ? days : null
}

function countMetric(value: number): MetricValue {
  return { value, unit: 'count' }
}

function distributionMetric(
  value: number | null,
  unit: 'currency' | 'days',
  numerator: number,
  denominator: number,
): MetricValue {
  return { value, unit, numerator, denominator }
}

function rateMetric(numerator: number, denominator: number): MetricValue {
  return {
    value: denominator > 0 ? (numerator / denominator) * 100 : null,
    unit: 'rate',
    numerator,
    denominator,
  }
}

function isSales(job: ActiveJob) {
  return has(titleText(job), /\b(sales|account executive|business development|appointment setter|sales closer|solar consultant|energy consultant)\b/i)
}

function isInstallation(job: ActiveJob) {
  return has(titleText(job), /\b(installer|installation|construction|laborer|roofer|foreman|superintendent|crew lead|site lead)\b/i)
}

function isElectrical(job: ActiveJob) {
  return has(titleText(job), /\b(electrician|electrical|journeyman|lineman|wireman|electrical helper)\b/i)
}

function isEngineering(job: ActiveJob) {
  return has(titleText(job), /\b(engineer|engineering|designer|design engineer|pv designer|cad|drafter)\b/i)
}

function isOperations(job: ActiveJob) {
  return has(titleText(job), /\b(operations|maintenance|o\s*(?:&|and)\s*m|field service|service technician|asset manager)\b/i)
}

function isProjectManagement(job: ActiveJob) {
  return has(titleText(job), /\b(project|program|construction) (manager|coordinator|director)|\bproject management\b/i)
}

function isProjectDelivery(job: ActiveJob) {
  return isProjectManagement(job) ||
    has(titleText(job), /\b(epc|project delivery|project execution|project engineer|project executive)\b/i)
}

function isTechnical(job: ActiveJob) {
  return isInstallation(job) || isElectrical(job) || isEngineering(job) || isOperations(job) || isProjectDelivery(job) ||
    has(titleText(job), /\b(technician|commissioning|quality control|estimator|survey(or)?|interconnection)\b/i)
}

function isField(job: ActiveJob) {
  return isInstallation(job) || isElectrical(job) || isOperations(job) ||
    has(titleText(job), /\b(field|site|commissioning|inspection|inspector|survey(or)?)\b/i)
}

function roleFamily(job: ActiveJob): (typeof ROLE_LABELS)[number] {
  if (isSales(job)) return 'Sales & business development'
  if (isElectrical(job)) return 'Electrical'
  if (isEngineering(job)) return 'Engineering & design'
  if (isOperations(job)) return 'Operations & maintenance'
  if (isProjectManagement(job)) return 'Project & program management'
  if (isInstallation(job)) return 'Installation & construction'
  return 'Other solar roles'
}

function isBuildOriented(job: ActiveJob) {
  return isInstallation(job) || isProjectDelivery(job) ||
    has(titleText(job), /\b(epc|commissioning|construction|project delivery|project execution)\b/i)
}

function isEntryAccessible(job: ActiveJob) {
  const value = text(job)
  return has((job.experienceLevel ?? '').toLowerCase(), /entry|intern|apprentice/i) ||
    has(titleText(job), /\b(entry[ -]?level|junior|jr\.?|apprentice|trainee|helper|intern(?:ship)?)\b/i) ||
    has(value, /\b(no (?:prior |previous )?experience(?: required| necessary)?|no solar experience required|0\s*(?:-|to)\s*[12]\s+years?|will train|training provided|on[ -]the[ -]job training)\b/i)
}

const OPTIONAL_REQUIREMENT_LANGUAGE = /\b(preferred|nice to have|a plus|desired|ideally|bonus|not required)\b/i

function hasNonOptionalMatch(value: string, pattern: RegExp) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
  const globalPattern = new RegExp(pattern.source, flags)

  for (const match of value.matchAll(globalPattern)) {
    const start = match.index ?? 0
    const context = value.slice(Math.max(0, start - 90), Math.min(value.length, start + match[0].length + 90))
    if (!OPTIONAL_REQUIREMENT_LANGUAGE.test(context)) return true
  }

  return false
}

function requiresPriorExperience(job: ActiveJob) {
  const value = text(job)
  const patterns = [
    /\b(?:minimum(?: of)?|at least)\s+\d{1,2}\+?\s+years?\b.{0,80}\bexperience\b/i,
    /\b\d{1,2}\s*(?:\+|(?:-|to)\s*\d{1,2})?\s+years?\b.{0,80}\bexperience\b/i,
    /\b(?:must have|must possess|requires?|required to have)\b.{0,100}\b(?:prior|previous|professional|trade|role-specific|relevant|related|solar|construction|electrical)?\s*experience\b/i,
    /\b(?:prior|previous|professional|trade|role-specific|relevant|related|solar|construction|electrical)\s+experience\s+(?:is\s+)?(?:required|mandatory)\b/i,
  ]

  return patterns.some((pattern) => hasNonOptionalMatch(value, pattern))
}

function requiresTradeCredential(job: ActiveJob) {
  const value = text(job)
  const credential = '(?:nabcep|osha(?:[\\s-]?(?:10|30))?|journeyman|master electrician|licensed electrician|electrical licen[cs]e|trade certification|cdl)'
  return hasNonOptionalMatch(
    value,
    new RegExp(`(?:\\b(?:required|mandatory|must have|must hold|must possess)\\b.{0,100}\\b${credential}\\b|\\b${credential}\\b.{0,100}\\b(?:required|mandatory|must have|must hold|must possess)\\b)`, 'i'),
  )
}

function mentionsEmployerTraining(job: ActiveJob) {
  return has(
    text(job),
    /\b(paid training|company[ -](?:paid|provided|sponsored) training|employer[ -](?:paid|provided|sponsored) training|training (?:is )?provided|we (?:will )?train|will train|on[ -]the[ -]job training|structured (?:training|ojt)|ojt program|train(?:ing)? program provided)\b/i,
  )
}

function mentionsApprenticeship(job: ActiveJob) {
  return has(text(job), /\b(apprentice|apprenticeship)\b/i)
}

type Segment = 'Battery storage' | 'Utility-scale solar' | 'Residential solar' | 'Commercial & industrial solar'

function segment(job: ActiveJob): Segment | null {
  const explicit = `${job.specialty ?? ''} ${job.title}`.toLowerCase()
  if (has(explicit, /\b(battery storage|energy storage|bess)\b/i)) return 'Battery storage'
  if (has(explicit, /\b(utility[ -]?scale|solar farm|solar plant)\b/i)) return 'Utility-scale solar'
  if (has(explicit, /\bresidential(?: solar)?\b/i)) return 'Residential solar'
  if (
    has(explicit, /\bc\s*(?:&|and)\s*i\b/i) ||
    has(explicit, /\bcommercial\s*(?:(?:&|and)\s*industrial\s*)?(?:solar|pv|photovoltaic)\b/i) ||
    has(explicit, /\bindustrial\s+(?:solar|pv|photovoltaic)\b/i) ||
    job.specialty === 'Commercial Solar'
  ) return 'Commercial & industrial solar'
  return null
}

function normalizedStateCode(job: ActiveJob) {
  const name = resolveStateName(job.addressRegion) ?? resolveStateName(job.location)
  return name ? STATES[name] ?? null : null
}

export async function getSolarMarketData() {
  const jobs = await loadActiveJobs()
  const now = new Date()
  const totalJobs = jobs.length
  const jobText = new Map(jobs.map((job) => [job.id, text(job)]))
  const salaries = jobs.map(annualizedSalary).filter((value): value is number => value != null)
  const salaryRangeWidths = jobs.map(annualizedSalaryRangeWidth).filter((value): value is number => value != null)
  const ages = jobs.map((job) => postingAgeDays(job, now)).filter((value): value is number => value != null)
  const technicalJobs = jobs.filter(isTechnical)
  const fieldJobs = jobs.filter(isField)
  const electricalJobs = jobs.filter((job) => isElectrical(job) || has(titleText(job), /\b(electrical engineer|pv engineer|commissioning)\b/i))
  const salesJobs = jobs.filter(isSales)
  const segmentedJobs = jobs.map((job) => ({ job, segment: segment(job) })).filter((row): row is { job: ActiveJob; segment: Segment } => row.segment != null)

  const matches = (population: ActiveJob[], pattern: RegExp) =>
    population.filter((job) => has(jobText.get(job.id) ?? '', pattern)).length

  const employers = new Map<string, { name: string; count: number }>()
  for (const job of jobs) {
    const name = job.company.trim()
    if (!name) continue
    const key = name.toLocaleLowerCase('en-US')
    const current = employers.get(key)
    employers.set(key, { name: current?.name ?? name, count: (current?.count ?? 0) + 1 })
  }
  const employerCounts = Object.fromEntries([...employers.entries()].map(([key, row]) => [key, row.count]))

  const stateCounts: Record<string, number> = {}
  for (const job of jobs) {
    const code = normalizedStateCode(job)
    if (code) stateCounts[code] = (stateCounts[code] ?? 0) + 1
  }

  const segmentCounts = new Map<Segment, number>()
  for (const row of segmentedJobs) segmentCounts.set(row.segment, (segmentCounts.get(row.segment) ?? 0) + 1)
  const segmentCount = (name: Segment) => segmentCounts.get(name) ?? 0

  const recentCount = (days: number) => jobs.filter((job) => {
    if (!job.postedAt) return false
    const age = (now.getTime() - job.postedAt.getTime()) / DAY_MS
    return age >= 0 && age <= days
  }).length

  const entryLevelJobs = jobs.filter(isEntryAccessible)
  const entryLevel = entryLevelJobs.length
  const entryAccessibleTechnicalJobs = jobs.filter((job) => (isTechnical(job) || isField(job)) && isEntryAccessible(job))

  const degree = matches(jobs, /\b(bachelor(?:'s|s)? degree|baccalaureate|four[ -]?year degree|college degree)\b/i)
  const remote = jobs.filter((job) => has(`${job.title} ${job.location}`.toLowerCase(), /\b(remote|work from home|home[- ]based)\b/i)).length
  const agedAtLeast = (days: number) => ages.filter((age) => age >= days).length

  const nabcep = matches(technicalJobs, /\bnabcep\b/i)
  const osha = matches(fieldJobs, /\bosha[\s-]?(?:10|30)\b/i)
  const electricalLicense = matches(electricalJobs, /\b(journeyman|master electrician|licensed electrician|electrical (?:contractor )?licen[cs]e|state electrical licen[cs]e)\b/i)
  const gridSkills = matches(technicalJobs, /\b(scada|substation|interconnection|medium[ -]?voltage|high[ -]?voltage|switchgear|protective relay|relay protection)\b/i)
  const travel = matches(fieldJobs, /\btravel(?:ing)?\b|\bon the road\b|\bsite visits?\b/i)
  const perDiem = matches(fieldJobs, /\bper[ -]?diem\b/i)
  const relocation = matches(fieldJobs, /\b(relocation (?:assistance|package|benefit|available|offered)|relocation reimbursement|will relocate)\b/i)
  const signOn = matches(fieldJobs, /\b(sign[ -]?on|signing) bonus\b/i)
  const sales1099 = salesJobs.filter((job) => {
    const value = jobText.get(job.id) ?? ''
    return has(value, /\b1099\b|\bindependent contractor\b/i) || has((job.contractType ?? '').toLowerCase(), /contractor|contract/i)
  }).length
  const commissionOnly = matches(salesJobs, /\b(commission[ -]?only|100\s*% commission|straight commission)\b/i)
  const omJobs = technicalJobs.filter((job) => isOperations(job)).length
  const buildJobs = technicalJobs.filter(isBuildOriented).length
  const storageSkills = matches(technicalJobs, /\b(battery|bess|energy storage|battery storage|storage system|power conversion system|pcs|energy management system|ems|battery management system|bms)\b/i)
  const manufacturing = jobs.filter((job) => has(titleText(job), /\b(manufacturing|production|factory|plant) (?:engineer|manager|technician|operator|associate|supervisor|worker)|\bmodule manufacturing\b/i)).length
  const apprenticeships = technicalJobs.filter(mentionsApprenticeship).length
  const policySignals = matches(technicalJobs, /\b(prevailing wage|davis[ -]?bacon|project labor agreement|registered apprenticeship)\b/i)
  const trainingMentions = entryAccessibleTechnicalJobs.filter(mentionsEmployerTraining).length
  const trainingGaps = entryAccessibleTechnicalJobs.filter((job) =>
    (requiresPriorExperience(job) || requiresTradeCredential(job)) &&
    !mentionsEmployerTraining(job) &&
    !mentionsApprenticeship(job)
  ).length
  const experienceRequirements = jobs.filter(requiresPriorExperience).length
  const entryLevelContradictions = entryLevelJobs.filter(requiresPriorExperience).length
  const solarStorageProfiles = jobs.filter(requiresSolarStorageProfile).length

  const metrics: Record<string, MetricValue> = {
    totalJobs: countMetric(totalJobs),
    employerCount: countMetric(employers.size),
    new7Days: countMetric(recentCount(7)),
    new30Days: countMetric(recentCount(30)),
    medianSalary: distributionMetric(percentile(salaries, 0.5), 'currency', salaries.length, totalJobs),
    salaryP25: distributionMetric(percentile(salaries, 0.25), 'currency', salaries.length, totalJobs),
    salaryP75: distributionMetric(percentile(salaries, 0.75), 'currency', salaries.length, totalJobs),
    salaryDisclosureRate: rateMetric(salaries.length, totalJobs),
    medianSalaryRangeWidth: {
      value: percentile(salaryRangeWidths, 0.5),
      unit: 'currency',
      denominator: salaryRangeWidths.length,
    },
    medianPostingAgeDays: distributionMetric(percentile(ages, 0.5), 'days', ages.length, totalJobs),
    aged30Rate: rateMetric(agedAtLeast(30), ages.length),
    aged60Rate: rateMetric(agedAtLeast(60), ages.length),
    aged90Rate: rateMetric(agedAtLeast(90), ages.length),
    entryLevelRate: rateMetric(entryLevel, totalJobs),
    degreeRequirementRate: rateMetric(degree, totalJobs),
    remoteRate: rateMetric(remote, totalJobs),
    storageShare: rateMetric(segmentCount('Battery storage'), segmentedJobs.length),
    utilityShare: rateMetric(segmentCount('Utility-scale solar'), segmentedJobs.length),
    residentialShare: rateMetric(segmentCount('Residential solar'), segmentedJobs.length),
    commercialShare: rateMetric(segmentCount('Commercial & industrial solar'), segmentedJobs.length),
    ciShare: rateMetric(segmentCount('Commercial & industrial solar'), segmentedJobs.length),
    nabcepRate: rateMetric(nabcep, technicalJobs.length),
    oshaRate: rateMetric(osha, fieldJobs.length),
    electricalLicenseRate: rateMetric(electricalLicense, electricalJobs.length),
    gridSkillsRate: rateMetric(gridSkills, technicalJobs.length),
    travelRate: rateMetric(travel, fieldJobs.length),
    perDiemRate: rateMetric(perDiem, fieldJobs.length),
    relocationRate: rateMetric(relocation, fieldJobs.length),
    signOnBonusRate: rateMetric(signOn, fieldJobs.length),
    sales1099Rate: rateMetric(sales1099, salesJobs.length),
    commissionOnlyRate: rateMetric(commissionOnly, salesJobs.length),
    buildShareTechnical: rateMetric(buildJobs, technicalJobs.length),
    omShareTechnical: rateMetric(omJobs, technicalJobs.length),
    storageSkillsRate: rateMetric(storageSkills, technicalJobs.length),
    solarStorageProfileRate: rateMetric(solarStorageProfiles, totalJobs),
    manufacturingShare: rateMetric(manufacturing, totalJobs),
    apprenticeshipRate: rateMetric(apprenticeships, technicalJobs.length),
    trainingGapRate: rateMetric(trainingGaps, entryAccessibleTechnicalJobs.length),
    trainingMentionRate: rateMetric(trainingMentions, entryAccessibleTechnicalJobs.length),
    experienceRequirementRate: rateMetric(experienceRequirements, totalJobs),
    entryLevelContradictionRate: rateMetric(entryLevelContradictions, entryLevelJobs.length),
    policySignalRate: rateMetric(policySignals, technicalJobs.length),
  }

  const roleBreakdown = ROLE_LABELS.map((role) => {
    const roleJobs = jobs.filter((job) => roleFamily(job) === role)
    const roleAges = roleJobs.map((job) => postingAgeDays(job, now)).filter((value): value is number => value != null)
    const roleSalaries = roleJobs.map(annualizedSalary).filter((value): value is number => value != null)
    return {
      role,
      count: roleJobs.length,
      share: totalJobs > 0 ? (roleJobs.length / totalJobs) * 100 : 0,
      medianPostingAgeDays: percentile(roleAges, 0.5),
      medianSalary: percentile(roleSalaries, 0.5),
    }
  }).filter((row) => row.count > 0)

  return {
    totalJobs,
    employerCount: employers.size,
    metrics,
    activeJobIds: jobs.map((job) => job.id),
    employerCounts,
    stateCounts,
    lastUpdated: jobs.reduce<Date | null>((latest, job) => !latest || job.fetchedAt > latest ? job.fetchedAt : latest, null),
    segmentMix: (['Battery storage', 'Utility-scale solar', 'Residential solar', 'Commercial & industrial solar'] as Segment[]).map((name) => ({
      segment: name,
      count: segmentCount(name),
      share: segmentedJobs.length > 0 ? (segmentCount(name) / segmentedJobs.length) * 100 : 0,
    })),
    roleBreakdown,
    topStates: Object.entries(stateCounts)
      .map(([code, count]) => ({ code, name: STATE_CODE_TO_NAME[code] ?? code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topEmployers: [...employers.values()]
      .map((row) => ({ company: row.name, count: row.count }))
      .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
      .slice(0, 10),
  }
}
