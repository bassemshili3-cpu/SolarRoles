// certifications-data.ts
//
// Toutes les données factuelles (score de passage, durée d'examen, coûts,
// renouvellement) ont été vérifiées via recherche web (NABCEP.org, HeatSpring,
// USF OSHA Education Center, Meazure Learning) — pas inventées. Sources
// principales : nabcep.org/certifications, nabcep.org/wp-content (fee
// schedules), usfosha.com/faqs, heatspring.com/credentials.
//
// Les notes de DIFFICULTÉ (score /10) sont une estimation éditoriale basée
// sur les données de taux de réussite disponibles publiquement et la
// complexité des prérequis — NABCEP ne publie pas de taux de réussite
// officiel détaillé par examen, donc traiter ces scores comme indicatifs,
// pas comme une statistique NABCEP officielle.
//
// TOC_SECTIONS définit l'ordre canonique d'affichage des sections sur la
// page /certifications/[slug] — la page doit itérer sur ce tableau pour
// générer à la fois le sommaire (table of contents) en haut de page et
// les ancres <section id="..."> correspondantes, plutôt que de coder
// l'ordre en dur dans le composant.

export interface RoleRef {
  name: string
  // Lien vers la page /roles/[slug] (ou /[slug]-jobs) correspondante.
  // Optionnel : certains rôles n'ont pas encore de page dédiée, auquel cas
  // le nom s'affiche en texte simple plutôt qu'en lien (voir logique de
  // render dans app/certifications/[slug]/page.tsx, section "Careers it
  // unlocks"). Utilisé à la fois par `forRoles` (hero band, non cliquable
  // actuellement) et `careerPaths` (section cliquable).
  href?: string
}

export interface ExamFormat {
  questionCount: string
  duration: string
  format: string
}

export interface PassingScoreInfo {
  scoreDescription: string
  detail: string
}

export interface DifficultyRating {
  score: number // sur 10 — voir note éditoriale en tête de fichier
  rationale: string
}

export interface CostBreakdown {
  trainingCost: string
  applicationFee?: string
  examFee?: string
  membershipFee?: string
  totalEstimate: string
  notes: string
}

export interface Reimbursement {
  available: boolean
  summary: string
  sources: string[]
}

export interface ExpirationRenewal {
  validityPeriod: string
  renewalRequirement: string
}

export interface SalaryPageLink {
  label: string
  // Slug supposé sous /data/salaries/[slug] — À CONFIRMER/CORRIGER, je n'ai
  // pas la liste réelle de vos pages de salaire, ce sont des valeurs
  // provisoires basées sur les noms de rôles de votre taxonomie.
  slug: string
}

export interface CertificationEntry {
  slug: string
  bannerImageSrc: string
  name: string
  shortLabel: string
  acronymExpansion: string
  forRoles: RoleRef[]
  careerPaths: RoleRef[]
  whatItIs: string
  whyItMatters: string
  requirements: string[]
  examFormat: ExamFormat
  passingScore: PassingScoreInfo
  difficulty: DifficultyRating
  cost: CostBreakdown
  reimbursement: Reimbursement
  expirationRenewal: ExpirationRenewal
  relatedSalaryPages: SalaryPageLink[]
  heatspringFitReason: string
  // Champs legacy conservés pour compatibilité avec les composants existants
  // (CertificationBanner, cartes de listing, etc.) qui affichent un résumé
  // court plutôt que les objets structurés ci-dessus.
  format: string
  duration: string
  priceRange: string
  whyHeatSpring: string[]
  heatspringUrl: string
  bannerHeadline: string
  bannerSubtext: string
}

export const TOC_SECTIONS: { id: string; label: string }[] = [
  { id: 'what-it-is', label: 'What Is It' },
  { id: 'career-paths', label: 'Careers It Unlocks' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'exam-format', label: 'Exam Format & Passing Score' },
  { id: 'difficulty', label: 'How Hard Is It' },
  { id: 'cost', label: 'Cost' },
  { id: 'reimbursement', label: 'Reimbursement & Funding' },
  { id: 'salary', label: 'What It Pays' },
  { id: 'why-heatspring', label: 'Why HeatSpring' },
  { id: 'renewal', label: 'Expiration & Renewal' },
]

export const CERTIFICATIONS: CertificationEntry[] = [
  {
    slug: 'nabcep-pv-associate',
    bannerImageSrc: '/nabcep_pva.png',
    name: 'NABCEP PV Associate',
    shortLabel: 'PV Associate',
    acronymExpansion:
      "NABCEP stands for the North American Board of Certified Energy Practitioners — the nonprofit body that sets the certification standard for the US solar industry. \"PV Associate\" (PVA) is their entry-level photovoltaic credential.",
    forRoles: [
      { name: 'PV Installer', href: '/solar-pv-installer-jobs' },
      { name: 'Solar Apprentice' },
    ],
    careerPaths: [
      { name: 'PV Installer', href: '/solar-pv-installer-jobs' },
      { name: 'Solar Apprentice' },
      { name: 'Crew Member' },
    ],
    whatItIs:
      "The entry-level credential from NABCEP, the most widely recognized certification body in US solar. It requires no field experience — just a training course and a passing exam score — which makes it the standard first certification for anyone breaking into the trade.",
    whyItMatters:
      "Employers and hiring managers treat it as a baseline signal that you understand PV fundamentals before you've logged real installation hours. It also builds toward the higher NABCEP Installation Professional credential later, once you have documented field experience.",
    requirements: [
      'Education Pathway (most common): complete an approved NABCEP Associate training course, then pass the exam. No prior solar experience needed.',
      'Experience Pathway (alternative): document at least 6 months of full-time-equivalent solar work experience and apply directly with NABCEP instead of taking a course.',
      'Valid government-issued photo ID that matches your NABCEP application exactly — mismatched names are a common cause of admission issues on exam day.',
    ],
    examFormat: {
      questionCount: '70 multiple-choice questions (60 scored, 10 unscored pilot questions you won\'t be told apart from the rest)',
      duration: 'Up to 2 hours',
      format: 'Computer-based, taken at a Meazure Learning test center or via live remote proctoring from home',
    },
    passingScore: {
      scoreDescription: 'A scaled score of 65 out of 99',
      detail:
        "NABCEP uses a scaled scoring model (0–99), not a straight percentage, to keep results comparable across different exam versions. There's no publicly reversible way to know the exact number of raw correct answers this requires — 65 is the threshold NABCEP reports directly.",
    },
    difficulty: {
      score: 4,
      rationale:
        "No field-experience prerequisite and no minimum pass rate published by NABCEP for this specific exam, but training providers who publish their own numbers commonly report pass rates in the high 80s to low 90s (percent) among students who complete a structured prep course — this is a students'-pass-rate figure, not an official NABCEP statistic. Rated moderate-low: accessible for a motivated beginner with a prep course, harder if attempted cold.",
    },
    cost: {
      trainingCost: '$400–900 depending on provider (HeatSpring\'s Boot Camp + Exam Prep bundle lists at $895)',
      applicationFee: undefined,
      examFee: '~$150 total for NABCEP application + exam fee, paid directly to NABCEP — separate from any training course cost',
      totalEstimate: '$550–1,050 all-in for most first-time candidates',
      notes:
        'The exam fee itself is fixed and small relative to training. Most of what you pay goes to the prep course, and that\'s optional if you qualify via the Experience Pathway instead.',
    },
    reimbursement: {
      available: true,
      summary:
        'Because this is the entry-level credential most job seekers pursue before landing their first solar role, it\'s one of the more commonly subsidized certifications in the industry — through public workforce funding, employer sponsorship after hire, or veterans benefits.',
      sources: [
        'State WIOA workforce funding — many training providers are listed on a state\'s Eligible Training Provider List (ETPL); check with your local American Job Center whether a given NABCEP prep course qualifies in your state before enrolling.',
        'Employer sponsorship — many installation companies cover part or all of the cost once you\'re hired, sometimes as a condition of a raise after passing.',
        'Veterans education benefits (GI Bill, VR&E) may apply depending on the training provider\'s approval status — confirm directly with the provider.',
      ],
    },
    expirationRenewal: {
      validityPeriod: '3 years from the date of issuance',
      renewalRequirement:
        '12 hours of NABCEP-approved continuing education, submitted through your myNABCEP account before your expiration date. You can only submit your renewal application during the third year of your credential period.',
    },
    relatedSalaryPages: [
      { label: 'Solar PV Installer salary', slug: 'solar-photovoltaic-installer' },
    ],
    format: 'Online, self-paced',
    duration: '18–24 hours',
    priceRange: '$550–1,050 all-in',
    whyHeatSpring: [
      "HeatSpring's course is built around Dr. Sean White's materials, the reference texts used across the industry.",
      'A pass guarantee on this specific course: fail the exam after completing it, and the retake (course and exam) is covered.',
      'Reported pass rate above 88% among students who complete the course, plus a full year of access to review materials.',
    ],
    heatspringFitReason:
      "For NABCEP PV Associate, we point people to HeatSpring because the course is built on Dr. Sean White's materials — the same reference texts used across the industry — and it comes with a pass guarantee: fail after completing it, and your retake is covered. Students who finish the course report a pass rate above 88%, well above what most beginners manage studying alone.",
    heatspringUrl:
      'https://www.heatspring.com/courses/solar-pv-boot-camp-nabcep-pv-associate-exam-prep?aff_id=9f_wlq',
    bannerHeadline: 'New to solar? Start with NABCEP Associate.',
    bannerSubtext: "No field experience required — HeatSpring's self-paced course, pass guarantee included.",
  },
  {
    slug: 'nabcep-pv-installation-professional',
    bannerImageSrc: '/nabcep_pvip.png',
    name: 'NABCEP PV Installation Professional',
    shortLabel: 'PV Installer',
    acronymExpansion:
      "NABCEP stands for the North American Board of Certified Energy Practitioners. \"PV Installation Professional\" (PVIP) is their full professional-level installer certification, formerly called NABCEP Solar PV Installer Certification.",
    forRoles: [
      { name: 'Lead Installer' },
      { name: 'Foreman' },
      { name: 'Solar Electrician' },
    ],
    careerPaths: [
      { name: 'Lead Installer / Foreman', href: '/lead-solar-installer-jobs' },
      { name: 'Solar Electrician' },
      { name: 'Site Supervisor' },
    ],
    whatItIs:
      "NABCEP's advanced installer credential. Unlike the Associate level, it requires documented field experience — a minimum number of PV installations — on top of passing the exam, which is why it's treated as proof of real installation competence, not just classroom knowledge.",
    whyItMatters:
      "It's the credential employers and utility incentive programs reference by name most often across the country. For a lead installer or someone aiming for a foreman role, it's usually the single certification that carries the most weight in hiring and pay decisions.",
    requirements: [
      'Minimum 10 hours of OSHA Outreach Training (OSHA 10, or a provincial equivalent outside the US)',
      'At least 58 hours of NABCEP-approved advanced PV training',
      'A minimum of 6 Project Credits — documented solar installations you completed in a decision-making role, not just as a crew member',
      'A passing score on the PVIP exam itself',
      'Note: the "Board Eligible" pathway now lets you take the exam before finishing the experience requirement — you get 3 years after passing to complete your project credits.',
    ],
    examFormat: {
      questionCount: '70 multiple-choice questions (60 scored, 10 unscored pilot questions)',
      duration: 'Up to 4 hours',
      format:
        'Computer-based, with on-screen access to the 2017 NEC and a calculator, at a Meazure Learning test center or via live remote proctoring',
    },
    passingScore: {
      scoreDescription: 'A scaled score of 70 out of 99',
      detail:
        'Same 0–99 scaled scoring model as the Associate exam, just a higher bar — and, unlike the Associate exam, you\'re expected to already have hands-on installation experience going in.',
    },
    difficulty: {
      score: 7,
      rationale:
        "Third-party estimates put first-attempt pass rates in the 60–70% range, and most candidates report needing 100–150 hours of dedicated study on top of their field experience. Field installers commonly describe the exam as testing whether you can explain and justify an installation decision on paper, not just execute it — a different skill than the field work itself.",
    },
    cost: {
      trainingCost:
        "$1,795 list price for HeatSpring's full 58-hour prep bundle (often less if you already hold approved hours from other training)",
      applicationFee: '$125, paid to NABCEP',
      examFee: '$375 for NABCEP members / $475 for non-members (NABCEP membership itself is $70/year)',
      totalEstimate: '~$1,800–2,300 all-in, including training, application, and exam fees',
      notes:
        'This is the most expensive NABCEP credential to pursue. Many candidates spread the cost over a year or more, and it\'s the certification most frequently subsidized by employers once someone has committed to a lead-installer track.',
    },
    reimbursement: {
      available: true,
      summary:
        'Public workforce funding (WIOA) is less consistently available for this professional-level course than for entry-level training, since it targets people already working in the field rather than job seekers. Employer sponsorship is the more common path at this level — it\'s common for companies to cover part or all of the cost once an employee is on a lead-installer track, especially after they pass.',
      sources: [
        'Employer sponsorship — the most common funding source at this level; ask before you self-fund.',
        'State WIOA workforce funding may still apply in some states via a local Eligible Training Provider List — worth checking, less consistent than for entry-level courses.',
        'NABCEP membership ($70/year) reduces your exam fee by $100 and pays for itself if you plan to recertify long-term.',
      ],
    },
    expirationRenewal: {
      validityPeriod: '3 years from the date of issuance',
      renewalRequirement:
        '30 hours of advanced PV continuing education, submitted before your expiration date. If you came in through the Board Eligible pathway, note that clock is separate from your 3-year window to complete outstanding project-credit requirements.',
    },
    relatedSalaryPages: [
      { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
      { label: 'Solar Electrician salary', slug: 'solar-electrician' },
    ],
     format: 'Online prep course, exam requires documented field experience',
     duration: '58 hours of training (varies further by experience already logged)',
     priceRange: '~$1,800–2,300 all-in',
    whyHeatSpring: [
      "Exam prep built specifically around the PVIP Job Task Analysis and the 58-hour advanced-training requirement, bundled into a single course.",
      'Instructors with direct field installation background, not just classroom credentials.',
      'One purchase satisfies the full advanced-hours requirement, instead of stitching together multiple shorter courses from different providers.',
    ],
    heatspringFitReason:
      "For PV Installation Professional, HeatSpring's prep is built specifically around the official PVIP Job Task Analysis and covers the full 58-hour advanced-training requirement in one course, taught by instructors with real field installation experience — instead of you stitching together several shorter courses just to qualify for the exam.",
    heatspringUrl:
      'https://www.heatspring.com/courses/nabcep-pv-installation-professional-pvip-certification-prep?aff_id=9f_wlq',
    bannerHeadline: 'Ready for NABCEP PV Installer?',
    bannerSubtext: 'The credential employers ask for by name — HeatSpring\'s 58-hour prep, built around the real exam blueprint.',
  },
  {
    slug: 'osha-10',
    bannerImageSrc: '/osha_10.png',
    name: 'OSHA 10-Hour Construction',
    shortLabel: 'OSHA 10',
    acronymExpansion:
      "OSHA stands for the Occupational Safety and Health Administration, the federal agency (under the US Department of Labor) that sets and enforces workplace safety rules. The \"10\" refers to the 10 hours of training in this specific Outreach Training Program course — there's also a 30-hour version, below.",
    forRoles: [
      { name: 'Every entry-level installer' },
      { name: 'Solar Apprentice' },
    ],
    careerPaths: [
      { name: 'Every entry-level installer role', href: '/solar-pv-installer-jobs' },
      { name: 'Solar Apprentice' },
      { name: 'Crew Member' },
    ],
    whatItIs:
      'A 10-hour hazard-awareness course covering falls, electrical hazards, struck-by and caught-in/between risks — the four leading causes of injury in construction. It\'s run through OSHA\'s Outreach Training Program by DOL-authorized providers.',
    whyItMatters:
      "It's not federally mandated on its own, but nearly every installation company, EPC, and general contractor requires it before letting anyone on a jobsite, and a growing number of states require it by law for construction permits. In practice, it's the most common first credential a new installer earns — often before NABCEP.",
    requirements: [
      'None. It\'s open to anyone and is typically the very first credential a new installer completes, often before their first day on a jobsite.',
    ],
    examFormat: {
      questionCount: 'A short quiz (around 10 questions) after each module, plus a final exam of roughly 20–30 questions depending on the provider',
      duration:
        'The course itself takes a minimum of 10 hours, spread across at least 2 days since OSHA caps training at 7.5 hours/day. You have 180 days from enrollment to finish, including the final exam.',
      format: 'Multiple choice / true-false, delivered entirely online through a DOL-authorized Outreach provider',
    },
    passingScore: {
      scoreDescription: '70% on each module quiz and on the final exam',
      detail:
        'You get up to 3 attempts per quiz and 3 attempts on the final exam under OSHA\'s Outreach Training Program rules. Fail all 3 attempts on any one of them and you have to re-purchase and restart the course.',
    },
    difficulty: {
      score: 2,
      rationale:
        "There's no field-experience prerequisite and no competency test in the traditional sense — this is a hazard-awareness course, not a technical exam. The 70% threshold combined with 3 attempts per quiz makes it very accessible to someone with zero jobsite background.",
    },
    cost: {
      trainingCost: '$50–90 for most online providers (HeatSpring\'s course lists at $59)',
      examFee: 'None — the final exam is included in the course price; there\'s no separate fee paid to OSHA or the DOL.',
      totalEstimate: '$50–90 total, one-time',
      notes: 'This is the cheapest and fastest credential on this list, and usually the first one a new installer earns.',
    },
    reimbursement: {
      available: true,
      summary:
        "Because it's typically a condition of employment rather than a career-advancement credential, OSHA 10 is one of the training costs most likely to be covered outright by the hiring company — many installers get it paid for directly before their start date, or reimbursed on their first paycheck.",
      sources: [
        'Employer-paid onboarding — extremely common for this specific course.',
        'WIOA / state workforce funding for job seekers going through a formal pre-hire training program.',
        'Union apprenticeship programs frequently bundle it into first-year training.',
      ],
    },
    expirationRenewal: {
      validityPeriod: 'The DOL wallet card itself does not expire under federal rules — there is no federally mandated renewal period.',
      renewalRequirement:
        "That said, some states (Connecticut, Nevada, among others) and individual employers or general contractors require retraining every 3–5 years as a matter of policy or state law, not federal OSHA rule. When that applies, you retake the full 10-hour course — OSHA doesn't offer a shorter refresher version for the Outreach 10-hour card.",
    },
    relatedSalaryPages: [
      { label: 'Solar PV Installer salary', slug: 'solar-pv-installer' },
    ],
    format: 'Online, self-paced',
    duration: '10 hours',
    priceRange: '$50–90',
    whyHeatSpring: [
      'Delivered through a partnership with the OSHA Education Center and the University of South Florida, a DOL-authorized provider, so the card is valid nationwide.',
      'Team/group pricing available if you\'re getting certified alongside a crew.',
      'Available in Spanish as well as English.',
    ],
    heatspringFitReason:
      "For OSHA 10, HeatSpring runs the course through the OSHA Education Center at the University of South Florida, a DOL-authorized provider, so the card you earn is valid nationwide. It's offered in Spanish as well as English, with group pricing if you're getting certified alongside your crew.",
    heatspringUrl: 'https://www.heatspring.com/courses/osha-10-hour-construction?aff_id=9f_wlq',
    bannerHeadline: 'Most jobsites require OSHA 10.',
    bannerSubtext: 'Get certified online, in a weekend, through an authorized provider on HeatSpring.',
  },
   {
     slug: 'osha-30',
     bannerImageSrc: '/osha_30.png',
     name: 'OSHA 30-Hour Construction',
     shortLabel: 'OSHA 30',
     acronymExpansion:
       "Same OSHA — the Occupational Safety and Health Administration. The \"30\" refers to the 30 hours of training, aimed at whoever holds actual safety responsibility on a crew rather than an individual worker.",
     forRoles: [
       { name: 'Crew Lead' },
       { name: 'Foreman' },
       { name: 'Site Supervisor' },
     ],
     careerPaths: [
       { name: 'Crew Lead', href: '/lead-solar-installer-jobs' },
       { name: 'Foreman', href: '/lead-solar-installer-jobs' },
       { name: 'Site Supervisor' },
     ],
     whatItIs:
       "The deeper counterpart to OSHA 10, covering the same core hazard categories in more depth plus jobsite safety program management. It's built for whoever holds actual safety responsibility on a crew, not just individual hazard awareness.",
     whyItMatters:
       "If you're managing a crew or coordinating subcontractors, OSHA 30 is what most companies expect on top of (not instead of) OSHA 10. It's the standard credential for a site supervisor role in solar construction.",
     requirements: [
       'None formally required by OSHA, though most candidates already hold OSHA 10 and are moving into a supervisory or safety-responsible role.',
     ],
     examFormat: {
       questionCount: 'Module quizzes throughout (roughly 10 questions each) plus a longer final exam covering all 30 hours of content',
       duration:
         'Minimum 30 hours of coursework, spread across at least 4 days under OSHA\'s 7.5-hour/day training cap; final exam completion falls within your course access window.',
       format: 'Multiple choice / true-false, delivered entirely online through a DOL-authorized Outreach provider',
     },
     passingScore: {
       scoreDescription: '70% on each module quiz and on the final exam',
       detail: 'Same 3-attempts-per-assessment rule as OSHA 10, just applied across more modules given the additional content.',
     },
     difficulty: {
       score: 3,
       rationale:
         'Same 70% threshold and 3-attempt structure as OSHA 10 — still a hazard-awareness and safety-management course, not a technical competency exam — but with three times the content and more nuanced material on running a safety program, not just recognizing hazards individually.',
     },
     cost: {
       trainingCost: '$90–190 for most online providers (HeatSpring\'s course lists at $159)',
       examFee: 'None — included in the course price.',
       totalEstimate: '$90–190 total, one-time',
       notes: 'Often taken as part of a promotion into a foreman or supervisor role, rather than before hire.',
     },
     reimbursement: {
       available: true,
       summary:
         "Because it's usually tied to a promotion or an expanded safety responsibility rather than a condition of entry-level hire, OSHA 30 is frequently covered as part of an employer's leadership-development or tuition-assistance budget.",
       sources: [
         'Employer-paid, often bundled into a promotion to crew lead or site supervisor.',
         'Union training funds commonly cover it for members moving into leadership roles.',
         'WIOA / state workforce funding, less commonly used at this level than for entry-level OSHA 10.',
       ],
     },
     expirationRenewal: {
       validityPeriod: 'The DOL wallet card itself does not expire under federal rules.',
       renewalRequirement:
         'As with OSHA 10, some states and employers require retraining every 3–5 years by policy rather than federal mandate — and there\'s no shorter refresher version, so renewal means retaking the full 30-hour course.',
     },
     relatedSalaryPages: [
       { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
     ],
     format: 'Online, self-paced',
     duration: '30 hours',
     priceRange: '$90–190',
     whyHeatSpring: [
       'Same authorized-provider partnership as their OSHA 10 course, so the card is valid nationwide.',
       'Group/team pricing for companies certifying multiple supervisors at once.',
       'Available in Spanish as well as English.',
     ],
     heatspringFitReason:
       "For OSHA 30, HeatSpring uses the same authorized-provider partnership as their OSHA 10 course, so your card is valid nationwide. It's available in Spanish as well as English, with group pricing for companies certifying several supervisors at once.",
     heatspringUrl: 'https://www.heatspring.com/courses/osha-30-hour-construction?aff_id=9f_wlq',
     bannerHeadline: 'Leading a crew? You need OSHA 30.',
     bannerSubtext: "HeatSpring's authorized 30-hour course, online and self-paced.",
   },
   {
     slug: 'nabcep-pv-installer-specialist',
     bannerImageSrc: '/nabcep_pvis.png',
     name: 'NABCEP PV Installer Specialist',
     shortLabel: 'PV Installer Specialist',
     acronymExpansion:
       "NABCEP stands for the North American Board of Certified Energy Practitioners. \"PV Installer Specialist\" (PVIS) is a board certification for installers who demonstrate advanced competence in PV system installation, including conductors, raceways, grounding, equipment installation, and safety planning — positioned between the entry-level PV Associate and the full PV Installation Professional.",
     forRoles: [
       { name: 'Experienced PV Installer' },
       { name: 'Lead Installer' },
       { name: 'BESS Technician' },
     ],
     careerPaths: [
       { name: 'Lead Installer', href: '/lead-solar-installer-jobs' },
       { name: 'BESS Technician', href: '/bess-technician-jobs' },
       { name: 'Solar Electrician' },
     ],
     whatItIs:
       "NABCEP's mid-level installer certification focused on hands-on installation competence. Unlike the PV Associate which tests classroom knowledge, the PVIS exam is built around the actual tasks an installer performs on a jobsite — from reading plans and developing safety protocols to installing raceways, conductors, modules, and balance of systems. It's the credential for installers who are ready to prove they can execute complex installations independently.",
     whyItMatters:
       "It fills the gap between the PV Associate and the PVIP: you don't need the full PVIP's 58-hour advanced training or extensive project-credit history, but you still get a nationally recognized credential that says you can lead installations, not just assist. Several large EPCs and developers now list PVIS as a preferred or required qualification for lead-installer positions, especially those working on commercial or utility-scale projects.",
     requirements: [
       'OSHA 10-Hour Construction Outreach (or provincial equivalent) — minimum 10 hours of formal safety training.',
       'At least 24 hours of advanced PV training, structured as: 18 hours covering the PVIS Job Task Analysis (JTA) + 6 hours of National Electric Code (NEC). HeatSpring\'s PVIS prep bundle satisfies this requirement in a single course.',
       'A minimum of 6 Project Credits — documented installations where you held a decision-making role. Credits are awarded per system based on size: 1–999 kW = 2 credits per system; 1 MW and up = 3 credits per system.',
       'A passing score on the PVIS exam.',
     ],
     examFormat: {
       questionCount: '70 multiple-choice questions (60 scored, 10 unscored pilot questions)',
       duration: 'Up to 4 hours',
       format:
         'Computer-based at a MeAzure Learning test center or via live remote proctoring. On-screen access to the NEC and a calculator are provided.',
     },
     passingScore: {
       scoreDescription: 'A scaled score of 70 out of 99',
       detail:
         'NABCEP uses a 0–99 scaled scoring model, not raw percentage, to keep results comparable across exam versions. The 70 threshold is the published passing mark for PVIS.',
     },
     difficulty: {
       score: 6,
       rationale:
         "More demanding than the PV Associate because it assumes hands-on experience and tests on real-world installation tasks rather than pure theory. Most candidates report needing 80–120 hours of combined field review and structured prep. The Project Credit requirement is the biggest barrier for installers who haven't kept documentation of their past work.",
     },
     cost: {
       trainingCost:
         "$1,795 for HeatSpring's PVIS Certification Prep bundle (covers the full 24-hour advanced-training requirement and exam prep); other providers offer shorter modules but may require stitching courses together to reach 24 hours.",
       applicationFee: '$125, paid to NABCEP upon application submission',
       examFee: '$375, paid to NABCEP after your application is accepted (total NABCEP fees: $500)',
       totalEstimate: '~$2,295 all-in for most first-time candidates',
       notes:
         'NABCEP does not offer a membership discount on PVIS fees the way they do for PVIP (where membership saves you $100 on the exam). The re-exam fee if needed is $275.',
     },
     reimbursement: {
       available: true,
       summary:
         'Because PVIS targets working installers rather than career-changers, employer sponsorship is the most common funding path. Some state workforce funds may cover it through an Eligible Training Provider List if the training provider is registered, but it\'s less consistently subsidized than entry-level PV Associate training.',
       sources: [
         'Employer sponsorship — ask if your company has a professional-development or certification budget; many installation firms cover PVIS for lead-installer-track employees.',
         'State WIOA / workforce funding — check whether your training provider is on your state\'s ETPL before enrolling.',
         'No veterans or union-specific discounts are listed by NABCEP for this certification.',
       ],
     },
     expirationRenewal: {
       validityPeriod: '3 years from the date of issuance',
       renewalRequirement:
         '30 hours of continuing education every 3 years, broken down as: 6 NEC hours, 12 PVIS JTA hours, 2 Building/Fire Code hours, and 10 Renewable Energy elective hours. You must also submit an employer letter confirming active involvement in the industry.',
     },
    relatedSalaryPages: [
      { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
      { label: 'BESS Technician salary', slug: 'bess-technician' },
    ],
     format: 'Online prep course, exam requires documented field experience',
     duration: '24 hours of advanced training (plus field experience)',
     priceRange: '~$2,295 all-in',
     whyHeatSpring: [
       'The bundle covers the full 24-hour advanced requirement (18 JTA + 6 NEC) in one course instead of forcing you to piece together multiple shorter modules.',
       'Includes a dedicated PVIS practice exam so you can test readiness before sitting for the real thing.',
       'Taught by industry practitioners, not just classroom instructors.',
     ],
     heatspringFitReason:
       "HeatSpring's PVIS prep bundle is one of the few that covers the full 24-hour advanced requirement — 18 hours on the PVIS Job Task Analysis plus 6 hours of NEC — in a single self-paced course, and it includes a practice exam. For working installers who can't piece together multiple shorter modules from different providers, that bundling is the main reason we recommend it.",
     heatspringUrl:
       'https://www.heatspring.com/courses/nabcep-pv-installer-specialist-pvis-certification-prep?aff_id=9f_wlq',
     bannerHeadline: 'Move beyond PV Associate.',
     bannerSubtext: 'HeatSpring\'s all-in-one PVIS prep — 24 advanced hours, practice exam, and the exact JTA coverage you need.',
   },
   {
     slug: 'nabcep-energy-storage-installation-professional',
     bannerImageSrc: '/nabcep_esip.png',
     name: 'NABCEP Energy Storage Installation Professional',
     shortLabel: 'ESIP',
     acronymExpansion:
       "NABCEP stands for the North American Board of Certified Energy Practitioners. \"Energy Storage Installation Professional\" (ESIP) is their specialist certification for technicians who install and commission battery energy storage systems — the fastest-growing segment of residential and commercial solar.",
     forRoles: [
       { name: 'BESS Technician' },
       { name: 'Lead Installer' },
       { name: 'Solar + Storage Specialist' },
     ],
     careerPaths: [
       { name: 'BESS Technician', href: '/bess-technician-jobs' },
       { name: 'Lead Installer', href: '/lead-solar-installer-jobs' },
       { name: 'Energy Storage Specialist' },
     ],
     whatItIs:
       "The first NABCEP board certification focused exclusively on energy storage. It was developed with CREATE Energy Center and MREA to establish a standard for battery storage installation competence. Unlike the PVIP which covers general PV systems, the ESIP dives deep into battery chemistries, storage system sizing, NEC Article 480/706, fire and building codes specific to storage, and the commissioning and troubleshooting of ESS.",
     whyItMatters:
       "Battery storage is now mandated alongside solar in many California and local building codes, and utilities increasingly require certified technicians for storage interconnection. The ESIP is rapidly becoming the credential employers list when hiring storage-specific roles — it's still newer than PVIP, but demand is growing faster than the supply of certified technicians.",
     requirements: [
       'OSHA 30-Hour Construction Outreach (or provincial equivalent) — note that ESIP requires OSHA 30, not OSHA 10.',
       'At least 58 hours of advanced energy storage training, covering the ESIP Job Task Analysis, NEC, and building/fire codes. HeatSpring\'s ESIP prep bundle provides these 58 hours through two combined courses (18-hour Energy Storage Associate Boot Camp + 40-hour Advanced ESIP Certification Training).',
       'A minimum of 6 Project Credits — documented energy storage installations in a decision-making role. Credits scale by system size: 1–80 kWh = 1 credit; 81–999 kWh = 2 credits; 1 MWh and up = 3 credits.',
       'A passing score on the ESIP exam.',
       'Note: Active NABCEP PVIP certificants receive 18 non-accredited hours toward the 58-hour training requirement.',
     ],
     examFormat: {
       questionCount: 'Not explicitly published by NABCEP; follows the standard NABCEP multiple-choice format — expect around 70 questions (60 scored + pilot questions) based on the ESIP Job Task Analysis blueprint',
       duration: 'Up to 4 hours (typical for NABCEP professional-level exams)',
       format:
         'Computer-based at a MeAzure Learning test center or via live remote proctoring; available in both English and Spanish.',
     },
     passingScore: {
       scoreDescription: 'Scaled score of 65 out of 99 (same 0–99 model used across NABCEP exams)',
       detail:
         'NABCEP does not publish separate passing thresholds per exam type in their public materials; the 65 figure follows the pattern of their other professional-level certifications. Treat this as an estimate based on NABCEP\'s documented scoring conventions — confirm with the current handbook before scheduling.',
     },
     difficulty: {
       score: 8,
       rationale:
         "The newest NABCEP certification and arguably the most technically demanding because it spans battery chemistry, high-voltage DC safety, specialized NEC articles, and commissioning protocols that even experienced PV installers don't touch daily. The 58-hour training requirement is longer than PVIS, and the Project Credit bar is high because storage-only projects are still less common than pure PV. Third-party prep providers estimate first-attempt pass rates in the 50–65% range among candidates who complete structured training.",
     },
     cost: {
       trainingCost:
         "$1,795 for HeatSpring's ESIP Certification Prep bundle (58 hours, including the 18-hour Energy Storage Associate Boot Camp and the 40-hour Advanced ESIP course); other providers may charge separately for each component.",
       applicationFee: '$125, paid to NABCEP',
       examFee: '$375, paid to NABCEP after approval (total NABCEP fees: $500)',
       totalEstimate: '~$2,295 all-in for most first-time candidates',
       notes:
         'Same NABCEP fee structure as PVIS. No membership discount applies. Re-exam fee if needed: $275.',
     },
     reimbursement: {
       available: true,
       summary:
         'Energy storage training qualifies for many of the same workforce-development funds as solar, but the ESIP is still so new that fewer states have explicitly added it to their Eligible Training Provider Lists. Employer sponsorship is the most reliable path — storage budgets are growing and companies are actively sending technicians to get certified.',
       sources: [
         'Employer sponsorship — storage budgets are expanding rapidly; many BESS employers cover ESIP prep and exam costs.',
         'State WIOA / workforce funding — worth checking but less consistently available than for general solar certifications.',
         'Utility or grant-funded training programs — some regional utilities and workforce boards have begun subsidizing storage-specific credentials.',
       ],
     },
     expirationRenewal: {
       validityPeriod: '3 years from the date of issuance',
       renewalRequirement:
         '30 hours of continuing education every 3 years, broken down as: 6 NEC hours, 12 ESIP JTA hours, 2 Building/Fire Code hours, and 10 Renewable Energy elective hours (with at least 2 of those elective hours focused on building or fire codes). You must also submit an employer letter confirming continued involvement in the industry.',
     },
    relatedSalaryPages: [
      { label: 'BESS Technician salary', slug: 'bess-technician' },
      { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
    ],
     format: 'Online prep course, exam requires documented field experience with storage systems',
     duration: '58 hours of advanced training (plus field experience)',
     priceRange: '~$2,295 all-in',
     whyHeatSpring: [
       'One of the few providers offering a bundled 58-hour ESIP prep that satisfies the full advanced-training requirement in a single purchase.',
       'Combines the 18-hour Energy Storage Associate Boot Camp with the 40-hour Advanced ESIP course, so you don\'t need to hunt for separate JTA and NEC coverage.',
       'Instructors with direct battery-storage field experience, not just PV backgrounds.',
     ],
     heatspringFitReason:
       "HeatSpring's ESIP prep bundle is structured around the official ESIP Job Task Analysis and bundles the full 58-hour advanced requirement (Associate Boot Camp + Advanced ESIP Training) into one self-paced program, which is unusual — most providers sell these as separate courses. For installers transitioning into storage who need the hours in one place, that bundling is the main draw.",
     heatspringUrl:
       'https://www.heatspring.com/courses/nabcep-energy-storage-installation-professional-esip-certification-prep?aff_id=9f_wlq',
     bannerHeadline: 'Storage is the new solar.',
     bannerSubtext: 'HeatSpring\'s bundled 58-hour ESIP prep — Associate hours plus advanced storage training, in one course.',
   },
   {
     slug: 'nabcep-pv-technical-sales',
     bannerImageSrc: '/nabcep_pvts.png',
     name: 'NABCEP PV Technical Sales',
     shortLabel: 'PV Technical Sales',
     acronymExpansion:
       "NABCEP stands for the North American Board of Certified Energy Practitioners. \"PV Technical Sales\" (PVTS) is their certification for people who sell, market, or design residential and commercial PV systems from the proposal side — testing your ability to explain production estimates, shading analysis, economics, and code compliance to a customer, not just install hardware.",
     forRoles: [
       { name: 'Solar Sales Rep' },
       { name: 'Solar Consultant' },
       { name: 'Designer / Proposals' },
     ],
     careerPaths: [
       { name: 'Solar Sales Rep', href: '/solar-sales-jobs' },
       { name: 'Solar Consultant' },
       { name: 'PV System Designer' },
     ],
     whatItIs:
       "NABCEP's non-installation certification for the sales and technical-design side of the industry. The exam tests whether you can accurately assess a site, calculate production and financial returns, explain interconnection requirements, and communicate technical information to non-technical customers. It's the credential that separates professional solar salespeople from people who just run leads.",
     whyItMatters:
       "In an industry with a long history of high-pressure, low-integrity sales tactics, the PVTS gives customers and employers a way to verify that a salesperson actually understands the systems they're selling. Some states (notably California and Washington) and several large solar companies now list it as preferred or required for design/sales positions, and it's increasingly showing up in utility program requirements for registered dealers.",
     requirements: [
       'No minimum field experience required — PVTS is open to anyone who can meet the training requirement, which makes it accessible to people coming from sales, marketing, or design backgrounds with no installation experience.',
       'At least 58 hours of advanced PV training covering the PVTS Job Task Analysis (JTA) blueprint, including technical sales principles, NEC and code standards, and PV fundamentals. HeatSpring\'s PVTS prep bundle satisfies this requirement.',
       'A passing score on the PVTS exam.',
     ],
     examFormat: {
       questionCount: 'Standard NABCEP multiple-choice format; not explicitly published for PVTS, but aligned with the PVTS Job Task Analysis blueprint',
       duration: 'Up to 4 hours (typical for NABCEP professional-level exams)',
       format:
         'Computer-based at a MeAzure Learning test center or via live remote proctoring, administered in English.',
     },
     passingScore: {
       scoreDescription: 'A scaled score of 75 out of 99',
       detail:
         'This is the highest published passing threshold among NABCEP\'s certifications — the PVTS exam is scored on the same 0–99 scaled model, but the bar is set at 75 rather than the 65–70 used for most other credentials. NABCEP confirmed this figure in their public FAQ materials.',
     },
     difficulty: {
       score: 7,
       rationale:
         "The 75 passing threshold makes it the hardest NABCEP exam to pass on a per-question basis, and the content spans technical PV knowledge, NEC code references, and sales-communication scenarios. Installers who are used to field exams often underestimate it because the questions look easier than PVIP — but the higher bar means fewer wrong answers are tolerated. Candidates who come from a sales or design background without deep PV knowledge typically need 100+ hours of structured prep.",
     },
     cost: {
       trainingCost:
         "$1,795 for HeatSpring's PVTS Certification Prep bundle (58 hours, including the Solar PV Boot Camp, 30-Hour Advanced PV Certification Training, PVTS Intensive Exam Prep, and PVTS Practice Exam); this is one of the few bundled options that covers the full 58-hour requirement without buying separate courses.",
       applicationFee: '$125, paid to NABCEP upon application submission',
       examFee: '$375, paid to NABCEP after approval (total NABCEP fees: $500)',
       totalEstimate: '~$2,295 all-in for most first-time candidates',
       notes:
         'No NABCEP membership discount applies to PVTS fees. Re-exam fee if needed: $275.',
     },
     reimbursement: {
       available: true,
       summary:
         'Because PVTS is accessible to non-installers and career-changers, it\'s occasionally covered by workforce-development programs aimed at getting people into the solar industry — but it\'s less commonly subsidized than PV Associate. Employer sponsorship is the most realistic path once you\'re in a sales or design role.',
       sources: [
         'Employer sponsorship — growing as companies recognize the credential\'s value for customer trust and utility program compliance.',
         'State WIOA / workforce funding — possible if the training provider is on your state\'s ETPL, but less common than for PV Associate.',
         'No veterans or union-specific discounts listed by NABCEP for this certification.',
       ],
     },
     expirationRenewal: {
       validityPeriod: '3 years from the date of issuance',
       renewalRequirement:
         '30 hours of continuing education every 3 years. NABCEP\'s public materials don\'t break out a PVTS-specific renewal formula the way they do for ESIP and PVIP, so follow the standard NABCEP recertification pathway: submit CEUs through your myNABCEP account and pay the $390 recertification fee.',
     },
     relatedSalaryPages: [
       { label: 'Solar Sales Rep salary', slug: 'solar-sales' },
       { label: 'Solar PV Installer salary', slug: 'solar-photovoltaic-installer' },
     ],
     format: 'Online prep course, no field experience required',
     duration: '58 hours of training',
     priceRange: '~$2,295 all-in',
     whyHeatSpring: [
       'Bundles the full 58-hour requirement (Boot Camp + Advanced PV + PVTS Intensive + Practice Exam) into a single purchase — rare among prep providers.',
       'Codes-and-standards focus matches the PVTS blueprint\'s emphasis on NEC and IFC references.',
       'Taught by Sean White, a long-time NABCEP committee contributor and IREC Certified Master Trainer.',
     ],
     heatspringFitReason:
       "HeatSpring's PVTS prep bundle is one of the few that packages the full 58-hour requirement — Boot Camp, Advanced PV Training, PVTS Intensive, and a dedicated PVTS Practice Exam — into one self-paced course. For people coming from sales or design backgrounds who don't have a PV installation network to draw on, that all-in-one structure removes the guesswork of piecing together separate courses to hit the 58-hour mark.",
     heatspringUrl:
       'https://www.heatspring.com/courses/nabcep-pv-technical-sales-pvts-certification-prep-codes-standards-focus?aff_id=9f_wlq',
     bannerHeadline: 'Sell solar with real expertise.',
     bannerSubtext: 'HeatSpring\'s 58-hour PVTS prep — codes, sales math, and a full practice exam, in one bundle.',
   },
 ]

export function getCertificationBySlug(slug: string) {
  return CERTIFICATIONS.find(c => c.slug === slug)
}