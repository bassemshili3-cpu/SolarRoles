/**

 * jobTaxonomy.ts

 *

 * Extracts structured job metadata (industry, occupational category, skills,

 * experience level) from raw job title + description. Used to enrich the

 * JobPosting JSON-LD schema with fields Google uses for filtering and

 * categorization.

 *

 * Approach: deterministic keyword/pattern matching. No API calls, no ML

 * inference, sub-millisecond per call. Trade-off: limited coverage vs

 * external APIs, but predictable, debuggable, and free.

 *

 * Usage:

 *   const taxonomy = extractJobTaxonomy({ title, description })

 *   // → { industry, occupationalCategory, skills, experienceLevel }

 */


export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL'


export interface JobTaxonomy {

  industry: string

  occupationalCategory: string

  skills: string[]

  experienceLevel?: ExperienceLevel

}


export interface JobTaxonomyInput {

  title: string

  description?: string

}


const MAX_TEXT_LENGTH = 2000  // cap to keep extraction fast & predictable


// ─────────────────────────────────────────────────────────────────────────────

// INDUSTRY RULES

// Order matters: first match wins. More specific rules come first.

// ─────────────────────────────────────────────────────────────────────────────


const INDUSTRY_RULES: ReadonlyArray<{ industry: string; patterns: RegExp[] }> = [

  {

    industry: 'Healthcare',

    patterns: [

      /\b(nurse|nursing|rn\b|lpn|cna|medical assistant|medical\b|clinical|physician|doctor|hospital|pharmacy|pharmacist|dental|dentist|surgeon|therapist|patient care|healthcare|emt\b|paramedic|home health|hospice|icu|operating room|or tech|cna|medical records|health information|optomet|chiropract|podiatr|pediatric|obstetric|oncology|cardiology|radiology|phlebotom|respiratory)\b/i,

    ],

  },

  {

    industry: 'Technology',

    patterns: [

      /\b(software|developer|engineer|programmer|devops|sre\b|cloud|frontend|backend|fullstack|full-stack|web developer|mobile developer|ios developer|android developer|data engineer|data scientist|ml engineer|ai engineer|qa\b|tester|sdet|architect|tech lead|engineering manager|principal engineer|staff engineer|solutions architect|web developer|front end|back end|systems? administrator|network engineer|security engineer|cyber(?:security|security)|penetration|site reliability)\b/i,

    ],

  },

  {

    industry: 'Finance',

    patterns: [

      /\b(financial|banker|teller|accountant|accounting|auditor|cpa\b|bookkeeper|tax(?:es)?|loan officer|mortgage|investment|trader|broker|financial analyst|controller|treasury|payroll|credit analyst|underwriter|actuary|claims adjuster|portfolio|equity|fixed income|hedge fund|wealth management|private equity)\b/i,

    ],

  },

  {

    industry: 'Education',

    patterns: [

      /\b(teacher|professor|instructor|tutor|school|university|college|principal|counselor|education|academic|lecturer|adjunct|faculty|esl\b|kindergarten|elementary|secondary|high school|middle school|special education|reading specialist)\b/i,

    ],

  },

  {

    industry: 'Marketing',

    patterns: [

      /\b(marketing manager|seo\b|content marketing|content strategist|social media manager|brand manager|advertising|pr\b|public relations|communications|email marketing|digital marketing|growth marketing|product marketing|marketing coordinator|marketing director|copywriter|content writer|campaign manager|hubspot|mailchimp|marketo|google analytics|google ads|meta ads|facebook ads)\b/i,

    ],

  },

  {

    industry: 'Sales',

    patterns: [

      /\b(sales|account executive|account manager|bdr|sdr|sales development rep|retail|store|cashier|sales associate|stocker|sales rep|sales representative|outside sales|inside sales|territory manager|district manager|store manager|assistant store manager)\b/i,

    ],

  },

  {

    industry: 'Construction',

    patterns: [

      /\b(construction|carpenter|electrician|plumber|hvac|roofer|construction worker|general labor|laborer|pipefitter|ironworker|mason|concrete|concrete finisher|fram|framing| drywall|painter|construction superintendent|construction manager|crane operator|equipment operator|excavator|loader)\b/i,

    ],

  },

  {

    industry: 'Transportation',

    patterns: [

      /\b(truck driver|cdl|delivery driver|logistics|warehouse|forklift|shipping|dispatch|transportation|freight|loader|packer|warehouse associate|warehouse worker|supply chain|inventory|material handler|cdl-a|cdl-b|otr|local driver|delivery|route driver|parcel)\b/i,

    ],

  },

  {

    industry: 'Hospitality',

    patterns: [

      /\b(restaurant|hotel|barista|server|host|chef|cook|housekeeping|bartender|food service|hospitality|dishwasher|prep cook|line cook|banquet|catering|front desk|concierge|valet|busser|kitchen|food prep|short order)\b/i,

    ],

  },

  {

    industry: 'Manufacturing',

    patterns: [

      /\b(manufacturing|production|factory|operator|machinist|welder|assembly|assembler|press operator|line operator|production worker|cnc|cnc operator|cnc machinist|quality control|quality assurance|manufacturing engineer|industrial|millwright|tool and die|stamping|forging|extrusion|injection molding)\b/i,

    ],

  },

  {

    industry: 'Customer Service',

    patterns: [

      /\b(customer service|customer support|customer success|call center|help desk|client services|member services|client support|tier [12]\b|support specialist|support analyst)\b/i,

    ],

  },

  {

    industry: 'Administrative',

    patterns: [

      /\b(admin|office|administrative|assistant|coordinator|clerk|receptionist|data entry|secretary|office manager|office administrator|executive assistant|personal assistant|administrative assistant|scheduler|document specialist)\b/i,

    ],

  },

  {

    industry: 'Legal',

    patterns: [

      /\b(lawyer|attorney|paralegal|legal|counsel|compliance|litigation|corporate counsel|legal assistant|legal secretary|contracts|jd\b|law firm|legal counsel|general counsel)\b/i,

    ],

  },

  {

    industry: 'Human Resources',

    patterns: [

      /\b(human resources|\bhr\b|recruiter|recruiting|talent acquisition|people operations|benefits|compensation|payroll|onboarding|hr generalist|hr specialist|hr manager|hr director|workday|adp\b|bamboo|talent management)\b/i,

    ],

  },

  {

    industry: 'Engineering',

    patterns: [

      /\b(mechanical engineer|electrical engineer|civil engineer|chemical engineer|industrial engineer|aerospace engineer|biomedical engineer|structural engineer|project engineer|manufacturing engineer|process engineer|design engineer|field engineer|test engineer|applications engineer|firmware engineer|hardware engineer|systems engineer)\b/i,

    ],

  },

  {

    industry: 'Insurance',

    patterns: [

      /\b(insurance|underwriter|claims|adjuster|actuary|insurance agent|insurance producer|claims processor|claims examiner|risk management)\b/i,

    ],

  },

  {

    industry: 'Real Estate',

    patterns: [

      /\b(real estate|realtor|property manager|leasing|leasing agent|broker|real estate agent|property management|escrow|title)\b/i,

    ],

  },

  {

    industry: 'Government',

    patterns: [

      /\b(government|federal|state|city|county|public sector|military|army|navy|air force|marines|coast guard|postal service|usps|govt)\b/i,

    ],

  },

]


// ─────────────────────────────────────────────────────────────────────────────

// OCCUPATIONAL CATEGORIES (BLS standard, simplified)

// Maps industry → 2-digit BLS major group label

// ─────────────────────────────────────────────────────────────────────────────


const OCCUPATIONAL_CATEGORY_MAP: Record<string, string> = {

  'Technology': 'Computer and Mathematical',

  'Engineering': 'Architecture and Engineering',

  'Finance': 'Business and Financial Operations',

  'Healthcare': 'Healthcare Practitioners and Technical',

  'Education': 'Educational Instruction and Library',

  'Sales': 'Sales',

  'Marketing': 'Arts, Design, Entertainment, Sports, and Media',

  'Customer Service': 'Office and Administrative Support',

  'Manufacturing': 'Production',

  'Construction': 'Construction and Extraction',

  'Transportation': 'Transportation and Material Moving',

  'Hospitality': 'Food Preparation and Serving',

  'Administrative': 'Office and Administrative Support',

  'Legal': 'Legal',

  'Human Resources': 'Business and Financial Operations',

  'Real Estate': 'Sales',

  'Insurance': 'Business and Financial Operations',

  'Government': 'Office and Administrative Support',

}


// ─────────────────────────────────────────────────────────────────────────────

// SKILL RULES

// Common technical and soft skills, ordered by specificity (longest first)

// ─────────────────────────────────────────────────────────────────────────────


interface SkillRule {

  skill: string

  patterns: RegExp[]

}


const SKILL_RULES: ReadonlyArray<SkillRule> = [

  // Programming languages

  { skill: 'JavaScript', patterns: [/\bjavascript\b/i] },

  { skill: 'TypeScript', patterns: [/\btypescript\b/i] },

  { skill: 'Python', patterns: [/\bpython\b/i] },

  { skill: 'Java', patterns: [/\bjava\b(?!\s*script)/i] },

  { skill: 'C++', patterns: [/\bc\+\+/i] },

  { skill: 'C#', patterns: [/\bc#\b/i] },

  { skill: 'Go', patterns: [/\bgolang\b|\bgo (developer|engineer|backend)\b/i] },

  { skill: 'Rust', patterns: [/\brust\b/i] },

  { skill: 'Ruby', patterns: [/\bruby\b(?!\s*redmond)/i] },

  { skill: 'PHP', patterns: [/\bphp\b/i] },

  { skill: 'Swift', patterns: [/\bswift\b/i] },

  { skill: 'Kotlin', patterns: [/\bkotlin\b/i] },

  { skill: 'Scala', patterns: [/\bscala\b/i] },

  { skill: 'R', patterns: [/\br programming\b|\br language\b|\brstudio\b/i] },


  // Frontend frameworks

  { skill: 'React', patterns: [/\breact\b(?!\s*native)/i, /\breact\.js\b/i] },

  { skill: 'React Native', patterns: [/\breact native\b/i] },

  { skill: 'Angular', patterns: [/\bangular\b(?!\s*js)/i] },

  { skill: 'Vue.js', patterns: [/\bvue\.?js\b/i] },

  { skill: 'Next.js', patterns: [/\bnext\.?js\b/i] },

  { skill: 'Svelte', patterns: [/\bsvelte\b/i] },


  // Backend frameworks

  { skill: 'Node.js', patterns: [/\bnode\.?js\b/i] },

  { skill: 'Django', patterns: [/\bdjango\b/i] },

  { skill: 'Flask', patterns: [/\bflask\b/i] },

  { skill: 'Express.js', patterns: [/\bexpress\.?js\b/i] },

  { skill: 'Spring', patterns: [/\bspring boot\b/i] },

  { skill: 'Laravel', patterns: [/\blaravel\b/i] },

  { skill: 'Rails', patterns: [/\bruby on rails\b|\brails\b/i] },

  { skill: '.NET', patterns: [/\b\.net\b/i] },


  // Cloud & DevOps

  { skill: 'AWS', patterns: [/\baws\b|amazon web services/i] },

  { skill: 'Azure', patterns: [/\bazure\b/i] },

  { skill: 'GCP', patterns: [/\bgcp\b|google cloud\b/i] },

  { skill: 'Docker', patterns: [/\bdocker\b/i] },

  { skill: 'Kubernetes', patterns: [/\bkubernetes\b|\bk8s\b/i] },

  { skill: 'Terraform', patterns: [/\bterraform\b/i] },

  { skill: 'CI/CD', patterns: [/\bci\/cd\b/i] },

  { skill: 'Jenkins', patterns: [/\bjenkins\b/i] },

  { skill: 'GitHub Actions', patterns: [/\bgithub actions\b/i] },


  // Databases

  { skill: 'SQL', patterns: [/\bsql\b/i] },

  { skill: 'PostgreSQL', patterns: [/\bpostgres(?:ql)?\b/i] },

  { skill: 'MySQL', patterns: [/\bmysql\b/i] },

  { skill: 'MongoDB', patterns: [/\bmongodb\b/i] },

  { skill: 'Redis', patterns: [/\bredis\b/i] },

  { skill: 'Elasticsearch', patterns: [/\belasticsearch\b/i] },

  { skill: 'DynamoDB', patterns: [/\bdynamodb\b/i] },


  // Data / ML

  { skill: 'Machine Learning', patterns: [/\bmachine learning\b/i] },

  { skill: 'TensorFlow', patterns: [/\btensorflow\b/i] },

  { skill: 'PyTorch', patterns: [/\bpytorch\b/i] },

  { skill: 'Pandas', patterns: [/\bpandas\b/i] },

  { skill: 'Tableau', patterns: [/\btableau\b/i] },

  { skill: 'Power BI', patterns: [/\bpower bi\b/i] },


  // Design tools

  { skill: 'Figma', patterns: [/\bfigma\b/i] },

  { skill: 'Adobe Photoshop', patterns: [/\bphotoshop\b/i] },

  { skill: 'Adobe Illustrator', patterns: [/\billustrator\b/i] },

  { skill: 'Adobe Premiere', patterns: [/\bpremiere\b/i] },

  { skill: 'Adobe Creative Suite', patterns: [/\badobe creative suite\b|\badobe cc\b/i] },

  { skill: 'Sketch', patterns: [/\bsketch\b/i] },

  { skill: 'AutoCAD', patterns: [/\bautocad\b/i] },

  { skill: 'SolidWorks', patterns: [/\bsolidworks\b/i] },


  // Productivity

  { skill: 'Microsoft Excel', patterns: [/\bexcel\b/i] },

  { skill: 'Microsoft Word', patterns: [/\bmicrosoft word\b/i] },

  { skill: 'Microsoft PowerPoint', patterns: [/\bpowerpoint\b/i] },

  { skill: 'Microsoft Office', patterns: [/\bmicrosoft office\b|\bmsoffice\b/i] },

  { skill: 'Google Workspace', patterns: [/\bgoogle workspace\b|\bg suite\b/i] },


  // CRM / Sales tools

  { skill: 'Salesforce', patterns: [/\bsalesforce\b/i] },

  { skill: 'HubSpot', patterns: [/\bhubspot\b/i] },

  { skill: 'SAP', patterns: [/\bsap\b/i] },

  { skill: 'Oracle', patterns: [/\boracle\b/i] },

  { skill: 'QuickBooks', patterns: [/\bquickbooks\b/i] },


  // Marketing tools

  { skill: 'SEO', patterns: [/\bseo\b/i] },

  { skill: 'Google Analytics', patterns: [/\bgoogle analytics\b/i] },

  { skill: 'Google Ads', patterns: [/\bgoogle ads\b/i] },

  { skill: 'Meta Ads', patterns: [/\bmeta ads\b|\bfacebook ads\b/i] },

  { skill: 'Mailchimp', patterns: [/\bmailchimp\b/i] },

  { skill: 'Marketo', patterns: [/\bmarketo\b/i] },


  // Version control & methods

  { skill: 'Git', patterns: [/\bgit\b/i] },

  { skill: 'Agile', patterns: [/\bagile\b/i] },

  { skill: 'Scrum', patterns: [/\bscrum\b/i] },

  { skill: 'Kanban', patterns: [/\bkanban\b/i] },


  // Industry-specific certifications / skills

  { skill: 'HIPAA', patterns: [/\bhipaa\b/i] },

  { skill: 'BLS Certification', patterns: [/\bbls\b|basic life support\b/i] },

  { skill: 'ACLS', patterns: [/\bacls\b/i] },

  { skill: 'GAAP', patterns: [/\bgaap\b/i] },

  { skill: 'CDL', patterns: [/\bcdl[- ]?[ab]?\b/i] },

  { skill: 'Food Safety', patterns: [/\bfood safety\b|servsafe\b/i] },

  { skill: 'OSHA', patterns: [/\bosha\b/i] },

  { skill: 'Forklift Certification', patterns: [/\bforklift (certified|certification|operator)\b/i] },


  // Soft skills (lower priority, only if explicitly mentioned)

  { skill: 'Leadership', patterns: [/\bleadership\b/i] },

  { skill: 'Project Management', patterns: [/\bproject management\b|\bpmp\b/i] },

]


const MAX_SKILLS = 10


// ─────────────────────────────────────────────────────────────────────────────

// EXPERIENCE LEVEL DETECTION

// ─────────────────────────────────────────────────────────────────────────────


function detectExperienceLevel(title: string): ExperienceLevel | undefined {

  const t = title.toLowerCase()

  if (/\b(senior|sr\.?|lead|principal|staff|director|vp\b|vice president|chief|head of|manager|supervisor)\b/.test(t)) {

    return 'SENIOR_LEVEL'

  }

  if (/\b(junior|jr\.?|entry[- ]level|associate|intern|internship|apprentice|trainee|helper|assistant|coordinator|technician)\b/.test(t)) {

    return 'ENTRY_LEVEL'

  }

  if (/\b(mid[- ]level|intermediate)\b/.test(t)) {

    return 'MID_LEVEL'

  }

  return undefined

}


// ─────────────────────────────────────────────────────────────────────────────

// MAIN EXTRACTION

// ─────────────────────────────────────────────────────────────────────────────


export function extractJobTaxonomy(input: JobTaxonomyInput): JobTaxonomy {

  const text = `${input.title || ''} ${input.description || ''}`

    .slice(0, MAX_TEXT_LENGTH)

    .trim()


  // Industry: first match wins (rules are ordered by priority)

  let industry = 'General'

  for (const rule of INDUSTRY_RULES) {

    if (rule.patterns.some(p => p.test(text))) {

      industry = rule.industry

      break

    }

  }


  // Occupational category from industry

  const occupationalCategory = OCCUPATIONAL_CATEGORY_MAP[industry] ?? 'Other'


  // Skills: collect all matches, cap to MAX_SKILLS

  const skills: string[] = []

  for (const rule of SKILL_RULES) {

    if (skills.length >= MAX_SKILLS) break

    if (rule.patterns.some(p => p.test(text))) {

      skills.push(rule.skill)

    }

  }


  // Experience level from title only

  const experienceLevel = detectExperienceLevel(input.title || '')


  return {

    industry,

    occupationalCategory,

    skills,

    experienceLevel,

  }

}

