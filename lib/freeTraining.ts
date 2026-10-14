/** Reviewed resources. Eligibility uses employer copy, never an SEO rewrite as evidence. */
import { ADDITIONAL_TRAINING_CATEGORIES } from './freeTrainingAdditional'
export type TrainingCategoryId = 'electricians' | 'solar-installers' | 'solar-technicians' | 'solar-engineers' | 'solar-designers' | 'solar-sales' | 'project-managers' | 'energy-storage' | 'residential-solar-sales' | 'solar-inspection'
export type TrainingJob = { title: string; description?: string | null; displayDescription?: string | null; experienceLevel?: string | null }
type MatchingRules = { titleAll: readonly RegExp[]; titleExclude?: readonly RegExp[]; contextAll?: readonly RegExp[] }
export type FreeCourse = {
  id: string; title: string; officialUrl: string; affiliateUrl: string; instructor: string; duration: string
  format: 'full-free-course'; verifiedOn: string; verifiedFree: boolean; beginnerAppropriate: boolean
  audience: string; description: string; learningObjectives: readonly string[]; freeAccess: string; credentialLimit: string
}
type CategoryBase = { id: TrainingCategoryId; displayName: string; matching: MatchingRules }
export type PublishedTrainingCategory = CategoryBase & {
  status: 'published'; recommendationHeading: string; recommendationDescription: string; sectionHeading: string
  occupationParagraphs: readonly string[]; practicalStep: string; relatedPath: string; relatedLabel: string; course: FreeCourse
}
export type TrainingCategory = PublishedTrainingCategory | (CategoryBase & { status: 'unpublished'; reason: string })
const courseUrls = (id: string) => ({ officialUrl: `https://www.heatspring.com/courses/${id}`, affiliateUrl: `https://www.heatspring.com/courses/${id}?aff_id=9f_wlq` })
export const TRAINING_AFFILIATE_DISCLOSURE = 'Solar Roles may earn a commission if you purchase a paid course through our links.'
export const JOB_TRAINING_DISCLOSURE = 'This resource guide includes links that may earn Solar Roles a commission on paid purchases.'
const freeAccess = 'All materials in this standalone course are free after you create a HeatSpring account. No credit card is required. HeatSpring does not guarantee how long free materials will remain available.'

export const TRAINING_CATEGORIES: readonly TrainingCategory[] = [
  {
    id: 'solar-installers', displayName: 'Solar installers', status: 'published',
    matching: { titleAll: [/\b(solar|pv|photovoltaic)\b/i, /\b(installer|installation\s+(helper|trainee|apprentice))\b/i], titleExclude: [/\b(sales|engineer|designer|electrician|technician)\b/i] },
    recommendationHeading: 'Free Solar Installation Fundamentals',
    recommendationDescription: 'If you’re new to solar installation, you could take a free introductory course.',
    sectionHeading: 'Solar installers: learn the system before the tools',
    occupationParagraphs: [
      'PV installers assemble mounting structures and place modules on roofs or ground-mounted racks. Reading a layout and checking measurements matter alongside tool skills. Electrical connections are a separate responsibility whose scope depends on the job and state rules.',
      'A module produces direct-current electricity; an inverter converts it to alternating current. Learning where those components sit in a system makes an installation drawing easier to follow. It also gives a new crew member more precise questions to ask during supervised training.',
    ],
    practicalStep: 'Choose one installation opening and identify the tasks the employer expects you to learn on site. Ask who provides tool instruction, fall-protection training and supervision before you are assigned roof or electrical work.',
    relatedPath: '/resources/how-to-become-a-solar-installer', relatedLabel: 'Read about the path to an installation job',
    course: {
      id: 'fundamentals-solar-pv', title: 'Fundamentals: Solar PV', ...courseUrls('fundamentals-solar-pv'),
      instructor: 'Brittany Heller', duration: 'About 4 hours', format: 'full-free-course', verifiedOn: '2026-10-10', verifiedFree: true, beginnerAppropriate: true,
      audience: 'People entering solar installation, including contractors and building professionals who need a first grounding in PV systems.',
      description: 'HeatSpring’s course starts with electricity and module information, then introduces the equipment in grid-connected, battery-based and hybrid systems. It is a useful first pass through the vocabulary of installation, with safety and industry standards included in the outline.',
      learningObjectives: ['Review voltage, current, resistance and power, and read basic PV module specifications.', 'Identify equipment in different PV configurations and become familiar with the safety topics in the course outline.'],
      freeAccess,
      credentialLimit: 'The optional completion certificate requires paid HeatSpring membership. The course FAQ says it carries no credentialing-organization continuing-education credits. Completing it does not earn a NABCEP credential or establish jobsite competence.',
    },
  },
  {
    id: 'energy-storage', displayName: 'Energy storage', status: 'published',
    matching: { titleAll: [/\b(bess|battery|energy\s+storage)\b/i, /\b(technician|installer|installation\s+(helper|trainee|apprentice))\b/i], titleExclude: [/\b(sales|engineer|designer|electrician)\b/i] },
    recommendationHeading: 'Free Battery Storage Fundamentals',
    recommendationDescription: 'If you’re new to battery storage, you could take a free introductory course.',
    sectionHeading: 'Energy storage: start with battery capacity',
    occupationParagraphs: [
      'Battery capacity measures stored charge or energy. A new storage installer or technician needs to know which quantity a specification gives before comparing equipment, because amp-hours and watt-hours measure different things. Always check the unit.',
      'Christopher LaForge’s short course focuses on that measurement problem. It covers how capacity is defined and measured, how discharge rate affects it, and how to convert between rates. HeatSpring includes the course in its foundational onboarding bundle for new residential solar installers. That makes it a reasonable introduction to storage terminology, rather than a guide to commissioning a battery system.',
    ],
    practicalStep: 'Bring a question about capacity units to the employer’s equipment training. For the actual installation or service task, ask which manufacturer procedures and safety instruction you will receive; this lesson does not cover the full work procedure.',
    relatedPath: '/resources/do-you-need-to-be-an-electrician-for-bess', relatedLabel: 'Check how electrical responsibilities affect BESS work',
    course: {
      id: 'battery-capacity-the-basis-of-storage', title: 'Battery Capacity - The Basis of Storage', ...courseUrls('battery-capacity-the-basis-of-storage'),
      instructor: 'Christopher LaForge and Brick Maier', duration: 'About 1–2 hours', format: 'full-free-course', verifiedOn: '2026-10-10', verifiedFree: true, beginnerAppropriate: true,
      audience: 'New solar or storage installation workers who need to understand capacity terminology. Some of the discharge-rate discussion goes beyond the first definitions.',
      description: 'The free course includes a recorded lecture, supporting resources and a downloadable question-and-answer recording. Its scope is battery capacity, not a complete storage installation curriculum.',
      learningObjectives: ['Define battery capacity and distinguish amp-hours from watt-hours.', 'Learn how capacity is measured and how discharge rates affect it.'],
      freeAccess,
      credentialLimit: 'A completion certificate is available only with paid HeatSpring membership. The course FAQ says it has no credentialing-organization continuing-education approval. It does not confer an energy-storage credential or qualify you to work on energized equipment.',
    },
  },
  {
    id: 'solar-sales', displayName: 'Commercial solar sales', status: 'published',
    matching: { titleAll: [/\b(solar|pv|photovoltaic)\b/i, /\b(sales|business\s+development|account\s+executive)\b/i, /\b(commercial|industrial|c\s*&\s*i)\b/i], titleExclude: [/\b(residential|canvasser|door[- ]to[- ]door|installer|technician)\b/i] },
    recommendationHeading: 'Free Commercial Solar Sales Training',
    recommendationDescription: 'If you’re new to commercial solar sales, you could take a free introductory course.',
    sectionHeading: 'Commercial solar sales: ask better discovery questions',
    occupationParagraphs: [
      'Commercial and industrial solar sales involve several decision makers and customer priorities that differ from a household sale. Tim Montague’s course concentrates on the first conversation: which questions to ask and what information to gather before treating a lead as a viable project.',
      'A new commercial sales representative can use the outline to organize the information a technical team will need to evaluate a prospect. Case studies introduce sizing and return-on-investment discussions. The customer discovery material fits commercial prospect qualification; it is not preparation for residential door-to-door selling.',
    ],
    practicalStep: 'Write down the discovery questions you would need to answer before handing a prospect to the technical team. Ask the employer who checks sizing and financial assumptions, and which claims you are authorized to make to customers.',
    relatedPath: '/solar-sales-jobs', relatedLabel: 'Compare current solar sales job requirements',
    course: {
      id: 'qualifying-commercial-solar-leads-projects', title: 'Qualifying Commercial Solar Leads & Projects', ...courseUrls('qualifying-commercial-solar-leads-projects'),
      instructor: 'Tim Montague', duration: 'About 1 hour', format: 'full-free-course', verifiedOn: '2026-10-10', verifiedFree: true, beginnerAppropriate: true,
      audience: 'Newcomers to commercial and industrial solar prospect qualification. The course is specific to that sales process.',
      description: 'This standalone free course introduces how to assess a commercial solar lead. It offers a first look at customer discovery and project economics, not an independent qualification to design systems or advise on financing.',
      learningObjectives: ['Identify customer motivations and the information needed to qualify a commercial lead.', 'Review introductory sizing and return-on-investment discussions.', 'Use the instructor’s case studies to examine what makes a prospect or project suitable.'],
      freeAccess,
      credentialLimit: 'The enrollment page lists completion certificates with paid Plus or Pro membership, while its FAQ gives less specific certificate wording. Free learning materials are verified; a free certificate is not promised here. Course completion does not award NABCEP PV Technical Sales certification.',
    },
  },
  { id: 'electricians', displayName: 'Electricians', status: 'unpublished', matching: { titleAll: [/\b(electrician|wireman)\b/i] }, reason: 'Rapid-shutdown training is too specialized to establish beginner electrical-safety suitability.' },
  ...ADDITIONAL_TRAINING_CATEGORIES,
  { id: 'project-managers', displayName: 'Project managers', status: 'unpublished', matching: { titleAll: [/\bproject\s+(manager|coordinator)\b/i] }, reason: 'No beginner project-management resource was verified.' },
]

export function getPublishedTrainingCategories(categories: readonly TrainingCategory[] = TRAINING_CATEGORIES): PublishedTrainingCategory[] {
  return categories.filter((category): category is PublishedTrainingCategory => category.status === 'published' && category.course.verifiedFree && category.course.beginnerAppropriate)
}

function plainText(html: string): string {
  return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(?:p|div|li|h[1-6])\s*>|<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&(?:nbsp|#160);/gi, ' ').replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16))).replace(/[\t\r ]+/g, ' ')
    .replace(/\b(yrs?|mos?)\./gi, '$1').replace(/\bexp\./gi, 'experience')
}
const NO_EXPERIENCE = /\bno\s+(?:(?:prior|previous|work|professional|solar|pv|installation|construction|sales|industry|relevant)\s+){0,3}experience\s+(?:is\s+)?(?:required|necessary|needed)\b/gi
const EXPERIENCE_NOT_REQUIRED = /\b(?:(?:prior|previous|work|professional|solar|pv|installation|sales)\s+){0,3}experience\s+(?:is\s+)?not\s+(?:required|necessary|needed)\b/gi
const SENIOR_TITLE = /\b(senior|sr\.?|mid[- ]level|intermediate|experienced|journeyman|journeyworker|master|lead|foreman|supervisor|superintendent|director|principal|ii|iii|iv)\b/i
const BEGINNER_TITLE = /\b(entry[- ]level|junior|jr\.?|trainee|beginner)\b/i
export type TrainingEligibility = 'explicit-entry-level' | 'explicit-no-experience' | 'apprentice' | 'structured-entry-level'
export function getTrainingEligibility(job: TrainingJob): TrainingEligibility | null {
  if (SENIOR_TITLE.test(job.title)) return null
  const text = plainText(job.description || '')
  if (/\b(?:not|isn't|is\s+not)\s+(?:an?\s+)?entry[- ]level\b/i.test(text)) return null
  // Titles and structured beginner levels describe this opening. SEO rewrites
  // do not supply eligibility or override the employer's classification.
  if (/\bapprentice(?:ship)?\b/i.test(job.title)) return 'apprentice'
  if (BEGINNER_TITLE.test(job.title)) return 'explicit-entry-level'
  const level = job.experienceLevel?.trim().toUpperCase().replace(/[ -]/g, '_')
  if (['ENTRY_LEVEL', 'NO_EXPERIENCE_REQUIRED', 'APPRENTICE', 'APPRENTICESHIP', 'INTERNSHIP', 'JUNIOR', 'TRAINEE'].includes(level || '')) return 'structured-entry-level'
  const sentences = text.match(/[^.!?\n]+(?:[.!?\n]|$)/g) || []
  for (const rawSentence of sentences) {
    if (rawSentence.endsWith('?')) continue
    const sentence = rawSentence.replace(/[.!?\n]$/, '').trim()
    // Mentoring beginners or quoting another opening is not a beginner role.
    const withoutPositive = sentence.replace(NO_EXPERIENCE, '').replace(EXPERIENCE_NOT_REQUIRED, '')
    if (/\b(?:not|isn't|never|if|unless|although|however|except)\b|\b(?:other|different)\s+(?:roles|positions|jobs)\b|[“”"]/i.test(withoutPositive)) continue
    if (/\b(?:supervis\w*|mentor\w*|guidance|train\s+colleagues)\b/i.test(sentence)) continue
    if (new RegExp(NO_EXPERIENCE.source + '|' + EXPERIENCE_NOT_REQUIRED.source, 'i').test(sentence)) return 'explicit-no-experience'
    if (/\b(?:entry[- ]level|junior|trainee|beginner)\b/i.test(sentence)) return 'explicit-entry-level'
    if (/\bapprentice(?:ship)?\b/i.test(sentence)) return 'apprentice'
    if (/\b0\s*[-–]\s*1\s*(?:years?|yrs?)\b/i.test(sentence)) return 'explicit-no-experience'
  }
  return null
}
export type JobTrainingRecommendation = {
  categoryId: TrainingCategoryId | 'general'; heading: string; description: string
  href: `/free-training#${TrainingCategoryId}` | '/free-training'; eligibility: TrainingEligibility
}
export function getJobTraining(job: TrainingJob, categories: readonly TrainingCategory[] = TRAINING_CATEGORIES): JobTrainingRecommendation | null {
  const eligibility = getTrainingEligibility(job)
  if (!eligibility) return null
  const context = [job.title, plainText(job.description || '')].join('\n')
  const matches = categories.filter(({ matching }) => matching.titleAll.every(pattern => pattern.test(job.title))
    && !matching.titleExclude?.some(pattern => pattern.test(job.title))
    && (!matching.contextAll || matching.contextAll.every(pattern => pattern.test(context))))
  if (matches.length === 1) {
    const category = matches[0]
    if (category.status === 'published' && category.course.verifiedFree && category.course.beginnerAppropriate) {
      return { categoryId: category.id, heading: category.recommendationHeading, description: category.recommendationDescription, href: `/free-training#${category.id}`, eligibility }
    }
  }
  if (!getPublishedTrainingCategories(categories).length) return null
  return { categoryId: 'general', heading: 'Starting your career?', description: 'If you’re starting your career, explore free introductory courses in solar energy.', href: '/free-training', eligibility }

}
