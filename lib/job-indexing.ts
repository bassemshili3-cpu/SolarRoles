// Shared by job metadata and the sitemap so new ATS sources stay indexable.
export const NON_INDEXABLE_JOB_SOURCES = ['adzuna', 'jooble', 'careerjet', 'lensa', 'whatjobs']

export function isJobSourceIndexable(source: string): boolean {
  return !NON_INDEXABLE_JOB_SOURCES.includes(source)
}
