// certifications-data.ts
//
// Passe éditoriale vérifiée le 7 octobre 2026 : exigences et frais NABCEP,
// règles OSHA Outreach, notions électriques DOE/OSHA et cours gratuits
// HeatSpring. Le seuil ESIP non confirmé reste explicitement à vérifier.
// Sources et preuves navigateur : docs/certifications-editorial-audit-20261007.md.
//
// Les notes de DIFFICULTÉ (score /10) sont une estimation éditoriale basée
// sur le contenu à préparer et la complexité des prérequis — aucun taux de réussite
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
  score: number // sur 10 — appréciation éditoriale, pas un taux de réussite
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
  overviewHeading: string
  heatspringHeading: string
  heatspringCtaLabel: string
  heatspringLimitation: string
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
      "NABCEP is the North American Board of Certified Energy Practitioners. Its PV Associate (PVA) credential covers photovoltaic (PV) systems, which convert sunlight into electricity.",
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
      "The PV Associate credential tests the fundamentals of solar electricity, system components, design, installation, and operation. You can qualify through an approved training course without prior solar work experience; an experience pathway is also available.\n\nSolar modules produce DC (direct current) electricity. An inverter converts that output to AC (alternating current) for most building circuits and the electrical grid. Knowing how these parts work together is part of the foundation the Associate exam assesses.",
    whyItMatters:
      "PVA gives a new installer or apprentice a way to demonstrate basic PV knowledge before taking responsibility for an installation. It is an Associate credential, not a professional installer certification or an electrical license. The higher-level PV Installation Professional certification adds advanced training and documented project experience.",
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
      "score": 4,
      "rationale": "The exam covers a broad set of fundamentals rather than advanced installation decisions. New entrants may need extra practice with electrical calculations and system diagrams; a practice score can help identify those gaps, but does not guarantee an exam result."
    },
    cost: {
      "trainingCost": "Varies by provider; an approved course is required for the Education Pathway",
      "applicationFee": "$25, paid to NABCEP",
      "examFee": "$125, paid to NABCEP; a training provider may add administration charges",
      "totalEstimate": "$150 in NABCEP fees, plus training and any provider charges",
      "notes": "The Experience Pathway can avoid a required training-course purchase if your work history qualifies. The free practice exam below is a study aid; it does not qualify you through the Education Pathway."
    },
    reimbursement: {
      "available": true,
      "summary": "An employer, workforce program, or veterans benefit may help pay for Associate training or exam fees. Confirm the specific course and expense are eligible before enrolling.",
      "sources": [
        "Workforce Innovation and Opportunity Act (WIOA) funding: ask your local American Job Center whether the course is on the state Eligible Training Provider List (ETPL).",
        "Employer sponsorship: ask whether training and the NABCEP fees are included in onboarding or reimbursement.",
        "Veterans benefits: check the provider’s approval status and whether course costs or exam fees can be reimbursed."
      ]
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
    priceRange: "$150 in NABCEP fees, plus training",
    whyHeatSpring: [
      "A free 70-question practice exam focused on the PV Associate test.",
      "Useful for reviewing your understanding of PV fundamentals; it is not an eligibility course."
    ],
    heatspringFitReason:
      "The free NABCEP PV Associate (PVA) Practice Exam on HeatSpring gives you 70 questions to work through before the real test. Use it to find the electrical and system-design topics that need another review, then return to your study materials.",
    heatspringUrl:
      "https://www.heatspring.com/courses/nabcep-pv-associate-pva-practice-exam?aff_id=9f_wlq",
    bannerHeadline: "Review the PV Associate exam topics.",
    bannerSubtext: "Try a free 70-question practice exam on HeatSpring. The official credential has separate eligibility and exam requirements.",
    overviewHeading: "PV fundamentals before field experience",
    heatspringHeading: "Check your PV Associate exam preparation",
    heatspringLimitation: "Passing this practice exam does not earn the PVA credential or meet the Education Pathway training requirement. NABCEP still requires an approved eligibility pathway and its own exam.",
    heatspringCtaLabel: "Take the free practice exam",
  },
  {
    slug: 'nabcep-pv-installation-professional',
    bannerImageSrc: '/nabcep_pvip.png',
    name: 'NABCEP PV Installation Professional',
    shortLabel: 'PV Installer',
    acronymExpansion:
      "NABCEP is the North American Board of Certified Energy Practitioners. PV Installation Professional (PVIP) is its board certification for professionals responsible for photovoltaic (PV) installations.",
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
      "PVIP combines advanced PV knowledge with evidence that you have made installation decisions on completed projects. Exam preparation and field experience serve different purposes: studying can prepare you to explain a design choice, but it cannot document work you have not performed.\n\nThat knowledge spans the DC (direct current) circuits from the modules and the AC (alternating current) side of the inverter, which converts solar output for the building or grid. Candidates also need to apply the NEC (National Electrical Code), including the requirements for wiring and equipment protection.",
    whyItMatters:
      "PVIP is relevant to lead installers, foremen, and solar electricians who take responsibility for installation quality. It demonstrates assessed knowledge and qualifying experience. It does not replace an electrical or contractor license, and an employer or incentive program may set additional requirements.",
    requirements: [
      "At least 10 hours of Occupational Safety and Health Administration (OSHA) Construction Outreach training, or an accepted equivalent.",
      "58 hours of prescribed PV training, including at least 40 hours of advanced training from a qualifying provider. Check the handbook for the remaining hours and documentation rules.",
      "At least 6 project credits from qualifying installations in a decision-making role. Credits measure documented project experience, not classroom hours or simply time on a crew.",
      "An accepted application, agreement to the NABCEP Code of Ethics, and a passing PVIP exam result; applicants must be at least 18.",
      "The Board Eligible pathway allows the exam before all project experience is complete. Passing gives you up to 3 years to meet the outstanding experience requirements; Board Eligible status is not full PVIP certification."
    ],
    examFormat: {
      questionCount: '70 multiple-choice questions (60 scored, 10 unscored pilot questions)',
      duration: 'Up to 4 hours',
      format:
        'Computer-based, with on-screen access to the 2017 NEC and a calculator, at a Meazure Learning test center or via live remote proctoring',
    },
    passingScore: {
      "scoreDescription": "A scaled score of 70 out of 99",
      "detail": "A scaled score accounts for differences between exam versions; 70 is not a raw percentage of correct answers. Passing the exam does not remove any outstanding experience requirements under the Board Eligible pathway."
    },
    difficulty: {
      "score": 7,
      "rationale": "Field experience helps, but the exam also requires calculations and the ability to find and apply code provisions. Review the official exam outline alongside your own project records: doing an installation correctly and explaining why it complies are related skills."
    },
    cost: {
      "trainingCost": "Depends on how many qualifying training hours you still need and the provider you choose",
      "applicationFee": "$125, paid to NABCEP",
      "examFee": "$375, paid to NABCEP",
      "totalEstimate": "$500 in NABCEP fees, plus required training",
      "notes": "Budget for training separately from the application and exam. The published re-exam fee is $275. The free practice resource below does not supply the required training hours."
    },
    reimbursement: {
      "available": true,
      "summary": "An employer may support PVIP training for installers taking on project responsibility. Ask which training, application, and exam expenses are covered, and whether reimbursement depends on passing.",
      "sources": [
        "Employer professional-development funding: obtain the reimbursement terms before buying training.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: check the state Eligible Training Provider List (ETPL) and your individual eligibility through an American Job Center.",
        "Veterans exam-fee reimbursement: check current benefit eligibility and NABCEP’s veterans guidance."
      ]
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
     priceRange: "$500 in NABCEP fees, plus training",
    whyHeatSpring: [
      "Free practice questions relevant to PVIP installation and design topics.",
      "A self-serve review tool, separate from required training and field experience."
    ],
    heatspringFitReason:
      "HeatSpring’s Free NABCEP PV Certification Practice Exam is a self-serve set of 70 questions for installation and design candidates. It is a useful supplement when you want to check your calculations and code knowledge before taking PVIP.",
    heatspringUrl:
      "https://www.heatspring.com/courses/free-nabcep-pv-certification-practice-exam?aff_id=9f_wlq",
    bannerHeadline: "Practice the PV installation and design questions.",
    bannerSubtext: "Review with a free HeatSpring practice exam. PVIP training and project requirements still apply.",
    overviewHeading: "Installation decisions and documented experience",
    heatspringHeading: "Work through PV certification practice questions",
    heatspringLimitation: "This practice exam offers no qualifying training hours or instructor support. It cannot replace the PVIP eligibility requirements, project documentation, or official exam.",
    heatspringCtaLabel: "Take the free practice exam",
  },
  {
    slug: 'osha-10',
    bannerImageSrc: '/osha_10.png',
    name: "OSHA 10-Hour Construction training",
    shortLabel: 'OSHA 10',
    acronymExpansion:
      "OSHA is the Occupational Safety and Health Administration, part of the U.S. Department of Labor (DOL). Its 10-hour Construction Outreach course introduces workers to common jobsite hazards.",
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
      "OSHA 10-Hour Construction training covers common hazards, workers’ rights, and employer responsibilities. For solar crews, falls, electrical contact, moving equipment, and caught-in or between hazards are relevant parts of that awareness. Successful completion through an authorized trainer or accepted online provider leads to a DOL course-completion card, not an OSHA certification or license.",
    whyItMatters:
      "A jobsite, employer, or jurisdiction may require the card before you start work. OSHA does not impose a general federal requirement to take Outreach training. The course also does not replace the employer’s duty to train you for the specific hazards and equipment you will encounter.",
    requirements: [
      "No prior construction experience or OSHA course is required. Choose an OSHA-authorized trainer or an OSHA-accepted online provider for the Construction program if you need the DOL card."
    ],
    examFormat: {
      "questionCount": "Quizzes and any final assessment depend on the trainer or online provider",
      "duration": "At least 10 instructional hours; confirm the schedule and completion deadline with your provider",
      "format": "Available through authorized trainers and OSHA-accepted online providers. Verify that the course issues the Construction DOL card your jobsite requires."
    },
    passingScore: {
      "scoreDescription": "Assessment rules depend on the provider",
      "detail": "OSHA does not require an exam to earn an Outreach course-completion card. Providers may use quizzes or tests; a 70% score, attempt limit, or restart policy belongs to the provider that sets it."
    },
    difficulty: {
      "score": 2,
      "rationale": "The course introduces hazard recognition and assumes no construction background. Completing all required instructional hours is essential. Review any provider-specific assessments before enrolling, especially if you need language or learning accommodations."
    },
    cost: {
      "trainingCost": "Varies by authorized trainer or accepted online provider",
      "examFee": "Any provider assessment is part of its enrollment terms; there is no separate OSHA certification exam",
      "totalEstimate": "Confirm the full course price and card delivery charges with your provider",
      "notes": "The free electrical-safety lesson below is separate from the 10-hour Outreach course and does not issue its card."
    },
    reimbursement: {
      "available": true,
      "summary": "If a job requires the Construction card, ask whether the employer books and pays for the course. Check reimbursement and the accepted provider before paying yourself.",
      "sources": [
        "Employer-paid onboarding: confirm who selects the provider and pays the enrollment fee.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: ask your local workforce program whether Outreach training is included.",
        "Union apprenticeship training: check whether the program includes the 10-hour Construction course."
      ]
    },
    expirationRenewal: {
      "validityPeriod": "Construction DOL course-completion cards have no federal expiration date.",
      "renewalRequirement": "An employer or jurisdiction may require more recent training. Check the rule that applies to your jobsite rather than assuming a universal renewal interval."
    },
    relatedSalaryPages: [
      { label: 'Solar PV Installer salary', slug: 'solar-photovoltaic-installer' },
    ],
    format: 'Online, self-paced',
    duration: '10 hours',
    priceRange: "Provider-set course fee",
    whyHeatSpring: [
      "A free introductory electrical-safety lesson relevant to solar installation work.",
      "Separate from OSHA Outreach training; no OSHA 10 or 30 DOL card is issued."
    ],
    heatspringFitReason:
      "HeatSpring’s free Intro to Safety for Electricians is a one-hour preview lesson for apprentices and solar installers. It introduces electrical hazards and workplace safety concepts that help put the electrical portion of construction hazard awareness in context.",
    heatspringUrl: "https://www.heatspring.com/courses/intro-to-safety-for-electricians-preview-lesson-nccer-level-1-apprenticeship?aff_id=9f_wlq",
    bannerHeadline: "Start with electrical hazard awareness.",
    bannerSubtext: "A free HeatSpring safety lesson for apprentices and installers. It does not issue an OSHA 10 or 30 DOL card.",
    overviewHeading: "Ten hours of construction hazard awareness",
    heatspringHeading: "An introduction to electrical safety on site",
    heatspringLimitation: "This lesson does not issue an OSHA 10- or 30-hour DOL card. To obtain an OSHA 10 Construction card, complete the full Outreach course through an authorized trainer or accepted online provider.",
    heatspringCtaLabel: "Start the free safety lesson",
  },
   {
     slug: 'osha-30',
     bannerImageSrc: '/osha_30.png',
     name: "OSHA 30-Hour Construction training",
     shortLabel: 'OSHA 30',
     acronymExpansion:
       "OSHA is the Occupational Safety and Health Administration, within the U.S. Department of Labor (DOL). The 30-hour Construction Outreach course is intended for supervisors and workers with safety responsibilities.",
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
       "The 30-hour Construction course covers a wider range of jobsite hazards and gives them more instructional time than OSHA 10. It is intended for people such as foremen, crew leads, and workers who have some safety responsibility. Completion earns a DOL course-completion card; it does not certify you as a safety professional.",
     whyItMatters:
       "Supervising a crew means recognizing hazards across the work being coordinated, not only in your own task. An employer or jobsite may require OSHA 30 for that responsibility. OSHA 10 is not a prerequisite, and OSHA 30 does not have to be taken in addition to it; check which Construction card your employer actually requests.",
     requirements: [
      "OSHA 10 is not required before OSHA 30. Use an authorized trainer or OSHA-accepted online provider and complete the full 30-hour Construction course to receive its DOL card."
    ],
     examFormat: {
      "questionCount": "Assessment format and question counts are set by the provider",
      "duration": "At least 30 instructional hours; ask the provider for its schedule and access window",
      "format": "Classroom training through authorized trainers or online study through OSHA-accepted providers. This is Outreach training, not a professional certification exam."
    },
     passingScore: {
      "scoreDescription": "Check the provider’s assessment policy",
      "detail": "OSHA sets no universal passing percentage or three-attempt exam rule for Outreach classes. An online provider may impose those conditions; review its terms before starting."
    },
     difficulty: {
      "score": 3,
      "rationale": "The main difference from OSHA 10 is the greater breadth and time commitment. Supervisors should relate the hazard examples to how their crews work and how subcontractors interact. Any quizzes are governed by the provider’s policy."
    },
     cost: {
      "trainingCost": "Set by the authorized trainer or accepted online provider",
      "examFee": "No separate OSHA certification exam fee",
      "totalEstimate": "Request the full 30-hour course price, including any card delivery charges",
      "notes": "The free safety preview below is supplemental learning. Its completion cannot be exchanged for an OSHA 30 DOL card."
    },
     reimbursement: {
      "available": true,
      "summary": "When a company requests OSHA 30 for a supervisory assignment, course funding may be part of that assignment. Confirm the payment arrangement and any deadline before enrolling.",
      "sources": [
        "Employer training budget: ask about enrollment and card delivery costs.",
        "Union training funds: check the program’s eligibility and course schedule.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: verify whether a local program covers the requested course."
      ]
    },
     expirationRenewal: {
      "validityPeriod": "The Construction DOL course-completion card has no federal expiration date.",
      "renewalRequirement": "Site owners, employers, or jurisdictions may require recent training. Confirm their requirements when changing jobs or projects."
    },
     relatedSalaryPages: [
       { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
     ],
     format: 'Online, self-paced',
     duration: '30 hours',
     priceRange: "Provider-set course fee",
     whyHeatSpring: [
      "A short, free review of electrical hazards relevant to installation crews.",
      "An introductory lesson, not OSHA 30 Outreach training or a DOL card course."
    ],
     heatspringFitReason:
       "The free Intro to Safety for Electricians lesson covers electrical-safety fundamentals. A crew lead can use it as a short review of electrical hazards encountered by installers; it is an introductory lesson, not a course in managing a complete construction safety program.",
     heatspringUrl: "https://www.heatspring.com/courses/intro-to-safety-for-electricians-preview-lesson-nccer-level-1-apprenticeship?aff_id=9f_wlq",
     bannerHeadline: "Review electrical safety before coordinating the work.",
     bannerSubtext: "Explore a free HeatSpring safety lesson. An OSHA 30 DOL card requires separate Outreach training.",
     overviewHeading: "More depth for workers with safety responsibilities",
    heatspringHeading: "Review electrical hazards your crew may encounter",
    heatspringLimitation: "The HeatSpring lesson does not issue an OSHA 10- or 30-hour DOL card or replace the 30-hour Outreach course required by a jobsite.",
    heatspringCtaLabel: "Explore the free safety lesson",
  },
   {
     slug: 'nabcep-pv-installer-specialist',
     bannerImageSrc: '/nabcep_pvis.png',
     name: 'NABCEP PV Installer Specialist',
     shortLabel: 'PV Installer Specialist',
     acronymExpansion:
       "NABCEP is the North American Board of Certified Energy Practitioners. PV Installer Specialist (PVIS) is its board certification focused on photovoltaic (PV) installation work.",
     forRoles: [
      {
        "name": "Experienced PV Installer"
      },
      {
        "name": "Lead Installer"
      },
      {
        "name": "Battery storage technician"
      }
    ],
     careerPaths: [
      {
        "name": "Lead Installer",
        "href": "/lead-solar-installer-jobs"
      },
      {
        "name": "Battery storage technician",
        "href": "/bess-technician-jobs"
      },
      {
        "name": "Solar Electrician"
      }
    ],
     whatItIs:
       "PVIS focuses on installing equipment and wiring to the plans and applicable codes. Conductors are the wires that carry current; a raceway is the conduit or other enclosed channel that routes and protects them. The installation includes DC (direct current) wiring from the modules and AC (alternating current) wiring on the output side of the inverter.\n\nThe inverter converts the modules’ DC output into AC for the building or grid. Grounding connects designated parts of the system to earth; bonding connects conductive equipment parts together to maintain an effective fault-current path. Both require attention to the NEC (National Electrical Code), rather than treating all grounding connections as interchangeable.",
     whyItMatters:
       "PVIS addresses installation tasks specifically, while PV Installation Professional covers a broader scope of project responsibility. Both require documented experience. PVIS is relevant to experienced installers and leads working for an EPC (engineering, procurement, and construction) contractor, but it is not a required stepping stone to PVIP or a substitute for a trade license.",
     requirements: [
      "At least 10 hours of Occupational Safety and Health Administration (OSHA) Construction Outreach training, or an accepted equivalent.",
      "24 hours of advanced training from qualifying providers: 18 hours covering the PVIS Job Task Analysis (JTA), the outline of assessed work tasks, plus 6 hours on the NEC.",
      "At least 6 project credits for qualifying installations in which you made decisions that materially affected the work. Systems of 1–999 kW (kilowatts) earn 2 credits; systems of 1 MW (megawatt, or 1,000 kW) and above earn 3.",
      "A documented application, agreement to the NABCEP Code of Ethics, and a passing PVIS exam result; applicants must be at least 18."
    ],
     examFormat: {
       questionCount: '70 multiple-choice questions (60 scored, 10 unscored pilot questions)',
       duration: 'Up to 4 hours',
       format:
         'Computer-based at a Meazure Learning test center or via live remote proctoring. On-screen access to the NEC and a calculator are provided.',
     },
     passingScore: {
       scoreDescription: 'A scaled score of 70 out of 99',
       detail:
         'NABCEP uses a 0–99 scaled scoring model, not raw percentage, to keep results comparable across exam versions. The 70 threshold is the published passing mark for PVIS.',
     },
     difficulty: {
      "score": 6,
      "rationale": "The test assumes you can connect installation procedures to electrical principles and code requirements. Review conductor sizing, wiring methods, grounding and bonding, and equipment installation. Keeping complete records of qualifying projects also matters when applying."
    },
     cost: {
      "trainingCost": "Varies with the provider and how many of the required 24 hours you already hold",
      "applicationFee": "$125, paid to NABCEP",
      "examFee": "$375, paid to NABCEP",
      "totalEstimate": "$500 in NABCEP fees, plus required training",
      "notes": "The published re-exam fee is $275. A free practice exam helps with review, but is separate from the required advanced training."
    },
     reimbursement: {
      "available": true,
      "summary": "For a working installer, the first funding question is whether the employer has a budget for the advanced training and exam. Public funding depends on the course listing and the applicant’s eligibility.",
      "sources": [
        "Employer sponsorship: ask which remaining training hours and exam costs the company will pay.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: verify the course’s place on the state Eligible Training Provider List (ETPL).",
        "Veterans benefits: verify eligibility for course support or exam-fee reimbursement rather than assuming every cost is covered."
      ]
    },
     expirationRenewal: {
      "validityPeriod": "3 years from the date of issuance",
      "renewalRequirement": "30 hours of continuing education: 6 on the NEC, 12 covering the PVIS task outline, and 12 on renewable energy, including 2 on building or fire codes. Submit a signed letter documenting qualifying industry activity with your recertification application."
    },
    relatedSalaryPages: [
      { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
      { label: 'Solar Technician salary', slug: 'solar-technician' },
    ],
     format: 'Online prep course, exam requires documented field experience',
     duration: '24 hours of advanced training (plus field experience)',
     priceRange: "$500 in NABCEP fees, plus training",
     whyHeatSpring: [
      "A free practice resource that HeatSpring identifies as relevant to PV installer specialists.",
      "Supports review of installation topics without replacing PVIS-specific training."
    ],
     heatspringFitReason:
       "The Free NABCEP PV Certification Practice Exam includes questions relevant to PVIS as well as installation and design certification. Work through it alongside the PVIS task outline, paying particular attention to the wiring and code topics you use less often on site.",
     heatspringUrl:
       "https://www.heatspring.com/courses/free-nabcep-pv-certification-practice-exam?aff_id=9f_wlq",
     bannerHeadline: "Review the installation topics you use less often.",
     bannerSubtext: "Free PV certification practice questions on HeatSpring; PVIS eligibility and training remain separate.",
     overviewHeading: "The wiring and equipment work PVIS assesses",
    heatspringHeading: "Review installation topics with a free practice exam",
    heatspringLimitation: "The questions are not a PVIS-only exam or a qualifying 24-hour course. You still need the required training, project credits, and a passing result on NABCEP’s PVIS exam.",
    heatspringCtaLabel: "Take the free practice exam",
  },
   {
     slug: 'nabcep-energy-storage-installation-professional',
     bannerImageSrc: '/nabcep_esip.png',
     name: 'NABCEP Energy Storage Installation Professional',
     shortLabel: 'ESIP',
     acronymExpansion:
       "NABCEP is the North American Board of Certified Energy Practitioners. Its Energy Storage Installation Professional (ESIP) certification covers the installation of energy storage systems (ESS), including battery energy storage systems (BESS).",
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
       "An ESS includes more than stored energy: its power-conversion equipment, controls, protection, and wiring determine how it can supply a building or connect to the grid. In a BESS, batteries store energy and deliver DC (direct current). An inverter converts it to AC (alternating current) for building circuits or grid export; charging equipment converts incoming power as needed for the batteries.\n\nSystem sizing separates power from energy. kW (kilowatts) describe the rate of charging or discharge; kWh (kilowatt-hours) describe an energy quantity. Larger systems use MW (megawatts) and MWh (megawatt-hours): 1 MW is 1,000 kW, while 1 MWh is 1,000 kWh.",
     whyItMatters:
       "ESIP assesses work on the complete storage installation, including commissioning: checking settings, protection, controls, and operation before placing the system in service. That work requires the NEC (National Electrical Code), applicable fire and building codes, and the utility’s interconnection rules for connecting to its network. A photovoltaic (PV) installation background helps, but storage introduces operating modes and hazards that solar-only training may not cover.",
     requirements: [
      "Occupational Safety and Health Administration (OSHA) 30-Hour Construction Outreach training, or an accepted state or provincial equivalent. ESIP requires OSHA 30 rather than OSHA 10.",
      "58 hours of advanced energy storage training covering the ESIP Job Task Analysis (JTA), the outline of assessed work tasks, and applicable codes. Retain the completion records needed for your application.",
      "At least 6 project credits from qualifying energy storage installations completed within the previous 2 calendar years, with proof of your decision-making role. Credits depend on energy capacity: 1–80 kWh earns 1 credit; 81–999 kWh earns 2; 1 MWh and above earns 3.",
      "An accepted application, agreement to the NABCEP Code of Ethics, and a passing ESIP exam result; applicants must be at least 18.",
      "Active PV Installation Professional (PVIP) certificants receive 18 non-accredited hours toward the 58-hour training requirement."
    ],
     examFormat: {
      "questionCount": "70 multiple-choice questions: 60 scored and 10 unscored pilot questions",
      "duration": "Up to 4 hours",
      "format": "Computer-based at a Meazure Learning test center or through live remote proctoring. NABCEP offers ESIP in English and Spanish."
    },
     passingScore: {
      "scoreDescription": "Confirm the ESIP threshold with NABCEP",
      "detail": "NABCEP uses scaled scores rather than raw percentages. Its public passing-score FAQ does not list ESIP; thresholds for other credentials are not evidence of the ESIP passing mark."
    },
     difficulty: {
      "score": 8,
      "rationale": "Storage preparation spans battery behavior, electrical protection, controls, and commissioning. An experienced PV installer may still need substantial review of storage operating modes and fire-code requirements. This rating reflects that breadth, not a measured ESIP pass rate."
    },
     cost: {
      "trainingCost": "Depends on the storage training hours you still need and the provider you choose",
      "applicationFee": "$125, paid to NABCEP",
      "examFee": "$375, paid to NABCEP",
      "totalEstimate": "$500 in NABCEP fees, plus advanced training and any required OSHA 30 course",
      "notes": "The published re-exam fee is $275. Active PVIP holders can receive the training-hour credit described above; confirm your remaining hours before buying a training package."
    },
     reimbursement: {
      "available": true,
      "summary": "Storage training may be covered by an employer’s technical-development budget or a local workforce program. Confirm the award applies to the training you need; funding for a general solar course does not establish eligibility for an ESIP course.",
      "sources": [
        "Employer sponsorship: ask about advanced storage training and required safety training as separate costs.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: check the specific course on the state Eligible Training Provider List (ETPL).",
        "Utility or grant-funded training: confirm any available program’s course list and participant criteria."
      ]
    },
     expirationRenewal: {
      "validityPeriod": "3 years from the date of issuance",
      "renewalRequirement": "30 hours of continuing education: 6 on electrical codes, 12 on the ESIP task outline, and 12 on renewable energy, including 2 on building or fire codes. Document qualifying industry activity as well as education when applying for recertification."
    },
    relatedSalaryPages: [
      { label: 'Solar Technician salary', slug: 'solar-technician' },
      { label: 'Lead Installer / Foreman salary', slug: 'lead-solar-installer' },
    ],
     format: 'Online prep course, exam requires documented field experience with storage systems',
     duration: '58 hours of advanced training (plus field experience)',
     priceRange: "$500 in NABCEP fees, plus training",
     whyHeatSpring: [
      "A free introduction to battery types, system configurations, and customer loads.",
      "Includes a load-profile exercise; it is separate from ESIP qualifying training."
    ],
     heatspringFitReason:
       "Understanding Residential and Commercial Energy Storage introduces battery types, system configurations, and the loads a customer needs to supply. The free HeatSpring course includes a load-profile spreadsheet exercise, a useful starting point before ESIP-specific study.",
     heatspringUrl:
       "https://www.heatspring.com/courses/understanding-residential-and-commercial-energy-storage?aff_id=9f_wlq",
     bannerHeadline: "Understand the complete storage system.",
     bannerSubtext: "Explore a free residential and commercial storage course on HeatSpring before certification-specific study.",
     overviewHeading: "A battery is one part of the storage installation",
    heatspringHeading: "Start with residential and commercial storage",
    heatspringLimitation: "This introductory course is not approved for NABCEP credit hours and does not earn ESIP certification. Advanced training, documented storage projects, and the official exam are still required.",
    heatspringCtaLabel: "Start the free storage course",
  },
   {
     slug: 'nabcep-pv-technical-sales',
     bannerImageSrc: '/nabcep_pvts.png',
     name: 'NABCEP PV Technical Sales',
     shortLabel: 'PV Technical Sales',
     acronymExpansion:
       "NABCEP is the North American Board of Certified Energy Practitioners. PV Technical Sales (PVTS) is its board certification for the sales and proposal work behind photovoltaic (PV) installations.",
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
       "PVTS assesses whether you can turn a site assessment into an accurate solar proposal. Shading is the loss of sunlight from trees, buildings, or other obstructions. A production estimate uses those conditions, system orientation, equipment, and weather data to estimate the electricity a system will generate; it is not a guaranteed output.\n\nSizing means selecting system capacity for the site and customer’s electricity use. Modules produce DC (direct current), and the inverter converts it to AC (alternating current) for the building or grid. A proposal needs to distinguish those equipment ratings and explain interconnection, the utility’s approval and technical process for connecting the system to its network.",
     whyItMatters:
       "A salesperson needs to explain the assumptions behind expected savings, not just quote a system price. PVTS covers technical assessment and customer communication as well as sales experience. The credential does not authorize electrical installation work or replace any licensing requirements for selling or contracting in your jurisdiction.",
     requirements: [
      "Qualify through a documented sales-experience category. Category A requires 8 sales credits; Category B requires 4 plus a qualifying degree or license. Credits relate to PV proposals and system sales, not installation crew hours.",
      "The qualifying projects must have been sold within the previous 2 years, with at least half sold and installed. Keep the proposals, contracts, and installation evidence required by NABCEP.",
      "At least 10 hours of Occupational Safety and Health Administration (OSHA) Construction Outreach training, or an accepted equivalent.",
      "58 hours of prescribed PV training, including 40 advanced hours from qualifying providers covering the PVTS Job Task Analysis (JTA), the outline of assessed sales tasks. This includes technical topics and applicable codes such as the NEC (National Electrical Code).",
      "An accepted application, agreement to the NABCEP Code of Ethics, and a passing PVTS exam result; applicants must be at least 18. Installation experience is not the same as the required sales experience."
    ],
     examFormat: {
      "questionCount": "70 multiple-choice questions: 60 scored and 10 unscored pilot questions",
      "duration": "Up to 4 hours",
      "format": "Computer-based at a Meazure Learning test center or through live remote proctoring, administered in English."
    },
     passingScore: {
      "scoreDescription": "A scaled score of 75 out of 99",
      "detail": "NABCEP lists 75 as the PVTS passing threshold. It is a scaled score, not 75% correct, and cannot be used to calculate how many questions you may miss or to rank this exam against other certifications."
    },
     difficulty: {
      "score": 7,
      "rationale": "The exam combines site assessment, system performance, financial assumptions, and customer communication. Sales experience alone may leave gaps in electrical or code knowledge; installation experience alone may leave gaps in proposals and financing. Prepare against the PVTS task outline rather than judging readiness by a different certification’s practice score."
    },
     cost: {
      "trainingCost": "Varies by provider and the qualifying PV training you already hold",
      "applicationFee": "$125, paid to NABCEP",
      "examFee": "$375, paid to NABCEP",
      "totalEstimate": "$500 in NABCEP fees, plus training and any required OSHA 10 course",
      "notes": "The published re-exam fee is $275. Training purchases do not replace the documented sales-experience requirement."
    },
     reimbursement: {
      "available": true,
      "summary": "Sales teams may fund technical training and the PVTS exam as professional development. A reimbursement agreement should distinguish training costs from the application and exam fees.",
      "sources": [
        "Employer sponsorship: ask whether the budget covers technical training, required safety training, and NABCEP fees.",
        "Workforce Innovation and Opportunity Act (WIOA) funding: check the state Eligible Training Provider List (ETPL) and participant eligibility.",
        "Veterans benefits: check current eligibility for training support or exam-fee reimbursement."
      ]
    },
     expirationRenewal: {
      "validityPeriod": "3 years from the date of issuance",
      "renewalRequirement": "30 hours of continuing education: 18 covering the PVTS task outline and 12 on renewable energy, including 2 on building or fire codes. You must also document qualifying industry activity. NABCEP currently lists a $390 recertification fee."
    },
     relatedSalaryPages: [
       { label: 'Solar Sales Rep salary', slug: 'solar-sales' },
       { label: 'Solar PV Installer salary', slug: 'solar-photovoltaic-installer' },
     ],
     format: "Online preparation, with documented sales experience required",
     duration: '58 hours of training',
     priceRange: "$500 in NABCEP fees, plus training",
     whyHeatSpring: [
      "Free instruction on qualifying commercial solar prospects and projects.",
      "A practical sales resource, distinct from a full PVTS exam-preparation course."
    ],
     heatspringFitReason:
       "Qualifying Commercial Solar Leads & Projects focuses on deciding whether a commercial prospect is a workable solar opportunity. This free HeatSpring course is relevant to the early assessment and customer conversations behind a proposal, rather than a substitute for PVTS exam preparation.",
     heatspringUrl:
       "https://www.heatspring.com/courses/qualifying-commercial-solar-leads-projects?aff_id=9f_wlq",
     bannerHeadline: "Assess the opportunity before preparing the proposal.",
     bannerSubtext: "Explore a free commercial solar qualification course on HeatSpring. PVTS has separate eligibility requirements.",
     overviewHeading: "From site conditions to a defensible proposal",
    heatspringHeading: "Qualify a commercial solar opportunity",
    heatspringLimitation: "Completing the course does not earn PVTS certification or replace its training, sales-experience, and exam requirements.",
    heatspringCtaLabel: "Explore the free sales course",
  },
 ]

export function getCertificationBySlug(slug: string) {
  return CERTIFICATIONS.find(c => c.slug === slug)
}
