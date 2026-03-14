import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Palette, Clock, GraduationCap, DollarSign, MapPin, CheckCircle, BookOpen, Users, Award, TrendingUp, FileText, Briefcase } from 'lucide-react'
import { searchJobs, getCachedJobCount, AdzunaSearchResult } from '@/lib/adzuna'
import { normalizeAdzuna } from '@/lib/jobs'
export const revalidate = 3600 // Cache ISR 1h — réduit les appels Adzuna
export const metadata: Metadata = {
  title: 'Urgent: Art Teacher Jobs Available Now | Apply Today',
  description: 'Hundreds of art teacher jobs hiring immediately across the United States. Full time, part time and substitute positions in schools and studios. No lengthy process. Browse openings and apply in minutes!',
  keywords: 'art teacher jobs, art teacher positions, art education jobs, art instructor jobs, visual arts teacher, art teacher hiring, elementary art teacher, high school art teacher, art teacher openings',
  openGraph: {
    title: 'Art Teacher Jobs Hiring Now | Immediate Openings Nationwide',
    description: 'Schools and institutions urgently seeking qualified art teachers. Full time, part time and substitute roles available. Find your perfect art education position today!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Teacher Jobs | Urgently Hiring Nationwide',
    description: 'Art teacher positions needed ASAP in schools across America. Browse hundreds of openings, from elementary to high school. Apply now and start inspiring students!',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/art-teacher-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Art Teacher Jobs',
  description: 'Find art teacher jobs hiring across the United States. Browse hundreds of positions in schools, studios, and educational institutions.',
  url: 'https://www.oh-my-job.com/art-teacher-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Art Teacher Jobs',
    description: 'Current job listings for art teachers and art educators nationwide',
  },
}

const artTeacherTypes = [
  { title: 'Elementary Art Teacher', description: 'Introduce young learners to drawing, painting, and creative expression in grades K through 5', icon: Palette },
  { title: 'Middle School Art Teacher', description: 'Guide students through foundational techniques in ceramics, sculpture, and mixed media', icon: BookOpen },
  { title: 'High School Art Teacher', description: 'Teach advanced visual arts courses including AP Studio Art, art history, and portfolio development', icon: GraduationCap },
  { title: 'Substitute Art Teacher', description: 'Fill temporary vacancies in schools and provide continuity in visual arts education programs', icon: Users },
  { title: 'Private Art Instructor', description: 'Offer personalized art lessons in studios, community centers, or through private tutoring sessions', icon: Award },
  { title: 'Museum Art Educator', description: 'Develop and lead educational programs, workshops, and guided tours in museums and galleries', icon: Briefcase },
]

const certificationSteps = [
  { step: 'Earn a Bachelor\'s Degree', detail: 'Complete a degree in art education, fine arts, or a related field from an accredited institution' },
  { step: 'Complete a Teacher Preparation Program', detail: 'Fulfill student teaching requirements and coursework in pedagogy and classroom management' },
  { step: 'Pass Required Examinations', detail: 'Most states require passing the Praxis II Art Content Knowledge exam or a state equivalent' },
  { step: 'Apply for State Licensure', detail: 'Submit your application to the state Department of Education where you plan to teach' },
  { step: 'Maintain Continuing Education', detail: 'Renew your certification through professional development credits as required by your state' },
]

const salaryData = [
  { level: 'Entry Level Art Teacher', range: '$38,000 to $48,000', context: 'Typically 0 to 3 years of experience' },
  { level: 'Mid Career Art Teacher', range: '$48,000 to $62,000', context: 'Typically 4 to 10 years of experience' },
  { level: 'Senior Art Teacher', range: '$62,000 to $80,000+', context: 'Over 10 years of experience or advanced degrees' },
  { level: 'Art Department Head', range: '$65,000 to $90,000+', context: 'Leadership role with administrative responsibilities' },
]

const keySkills = [
  { skill: 'Proficiency in Multiple Art Media', description: 'Competence in drawing, painting, sculpture, printmaking, digital art, and other visual arts disciplines' },
  { skill: 'Curriculum Development', description: 'Ability to design age appropriate lesson plans aligned with state and national visual arts standards' },
  { skill: 'Classroom Management', description: 'Skill in maintaining a productive and safe studio environment with diverse groups of students' },
  { skill: 'Art History Knowledge', description: 'Understanding of major art movements, cultural contexts, and contemporary art practices' },
  { skill: 'Technology Integration', description: 'Experience with digital art tools, graphic design software, and educational technology platforms' },
  { skill: 'Student Assessment', description: 'Ability to evaluate student work using rubrics, portfolios, and constructive critique methods' },
]

const faqs = [
  {
    question: 'What qualifications do I need to become an art teacher in the United States?',
    answer: 'According to the U.S. Department of Education, public school art teachers must hold at least a bachelor\'s degree and a valid state issued teaching certificate or license with an endorsement in visual arts. Requirements vary by state, but most require completion of an accredited teacher preparation program and passing scores on licensure exams such as the Praxis series. Private schools may have different requirements and sometimes hire teachers without state certification.',
  },
  {
    question: 'Is there a demand for art teachers right now?',
    answer: 'Yes. According to the Bureau of Labor Statistics, the employment of kindergarten and elementary school teachers, including art specialists, is projected to remain steady with consistent openings due to retirements and enrollment changes. Many school districts across the country report difficulty filling art education positions, making this a field with strong hiring activity, especially in underserved areas.',
  },
  {
    question: 'Can I teach art with a fine arts degree instead of an education degree?',
    answer: 'In many states, you can teach art with a fine arts degree if you also complete an alternative certification program. According to the National Art Education Association, alternative routes to certification are available in most states and allow individuals with subject matter expertise to earn their teaching credentials while working in the classroom. Some states also offer emergency or temporary licenses for high need areas.',
  },
  {
    question: 'What is the average salary for an art teacher in the United States?',
    answer: 'According to the Bureau of Labor Statistics, the median annual wage for high school teachers, including art teachers, was approximately $65,220 as of the most recent data. Salaries vary significantly based on geographic location, school district, level of education, and years of experience. Teachers in states such as New York, California, and Massachusetts tend to earn higher salaries.',
  },
  {
    question: 'Do art teachers work during the summer?',
    answer: 'Most public school art teachers follow the academic calendar and do not work during summer months, though they are typically paid on a 12 month schedule. However, many art teachers choose to supplement their income by teaching summer art camps, offering private lessons, working at community arts programs, or pursuing their own artistic practice during the break.',
  },
]

const topStates = [
  { state: 'California', detail: 'High demand in urban districts, competitive salaries above $70,000 on average' },
  { state: 'Texas', detail: 'Rapidly growing school districts with frequent art teacher openings' },
  { state: 'New York', detail: 'Among the highest paying states for art educators, especially in NYC metro area' },
  { state: 'Florida', detail: 'Expanding school populations creating steady demand for visual arts teachers' },
  { state: 'Illinois', detail: 'Strong union support and well funded arts programs in many districts' },
  { state: 'Pennsylvania', detail: 'Consistent openings across suburban and rural school districts' },
]

export default async function ArtTeacherJobsPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'Art Teacher', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'Art Teacher', where: params.where || '', results_per_page: 30, page: 1 })
  .then((data: AdzunaSearchResult) => ({ ...data, results: data.results.map(normalizeAdzuna) })),
])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Simple Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Art Teacher Jobs Available Now Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="art teacher" />
          </aside>
          <div className="flex-1">

            {count > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> positions available
              </p>
            )}

            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'art teacher'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* Types of Art Teacher Positions */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Art Teacher Positions</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Art education careers span a wide range of settings and student populations. Whether you prefer working with young children discovering creativity for the first time or guiding advanced students toward portfolio development, there is a role that fits your expertise and passion.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artTeacherTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-purple-600 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certification Pathway */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">How to Become a Certified Art Teacher</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Education, all public school teachers must meet state certification requirements. The National Art Education Association (NAEA) recommends the following pathway for aspiring art educators seeking licensure in the United States.
          </p>
          <div className="space-y-4">
            {certificationSteps.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">{item.step}</p>
                  <p className="text-gray-600 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Source: U.S. Department of Education and the National Art Education Association (NAEA)
          </p>
        </section>

        {/* Salary Information */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Art Teacher Salary Overview</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics (BLS), teacher salaries vary based on education level, experience, geographic location, and school district. Art teachers in public schools typically receive the same salary schedule as other certified teachers within their district.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {salaryData.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-1">{item.level}</p>
                  <p className="text-2xl font-bold text-green-600 mb-1">{item.range}</p>
                  <p className="text-gray-500 text-sm">{item.context}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Source: U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics. Figures are approximate and vary by state and district.
            </p>
          </div>
        </section>

        {/* Key Skills */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Essential Skills for Art Teachers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Successful art teachers combine artistic talent with strong educational skills. According to the National Art Education Association, the following competencies are essential for effective visual arts instruction in today's classrooms.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keySkills.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-colors">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.skill}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Hiring States */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-7 h-7 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top States Hiring Art Teachers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the Bureau of Labor Statistics, certain states employ significantly more teachers and offer higher average salaries. The following states consistently show the highest volume of art teacher openings based on school enrollment figures and district hiring reports.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topStates.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <p className="font-semibold text-gray-900">{item.state}</p>
                </div>
                <p className="text-gray-600 text-sm">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* National Standards Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">National Visual Arts Standards</h2>
              <p className="text-gray-700 mb-4">
                According to the National Coalition for Core Arts Standards (NCCAS), art teachers in the United States are expected to align their instruction with the National Core Arts Standards. These standards were developed to guide quality arts education and are organized around four artistic processes.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Creating</h3>
                  <p className="text-gray-600 text-sm">Generating and conceptualizing artistic ideas and work through exploration, experimentation, and revision of original artworks.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Presenting</h3>
                  <p className="text-gray-600 text-sm">Selecting, analyzing, and interpreting artistic work for presentation, including curating student exhibitions and public displays.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Responding</h3>
                  <p className="text-gray-600 text-sm">Understanding and evaluating how the arts convey meaning, including critical analysis of artworks from diverse cultures and periods.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Connecting</h3>
                  <p className="text-gray-600 text-sm">Relating artistic ideas and work with personal meaning and external context, linking the visual arts to other subjects and real world applications.</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Source: National Coalition for Core Arts Standards (NCCAS), nationalartsstandards.org
              </p>
            </div>
          </div>
        </section>

        {/* Job Market Trends */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-teal-600" />
            <h2 className="text-2xl font-bold text-gray-900">Art Teacher Job Market Outlook</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the Bureau of Labor Statistics, employment for teachers is expected to remain stable over the coming decade. Several factors are driving demand for art educators specifically, as school districts and policymakers increasingly recognize the importance of arts education in student development.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">STEM to STEAM</p>
                <p className="text-sm text-gray-600">Growing integration of arts into STEM curricula is creating new art teacher positions nationwide</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">Retirements</p>
                <p className="text-sm text-gray-600">A large wave of experienced teachers reaching retirement age is opening thousands of positions</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">Federal Funding</p>
                <p className="text-sm text-gray-600">Increased federal and state investment in arts education programs is expanding hiring budgets</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Art Teacher Jobs</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-500 max-w-4xl">
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional or legal advice. Teaching certification requirements, salary figures, and employment regulations vary by state and school district. Always consult your state Department of Education and the U.S. Bureau of Labor Statistics at bls.gov for the most current and applicable information. Job seekers should verify all position requirements directly with the hiring institution before applying.
          </p>
        </section>
      </div>
    </>
  )
}