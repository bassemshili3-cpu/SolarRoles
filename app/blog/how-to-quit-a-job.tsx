import { useState, useEffect } from "react";

const ARTICLE_DATA = {
  title: "How to Quit a Job in 2026: The Complete Guide to Resigning the Right Way",
  subtitle: "Walking away from a paycheck is never just about the job. It's about your family, your health coverage, your financial safety net, and everything that depends on you. Here's how to quit without putting any of it at risk.",
  author: "Eleanor M. Bishop",
  authorRole: "Senior Career Correspondent",
  date: "March 8, 2026",
  readTime: "14 min read",
  category: "Career Advice",
  heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop",
};

export default function HowToQuitAJob() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", background: "#FAFAF7", color: "#1A1A1A", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Libre+Franklin:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #1A1A1A; color: #FAFAF7; }

        .progress-bar {
          position: fixed; top: 0; left: 0; height: 3px;
          background: #2B4ACB; z-index: 1000;
          transition: width 0.1s linear;
        }

        .article-nav {
          position: sticky; top: 0; z-index: 99;
          background: rgba(250, 250, 247, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E0DDD5;
          padding: 14px 32px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .article-nav-brand {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 900;
          text-decoration: none; color: #1A1A1A;
        }
        .article-nav-brand span { color: #2B4ACB; }
        .article-nav-links {
          display: flex; gap: 24px; align-items: center;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.6px; text-transform: uppercase;
        }
        .article-nav-links a {
          color: #666; text-decoration: none;
          transition: color 0.2s;
        }
        .article-nav-links a:hover { color: #1A1A1A; }
        .nav-cta {
          background: #2B4ACB; color: #fff !important;
          padding: 8px 18px; font-weight: 600;
          letter-spacing: 1px; transition: background 0.2s;
        }
        .nav-cta:hover { background: #1E3AAF; }

        .article-container { max-width: 740px; margin: 0 auto; padding: 0 24px; }
        .article-wide { max-width: 1000px; margin: 0 auto; padding: 0 24px; }

        .article-header { padding: 48px 0 40px; text-align: center; }
        .article-category {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #2B4ACB; margin-bottom: 20px;
        }
        .article-title {
          font-family: 'Playfair Display', serif;
          font-size: 48px; font-weight: 800;
          line-height: 1.12; letter-spacing: -0.5px;
          margin-bottom: 24px; max-width: 800px;
          margin-left: auto; margin-right: auto;
        }
        .article-subtitle {
          font-family: 'Source Serif 4', serif;
          font-size: 20px; line-height: 1.6;
          color: #555; max-width: 660px;
          margin: 0 auto 28px;
        }
        .article-meta {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 13px; color: #888;
          display: flex; justify-content: center;
          align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .article-meta strong { color: #1A1A1A; font-weight: 600; }
        .article-divider {
          width: 60px; height: 1px;
          background: #1A1A1A; margin: 0 auto;
        }

        .hero-img-wrap {
          margin: 0 auto 48px; max-width: 1000px; padding: 0 24px;
        }
        .hero-img {
          width: 100%; aspect-ratio: 16/7; object-fit: cover;
          filter: grayscale(15%) contrast(1.05);
        }
        .hero-caption {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #999;
          margin-top: 8px; text-align: right;
        }

        /* Article body */
        .article-body { padding-bottom: 64px; }
        .article-body p {
          font-family: 'Source Serif 4', serif;
          font-size: 19px; line-height: 1.78;
          color: #2A2A2A; margin-bottom: 24px;
        }
        .article-body h2 {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700;
          line-height: 1.25; margin: 48px 0 20px;
          padding-top: 12px;
          border-top: 1px solid #E0DDD5;
        }
        .article-body h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 600;
          line-height: 1.35; margin: 36px 0 16px;
        }
        .article-body a {
          color: #2B4ACB; text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .article-body a:hover { color: #1E3AAF; }

        .drop-cap::first-letter {
          font-family: 'Playfair Display', serif;
          float: left; font-size: 72px; font-weight: 700;
          line-height: 0.8; margin: 4px 12px 0 0;
          color: #1A1A1A;
        }

        /* Callout box */
        .callout {
          background: #F0EDE6; border-left: 4px solid #2B4ACB;
          padding: 28px 32px; margin: 36px 0;
        }
        .callout-title {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2B4ACB; margin-bottom: 10px;
        }
        .callout p {
          font-size: 17px !important; color: #333 !important;
          margin-bottom: 0 !important;
        }
        .callout p + p { margin-top: 12px !important; }

        /* Protection CTA box */
        .protection-cta {
          background: #1A1A1A; color: #FAFAF7;
          padding: 40px 36px; margin: 44px 0;
          text-align: center;
        }
        .protection-cta h3 {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700;
          color: #FAFAF7 !important; margin: 0 0 12px !important;
          border: none !important; padding: 0 !important;
        }
        .protection-cta p {
          font-family: 'Source Serif 4', serif;
          font-size: 16px !important; line-height: 1.65;
          color: #CCC !important; max-width: 540px;
          margin: 0 auto 24px !important;
        }
        .protection-cta-btn {
          display: inline-block;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: #E8C547; color: #1A1A1A;
          padding: 14px 36px; text-decoration: none !important;
          transition: background 0.2s, transform 0.15s;
        }
        .protection-cta-btn:hover {
          background: #F0D060; color: #1A1A1A !important;
          transform: translateY(-1px);
        }
        .protection-cta-small {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #777 !important;
          margin-top: 14px !important; margin-bottom: 0 !important;
        }

        /* Pull quote */
        .pull-quote {
          border-top: 2px solid #1A1A1A;
          border-bottom: 2px solid #1A1A1A;
          padding: 28px 0; margin: 40px 0;
          text-align: center;
        }
        .pull-quote p {
          font-family: 'Playfair Display', serif;
          font-size: 26px !important; font-style: italic;
          font-weight: 500; line-height: 1.4 !important;
          color: #1A1A1A !important;
        }

        /* Table of contents */
        .toc {
          background: #F5F3EE; padding: 28px 32px;
          margin: 0 0 40px;
        }
        .toc-title {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 14px; color: #1A1A1A;
        }
        .toc ol {
          list-style: none; counter-reset: toc;
          padding: 0;
        }
        .toc li {
          counter-increment: toc;
          font-family: 'Source Serif 4', serif;
          font-size: 16px; line-height: 1.5;
          padding: 6px 0; color: #444;
          cursor: pointer; transition: color 0.2s;
        }
        .toc li:hover { color: #2B4ACB; }
        .toc li::before {
          content: counter(toc, decimal-leading-zero) ".";
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; font-weight: 600;
          color: #2B4ACB; margin-right: 10px;
        }

        /* Tags */
        .tag-row {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin: 40px 0 32px;
        }
        .tag {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px; text-transform: uppercase;
          padding: 6px 14px; border: 1px solid #D5D1C9;
          color: #666;
        }

        /* Author box */
        .author-box {
          border-top: 2px solid #1A1A1A;
          padding: 32px 0;
          display: flex; gap: 20px; align-items: center;
          margin-bottom: 48px;
        }
        .author-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: #E0DDD5; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: #888;
        }
        .author-info-name {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700;
        }
        .author-info-role {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; color: #888; margin-top: 2px;
        }
        .author-info-bio {
          font-family: 'Source Serif 4', serif;
          font-size: 14px; line-height: 1.5;
          color: #666; margin-top: 6px;
        }

        /* Related */
        .related-section {
          border-top: 1px solid #D5D1C9;
          padding: 48px 0;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .related-card { cursor: pointer; }
        .related-card-cat {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2B4ACB; margin-bottom: 8px;
        }
        .related-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700;
          line-height: 1.3; transition: color 0.2s;
        }
        .related-card:hover .related-card-title { color: #2B4ACB; }
        .related-card-meta {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #999; margin-top: 8px;
        }

        .section-header {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #1A1A1A; padding-bottom: 12px;
          border-bottom: 2px solid #1A1A1A;
          margin-bottom: 28px;
        }

        /* Footer */
        .site-footer {
          background: #1A1A1A; color: #999;
          padding: 48px 24px 32px;
        }
        .footer-inner {
          max-width: 1200px; margin: 0 auto;
        }
        .footer-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; padding-bottom: 28px;
          border-bottom: 1px solid #333;
          flex-wrap: wrap; gap: 24px;
        }
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 900; color: #FAFAF7;
        }
        .footer-brand span { color: #2B4ACB; }
        .footer-links {
          display: flex; gap: 24px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .footer-links a { color: #777; text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: #FAFAF7; }
        .footer-bottom {
          padding-top: 20px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #555; text-align: center;
        }

        /* Animations */
        .fade-in { opacity: 0; transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-in.visible { opacity: 1; transform: translateY(0); }
        .fade-in.d1 { transition-delay: 0.15s; }
        .fade-in.d2 { transition-delay: 0.3s; }
        .fade-in.d3 { transition-delay: 0.45s; }

        @media (max-width: 768px) {
          .article-title { font-size: 32px; }
          .article-subtitle { font-size: 17px; }
          .article-body p { font-size: 17px; }
          .article-body h2 { font-size: 24px; }
          .related-grid { grid-template-columns: 1fr; }
          .article-nav-links { display: none; }
        }
      `}</style>

      {/* Reading progress */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Nav */}
      <nav className="article-nav">
        <a className="article-nav-brand" href="https://www.oh-my-job.com">Oh My <span>Job</span></a>
        <div className="article-nav-links">
          <a href="https://www.oh-my-job.com/blog">Blog</a>
          <a href="https://www.oh-my-job.com/jobs">Career Advice</a>
          <a href="https://www.oh-my-job.com/jobs">Salary Data</a>
          <a className="nav-cta" href="https://www.oh-my-job.com/jobs">Find Jobs</a>
        </div>
      </nav>

      {/* Header */}
      <header className="article-header">
        <div className={`article-container fade-in ${visible ? "visible" : ""}`}>
          <div className="article-category">{ARTICLE_DATA.category}</div>
          <h1 className="article-title">{ARTICLE_DATA.title}</h1>
          <p className="article-subtitle">{ARTICLE_DATA.subtitle}</p>
          <div className="article-meta">
            <strong>{ARTICLE_DATA.author}</strong>
            <span>·</span>
            <span>{ARTICLE_DATA.authorRole}</span>
            <span>·</span>
            <span>{ARTICLE_DATA.date}</span>
            <span>·</span>
            <span>{ARTICLE_DATA.readTime}</span>
          </div>
        </div>
      </header>

      <div className="article-divider" />

      {/* Hero image */}
      <div className={`hero-img-wrap fade-in d1 ${visible ? "visible" : ""}`}>
        <img className="hero-img" src={ARTICLE_DATA.heroImage} alt="Skyline view of midtown Manhattan at dawn" />
        <div className="hero-caption">Manhattan, New York. For millions of Americans, the decision to quit a job carries financial consequences that extend far beyond the paycheck. Photo: Unsplash</div>
      </div>

      {/* Article Body */}
      <article className={`article-container article-body fade-in d2 ${visible ? "visible" : ""}`}>

        {/* Table of contents */}
        <div className="toc">
          <div className="toc-title">In This Article</div>
          <ol>
            <li>Understand Why Timing Is Everything</li>
            <li>Build Your Financial Safety Net First</li>
            <li>Protect Your Family Before You Resign</li>
            <li>Know Your Legal Rights as an Employee</li>
            <li>Health Insurance: The COBRA Question</li>
            <li>Write a Resignation Letter That Keeps Doors Open</li>
            <li>Manage the Transition Like a Professional</li>
            <li>Find Your Next Role Before the Clock Runs Out</li>
          </ol>
        </div>

        <p className="drop-cap">
          Every year, millions of Americans reach the same quiet conclusion: it's time to leave. Maybe the work no longer challenges you. Maybe a toxic manager has drained the last of your patience. Maybe you've outgrown the role and know, deep down, that staying another quarter will cost you more than it pays. Whatever the reason, the decision to quit a job is one of the most consequential financial moves you will ever make. And in 2026, with a shifting labor market, evolving healthcare legislation, and new norms around remote work, getting it right matters more than ever.
        </p>

        <p>
          This guide is not about impulsive exits or dramatic resignation stories. It is about quitting with intention, with a plan, and with every member of your household accounted for. Because when you walk away from a paycheck, you are not the only one affected. Your spouse, your children, your aging parents who might depend on your benefits: they are all part of this equation.
        </p>

        <p>
          If you have been thinking about how to quit a job without wrecking your finances, your reputation, or your family's security, you're in the right place.
        </p>

        {/* Section 1 */}
        <h2>1. Understand Why Timing Is Everything</h2>

        <p>
          There is a world of difference between quitting on impulse and quitting on your terms. The best resignations are the ones nobody saw coming because they were executed with precision, not with emotion. Before you write a single word of your resignation letter, take stock of where you stand.
        </p>

        <p>
          Consider where your company is in its fiscal cycle. If annual bonuses are paid in March, resigning in February means leaving money on the table. If your employer matches 401(k) contributions with a vesting schedule, check how close you are to the next milestone. These details matter because they are real dollars, not hypotheticals.
        </p>

        <p>
          Also consider the broader labor market. The U.S. job market in 2026 is competitive but uneven. Certain sectors like healthcare, AI engineering, cybersecurity, and clean energy are seeing aggressive hiring, while others are contracting. Knowing where your industry stands will help you determine whether to resign with a signed offer in hand or whether you can afford a short gap between jobs.
        </p>

        {/* Section 2 */}
        <h2>2. Build Your Financial Safety Net First</h2>

        <p>
          No one should resign from a job without a financial cushion. This is not negotiable. The standard advice of three to six months of living expenses in a savings account holds, but in 2026, you should think bigger. Factor in the cost of COBRA premiums (which we will address below), any outstanding medical expenses, and the potential delay between your last paycheck and your first one at a new company.
        </p>

        <div className="callout">
          <div className="callout-title">Rule of Thumb</div>
          <p>Before resigning, calculate your total monthly burn rate, including rent or mortgage, insurance premiums, childcare, debt payments, and groceries. Multiply that figure by six. If your savings don't cover it, delay your resignation until they do.</p>
        </div>

        <p>
          If you have a spouse or partner who is also employed, evaluate what your household income looks like on a single salary. Even if the gap is temporary, the stress of running on one income while job hunting can erode both your confidence and your relationships. Be honest with your partner about the timeline and the risks.
        </p>

        <p>
          Pay down high interest debt before you leave, if possible. Credit card balances that seem manageable on a full salary become dangerous without one. And do not underestimate the time it takes to find the right role. Even in a strong market, the average American job search takes between three and five months.
        </p>

        {/* Section 3 */}
        <h2>3. Protect Your Family Before You Resign</h2>

        <p>
          This is the part of the conversation most career advice columns skip. And yet it is the most important part. When you leave a job, you are not just leaving a title and a paycheck. You may be walking away from employer sponsored life insurance, disability coverage, and health benefits that your family depends on every single day.
        </p>

        <div className="pull-quote">
          <p>"The single biggest mistake people make when quitting a job is treating it as an individual decision. It isn't. It's a family decision."</p>
        </div>

        <p>
          Most employers in the United States offer group life insurance as part of their benefits package, typically covering one to two times your annual salary. That coverage ends the day your employment does. If something were to happen to you during the transition period between jobs, your family would be left without a financial safety net at the worst possible moment.
        </p>

        <p>
          This is why securing personal life insurance before you submit your resignation is not optional. It is essential. Unlike employer sponsored coverage, a personal life insurance policy stays with you regardless of your employment status. It does not disappear when you switch jobs, get laid off, or take a career break. For anyone with a mortgage, children, student debt, or a spouse who depends on dual income, this is the foundation that everything else rests on.
        </p>

        <p>
          If you are in good health and under 45, term life insurance is remarkably affordable. A healthy 35 year old can secure a $500,000 term policy for under $30 a month. The younger you are when you lock in a rate, the less you will pay over the life of the policy. Waiting until after you resign, when stress and uncertainty are high, is the wrong time to start thinking about this.
        </p>

        <h3>What to Look for in a Life Insurance Policy</h3>

        <p>
          Choose a policy that is portable (meaning it follows you, not your employer), that offers a term length aligned with your financial obligations (20 or 30 years is standard for families with young children), and that comes from a carrier rated A or higher by AM Best. If your spouse is not working or earns significantly less, consider a policy large enough to replace your income for at least 10 years.
        </p>

        {/* AFFILIATE CTA */}
        <div className="protection-cta">
          <h3>Don't Leave Your Family Unprotected</h3>
          <p>
            Before you resign, lock in a personal life insurance policy that travels with you. Compare rates from top rated U.S. carriers in minutes, no medical exam required for most applicants.
          </p>
          <a
            className="protection-cta-btn"
            href="#affiliate-life-insurance-link"
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            Get My Free Quote →
          </a>
          <p className="protection-cta-small">
            Sponsored · Clicking this link supports Oh My Job at no extra cost to you. We only recommend products we believe in.
          </p>
        </div>

        <p>
          Beyond life insurance, review your disability coverage. Long term disability insurance replaces a portion of your income if you become unable to work due to illness or injury. Most employer sponsored plans end at termination. If you don't have an individual policy in place, a single medical event could leave your family without any income at all.
        </p>

        {/* Section 4 */}
        <h2>4. Know Your Legal Rights as an Employee</h2>

        <p>
          Before you hand in your resignation, take 30 minutes to understand the legal framework that governs your departure. The United States operates primarily under <a href="https://www.dol.gov/general/topic/wages/faq" target="_blank" rel="noopener noreferrer">at-will employment</a>, which means that in most states, you can quit at any time and your employer can terminate you at any time, without cause. However, there are important exceptions and protections you should be aware of.
        </p>

        <p>
          If you have an employment contract, read it carefully. Some contracts include non-compete clauses, notice period requirements, or clawback provisions on signing bonuses. Violating these terms could result in legal action or financial penalties.
        </p>

        <p>
          Under the <a href="https://www.dol.gov/agencies/whd/fmla" target="_blank" rel="noopener noreferrer">Family and Medical Leave Act (FMLA)</a>, eligible employees at covered employers are entitled to up to 12 weeks of unpaid, job protected leave for qualifying family and medical reasons. If you are currently on FMLA leave or anticipate needing it, resigning prematurely could forfeit those protections. The U.S. Department of Labor provides detailed guidance on your rights under the FMLA, including eligibility requirements and employer obligations.
        </p>

        <p>
          Check your state's laws on final paychecks. Some states, like California, require employers to issue your final paycheck on your last day of work. Others allow a longer window. Familiarize yourself with accrued vacation or PTO payout rules in your state. Not all employers are required to pay out unused vacation time, and policies vary widely.
        </p>

        <div className="callout">
          <div className="callout-title">Important</div>
          <p>If you believe you have been subjected to retaliation, discrimination, or unsafe working conditions, consult an employment attorney before resigning. Quitting under duress may qualify as constructive dismissal, which could entitle you to legal remedies you would otherwise lose by leaving voluntarily.</p>
        </div>

        {/* Section 5 */}
        <h2>5. Health Insurance: The COBRA Question</h2>

        <p>
          Losing health insurance is often the most immediate and frightening consequence of quitting a job. Under the <a href="https://www.dol.gov/general/topic/health-plans/cobra" target="_blank" rel="noopener noreferrer">Consolidated Omnibus Budget Reconciliation Act (COBRA)</a>, employees at companies with 20 or more workers have the right to continue their employer sponsored health coverage for up to 18 months after leaving. The catch: you pay the full premium, plus a 2% administrative fee, which often amounts to $600 to $2,000 or more per month for family coverage.
        </p>

        <p>
          COBRA is a bridge, not a long term solution. If your new employer offers health benefits, you will typically become eligible after a 30 to 90 day waiting period. Plan accordingly and budget for the gap.
        </p>

        <p>
          Alternatively, losing employer coverage qualifies you for a <a href="https://www.healthcare.gov/" target="_blank" rel="noopener noreferrer">Special Enrollment Period on the Health Insurance Marketplace</a>. Depending on your household income during the transition, you may qualify for subsidized premiums under the Affordable Care Act. This is worth exploring before defaulting to COBRA, as marketplace plans can be significantly cheaper for families in certain income brackets.
        </p>

        <p>
          Many states also have "mini COBRA" laws that extend continuation coverage to employees at smaller companies. Check with your <a href="https://www.dol.gov/agencies/ebsa/laws-and-regulations/laws/cobra" target="_blank" rel="noopener noreferrer">state's department of insurance</a> to understand what applies to your situation.
        </p>

        {/* Section 6 */}
        <h2>6. Write a Resignation Letter That Keeps Doors Open</h2>

        <p>
          Your resignation letter is a professional document, not a therapy session. Keep it brief, respectful, and forward looking. State your intention to resign, specify your last day of work (typically two weeks from the date of the letter), and express gratitude for the opportunity. That's it.
        </p>

        <p>
          Do not use your resignation letter to air grievances, criticize management, or settle scores. The professional world is smaller than you think, and the colleague you offend today could be the hiring manager you face tomorrow. Your goal is to leave with your reputation not just intact, but enhanced.
        </p>

        <p>
          If your employer asks you to stay longer than two weeks to assist with the transition, consider it carefully. Agreeing to a three or four week notice period can generate significant goodwill and a stronger reference. However, if you already have a start date at your new company, be transparent about your constraints.
        </p>

        {/* Section 7 */}
        <h2>7. Manage the Transition Like a Professional</h2>

        <p>
          The final weeks at any job are a test of character. How you leave reveals more about you than how you arrived. Document your ongoing projects, create handoff notes for your replacement, and offer to train whoever will be taking over your responsibilities.
        </p>

        <p>
          Transfer any personal files off your work computer before your last day. Remember that your work email, your Slack account, and your company issued devices belong to your employer. Do not assume you will have access to anything after you walk out the door.
        </p>

        <p>
          Schedule brief one on one conversations with the colleagues and managers who mattered most to you. These don't need to be long. A genuine five minute conversation will carry more weight than a group email. And update your LinkedIn profile before your departure is public knowledge, so recruiters can find you at your peak visibility.
        </p>

        {/* Section 8 */}
        <h2>8. Find Your Next Role Before the Clock Runs Out</h2>

        <p>
          In a perfect world, you would have a signed offer letter before you resign. In reality, that's not always possible. But in 2026, the tools available to job seekers are better than they have ever been. AI powered job matching platforms have fundamentally changed how candidates connect with opportunities, eliminating the exhausting cycle of blind applications and generic job boards.
        </p>

        <p>
          At <a href="https://www.oh-my-job.com/jobs" target="_blank" rel="noopener noreferrer">Oh My Job</a>, we built our platform around one idea: that the right job should find you, not the other way around. Our smart matching technology analyzes your skills, experience, career goals, and preferences, then surfaces the positions that actually fit, across every major industry and metro area in the United States. No more scrolling through hundreds of irrelevant postings. No more wondering if your resume disappeared into a black hole.
        </p>

        <p>
          Whether you're looking for your next role in tech, healthcare, finance, education, or any other sector, having a dedicated AI powered platform working for you while you manage your transition can cut your job search timeline dramatically. The candidates who use smart matching tools consistently report finding relevant opportunities faster and spending less time on applications that go nowhere.
        </p>

        <div className="callout">
          <div className="callout-title">Start Your Search Today</div>
          <p>
            Don't wait until your last day to start looking. Create your profile on <a href="https://www.oh-my-job.com/jobs" target="_blank" rel="noopener noreferrer">Oh My Job</a> and let our AI match you with the roles that align with your career trajectory. It's free, it's fast, and it works.
          </p>
        </div>

        <h2>Final Thought</h2>

        <p>
          Quitting a job is a beginning, not an ending. But only if you do it right. The people who transition successfully are not the ones who are bravest or most frustrated. They are the ones who planned. They secured their finances, protected their families, understood their rights, and lined up their next opportunity before they walked away.
        </p>

        <p>
          If you are reading this article because you are thinking about resigning, take a breath. You have time. Use it wisely. Build your safety net, have the hard conversations with your family, lock in the insurance coverage that will keep everyone protected, and start exploring what comes next.
        </p>

        <p>
          The best resignation is the one that feels like a promotion. Make yours count.
        </p>

        {/* Tags */}
        <div className="tag-row">
          {["How to Quit a Job", "Resignation", "Career Advice", "Life Insurance", "COBRA", "Job Search 2026", "Financial Planning"].map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>

        {/* Author box */}
        <div className="author-box">
          <div className="author-avatar">EB</div>
          <div>
            <div className="author-info-name">{ARTICLE_DATA.author}</div>
            <div className="author-info-role">{ARTICLE_DATA.authorRole}, Oh My Job</div>
            <div className="author-info-bio">
              Eleanor covers career strategy, labor market trends, and the changing nature of work in America. Her reporting has helped thousands of professionals navigate job transitions with confidence.
            </div>
          </div>
        </div>
      </article>

      {/* Related articles */}
      <section className="related-section">
        <div className="article-wide">
          <div className="section-header">Continue Reading</div>
          <div className="related-grid">
            {[
              { cat: "Salary Insights", title: "What Six Figures Really Means in New York, San Francisco, and Austin", meta: "James Whitfield · 8 min read" },
              { cat: "Interview Tips", title: "The 30 Second Rule: How First Impressions Still Decide Who Gets the Offer", meta: "Priya Nair · 6 min read" },
              { cat: "Remote Work", title: "Return to Office Mandates Are Backfiring. Here's the Data.", meta: "David Rosenthal · 10 min read" },
            ].map((r, i) => (
              <div key={i} className="related-card">
                <div className="related-card-cat">{r.cat}</div>
                <div className="related-card-title">{r.title}</div>
                <div className="related-card-meta">{r.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">Oh My <span>Job</span></div>
            <div className="footer-links">
              <a href="https://www.oh-my-job.com/jobs">Find Jobs</a>
              <a>About</a>
              <a>Contact</a>
              <a>Privacy</a>
              <a>Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 Oh My Job. All rights reserved. Made for job seekers, by job seekers.
          </div>
        </div>
      </footer>
    </div>
  );
}