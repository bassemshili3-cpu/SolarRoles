// scripts/seed-jobs.ts
// ─── Initial database seeding ──────────────────────────────────────────────
// Run with: npx tsx scripts/seed-jobs.ts
// Fetches Jooble + Lensa + Careerjet across the keyword pool
import { syncAllJobs } from '../lib/job-sync'

const TOTAL_PAGES = 30

async function seed() {
  console.log(`🌱 Seeding database with ${TOTAL_PAGES} rotation pages across 3 sources...`)

  let totalJooble = 0
  let totalLensa = 0
  let totalCareerjet = 0

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`\n📥 Rotation page ${page}/${TOTAL_PAGES}`)

    try {
      const result = await syncAllJobs(page, 50)
      totalJooble += result.jooble.saved
      totalLensa += result.lensa.saved
      totalCareerjet += result.careerjet.saved
      console.log(
        `   Jooble: +${result.jooble.saved} | Lensa: +${result.lensa.saved} | Careerjet: +${result.careerjet.saved}`
      )
    } catch (e: any) {
      console.error(`   ❌ Page ${page} failed:`, e.message)
    }

    // Pause 2 seconds between pages to respect API rate limits
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`   Total Jooble: ${totalJooble} jobs`)
  console.log(`   Total Lensa: ${totalLensa} jobs`)
  console.log(`   Total Careerjet: ${totalCareerjet} jobs`)
  console.log(`   Total: ${totalJooble + totalLensa + totalCareerjet} jobs`)
  console.log(`\n   Run "npx prisma studio" to verify.`)

  process.exit(0)
}

seed()