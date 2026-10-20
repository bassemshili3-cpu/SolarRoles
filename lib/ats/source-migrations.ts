import migrations from '../../config/ats/source-migrations-20261020.json';
import { fetchAshbyJobs } from './ashby';
import type { NormalizedJob } from './types';

/** Preserve the scheduled task index while following a verified board move. */
export async function recoverConfiguredAtsSource(provider: string, company: { slug?: string; name: string }): Promise<NormalizedJob[] | undefined> {
  const migration = migrations.replacements.find(row => row.provider === provider && row.sourceSlug === company.slug);
  if (!migration) return undefined;
  if (migration.target.provider !== 'ashby') throw new Error('Unsupported configured ATS migration');
  console.log(`[${provider}] ${company.slug}: following documented board migration to ${migration.target.provider}`);
  return fetchAshbyJobs({ slug: migration.target.slug, name: company.name, verified: false });
}
