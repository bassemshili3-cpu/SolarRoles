/**
 * Covers both the legacy /jobs/[id] redirect and the canonical detail route.
 * A full viewport keeps the shared footer below the fold while job data and
 * the redirect are resolving.
 */
export default function JobLoading() {
  return <main aria-busy="true" aria-label="Loading job" className="min-h-screen bg-white" />
}
