/**

 * migrate-schema-descriptions.ts

 *

 * One-shot migration: regenerate `schemaDescription` for all job postings

 * using the new buildSchemaDescription logic (v2 — no AI filler).

 *

 * USAGE:

 *   npx tsx scripts/migrate-schema-descriptions.ts --dry-run

 *   npx tsx scripts/migrate-schema-descriptions.ts

 *   npx tsx scripts/migrate-schema-descriptions.ts --batch=200

 *   npx tsx scripts/migrate-schema-descriptions.ts --only-version=1

 *

 * SAFE PATH:

 *   1. Run --dry-run first, review a few diffs

 *   2. Backup your DB (pg_dump / mysqldump)

 *   3. Apply the Prisma migration (adds schemaDescription + schemaDescriptionVersion)

 *   4. Run the script for real

 */


import {

  buildSchemaDescription,

  BUILD_VERSION,

  type JobSchemaInput,

} from '../lib/buildSchemaDescription'

import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()


// ─── ARGS ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

const DRY_RUN = args.includes('--dry-run')

const BATCH_SIZE = parseInt(

  args.find(a => a.startsWith('--batch='))?.split('=')[1] ?? '100',

  10,

)

const ONLY_VERSION = args.includes('--only-version=')

  ? parseInt(args.find(a => a.startsWith('--only-version='))!.split('=')[1], 10)

  : null


// ─── JOB RECORD TYPE (matches your Prisma model) ──────────────────────────

interface JobRecord {

  id: string

  title: string

  company: string

  location: string              // "San Benito, TX" or "Remote"

  addressRegion: string         // "TX"

  description: string

  salaryMin: number | null

  salaryMax: number | null

  contractType: string | null   // Adzuna: "full_time" | "part_time" | "contract" | "temporary"

  contractTime: string | null   // Adzuna legacy: "full_time" | "part_time"

  schemaDescription: string | null

  schemaDescriptionVersion: number | null

}


// ─── HELPERS ──────────────────────────────────────────────────────────────

const STATE_NAMES: Record<string, string> = {

  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',

  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',

  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',

  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',

  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',

  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',

  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',

  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',

  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',

  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',

  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',

  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',

  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',

}


const ADZUNA_EMPLOYMENT_TYPE_MAP: Record<string, string> = {

  full_time: 'FULL_TIME',

  'full-time': 'FULL_TIME',

  part_time: 'PART_TIME',

  'part-time': 'PART_TIME',

  contract: 'CONTRACTOR',

  temporary: 'TEMPORARY',

  internship: 'INTERN',

  intern: 'INTERN',

}


function parseLocation(location: string): { city: string; remote: boolean } {

  const trimmed = (location ?? '').trim()

  const lower = trimmed.toLowerCase()


  if (

    lower === 'remote' ||

    lower.includes('anywhere') ||

    lower.includes('work from home') ||

    lower.includes('wfh') ||

    lower.startsWith('remote,') ||

    lower.startsWith('remote -')

  ) {

    return { city: '', remote: true }

  }


  const city = trimmed.split(',')[0]?.trim() ?? ''

  const remote = lower.includes('hybrid') || lower.includes('remote')


  return { city, remote }

}


function mapEmploymentType(

  contractType: string | null,

  contractTime: string | null,

): string | undefined {

  const raw = (contractType ?? contractTime ?? '').toLowerCase().trim()

  if (!raw) return undefined

  return ADZUNA_EMPLOYMENT_TYPE_MAP[raw]

}


function toSchemaInput(job: JobRecord): JobSchemaInput {

  const { city, remote } = parseLocation(job.location)

  const stateCode = job.addressRegion ?? ''

  const state = STATE_NAMES[stateCode] ?? ''


  return {

    title: job.title,

    company: job.company,

    city,

    state,

    stateCode,

    description: job.description,

    salaryMin: job.salaryMin ?? undefined,

    salaryMax: job.salaryMax ?? undefined,

    employmentType: mapEmploymentType(job.contractType, job.contractTime),

    remote,

  }

}


// ─── ORM CALLS ────────────────────────────────────────────────────────────

async function countJobsToMigrate(): Promise<number> {
  return prisma.job.count({
    where: ONLY_VERSION !== null
      ? { schemaDescriptionVersion: { lt: ONLY_VERSION } }  // ← plus de OR null
      : undefined,
  })
}


async function fetchJobsBatch(
  cursor: string | null,
  limit: number,
): Promise<JobRecord[]> {
  const jobs = await prisma.job.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' },
    where: ONLY_VERSION !== null
      ? { schemaDescriptionVersion: { lt: ONLY_VERSION } }  // ← plus de OR null
      : undefined,
  })
  return jobs as unknown as JobRecord[]
}


async function updateJobDescription(

  id: string,

  schemaDescription: string,

): Promise<void> {

  await prisma.job.update({

    where: { id },

    data: {

      schemaDescription,

      schemaDescriptionVersion: BUILD_VERSION,

    },

  })

}


// ─── CORE LOGIC ───────────────────────────────────────────────────────────

function diffSummary(

  oldText: string | null | undefined,

  newText: string,

): string {

  const oldLen = (oldText ?? '').length

  const newLen = newText.length

  const delta = newLen - oldLen

  const sign = delta >= 0 ? '+' : ''

  return `${oldLen}→${newLen} chars (${sign}${delta})`

}


async function main() {

  console.log('━'.repeat(60))

  console.log(`[migrate] target version: ${BUILD_VERSION}`)

  console.log(`[migrate] mode: ${DRY_RUN ? 'DRY-RUN (no writes)' : 'WRITE'}`)

  console.log(`[migrate] batch size: ${BATCH_SIZE}`)

  if (ONLY_VERSION !== null) {

    console.log(`[migrate] only jobs with version < ${ONLY_VERSION}`)

  }

  console.log('━'.repeat(60))


  const total = await countJobsToMigrate()

  console.log(`[migrate] total jobs to process: ~${total}`)


  let cursor: string | null = null

  let processed = 0

  let updated = 0

  let unchanged = 0

  let errors = 0


  while (true) {

    const jobs = await fetchJobsBatch(cursor, BATCH_SIZE)

    if (jobs.length === 0) break


    for (const job of jobs) {

      processed++

      try {

        const newDescription = buildSchemaDescription(toSchemaInput(job))


        if (newDescription === job.schemaDescription) {

          unchanged++

          continue

        }


        const diff = diffSummary(job.schemaDescription, newDescription)


        if (DRY_RUN) {

          if (processed <= 5) {

            console.log(`[dry-run] ${job.id}  ${diff}`)

            console.log(`          "${newDescription.slice(0, 120)}${newDescription.length > 120 ? '…' : ''}"`)

          }

        } else {

          await updateJobDescription(job.id, newDescription)

          updated++

          if (updated <= 5 || updated % 100 === 0) {

            console.log(`[write]   ${job.id}  ${diff}`)

          }

        }

      } catch (err) {

        errors++

        console.error(`[error]   ${job.id}`, err)

      }

    }


    cursor = jobs[jobs.length - 1].id

    console.log(

      `[progress] processed=${processed} updated=${updated} unchanged=${unchanged} errors=${errors}`,

    )

  }


  console.log('━'.repeat(60))

  console.log(`[migrate] DONE`)

  console.log(

    `[migrate] processed=${processed} updated=${updated} unchanged=${unchanged} errors=${errors}`,

  )

  if (DRY_RUN) {

    console.log(`[migrate] ⚠️  DRY-RUN: no changes were written`)

  }

  console.log('━'.repeat(60))


  await prisma.$disconnect()

  if (errors > 0) process.exit(1)

}


main().catch(async err => {

  console.error('[migrate] FATAL', err)

  await prisma.$disconnect()

  process.exit(1)

})

