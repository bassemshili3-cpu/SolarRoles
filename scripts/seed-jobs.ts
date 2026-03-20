// scripts/seed-jobs.ts
// ─── Remplissage initial de la base ──────────────────────────────────────────
// Lance avec : npx tsx scripts/seed-jobs.ts
// Fetch 20 pages depuis chaque source = ~1000 jobs par source

import { syncAllJobs } from '../lib/job-sync'

const TOTAL_PAGES = 20

async function seed() {
  console.log(`🌱 Seeding database with ${TOTAL_PAGES} pages per source...`)
  
  let totalAdzuna = 0
  let totalJooble = 0

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`\n📥 Page ${page}/${TOTAL_PAGES}`)
    
    try {
      const result = await syncAllJobs(page, 50)
      totalAdzuna += result.adzuna.saved
      totalJooble += result.jooble.saved
      console.log(`   Adzuna: +${result.adzuna.saved} | Jooble: +${result.jooble.saved}`)
    } catch (e: any) {
      console.error(`   ❌ Page ${page} failed:`, e.message)
    }

    // Pause 2 secondes entre chaque page pour éviter les rate limits
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`   Total Adzuna: ${totalAdzuna} jobs`)
  console.log(`   Total Jooble: ${totalJooble} jobs`)
  console.log(`   Run "npx prisma studio" to verify.`)
  
  process.exit(0)
}

seed()