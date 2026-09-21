// Public widget choices. Keep this module free of server-only imports so the
// configurator and the server-rendered iframe use the same labels and slugs.
export const WIDGET_JOB_ROLES = [
  { slug: 'solar-photovoltaic-installer', label: 'PV Installer', heading: 'Solar PV installer jobs', jobsPath: '/solar-pv-installer-jobs' },
  { slug: 'lead-solar-installer', label: 'Lead Installer', heading: 'Lead solar installer jobs', jobsPath: '/lead-solar-installer-jobs' },
  { slug: 'solar-electrician', label: 'Solar Electrician', heading: 'Solar electrician jobs', jobsPath: '/solar-electrician-jobs' },
  { slug: 'solar-technician', label: 'Solar Technician', heading: 'Solar technician jobs', jobsPath: '/solar-technician-jobs' },
  { slug: 'bess-technician', label: 'BESS Technician', heading: 'BESS technician jobs', jobsPath: '/bess-technician-jobs' },
  { slug: 'solar-engineer', label: 'Solar Engineer', heading: 'Solar engineer jobs', jobsPath: '/solar-engineer-jobs' },
  { slug: 'solar-sales-representative', label: 'Solar Sales', heading: 'Solar sales jobs', jobsPath: '/solar-sales-jobs' },
] as const

export type WidgetJobRole = (typeof WIDGET_JOB_ROLES)[number]

export function getWidgetJobRole(value: string | null | undefined): WidgetJobRole | undefined {
  return WIDGET_JOB_ROLES.find((role) => role.slug === value)
}
