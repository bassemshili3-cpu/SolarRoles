import { getCachedLensaJobs, LensaJobAdvert } from './lensa'
import { searchJobs as searchAdzuna, AdzunaJob } from './adzuna'
import { searchJooble, JoobleJob } from './jooble'
import { cacheJoobleJobs } from './jooble-cache'

export interface UnifiedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  apply_url: string
  source: 'lensa' | 'adzuna' | 'jooble'
  salary_min?: number
  salary_max?: number
  created?: string
  revenue_per_click?: number
  addressRegion?: string
}

export interface UnifiedSearchResult {
  results: UnifiedJob[]
  count: number
  lensa_count: number
  adzuna_count: number
  jooble_count: number
}

// Cooldown en mémoire — évite de recontacter Lensa si il est down
let lensaDownUntil: number | null = null

export function normalizeLensa(job: LensaJobAdvert): UnifiedJob {
  return {
    id: `lensa-${job.unique_id}`,
    title: job.cleaned_job_title,
    company: job.company,
    location: `${job.city}, ${job.state}`,
    description: job.description_digest,
    url: `/jobs/lensa-${job.unique_id}`,
    apply_url: job.incoming_click_url,
    source: 'lensa',
    revenue_per_click: job.revenue_per_click,
  }
}

export function normalizeAdzuna(job: AdzunaJob): UnifiedJob {
  const area = job.location?.area || []
  const addressRegion = area[1] || ''

  return {
    id: `adzuna-${job.id}`,
    title: job.title,
    company: job.company?.display_name || '',
    location: job.location?.display_name || '',
    description: job.description,
    url: `/jobs/adzuna-${job.id}`,
    apply_url: job.redirect_url || '',
    source: 'adzuna',
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    created: job.created,
    addressRegion,
  }
}

export function normalizeJooble(job: JoobleJob): UnifiedJob {
  // Parse salary string "$50,000 - $70,000" en min/max
  let salary_min: number | undefined
  let salary_max: number | undefined

  if (job.salary) {
    const nums = job.salary.match(/[\d,]+/g)
    if (nums && nums.length >= 1) {
      salary_min = parseInt(nums[0].replace(/,/g, ''))
      if (nums.length >= 2) {
        salary_max = parseInt(nums[1].replace(/,/g, ''))
      }
    }
  }

  // Génère un ID stable à partir du lien (Jooble n'a pas toujours un ID unique fiable)
  const stableId = job.id || Buffer.from(job.link).toString('base64').slice(0, 16)

  return {
    id: `jooble-${stableId}`,
    title: job.title,
    company: job.company || '',
    location: job.location || '',
    description: job.snippet || '',
    url: `/jobs/jooble-${stableId}`,
    apply_url: job.link || '',
    source: 'jooble',
    salary_min,
    salary_max,
    created: job.updated || undefined,
  }
}

export async function searchAllJobs(params: {
  what?: string
  where?: string
  page?: number
  results_per_page?: number
  salary_min?: string
}): Promise<UnifiedSearchResult> {
  console.log("=== 🔍 DEBUG SEARCH ALL JOBS START ===")
  console.log("Params reçus:", params)

  const page = Number(params.page) || 1
  const totalLimit = Number(params.results_per_page) || 30
  const lensaOffset = Math.min((page - 1) * totalLimit, 180)

  // === Parse localisation pour Lensa ===
  let city: string | undefined
  let state: string | undefined
  let remote_only: boolean | undefined = undefined

  if (params.where) {
    const whereLower = params.where.toLowerCase().trim()
    if (whereLower.includes('remote')) {
      remote_only = true
      console.log("→ Mode Remote activé pour Lensa")
    } else {
      const parts = params.where.split(',').map(p => p.trim())
      city = parts[0]
      state = parts[1] || undefined
      console.log(`→ Parsing localisation → city: "${city}", state: "${state}"`)
    }
  }

  const lensaParams = { job_title: params.what, city, state, remote_only, offset: lensaOffset, limit: totalLimit }
  const adzunaParams = {
    what: params.what || '',
    where: params.where || '',
    page,
    results_per_page: totalLimit,
    ...(params.salary_min && { salary_min: Number(params.salary_min) }),
  }
  const joobleParams = {
    keywords: params.what || '',
    location: params.where || '',
    page,
    resultsOnPage: totalLimit,
    ...(params.salary_min && { salary: Number(params.salary_min) }),
  }

  // === Cooldown check ===
  const lensaSkipped = lensaDownUntil !== null && Date.now() < lensaDownUntil
  if (lensaSkipped) {
    console.warn("⚠️ Lensa en cooldown → skip")
  }

  // === Appels parallèles (3 sources) ===
  const [joobleResult, lensaResult, adzunaResult] = await Promise.allSettled([
    searchJooble(joobleParams),
    lensaSkipped ? Promise.reject(new Error('Lensa en cooldown')) : getCachedLensaJobs(lensaParams),
    searchAdzuna(adzunaParams),
  ])

  // === Traitement Jooble (priorité #1) ===
  let joobleJobs: UnifiedJob[] = []
  let joobleCount = 0

  if (joobleResult.status === 'fulfilled' && joobleResult.value) {
    joobleJobs = joobleResult.value.jobs.map(normalizeJooble)
    joobleCount = joobleResult.value.totalCount
    console.log(`✅ Jooble : ${joobleJobs.length} jobs (total: ${joobleCount})`)
  } else {
    console.error("❌ Jooble error:", joobleResult.status === 'rejected' ? joobleResult.reason?.message : 'unknown')
  }

  // === Traitement Lensa (priorité #2) ===
  let lensaData: any = null

  if (lensaResult.status === 'fulfilled') {
    lensaData = lensaResult.value
    console.log(`✅ Lensa SUCCESS : ${lensaData?.job_adverts?.length || 0} jobs (count total: ${lensaData?.count || 0})`)
  } else {
    const msg = lensaResult.reason?.message || ''
    if (!lensaSkipped) {
      console.error("❌ Lensa FAILED :", msg)
      if (msg.includes('422') || msg.toLowerCase().includes('inactive') || msg.includes('401') || msg.includes('403')) {
        lensaDownUntil = Date.now() + 2 * 60 * 60 * 1000
        console.warn("⚠️ Lensa mis en cooldown 2h")
      }
    }
  }

  let lensaJobs: UnifiedJob[] = lensaData?.job_adverts?.map(normalizeLensa) || []
  const lensaCount = lensaData?.count || 0

  // Fallback Lensa sans localisation
  if (!lensaSkipped && lensaData && lensaJobs.length === 0 && params.what) {
    console.log("⚠️ Aucun job Lensa → Tentative sans filtre localisation...")
    try {
      const lensaData2 = await getCachedLensaJobs({ job_title: params.what, limit: totalLimit })
      const extra = lensaData2?.job_adverts?.map(normalizeLensa) || []
      lensaJobs.push(...extra)
      console.log(`✅ Lensa fallback : ${extra.length} jobs`)
    } catch (e: any) {
      console.error("❌ Fallback Lensa échoué aussi")
    }
  }

  // === Traitement Adzuna (priorité #3) ===
  let adzunaJobs: UnifiedJob[] = []
  let adzunaCount = 0

  if (adzunaResult.status === 'fulfilled' && adzunaResult.value) {
    adzunaJobs = adzunaResult.value.results.map(normalizeAdzuna)
    adzunaCount = adzunaResult.value.count
    console.log(`✅ Adzuna : ${adzunaJobs.length} jobs`)
  } else {
    console.error("❌ Adzuna error:", adzunaResult.status === 'rejected' ? adzunaResult.reason?.message : 'unknown')
  }

  // === Déduplications par titre + company ===
  const seen = new Set<string>()
  const dedup = (jobs: UnifiedJob[]): UnifiedJob[] => {
    return jobs.filter((job) => {
      const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Ordre de priorité : Jooble → Lensa → Adzuna
  const dedupedJooble = dedup(joobleJobs)
 
cacheJoobleJobs(dedupedJooble)
  const dedupedLensa = dedup(lensaJobs)
  const dedupedAdzuna = dedup(adzunaJobs)

  const allResults = [...dedupedJooble, ...dedupedLensa, ...dedupedAdzuna]

  console.log(`📦 TOTAL RETOURNÉ : ${dedupedJooble.length} Jooble + ${dedupedLensa.length} Lensa + ${dedupedAdzuna.length} Adzuna (${allResults.length} après dédup)`)
  console.log("=== DEBUG END ===")

  return {
    results: allResults,
    count: Math.max(joobleCount, lensaCount, adzunaCount),
    lensa_count: lensaCount,
    adzuna_count: adzunaCount,
    jooble_count: joobleCount,
  }
}