import { z } from 'zod'

export const whatJobsMetricSchema = z.object({
  id: z.string().uuid(),
  viewId: z.string().uuid(),
  surface: z.enum(['feed', 'job_box', 'job_search']),
  type: z.enum(['widget_impression', 'job_impression', 'click', 'search_submit']),
  pagePath: z.string().max(300).regex(/^\/[a-zA-Z0-9/_-]*$/),
  jobId: z.string().regex(/^\d{1,20}$/).nullable(),
  publisher: z.string().regex(/^\d{1,10}$/).nullable(),
  device: z.enum(['desktop', 'mobile']),
  activation: z.enum(['mouse', 'keyboard', 'touch', 'middle', 'submit']).nullable(),
  pnpAvailable: z.boolean(),
  tokenPresent: z.boolean(),
  isTest: z.boolean(),
}).strict().refine(e => e.type !== 'search_submit' || e.surface === 'job_search')
  .refine(e => !['job_impression', 'click'].includes(e.type) || e.jobId !== null)

export const whatJobsMetricBatchSchema = z.object({ events: z.array(whatJobsMetricSchema).min(1).max(40) }).strict()
export type WhatJobsMetric = z.infer<typeof whatJobsMetricSchema>
