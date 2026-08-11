import { prisma } from '../lib/prisma'

function containsExperience(text: string): boolean {
  const lower = text.toLowerCase()
  return /\b\d{1,2}\s*(?:to|-|–)?\s*\d{0,2}\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience\b/i.test(text) ||
         /\b(?:no\s+experience|entry\s+level|will\s+train)\b/i.test(text)
}

function findExperienceMatches(text: string): string[] {
  const matches: string[] = []
  const lower = text.toLowerCase()
  
  // Simple patterns
  const patterns = [
    /\b\d{1,2}\s*(?:to|-|–)\s*\d{1,2}\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience\b/gi,
    /\b\d{1,2}\+\s*(?:years?|yrs?)\s*(?:of\s+)?experience\b/gi,
    /\b(?:no\s+experience|no\s+prior\s+experience|entry\s+level|entry-level|will\s+train|training\s+provided)\b/gi,
  ]
  
  for (const pattern of patterns) {
    const found = text.match(pattern)
    if (found) matches.push(...found)
  }
  
  return matches
}

async function main() {
  const jobs = await prisma.job.findMany({
    where: { active: true },
    take: 20,
    orderBy: { postedAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      seoDescription: true,
    },
  })

  console.log(`\n=== Diagnostic sur ${jobs.length} offres ===\n`)

  for (const job of jobs) {
    const rawText = `${job.title} ${job.description || ''}`
    const seoText = job.seoDescription || ''
    
    const rawHasExp = containsExperience(rawText)
    const seoHasExp = containsExperience(seoText)
    
    const rawMatches = findExperienceMatches(rawText)
    const seoMatches = findExperienceMatches(seoText)
    
    console.log(`\n--- Job ${job.id} ---`)
    console.log(`Titre: ${job.title}`)
    console.log(`\n[description brut] "${job.description?.slice(0, 200)}..."`)
    console.log(`→ contient "experience": ${rawHasExp}`)
    if (rawMatches.length > 0) {
      console.log(`→ matches trouvés: ${rawMatches.join(', ')}`)
    }
    
    if (seoText) {
      console.log(`\n[seoDescription] "${seoText.slice(0, 200)}..."`)
      console.log(`→ contient "experience": ${seoHasExp}`)
      if (seoMatches.length > 0) {
        console.log(`→ matches trouvés: ${seoMatches.join(', ')}`)
      }
    } else {
      console.log(`\n[seoDescription] NULL`)
    }
    
    console.log(`\n→ Résumé: description=${rawHasExp ? '✅' : '❌'}, seoDescription=${seoHasExp ? '✅' : '❌'}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)