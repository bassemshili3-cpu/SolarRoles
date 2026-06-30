import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Palette, Clock, GraduationCap, DollarSign, MapPin, CheckCircle, BookOpen, Users, Award, TrendingUp, FileText, Briefcase } from 'lucide-react'
import { getMergedJobCount, searchMergedJobs } from '@/lib/merged-search'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Art Teacher Jobs | School, Studio & Creative Education',
  description:
    'Art teacher positions in public schools, private studios, museums, and after-school programs. Certification requirements and salary ranges noted per state.',
  keywords:
    'art teacher jobs, art teacher positions, art education jobs, art instructor jobs, visual arts teacher, elementary art teacher, high school art teacher, museum art educator, studio art teacher',
  openGraph: {
    title: 'Art Teacher Jobs | Find Creative Teaching Roles Nationwide',
    description:
      'Browse art teacher jobs in schools, studios, and museums. Compare role types, understand certification pathways, and find the positions that match your teaching style.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art Teacher Jobs | Creative Teaching Roles Nationwide',
    description:
      'Search art teacher jobs nationwide and discover what schools and arts organizations really value beyond basic credentials.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/art-teacher-jobs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Art Teacher Jobs',
  description:
    'Find art teacher jobs across the United States in schools, studios, museums, and community education programs.',
  url: 'https://www.oh-my-job.com/art-teacher-jobs',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Art Teacher Jobs',
    description: 'Current job listings for art teachers and art educators nationwide',
  },
}

const artTeacherTypes = [
  {
    title: 'Elementary Art Teacher',
    description:
      'Help younger students build confidence through drawing, color, storytelling, and hands on creative routines that make art feel accessible.',
    icon: Palette,
  },
  {
    title: 'Middle School Art Teacher',
    description:
      'Guide students through technique, experimentation, critique, and personal expression as they begin shaping a stronger visual voice.',
    icon: BookOpen,
  },
  {
    title: 'High School Art Teacher',
    description:
      'Teach advanced studio practice, portfolio development, art analysis, and exhibition ready work for older students preparing for next steps.',
    icon: GraduationCap,
  },
  {
    title: 'Substitute Art Teacher',
    description:
      'Step into existing classrooms, maintain continuity, and keep students engaged while adapting quickly to school expectations and lesson plans.',
    icon: Users,
  },
  {
    title: 'Private Art Instructor',
    description:
      'Teach individuals or small groups in studios, after school programs, or private sessions with more flexibility in pace and artistic focus.',
    icon: Award,
  },
  {
    title: 'Museum Art Educator',
    description:
      'Design gallery experiences, workshops, and public programs that connect observation, discussion, and making in cultural spaces.',
    icon: Briefcase,
  },
]

const certificationSteps = [
  {
    step: 'Build Strong Subject Knowledge',
    detail:
      'Most art teacher jobs in public education start with a bachelor’s degree in art education, fine arts, studio art, or a closely related subject.',
  },
  {
    step: 'Gain Real Classroom Experience',
    detail:
      'Student teaching and supervised classroom work matter because employers want proof that you can lead instruction, manage materials, and support different learners.',
  },
  {
    step: 'Meet State Certification Rules',
    detail:
      'Public school art teacher jobs usually require a state license or certification, and the exact process varies depending on where you want to teach.',
  },
  {
    step: 'Prepare a Teaching Portfolio',
    detail:
      'One important hiring gap many candidates overlook is the portfolio. Schools often respond well to sample lessons, student work, assessment ideas, and evidence of classroom exhibitions.',
  },
  {
    step: 'Keep Your Practice Current',
    detail:
      'Strong art educators continue developing through new media, updated standards, digital tools, and professional learning that keeps instruction relevant.',
  },
]

const salaryData = [
  {
    level: 'Elementary School Based Roles',
    range: '$52,000 to $68,000',
    context: 'Often shaped by district salary schedules, location, and years of experience',
  },
  {
    level: 'Middle and High School Roles',
    range: '$55,000 to $72,000',
    context: 'Can increase with advanced credentials, larger districts, or added responsibilities',
  },
  {
    level: 'Private School and Studio Roles',
    range: '$40,000 to $65,000',
    context: 'Compensation varies more widely depending on employer type and teaching load',
  },
  {
    level: 'Museum and Specialized Education Roles',
    range: '$45,000 to $70,000+',
    context: 'Depends on institution size, program scope, and public engagement responsibilities',
  },
]

const keySkills = [
  {
    skill: 'Portfolio Led Instruction',
    description:
      'Strong art teachers know how to help students build work over time, reflect on progress, and present meaningful evidence of growth.',
  },
  {
    skill: 'Critique and Feedback',
    description:
      'Effective visual arts teaching depends on thoughtful critique, specific guidance, and classroom language that helps students discuss art with confidence.',
  },
  {
    skill: 'Studio Organization',
    description:
      'Art teacher jobs require control of materials, setup, cleanup, storage, pacing, and safety across multiple classes and projects.',
  },
  {
    skill: 'Lesson Design with Purpose',
    description:
      'Schools value teachers who can turn standards into memorable projects instead of delivering disconnected activities.',
  },
  {
    skill: 'Digital Art Readiness',
    description:
      'More employers now value teachers who are comfortable with digital drawing, design tools, documentation, and blended creative workflows.',
  },
  {
    skill: 'Assessment That Fits Creative Work',
    description:
      'Good art educators know how to assess process, revision, originality, craft, and presentation without flattening student expression.',
  },
]

const faqs = [
  {
    question: 'What qualifications do I need for art teacher jobs?',
    answer:
      'Most public school art teacher jobs require at least a bachelor’s degree and a valid state teaching license or certification. The exact path depends on the state, the age group you want to teach, and whether the role is in public education, private education, or another creative learning setting.',
  },
  {
    question: 'What helps candidates stand out in art teacher jobs?',
    answer:
      'A strong application usually goes beyond credentials. Hiring teams often respond to candidates who show a teaching portfolio, strong lesson ideas, examples of student work, exhibition experience, and the ability to balance creativity with structure.',
  },
  {
    question: 'Can I qualify for art teacher jobs with a fine arts degree?',
    answer:
      'In many cases, yes. Some candidates begin with a fine arts or studio art background and then complete the certification route required in their state. This varies by employer and by education system.',
  },
  {
    question: 'How much do art teacher jobs usually pay?',
    answer:
      'Pay depends on location, school type, experience, and grade level. Public school roles often follow district salary schedules, while private, museum, studio, and community education roles can vary more significantly.',
  },
  {
    question: 'Are art teacher jobs only found in schools?',
    answer:
      'No. Art teacher jobs also appear in museums, galleries, community arts programs, camps, private studios, online education, and nonprofit organizations focused on creative learning.',
  },
  {
    question: 'Do employers care about digital art skills?',
    answer:
      'Increasingly, yes. Traditional studio skills remain important, but many schools and creative organizations now value teachers who can also work with digital tools, visual communication platforms, and contemporary creative processes.',
  },
]

const topStates = [
  {
    state: 'California',
    detail:
      'Large school systems, diverse arts ecosystems, and strong demand across public education, private schools, and museum based programs.',
  },
  {
    state: 'Texas',
    detail:
      'Frequent openings in expanding districts, with opportunities across traditional schools and community based creative programs.',
  },
  {
    state: 'New York',
    detail:
      'A strong market for art teacher jobs thanks to dense school networks, cultural institutions, and a wide range of arts education environments.',
  },
  {
    state: 'Florida',
    detail:
      'Steady hiring in growing districts and a broad mix of school, camp, and community arts teaching opportunities.',
  },
  {
    state: 'Illinois',
    detail:
      'Consistent demand in urban and suburban districts, with additional opportunities in cultural and nonprofit education spaces.',
  },
  {
    state: 'Pennsylvania',
    detail:
      'Balanced opportunities across district schools, independent schools, museums, and regional arts education programs.',
  },
]

export default async function ArtTeacherJobsPage({ searchParams }: any) {
  const params = await searchParams

    const [{ count }, initialData] = await Promise.all([
    getMergedJobCount({ what: params.what || 'Art Teacher', where: params.where || '' }),
    searchMergedJobs({ what: params.what || 'Art Teacher', where: params.where || '', results_per_page: 30, salary_min: params.salary_min ? Number(params.salary_min) : undefined }),
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


            <AIJobMatcherWrapper />

            <Suspense fallback={<div className="animate-pulse bg-gray-100 rounded-lg h-96" />}>
              <InfiniteJobList
                what={params.what || 'art teacher'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData}
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
            Art teacher jobs do not all lead to the same classroom experience. Some focus on early creative discovery, others on advanced portfolio work, and others on public programs, workshops, or community engagement. Understanding the teaching setting is often just as important as understanding the job title.
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
            Most pages about art teacher jobs stop at certification basics. The bigger hiring reality is that schools want more than eligibility. They want evidence that you can teach, assess creative growth, organize a studio environment, and turn student work into visible outcomes such as displays, exhibitions, and portfolio development.
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
            Note: Public school requirements vary by state, while private and community based roles may follow different hiring standards.
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
              Art teacher jobs are paid differently depending on employer type, grade level, and location. Public school positions often follow district pay schedules, while private schools, studios, museums, and community organizations may set compensation more independently. That means salary comparisons make more sense when you first compare the setting, not just the title.
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
              Actual pay can shift based on district contracts, years of experience, graduate credits, leadership duties, and the structure of the role.
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
            Strong art teacher jobs applications show more than artistic ability. The best candidates demonstrate that they can balance creativity with structure, manage a working studio, support reflection, and help students build confidence through both process and presentation.
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
            A useful angle often missed on competing pages is that art teacher jobs are shaped not only by school hiring, but also by the strength of a state’s wider arts ecosystem. Places with large districts, active cultural institutions, and community arts infrastructure often create more varied opportunities for visual arts educators.
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Strong Art Programs Expect From Teachers</h2>
              <p className="text-gray-700 mb-4">
                Art teacher jobs increasingly reward educators who can do more than deliver isolated projects. Strong programs look for teachers who can guide creating, presenting, discussion, and connection to culture, identity, and other subjects. That broader teaching vision is one of the clearest differences between a basic application and a memorable one.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Creating</h3>
                  <p className="text-gray-600 text-sm">Helping students generate ideas, experiment with materials, revise work, and build confidence through making.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Presenting</h3>
                  <p className="text-gray-600 text-sm">Teaching students how to prepare, curate, display, and talk about artwork in ways that give their work meaning.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Responding</h3>
                  <p className="text-gray-600 text-sm">Developing thoughtful critique, observation, and interpretation so students learn to analyze visual language with confidence.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Connecting</h3>
                  <p className="text-gray-600 text-sm">Linking visual arts to history, culture, identity, community, and real world learning rather than teaching art in isolation.</p>
                </div>
              </div>
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
              Art teacher jobs are best understood as a steady opportunity market rather than a trend driven rush. Schools, museums, studios, and community programs continue hiring because educators retire, move, expand programming, or reshape how arts learning is delivered. The strongest edge for applicants is often not just meeting requirements, but showing clear teaching identity, flexibility, and visible student outcomes.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">Portfolio Value</p>
                <p className="text-sm text-gray-600">Candidates who show how they teach often stand out more than those who only list credentials</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">Digital Readiness</p>
                <p className="text-sm text-gray-600">More employers value teachers who can bridge traditional studio practice with digital creative tools</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-teal-600 mb-2">Broader Settings</p>
                <p className="text-sm text-gray-600">Growth in museums, nonprofits, camps, and community programs expands the field beyond standard school jobs</p>
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
            <strong>Disclaimer:</strong> The information provided on this page is for general informational purposes only and does not constitute professional or legal advice. Teaching certification requirements, salary figures, and employment regulations vary by state and school district. Job seekers should verify all position requirements directly with the hiring institution before applying.
          </p>
        </section>
      </div>
    </>
  )
}