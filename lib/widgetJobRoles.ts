// Public widget choices. Keep this module free of server-only imports so the
// configurator and the server-rendered iframe use the same labels and slugs.
export const WIDGET_JOB_ROLES = [
  { slug: 'solar-photovoltaic-installer', label: 'PV Installer', heading: 'Solar PV installer jobs', jobsPath: '/solar-pv-installer-jobs', searchTerm: 'solar installer' },
  { slug: 'lead-solar-installer', label: 'Lead Installer', heading: 'Lead solar installer jobs', jobsPath: '/lead-solar-installer-jobs', searchTerm: 'lead solar installer' },
  { slug: 'solar-electrician', label: 'Solar Electrician', heading: 'Solar electrician jobs', jobsPath: '/solar-electrician-jobs', searchTerm: 'solar electrician' },
  { slug: 'solar-technician', label: 'Solar Technician', heading: 'Solar technician jobs', jobsPath: '/solar-technician-jobs', searchTerm: 'solar technician' },
  { slug: 'bess-technician', label: 'BESS Technician', heading: 'BESS technician jobs', jobsPath: '/bess-technician-jobs', searchTerm: 'bess technician' },
  { slug: 'solar-engineer', label: 'Solar Engineer', heading: 'Solar engineer jobs', jobsPath: '/solar-engineer-jobs', searchTerm: 'solar engineer' },
  { slug: 'solar-sales-representative', label: 'Solar Sales', heading: 'Solar sales jobs', jobsPath: '/solar-sales-jobs', searchTerm: 'solar sales' },
] as const

export type WidgetJobRole = (typeof WIDGET_JOB_ROLES)[number]

export function getWidgetJobRole(value: string | null | undefined): WidgetJobRole | undefined {
  return WIDGET_JOB_ROLES.find((role) => role.slug === value)
}
