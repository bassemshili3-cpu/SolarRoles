import type { PublishedTrainingCategory } from './freeTraining'

const links = (id: string) => ({ officialUrl: `https://www.heatspring.com/courses/${id}`, affiliateUrl: `https://www.heatspring.com/courses/${id}?aff_id=9f_wlq` })
const access = 'Learning materials are free with a HeatSpring account. No credit card is required. Availability of free materials is not guaranteed indefinitely.'

// Editorial construction: HeatSpring's technical course outlines and DOE's
// system-design guide. Copy is original; provider claims remain course-specific.
export const ADDITIONAL_TRAINING_CATEGORIES: readonly PublishedTrainingCategory[] = [
  {
    id: 'solar-designers', displayName: 'PV design', status: 'published',
    matching: {
      titleAll: [/\b(?:designer|drafter|design\s+engineer|(?:solar|pv)\s+(?:systems?\s+)?engineer)\b/i],
      contextAll: [/\b(?:solar|photovoltaic|pv)\b/i],
      titleExclude: [/\b(?:sales|battery|bess|storage|manufacturing|process|quality|software)\b/i],
    },
    recommendationHeading: 'Free PV Design Introduction',
    recommendationDescription: 'If you’re new to PV design, you could take a free introductory course.',
    sectionHeading: 'PV design: from site layout to grid connection',
    occupationParagraphs: [
      'Ground-mounted solar design brings site layout, racking and electrical configuration into one plan. Utility-scale projects have different constraints from rooftop systems. Start with that distinction.',
      'HeatSpring’s three-hour overview follows a project from site selection to interconnection. Developed with PVcase, it introduces the design decisions before more advanced training.',
    ],
    practicalStep: 'Ask whether the opening covers rooftop or utility-scale projects, and which design software the team uses.',
    relatedPath: '/resources/solar-engineer-jobs', relatedLabel: 'Read about solar engineering roles',
    course: {
      id: 'utility-scale-solar-design-overview', title: 'Utility-Scale Solar Design Overview', ...links('utility-scale-solar-design-overview'),
      instructor: 'John Selby and Stefan Boehme / PVcase', duration: 'About 3 hours', format: 'full-free-course', verifiedOn: '2026-10-14', verifiedFree: true, beginnerAppropriate: true,
      audience: 'New PV designers and design engineers exploring utility-scale projects.',
      description: 'An overview of ground-mounted PV design, with site, racking and electrical considerations along the project development timeline.',
      learningObjectives: ['Compare utility-scale and rooftop design approaches.', 'Follow a project from site selection through layout and interconnection.'],
      freeAccess: access,
      credentialLimit: 'Completion certificates require paid membership. This course does not award a professional credential or authorize independent engineering work.',
    },
  },
  {
    id: 'residential-solar-sales', displayName: 'Residential solar sales', status: 'published',
    matching: {
      titleAll: [/\b(?:sales|advisor|adviser|consultant|representative|account\s+executive|appointment\s+setter|canvasser|canvassing)\b/i],
      contextAll: [/\b(?:solar|photovoltaic|pv)\b/i],
      titleExclude: [/\b(?:commercial|industrial|c\s*&\s*i|engineer|installer|technician)\b/i],
    },
    recommendationHeading: 'Free Solar Sales Ethics Course',
    recommendationDescription: 'If you’re new to solar sales, you could take a free introductory course.',
    sectionHeading: 'Residential solar sales: put the customer first',
    occupationParagraphs: [
      'Solar sales conversations involve customer needs, equipment limits and policy details. Clear explanations matter. Pressure tactics can undermine the trust a salesperson needs to build.',
      'ReVision Energy’s course examines ethical decisions in customer acquisition. It covers residential and commercial sales, including communication and common pitfalls, and welcomes new salespeople.',
    ],
    practicalStep: 'Ask the employer how it checks sales claims and explains customer agreements.',
    relatedPath: '/solar-sales-jobs', relatedLabel: 'Compare solar sales openings',
    course: {
      id: 'introduction-to-ethics-in-solar-sales', title: 'Introduction to Ethics in Solar Sales', ...links('introduction-to-ethics-in-solar-sales'),
      instructor: 'ReVision Energy Training Center', duration: 'About 1–2 hours', format: 'full-free-course', verifiedOn: '2026-10-14', verifiedFree: true, beginnerAppropriate: true,
      audience: 'New solar salespeople and staff involved in residential customer acquisition.',
      description: 'An introduction to ethical sales decisions and customer communication, developed with industry practitioners.',
      learningObjectives: ['Identify misleading sales and marketing practices.', 'Use customer needs to guide communication and ethical decisions.'],
      freeAccess: access,
      credentialLimit: 'The enrollment page lists certificates with paid membership. Free learning access does not award a NABCEP sales credential.',
    },
  },
  {
    id: 'solar-inspection', displayName: 'Solar inspection & QA/QC', status: 'published',
    matching: {
      titleAll: [/\b(?:inspector|inspection|qa\s*[/&-]?\s*qc|qa|qc|quality\s+(?:technician|specialist))\b/i],
      contextAll: [/\b(?:solar|photovoltaic|pv)\b/i],
      titleExclude: [/\b(?:manufacturing|production|battery|bess|storage)\b/i],
    },
    recommendationHeading: 'Free Solar Inspection Course',
    recommendationDescription: 'If you’re new to solar inspection, you could take a free introductory course.',
    sectionHeading: 'Solar inspection: read the defect before the checklist',
    occupationParagraphs: [
      'Ten annotated photographs form the core of this utility-scale inspection course. Each case connects a visible observation to a possible failure. Records matter alongside physical equipment.',
      'Julie Stiglish’s lesson includes a downloadable inspection sheet and a quiz. It offers a first look at field quality checks; it does not teach every inspection procedure.',
    ],
    practicalStep: 'Ask which inspection checklists, drawings and reporting procedures the employer provides.',
    relatedPath: '/jobs', relatedLabel: 'Browse solar inspection and quality openings',
    course: {
      id: '10-utility-scale-solar-defects-hiding-in-plain-sight', title: '10 Utility-Scale Solar Defects Hiding in Plain Sight', ...links('10-utility-scale-solar-defects-hiding-in-plain-sight'),
      instructor: 'Julie Stiglish', duration: 'About 1 hour', format: 'full-free-course', verifiedOn: '2026-10-14', verifiedFree: true, beginnerAppropriate: true,
      audience: 'New field inspectors and QA/QC workers exploring utility-scale solar defects.',
      description: 'A recorded review of ten defect cases, with photographs, an inspection reference and a short assessment.',
      learningObjectives: ['Connect an observed defect to its failure mechanism.', 'Recognize documentation problems as well as physical damage.'],
      freeAccess: access,
      credentialLimit: 'Certificates require paid membership. The FAQ lists no credentialing-organization continuing-education approval; completion is not an inspector qualification.',
    },
  },
  {
    id: 'solar-technicians', displayName: 'Solar maintenance', status: 'published',
    matching: {
      titleAll: [/\b(?:technician|field\s+service|maintenance|o\s*&\s*m|operations\s+and\s+maintenance)\b/i],
      contextAll: [/\b(?:solar|photovoltaic|pv)\b/i],
      titleExclude: [/\b(?:battery|bess|energy\s+storage|design|inspector|inspection|quality|qa|qc|manufacturing|production)\b/i],
    },
    recommendationHeading: 'Free Rapid Shutdown Course',
    recommendationDescription: 'If you’re new to solar maintenance, you could take a free course on rapid shutdown devices.',
    sectionHeading: 'Solar maintenance: understand rapid shutdown devices',
    occupationParagraphs: [
      'Rapid shutdown devices are one part of PV safety systems. James Nagel’s course explains their operation and failure risks, using commercial rooftop systems as its context.',
      'The lesson compares these devices with other module-level electronics and reviews approaches to operating assets. Its scope is specific. New technicians still need the employer’s equipment and safety training.',
    ],
    practicalStep: 'Check whether the employer services rooftop systems with rapid shutdown devices, and who provides equipment training.',
    relatedPath: '/solar-technician-jobs', relatedLabel: 'Explore solar technician roles',
    course: {
      id: 'rapid-shutdown-devices-and-safety-risks', title: 'Rapid Shutdown Devices and Safety Risks', ...links('rapid-shutdown-devices-and-safety-risks'),
      instructor: 'James Nagel', duration: 'About 1–2 hours', format: 'full-free-course', verifiedOn: '2026-10-14', verifiedFree: true, beginnerAppropriate: true,
      audience: 'New solar service technicians seeking an introduction to rooftop rapid shutdown systems.',
      description: 'A focused lesson on device operation, failure modes and considerations for new and operating PV systems.',
      learningObjectives: ['Explain device operation and distinguish other module-level electronics.', 'Review failure risks and approaches to rapid shutdown compliance.'],
      freeAccess: access,
      credentialLimit: 'The enrollment page lists paid-membership certificates; its FAQ gives different wording. A free certificate is not promised. Listed NABCEP credits do not constitute certification.',
    },
  },
]
