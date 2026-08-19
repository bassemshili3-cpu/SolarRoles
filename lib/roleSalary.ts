// lib/roleSalary.ts
// ─── Salaires par métier : source de vérité unique ──────────────────────────
// Centralise les définitions de rôles, les filtres SQL/Prisma et le calcul du
// salaire national par rôle, utilisés à la fois par :
//   - /data/salaries/[title] (pages "Salary by State")
//   - les landing pages jobs (titres SERP avec "Up to $XXK/yr")
// Plus de maps séparées qui peuvent diverger.
//
// `include` / `exclude` sont construits à partir d'un audit réel des titres
// en base — pas de "Solar Photovoltaic Installer" en toutes lettres dans les
// offres, donc on matche des fragments courants et on exclut explicitement
// les rôles voisins + le bruit (management, formation, RH...) pour éviter les
// chevauchements entre buckets.

import { Prisma } from '@prisma/client'
import { cache } from 'react'
import { prisma } from './prisma'

// React cache() n'est disponible que dans le runtime serveur React (Next.js).
// Hors de ce contexte (scripts Node isolés), on retombe sur l'identité.
const memoize =
  typeof cache === 'function' ? cache : <T,>(fn: T): T => fn

export type Role = {
  title: string
  include: string[]
  exclude: string[]
  careerPath?: { slug: string; title: string; direction: 'up' | 'down' }
  editorial: { dayToDay: string; certification: string; progression: string }
}

// Seuil de fiabilité : en dessous de ce nombre de listings, on ne met pas le
// salaire en avant dans un titre (même règle que les pages salary/states).
export const MIN_SALARY_LISTINGS = 3

// Bruit générique à exclure de tous les rôles : ce sont des offres qui
// contiennent "solar installer" dans le titre mais ne sont pas un poste
// d'installateur terrain (ex. "Director of Solar Installer Partnerships").
const NOISE = [
  'manager',
  'instructor',
  'trainer',
  'facilitator',
  'director',
  'partnership',
  'material handler',
  'superintendent',
]

export const ROLES: Record<string, Role> = {
  'solar-technician': {
  title: 'Solar Technician',
  include: [
    'solar technician',
    'pv technician',
    'solar service technician',
    'solar field service technician',
    'solar o&m technician',
    'solar maintenance technician',
    'pv o&m technician',
  ],
  exclude: [
    'installer',
    'install technician',
    'sales',
    'engineer',
    'bess',
    ...NOISE,
  ],
  editorial: {
    dayToDay:
      'A Solar Technician maintains PV systems already in the ground rather than installing new ones: diagnosing inverter faults, running production diagnostics, replacing failed components, and completing scheduled inspections. Work is spread across a service territory rather than concentrated on one job site, and unplanned callouts for system outages are common alongside the scheduled maintenance route.',
    certification:
      'Most postings ask for a year or more of hands-on PV or electrical experience before hire, sometimes phrased as a choice between solar O&M experience or time in an adjacent field like power plant operations. A NABCEP PV Associate or Installation Professional credential is common, and some employers prefer or require a state electrical license for troubleshooting work beyond basic component swaps.',
    progression:
      'Technicians with a few years of O&M experience often move into technical lead or regional service roles overseeing a territory, or laterally into commissioning, where the diagnostic experience transfers directly. Some also move into system design once they understand common failure modes well enough to design around them.',
  },
},
  'solar-sales-representative': {
  title: 'Solar Sales Representative',
  include: [
    'solar sales representative',
    'solar sales consultant',
    'solar sales rep',
    'residential solar sales',
    'solar sales',
  ],
  exclude: [...NOISE],
  editorial: {
    dayToDay:
      'A Solar Sales Representative generates and closes residential or commercial solar leads: running site assessments, presenting system designs and financing options, and walking homeowners through incentives like the federal tax credit. Compensation is typically commission-heavy, so the day is split between prospecting, sales calls, and closing paperwork rather than technical design or installation work.',
    certification:
      'No electrical license or NABCEP credential is required to sell solar — one of the few roles in the industry open without a technical background. Employers look for sales experience (door-to-door, insurance, real estate, or similar) more than solar-specific knowledge, though understanding system sizing and financing well enough to explain it to a homeowner is expected within the first few weeks.',
    progression:
      'Reps typically move up based on closed volume rather than tenure — top performers can reach team lead or sales manager roles within a year or two. Some also cross-train into system design or project management once they understand the technical side well enough.',
  },
},
'solar-engineer': {
  title: 'Solar Engineer',
  include: [
    'solar engineer',
    'solar design engineer',
    'pv engineer',
    'pv systems engineer',
    'solar systems engineer',
    'solar project engineer',
    'bess engineer',
    'solar electrical engineer',
    'electrical engineer - solar',
  ],
  exclude: [...NOISE],
  editorial: {
    dayToDay:
      'A Solar Engineer designs and specifies photovoltaic systems before anything is built: array layout, string and conductor sizing, shading and production modeling, equipment selection, and the drawing set that goes to permitting. Scope varies widely by title — from residential design desks to utility-scale systems engineering — but the work is software-based and office-centered rather than field installation.',
    certification:
      'Requirements range from a technician background plus software proficiency (common for residential design roles) to a full engineering degree and PE license (common for utility-scale and stamping roles). NABCEP PV Design Specialist and PVIP credentials come up across the spectrum, and proficiency in PVsyst, Helioscope, or Aurora Solar is close to universal.',
    progression:
      'Engineers typically progress from junior design roles into systems or project engineering, then into senior or PE-licensed positions with stamping responsibility. Moving into battery storage (BESS) engineering is an increasingly common lateral step as more projects add storage.',
  },
},
  'solar-photovoltaic-installer': {
    title: 'Solar Photovoltaic Installer',
    include: [
      'solar installer',
      'pv installer',
      'solar panel installer',
      'installation technician',
      'install technician',
      'solar / pv installer',
    ],
    exclude: [
      'lead',
      'foreman',
      'crew lead',
      'second in command',
      'sr.',
      'senior',
      'electrician',
      ...NOISE,
    ],
    careerPath: { slug: 'lead-solar-installer', title: 'Lead Solar Installer', direction: 'up' },
    editorial: {
      dayToDay:
        'A Solar Photovoltaic Installer mounts racking, places panels, runs conduit, and wires arrays on residential and commercial roofs or ground mounts. Most of the day is physical: carrying panels, working at height, and following an electrician or lead installer\'s directions on wiring and layout. Crews typically run 3 to 5 installs a week depending on system size and season.',
      certification:
        'Entry into the role rarely requires a license. Many installers start through an employer\'s in-house training or a community college solar program lasting a few weeks. A NABCEP PV Associate credential is a common early milestone and signals baseline knowledge of system design and safety to employers, even before full installer certification.',
      progression:
        'Installers typically move up after 1 to 3 years on the tools, once they can run a crew, read a permit set unsupervised, and troubleshoot a string fault without escalating. That track usually leads to Lead Installer, then site supervisor or a design role.',
    },
    
    
  },
  'lead-solar-installer': {
    title: 'Lead Solar Installer',
    include: [
      'lead solar installer',
      'crew lead',
      'foreman',
      'second in command',
      'sr. solar installer',
      'senior solar installer',
    ],
    exclude: [...NOISE],
    careerPath: {
      slug: 'solar-photovoltaic-installer',
      title: 'Solar Photovoltaic Installer',
      direction: 'down',
    },
    editorial: {
      dayToDay:
        'A Lead Solar Installer runs the crew on site: assigns tasks, checks the install against the permit set and engineering plans, handles the trickier electrical terminations, and is the point of contact for the inspector or the project manager. Less time on the roof carrying panels, more time making sure the job passes inspection the first time.',
      certification:
        'Most leads hold a NABCEP PV Installation Professional certification or are actively working toward one, plus several years of hands-on installs. Some states also require an electrical license or a state-specific solar contractor credential to sign off on certain work — this varies enough by state that it is worth checking with your state licensing board directly.',
      progression:
        'From Lead Installer, the common next steps are site supervisor, install operations manager, or moving into system design and permitting, where the NABCEP PV Design Specialist credential becomes relevant.',
    },
  },
  'solar-electrician': {
    title: 'Solar Electrician',
    include: ['electrician'],
    exclude: [...NOISE],
    editorial: {
      dayToDay:
        'A Solar Electrician handles the electrical side of an install: DC and AC wiring, combiner boxes, inverters, rapid shutdown devices, and the interconnection to the grid or to a battery system. On mixed crews they often work alongside mechanical installers who handle racking and panel placement, stepping in for terminations, troubleshooting, and code compliance.',
      certification:
        'Unlike a general PV installer role, this one typically requires a state electrical license (journeyman or master, depending on the state and the scope of work) on top of solar-specific knowledge. A NABCEP PV Installation Professional credential is common in addition to the electrical license, especially for anyone signing off on system design.',
      progression:
        'Solar Electricians often move toward electrical foreman roles, solar-specific master electrician status, or into system design and commissioning, where the electrical license combined with NABCEP credentials opens up higher-paying design and QA positions.',
    },
  },
}

// Mapping slug salary → landing page jobs (utilisé pour le CTA des pages salary).
export const SALARY_TO_LANDING: Record<string, string> = {
  'solar-photovoltaic-installer': 'solar-pv-installer-jobs',
  'lead-solar-installer': 'lead-solar-installer-jobs',
  'solar-electrician': 'solar-electrician-jobs',
  'bess-technician': 'bess-technician-jobs',
  'solar-sales-representative': 'solar-sales-jobs',
  'solar-engineer': 'solar-engineer-jobs',
  'solar-technician': 'solar-technician-jobs',
}

// Construit le WHERE (title LIKE p1 OR title LIKE p2 ...) AND NOT (...) pour la
// requête raw, à partir des patterns include/exclude d'un rôle.
export function titleFilterSql(role: Role) {
  const include = Prisma.join(
    role.include.map((p) => Prisma.sql`LOWER(title) LIKE ${'%' + p.toLowerCase() + '%'}`),
    ' OR '
  )
  const exclude = role.exclude.length
    ? Prisma.sql`AND NOT (${Prisma.join(
        role.exclude.map((p) => Prisma.sql`LOWER(title) LIKE ${'%' + p.toLowerCase() + '%'}`),
        ' OR '
      )})`
    : Prisma.empty

  return Prisma.sql`(${include}) ${exclude}`
}

// Équivalent include/exclude pour les requêtes Prisma classiques (aggregate, findFirst, count).
export function titleFilterPrisma(role: Role) {
  return {
    AND: [
      { OR: role.include.map((p) => ({ title: { contains: p, mode: 'insensitive' as const } })) },
      role.exclude.length
        ? { NOT: { OR: role.exclude.map((p) => ({ title: { contains: p, mode: 'insensitive' as const } })) } }
        : {},
    ],
  }
}

export type RoleSalaryStats = {
  count: number
  avgMin: number
  avgMax: number
  midpoint: number
}

// Salaire national (moyenne des MIN, des MAX, et du milieu de chaque range)
// pour un rôle donné, avec les mêmes filtres que les pages /data/salaries.
// Wrappé dans React cache() pour dédupliquer la query dans un même rendu.
export const getRoleSalaryStats = memoize(async (slug: string): Promise<RoleSalaryStats | null> => {
  const role = ROLES[slug]
  if (!role) return null

  const agg = await prisma.job.aggregate({
    where: {
      active: true,
      salaryMin: { not: null, gt: 0 },
      salaryMax: { not: null, gt: 0 },
      ...titleFilterPrisma(role),
    },
    _avg: { salaryMin: true, salaryMax: true },
    _count: { id: true },
  })

  return {
    count: agg._count.id,
    avgMin: Math.round(agg._avg.salaryMin || 0),
    avgMax: Math.round(agg._avg.salaryMax || 0),
    midpoint: Math.round(((agg._avg.salaryMin || 0) + (agg._avg.salaryMax || 0)) / 2),
  }
})

// Formate un salaire en milliers arrondis : 72745 → "$73K"
export function formatSalaryK(n: number): string {
  return `$${Math.round(n / 1000)}K`
}