import { searchLensaJobs, LensaJobAdvert } from './lensa'
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
  console.log("Lensa SDK Key présent ?", !!process.env.LENSA_SDK_KEY)
  console.log("Lensa Campaign ID présent ?", !!process.env.LENSA_CAMPAIGN_ID)

  const page = Number(params.page) || 1
  const totalLimit = Number(params.results_per_page) || 30
  const lensaOffset = Math.min((page - 1) * totalLimit, 180)

  // === 1. LENSA EN PRIORITÉ ===
  let lensaData: any = null
  let lensaDisabled = false

  try {
    let city: string | undefined
    let state: string | undefined
    let remote_only: boolean | undefined = undefined

    if (params.where) {
      const whereLower = params.where.toLowerCase().trim()
      console.log(`Where brut reçu : "${params.where}"`)

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
    console.log("Params envoyés à Lensa :", lensaParams)

    lensaData = await searchLensaJobs(lensaParams)

    console.log(`✅ Lensa SUCCESS : ${lensaData?.job_adverts?.length || 0} jobs (count total: ${lensaData?.count || 0})`)
  } catch (e: any) {
    console.error("❌ Lensa FAILED :", e.message)

    if (e.message.includes('422') || e.message.toLowerCase().includes('inactive')) {
      console.warn("⚠️ Campaign Lensa inactive → skip fallback, 100% Adzuna")
      lensaDisabled = true
    } else if (e.message.includes('401') || e.message.includes('403')) {
      console.error("→ Problème probable : LENSA_SDK_KEY ou LENSA_CAMPAIGN_ID invalide")
      lensaDisabled = true
    }
  }

  const lensaJobs: UnifiedJob[] = lensaData?.job_adverts?.map(normalizeLensa) || []
  const lensaCount = lensaData?.count || 0

  // Fallback Lensa uniquement si l'échec n'est PAS une campaign inactive
  if (!lensaDisabled && lensaJobs.length === 0 && params.what) {
    console.log("⚠️ Aucun job Lensa → Tentative sans filtre localisation...")
    try {
      const lensaData2 = await searchLensaJobs({ job_title: params.what, limit: totalLimit })
      const extra = lensaData2?.job_adverts?.map(normalizeLensa) || []
      lensaJobs.push(...extra)
      console.log(`✅ Lensa fallback : ${extra.length} jobs`)
    } catch (e: any) {
      console.error("❌ Fallback Lensa échoué aussi")
    }
  }

  // === 2. Adzuna en complément ===
  // Si Lensa est disabled, tout le quota va à Adzuna
  const remaining = lensaDisabled ? totalLimit : totalLimit - lensaJobs.length
  let adzunaJobs: UnifiedJob[] = []
  let adzunaCount = 0

  if (remaining > 0) {
    console.log(`➡️ ${remaining} places restantes → Appel Adzuna`)
    const adzunaData = await searchAdzuna({
      what: params.what || '',
      where: params.where || '',
      page,
      results_per_page: remaining,
      ...(params.salary_min && { salary_min: Number(params.salary_min) }),
    }).catch((e: any) => {
      console.error("❌ Adzuna error:", e.message)
      return null
    })

    if (adzunaData) {
      adzunaJobs = adzunaData.results.map(normalizeAdzuna)
      adzunaCount = adzunaData.count
      console.log(`✅ Adzuna : ${adzunaJobs.length} jobs`)
    }
  }

  console.log(`📦 TOTAL RETOURNÉ : ${lensaJobs.length} Lensa + ${adzunaJobs.length} Adzuna`)
  console.log("=== DEBUG END ===")

  return {
    results: [...lensaJobs, ...adzunaJobs],
    count: Math.max(lensaCount, adzunaCount),
    lensa_count: lensaCount,
    adzuna_count: adzunaCount,
  }
}