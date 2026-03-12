import { Suspense } from 'react'
import { Metadata } from 'next'
import InfiniteJobList from '@/components/InfiniteJobList'
import JobFilters from '@/components/JobFilters'
import AIJobMatcherWrapper from '@/components/AIJobMatcherWrapper'
import { Briefcase, Clock, Car, DollarSign, MapPin, CheckCircle, Users, Award, Building, Star, HelpCircle, TrendingUp, Coffee, Smile, Zap } from 'lucide-react'
import { searchJobs, getCachedJobCount } from '@/lib/adzuna'

export const metadata: Metadata = {
  title: 'Now Hiring Sonic Careers | Urgent Need Across the U.S.',
  description: 'Discover 500+ Sonic Drive-In careers hiring immediately near you. Carhops, cooks, and managers needed. Flexible schedules, tips for carhops, and fun work environment. Apply in minutes!',
  keywords: 'sonic careers, sonic drive-in jobs, sonic hiring, work at sonic, sonic carhop jobs, sonic crew member, sonic manager jobs, sonic application',
  openGraph: {
    title: 'Sonic Careers | Immediate Openings Available',
    description: 'Join the Sonic Drive-In team today. Flexible hours, competitive pay plus tips, and a unique work environment. Hundreds of positions available now!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sonic Careers | Now Hiring',
    description: 'Ready for a fun, fast paced job? Find Sonic Drive-In careers near you. Carhops earn tips, flexible schedules, and great team atmosphere.',
  },
  alternates: {
    canonical: 'https://www.oh-my-job.com/sonic-careers',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Sonic Careers',
  description: 'Find Sonic Drive-In careers and job opportunities across the United States. Browse current openings for carhops, crew members, cooks, and management positions.',
  url: 'https://www.oh-my-job.com/sonic-careers',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Available Sonic Careers',
    description: 'Current job listings at Sonic Drive-In locations nationwide',
  },
}

const jobTypes = [
  { title: 'Carhop', description: 'Deliver orders to guests in their vehicles, provide excellent customer service, and earn tips', icon: Car },
  { title: 'Crew Member', description: 'Prepare food, take orders, maintain cleanliness, and assist with various restaurant tasks', icon: Users },
  { title: 'Cook', description: 'Prepare menu items following Sonic recipes and quality standards in a fast paced kitchen', icon: Coffee },
  { title: 'Skating Carhop', description: 'Deliver orders on roller skates for the classic Sonic experience and extra tips', icon: Zap },
  { title: 'Shift Manager', description: 'Supervise crew members, manage shifts, and ensure smooth daily operations', icon: Star },
  { title: 'Assistant Manager', description: 'Support the general manager with operations, training, and business goals', icon: TrendingUp },
]

const benefits = [
  { benefit: 'Flexible Scheduling', description: 'Work hours that fit your lifestyle, school, or other commitments' },
  { benefit: 'Tips for Carhops', description: 'Carhops can earn tips on top of hourly wages' },
  { benefit: 'Employee Discounts', description: 'Enjoy discounts on Sonic food and drinks during shifts' },
  { benefit: 'Paid Training', description: 'Get paid while learning the job with comprehensive training programs' },
  { benefit: 'Advancement Opportunities', description: 'Grow from crew member to management with clear career paths' },
  { benefit: 'Fun Work Environment', description: 'Join a team focused on providing a unique and enjoyable experience' },
]

const workEnvironment = [
  { feature: 'Drive In Concept', description: 'Sonic\'s unique drive in model means guests stay in their cars while you deliver orders' },
  { feature: 'Outdoor Work', description: 'Carhops spend time outdoors, which many employees enjoy especially in good weather' },
  { feature: 'Fast Paced', description: 'Busy shifts keep the day moving quickly, especially during meal rushes' },
  { feature: 'Team Atmosphere', description: 'Work alongside a team to serve guests efficiently and have fun doing it' },
]

const ageRequirements = [
  { position: 'Crew Member and Carhop', age: '16 years old in most states', notes: 'Some locations may hire at 15 with work permits' },
  { position: 'Cook Positions', age: '16 years old minimum', notes: 'May vary by state due to equipment operation laws' },
  { position: 'Shift Manager', age: '18 years old', notes: 'Leadership roles require adult status' },
  { position: 'Assistant and General Manager', age: '18 years old or older', notes: 'Management experience typically required' },
]

const faqs = [
  {
    question: 'What is the minimum age to work at Sonic?',
    answer: 'According to the U.S. Department of Labor, federal law sets the minimum working age at 14 for non hazardous jobs. Most Sonic locations hire crew members and carhops starting at age 16, though some franchise locations may hire at 15 with proper work permits depending on state laws. Management positions typically require applicants to be at least 18 years old.',
  },
  {
    question: 'Do Sonic carhops make tips?',
    answer: 'Yes, carhops at Sonic can earn tips from guests. Tips are in addition to the hourly wage and can significantly increase total earnings, especially during busy shifts. Some carhops report earning substantial additional income through tips, particularly those who provide excellent service or skate.',
  },
  {
    question: 'Do you have to skate to work at Sonic?',
    answer: 'No, skating is not required to work as a carhop at Sonic. While Sonic is famous for skating carhops, many locations allow carhops to walk. However, carhops who skate often receive higher tips due to the novelty and classic Sonic experience they provide.',
  },
  {
    question: 'What are the typical work hours at Sonic?',
    answer: 'Sonic Drive-In locations typically operate from morning through late night, with many open until midnight or later. Shifts vary by location and position. Part time and full time schedules are available, with flexible hours that can accommodate school schedules, second jobs, or other commitments.',
  },
  {
    question: 'How much does Sonic pay per hour?',
    answer: 'According to the U.S. Bureau of Labor Statistics, fast food workers earn varying wages based on location and position. Sonic pay rates depend on the role, location, and experience. Carhops may earn a lower base wage but supplement income with tips. Many Sonic locations pay above the federal minimum wage of $7.25 per hour, with some paying $10 to $15 or more per hour.',
  },
  {
    question: 'Is Sonic a franchise?',
    answer: 'Yes, most Sonic Drive-In locations are independently owned and operated by franchisees. This means that specific policies, pay rates, benefits, and hiring practices can vary from one location to another. Each franchise owner makes their own employment decisions within Sonic brand guidelines.',
  },
]

const applicationTips = [
  {
    title: 'Apply Online or In Person',
    description: 'Most Sonic locations accept applications online through their website or in person at the restaurant. Applying during slower hours allows managers more time to review your application.',
  },
  {
    title: 'Highlight Customer Service Skills',
    description: 'Sonic values friendly, outgoing personalities. Emphasize any experience working with customers, even from school projects or volunteer work.',
  },
  {
    title: 'Show Flexibility',
    description: 'Being available for various shifts, including evenings and weekends, makes you a more attractive candidate. Sonic needs staff during peak hours.',
  },
  {
    title: 'Dress Appropriately for Interviews',
    description: 'Even for a fast food position, showing up neat and presentable demonstrates professionalism and respect for the opportunity.',
  },
]

const careerGrowth = [
  {
    level: 'Entry Level',
    title: 'Crew Member or Carhop',
    description: 'Start by learning the basics of food preparation, customer service, and Sonic operations.',
  },
  {
    level: 'Intermediate',
    title: 'Trainer or Team Lead',
    description: 'Take on additional responsibilities by training new employees and leading shifts.',
  },
  {
    level: 'Management',
    title: 'Shift Manager',
    description: 'Supervise crew members, handle cash management, and ensure quality during your shifts.',
  },
  {
    level: 'Senior Management',
    title: 'Assistant or General Manager',
    description: 'Oversee entire restaurant operations, manage staff, control costs, and drive business results.',
  },
]

export default async function SonicCareersPage({ searchParams }: any) {
  const params = await searchParams

 const [{ count }, initialData] = await Promise.all([
  getCachedJobCount(params.what || 'sonic', params.where || '', params.salary_min),
  searchJobs({ what: params.what || 'sonic', where: params.where || '', results_per_page: 30, page: 1 }),
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
            Sonic Careers Available Across the United States
          </h1>
        </header>

        {/* Job Board Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-80">
            <JobFilters defaultWhat="sonic" />
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
                what={params.what || 'sonic'}
                where={params.where || ''}
                salary_min={params.salary_min}
                initialData={initialData} // ← ajouter
              />
            </Suspense>
          </div>
        </div>

        {/* About Sonic Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Car className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">About Working at Sonic Drive-In</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Sonic Drive-In is America's largest chain of drive in restaurants, known for its unique carhop service, extensive menu, and iconic roller skating servers. Founded in 1953, Sonic operates over 3,500 locations across 46 states. The company's drive in format creates a distinctive work environment that many employees find enjoyable and different from traditional fast food restaurants.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { stat: '3,500+', label: 'Locations Nationwide' },
              { stat: '46', label: 'States with Sonic' },
              { stat: 'Since 1953', label: 'Serving America' },
              { stat: 'Tips+Wages', label: 'Carhop Earnings' },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-yellow-600 mb-1">{item.stat}</p>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Job Types Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Types of Sonic Careers</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Sonic offers various positions to match different skills and career goals. From entry level crew positions to management roles, there are opportunities for growth within the company. According to the U.S. Bureau of Labor Statistics, the food service industry continues to be one of the largest employers in the country.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobTypes.map((job, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <job.icon className="w-10 h-10 text-yellow-500 mb-4" />
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Benefits of Working at Sonic</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Sonic offers various benefits depending on position and location. As most Sonic locations are franchises, specific benefits may vary. However, common perks across many locations include the following:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-1">{item.benefit}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Work Environment Section */}
        <section className="mt-20 bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Smile className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Sonic Work Environment</h2>
              <p className="text-gray-700 mb-6">
                Working at Sonic is different from traditional fast food restaurants. The drive in format creates a unique atmosphere that many employees enjoy. Here is what makes working at Sonic distinctive:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {workEnvironment.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{item.feature}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Age Requirements Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Age Requirements for Sonic Jobs</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            According to the U.S. Department of Labor, the Fair Labor Standards Act sets the minimum working age at 14 for non hazardous occupations. However, age requirements at Sonic vary by position and state law. Here are the typical age requirements:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {ageRequirements.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 text-lg mb-1">{item.position}</p>
                <p className="text-yellow-600 font-medium mb-2">{item.age}</p>
                <p className="text-gray-600 text-sm">{item.notes}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Note: Age requirements may vary by location and state law. According to the U.S. Department of Labor, minors under 16 face restrictions on work hours and certain job duties.
          </p>
        </section>

        {/* Career Growth Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Career Growth at Sonic</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-4xl">
            Sonic offers clear paths for advancement from entry level positions to management roles. Many Sonic managers started as crew members or carhops. Here is a typical career progression:
          </p>
          <div className="space-y-4">
            {careerGrowth.map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full text-lg flex-shrink-0">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm text-green-600 font-medium">{item.level}</p>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pay Information Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-7 h-7 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sonic Pay and Compensation</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              According to the U.S. Bureau of Labor Statistics, food service workers earn varying wages based on position, location, and experience. Sonic pay rates are set by individual franchise owners and may vary. Carhops have the unique opportunity to earn tips in addition to their base wage.
            </p>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$9 to $13</p>
                <p className="text-sm text-gray-600">Crew Members (hourly)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$7 to $12+Tips</p>
                <p className="text-sm text-gray-600">Carhops (hourly + tips)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$12 to $17</p>
                <p className="text-sm text-gray-600">Shift Managers (hourly)</p>
              </div>
              <div className="bg-white rounded-xl p-5 text-center">
                <p className="text-2xl font-bold text-green-600 mb-2">$35K to $55K</p>
                <p className="text-sm text-gray-600">General Managers (annual)</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Note: Pay rates vary significantly by location and franchise owner. These figures are estimates based on industry data. Carhops who skate often report higher tips. Some states have different minimum wage laws that affect base pay.
            </p>
          </div>
        </section>

        {/* Application Tips Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tips for Applying to Sonic</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {applicationTips.map((tip, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-full text-sm mb-4">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Carhop Tips Section */}
        <section className="mt-20 bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Star className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Maximizing Tips as a Sonic Carhop</h2>
              <p className="text-gray-700 mb-6">
                Carhops at Sonic have the opportunity to earn tips, which can significantly boost their income. Here are strategies that successful carhops use to maximize their earnings:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Service Excellence</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Greet guests with a genuine smile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Double check orders for accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Deliver orders quickly and efficiently</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Extra Mile Tactics</h3>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Learn to skate for higher tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Work peak hours (lunch and dinner rushes)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Remember regular customers and their orders</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Work Hours Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-7 h-7 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sonic Work Schedule and Hours</h2>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
            <p className="text-gray-700 mb-6">
              Sonic Drive-In locations typically operate extended hours, offering various shift options. Many locations are open from early morning until late night, providing flexibility for employees with different scheduling needs.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Shift Options</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Morning shifts (opening to afternoon)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Afternoon shifts (lunch through dinner)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Evening shifts (dinner to close)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Schedule Flexibility</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Part time hours available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Full time positions for more hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Student friendly scheduling</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Peak Hours</h3>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Lunch rush (11 AM to 2 PM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Dinner rush (5 PM to 8 PM)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Late night (varies by location)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions About Sonic Careers</h2>
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
            <strong>Disclaimer:</strong> Oh My Job is not affiliated with, endorsed by, or connected to Sonic Drive-In, Sonic Corp., or Inspire Brands, Inc. Sonic and Sonic Drive-In are registered trademarks of their respective owners. The information provided on this page is for general informational purposes only. Most Sonic locations are independently owned and operated franchises, so pay rates, benefits, hiring practices, and job requirements may vary by location. For the most accurate and current information about employment opportunities, please contact your local Sonic Drive-In directly or visit the official Sonic careers website.
          </p>
        </section>
      </div>
    </>
  )
}