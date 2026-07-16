// lib/slugify.ts
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function buildJobSlug(job: { title: string; location?: string | null }): string {
  return slugify([job.title, job.location].filter(Boolean).join(' '))
}