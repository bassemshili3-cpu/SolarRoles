/**
 * Seed Adzuna scopé à la niche solaire (PV installer, lead installer) pour
 * SolarRoles. Contrairement aux jobs Ashby/Lever/Greenhouse/Pinpoint, ces
 * jobs sont du backfill de volume — ils restent `source: 'adzuna'`, donc
 * automatiquement `noindex` via isIndexable dans generateMetadata (voir
 * NON_INDEXABLE_SOURCES). Le but est de peupler le site pour les visiteurs,
 * pas de gagner du SEO dessus.
 *
 * Usage: npx tsx scripts/seed-adzuna-solar.ts
 */

import { PrismaClient } from '@prisma/client';
import { searchJobs, normalizeAdzuna } from '../lib/adzuna';
import { isSolarInstallerRole } from '../lib/ats/solar-taxonomy';

const prisma = new PrismaClient();

const EXPIRY_DAYS = 30;
const SOURCE_PRIORITY = 10; // en dessous des ATS directs (0), au-dessus si besoin d'ajuster

// Mots-clés strictement scopés à la niche — ne pas élargir au-delà de
// installer/technicien solaire pour ne pas diluer le positionnement du site.
const KEYWORDS = [
  'solar installer',
  'solar panel installer',
  'lead solar installer',
  'solar pv installer',
  'solar technician',
  'solar electrician',
  'residential solar installer',
  'commercial solar installer',
];

const RESULTS_PER_PAGE = 50;
const PAGES_PER_KEYWORD = 6;

async function upsertJob(rawJob: ReturnType<typeof normalizeAdzuna>): Promise<'created' | 'updated' | 'skipped'> {
  if (!isSolarInstallerRole(rawJob.title)) {
    return 'skipped';
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

  const existing = await prisma.job.findUnique({ where: { id: rawJob.id } });

  if (existing) {
    await prisma.job.update({
      where: { id: rawJob.id },
      data: {
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        addressRegion: rawJob.addressRegion,
        description: rawJob.description,
        applyUrl: rawJob.applyUrl,
        contractType: rawJob.contractType,
        salaryMin: rawJob.salaryMin,
        salaryMax: rawJob.salaryMax,
        active: true,
        expiresAt,
        fetchedAt: new Date(),
      },
    });
    return 'updated';
  }

  await prisma.job.create({
    data: {
      id: rawJob.id,
      source: 'adzuna',
      sourcePriority: SOURCE_PRIORITY,
      title: rawJob.title,
      company: rawJob.company,
      location: rawJob.location,
      addressRegion: rawJob.addressRegion,
      description: rawJob.description,
      url: rawJob.url,
      applyUrl: rawJob.applyUrl,
      contractType: rawJob.contractType,
      salaryMin: rawJob.salaryMin,
      salaryMax: rawJob.salaryMax,
      postedAt: rawJob.postedAt,
      expiresAt,
      active: true,
      needsHeaderImage: true,
      seoDescriptionVersion: 0,
    },
  });
  return 'created';
}

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const keyword of KEYWORDS) {
    for (let page = 1; page <= PAGES_PER_KEYWORD; page++) {
      try {
        const result = await searchJobs({
          what: keyword,
          where: 'United States',
          results_per_page: RESULTS_PER_PAGE,
          page,
        });

        console.log(`[adzuna] "${keyword}" page ${page}: ${result.results.length} result(s)`);

        for (const rawJob of result.results) {
          const normalized = normalizeAdzuna(rawJob);
          try {
            const outcome = await upsertJob(normalized);
            if (outcome === 'created') created++;
            else if (outcome === 'updated') updated++;
            else skipped++;
          } catch (err) {
            errors++;
            console.error(`❌ Upsert failed for ${normalized.id}:`, err);
          }
        }

        // Pause polie entre chaque appel
        await new Promise((r) => setTimeout(r, 300));
      } catch (err: any) {
        errors++;
        console.error(`❌ Adzuna error ("${keyword}", page ${page}):`, err.message);
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped (off-niche): ${skipped}, Errors: ${errors}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});