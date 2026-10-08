import * as cheerio from 'cheerio'
import {inspectRawContentExclusion} from './rawContentExclusions.mjs'

const clean = text => String(text ?? '').replace(/\s+/g, ' ').trim()
const detailRoute = /(?:job[_-]?(?:detail|description|posting|search)|CandExpJobDetails|PublicJobPosting|AR_job_details|\/job\/detail|positiondetail|Hotjobs_Apply_VF|cga__JobDetails)/i
const recruitmentRoute = /(?:jobboard|job[_-]?(?:detail|description|posting|search)|jobapplication|jobregister|CandidateExperience|CareerPortal|\/careers?(?:\/|$)|\/candidates(?:\/|$)|\/recruit(?:ers)?(?:\/|$)|\/hrapp\/|hotjobs|currentopenings|advertisedpositions|resumesubmission|candidateregistration|positionexponential|Recruitment_PublicForm)/i

/** Visible content and local workflow evidence, never a host or URL hint alone. */
export function inspectRecruitmentWorkflow(original, html) {
  const url = new URL(original), $ = cheerio.load(html)
  const title = clean($('title').first().text())
  const headings = clean($('h1,h2').map((_, e) => $(e).text()).get().join(' '))
  const fields = $('input,select,textarea').map((_, e) => [$(e).attr('name'), $(e).attr('id'), $(e).attr('type')].filter(Boolean).join(' ')).get()
  const links = []
  $('a[href],form[action]').each((_, e) => {
    try {
      let href = $(e).attr('href') ?? $(e).attr('action')
      href = href.replace(/^https?:\/\/web\.archive\.org\/web\/\d{14}[^/]*\//, '')
      const target = new URL(href, original)
      if (['http:', 'https:'].includes(target.protocol) && target.hostname === url.hostname)
        links.push({ url: target.href, text: clean($(e).text()).slice(0, 120) })
    } catch {}
  })
  const postings = []
  const walk = value => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) { value.forEach(walk); return }
    if ([value['@type']].flat().some(type => /(?:^|\/)JobPosting$/i.test(String(type)))) postings.push(value)
    for (const child of Object.values(value)) if (child && typeof child === 'object') walk(child)
  }
  $('script[type="application/ld+json"]').each((_, e) => { try { walk(JSON.parse($(e).text())) } catch {} })
  const scripts = $('script:not([src])').map((_, e) => $(e).text()).get().join('\n')
  const jobTables=$('table').map((_,table)=>({text:clean($(table).text()),rows:$(table).find('tr').length})).get()
  $('script,style,noscript,svg,template,nav,footer,header').remove()
  const text = clean($('body').text()), lead = clean(title + ' ' + headings + ' ' + text.slice(0, 900))
  const route = url.pathname // query values may merely point at external job URLs
  const evidence = [], match = (name, regex, source = text) => {
    const m = regex.exec(source)
    if (m) evidence.push({ name, excerpt: source.slice(Math.max(0, m.index - 70), m.index + 210) })
    return Boolean(m)
  }
  let nonRecruitment = null
  const exclusions = [
    ['volunteering', /\b(?:volunteer (?:application|program|opportunit)|voluntary work|volunteering opportunities|Volunteer Programs|Member & Volunteer)\b/i],
    ['education', /(?:Course Detail|MBA.*(?:application|program|pre-assessment|advisor|students)|admission(?:s)?(?: \|\|)?|student application|scholarship|academic programme|college.*application|university.*application|professional fitness trainer|Pilates.Instructor|continuing education|Executive Education|Program Registration|nomination.*course)/i],
    ['grant_or_prize', /(?:grant (?:application|contact|scheme)|apply for a grant|relief fund|sustainability prize|fund for children|funding application|innovation award|Bakken Invitation)/i],
    ['event', /(?:event (?:registration|tickets)|conference registration|campaign registration|register.*summit|vendor registration|GuestEventPage|registration.*forum|events? calendar|Interested in Attending.*(?:Congress|Conference)|Sponsor Speaker Delegate|When:.*Where:)/i],
    ['membership', /(?:membership application|member type|become a member|membership registration)/i],
    ['financial_application', /(?:insurance application|application for insurance|loan.*application|personal loan|capital funding|financial hardship|online assistance|eligible for food assistance)/i],
    ['permit_or_claim', /(?:film permit|dealer licen[cs]e|unpaid wage claim|petition to reopen|reasonable accommodation request|inverter application|data request application)/i],
    ['partner_or_customer', /(?:partner (?:application|registration)|supplier registration|become a partner|customer.*(?:registration|self-registration)|community (?:account registration|self-registration)|request access to|community ticket donation|join expedia local expert)/i],
    ['business_directory', /(?:ABOUT ISCA DIRECTORY|ISCA DIRECTORY features|Directory Detail.*Business Services|Executive Contact.*Classifications.*Audit and Assurance)/i],
    ['newsletter', /(?:subscribe to|email preferences|subscriptions and publications|subscriber details|newsletter|campaign registration)/i],
  ]
  for (const [category, regex] of exclusions) if (regex.test(lead)) {
    nonRecruitment = category; match('explicit_non_recruitment_' + category, regex, lead); break
  }
  // Specific page purpose takes precedence over recruitment words in menus or
  // attendee biographies. Require both a route and visible subject for these.
  if (!nonRecruitment) {
    const purposeRules = [
      ['education', /(?:CourseList|CourseDetail|course|application\/MA_|ProgramApplication|ProgramRegistration)/i, /(?:Course List|CPE Training|Executive Education|MBA|this course|course registration)/i],
      ['volunteering', /OpportunityDetail/i, /(?:volunteer|voluntary organisation|volunteering)/i],
      ['event', /(?:Event|registerproject|register|ems)/i, /(?:Event Pass Information|event organizer|Tickets|conference|STEAM Day|special event|upcoming events)/i],
      ['newsletter', /(?:subscribe|subscription|Update|form)/i, /(?:Subscribe|receive email updates|Get updates from|mailing list|industry Enews)/i],
      ['support', /(?:HelpPortal|Help|support|Article|calypso_useful_info)/i, /(?:FAQ|support|Help & How.to|Incident Management Process|margin rules)/i],
      ['authentication', /(?:Password|AccountRegistration|Registration|SelfReg|Login)/i, /(?:Forgot Password|forgot your password|create an account.*reseller or customer|Customer Care Center|new user form.*access case|current customer|new to the community)/i],
      ['legal', /privacy/i, /Privacy Policy/i],
      ['membership', /(?:Membership|ApplicationForm)/i, /(?:Membership dues|Membership Category|Membership type)/i],
      ['permit_or_claim', /(?:Claim|Request|form)/i, /(?:Minimum Wage Claim|Claim Number.*Date of Injury)/i],
      ['grant_or_prize', /(?:forms|Application|Online|policefund|relief)/i, /(?:grant|GRANT FUNDS|charities programme|Relief Program)/i],
      ['donation', /donate/i, /Donation_Option|donation|Membership Level/i],
      ['partner_or_customer', /(?:Registration|Register|join|partner)/i, /(?:UNITY PARTNER|Network Operator Registration|partner program|supplier|reseller or customer)/i],
      ['financial_application', /(?:loan|join|online)/i, /(?:formalize a loan|taking out the loan|Prior Insurance|insurance application)/i],
      ['commerce', /service|cycle2work|news/i, /(?:Rent From:.*Beds|Sort by: Date Beds Price|Halfords.*cycle|Cycle2Work)/i],
    ]
    for (const [purpose, routeTest, contentTest] of purposeRules)
      if (routeTest.test(route) && contentTest.test(title+' '+text)) {
        nonRecruitment=purpose;match('explicit_non_recruitment_'+purpose,contentTest,title+' '+text);break
      }
  }
  if(!nonRecruitment){
    const specificPurposes=[
      ['education', /^(?:Package|Course)|CPE Learning Combo|Principles and Practice of Clinical Research|Charter School Policies|STEAM Day/i, title+' '+text.slice(0,900)],
      ['event', /^WBCSD Events|Bruegel Annual Meetings|Event Pass Information/i, title+' '+text.slice(0,900)],
      ['commerce', /(?:Cycle2Work|scheme you can save at least.*cost of a.*bike|Buy Online is not currently available|Get a Quotation)/i, title+' '+text.slice(0,1300)],
      ['recruitment_newsletter', /Sign up to learn about.*career opportunities.*resume tips/i, text.slice(0,900)],
      ['grant_or_prize', /Live Venue Relief Program|Google for Startups Immersion|Maddie's Lifesaving Academy/i, title+' '+text.slice(0,900)],
      ['employee_onboarding', /^New Starter Information Form/i, text],
      ['resource', /^(?:I.T.'s Transparent.*Project Dashboard)|Current Criteria Versions For All.*Accreditation Programs|EEC Coronavirus Update/i, text.slice(0,900)],
      ['financial_application', /Prior Claims Prior Insurance Limits and Deductibles/i, text.slice(0,900)],
      ['business_directory', /^ISCA Directory.*ACCOUNTING FIRMS BY BUSINESS SERVICES/i, text.slice(0,1400)],
      ['resource', /^Charter Schools:.*This resource contains information/i, text.slice(0,900)],
      ['partner_or_customer', /^New TPI Request.*EDI Data Exchange Trading Partner/i, text.slice(0,1000)],
      ['event', /generate badges and participant lists/i, text.slice(0,800)],
      ['permit_or_claim', /^EPST.*Retaliation Claim|^.*CLAIMANT INFORMATION.*claim/i, text.slice(0,900)],
      ['education', /Which programme are you interested in.*Teachers and middle leaders|phone number of primary contact the day of tour/i, text.slice(0,1300)],
    ]
    for(const [purpose,regex,subject]of specificPurposes)if(regex.test(subject)){
      nonRecruitment=purpose;match('explicit_non_recruitment_'+purpose,regex,subject);break
    }
  }
  const localJobLinks = [...new Set(links.filter(l => detailRoute.test(new URL(l.url).pathname)
    && /(?:jobid|reqid|id|job_code|jobNumber)=/i.test(new URL(l.url).search)).map(l => l.url))]
  const localRecruitingLinks = links.filter(l => recruitmentRoute.test(new URL(l.url).pathname))
  const jobFields = match('job_record_fields', /(?:Job\s*(?:I\.?D|Number)\s*[:：]|Requisition\s*(?:ID|Number)|Job ID:JOB|Job Id Job Title)/i)
  const jobTitle = match('job_title_field', /(?:Job\s*Title\s*[:：]|Position\s*(?:Title|Name|Detail)|募集要項|職務内容|Job Description)/i)
  const description = match('job_description_body', /(?:job description|responsibilities|qualifications|requirements|experience:|experience required|years (?:of )?experience|employment type|full.time|part.time|salary|compensation|roles and responsibilities|職務内容|応募資格)/i)
  const apply = match('job_application_workflow', /(?:apply (?:now|for (?:this|the) (?:job|position))|quick apply|sign in\s*&\s*apply|job application|application (?:form )?for employment|you are applying for (?:the|a)|position applying for|fill out the form below to apply)/i)
  const resume = match('resume_or_cv', /(?:upload (?:your )?(?:resume|resum[eé]|cv)|resume (?:submission|upload)|\bCV\b|\bResume\b|resumé)/i)
  const candidateFields = /(?:resume|curriculum|candidate|applicant|employment|work.?history)/i.test(fields.join(' '))
  const recruitmentIntro = match('explicit_recruitment_intent', /(?:job application|application for employment|job opportunities|available jobs|current vacancies|current openings|open positions|search (?:for )?jobs|job search|job board|career opportunities|welcome to.*recruitment|position applying for|interested in a position|meaningful employment|Job Listing|募集要項)/i, lead)
  const jobRoute = recruitmentRoute.test(route)
  const expired = match('closed_job', /(?:this (?:job|position) is (?:no longer|not currently)|position is no longer accepting applications|vacature is niet meer open|no open positions)/i)
  const structuredJob = postings.some(p => p.title && p.description && p.hiringOrganization?.name)
  // A benefits paragraph can mention loans, education or volunteering in a job.
  // Positive job-record evidence takes precedence over broad purpose keywords.
  if(structuredJob || jobFields && description && (apply || jobTitle)) nonRecruitment=null
  const contentExclusion=inspectRawContentExclusion(original,html)
  if(contentExclusion){nonRecruitment=contentExclusion.signature;evidence.push({name:'audited_non_job_content_signature',...contentExclusion})}
  let kind = null
  if (!nonRecruitment && structuredJob) { kind = 'structured_job'; evidence.push({ name: 'structured_job_with_employer' }) }
  else if (!nonRecruitment && text.length >= 350 && jobRoute && jobTitle && description
    && (jobFields || apply || /\/recruit\/.*\/job\/detail/i.test(route))) kind = 'job_detail'
  else if (!nonRecruitment && text.length >= 350 && jobRoute && jobFields && description
    && (apply || recruitmentIntro || jobTitle)) kind = 'job_detail'
  else if (!nonRecruitment && text.length >= 150 && resume && (candidateFields || /type=["']file/i.test(html))
    && (apply && (jobRoute || recruitmentIntro) || recruitmentIntro && localRecruitingLinks.length)) kind = 'candidate_application'
  else if (!nonRecruitment && jobRoute && /Jobregister/i.test(route) && /[?&]JobId=/i.test(url.search)
    && /Your Selected Job/i.test(text) && /Personal Information/i.test(text)
    && fields.length >= 3 && localRecruitingLinks.length) kind = 'candidate_registration'
  else if (!nonRecruitment && text.length >= 180 && localJobLinks.length >= 2
    && (recruitmentIntro || jobFields || /(?:careers|hiring|jobs|openings)/i.test(title))) kind = 'job_board'
  else if (!nonRecruitment && jobRoute && recruitmentIntro && description && text.length >= 350
    && (localJobLinks.length || /(?:Requisition Name|Employee Type|Posted From.*Posted To|Job titleDepartmentLocation)/i.test(text))) kind = 'job_board'
  else if (!nonRecruitment && jobRoute && jobFields && jobTitle && text.length >= 700) kind = 'job_detail'
  else if (!nonRecruitment && jobRoute && expired && localRecruitingLinks.length) kind = 'expired_job'
  else if (!nonRecruitment && text.length >= 350 && jobTitle && description
    && localJobLinks.length && /(?:Job ID|Job I.D|Job Number|Job Type|Salary Range|Employment Type|Hiring Company)/i.test(text)) kind = 'job_detail'
  else if (!nonRecruitment && text.length >= 350 && resume && (candidateFields || $('input[type="file"]').length)
    && /(?:What role are you applying for|Employment Type.*Expected (?:Salary|Day Rate)|looking for job change|job seeker with|employment history)/i.test(text)
    && fields.length >= 4) kind = 'candidate_application'
  else if (!nonRecruitment && text.length >= 350 && localRecruitingLinks.length >= 3
    && /(?:Job applicants|active job openings|Current vacancies)/i.test(text)
    && /(?:Location:|Job titleDepartmentLocation|responsibilities|requirements)/i.test(text)) kind = 'job_board'
  else if (!nonRecruitment && jobRoute && /Status of Advertised Positions/i.test(title+' '+text)
    && /Requisition.*Department.*Posted From.*Posted To.*Status/i.test(text) && text.length >= 350) kind = 'job_board'
  else if (!nonRecruitment && description && text.length >= 700 && jobRoute
    && /[?&](?:jobid|id)=/i.test(url.search) && localRecruitingLinks.length
    && /(?:Employment Type:.*Experience:|Experience:.*Employment Type:|Position Name.*Job Type.*Job Description)/i.test(text)) kind='job_detail'
  else if (!nonRecruitment && text.length >= 350 && jobTables.some(t=>t.rows>=3
    && /(?:Job Id Job Title.*vacancies Date of Posting|Job Title Office State Country Details)/i.test(t.text))) {
    kind='job_board';evidence.push({name:'populated_job_table',excerpt:text.slice(0,300)})
  }
  else if(!nonRecruitment && text.length>=400 && jobRoute && jobTitle && jobFields
    && localRecruitingLinks.length && /(?:Candidates must|Candidates should|degree|experience|seeking)/i.test(text)) kind='job_detail'
  else if(!nonRecruitment && text.length>=500 && fields.length>=5
    && /(?:WORK HISTORY|Professional Work Reference|Employment Referee)/i.test(text)
    && /(?:job applicant|job application|application for (?:employment|work)|offer of employment)/i.test(text)
    && /(?:applying for (?:this position|the position)|What role are you applying for|Professional Live.in Carer)/i.test(text)) kind='candidate_application'
  else if(!nonRecruitment && text.length>=500 && jobRoute && recruitmentIntro
    && jobTables.some(t=>t.rows>=3 && /Date Posted.*Postion.*Summary/i.test(t.text))) kind='job_board'
  else if(!nonRecruitment && jobRoute && text.length>=600 && apply && description
    && (text.match(/\bLocation:/g)?.length??0)>=2) kind='job_board'
  else if(!nonRecruitment && /\/JobPost\/JobPosting_Page|\/jobs\/Job_Submission/i.test(route)
    && fields.length>=5 && /(?:Job Description|job will be added to our dashboard)/i.test(text)
    && /(?:Salary Range|Hiring Company|post a job|Job Type)/i.test(text)) kind='employer_job_submission'
  else if(!nonRecruitment && jobRoute && resume && fields.length>=5
    && /(?:Welcome to.*Recruitment|register a new Job Seeker|To Register.*Upload your CV)/i.test(text)
    && (candidateFields || /type=["']file/i.test(html))) kind='candidate_registration'
  else if(!nonRecruitment && text.length>=500 && fields.length>=8 && resume
    && /Current employer/i.test(text) && /We are not hiring these fields exclusively/i.test(text)
    && /positions require.*citizenship/i.test(text)) kind='candidate_application'
  else if(!nonRecruitment && jobRoute && jobFields && text.length>=1000 && description
    && /(?:Hourly pay rate|Salary Range)/i.test(text) && /Location:/i.test(text)
    && /(?:equal opportunity employer|Candidates must)/i.test(text)) kind='job_detail'
  if (kind) evidence.push({ name: 'same_host_recruitment_workflow', jobLinks: localJobLinks.slice(0, 5), localRecruitingLinks: localRecruitingLinks.length })
  const scriptedRedirect = text.length < 100 && /(?:window\.)?location\.(?:replace|href)|top\.location/i.test(scripts)
  const shell = !kind && text.length < 100 && (!text || /Loading|Sorry to interrupt|CSS Error/i.test(text))
  return { kind, nonRecruitment, evidence, title, visibleCharacters: text.length, textExcerpt: text.slice(0, 1400),
    jobPostings: postings, localJobLinks: localJobLinks.length, localRecruitingLinks: localRecruitingLinks.length,
    candidateFields, scriptedRedirect, shell, urlRecruitmentHint: jobRoute }
}
