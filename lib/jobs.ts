import { getCachedLensaJobs, LensaJobAdvert } from './lensa'
import { searchJobs as searchAdzuna, AdzunaJob } from './adzuna'

export interface UnifiedJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  apply_url: string
  source: 'lensa' | 'adzuna'
  salary_min?: number
  salary_max?: number
  created?: string
  revenue_per_click?: number
}

export interface UnifiedSearchResult {
  results: UnifiedJob[]
  count: number
  lensa_count: number
  adzuna_count: number
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

  // === Cooldown check ===
  const lensaSkipped = lensaDownUntil !== null && Date.now() < lensaDownUntil
  if (lensaSkipped) {
    console.warn("⚠️ Lensa en cooldown → skip, 100% Adzuna")
  }

  // === Appels parallèles ===
  const [lensaResult, adzunaResult] = await Promise.allSettled([
    lensaSkipped ? Promise.reject(new Error('Lensa en cooldown')) : getCachedLensaJobs(lensaParams),
    searchAdzuna(adzunaParams),
  ])

  // === Traitement Lensa ===
  let lensaData: any = null

  if (lensaResult.status === 'fulfilled') {
    lensaData = lensaResult.value
    console.log(`✅ Lensa SUCCESS : ${lensaData?.job_adverts?.length || 0} jobs (count total: ${lensaData?.count || 0})`)
  } else {
    const msg = lensaResult.reason?.message || ''
    if (!lensaSkipped) {
      console.error("❌ Lensa FAILED :", msg)
      if (msg.includes('422') || msg.toLowerCase().includes('inactive') || msg.includes('401') || msg.includes('403')) {
        lensaDownUntil = Date.now() + 2 * 60 * 60 * 1000 // cooldown 2h
        console.warn("⚠️ Lensa mis en cooldown 2h")
      }
    }
  }

  let lensaJobs: UnifiedJob[] = lensaData?.job_adverts?.map(normalizeLensa) || []
  const lensaCount = lensaData?.count || 0

  // Fallback Lensa sans localisation si aucun résultat mais pas en cooldown
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

  // === Traitement Adzuna ===
  let adzunaJobs: UnifiedJob[] = []
  let adzunaCount = 0

  if (adzunaResult.status === 'fulfilled' && adzunaResult.value) {
    adzunaJobs = adzunaResult.value.results.map(normalizeAdzuna)
    adzunaCount = adzunaResult.value.count
    console.log(`✅ Adzuna : ${adzunaJobs.length} jobs`)
  } else {
    console.error("❌ Adzuna error:", adzunaResult.status === 'rejected' ? adzunaResult.reason?.message : 'unknown')
  }

  // Priorité Lensa maintenue : lensaJobs toujours en premier
  console.log(`📦 TOTAL RETOURNÉ : ${lensaJobs.length} Lensa + ${adzunaJobs.length} Adzuna`)
  console.log("=== DEBUG END ===")

  return {
    results: [...lensaJobs, ...adzunaJobs],
    count: Math.max(lensaCount, adzunaCount),
    lensa_count: lensaCount,
    adzuna_count: adzunaCount,
  }
}