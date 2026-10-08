// ATS providers only; excludes aggregators, employer posts and direct scraping.
export const ATS_JOB_SOURCES = [
  'jazzhr', 'breezy', 'lever', 'ashby', 'smartrecruiters', 'jobvite',
  'greenhouse', 'pinpoint', 'workday', 'workable', 'rippling',
  'successfactors', 'oraclecloud', 'ukg', 'icims', 'adp', 'paylocity',
  'paycom', 'hrmdirect', 'saashr',
] as const
