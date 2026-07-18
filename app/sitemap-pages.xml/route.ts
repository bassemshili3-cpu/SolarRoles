// app/sitemap-pages.xml/route.ts

import { NextResponse } from 'next/server'


// ✅ Revalidate hourly instead of being dynamic

export const revalidate = 3600


const BASE_URL = 'https://www.oh-my-job.com'

const LAST_MAJOR_UPDATE = '2026-07-18'


// ── Landing pages SEO prioritaires ──────────────────────────

const priorityLandingPages: string[] = [

  '/jobs-for-14-year-olds',

  '/jobs-for-15-year-olds',

  '/jobs-for-16-year-olds',

  '/fifo-jobs',

]


// ── Landing pages SEO standard ──────────────────────────────

const landingPages: string[] = [

  '/allied-universal-jobs',

  '/cna-jobs',

  '/dental-assistant-jobs',

  '/dignity-health-jobs',

  '/oil-rig-jobs',

  '/pharmacy-technician-jobs',

  '/project-manager-jobs',

  '/armed-security-jobs',

  '/city-of-reno-jobs',

  '/healthcare-administration-jobs',

  '/press-association-jobs',

  '/substitute-teacher-jobs',

  '/ucsd-jobs',

  '/burger-king-corporation-jobs',

  '/ekg-technician-jobs',

  '/engineering-jobs',

  '/executive-assistant-jobs',

  '/heavy-equipment-operator-jobs',

  '/hvac-jobs',

  '/jobs-at-property-management',

  '/live-nation-jobs',

  '/nanny-jobs',

  '/pct-jobs',

  '/barista-jobs',

  '/bartending-jobs',

  '/cintas-company-jobs',

  '/customer-service-jobs',

  '/daycare-jobs',

  '/electrician-jobs',

  '/medical-assistant-jobs',

  '/front-desk-jobs',

  '/part-time-jobs',

  '/planet-fitness-jobs',

  '/welding-jobs',

  '/assisted-reproductive-technology-jobs',

  '/chick-fil-a-careers',

  '/exelon-careers',

  '/housekeeping-jobs-near-you',

  '/honda-careers',

  '/school-nurse-jobs',

  '/paraprofessional-jobs',

  '/sonic-careers',

  '/national-grid-careers',

  '/cardinal-health-careers',

  '/patient-transporter-jobs',

  '/doordash-careers',

  '/art-teacher-jobs',

  '/case-manager-jobs',

  '/evening-jobs',

  '/event-organization-jobs',

  '/entry-level-data-analyst-jobs',

  '/quality-assurance-jobs',

  '/remote-hr-jobs',

  '/respiratory-therapist-jobs',

  '/weekly-paying-jobs',

  '/surgical-tech-jobs',

  '/chase-bank-jobs',

  '/dog-walking-jobs',

  '/emt-jobs',

  '/sales-job',

  '/social-media-supervisor',

  '/weekend-jobs',

  '/talent-acquisition-jobs',

  '/new-grad-nurse-jobs',

  '/language-pathologist-jobs',

  '/school-bus-driver-jobs',

  '/special-education-teacher-jobs',

  '/summer-camp-counselor-jobs',

  '/public-works-commission-jobs',

  '/manufacturing-jobs',

  '/physician-assistant-jobs',

  '/hr-jobs',

  '/preschool-jobs',

  '/local-truck-driving-jobs',

]


const faqArticles: string[] = [

  '/could-you-collect-unemployment-if-you-quit-your-job',

  '/could-someone-get-fired-from-a-job-for-being-sick',

]


const topJobsPages: string[] = [

  '/best-jobs-in-united-states-2026',

  '/best-jobs-without-a-degree-2026',

  '/best-paying-jobs-in-finance-2026',

  '/best-paying-easy-jobs-us',

  '/best-paying-blue-collar-jobs',

  '/best-paying-entry-level-jobs',

  '/best-paying-nursing-jobs-2026',

]


const paycheckPages: string[] = [

  '/paycheck-calculator',

  '/paycheck-calculator/california',

  '/paycheck-calculator/illinois',

  '/paycheck-calculator/ohio',

  '/paycheck-calculator/michigan',

  '/paycheck-calculator/washington',

  '/paycheck-calculator/maryland',

  '/paycheck-calculator/new-york',

  '/paycheck-calculator/virginia',

  '/paycheck-calculator/nevada',

  '/paycheck-calculator/utah',

]


const dataPages: string[] = ['/data']


const dataStatePages: string[] = [

  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',

  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',

  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',

  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',

  'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',

  'new-hampshire', 'new-jersey', 'new-mexico', 'new-york',

  'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon',

  'pennsylvania', 'rhode-island', 'south-carolina', 'south-dakota',

  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',

  'west-virginia', 'wisconsin', 'wyoming',

].map(s => `/data/states/${s}`)


const dataSalaryPages: string[] = [

  'registered-nurse', 'software-engineer', 'data-analyst',

  'project-manager', 'dental-assistant', 'electrician',

  'medical-assistant', 'truck-driver', 'accountant',

  'customer-service', 'sales-associate', 'pharmacy-technician',

].map(s => `/data/salaries/${s}`)


const blogPosts: string[] = [

  '/blog/how-to-quit-a-job',

  '/blog/return-to-office-mandates-backfiring',

  '/blog/the-30-second-rule',

  '/blog/what-six-figures-really-means',

  '/blog/job-interview-questions',

]


export async function GET() {

  const staticEntries: { url: string; priority: number }[] = [

    { url: BASE_URL, priority: 1.0 },

    { url: `${BASE_URL}/jobs`, priority: 0.9 },

    ...priorityLandingPages.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.8 })),

    ...landingPages.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.6 })),

    ...topJobsPages.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.7 })),

    ...paycheckPages.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.7 })),

    ...[...dataPages, ...dataStatePages, ...dataSalaryPages].map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.7 })),

    ...blogPosts.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.5 })),

    ...faqArticles.map((s) => ({ url: `${BASE_URL}${s}`, priority: 0.5 })),

  ]


  const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${staticEntries.map((e) => `  <url><loc>${e.url}</loc><lastmod>${LAST_MAJOR_UPDATE}</lastmod><priority>${e.priority}</priority></url>`).join('\n')}

</urlset>`


  return new NextResponse(xml, {

    headers: {

      'Content-Type': 'application/xml',

      // ✅ Cache for 1 hour, allow stale-while-revalidate for 2 more hours

      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200',

    },

  })

}
