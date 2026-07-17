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
  const titleSlug = slugify(job.title)

  if (!job.location) return titleSlug

  const locationSlug = slugify(job.location)
  if (!locationSlug) return titleSlug

  // Certains titres source (Jooble notamment) contiennent déjà la ville/état
  // en fin de titre → on évite de la dupliquer en la rajoutant une 2e fois.
  if (titleSlug.endsWith(locationSlug)) {
    return titleSlug.slice(0, 80)
  }

  return `${titleSlug}-${locationSlug}`.slice(0, 80)
}